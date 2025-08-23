require('dotenv').config(); // QUESTA DEVE ESSERE LA PRIMISSIMA RIGA DEL FILE

const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const pgSession = require('connect-pg-simple')(session);

// In cima al file, insieme agli altri 'require'
const multer = require('multer');
const crypto = require('crypto');

// --- CONFIGURAZIONE PER L'UPLOAD DELLE IMMAGINI (VERSIONE CORRETTA) ---
const UPLOAD_PATH = process.env.NODE_ENV === 'production' ? '/app/uploads' : 'public/uploads';

// Assicuriamoci che la cartella esista
const fs = require('fs');
if (!fs.existsSync(UPLOAD_PATH)){
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        const randomName = crypto.randomBytes(16).toString('hex');
        const extension = path.extname(file.originalname);
        cb(null, `${randomName}${extension}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite di 5MB per file
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Errore: Il file deve essere un'immagine valida (jpg, png, gif, webp)."));
    }
});


// --- INIZIO: AGGIUNTE NECESSARIE PER GOOGLE CALENDAR ---
const { google } = require('googleapis');


let authClient;
let calendar;

async function initGoogleCalendar() {
    let authOptions = {
    scopes: [
      'https://www.googleapis.com/auth/calendar.events' // Permesso completo (lettura e scrittura)
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
app.use('/uploads', express.static(UPLOAD_PATH));




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

// ROTTA PUBBLICA PER VISUALIZZARE UN BUONO
// ===========================================
app.get("/api/buono/public/:token", async (req, res) => {
    const { token } = req.params;

    try {
        // Query per trovare il buono tramite il suo token e recuperare tutti i dati necessari
        const query = `
            SELECT 
                b.*,
                acq.nome AS acquirente_nome,
                acq.cognome AS acquirente_cognome,
                ben.nome AS beneficiario_nome,
                ben.cognome AS beneficiario_cognome
            FROM 
                buoni_prepagati b
            JOIN 
                clienti acq ON b.cliente_acquirente_id = acq.id
            JOIN 
                clienti ben ON b.cliente_beneficiario_id = ben.id
            WHERE 
                b.token_accesso = $1;
        `;
        const result = await db.query(query, [token]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Buono non trovato o link non valido." });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(`Errore nel recupero del buono pubblico con token ${token}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
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

app.get("/catalogo.html", ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "catalogo.html"));
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

// Sostituisci la vecchia rotta POST con questa versione aggiornata
app.post("/api/clienti", async (req, res) => {
    // 1. Leggiamo anche il campo 'tags' dal corpo della richiesta
    const { nome, cognome, soprannome, email, telefono, tags } = req.body; 
    
    // 2. Sicurezza: ci assicuriamo che 'tags' sia sempre un array
    const tagsToSave = Array.isArray(tags) ? tags : [];

    try {
        // 3. Modifichiamo la query SQL per includere la colonna 'tags'
        const sql = "INSERT INTO clienti (nome, cognome, soprannome, email, telefono, tags) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
        
        // 4. Aggiungiamo 'tagsToSave' all'array dei valori da salvare
        const result = await db.query(sql, [nome, cognome, soprannome, email, telefono, tagsToSave]);
        
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        console.error("Errore durante la creazione del cliente:", err); // Log più specifico
        res.status(err.code === '23505' ? 409 : 500).json({ error: err.message });
    }
});

app.put("/api/clienti/:id", async (req, res) => {
    const { id } = req.params;
    const { nome, cognome, soprannome, email, telefono, tags } = req.body;
    const tagsToSave = Array.isArray(tags) ? tags : [];

    try {
        const query = `
            UPDATE clienti 
            SET 
                nome = $1, 
                cognome = $2, 
                soprannome = $3, 
                telefono = $4, 
                email = $5,
                tags = $6 
            WHERE 
                id = $7
        `;
        
        const values = [nome, cognome, soprannome, telefono, email, tagsToSave, id];
        await db.query(query, values);
        
        res.json({ message: "Cliente aggiornato con successo" });

    } catch (err) {
        console.error(`Errore durante l'aggiornamento del cliente ${id}:`, err);
        res.status(500).json({ error: "Errore del server durante l'aggiornamento." });
    }
});

app.get("/api/clienti/cerca", async (req, res) => {
    const term = req.query.term;
    const isExactSearch = req.query.exact === 'true';

    try {
        let query;
        let values;

        if (isExactSearch) {
            // --- NUOVA LOGICA PER LA RICERCA ESATTA ---
            // Cerca un cliente il cui NOME CONCATENATO è ESATTAMENTE il termine pulito
            query = `
                SELECT * FROM clienti
                WHERE 
                    CONCAT(nome, ' ', cognome) ILIKE $1 
                    OR soprannome ILIKE $1;
            `;
            values = [term]; // Cerca il termine esatto, senza '%'

        } else {
            // --- LOGICA DI RICERCA GENERICA (quella che avevamo prima) ---
            const termWithWildcard = `%${term}%`;
            query = `
                SELECT *,
                    CASE
                        WHEN soprannome ILIKE $1 THEN 1
                        WHEN nome ILIKE $1 THEN 2
                        WHEN cognome ILIKE $1 THEN 2
                        WHEN COALESCE(soprannome, '') ILIKE $2 THEN 3
                        WHEN nome ILIKE $2 THEN 4
                        WHEN cognome ILIKE $2 THEN 4
                        ELSE 5
                    END as relevance
                FROM clienti
                WHERE 
                    nome ILIKE $3
                    OR cognome ILIKE $3
                    OR CONCAT(nome, ' ', cognome) ILIKE $3
                    OR COALESCE(soprannome, '') ILIKE $3
                ORDER BY 
                    relevance ASC, cognome ASC, nome ASC;
            `;
            values = [term, `${term}%`, termWithWildcard];
        }
        
        const result = await db.query(query, values);
        res.json(result.rows);

    } catch (err) {
        console.error(`ERRORE nella ricerca con termine '${term}':`, err);
        res.status(500).json({ error: err.message });
    }
});



// --- SOSTITUISCI QUESTA INTERA FUNZIONE ---
app.get("/api/clienti/:id", async (req, res) => {
    const { id } = req.params;
    const { anno } = req.query; // Leggiamo il possibile filtro per anno dall'URL

    try {
        // --- 1. Recupera i dati del cliente (nessuna modifica qui) ---
        const clientResult = await db.query("SELECT * FROM clienti WHERE id=$1", [id]);
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ error: "Non trovato" });
        }
        const client = clientResult.rows[0];

        // --- 2. [MODIFICA] Logica per recuperare i trattamenti filtrati per anno ---
        let trattamentiQuery;
        const queryParams = [id];
        
        if (anno && anno !== 'tutto') {
            trattamentiQuery = "SELECT * FROM trattamenti WHERE cliente_id=$1 AND EXTRACT(YEAR FROM data_trattamento) = $2 ORDER BY data_trattamento ASC";
            queryParams.push(anno);
        } else {
            // Se non c'è anno o è 'tutto', li prende tutti
            trattamentiQuery = "SELECT * FROM trattamenti WHERE cliente_id=$1 ORDER BY data_trattamento ASC";
        }
        const trattamentiResult = await db.query(trattamentiQuery, queryParams);
        const trattamenti = trattamentiResult.rows;

        // --- 3. [NUOVA AGGIUNTA] Recupera la lista di anni unici per i trattamenti ---
        const anniTrattamentiResult = await db.query(
            `SELECT DISTINCT EXTRACT(YEAR FROM data_trattamento)::integer AS year 
             FROM trattamenti 
             WHERE cliente_id = $1 
             ORDER BY year DESC`, [id]
        );
        const anniDisponibiliTrattamenti = anniTrattamentiResult.rows.map(row => row.year);

        // --- 4. [NUOVA AGGIUNTA] Calcola la lista di anni unici per gli acquisti ---
        let anniDisponibiliAcquisti = [];
        if (client.storico_acquisti) {
            try {
                const acquisti = JSON.parse(client.storico_acquisti);
                const yearsSet = new Set(acquisti.map(a => new Date(a.data).getFullYear()));
                anniDisponibiliAcquisti = Array.from(yearsSet).sort((a, b) => b - a);
            } catch (e) { console.error("Errore parsing storico acquisti per calcolo anni"); }
        }

        // --- 5. Logica per lo stato pagamenti (nessuna modifica qui) ---
        let haSospesi = trattamenti.some(t => !t.pagato);
        if (!haSospesi && client.storico_acquisti) {
             try {
                const acquisti = JSON.parse(client.storico_acquisti);
                if (acquisti.some(a => a.pagato === false)) haSospesi = true;
            } catch (e) { console.error("Errore parsing storico acquisti per stato pagamenti"); }
        }
        client.stato_pagamento = haSospesi ? 'sospeso' : 'regolare';

        // --- 6. [MODIFICA] Invia la risposta completa con i nuovi dati ---
        res.json({ 
            client, 
            trattamenti,
            anniDisponibiliTrattamenti, // <-- NUOVO
            anniDisponibiliAcquisti     // <-- NUOVO
        });

    } catch (err) {
        console.error(`Errore nel recuperare i dati del cliente ${id}:`, err);
        res.status(500).json({ error: "Errore del server." });
    }
});


