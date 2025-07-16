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
const { google } = require('googleapis'); // Lascia questa riga all'inizio del file

let authClient; // Variabile per l'oggetto di autenticazione Google
let calendar;   // Variabile per l'istanza del client Google Calendar

// ID del calendario da cui leggere gli eventi.
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// Questo è il blocco principale che gestisce l'autenticazione in base all'ambiente
if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // In produzione su Fly.io, usa la chiave del service account dalle variabili d'ambiente
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        authClient = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly'
    ] 
);
        console.log('Credenziali Google caricate da variabile d\'ambiente (produzione).');

        // Ora che authClient è pronto, inizializza il calendario e avvia la sincronizzazione
        calendar = google.calendar({ version: 'v3', auth: authClient });
        console.log("Google Calendar inizializzato con credenziali di produzione.");
        syncGoogleCalendarEvents(); // Avvia la sincronizzazione degli eventi una volta che è tutto pronto
        // Se vuoi sincronizzare periodicamente (es. ogni 15 minuti), scommenta la riga qui sotto:
        setInterval(syncGoogleCalendarEvents, 900000); // 900000 ms = 15 minuti

    } catch (error) {
        console.error('ERRORE: Impossibile parsare GOOGLE_SERVICE_ACCOUNT_KEY. Assicurati che il formato JSON sia corretto.', error);
        process.exit(1); // Esci se non riesci a leggere le credenziali (importante per Fly.io)
    }
} else if (process.env.GOOGLE_CREDENTIALS_PATH) {
    // In locale, usa il percorso del file specificato in .env.local
    // Inizializza GoogleAuth che poi richiederà getClient()

authClient = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
    scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly'
    ], 
});

    console.log('Credenziali Google caricate da file locale.');

    // Ottieni il client di autenticazione (async) e inizializza il client di Google Calendar
    authClient.getClient().then(client => { // Qui si usa il `client` restituito da getClient()
        calendar = google.calendar({ version: 'v3', auth: client }); // Usa `client` per auth
        console.log("Google Calendar inizializzato con credenziali locali.");
        syncGoogleCalendarEvents(); // Avvia la sincronizzazione degli eventi
        // Se vuoi sincronizzare periodicamente (es. ogni 15 minuti), scommenta la riga qui sotto:
        setInterval(syncGoogleCalendarEvents, 900000); // 900000 ms = 15 minuti
    }).catch(err => {
        console.error("Errore nell'ottenere il client di autenticazione Google (locale):", err.message);
        process.exit(1);
    });

} else {
    // Se nessuna delle due variabili d'ambiente è impostata
    console.error('ERRORE: Credenziali Google non configurate. Imposta GOOGLE_SERVICE_ACCOUNT_KEY (produzione) o GOOGLE_CREDENTIALS_PATH (locale).');
    process.exit(1); // Esci se le credenziali non sono configurate
}

// *** IMPORTANTE: Non ci deve essere più nessun altro blocco di inizializzazione
// di 'auth' o 'calendar' dopo questo 'if/else if/else'.
// Tutto ciò che è necessario fare una volta che 'calendar' è pronto
// (es. chiamare syncGoogleCalendarEvents()) deve essere all'interno dei blocchi `if` ed `else if`.

// --- FINE: AGGIUNTE NECESSARIE PER GOOGLE CALENDAR ---


// Funzione asincrona per recuperare e salvare gli eventi da Google Calendar
async function syncGoogleCalendarEvents() {
    console.log("Avvio sincronizzazione eventi Google Calendar...");
    if (!calendar) {
        console.error("ERRORE: Il client Google Calendar non è stato inizializzato correttamente prima di tentare la sincronizzazione.");
        return;
    }

    try {
        const now = new Date();
        const maxTime = new Date();
        maxTime.setDate(now.getDate() + 90); // Prende eventi per i prossimi 90 giorni

        console.log(`Ricerca eventi dal ${now.toLocaleString()} al ${maxTime.toLocaleString()} nel calendario ID: ${CALENDAR_ID}`);

const res = await calendar.events.list({
    calendarId: CALENDAR_ID,
    timeMin: now.toISOString(),
    timeMax: maxTime.toISOString(),
    showDeleted: false,
    singleEvents: true,
    orderBy: 'startTime',
});;

        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('Nessun evento futuro trovato nel calendario specificato.');
            console.log("Sincronizzazione eventi Google Calendar completata.");
            return;
        }

        console.log(`Trovati ${events.length} eventi da Google Calendar:`);



// --- NUOVA LOGICA: Salvare/Aggiornare gli eventi nel database ---
for (const event of events) {

    console.log('EVENTO DA GOOGLE:', event.id, 'COLOR ID:', event.colorId); // <--- RIGA DI DEBUG

    const eventSummary = event.summary || 'Nessun titolo';
    const eventDescription = event.description || null;
    const eventLocation = event.location || null;
    const eventStart = event.start.dateTime || event.start.date;
    const eventEnd = event.end.dateTime || event.end.date;
    const eventCreatorEmail = event.creator ? event.creator.email : null;
    const eventLastModified = event.updated || new Date().toISOString();
    const isAllDay = !!event.start.date;
    const colorId = event.colorId || null; // <--- ASSICURATI CHE QUESTA RIGA SIA QUI

    // Stampa nella console, come prima
    console.log(`  - Evento: "${eventSummary}" (Inizio: ${new Date(eventStart).toLocaleString()}, Fine: ${new Date(eventEnd).toLocaleString()})`);

    // Query SQL per UPSERT (UPDATE o INSERT) basata su google_event_id
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
        eventLastModified,
        isAllDay,
        colorId
    ];



    try {
        // Esegui la query sul database
        await db.query(query, values);


                // console.log(`Evento "${eventSummary}" (ID: ${event.id}) salvato/aggiornato nel DB.`); // Decommenta per debug dettagliato
            } catch (dbError) {
                console.error(`Errore nel salvare l'evento "${eventSummary}" (ID: ${event.id}) nel DB:`, dbError.message);
                // Puoi loggare l'intero errore per debug approfondito: console.error(dbError);
            }
        }
        console.log("Sincronizzazione eventi Google Calendar completata.");

    } catch (error) {
        console.error('Errore durante la sincronizzazione del calendario:', error.message);
        if (error.code === 404) {
            console.error('Potrebbe essere un problema di ID Calendario errato o permessi insufficienti.');
        } else if (error.response && error.response.data && error.response.data.error) {
            console.error('Dettagli errore Google API:', error.response.data.error);
        }
    }
}

