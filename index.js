require('dotenv').config(); // QUESTA DEVE ESSERE LA PRIMISSIMA RIGA DEL FILE

const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);

// --- INIZIO: AGGIUNTE NECESSARIE PER GOOGLE CALENDAR ---
const { google } = require('googleapis');


let authClient;
let calendar;

async function initGoogleCalendar() {
  let authOptions = {
    scopes: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly'
    ]
  };

  if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    console.log('Autenticazione Google Calendar in modalità produzione...');
    authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  } else {
    console.log('Autenticazione Google Calendar in modalità locale...');
    authOptions.keyFile = process.env.GOOGLE_CREDENTIALS_PATH || path.join(__dirname, 'config', 'google-credentials.json');
  }

  const auth = new google.auth.GoogleAuth(authOptions);

  authClient = await auth.getClient();
  calendar = google.calendar({ version: 'v3', auth: authClient });

  console.log("Google Calendar inizializzato con successo.");

  // Avvia la sincronizzazione
  await syncGoogleCalendarEvents();

  // Sincronizza ogni 15 minuti
  setInterval(syncGoogleCalendarEvents, 15 * 60 * 1000);
}

initGoogleCalendar().catch(err => {
  console.error('Errore inizializzazione Google Calendar:', err);
  process.exit(1);
});



// VERSIONE FINALE DELLA FUNZIONE DI SINCRONIZZAZIONE (CON PAGINAZIONE)
async function syncGoogleCalendarEvents() {
    console.log("Avvio sincronizzazione con Google Calendar (versione con paginazione)...");
    if (!calendar) {
        console.error("ERRORE: Il client Google Calendar non è inizializzato.");
        return;
    }

    const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

    try {
        // 1. Recuperiamo il syncToken dal nostro database
        const tokenRow = await db.query("SELECT valore FROM impostazioni WHERE chiave = 'google_sync_token'");
        let syncToken = tokenRow.rows.length > 0 ? tokenRow.rows[0].valore : null;

        let requestParams = {
            calendarId: CALENDAR_ID,
            singleEvents: true,
            fields: 'items(id,summary,description,location,start,end,creator,updated,colorId,status),nextPageToken,nextSyncToken' // Chiediamo anche nextPageToken
        };

        if (syncToken) {
            console.log("Trovato Sync Token. Eseguo sincronizzazione incrementale.");
            requestParams.syncToken = syncToken;
        } else {
            console.log("Nessun Sync Token. Eseguo una sincronizzazione completa iniziale.");
            const timeMin = new Date();
            timeMin.setDate(timeMin.getDate() - 30); // Prendi gli eventi degli ultimi 30 giorni
            requestParams.timeMin = timeMin.toISOString();
        }

        let allEvents = [];
        let pageToken = null;
        let finalSyncToken = null;

        // 2. CICLO DI PAGINAZIONE: Continua a chiedere finché Google ci dà un "biglietto" per la pagina dopo
        do {
            const res = await calendar.events.list({
                ...requestParams,
                pageToken: pageToken // Aggiungi il biglietto della pagina (la prima volta è null)
            });

            const eventsOnPage = res.data.items;
            if (eventsOnPage && eventsOnPage.length > 0) {
                allEvents.push(...eventsOnPage); // Aggiungi gli eventi di questa pagina alla lista totale
                console.log(`Ricevuti ${eventsOnPage.length} eventi da questa pagina. Totale finora: ${allEvents.length}`);
            }

            pageToken = res.data.nextPageToken; // Prendi il biglietto per la prossima pagina
            finalSyncToken = res.data.nextSyncToken; // Il sync token finale arriva solo con l'ultima pagina

        } while (pageToken); // Se c'è un biglietto, il ciclo continua

        console.log(`Paginazione completata. Totale eventi da elaborare: ${allEvents.length}`);

        // 3. Elaboriamo TUTTI gli eventi raccolti
        for (const event of allEvents) {
            if (event.status === 'cancelled') {
                console.log(`Rilevato evento CANCELLATO: "${event.summary}" (ID: ${event.id}). Eliminazione.`);
                await db.query("DELETE FROM calendar_events WHERE google_event_id = $1", [event.id]);
            } // --- INCOLLA QUESTO AL POSTO DEL VECCHIO 'ELSE' ---
else {
    // Inserimento o aggiornamento
    const eventSummary = event.summary || 'Nessun titolo';
    const eventDescription = event.description || null;
    const eventLocation = event.location || null;
    const eventStart = event.start.dateTime || event.start.date;
    const eventEnd = event.end.dateTime || event.end.date;
    const eventCreatorEmail = event.creator ? event.creator.email : null;
    const eventLastModified = event.updated || new Date().toISOString(); // <-- Variabile definita qui
    const isAllDay = !!event.start.date;
    const colorId = event.colorId || null;

    const query = `
        INSERT INTO calendar_events (google_event_id, summary, description, location, start_time, end_time, creator_email, last_modified, is_all_day, color_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (google_event_id) DO UPDATE SET
            summary = EXCLUDED.summary,
            description = EXCLUDED.description,
            location = EXCLUDED.location,
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            creator_email = EXCLUDED.creator_email,
            last_modified = EXCLUDED.last_modified,
            is_all_day = EXCLUDED.is_all_day,
            color_id = EXCLUDED.color_id,
            updated_at = CURRENT_TIMESTAMP;
    `;
    const values = [
        event.id,
        eventSummary,
        eventDescription,
        eventLocation,
        eventStart,
        eventEnd,
        eventCreatorEmail,
        eventLastModified, // <-- Ora la variabile esiste
        isAllDay,
        colorId
    ];
    await db.query(query, values);
}
        }

        // 4. Salviamo il NUOVO syncToken finale per la prossima volta
        if (finalSyncToken) {
            console.log("Salvataggio Sync Token finale per la prossima sincronizzazione.");
            await db.query("UPDATE impostazioni SET valore = $1 WHERE chiave = 'google_sync_token'", [finalSyncToken]);
        }
        console.log("Sincronizzazione eventi Google Calendar completata con successo.");

    } catch (error) {
        if (error.code === 410) {
            console.warn("ATTENZIONE: Sync Token non valido o scaduto. Svuoto il token. La prossima sarà una sincronizzazione completa.");
            await db.query("UPDATE impostazioni SET valore = NULL WHERE chiave = 'google_sync_token'");
        } else {
            console.error('Errore durante la sincronizzazione del calendario:', error.message);
        }
    }
}

