require('dotenv').config();
const { Pool } = require('pg');

// Configurazione del database (copiata dal tuo index.js)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error("ERRORE: DATABASE_URL non definito. Assicurati che il file .env sia presente.");
    process.exit(1);
}
const isLocalConnection = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
const dbConfig = {
    connectionString,
    ssl: isLocalConnection ? false : { rejectUnauthorized: false }
};
const pool = new Pool(dbConfig);

async function migraTrattamenti() {
    const client = await pool.connect();
    console.log("✅ Connesso al database per la migrazione dei trattamenti.");

    try {
        await client.query('BEGIN');

        // 1. Seleziona tutti i trattamenti che non sono ancora stati migrati (dove 'servizi' è NULL)
        const { rows } = await client.query("SELECT id, tipo_trattamento, prezzo FROM trattamenti WHERE servizi IS NULL");
        
        if (rows.length === 0) {
            console.log("✅ Nessun trattamento da migrare. La colonna 'servizi' è già popolata per tutti i record.");
            await client.query('COMMIT'); // Chiudi comunque la transazione
            return;
        }
        
        console.log(`Trovati ${rows.length} trattamenti da migrare...`);

        // 2. Itera su ogni trattamento e prepara l'aggiornamento
        for (const trattamento of rows) {
            const tipo = trattamento.tipo_trattamento || 'Servizio non specificato';
            const prezzo = trattamento.prezzo !== null ? parseFloat(trattamento.prezzo) : 0;

            // 3. Crea il nuovo formato JSON
            const nuovoFormatoServizi = [{
                servizio: tipo,
                prezzo: prezzo
            }];

            // 4. Aggiorna la riga nel database, popolando la colonna 'servizi'
            await client.query(
                "UPDATE trattamenti SET servizi = $1 WHERE id = $2",
                [JSON.stringify(nuovoFormatoServizi), trattamento.id]
            );
        }

        await client.query('COMMIT');
        console.log(`\n🎉 Migrazione completata con successo! ${rows.length} trattamenti sono stati aggiornati.`);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("\n❌ ERRORE DURANTE LA MIGRAZIONE. Tutte le modifiche sono state annullate.", error);
    } finally {
        client.release();
        pool.end();
        console.log("🔌 Connessione al database chiusa.");
    }
}

migraTrattamenti();