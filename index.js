const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session'); // NUOVO: Modulo per le sessioni
const bcrypt = require('bcrypt');       // NUOVO: Modulo per hashing delle password

const app = express();
const port = process.env.PORT || 3000;


// --- Configurazione del Database ---
const connectionString = process.env.DATABASE_URL;
let dbConfig;

if (connectionString) {
    dbConfig = {
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    };
    console.log("Connessione DB: Usando DATABASE_URL da variabili d'ambiente.");
} else {
    dbConfig = {
        host: "schede-clienti-db-v2.flycast",
        user: "postgres",
        password: "YourStrongPassword123!", // <-- ASSICURATI DI USARE LA TUA VERA PASSWORD QUI SE NON HAI SETTATO DATABASE_URL
        database: "postgres",
        port: 5432,
        ssl: { rejectUnauthorized: false }
    };
    console.log("Connessione DB: Usando configurazione hardcoded (NON PER PRODUZIONE!).");
}

const db = new Pool(dbConfig);

db.connect()
    .then(() => console.log("✅ Connesso al database PostgreSQL!"))
    .catch(err => console.error("Errore connessione DB all'avvio:", err));
// --- Fine Configurazione DB ---


// --- Middleware Base ---
app.use(express.static("public")); // Per servire file statici (CSS, JS, immagini)
app.use(bodyParser.urlencoded({ extended: true })); // Per parsare i dati dei form HTML
app.use(bodyParser.json()); // Per parsare i body delle richieste JSON


// --- NUOVO: Configurazione di Express-Session ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'una_chiave_segreta_molto_lunga_e_complessa_da_cambiare_in_produzione_se_non_variabile_ambiente', // **CAMBIA QUESTA!**
    resave: false, // Non salvare la sessione se non è stata modificata
    saveUninitialized: false, // Non salvare sessioni nuove non inizializzate
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in produzione (richiede HTTPS)
        httpOnly: true, // Il cookie non è accessibile via JavaScript lato client
        maxAge: 1000 * 60 * 60 * 24 // Durata del cookie: 24 ore
    }
}));


// --- NUOVO: Middleware per controllare l'autenticazione ---
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        // Se l'utente è loggato, prosegui alla prossima funzione middleware/rotta
        next();
    } else {
        // Se non è loggato, reindirizza alla pagina di login (index.html)
        // Puoi anche passare un messaggio di errore se vuoi
        res.redirect('/?error=auth_required');
    }
}


// --- NUOVO: Rotta per la gestione del Login (POST dal form HTML) ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body; // Prende username e password dal body della richiesta

    try {
        // Cerca l'utente nel database
        const result = await db.query('SELECT id, username, password_hash FROM users WHERE username = $1', [username]);
        const user = result.rows[0]; // Prende il primo utente trovato

        if (user && await bcrypt.compare(password, user.password_hash)) {
            // Credenziali valide: imposta la sessione per l'utente
            req.session.userId = user.id;
            req.session.isLoggedIn = true;
            console.log(`Utente ${username} loggato con successo.`);
            // Reindirizza l'utente alla dashboard protetta
            res.redirect('/dashboard.html');
        } else {
            // Credenziali non valide: reindirizza alla pagina di login con un messaggio di errore
            console.warn(`Tentativo di login fallito per username: ${username}`);
            res.redirect('/?error=invalid_credentials');
        }
    } catch (err) {
        console.error("ERRORE DURANTE IL LOGIN:", err);
        res.status(500).redirect('/?error=server_error');
    }
});


// --- NUOVO: Rotta per il Logout ---
app.get('/logout', (req, res) => {
    req.session.destroy(err => { // Distrugge la sessione sul server
        if (err) {
            console.error('Errore durante il logout:', err);
            return res.status(500).send('Errore durante il logout.');
        }
        res.clearCookie('connect.sid'); // Cancella il cookie di sessione dal browser
        console.log('Utente disconnesso.');
        res.redirect('/'); // Reindirizza l'utente alla pagina di login (index.html)
    });
});


// --- ROTTE PUBBLICHE (accessibili senza login) ---
// La rotta root / ora serve la pagina di login
app.get("/", (req, res) => {
    // Se l'utente è già loggato, reindirizzalo direttamente alla dashboard
    if (req.session.isLoggedIn) {
        return res.redirect('/dashboard.html');
    }
    // Altrimenti, servi la pagina di login (public/index.html)
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// --- ROTTE PROTETTE (richiedono autenticazione) ---
// Applica il middleware `isAuthenticated` a tutte le rotte che devono essere protette.

app.get("/dashboard.html", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/lista-clienti.html", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "lista-clienti.html"));
});

// Tutte le tue API per clienti e trattamenti devono essere protette
app.get("/api/clienti", isAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM clienti");
        res.json(result.rows);
    } catch (err) {
        console.error("ERRORE DATABASE IN GET /api/clienti:", err);
        res.status(500).json({ error: "Errore interno del server durante il recupero clienti", details: err.message, stack: err.stack });
    }
});

