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

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
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
  res.redirect("/");
}

// --- Rotte di autenticazione ---
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

// --- Redirect dalla home ---
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

// Proteggi le API
app.use("/api", ensureAuthenticated);

// --- API CLIENTI ---
// ... qui il resto rimane identico, come nel tuo file

// --- Avvio server ---
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server avviato su http://0.0.0.0:${port}`);
});