// ... (resto del codice sotto questa funzione, inclusa l'inizializzazione di auth e calendar) ...

// --- Google OAuth --- (Il tuo codice di autenticazione OAuth esistente da qui in poi)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Questo deve essere definito in .env.local
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Questo deve essere definito in .env.local
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Questo deve essere definito in .env.local
},
    (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0].value;
        if (email === "qualityhairbolzano@gmail.com") {
            return done(null, profile);
        } else {
            return done(null, false, { message: "Email non autorizzata" });
        }
    }
));

// --- Middleware autenticazione ---
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

const app = express(); // Questa riga DEVE essere dopo tutte le importazioni e configurazioni globali
// ... il resto del tuo codice di configurazione Express, rotte, ecc.



// --- QUI DEVI AGGIUNGERE LA RIGA ---
app.set('trust proxy', 1); // Questa riga è fondamentale per Fly.io
// --- FINE AGGIUNTA ---


// --- Configurazione DB ---
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("ERRORE: La variabile d'ambiente DATABASE_URL non è stata definita!");
    console.error("Assicurati che sia presente nel file .env (per lo sviluppo locale) o nei segreti di Fly.io (per la produzione).");
    process.exit(1); // Esce dall'applicazione se il DB non è configurato.
}

const isLocalConnection = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const dbConfig = {
    connectionString,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false }, // Disabilita SSL solo se la connessione è locale
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: true // <-- AGGIUNGI QUESTA RIGA
};

const db = new Pool(dbConfig); // Crea il pool con la configurazione decisa sopra


db.on('error', (err) => console.error('Errore pool:', err.message));
setInterval(() => db.query('SELECT 1').catch(e => console.error('DB ping failed:', e.message)), 5 * 60 * 1000);
db.connect()
    .then(() => console.log("✅ Connesso al DB PostgreSQL!"))
    .catch(err => console.error("Errore connessione DB:", err));

// --- Middleware base ---
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    // --- AGGIUNGI O VERIFICA BENE QUESTA RIGA ---
    rolling: true, // Questo è cruciale: estende la durata della sessione ad ogni richiesta attiva
    // ---------------------------------------------
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 giorni in millisecondi
    },
    // --- AGGIUNGI QUESTO BLOCCO PER LO STORE DELLA SESSIONE ---
    store: new pgSession({
        pool: db, // Usa il tuo pool di connessioni PostgreSQL 'db'
        tableName: 'app_sessions' // Nome della tabella dove verranno salvate le sessioni
    })
    // -----------------------------------------------------------
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Google OAuth ---
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
},
    (accessToken, refreshToken, profile, done) => {
        const email = profile.emails?.[0].value;
        if (email === "qualityhairbolzano@gmail.com") {
            return done(null, profile);
        } else {
            return done(null, false, { message: "Email non autorizzata" });
        }
    }
));

// --- Middleware autenticazione ---
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

// --- Rotte OAuth ---
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard.html");
    });

app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// --- Redirect root ---
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/dashboard.html");
    } else {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    }
});

// --- Rotte protette ---
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
            "SELECT * FROM clienti WHERE nome ILIKE $1 OR cognome ILIKE $2",
            [term, term]
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
        // Opzionale: puoi aggiungere filtri per data se ne avrai bisogno in futuro
        const result = await db.query("SELECT * FROM calendar_events ORDER BY start_time ASC");
        res.json(result.rows);
    } catch (err) {
        console.error("Errore nel recupero eventi calendario:", err.message);
        res.status(500).json({ error: err.message });
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
    // Aggiungi 'prezzo' qui:
    const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note, prezzo } = req.body;
    try {
        await db.query(
            // Assicurati che 'prezzo' sia nella posizione corretta ($5)
            "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note) VALUES ($1, $2, $3, $4, $5, $6)",
            // Assicurati che 'prezzo' sia nella posizione corretta nell'array
            [cliente_id, tipo_trattamento, descrizione, data_trattamento, prezzo, note]
        );
        res.status(201).json({ message: "Trattamento aggiunto" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/api/trattamenti/:id", async (req, res) => {
    const { id } = req.params;
    // Aggiungi 'prezzo' qui:
    const { tipo_trattamento, descrizione, data_trattamento, note, prezzo } = req.body;
    try {
        await db.query(
            // Assicurati che 'prezzo' sia nella posizione corretta ($4)
            "UPDATE trattamenti SET tipo_trattamento=$1, descrizione=$2, data_trattamento=$3, prezzo=$4, note=$5 WHERE id=$6",
            // Assicurati che 'prezzo' sia nella posizione corretta nell'array
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