const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
// const session = require('express-session'); // RIMUOVI QUESTA RIGA
// const MemoryStore = require('memorystore')(session); // RIMUOVI QUESTA RIGA
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(() => console.log('✅ Connesso al DB PostgreSQL!'))
    .catch(err => console.error('Errore connessione DB:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// RIMUOVI O COMMENTA TUTTO IL BLOCCO DI CONFIGURAZIONE DELLA SESSIONE
/*
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'keyboard cat', // Usa la variabile d'ambiente o un fallback
    resave: false,
    saveUninitialized: false
}));
*/

// Middleware per controllare se l'utente è autenticato - NON È PIÙ NECESSARIO
/*
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
};
*/

// Rotta per la pagina di login - NON È PIÙ NECESSARIA
/*
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});
*/

// Rotta per il processo di login - NON È PIÙ NECESSARIA
/*
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password_hash)) {
            req.session.user = { id: user.id, username: user.username };
            res.redirect('/clienti');
        } else {
            res.render('login', { error: 'Username o password errati' });
        }
    } catch (err) {
        console.error('Errore durante il login:', err);
        res.render('login', { error: 'Si è verificato un errore durante il login.' });
    }
});
*/

// Rotta per il logout - NON È PIÙ NECESSARIA
/*
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Errore durante il logout:', err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid'); // Assicurati che questo sia il nome del tuo cookie di sessione
        res.redirect('/login');
    });
});
*/

// Rotta principale, ora accessibile senza login
app.get('/', (req, res) => {
    // res.redirect('/login'); // RIMUOVI O COMMENTA QUESTA RIGA
    res.redirect('/clienti'); // Punta direttamente ai clienti
});

// Tutte le rotte che prima usavano isAuthenticated, ora non ne hanno più bisogno
app.get('/clienti', async (req, res) => { // Rimuovi isAuthenticated se presente
    try {
        const result = await pool.query('SELECT * FROM clienti ORDER BY nome ASC');
        res.render('clienti', { clienti: result.rows });
    } catch (err) {
        console.error('Errore nel recupero dei clienti:', err);
        res.status(500).send('Errore nel recupero dei clienti');
    }
});

app.post('/clienti', async (req, res) => {
    const { nome, cognome, telefono, email, data_nascita, note } = req.body;
    try {
        await pool.query('INSERT INTO clienti (nome, cognome, telefono, email, data_nascita, note) VALUES ($1, $2, $3, $4, $5, $6)',
            [nome, cognome, telefono, email, data_nascita || null, note]);
        res.redirect('/clienti');
    } catch (err) {
        console.error('Errore nell\'aggiunta del cliente:', err);
        res.status(500).send('Errore nell\'aggiunta del cliente');
    }
});

app.get('/clienti/aggiungi', (req, res) => { // Rimuovi isAuthenticated se presente
    res.render('aggiungi-cliente');
});

app.get('/clienti/:id/modifica', async (req, res) => { // Rimuovi isAuthenticated se presente
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM clienti WHERE id = $1', [id]);
        if (result.rows.length > 0) {
            res.render('modifica-cliente', { cliente: result.rows[0] });
        } else {
            res.status(404).send('Cliente non trovato');
        }
    } catch (err) {
        console.error('Errore nel recupero del cliente per modifica:', err);
        res.status(500).send('Errore nel recupero del cliente');
    }
});

app.post('/clienti/:id/modifica', async (req, res) => {
    const { id } = req.params;
    const { nome, cognome, telefono, email, data_nascita, note } = req.body;
    try {
        await pool.query('UPDATE clienti SET nome = $1, cognome = $2, telefono = $3, email = $4, data_nascita = $5, note = $6 WHERE id = $7',
            [nome, cognome, telefono, email, data_nascita || null, note, id]);
        res.redirect('/clienti');
    } catch (err) {
        console.error('Errore nella modifica del cliente:', err);
        res.status(500).send('Errore nella modifica del cliente');
    }
});

app.post('/clienti/:id/elimina', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clienti WHERE id = $1', [id]);
        res.redirect('/clienti');
    } catch (err) {
        console.error('Errore nell\'eliminazione del cliente:', err);
        res.status(500).send('Errore nell\'eliminazione del cliente');
    }
});

app.get('/cerca-clienti', async (req, res) => { // Rimuovi isAuthenticated se presente
    const { query } = req.query;
    try {
        const result = await pool.query(
            'SELECT * FROM clienti WHERE LOWER(nome) LIKE $1 OR LOWER(cognome) LIKE $1 ORDER BY nome ASC',
            [`%${query.toLowerCase()}%`]
        );
        res.render('clienti', { clienti: result.rows, searchQuery: query });
    } catch (err) {
        console.error('Errore nella ricerca clienti:', err);
        res.status(500).send('Errore nella ricerca clienti');
    }
});

app.listen(port, () => {
    console.log(`🚀 Server avviato su http://0.0.0.0:${port}`);
});
