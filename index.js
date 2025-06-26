const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
// const session = require('express-session'); // Questa è a posto
// const MemoryStore = require('memorystore')(session); // Questa è a posto
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

// ********** AGGIUNTA IMPORTANTE: GESTIONE ERRORI DEL POOL **********
pool.on('error', (err, client) => {
    console.error('Errore inatteso sul client idle del pool di database', err);
});
// ********************************************************************

pool.connect()
    .then(() => console.log('✅ Connesso al DB PostgreSQL!'))
    .catch(err => {
        console.error('Errore connessione DB INIZIALE:', err);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// RIMUOVI O COMMENTA TUTTO IL BLOCCO DI CONFIGURAZIONE DELLA SESSIONE
/*
// Sezione sessione rimossa:
// app.use(session({
//     cookie: { maxAge: 86400000 },
//     store: new MemoryStore({
//         checkPeriod: 86400000
//     }),
//     secret: process.env.SESSION_SECRET || 'keyboard cat',
//     resave: false,
//     saveUninitialized: false
// }));
*/

// Middleware per controllare se l'utente è autenticato - NON È PIÙ NECESSARIO
/*
// const isAuthenticated = (req, res, next) => { ... };
*/

// Rotta per la pagina di login - NON È PIÙ NECESSARIA
/*
// app.get('/login', (req, res) => { ... });
*/

// Rotta per il processo di login - NON È PIÙ NECESSARIA
/*
// app.post('/login', async (req, res) => { ... });
*/

// Rotta per il logout - NON È PIÙ NECESSARIA
/*
// app.get('/logout', (req, res) => { ... });
*/

// Rotta principale, ora accessibile senza login
app.get('/', (req, res) => {
    // res.redirect('/login');
    res.redirect('/clienti');
});

// Tutte le rotte che prima usavano isAuthenticated, ora non ne hanno più bisogno
app.get('/clienti', async (req, res) => {
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

app.get('/clienti/aggiungi', (req, res) => {
    res.render('aggiungi-cliente');
});

app.get('/clienti/:id/modifica', async (req, res) => {
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

app.get('/cerca-clienti', async (req, res) => {
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

// ********** AGGIUNTA IMPORTANTE: GESTIONE ECCEZIONI GLOBALI **********
process.on('uncaughtException', (err) => {
    console.error('ERRORE CRITICO: Eccezione non catturata:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('ERRORE CRITICO: Promessa non gestita:', reason);
    console.error(promise);
});
// ********************************************************************
