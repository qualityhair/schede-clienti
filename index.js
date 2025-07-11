require('dotenv').config();

const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

const pgSession = require('connect-pg-simple')(session);

const app = express();
// --- QUI DEVI AGGIUNGERE LA RIGA ---
app.set('trust proxy', 1); // Questa riga è fondamentale per Fly.io
// --- FINE AGGIUNTA ---


// --- Configurazione DB ---
const connectionString = process.env.DATABASE_URL;
const db = new Pool(connectionString
  ? {
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
  : {
      host: "schede-clienti-db-v2.flycast",
      user: "postgres",
      password: "YourStrongPassword123!",
      database: "postgres",
      port: 5432,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    }
);
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
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server avviato su http://0.0.0.0:${port}`);
});
