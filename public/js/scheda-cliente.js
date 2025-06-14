// scheda-cliente.js
let clienti = []; // Array per memorizzare i clienti caricati
let indiceClienteCorrente = 0; // Indice del cliente attualmente visualizzato

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const idCliente = params.get("id");

  if (idCliente) {
    // Se è stato passato un ID, prova a caricare quel cliente specifico
    caricaClientePerId(idCliente);
  } else {
    // Altrimenti, carica tutti i clienti e mostra il primo
    caricaTuttiIClienti();
  }

  // Listener per il bottone di eliminazione del cliente
  const btnEliminaCliente = document.getElementById("btnEliminaCliente");
  if (btnEliminaCliente) {
    btnEliminaCliente.addEventListener("click", () => {
      if (confirm("Sei sicuro di voler eliminare questo cliente e tutti i suoi trattamenti?")) {
        eliminaCliente(clienti[indiceClienteCorrente].id);
      }
    });
  }

  // Listener per i bottoni di navigazione
  document.getElementById("btnPrecedente").addEventListener("click", () => navigaClienti(-1));
  document.getElementById("btnSuccessivo").addEventListener("click", () => navigaClienti(1));
});

// Funzione per caricare un cliente specifico per ID
async function caricaClientePerId(id) {
  try {
    const response = await fetch(`/api/clienti/${id}`);
    if (!response.ok) {
      throw new Error("Cliente non trovato.");
    }
    const cliente = await response.json();
    clienti = [cliente]; // Imposta l'array clienti con solo questo cliente
    indiceClienteCorrente = 0; // L'indice è 0 perché c'è solo un cliente
    visualizzaCliente(cliente);
    aggiornaStatoNavigazione();
    caricaTrattamenti(id);
  } catch (error) {
    console.error("Errore nel caricamento del cliente:", error);
    alert("Errore nel caricamento del cliente.");
    // Potresti reindirizzare alla lista clienti se il cliente non esiste
    window.location.href = "/lista-clienti.html";
  }
}

// Funzione per caricare tutti i clienti (usato se nessun ID specifico è passato)
async function caricaTuttiIClienti() {
  try {
    const response = await fetch("/api/clienti");
    if (!response.ok) {
      throw new Error("Impossibile caricare i clienti.");
    }
    clienti = await response.json(); // Carica tutti i clienti
    if (clienti.length > 0) {
      visualizzaCliente(clienti[indiceClienteCorrente]);
      aggiornaStatoNavigazione();
      caricaTrattamenti(clienti[indiceClienteCorrente].id);
    } else {
      document.getElementById("nome-completo").textContent = "Nessun cliente trovato.";
      document.getElementById("email").textContent = "";
      document.getElementById("telefono").textContent = "";
      document.getElementById("lista-trattamenti").innerHTML = "<tr><td colspan='5'>Nessun trattamento.</td></tr>";
      aggiornaStatoNavigazione();
    }
  } catch (error) {
    console.error("Errore nel caricamento di tutti i clienti:", error);
    alert("Errore nel caricamento dei clienti.");
  }
}

// Funzione per visualizzare i dettagli di un cliente
function visualizzaCliente(cliente) {
  document.getElementById("nome-completo").textContent = `${cliente.nome} ${cliente.cognome}`;
  document.getElementById("email").textContent = cliente.email;
  document.getElementById("telefono").textContent = cliente.telefono;
  caricaTrattamenti(cliente.id); // Carica i trattamenti del cliente visualizzato
}

// Funzione per caricare i trattamenti di un cliente specifico
async function caricaTrattamenti(clienteId) {
  try {
    const response = await fetch(`/api/clienti/${clienteId}/trattamenti`);
    if (!response.ok) {
      throw new Error("Impossibile caricare i trattamenti.");
    }
    const trattamenti = await response.json();
    const listaTrattamentiBody = document.getElementById("lista-trattamenti");
    listaTrattamentiBody.innerHTML = ""; // Pulisci la lista esistente

    if (trattamenti.length === 0) {
      listaTrattamentiBody.innerHTML = "<tr><td colspan='5'>Nessun trattamento registrato.</td></tr>";
      return;
    }

    trattamenti.forEach(trattamento => {
      const row = listaTrattamentiBody.insertRow();
      row.insertCell(0).textContent = trattamento.tipo_trattamento;
      row.insertCell(1).textContent = trattamento.descrizione;
      row.insertCell(2).textContent = new Date(trattamento.data_trattamento).toLocaleDateString();
      row.insertCell(3).textContent = trattamento.note;

      const actionCell = row.insertCell(4);
      const eliminaBtn = document.createElement("button");
      eliminaBtn.textContent = "Elimina";
      eliminaBtn.style.backgroundColor = "red";
      eliminaBtn.style.color = "white";
      eliminaBtn.addEventListener("click", () => {
        if (confirm("Sei sicuro di voler eliminare questo trattamento?")) {
          eliminaTrattamento(trattamento.id, clienteId);
        }
      });
      actionCell.appendChild(eliminaBtn);
    });
  } catch (error) {
    console.error("Errore nel caricamento dei trattamenti:", error);
    alert("Errore nel caricamento dei trattamenti.");
  }
}

// Funzione per eliminare un trattamento
async function eliminaTrattamento(trattamentoId, clienteId) {
  try {
    const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Errore durante l'eliminazione del trattamento.");
    }
    alert("Trattamento eliminato con successo!");
    caricaTrattamenti(clienteId); // Ricarica i trattamenti del cliente corrente
  } catch (error) {
    console.error("Errore durante l'eliminazione del trattamento:", error);
    alert("Errore durante l'eliminazione del trattamento.");
  }
}

// Funzione per eliminare un cliente
async function eliminaCliente(clienteId) {
  try {
    const response = await fetch(`/api/clienti/${clienteId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Errore durante l'eliminazione del cliente.");
    }
    alert("Cliente eliminato con successo!");
    window.location.href = "/lista-clienti.html"; // Torna alla lista clienti
  } catch (error) {
    console.error("Errore durante l'eliminazione del cliente:", error);
    alert("Errore durante l'eliminazione del cliente.");
  }
}

// Funzione per navigare tra i clienti (precedente/successivo)
function navigaClienti(direzione) {
  indiceClienteCorrente += direzione;
  if (indiceClienteCorrente < 0) {
    indiceClienteCorrente = 0;
  } else if (indiceClienteCorrente >= clientes.length) {
    indiceClienteCorrente = clientes.length - 1;
  }
  visualizzaCliente(clienti[indiceClienteCorrente]);
  aggiornaStatoNavigazione();
  // Aggiorna l'URL per riflettere il cliente corrente
  history.pushState(null, '', `/scheda-cliente.html?id=${clienti[indiceClienteCorrente].id}`);
}

// Funzione per aggiornare lo stato dei bottoni di navigazione e info paginazione
function aggiornaStatoNavigazione() {
  const btnPrecedente = document.getElementById("btnPrecedente");
  const btnSuccessivo = document.getElementById("btnSuccessivo");
  const infoPaginazione = document.getElementById("info-paginazione");

  if (clienti.length <= 1) {
    btnPrecedente.style.display = "none";
    btnSuccessivo.style.display = "none";
    infoPaginazione.textContent = "";
  } else {
    btnPrecedente.style.display = "inline";
    btnSuccessivo.style.display = "inline";
    btnPrecedente.disabled = indiceClienteCorrente === 0;
    btnSuccessivo.disabled = indiceClienteCorrente === clientes.length - 1;
    infoPaginazione.textContent = `Cliente ${indiceClienteCorrente + 1} di ${clienti.length}`;
  }
}