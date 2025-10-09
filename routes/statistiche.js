const express = require('express');
const router = express.Router();
const pool = require('../db'); // il tuo pool PostgreSQL

// Clienti più assidui
router.get('/clienti-assidui', async (req, res) => {
    const { periodo } = req.query;
    let intervallo = '1 month';
    if(periodo === 'trimestre') intervallo = '3 month';
    else if(periodo === 'anno') intervallo = '12 month';

    const query = `
        SELECT cliente_id, cliente_nome, COUNT(*) AS visite
        FROM appuntamenti
        WHERE data >= current_date - interval '${intervallo}'
        GROUP BY cliente_id, cliente_nome
        ORDER BY visite DESC
        LIMIT 10;
    `;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Errore server');
    }
});

// Servizi più richiesti
router.get('/servizi-richiesti', async (req, res) => {
    const { periodo } = req.query;
    let intervallo = '1 month';
    if(periodo === 'trimestre') intervallo = '3 month';
    else if(periodo === 'anno') intervallo = '12 month';

    const query = `
        SELECT servizio, COUNT(*) AS richieste
        FROM appuntamenti
        WHERE data >= current_date - interval '${intervallo}'
        GROUP BY servizio
        ORDER BY richieste DESC;
    `;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Errore server');
    }
});

module.exports = router;
