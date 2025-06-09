const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "192.168.1.200",
  user: "qualityadmin",
  password: "passwordforte123",
  database: "qualityadmin"
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connesso al database MyCloud!");
});

// --- ROTTE CLIENTI ---
app.get("/api/clienti", (req, res) => {
  db.query("SELECT * FROM clienti", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post("/api/clienti", (req, res) => {
  const { nome, cognome, email, telefono } = req.body;
  const sql = "INSERT INTO clienti (nome, cognome, email, telefono) VALUES (?, ?, ?, ?)";

  db.query(sql, [nome, cognome, email, telefono], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Errore durante l'inserimento" });
    }

    const nuovoClienteId = result.insertId;
    res.status(201).json({
      message: "Cliente aggiunto",
      id: nuovoClienteId
    });
  });
});


app.put("/api/clienti/:id", (req, res) => {
  const { id } = req.params;
  const { nome, cognome, telefono, email } = req.body;
  db.query(
    "UPDATE clienti SET nome=?, cognome=?, telefono=?, email=? WHERE id=?",
    [nome, cognome, telefono, email, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Cliente aggiornato");
    }
  );
});

// 🔍 Rotta di ricerca cliente per nome o cognome
app.get("/api/clienti/cerca", (req, res) => {
  const term = `%${req.query.term}%`;
  db.query(
    "SELECT * FROM clienti WHERE nome LIKE ? OR cognome LIKE ?",
    [term, term],
    (err, result) => {
      if (err) return res.status(500).send("Errore nel database");
      res.json(result);
    }
  );
});

// --- ROTTE TRATTAMENTI ---
// 🔍 Dati di un singolo cliente
app.get("/api/clienti/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM clienti WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result[0]); // Restituisce un singolo oggetto, non un array
  });
});

app.get("/api/clienti/:id/trattamenti", (req, res) => {
  db.query("SELECT * FROM trattamenti WHERE cliente_id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.post("/api/trattamenti", (req, res) => {
  const { cliente_id, tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  db.query(
    "INSERT INTO trattamenti (cliente_id, tipo_trattamento, descrizione, data_trattamento, note) VALUES (?, ?, ?, ?, ?)",
    [cliente_id, tipo_trattamento, descrizione, data_trattamento, note],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Trattamento aggiunto");
    }
  );
});

app.put("/api/trattamenti/:id", (req, res) => {
  const { id } = req.params;
  const { tipo_trattamento, descrizione, data_trattamento, note } = req.body;
  db.query(
    "UPDATE trattamenti SET tipo_trattamento=?, descrizione=?, data_trattamento=?, note=? WHERE id=?",
    [tipo_trattamento, descrizione, data_trattamento, note, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Trattamento aggiornato");
    }
  );
});
// 🗑️ Elimina trattamento
app.delete("/api/trattamenti/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM trattamenti WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send("Trattamento eliminato");
  });
});


// 🗑️ Elimina cliente
app.delete("/api/clienti/:id", (req, res) => {
  const clienteId = req.params.id;

  // Prima elimini tutti i trattamenti collegati
  db.query("DELETE FROM trattamenti WHERE cliente_id = ?", [clienteId], (err) => {
    if (err) {
      console.error("Errore nell'eliminazione trattamenti:", err);
      return res.status(500).json({ error: "Errore durante l'eliminazione dei trattamenti" });
    }

    // Poi elimini il cliente
    db.query("DELETE FROM clienti WHERE id = ?", [clienteId], (err2, result) => {
      if (err2) {
        console.error("Errore nell'eliminazione cliente:", err2);
        return res.status(500).json({ error: "Errore durante l'eliminazione del cliente" });
      }

      res.send("Cliente eliminato con successo");
    });
  });
});

app.listen(3000, '0.0.0.0', () => {
  console.log("🚀 In ascolto su http://0.0.0.0:3000");
});