// --- NUOVA API PER IL RIEPILOGO DELL'ULTIMA ANALISI TRICOLOGICA ---
app.get("/api/clienti/:id/analisi/riepilogo", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
			SELECT id, data_analisi, esigenza_cliente, diagnosi_primaria, diagnosi_riepilogo, piano_trattamenti
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

// --- API PER LA GALLERIA FOTOGRAFICA ---

// Rotta per recuperare tutte le foto di un cliente (AGGIORNATA PER I TAG)
app.get("/api/clienti/:id/photos", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    try {
        // Selezioniamo anche la nuova colonna 'tags'
        const query = "SELECT id, file_path, didascalia, created_at, tags FROM client_photos WHERE cliente_id = $1 ORDER BY created_at DESC";
        const result = await db.query(query, [id]);
        
        const photos = result.rows.map(photo => ({
            id: photo.id,
            didascalia: photo.didascalia,
            created_at: photo.created_at,
            url: photo.file_path,
            tags: photo.tags || [] // <--- Aggiungiamo i tag all'oggetto inviato al frontend
        }));

        res.json(photos);
    } catch (err) {
        console.error(`Errore nel recupero foto per cliente ${id}:`, err);
        res.status(500).json({ error: "Errore del server" });
    }
});

// Rotta per caricare una nuova foto per un cliente (AGGIORNATA PER I TAG)
app.post("/api/clienti/:id/photos", ensureAuthenticated, upload.single('clientImage'), async (req, res) => {
    const { id } = req.params;
    // Leggiamo anche 'didascalia' e i nuovi 'tags' dal corpo del form
    const { didascalia, tags } = req.body; 
    
    if (!req.file) {
        return res.status(400).json({ error: "Nessun file immagine caricato." });
    }

    const webPath = `/uploads/${req.file.filename}`;

    // Trasformiamo la stringa di tag (es. "colore, meches") in un array pulito
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    try {
        // Aggiungiamo la colonna 'tags' e il suo valore alla query
        const query = "INSERT INTO client_photos (cliente_id, file_path, didascalia, tags) VALUES ($1, $2, $3, $4) RETURNING *";
        await db.query(query, [id, webPath, didascalia, tagsArray]); // Passiamo l'array di tag
        
        res.status(201).json({ message: "Foto caricata con successo!" });
    } catch (err) {
        console.error(`Errore caricamento foto per cliente ${id}:`, err);
        res.status(500).json({ error: "Errore del server durante il salvataggio della foto." });
    }
});

