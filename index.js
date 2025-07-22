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

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

// ==============================================================================
// === INIZIO BLOCCO DI AUTENTICAZIONE GOOGLE CALENDAR (L'UNICA PARTE MODIFICATA) ===
// ==============================================================================
try {
    let authOptions = {
        scopes: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events.readonly'
        ]
    };

    if (process.env.NODE_ENV === 'production' && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        // In produzione, usiamo le credenziali dalla variabile d'ambiente
        console.log('Autenticazione Google Calendar in modalità produzione...');
        authOptions.credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } else if (process.env.GOOGLE_CREDENTIALS_PATH) {
        // In locale, usiamo il file specificato in .env
        console.log('Autenticazione Google Calendar in modalità locale...');
        authOptions.keyFile = process.env.GOOGLE_CREDENTIALS_PATH;
    } else {
        // Se nessuna configurazione è presente, lanciamo un errore chiaro
        throw new Error('Credenziali Google Calendar non configurate. Imposta GOOGLE_SERVICE_ACCOUNT_KEY (produzione) o GOOGLE_CREDENTIALS_PATH (locale).');
    }

    const auth = new google.auth.GoogleAuth(authOptions);

    auth.getClient().then(client => {
        authClient = client;
        calendar = google.calendar({ version: 'v3', auth: client });
        console.log("Google Calendar inizializzato con successo.");
        
        // Avvia la sincronizzazione una volta che è tutto pronto
        syncGoogleCalendarEvents();
        
        // Se vuoi sincronizzare periodicamente, puoi de-commentare questa riga
        setInterval(syncGoogleCalendarEvents, 900000); 
    }).catch(err => {
        console.error("ERRORE CRITICO: Impossibile ottenere il client di autenticazione Google:", err.message);
        process.exit(1);
    });

} catch (error) {
    console.error('ERRORE CRITICO in fase di setup autenticazione Google:', error.message);
    process.exit(1);
}
// ============================================================================
// === FINE BLOCCO DI AUTENTICAZIONE GOOGLE CALENDAR (L'UNICA PARTE MODIFICATA) ===
// ============================================================================


async function syncGoogleCalendarEvents() {
    console.log("Avvio sincronizzazione eventi Google Calendar...");
    if (!calendar) {
        console.error("ERRORE: Il client Google Calendar non è stato inizializzato correttamente prima di tentare la sincronizzazione.");
        return;
    }

    try {
        const now = new Date();
        const maxTime = new Date();
        maxTime.setDate(now.getDate() + 90);

        console.log(`Ricerca eventi dal ${now.toLocaleString()} al ${maxTime.toLocaleString()} nel calendario ID: ${CALENDAR_ID}`);

        const res = await calendar.events.list({
            calendarId: CALENDAR_ID,
            timeMin: now.toISOString(),
            timeMax: maxTime.toISOString(),
            showDeleted: false,
            singleEvents: true,
            orderBy: 'startTime',
fields: 'items(id,summary,description,location,start,end,creator,updated,colorId)' // <--- RIGA DA AGGIUNGERE
        });

        const events = res.data.items;
        if (!events || events.length === 0) {
            console.log('Nessun evento futuro trovato nel calendario specificato.');
            console.log("Sincronizzazione eventi Google Calendar completata.");
            return;
        }

        console.log(`Trovati ${events.length} eventi da Google Calendar:`);

        for (const event of events) {
            console.log('EVENTO DA GOOGLE:', event.id, 'COLOR ID:', event.colorId);

            const eventSummary = event.summary || 'Nessun titolo';
            const eventDescription = event.description || null;
            const eventLocation = event.location || null;
            const eventStart = event.start.dateTime || event.start.date;
            const eventEnd = event.end.dateTime || event.end.date;
            const eventCreatorEmail = event.creator ? event.creator.email : null;
            const eventLastModified = event.updated || new Date().toISOString();
            const isAllDay = !!event.start.date;
            const colorId = event.colorId || null;

            console.log(`  - Evento: "${eventSummary}" (Inizio: ${new Date(eventStart).toLocaleString()}, Fine: ${new Date(eventEnd).toLocaleString()})`);

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
                await db.query(query, values);
            } catch (dbError) {
                console.error(`Errore nel salvare l'evento "${eventSummary}" (ID: ${event.id}) nel DB:`, dbError.message);
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

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret',
    resave: false,
    saveUninitialized: false,
    rolling: true,
// Aggiorna la sezione cookie
cookie: {
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? 'clienti.qualityhair.it' : undefined
},
    store: new pgSession({
        pool: db,
        tableName: 'app_sessions'
    })
}));




app.use(passport.initialize());
app.use(passport.session());

// Aggiungi DOPO app.use(session(...)) e PRIMA di app.use(passport...)
app.use((req, res, next) => {
  console.log(`[MIDDLEWARE] Path: ${req.path}, Autenticato: ${req.isAuthenticated()}`);
  next();
});


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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/");
}

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

// Sostituisci la route esistente con questa versione migliorata
app.get("/", (req, res) => {
  console.log(`[ROOT] Utente autenticato: ${req.isAuthenticated()}`);
  
  if (req.isAuthenticated()) {
    console.log(`Reindirizzamento a dashboard per ${req.user?.displayName}`);
    return res.redirect("/dashboard.html");
  }
  
  console.log("Mostro pagina di login");
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