const app = express();

app.set('trust proxy', 1);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("ERRORE: La variabile d'ambiente DATABASE_URL non è stata definita!");
    process.exit(1);
}

const isLocalConnection = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const dbConfig = {
    connectionString,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: true
};

const db = new Pool(dbConfig);

db.on('error', (err) => console.error('Errore pool:', err.message));
setInterval(() => db.query('SELECT 1').catch(e => console.error('DB ping failed:', e.message)), 5 * 60 * 1000);
db.connect()
    .then(() => console.log("✅ Connesso al DB PostgreSQL!"))
    .catch(err => console.error("Errore connessione DB:", err));

// ===================================================
// === INIZIO BLOCCO MIDDLEWARE (ORDINE CORRETTO) ===
// ===================================================

// 1. Parser per i dati dei form e JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 2. Configurazione della SESSIONE

const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
    name: 'qualityhair.session',
    secret: process.env.SESSION_SECRET || 'una_frase_segreta_molto_lunga',
    resave: false,
    saveUninitialized: false,
    store: new pgSession({
        pool: db,
        tableName: 'app_sessions',
        createTableIfMissing: true
    }),
    cookie: {
        path: '/',
        httpOnly: true,
        secure: isProduction, // true solo in produzione
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
        sameSite: 'strict',
        ...(isProduction ? {} : { domain: 'localhost' }) // solo in dev
    }
}));


// 3. Inizializzazione di PASSPORT (DEVE venire dopo la sessione)
app.use(passport.initialize());
app.use(passport.session());

// 4. Middleware di DEBUG per i Cookie (AGGIUNGI QUI)
app.use((req, res, next) => {
    // Se la sessione è stata distrutta ma il cookie esiste ancora
    if (req.session === null && req.cookies['qualityhair.session']) {
        res.clearCookie('qualityhair.session', {
            path: '/',
            domain: 'localhost',
            httpOnly: true,
            secure: false
        });
    }
    next();
});

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard.html");
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});


// 4. File STATICI (DEVE venire dopo passport.session)
app.use(express.static("public"));