// AGGIUNGI QUESTA NUOVA ROTTA PER LA MODIFICA DELLA FOTO

app.put("/api/photos/:photoId", ensureAuthenticated, async (req, res) => {
    const { photoId } = req.params;
    const { didascalia, tags } = req.body;

    // Sicurezza: ci assicuriamo che i tag siano sempre un array
    const tagsToSave = Array.isArray(tags) ? tags : [];

    try {
        const query = `
            UPDATE client_photos
            SET
                didascalia = $1,
                tags = $2
            WHERE
                id = $3
            RETURNING *;
        `;

        const result = await db.query(query, [didascalia, tagsToSave, photoId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Foto non trovata." });
        }

        res.json({ message: "Dettagli foto aggiornati con successo!" });
    } catch (err) {
        console.error(`Errore durante l'aggiornamento della foto ${photoId}:`, err);
        res.status(500).json({ error: "Errore del server durante l'aggiornamento." });
    }
});




// Rotta per eliminare una foto
app.delete("/api/photos/:photoId", ensureAuthenticated, async (req, res) => {
    // Aggiungeremo la logica per eliminare il file fisico qui in futuro
    // Per ora, eliminiamo solo il record dal DB
    const { photoId } = req.params;
    try {
        const result = await db.query("DELETE FROM client_photos WHERE id = $1", [photoId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Foto non trovata." });
        }
        res.status(200).json({ message: "Foto eliminata con successo." });
    } catch (err) {
        console.error(`Errore eliminazione foto ${photoId}:`, err);
        res.status(500).json({ error: "Errore del server" });
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

// =======================================================
// === API PER IL CATALOGO FOTOGRAFICO GLOBALE ===
// =======================================================
app.get("/api/photos/all", ensureAuthenticated, async (req, res) => {
    try {
        // Questa query SQL unisce le tabelle 'client_photos' e 'clienti'
        // per recuperare per ogni foto anche il nome e cognome del cliente.
        const query = `
            SELECT 
                p.id,
                p.file_path,
                p.didascalia,
                p.created_at,
                p.tags,
                c.id AS cliente_id,
                c.nome AS cliente_nome,
                c.cognome AS cliente_cognome
            FROM 
                client_photos p
            JOIN 
                clienti c ON p.cliente_id = c.id
            ORDER BY 
                p.created_at DESC;
        `;

        const result = await db.query(query);

        // Aggiustiamo i percorsi delle immagini per il frontend
        const photos = result.rows.map(photo => ({
            id: photo.id,
            url: photo.file_path, // il percorso è già un URL web
            didascalia: photo.didascalia,
            createdAt: photo.created_at,
            tags: photo.tags || [],
            cliente: {
                id: photo.cliente_id,
                nome: photo.cliente_nome,
                cognome: photo.cliente_cognome
            }
        }));

        res.json(photos);
    } catch (err) {
        console.error("Errore nel recupero di tutte le foto:", err);
        res.status(500).json({ error: "Errore del server" });
    }
});




// --- API CALENDARIO ---


// NUOVA ROTTA per CREARE un evento (VERSIONE CON FUSO ORARIO ESPLICITO)
// NUOVA ROTTA per CREARE un evento (VERSIONE CON COLORE)
app.post("/api/events/create", ensureAuthenticated, async (req, res) => {
    const { summary, start, end, colorId } = req.body; // <-- AGGIUNTO colorId

    if (!summary || !start || !end) {
        return res.status(400).json({ message: "Dati mancanti (titolo, inizio o fine)." });
    }
    console.log(`Ricevuta richiesta di creazione evento: "${summary}" con ColorID: ${colorId}`);
    if (!calendar) {
        return res.status(500).json({ message: "Errore: il client di Google Calendar non è pronto." });
    }
    try {
        const startTime = new Date(start).toISOString();
        const endTime = new Date(end).toISOString();
        const googleEventResponse = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            requestBody: {
                summary: summary,
                start: { dateTime: startTime, timeZone: 'Europe/Rome' },
                end: { dateTime: endTime, timeZone: 'Europe/Rome' },
                colorId: colorId // <-- AGGIUNTO colorId
            },
        });

        const eventData = googleEventResponse.data;
        console.log(`Evento creato su Google Calendar con ID: ${eventData.id}`);
        const eventStart = eventData.start ? (eventData.start.dateTime || eventData.start.date) : null;
        const eventEnd = eventData.end ? (eventData.end.dateTime || eventData.end.date) : null;
        const isAllDay = !!(eventData.start && eventData.start.date);

        if (!eventStart || !eventEnd) { throw new Error("La risposta di Google non contiene date valide."); }

        const query = `
            INSERT INTO calendar_events (google_event_id, summary, description, location, start_time, end_time, creator_email, last_modified, is_all_day, color_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (google_event_id) DO UPDATE SET summary = EXCLUDED.summary, start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, last_modified = EXCLUDED.last_modified, color_id = EXCLUDED.color_id;
        `;
        const values = [
            eventData.id, eventData.summary || 'Nessun titolo', eventData.description || null, eventData.location || null,
            eventStart, eventEnd, eventData.creator ? eventData.creator.email : null, eventData.updated || new Date().toISOString(),
            isAllDay, colorId || eventData.colorId || null // <-- MODIFICATO per usare il nostro colorId
        ];

        await db.query(query, values);
        console.log(`Evento salvato anche nel database locale.`);
        res.status(201).json({ status: "success", message: "Appuntamento creato con successo!" });
    } catch (error) {
        console.error("ERRORE DURANTE LA CREAZIONE DELL'EVENTO:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ message: "Errore del server durante la creazione dell'evento.", details: error.message });
    }
});

// NUOVA ROTTA per CANCELLARE un evento
app.delete("/api/events/:id", ensureAuthenticated, async (req, res) => {
    const eventId = req.params.id; // Questo è l'ID di Google (es. a1b2c3d4...)

    console.log(`Ricevuta richiesta di cancellazione per l'evento ID: ${eventId}`);

    if (!calendar) {
        return res.status(500).json({ message: "Errore: il client di Google Calendar non è pronto." });
    }

    try {
        // 1. Cancelliamo l'evento da GOOGLE CALENDAR
        await calendar.events.delete({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId: eventId,
        });
        console.log(`Evento ${eventId} cancellato con successo da Google Calendar.`);

        // 2. Cancelliamo l'evento dal nostro DATABASE locale
        await db.query("DELETE FROM calendar_events WHERE google_event_id = $1", [eventId]);
        console.log(`Evento ${eventId} cancellato anche dal database locale.`);

        // 3. Rispondiamo al browser con successo
        res.status(200).json({ status: "success", message: "Appuntamento cancellato con successo." });

    } catch (error) {
        console.error(`ERRORE CANCELLAZIONE EVENTO ${eventId}:`, error.message);
        // Se l'errore è 404 o 410, l'evento era già stato cancellato. Lo gestiamo come un successo.
        if (error.code === 404 || error.code === 410) {
            console.log("Evento non trovato su Google (probabilmente già cancellato). Procedo a rimuoverlo dal DB locale.");
            await db.query("DELETE FROM calendar_events WHERE google_event_id = $1", [eventId]);
            return res.status(200).json({ status: "success", message: "Appuntamento già cancellato." });
        }
        res.status(500).json({ message: "Errore del server durante la cancellazione." });
    }
});

// NUOVA ROTTA per MODIFICARE (UPDATE) un evento
// NUOVA ROTTA per MODIFICARE (UPDATE) un evento (VERSIONE CON COLORE)
app.put("/api/events/:id", ensureAuthenticated, async (req, res) => {
    const eventId = req.params.id;
    const { summary, start, end, colorId } = req.body; // <-- AGGIUNTO colorId

    if (!summary || !start || !end) {
        return res.status(400).json({ message: "Dati per la modifica mancanti." });
    }
    console.log(`Ricevuta richiesta di modifica per evento ${eventId}: "${summary}" con ColorID: ${colorId}`);
    try {
        const startTime = new Date(start).toISOString();
        const endTime = new Date(end).toISOString();

        const googleEventResponse = await calendar.events.patch({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            eventId: eventId,
            requestBody: {
                summary: summary,
                start: { dateTime: startTime, timeZone: 'Europe/Rome' },
                end: { dateTime: endTime, timeZone: 'Europe/Rome' },
                colorId: colorId // <-- AGGIUNTO colorId
            },
        });

        await db.query(
            "UPDATE calendar_events SET summary = $1, start_time = $2, end_time = $3, color_id = $4, last_modified = NOW() WHERE google_event_id = $5",
            [summary, startTime, endTime, colorId, eventId] // <-- AGGIUNTO colorId
        );

        console.log(`Evento ${eventId} aggiornato con successo ovunque.`);
        res.status(200).json({ status: "success", data: googleEventResponse.data });
    } catch (error) {
        console.error(`ERRORE MODIFICA EVENTO ${eventId}:`, error.message);
        res.status(500).json({ message: "Errore del server durante la modifica." });
    }
});



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
    try {
        const queryAppuntamenti = `SELECT summary, start_time, color_id FROM calendar_events WHERE start_time::date = CURRENT_DATE ORDER BY start_time ASC;`;
        const resultAppuntamenti = await db.query(queryAppuntamenti);
        const appuntamenti = resultAppuntamenti.rows;

        const appuntamentiConDatiCliente = [];

        for (const app of appuntamenti) {
            const rawTitle = app.summary.trim();
            const sigleDaRimuovere = ['tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul', 'colore'];
            const nomePulito = rawTitle.toLowerCase().split(' ').filter(p => !sigleDaRimuovere.includes(p) && isNaN(p)).join(' ').trim();
            
            let clienteCollegato = null;

            if (nomePulito) {
                // --- NUOVA LOGICA DI RICERCA POTENZIATA ---
                // Trasformiamo "margherita cristoforetti" in "%margherita%cristoforetti%"
                // Questo permette di trovare il nome anche se ci sono spazi extra o caratteri in mezzo.
                const searchTerm = `%${nomePulito.replace(/\s+/g, '%')}%`;
                
                // La query ora cerca CONCAT(nome, ' ', cognome) e CONCAT(cognome, ' ', nome)
                // Questo gestisce sia l'ordine normale che quello invertito.
                const queryCliente = `
                    SELECT id, telefono 
                    FROM clienti 
                    WHERE 
                        LOWER(CONCAT(nome, ' ', cognome)) ILIKE $1 OR
                        LOWER(CONCAT(cognome, ' ', nome)) ILIKE $1 OR
                        LOWER(soprannome) ILIKE $1
                    LIMIT 1;
                `;
                
                const resultCliente = await db.query(queryCliente, [searchTerm]);
                
                if (resultCliente.rows.length > 0) {
                    const clienteDb = resultCliente.rows[0];
                    clienteCollegato = {
                        id: clienteDb.id,
                        telefono: null 
                    };

                    if (clienteDb.telefono) {
                        let telefonoPulito = clienteDb.telefono.replace(/\D/g, '');
                        if (telefonoPulito.startsWith('3') && !telefonoPulito.startsWith('39')) {
                            telefonoPulito = '39' + telefonoPulito;
                        }
                        clienteCollegato.telefono = telefonoPulito;
                    }
                }
            }

            appuntamentiConDatiCliente.push({ ...app, cliente: clienteCollegato });
        }

        res.json(appuntamentiConDatiCliente);

    } catch (err) {
        console.error("Errore nel recupero degli appuntamenti di oggi:", err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});



// API per forzare la sincronizzazione immediata con Google Calendar
app.post("/api/sync-now", ensureAuthenticated, async (req, res) => {
    console.log("Richiesta di sincronizzazione manuale ricevuta...");
    try {
        // Chiamiamo la stessa funzione che viene eseguita ogni 15 minuti
        await syncGoogleCalendarEvents(); 
        
        console.log("Sincronizzazione manuale completata con successo.");
        res.status(200).json({ message: "Sincronizzazione completata con successo!" });
    } catch (error) {
        console.error("Errore durante la sincronizzazione manuale:", error);
        res.status(500).json({ error: "Si è verificato un errore durante la sincronizzazione." });
    }
});





// --- API TRATTAMENTI ---

// --- SOSTITUISCI QUESTA INTERA API IN INDEX.JS ---
app.get("/api/trattamenti/:id", async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                cliente_id, 
                tipo_trattamento, -- Lo teniamo per retrocompatibilità momentanea
                descrizione, 
                TO_CHAR(data_trattamento, 'YYYY-MM-DD') AS data_trattamento, 
                note, 
                prezzo,         -- Lo teniamo per retrocompatibilità momentanea
                pagato,
                servizi         -- [MODIFICA CHIAVE] Aggiunto il campo servizi
            FROM 
                trattamenti 
            WHERE 
                id=$1
        `;
        const r = await db.query(query, [req.params.id]);

        if (r.rows.length === 0) {
            return res.status(404).json({ error: "Non trovato" });
        }
        res.json(r.rows[0]);

    } catch (err) {
        console.error(`Errore nel recupero trattamento ${req.params.id}:`, err);
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


// --- SOSTITUISCI LA TUA app.post("/api/trattamenti",...) CON QUESTA ---
app.post("/api/trattamenti", async (req, res) => {
    // 1. Aggiunto 'descrizione' alla lista dei dati ricevuti
    const { cliente_id, data_trattamento, descrizione, servizi, pagato, note } = req.body;
    
    // Validazione (rimane uguale)
    if (!cliente_id || !data_trattamento || !servizi || !Array.isArray(servizi) || servizi.length === 0) {
        return res.status(400).json({ error: "Dati mancanti o non validi per creare il trattamento." });
    }

    try {
        // 2. Aggiunta la colonna 'descrizione' nella query INSERT
        const query = `
            INSERT INTO trattamenti (cliente_id, data_trattamento, descrizione, servizi, pagato, note) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        // 3. Aggiunto il valore 'descrizione' nell'array dei parametri
        await db.query(query, [cliente_id, data_trattamento, descrizione, JSON.stringify(servizi), Boolean(pagato), note]);
        
        res.status(201).json({ message: "Appuntamento aggiunto con successo" });
    } catch (err) {
        console.error("Errore durante la creazione del trattamento:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// --- SOSTITUISCI LA TUA app.put("/api/trattamenti/:id",...) CON QUESTA ---
app.put("/api/trattamenti/:id", async (req, res) => {
    const { id } = req.params;
    // 1. Aggiunto 'descrizione'
    const { data_trattamento, descrizione, servizi, pagato, note } = req.body;

    if (!data_trattamento || !servizi || !Array.isArray(servizi) || servizi.length === 0) {
        return res.status(400).json({ error: "Dati mancanti o non validi per l'aggiornamento." });
    }

    try {
        // 2. Aggiunta la colonna 'descrizione' nella query UPDATE
        const query = `
            UPDATE trattamenti 
            SET 
                data_trattamento = $1, 
                descrizione = $2, 
                servizi = $3, 
                pagato = $4, 
                note = $5
            WHERE id = $6
        `;
        // 3. Aggiunto il valore 'descrizione' nell'array dei parametri
        await db.query(query, [data_trattamento, descrizione, JSON.stringify(servizi), Boolean(pagato), note, id]);
        
        res.json({ message: "Appuntamento aggiornato con successo" });
    } catch (err) {
        console.error(`Errore aggiornamento trattamento ${id}:`, err);
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

// --- INCOLLA QUESTA NUOVA API IN INDEX.JS ---

// API specifica per aggiornare SOLO lo stato di pagamento di un trattamento
app.patch("/api/trattamenti/:id/toggle-pagato", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { pagato } = req.body; // Riceve solo { "pagato": true } o { "pagato": false }

    // Sicurezza: controlla che il valore 'pagato' sia stato inviato
    if (pagato === undefined) {
        return res.status(400).json({ error: "Stato 'pagato' mancante." });
    }

    try {
        // Esegue un UPDATE che modifica SOLO la colonna 'pagato'
        const result = await db.query("UPDATE trattamenti SET pagato = $1 WHERE id = $2", [Boolean(pagato), id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Trattamento non trovato." });
        }

        res.json({ message: "Stato pagamento aggiornato con successo." });
    } catch (err) {
        console.error(`Errore durante l'aggiornamento dello stato pagato per il trattamento ${id}:`, err.message);
        res.status(500).json({ error: err.message });
    }
});

// ===========================================
// === API PER LE RELAZIONI TRA CLIENTI    ===
// ===========================================

// 1. API per RECUPERARE tutte le relazioni di un dato cliente
app.get("/api/clienti/:id/relazioni", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        // Questa query è complessa: cerca le relazioni dove il cliente è sia 'cliente_a' che 'cliente_b'
        // e, per ogni relazione, recupera nome e cognome dell'ALTRO cliente.
        const query = `
            SELECT 
                r.id AS relazione_id,
                r.tipo_relazione,
                c.id AS cliente_correlato_id,
                c.nome AS cliente_correlato_nome,
                c.cognome AS cliente_correlato_cognome
            FROM 
                relazioni_clienti r
            JOIN 
                clienti c ON (
                    CASE 
                        WHEN r.cliente_a_id = $1 THEN r.cliente_b_id = c.id
                        ELSE r.cliente_a_id = c.id
                    END
                )
            WHERE 
                r.cliente_a_id = $1 OR r.cliente_b_id = $1;
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(`Errore nel recupero relazioni per cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});

// 2. API per CREARE una nuova relazione
app.post("/api/relazioni", ensureAuthenticated, async (req, res) => {
    const { cliente_a_id, cliente_b_id, tipo_relazione } = req.body;

    // Validazione dei dati
    if (!cliente_a_id || !cliente_b_id || !tipo_relazione) {
        return res.status(400).json({ error: "Dati mancanti per creare la relazione." });
    }
    if (cliente_a_id === cliente_b_id) {
        return res.status(400).json({ error: "Un cliente non può essere correlato a se stesso." });
    }

    try {
        const query = `
            INSERT INTO relazioni_clienti (cliente_a_id, cliente_b_id, tipo_relazione) 
            VALUES ($1, $2, $3) 
            RETURNING *;
        `;
        const result = await db.query(query, [cliente_a_id, cliente_b_id, tipo_relazione]);
        res.status(201).json(result.rows[0]);
    
    } catch (err) {
        // Se l'errore è '23505', significa che il vincolo UNIQUE è stato violato (relazione già esistente)
        if (err.code === '23505') {
            return res.status(409).json({ error: "Questo legame esiste già." });
        }
        console.error('Errore creazione relazione:', err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});

// 3. API per ELIMINARE una relazione
app.delete("/api/relazioni/:id", ensureAuthenticated, async (req, res) => {
    const { id } = req.params; // Questo è l'ID della RELAZIONE, non del cliente

    try {
        const result = await db.query("DELETE FROM relazioni_clienti WHERE id = $1", [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Relazione non trovata." });
        }
        
        res.status(200).json({ message: "Relazione eliminata con successo." });

    } catch (err) {
        console.error(`Errore eliminazione relazione ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});

// ===========================================
// === API PER I BUONI PREPAGATI           ===
// ===========================================

// 1. API per RECUPERARE tutti i buoni di cui un cliente è BENEFICIARIO

app.get("/api/clienti/:id/buoni", ensureAuthenticated, async (req, res) => {
    const { id } = req.params; 

    try {
        // MODIFICA: Aggiunto "AND b.stato = 'attivo'" per mostrare solo i buoni utilizzabili
        const query = `
            SELECT 
                b.*,
                c.nome AS acquirente_nome,
                c.cognome AS acquirente_cognome
            FROM 
                buoni_prepagati b
            JOIN 
                clienti c ON b.cliente_acquirente_id = c.id
            WHERE 
                b.cliente_beneficiario_id = $1 AND b.stato = 'attivo' 
            ORDER BY 
                b.data_acquisto DESC;
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(`Errore nel recupero buoni per cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});

// --- AGGIUNGI QUESTA NUOVA API IN INDEX.JS ---

// API per RECUPERARE TUTTI i buoni (attivi ed esauriti) di cui un cliente è BENEFICIARIO
app.get("/api/clienti/:id/buoni/storico", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        // Questa query è identica alla precedente, MA SENZA il filtro su b.stato
        const query = `
            SELECT 
                b.*,
                c.nome AS acquirente_nome,
                c.cognome AS acquirente_cognome
            FROM 
                buoni_prepagati b
            JOIN 
                clienti c ON b.cliente_acquirente_id = c.id
            WHERE 
                b.cliente_beneficiario_id = $1
            ORDER BY 
                b.stato ASC, b.data_acquisto DESC; -- Ordina per stato e poi per data
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(`Errore nel recupero storico buoni per cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});




// API per RECUPERARE tutti i buoni che un cliente ha ACQUISTATO per altri

app.get("/api/clienti/:id/buoni-acquistati", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        // MODIFICA: Aggiunto "AND b.stato = 'attivo'" anche qui per coerenza
        const query = `
            SELECT 
                b.*,
                c.id AS beneficiario_id,
                c.nome AS beneficiario_nome,
                c.cognome AS beneficiario_cognome
            FROM 
                buoni_prepagati b
            JOIN 
                clienti c ON b.cliente_beneficiario_id = c.id
            WHERE 
                b.cliente_acquirente_id = $1 AND b.stato = 'attivo'
            ORDER BY 
                b.data_acquisto DESC;
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(`Errore nel recupero buoni acquistati da cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});



// API per RECUPERARE TUTTI i buoni (attivi ed esauriti) che un cliente ha ACQUISTATO
app.get("/api/clienti/:id/buoni-acquistati/storico", ensureAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        // Query identica alla precedente, MA SENZA il filtro su b.stato
        const query = `
            SELECT 
                b.*,
                c.id AS beneficiario_id,
                c.nome AS beneficiario_nome,
                c.cognome AS beneficiario_cognome
            FROM 
                buoni_prepagati b
            JOIN 
                clienti c ON b.cliente_beneficiario_id = c.id
            WHERE 
                b.cliente_acquirente_id = $1
            ORDER BY 
                b.stato ASC, b.data_acquisto DESC; -- Ordina per stato e poi per data
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);

    } catch (err) {
        console.error(`Errore nel recupero storico buoni acquistati da cliente ${id}:`, err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});


// 2. API per CREARE un nuovo buono

app.post("/api/buoni", ensureAuthenticated, async (req, res) => {
    const {
        acquirenteId,
        beneficiarioId,
        descrizione,
        note,
        tipoBuono,
        serviziInclusi,
        valoreIniziale
    } = req.body;

    if (!acquirenteId || !beneficiarioId || !tipoBuono) {
        return res.status(400).json({ error: "Dati essenziali mancanti." });
    }

    try {
        // La colonna token_accesso viene popolata automaticamente dal database
        const query = `
            INSERT INTO buoni_prepagati 
            (cliente_acquirente_id, cliente_beneficiario_id, descrizione, note, tipo_buono, servizi_inclusi, valore_iniziale_euro, valore_rimanente_euro)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *; 
        `;
        
        const values = [
            acquirenteId,
            beneficiarioId,
            descrizione,
            note,
            tipoBuono,
            tipoBuono === 'quantita' ? JSON.stringify(serviziInclusi) : null,
            tipoBuono === 'valore' ? valoreIniziale : null,
            tipoBuono === 'valore' ? valoreIniziale : null
        ];

        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("Errore durante la creazione del buono:", err.message);
        res.status(500).json({ error: "Errore del server" });
    }
});

// 3. API per UTILIZZARE un servizio da un buono a quantità
// --- SOSTITUISCI L'INTERA API ESISTENTE "/api/buoni/:buonoId/usa-servizio" CON QUESTA ---
app.post("/api/buoni/:buonoId/usa-servizio", ensureAuthenticated, async (req, res) => {
    const { buonoId } = req.params;
    const { servizioNome, beneficiarioId } = req.body;

    if (!servizioNome || !beneficiarioId) {
        return res.status(400).json({ error: "Dati mancanti per utilizzare il servizio." });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN'); // Inizia una transazione sicura

        // 1. [MODIFICA CHIAVE] Recupera il buono E ANCHE i dati dell'acquirente con una JOIN
        const buonoResult = await client.query(`
            SELECT 
                b.*,
                c.nome AS acquirente_nome,
                c.cognome AS acquirente_cognome
            FROM 
                buoni_prepagati b
            JOIN
                clienti c ON b.cliente_acquirente_id = c.id
            WHERE 
                b.id = $1 FOR UPDATE
        `, [buonoId]);

        if (buonoResult.rows.length === 0) {
            throw new Error("Buono non trovato.");
        }
        const buono = buonoResult.rows[0];
        let servizi = buono.servizi_inclusi;

        // 2. Trova il servizio specifico e incrementa il contatore 'usati'
        const servizioIndex = servizi.findIndex(s => s.servizio === servizioNome);
        if (servizioIndex === -1 || servizi[servizioIndex].usati >= servizi[servizioIndex].totali) {
            throw new Error("Servizio non disponibile o già esaurito in questo buono.");
        }
        servizi[servizioIndex].usati++;

        // 3. Controlla se il buono è diventato esaurito
        const tuttiServiziEsauriti = servizi.every(s => s.usati >= s.totali);
        const nuovoStato = tuttiServiziEsauriti ? 'esaurito' : 'attivo';

        // 4. Aggiorna il buono nel database
        const updatedBuonoResult = await client.query(
            "UPDATE buoni_prepagati SET servizi_inclusi = $1, stato = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
            [JSON.stringify(servizi), nuovoStato, buonoId]
        );

        // 5. [MODIFICA CHIAVE] Crea un trattamento a costo zero con la NOTA CORRETTA
        // Ora abbiamo `buono.acquirente_nome` e `buono.acquirente_cognome` grazie alla JOIN
        const nomeAcquirente = `${buono.acquirente_nome} ${buono.acquirente_cognome}`;
        await client.query(
            `INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note, pagato) 
             VALUES ($1, $2, $3, NOW(), 0, $4, true)`,
            [beneficiarioId, servizioNome, `Servizio da pacchetto (ID Buono: ${buonoId})`, `Acquistato da: ${nomeAcquirente}`]
        );

        await client.query('COMMIT'); // Conferma tutte le operazioni
        res.json(updatedBuonoResult.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK'); // Annulla tutto in caso di errore
        console.error(`Errore utilizzo servizio da buono ${buonoId}:`, err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// ===========================================
// === API SPECIALI PER PAGARE CON BUONI     ===
// ===========================================

// 1. API per creare un TRATTAMENTO pagandolo con un buono a valore
// --- SOSTITUISCI QUESTA INTERA API ---
app.post("/api/trattamenti/paga-con-buono", ensureAuthenticated, async (req, res) => {
    const { trattamentoData, buonoId } = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Recupera il buono a valore e bloccalo
        const buonoResult = await client.query("SELECT * FROM buoni_prepagati WHERE id = $1 AND tipo_buono = 'valore' FOR UPDATE", [buonoId]);
        if (buonoResult.rows.length === 0) throw new Error("Buono a valore non trovato o non valido.");
        
        const buono = buonoResult.rows[0];
        const prezzoTrattamento = parseFloat(trattamentoData.prezzo);
        let valoreRimanente = parseFloat(buono.valore_rimanente_euro);

        if (valoreRimanente < prezzoTrattamento) throw new Error("Credito insufficiente nel buono.");

        // 2. Scala il credito
        valoreRimanente -= prezzoTrattamento;
        const nuovoStato = valoreRimanente <= 0 ? 'esaurito' : 'attivo';

        // 3. Aggiorna il buono
        await client.query(
            "UPDATE buoni_prepagati SET valore_rimanente_euro = $1, stato = $2, updated_at = NOW() WHERE id = $3",
            [valoreRimanente, nuovoStato, buonoId]
        );

        // 4. [MODIFICA CHIAVE] Crea il trattamento, INCLUDENDO L'ARRAY DEI SERVIZI
        await client.query(
            `INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note, pagato, servizi) 
             VALUES ($1, NULL, $2, $3, $4, $5, true, $6)`, // Aggiunto servizi
            [
                trattamentoData.cliente_id, 
                trattamentoData.descrizione,
                trattamentoData.data_trattamento,
                trattamentoData.prezzo,
                `${trattamentoData.note || ''} (Pagato con Buono ID: ${buonoId})`.trim(),
                JSON.stringify(trattamentoData.servizi) // <-- Passa l'array dei servizi
            ]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: "Trattamento creato e pagato con buono." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Errore pagamento trattamento con buono:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


// 2. API per aggiungere un ACQUISTO pagandolo con un buono a valore
app.post("/api/acquisti/paga-con-buono", ensureAuthenticated, async (req, res) => {
    const { acquistoData, buonoId, clienteId } = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Recupera il buono a valore E lo storico acquisti del cliente, e blocca entrambe le righe
        const buonoResult = await client.query("SELECT * FROM buoni_prepagati WHERE id = $1 AND tipo_buono = 'valore' FOR UPDATE", [buonoId]);
        const clienteResult = await client.query("SELECT storico_acquisti FROM clienti WHERE id = $1 FOR UPDATE", [clienteId]);

        if (buonoResult.rows.length === 0) throw new Error("Buono a valore non trovato o non valido.");
        if (clienteResult.rows.length === 0) throw new Error("Cliente non trovato.");
        
        const buono = buonoResult.rows[0];
        const prezzoAcquisto = parseFloat(acquistoData.prezzo_unitario) * parseInt(acquistoData.quantita);
        let valoreRimanente = parseFloat(buono.valore_rimanente_euro);

        if (valoreRimanente < prezzoAcquisto) throw new Error("Credito insufficiente nel buono.");

        // 2. Scala il credito
        valoreRimanente -= prezzoAcquisto;
        const nuovoStato = valoreRimanente <= 0 ? 'esaurito' : 'attivo';

        // 3. Aggiorna il buono
        await client.query(
            "UPDATE buoni_prepagati SET valore_rimanente_euro = $1, stato = $2, updated_at = NOW() WHERE id = $3",
            [valoreRimanente, nuovoStato, buonoId]
        );

        // 4. Aggiunge l'acquisto allo storico, impostandolo come PAGATO
        let storicoAcquisti = [];
        try {
            if (clienteResult.rows[0].storico_acquisti) {
                storicoAcquisti = JSON.parse(clienteResult.rows[0].storico_acquisti);
            }
        } catch(e) { console.error("JSON storico acquisti corrotto, verrà sovrascritto"); }
        
        const nuovoAcquisto = {
            ...acquistoData,
            pagato: true, // L'acquisto è immediatamente pagato
            note: `${acquistoData.note || ''} (Pagato con Buono ID: ${buonoId})`.trim()
        };
        storicoAcquisti.push(nuovoAcquisto);
        
        await client.query("UPDATE clienti SET storico_acquisti = $1 WHERE id = $2", [JSON.stringify(storicoAcquisti), clienteId]);

        await client.query('COMMIT');
        res.status(201).json({ message: "Acquisto aggiunto e pagato con buono." });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Errore pagamento acquisto con buono:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});



// --- Avvio server ---
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server avviato su http://0.0.0.0:${port}`);
});