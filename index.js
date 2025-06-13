const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// === INIZIO MODIFICHE PER DEBUGGING E USO VARIABILI D'AMBIENTE ===
// Cerca la stringa di connessione dal DATABASE_URL ambiente.
// Se non è definita (es. per sviluppo locale), usa la configurazione hardcoded.
const connectionString = process.env.DATABASE_URL;

let dbConfig;

if (connectionString) {
  // Se DATABASE_URL è presente, la usiamo (questa è la best practice per produzione)
  dbConfig = {
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  };
  console.log("Connessione DB: Usando DATABASE_URL da variabili d'ambiente.");
} else {
  // Altrimenti (es. per test in locale senza DATABASE_URL settato),
  // usiamo la configurazione hardcoded (NON USARE IN PRODUZIONE CON PASSWORD ESPOSTE!)
  dbConfig = {
    host: "schede-clienti-db-v2.flycast",
    user: "postgres",
    password: "YourStrongPassword123!", // <-- ASSICURATI DI USARE LA TUA VERA PASSWORD QUI SE NON HAI SETTATO DATABASE_URL
    database: "postgres",
    port: 5432,
    ssl: {
      rejectUnauthorized: false
    }
  };
  console.log("Connessione DB: Usando configurazione hardcoded (NON PER PRODUZIONE!).");
}

const db = new Pool(dbConfig);


// Il messaggio di connessione ora è generico, non specifica "Fly.io!" o "Render!"
db.connect()
  .then(() => console.log("✅ Connesso al database PostgreSQL!"))
  .catch(err => console.error("Errore connessione DB all'avvio:", err));
// === FINE MODIFICHE PER DEBUGGING E USO VARIABILI D'AMBIENTE ===


// --- ROTTE CLIENTI ---
app.get("/api/clienti", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clienti");
    res.json(result.rows);
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN GET /api/clienti:", err);
    res.status(500).json({
      error: "Errore interno del server durante il recupero clienti",
      details: err.message,
      stack: err.stack // Utile per debug, puoi rimuoverlo in produzione
    });
    // === DEBUGGING END ===
  }
});

app.post("/api/clienti", async (req, res) => {
  const { nome, cognome, email, telefono } = req.body;
  const sql = "INSERT INTO clienti (nome, cognome, email, telefono) VALUES ($1, $2, $3, $4) RETURNING id";
  try {
    const result = await db.query(sql, [nome, cognome, email, telefono]);
    const nuovoClienteId = result.rows[0].id;
    res.status(201).json({
      message: "Cliente aggiunto",
      id: nuovoClienteId
    });
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN POST /api/clienti:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'inserimento del cliente",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

app.put("/api/clienti/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, cognome, telefono, email } = req.body;
  try {
    await db.query(
      "UPDATE clienti SET nome=$1, cognome=$2, telefono=$3, email=$4 WHERE id=$5",
      [nome, cognome, telefono, email, id]
    );
    res.json({ message: "Cliente aggiornato" }); // Invia JSON anche per successo
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN PUT /api/clienti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'aggiornamento del cliente",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

// 🔍 Rotta di ricerca cliente per nome o cognome
app.get("/api/clienti/cerca", async (req, res) => {
  const term = `%${req.query.term}%`;
  try {
    const result = await db.query(
      "SELECT * FROM clienti WHERE nome ILIKE $1 OR cognome ILIKE $2",
      [term, term]
    );
    res.json(result.rows);
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN GET /api/clienti/cerca:", err);
    res.status(500).json({
      error: "Errore interno del server durante la ricerca clienti",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

// --- ROTTE TRATTAMENTI ---

// 🔍 Rotta per recuperare un singolo cliente (già esistente)
app.get("/api/clienti/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM clienti WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Cliente non trovato" }); // Gestisce il caso 404 per il cliente
    }
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN GET /api/clienti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante il recupero del singolo cliente",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

// Rotta per recuperare un singolo trattamento per ID
app.get("/api/trattamenti/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM trattamenti WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Restituisce il primo (e unico) risultato
    } else {
      res.status(404).json({ message: "Trattamento non trovato" }); // Gestisce il caso 404
    }
  } catch (err) {
    console.error("ERRORE DATABASE IN GET /api/trattamenti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante il recupero del singolo trattamento",
      details: err.message,
      stack: err.stack
    });
  }
});


app.get("/api/clienti/:id/trattamenti", async (req, res) => {
  try {
    // MODIFICA QUI: Aggiunta ORDER BY per ordinare per data_trattamento ASC
    const result = await db.query("SELECT * FROM trattamenti WHERE cliente_id=$1 ORDER BY data_trattamento ASC", [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN GET /api/clienti/:id/trattamenti:", err);
    res.status(500).json({
      error: "Errore interno del server durante il recupero trattamenti per cliente",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

app.post("/api/trattamenti", async (req, res) => {
  const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  try {
    await db.query(
      "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, note) VALUES ($1, $2, $3, $4, $5)",
      [cliente_id, tipo_trattamento, descrizione, data_trattamento, note]
    );
    res.status(201).json({ message: "Trattamento aggiunto" }); // Invia JSON anche per successo
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN POST /api/trattamenti:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'aggiunta del trattamento",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
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
    res.json({ message: "Trattamento aggiornato" }); // Invia JSON anche per successo
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN PUT /api/trattamenti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'aggiornamento del trattamento",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

// 🗑️ Elimina trattamento
app.delete("/api/trattamenti/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM trattamenti WHERE id = $1", [id]);
    res.json({ message: "Trattamento eliminato" }); // Invia JSON anche per successo
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN DELETE /api/trattamenti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'eliminazione del trattamento",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});

app.listen(port, () => {
  console.log(`🚀 QualityHair intranet in ascolto su http://localhost:${port}`);
});

// 🗑️ Elimina cliente
app.delete("/api/clienti/:id", async (req, res) => {
  const clienteId = req.params.id;

  try {
    // Prima elimini tutti i trattamenti collegati
    await db.query("DELETE FROM trattamenti WHERE cliente_id = $1", [clienteId]);

    // Poi elimini il cliente
    await db.query("DELETE FROM clienti WHERE id = $1", [clienteId]);

    res.json({ message: "Cliente eliminato con successo" }); // Invia JSON anche per successo
  } catch (err) {
    // === DEBUGGING START ===
    console.error("ERRORE DATABASE IN DELETE /api/clienti/:id:", err);
    res.status(500).json({
      error: "Errore interno del server durante l'eliminazione del cliente",
      details: err.message,
      stack: err.stack
    });
    // === DEBUGGING END ===
  }
});
