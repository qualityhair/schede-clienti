const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new Pool({
  host: "schede-clienti-db-v2.flycast",
  user: "postgres",
  password: "YourStrongPassword123!",
  database: "postgres",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});


db.connect()
  .then(() => console.log("✅ Connesso al database PostgreSQL su Render!"))
  .catch(err => console.error("Errore connessione DB:", err));

// --- ROTTE CLIENTI ---
app.get("/api/clienti", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clienti");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
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
    console.error(err);
    res.status(500).json({ error: "Errore durante l'inserimento" });
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
    res.send("Cliente aggiornato");
  } catch (err) {
    res.status(500).send(err.message);
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
    res.status(500).send("Errore nel database");
  }
});

// --- ROTTE TRATTAMENTI ---
// 🔍 Dati di un singolo cliente
app.get("/api/clienti/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query("SELECT * FROM clienti WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/api/clienti/:id/trattamenti", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM trattamenti WHERE cliente_id=$1", [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/api/trattamenti", async (req, res) => {
  const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  try {
    await db.query(
      "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, note) VALUES ($1, $2, $3, $4, $5)",
      [cliente_id, tipo_trattamento, descrizione, data_trattamento, note]
    );
    res.send("Trattamento aggiunto");
  } catch (err) {
    res.status(500).send(err.message);
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
    res.send("Trattamento aggiornato");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🗑️ Elimina trattamento
app.delete("/api/trattamenti/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await db.query("DELETE FROM trattamenti WHERE id = $1", [id]);
    res.send("Trattamento eliminato");
  } catch (err) {
    res.status(500).send(err.message);
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

    res.send("Cliente eliminato con successo");
  } catch (err) {
    console.error("Errore nell'eliminazione:", err);
    res.status(500).json({ error: "Errore durante l'eliminazione" });
  }
});