app.post("/api/clienti", isAuthenticated, async (req, res) => {
    const { nome, cognome, email, telefono } = req.body;
    const sql = "INSERT INTO clienti (nome, cognome, email, telefono) VALUES ($1, $2, $3, $4) RETURNING id";
    try {
        const result = await db.query(sql, [nome, cognome, email, telefono]);
        const nuovoClienteId = result.rows[0].id;
        res.status(201).json({ message: "Cliente aggiunto", id: nuovoClienteId });
    } catch (err) {
        console.error("ERRORE DATABASE IN POST /api/clienti:", err);
        res.status(500).json({ error: "Errore interno del server durante l'inserimento del cliente", details: err.message, stack: err.stack });
    }
});

app.put("/api/clienti/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { nome, cognome, telefono, email } = req.body;
    try {
        await db.query(
            "UPDATE clienti SET nome=$1, cognome=$2, telefono=$3, email=$4 WHERE id=$5",
            [nome, cognome, telefono, email, id]
        );
        res.json({ message: "Cliente aggiornato" });
    } catch (err) {
        console.error("ERRORE DATABASE IN PUT /api/clienti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante l'aggiornamento del cliente", details: err.message, stack: err.stack });
    }
});

app.get("/api/clienti/cerca", isAuthenticated, async (req, res) => {
    const term = `%${req.query.term}%`;
    try {
        const result = await db.query(
            "SELECT * FROM clienti WHERE nome ILIKE $1 OR cognome ILIKE $2",
            [term, term]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("ERRORE DATABASE IN GET /api/clienti/cerca:", err);
        res.status(500).json({ error: "Errore interno del server durante la ricerca clienti", details: err.message, stack: err.stack });
    }
});

app.get("/api/clienti/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query("SELECT * FROM clienti WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Cliente non trovato" });
        }
    } catch (err) {
        console.error("ERRORE DATABASE IN GET /api/clienti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante il recupero del singolo cliente", details: err.message, stack: err.stack });
    }
});

app.delete("/api/clienti/:id", isAuthenticated, async (req, res) => { // SPOSTATA QUI SOPRA listen()
    const clienteId = req.params.id;
    try {
        await db.query("DELETE FROM trattamenti WHERE cliente_id = $1", [clienteId]);
        await db.query("DELETE FROM clienti WHERE id = $1", [clienteId]);
        res.json({ message: "Cliente eliminato con successo" });
    } catch (err) {
        console.error("ERRORE DATABASE IN DELETE /api/clienti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante l'eliminazione del cliente", details: err.message, stack: err.stack });
    }
});

// --- Rotte Trattamenti (protette) ---
app.get("/api/trattamenti/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await db.query("SELECT * FROM trattamenti WHERE id = $1", [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: "Trattamento non trovato" });
        }
    } catch (err) {
        console.error("ERRORE DATABASE IN GET /api/trattamenti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante il recupero del singolo trattamento", details: err.message, stack: err.stack });
    }
});

app.get("/api/clienti/:id/trattamenti", isAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM trattamenti WHERE cliente_id=$1 ORDER BY data_trattamento ASC", [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        console.error("ERRORE DATABASE IN GET /api/clienti/:id/trattamenti:", err);
        res.status(500).json({ error: "Errore interno del server durante il recupero trattamenti per cliente", details: err.message, stack: err.stack });
    }
});

app.post("/api/trattamenti", isAuthenticated, async (req, res) => {
    const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note } = req.body;
    try {
        await db.query(
            "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, note) VALUES ($1, $2, $3, $4, $5)",
            [cliente_id, tipo_trattamento, descrizione, data_trattamento, note]
        );
        res.status(201).json({ message: "Trattamento aggiunto" });
    } catch (err) {
        console.error("ERRORE DATABASE IN POST /api/trattamenti:", err);
        res.status(500).json({ error: "Errore interno del server durante l'aggiunta del trattamento", details: err.message, stack: err.stack });
    }
});

app.put("/api/trattamenti/:id", isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { tipo_trattamento, descrizione, data_trattamento, note } = req.body;
    try {
        await db.query(
            "UPDATE trattamenti SET tipo_trattamento=$1, descrizione=$2, data_trattamento=$3, note=$4 WHERE id=$5",
            [tipo_trattamento, descrizione, data_trattamento, note, id]
        );
        res.json({ message: "Trattamento aggiornato" });
    } catch (err) {
        console.error("ERRORE DATABASE IN PUT /api/trattamenti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante l'aggiornamento del trattamento", details: err.message, stack: err.stack });
    }
});

app.delete("/api/trattamenti/:id", isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        await db.query("DELETE FROM trattamenti WHERE id = $1", [id]);
        res.json({ message: "Trattamento eliminato" });
    } catch (err) {
        console.error("ERRORE DATABASE IN DELETE /api/trattamenti/:id:", err);
        res.status(500).json({ error: "Errore interno del server durante l'eliminazione del trattamento", details: err.message, stack: err.stack });
    }
});

// Definisci la porta, prendendola dalle variabili d'ambiente o usando 8080 come fallback
const port = process.env.PORT || 8080; 

// Avvio del server: DEVE ESSERE L'ULTIMA COSA NEL FILE
// Importante: ascolta su '0.0.0.0' per essere accessibile da Fly.io
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 QualityHair intranet in ascolto su http://0.0.0.0:${port}`); // Modifica il messaggio di log per conferma
});
