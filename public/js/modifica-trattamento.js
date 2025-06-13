// /js/modifica-trattamento.js

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const trattamentoId = params.get("idTrattamento");
  const clienteId = params.get("idCliente"); // Usiamo questo per tornare indietro

  const form = document.getElementById("form-modifica-trattamento");
  const inputTrattamentoId = document.getElementById("trattamento-id");
  const inputClienteId = document.getElementById("cliente-id");
  const inputTipo = document.getElementById("tipo_trattamento");
  const inputDescrizione = document.getElementById("descrizione");
  const inputData = document.getElementById("data_trattamento");
  const inputNote = document.getElementById("note");

  if (!trattamentoId) {
    alert("ID trattamento non specificato per la modifica!");
    // Potresti reindirizzare o mostrare un messaggio di errore più robusto
    window.location.href = `/scheda-cliente.html?id=${clienteId}`; // Torna indietro alla scheda cliente
    return;
  }

  // Pre-popola i campi nascosti con gli ID
  if (inputTrattamentoId) inputTrattamentoId.value = trattamentoId;
  if (inputClienteId) inputClienteId.value = clienteId;

  // Carica i dati del trattamento esistente per pre-popolare il form
  fetch(`/api/trattamenti/${trattamentoId}`)
    .then(res => {
      if (!res.ok) throw new Error("Trattamento non trovato.");
      return res.json();
    })
    .then(trattamento => {
      if (inputTipo) inputTipo.value = trattamento.tipo_trattamento;
      if (inputDescrizione) inputDescrizione.value = trattamento.descrizione;
      // Formatta la data per l'input di tipo "date" (YYYY-MM-DD)
      if (inputData) inputData.value = new Date(trattamento.data_trattamento).toISOString().split('T')[0];
      if (inputNote) inputNote.value = trattamento.note || "";
    })
    .catch(err => {
      console.error("Errore nel caricamento del trattamento:", err);
      alert("Errore nel caricamento del trattamento da modificare.");
    });

  // Gestisce l'invio del form per aggiornare il trattamento
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const datiAggiornati = {
        tipo_trattamento: inputTipo.value,
        descrizione: inputDescrizione.value,
        data_trattamento: inputData.value,
        note: inputNote.value,
      };

      try {
        const res = await fetch(`/api/trattamenti/${trattamentoId}`, {
          method: "PUT", // Metodo HTTP per l'aggiornamento
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datiAggiornati)
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Errore nell'aggiornamento del trattamento: ${errorText}`);
        }

        alert("Trattamento aggiornato con successo!");
        // Reindirizza alla scheda cliente dopo un aggiornamento riuscito
        window.location.href = `/scheda-cliente.html?id=${clienteId}`;

      } catch (err) {
        console.error("Errore durante l'aggiornamento del trattamento:", err);
        alert("Errore durante l'aggiornamento del trattamento.");
      }
    });
  }
});