// 5. Middleware di ISPEZIONE (ora può vedere la sessione correttamente)
//app.use((req, res, next) => {
  //  console.log('--- ISPEZIONE SESSIONE ---');
    //console.log('ID Sessione:', req.sessionID);
    //console.log('Contenuto Sessione (req.session):', req.session);
    //console.log('Utente nella sessione (req.user):', req.user);
    //console.log('req.isAuthenticated() risulta:', req.isAuthenticated());
    //console.log('--------------------------');
    //next();
//});

//FINE BLOCCO MIDDLEWARE



// Quando un utente si logga, salviamo solo il suo ID del nostro database nella sessione.
passport.serializeUser(function(user, done) {
    done(null, user.id); // <-- SALVIAMO L'ID, NON TUTTO L'OGGETTO
});

// Ad ogni richiesta, usiamo l'ID salvato nella sessione per recuperare
// l'utente completo dal nostro database.
passport.deserializeUser(async function(id, done) {
    try {
        const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userResult.rows.length === 0) {
            return done(null, false);
        }
        done(null, userResult.rows[0]);
    } catch (err) {
        return done(err);
    }
});



passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // Assicurati che corrisponda alla Google Console
},
async (accessToken, refreshToken, profile, done) => {
    const googleEmail = profile.emails?.[0].value;
    const googleDisplayName = profile.displayName;

    // Controlla se l'email è autorizzata
    if (googleEmail !== "qualityhairbolzano@gmail.com") {
        return done(null, false, { message: "Email non autorizzata." });
    }

    try {
        // Controlla se un utente con questa email esiste già nel nostro database
        let userResult = await db.query('SELECT * FROM users WHERE email = $1', [googleEmail]);
        let user = userResult.rows[0];

        if (user) {
            // Utente trovato, procedi con l'autenticazione
            return done(null, user);
        } else {
            // Utente non trovato, creane uno nuovo
            const newUserResult = await db.query(
                'INSERT INTO users (username, email, google_id) VALUES ($1, $2, $3) RETURNING *',
                [googleDisplayName, googleEmail, profile.id]
            );
            user = newUserResult.rows[0];
            return done(null, user);
        }
    } catch (err) {
        return done(err);
    }
}));

// ===========================================
// DEFINIZIONE DELLE FUNZIONI "GUARDIANO"
// ===========================================

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

// ===========================================
// DEFINIZIONE DELLE ROUTE
// ===========================================

// LA ROTTA PRINCIPALE ("/")
app.get('/', (req, res) => {
    // Forza il browser a ignorare la cache quando viene da logout
    if (req.query.logout) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    
    if (req.isAuthenticated()) {
        return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// LA ROTTA DI AUTENTICAZIONE GOOGLE
app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// IL CALLBACK DI GOOGLE
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard.html');
    }
);

// LA ROTTA DI LOGOUT
app.get('/logout', (req, res, next) => {
    // Salva il nome del cookie di sessione
    const sessionCookieName = req.session.cookie.name || 'qualityhair.session';
    
    req.logout(function(err) {
        if (err) { return next(err); }
        
        // Distruggi la sessione nel database
        req.session.destroy((err) => {
            if (err) {
                console.error('Errore nella distruzione della sessione:', err);
            }
            
            // Cancella esplicitamente il cookie
            res.clearCookie(sessionCookieName, {
                path: '/',
                domain: 'localhost',
                httpOnly: true,
                secure: false
            });
            
            // Reindirizza alla home con forzatura del reload
            res.redirect('/?logout=' + Date.now());
        });
    });
});


// ===========================================
// ROTTE PROTETTE
// ===========================================
app.get("/dashboard.html", ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});
app.get("/lista-clienti.html", ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "lista-clienti.html"));
});
app.use("/api", ensureAuthenticated);

// --- API CLIENTI ---
app.get("/api/clienti", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM clienti");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/calendario", ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "calendario.html"));
});

app.post("/api/clienti", async (req, res) => {
    const { nome, cognome, email, telefono } = req.body;
    try {
        const sql = "INSERT INTO clienti (nome, cognome, email, telefono) VALUES ($1, $2, $3, $4) RETURNING id";
        const result = await db.query(sql, [nome, cognome, email, telefono]);
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        res.status(err.code === '23505' ? 409 : 500).json({ error: err.message });
    }
});

