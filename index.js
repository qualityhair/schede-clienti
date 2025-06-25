require('dotenv').config();

const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");

const app = express();

// --- Configurazione del Database ---
const connectionString = process.env.DATABASE_URL;
let dbConfig;

if (connectionString) {
  dbConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  console.log("Connessione DB: Usando DATABASE_URL.");
} else {
  dbConfig = {
    host: "schede-clienti-db-v2.flycast",
    user: "postgres",
    password: "YourStrongPassword123!",
    database: "postgres",
    port: 5432,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  console.log("Connessione DB: Usata conf hardcoded.");
}

const db = new Pool(dbConfig);
db.on('error', (err) => console.error('Errore pool:', err.message));
setInterval(() => db.query('SELECT 1').catch(e => console.error('DB ping failed:', e.message)), 5 * 60 * 1000);
db.connect()
  .then(() => console.log("✅ Connesso al DB PostgreSQL!"))
  .catch(err => console.error("Errore connessione DB:", err));

// --- Middleware Base ---
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- Session & Passport Setup ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // usa true se hai HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// *** Modifica qui: serializeUser e deserializeUser ***
passport.serializeUser((user, done) => {
  done(null, user.id || (user.emails && user.emails[0].value));
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});

// --- Google OAuth Strategy ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails && profile.emails[0].value;
    if (email === "qualityhairbolzano@google.com") {
      return done(null, profile);
    } else {
      return done(null, false, { message: "Email non autorizzata" });
    }
  }
));

// --- Middleware per proteggere le rotte ---
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login.html");
}

// --- Rotte di autenticazione ---
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login.html" }),
  (req, res) => {
    res.redirect("/dashboard.html");
  });

// *** Modifica qui: logout con callback per evitare problemi ***
app.get("/logout", (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect("/login.html");
  });
});

// --- Redirect dalla home ---
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard.html");
  } else {
    res.redirect("/login.html");
  }
});

// --- Rotte protette ---
app.get("/dashboard.html", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});
app.get("/lista-clienti.html", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "lista-clienti.html"));
});

// Proteggi le API
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
  const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  try {
    await db.query(
      "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, note) VALUES ($1, $2, $3, $4, $5)",
      [cliente_id, tipo_trattamento, descrizione, data_trattamento, note]
    );
    res.status(201).json({ message: "Trattamento aggiunto" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/trattamenti/:id", async (req, res) => {
  const { id } = req.params;
  const { tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  try {
    await db.query(
      "UPDATE trattamenti SET tipo_trattamento=$1, descrizione=$2, data_trattamento=$3, note=$4 WHERE id=$5",
      [tipo_trattamento, descrizione, data_trattamento, note, id]
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
