const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
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

// Rotta principale, ora accessibile senza login
app.get('/', (req, res) => {
    res.redirect('/clienti');
});

// --- ROTTE PER IL RENDERING DELLE PAGINE ---
// Queste rotte rendono le pagine HTML (EJS)
app.get('/clienti', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clienti ORDER BY nome ASC');
        res.render('clienti', { clienti: result.rows });
    } catch (err) {
        console.error('Errore nel recupero dei clienti:', err);
        res.status(500).send('Errore nel recupero dei clienti');
    }
});

app.get('/clienti/aggiungi', (req, res) => {
    res.render('aggiungi-cliente');
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
    try {
        const query = req.query.query;
        let clienti;

        if (query) {
            const searchQuery = `%${query}%`;
            const result = await pool.query(
                `SELECT * FROM clienti
                 WHERE nome ILIKE $1 OR
                       cognome ILIKE $1 OR
                       telefono ILIKE $1 OR
                       email ILIKE $1`,
                [searchQuery]
            );
            clienti = result.rows;
        } else {
            const result = await pool.query('SELECT * FROM clienti ORDER BY id DESC');
            clienti = result.rows;
        }
        res.json(clienti);
    } catch (error) {
        console.error('Errore durante la ricerca dei clienti:', error);
        res.status(500).send('Errore nella ricerca clienti: ' + error.message);
    }
});


// --- NUOVE ROTTE API (RESTful) per scheda-cliente.js ---
// Queste rotte rispondono con JSON e non reindirizzano/renderizzano pagine.
// Useranno il prefisso '/api' per chiarezza.

// API: Recupera i dati di un singolo cliente (per scheda-cliente.js)
app.get('/api/clienti/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const clientResult = await pool.query('SELECT * FROM clienti WHERE id = $1', [id]);
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cliente non trovato' });
        }
        const clientData = clientResult.rows[0];

        // Recupera anche note e acquisti se esistono (anche se notes è già nel cliente, per completezza)
        // La tua tabella `clienti` ha già `note`, quindi potremmo non aver bisogno di una tabella `note` separata
        // Assumendo che gli acquisti siano in una tabella `acquisti` collegata a `clienti` tramite `cliente_id`
        const acquistiResult = await pool.query('SELECT * FROM acquisti WHERE cliente_id = $1 ORDER BY data_acquisto DESC', [id]);
        clientData.acquisti = acquistiResult.rows;

        res.json(clientData);
    } catch (err) {
        console.error('Errore nel recupero dati API del cliente:', err);
        res.status(500).json({ message: 'Errore nel recupero dati del cliente', error: err.message });
    }
});

// API: Aggiorna le note di un cliente (da scheda-cliente.js)
app.put('/api/clienti/:id/note', async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;
    try {
        await pool.query('UPDATE clienti SET note = $1 WHERE id = $2', [note, id]);
        res.status(200).json({ message: 'Note aggiornate con successo' });
    } catch (err) {
        console.error('Errore nell\'aggiornamento API delle note:', err);
        res.status(500).json({ message: 'Errore nell\'aggiornamento delle note', error: err.message });
    }
});

// API: Aggiunge un acquisto per un cliente (da scheda-cliente.js)
// Presuppone una tabella 'acquisti' con colonne: id, cliente_id, trattamento_id, data_acquisto, prezzo, note
app.post('/api/clienti/:id/acquisti', async (req, res) => {
    const { id: clienteId } = req.params;
    const { trattamento_id, data_acquisto, prezzo, note } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO acquisti (cliente_id, trattamento_id, data_acquisto, prezzo, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [clienteId, trattamento_id, data_acquisto, prezzo, note]
        );
        res.status(201).json(result.rows[0]); // Restituisce il nuovo acquisto creato
    } catch (err) {
        console.error('Errore nell\'aggiunta API dell\'acquisto:', err);
        res.status(500).json({ message: 'Errore nell\'aggiunta dell\'acquisto', error: err.message });
    }
});

// API: Elimina un acquisto (da scheda-cliente.js)
app.delete('/api/acquisti/:id', async (req, res) => {
    const { id } = req.params; // Questo è l'ID dell'acquisto, non del cliente
    try {
        const result = await pool.query('DELETE FROM acquisti WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Acquisto non trovato' });
        }
        res.status(200).json({ message: 'Acquisto eliminato con successo' });
    } catch (err) {
        console.error('Errore nell\'eliminazione API dell\'acquisto:', err);
        res.status(500).json({ message: 'Errore nell\'eliminazione dell\'acquisto', error: err.message });
    }
});


// API: Recupera tutti i trattamenti (per dropdown in scheda-cliente.js)
app.get('/api/trattamenti', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trattamenti ORDER BY nome ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Errore nel recupero API dei trattamenti:', err);
        res.status(500).json({ message: 'Errore nel recupero dei trattamenti', error: err.message });
    }
});

// API: Aggiunge un nuovo trattamento (se necessario, ad esempio da un'altra pagina o API)
app.post('/api/trattamenti', async (req, res) => {
    const { nome, descrizione, prezzo } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO trattamenti (nome, descrizione, prezzo) VALUES ($1, $2, $3) RETURNING *',
            [nome, descrizione, prezzo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Errore nell\'aggiunta API del trattamento:', err);
        res.status(500).json({ message: 'Errore nell\'aggiunta del trattamento', error: err.message });
    }
});

// API: Elimina un trattamento
app.delete('/api/trattamenti/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM trattamenti WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Trattamento non trovato' });
        }
        res.status(200).json({ message: 'Trattamento eliminato con successo' });
    } catch (err) {
        console.error('Errore nell\'eliminazione API del trattamento:', err);
        res.status(500).json({ message: 'Errore nell\'eliminazione del trattamento', error: err.message });
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