app.put("/api/clienti/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, cognome, email, telefono } = req.body;
    try {
        await db.query("UPDATE clienti SET nome=$1, cognome=$2, telefono=$3, email=$4 WHERE id=$5",
            [nome, cognome, telefono, email, id]);
        res.json({ message: "Aggiornato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/clienti/cerca", async (req, res) => {
    const term = `%${req.query.term}%`;
    try {
        const result = await db.query(
            `SELECT * FROM clienti
             WHERE nome ILIKE $1
                OR cognome ILIKE $2
                OR CONCAT(nome, ' ', cognome) ILIKE $3`,
            [term, term, term]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get("/api/clienti/:id", async (req, res) => {
    try {
        const c = await db.query("SELECT id, nome, cognome, email, telefono, preferenze_note, storico_acquisti FROM clienti WHERE id=$1", [req.params.id]);
        if (c.rows.length === 0) return res.status(404).json({ error: "Non trovato" });
        const t = await db.query("SELECT * FROM trattamenti WHERE cliente_id=$1 ORDER BY data_trattamento DESC", [req.params.id]);
        res.json({ client: c.rows[0], trattamenti: t.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// --- NUOVA API PER IL RIEPILOGO DELL'ULTIMA ANALISI TRICOLOGICA ---
app.get("/api/clienti/:id/analisi/riepilogo", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
			SELECT id, data_analisi, esigenza_cliente, diagnosi_primaria
            FROM 
                analisi_tricologiche
            WHERE 
                cliente_id = $1
            ORDER BY 
                data_analisi DESC
            LIMIT 1;
        `;
        // Spiegazione Query:
        // - Seleziona solo i 3 campi che ci servono per il riepilogo.
        // - Cerca solo le analisi per il cliente specifico (cliente_id = $1).
        // - Le ordina dalla più recente alla più vecchia (ORDER BY data_analisi DESC).
        // - Prende solo la prima riga del risultato (LIMIT 1), che è la più recente.

        const result = await db.query(query, [id]);

        // Se la query restituisce una riga, la inviamo.
        // Se non restituisce nulla (nessuna analisi trovata), inviamo un oggetto vuoto.
        const riepilogo = result.rows.length > 0 ? result.rows[0] : null;

        res.json(riepilogo);

    } catch (err) {
        console.error(`Errore nel recupero del riepilogo analisi per cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server durante il recupero del riepilogo dell'analisi." });
    }
});

// --- NUOVA API PER SALVARE UNA NUOVA ANALISI TRICOLOGICA ---
app.post("/api/analisi", ensureAuthenticated, async (req, res) => {
    // Estraiamo tutti i dati inviati dal form
    const {
        clienteId,
        dataNascitaCliente,
        esigenzaCliente,
        patologieDichiarate,
        frequenzaLavaggi,
        presenzaPrurito,
        tappoCheratosico,
        statoCute,
        statoCapello,
        tipologiaEffluvio,
        tipologiaAlopecia,
        estensioneAlopecia,
        diagnosiRiepilogo,
        diagnosiPrimaria,
        pianoTrattamenti,
        pianoProdotti
    } = req.body;

    // Validazione di base: assicuriamoci che l'ID del cliente sia presente
    if (!clienteId) {
        return res.status(400).json({ error: "ID Cliente mancante." });
    }

    try {
        // --- Logica per aggiornare la data di nascita del cliente ---
        if (dataNascitaCliente) {
            await db.query(
                `UPDATE clienti SET data_nascita = $1 WHERE id = $2`,
                [dataNascitaCliente, clienteId]
            );
            console.log(`Data di nascita aggiornata per il cliente ${clienteId}.`);
        }

        // --- Logica per inserire la nuova analisi nel database ---
        const queryAnalisi = `
            INSERT INTO analisi_tricologiche (
                cliente_id, esigenza_cliente, patologie_dichiarate, frequenza_lavaggi, 
                presenza_prurito, tappo_cheratosico, stato_cute, stato_capello, tipologia_effluvio, 
                tipologia_alopecia, estensione_alopecia, diagnosi_riepilogo, diagnosi_primaria, 
                piano_trattamenti, piano_prodotti
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) RETURNING id;
        `;
        
        const values = [
            clienteId, esigenzaCliente, patologieDichiarate, frequenzaLavaggi,
            presenzaPrurito, tappoCheratosico, statoCute, statoCapello, tipologiaEffluvio,
            tipologiaAlopecia, estensioneAlopecia, diagnosiRiepilogo, diagnosiPrimaria,
            pianoTrattamenti, pianoProdotti
        ];

        const result = await db.query(queryAnalisi, values);
        const nuovaAnalisiId = result.rows[0].id;

        console.log(`Nuova analisi con ID ${nuovaAnalisiId} creata per il cliente ${clienteId}.`);
        
        // Invia una risposta di successo con l'ID della nuova analisi
        res.status(201).json({ 
            message: "Analisi salvata con successo!", 
            analisiId: nuovaAnalisiId 
        });

    } catch (err) {
        console.error("Errore durante il salvataggio dell'analisi:", err.message);
        res.status(500).json({ error: "Errore del server durante il salvataggio dell'analisi." });
    }
});

// --- NUOVA API PER RECUPERARE I DETTAGLI DI UNA SINGOLA ANALISI ---
// Sostituisci la vecchia app.get("/api/analisi/:id", ...) con questa
app.get("/api/analisi/:id", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                a.*, -- Seleziona tutti i campi dalla tabella analisi (alias 'a')
                c.data_nascita -- E in più, seleziona la data_nascita dalla tabella clienti (alias 'c')
            FROM 
                analisi_tricologiche a
            JOIN 
                clienti c ON a.cliente_id = c.id
            WHERE 
                a.id = $1;
        `;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Analisi non trovata." });
        }
        
        res.json(result.rows[0]);

    } catch (err) {
        console.error(`Errore nel recupero dell'analisi con ID ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server durante il recupero dell'analisi." });
    }
});


// --- NUOVA API PER LO STORICO COMPLETO DELLE ANALISI DI UN CLIENTE ---
app.get("/api/clienti/:id/analisi", ensureAuthenticated, async (req, res) => {
    const { id } = req.params; // Questo è l'ID del cliente

    try {
        // Selezioniamo i campi principali di tutte le analisi per quel cliente
        const query = `
            SELECT 
                id, 
                data_analisi,
                esigenza_cliente,
                diagnosi_primaria
            FROM 
                analisi_tricologiche
            WHERE 
                cliente_id = $1
            ORDER BY 
                data_analisi DESC; -- Ordiniamo dalla più recente
        `;
        const result = await db.query(query, [id]);

        // Invia la lista di analisi
        res.json(result.rows);

    } catch (err)
    {
        console.error(`Errore nel recupero dello storico analisi per cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server durante il recupero dello storico." });
    }
});


// --- NUOVA API PER ELIMINARE UNA SINGOLA ANALISI ---
app.delete("/api/analisi/:id", ensureAuthenticated, async (req, res) => {
    const { id } = req.params; // Questo è l'ID dell'analisi da eliminare

    try {
        const query = `DELETE FROM analisi_tricologiche WHERE id = $1`;
        const result = await db.query(query, [id]);

        // rowCount ci dice quante righe sono state eliminate. 
        // Se è 0, significa che l'analisi con quell'ID non è stata trovata.
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Analisi non trovata, impossibile eliminare." });
        }

        console.log(`Analisi con ID ${id} eliminata con successo.`);
        
        // Invia una risposta di successo senza contenuto (status 204)
        res.status(204).send();

    } catch (err) {
        console.error(`Errore durante l'eliminazione dell'analisi con ID ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server durante l'eliminazione." });
    }
});


// --- NUOVA API PER MODIFICARE (AGGIORNARE) UNA SINGOLA ANALISI ---
app.put("/api/analisi/:id", ensureAuthenticated, async (req, res) => {
    const { id } = req.params; // ID dell'analisi da modificare
    const dati = req.body; // Tutti i dati aggiornati dal form

    try {
        // Aggiorniamo la data di nascita del cliente, se fornita
        if (dati.dataNascitaCliente && dati.clienteId) {
            await db.query(
                `UPDATE clienti SET data_nascita = $1 WHERE id = $2`,
                [dati.dataNascitaCliente, dati.clienteId]
            );
        }

        // Costruiamo la query di UPDATE per l'analisi
        const queryAnalisi = `
            UPDATE analisi_tricologiche SET
                esigenza_cliente = $1, patologie_dichiarate = $2, frequenza_lavaggi = $3,
                presenza_prurito = $4, tappo_cheratosico = $5, stato_cute = $6, stato_capello = $7,
                tipologia_effluvio = $8, tipologia_alopecia = $9, estensione_alopecia = $10,
                diagnosi_riepilogo = $11, diagnosi_primaria = $12, piano_trattamenti = $13,
                piano_prodotti = $14, updated_at = CURRENT_TIMESTAMP
            WHERE id = $15;
        `;
        
        const values = [
            dati.esigenzaCliente, dati.patologieDichiarate, dati.frequenzaLavaggi,
            dati.presenzaPrurito, dati.tappoCheratosico, dati.statoCute, dati.statoCapello,
            dati.tipologiaEffluvio, dati.tipologiaAlopecia, dati.estensioneAlopecia,
            dati.diagnosiRiepilogo, dati.diagnosiPrimaria, dati.pianoTrattamenti,
            dati.pianoProdotti, id
        ];

        await db.query(queryAnalisi, values);
        
        console.log(`Analisi con ID ${id} aggiornata con successo.`);
        res.status(200).json({ message: "Analisi aggiornata con successo!" });

    } catch (err) {
        console.error(`Errore durante l'aggiornamento dell'analisi con ID ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server durante l'aggiornamento." });
    }
});


// ---  API CLIENTI ---
app.put("/api/clienti/:id/note", async (req, res) => {
    const { preferenze_note } = req.body;
    if (preferenze_note === undefined) return res.status(400).json({ error: 'Campo note mancante' });
    try {
        const r = await db.query("UPDATE clienti SET preferenze_note=$1 WHERE id=$2", [preferenze_note, req.params.id]);
        if (r.rowCount === 0) return res.status(404).json({ error: 'Cliente non trovato' });
        res.json({ message: "Note aggiornate!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/clienti/:id/acquisti", async (req, res) => {
    const { storico_acquisti } = req.body;
    if (storico_acquisti === undefined) return res.status(400).json({ error: 'Campo storico mancante' });
    try {
        const r = await db.query("UPDATE clienti SET storico_acquisti=$1 WHERE id=$2", [storico_acquisti, req.params.id]);
        if (r.rowCount === 0) return res.status(404).json({ error: 'Cliente non trovato' });
        res.json({ message: "Storico aggiornato!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/clienti/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM trattamenti WHERE cliente_id=$1", [req.params.id]);
        await db.query("DELETE FROM clienti WHERE id=$1", [req.params.id]);
        res.json({ message: "Eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API CALENDARIO ---
app.get("/api/events", ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM calendar_events ORDER BY start_time ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Errore nel recupero eventi calendario:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// API PER GLI APPUNTAMENTI DI OGGI (PER LA DASHBOARD)
app.get("/api/appuntamenti/oggi", ensureAuthenticated, async (req, res) => {
    console.log("Richiesta per gli appuntamenti di oggi ricevuta.");
    try {
const query = `
    SELECT 
        summary, 
        start_time,
        color_id 
    FROM 
                calendar_events 
            WHERE 
                start_time::date = CURRENT_DATE 
            ORDER BY 
                start_time ASC;
        `;
        
        const result = await db.query(query);
        res.json(result.rows);

    } catch (err) {
        console.error("Errore nel recupero degli appuntamenti di oggi:", err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});







// --- API TRATTAMENTI ---
app.get("/api/trattamenti/:id", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM trattamenti WHERE id=$1", [req.params.id]);
        if (r.rows.length === 0) return res.status(404).json({ error: "Non trovato" });
        res.json(r.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/clienti/:id/trattamenti", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM trattamenti WHERE cliente_id=$1 ORDER BY data_trattamento ASC", [req.params.id]);
        res.json(r.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/trattamenti", async (req, res) => {
    const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note, prezzo } = req.body;
    try {
        await db.query(
            "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note) VALUES ($1, $2, $3, $4, $5, $6)",
            [cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note]
        );
        res.status(201).json({ message: "Trattamento aggiunto" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/trattamenti/:id", async (req, res) => {
    const { id } = req.params;
    const { tipo_trattamento, descrizione, data_trattamento, note, prezzo } = req.body;
    try {
        await db.query(
            "UPDATE trattamenti SET tipo_trattamento=$1, descrizione=$2, data_trattamento=$3, prezzo=$4, note=$5 WHERE id=$6",
            [tipo_trattamento, descrizione, data_trattamento, prezzo, note, id]
        );
        res.json({ message: "Trattamento aggiornato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/trattamenti/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM trattamenti WHERE id=$1", [req.params.id]);
        res.json({ message: "Trattamento eliminato" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Avvio server ---
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server avviato su http://0.0.0.0:${port}`);
});