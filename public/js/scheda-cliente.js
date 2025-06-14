if (!localStorage.getItem("risultatiRicercaClienti")) {
  localStorage.removeItem("indiceClienteCorrente");
}


// Estrai ID cliente dall'URL
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

// Carica dati cliente e trattamenti
if (clienteId) {
  fetch(`/api/clienti/${clienteId}`)
    .then(res => {
      if (!res.ok) throw new Error("Cliente non trovato");
      return res.json();
    })
    .then(cliente => mostraCliente(cliente))
    .catch(err => console.error("Errore caricamento cliente:", err));

  caricaTrattamenti(clienteId);
}

// Mostra i dati del cliente
function mostraCliente(cliente) {
  const nomeEl = document.getElementById("nome-completo");
  if (nomeEl) nomeEl.innerText = `${cliente.nome} ${cliente.cognome}`;

  const emailEl = document.getElementById("email");
  if (emailEl) emailEl.innerText = cliente.email;

  const telefonoEl = document.getElementById("telefono");
  if (telefonoEl) telefonoEl.innerText = cliente.telefono;

  // Se esiste il form di modifica, precompila i campi
  const inputNome = document.getElementById("modifica-nome");
  if (inputNome) inputNome.value = cliente.nome;

  const inputCognome = document.getElementById("modifica-cognome");
  if (inputCognome) inputCognome.value = cliente.cognome;

  const inputEmail = document.getElementById("modifica-email");
  if (inputEmail) inputEmail.value = cliente.email;

  const inputTelefono = document.getElementById("modifica-telefono");
  if (inputTelefono) inputTelefono.value = cliente.telefono;

  const form = document.getElementById("form-trattamento");
  if (form) form.dataset.clienteId = cliente.id;
}

const lista = JSON.parse(localStorage.getItem("risultatiRicercaClienti") || "[]");
const indice = parseInt(localStorage.getItem("indiceClienteCorrente") || "0");
const info = document.getElementById("info-paginazione");

if (info) {
  info.innerText = `Cliente ${indice + 1} di ${lista.length}`;
}



// Carica la lista trattamenti
function caricaTrattamenti(clienteId) {
  fetch(`/api/clienti/${clienteId}/trattamenti`)
    .then(res => res.json())
    .then(trattamenti => {
      const container = document.getElementById("lista-trattamenti");
      if (!container) return;

      container.innerHTML = "";
      trattamenti.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${t.tipo_trattamento}</td>
          <td>${t.descrizione}</td>
          <td>${new Date(t.data_trattamento).toLocaleDateString()}</td>
          <td>${t.note || ""}</td>
          <td>
            <button onclick="eliminaTrattamento(${t.id}, ${clienteId})">Elimina</button>
          </td>
        `;
        container.appendChild(row);
      });
    })
    .catch(err => console.error("Errore caricamento trattamenti:", err));
}

// Elimina trattamento
function eliminaTrattamento(id, clienteId) {
  if (confirm("Sei sicuro di voler eliminare questo trattamento?")) {
    fetch(`/api/trattamenti/${id}`, {
      method: "DELETE"
    })
      .then(res => res.text())
      .then(() => caricaTrattamenti(clienteId));
  }
}

// Aggiunta trattamento
const form = document.getElementById("form-trattamento");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const cliente_id = form.dataset.clienteId;
    const tipo_trattamento = form.tipo_trattamento.value;
    const descrizione = form.descrizione.value;
    const data_trattamento = form.data_trattamento.value;
    const note = form.note.value;

    fetch('/api/trattamenti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente_id, tipo_trattamento, descrizione, data_trattamento, note })
    })
      .then(res => res.text())
      .then(() => {
        caricaTrattamenti(cliente_id);
        form.reset();
      })
      .catch(err => {
        console.error("Errore:", err);
      });
  });
}

// Eliminazione cliente
const btnElimina = document.getElementById("btnEliminaCliente");
if (btnElimina) {
  btnElimina.addEventListener("click", () => {
    if (!clienteId) return;

    const conferma = confirm("Sei sicuro di voler eliminare questo cliente? L'azione è irreversibile.");
    if (!conferma) return;

    fetch(`/api/clienti/${clienteId}`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) throw new Error("Errore nell'eliminazione");
        alert("Cliente eliminato con successo");
        window.location.href = "/dashboard.html";
      })
      .catch(err => {
        console.error("Errore durante l'eliminazione del cliente:", err);
        alert("Errore durante l'eliminazione");
      });
  });
}

// Modifica cliente
const formModifica = document.getElementById("form-modifica-cliente");
if (formModifica) {
  formModifica.addEventListener("submit", (e) => {
    e.preventDefault();

    const datiAggiornati = {
      nome: document.getElementById("modifica-nome").value,
      cognome: document.getElementById("modifica-cognome").value,
      email: document.getElementById("modifica-email").value,
      telefono: document.getElementById("modifica-telefono").value,
    };

    fetch(`/api/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datiAggiornati)
    })
      .then(res => {
        if (!res.ok) throw new Error("Errore aggiornamento cliente");
        alert("Cliente aggiornato con successo");
        window.location.reload();
      })
      .catch(err => {
        console.error("Errore aggiornamento:", err);
        alert("Errore durante l'aggiornamento del cliente");
      });
  });
}



document.getElementById("btnPrecedente").addEventListener("click", () => cambiaCliente(-1));
document.getElementById("btnSuccessivo").addEventListener("click", () => cambiaCliente(1));

function cambiaCliente(direzione) {
  const lista = JSON.parse(localStorage.getItem("risultatiRicercaClienti")) || [];
  let indice = parseInt(localStorage.getItem("indiceClienteCorrente") || "0");

  indice += direzione;

  if (indice >= 0 && indice < lista.length) {
    localStorage.setItem("indiceClienteCorrente", indice.toString());
    window.location.href = `/scheda-cliente.html?id=${lista[indice]}`;
  }
}