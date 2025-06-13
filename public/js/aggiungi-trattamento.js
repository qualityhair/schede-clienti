document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-trattamento");
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id"); // Assumiamo che l'ID del cliente sia passato come 'id' nell'URL

  if (!clienteId) {
    // Usa la modale personalizzata invece di alert()
    showCustomModal("ID cliente mancante. Non è possibile aggiungere un trattamento specifico. Verrai reindirizzato alla lista clienti.", 'alert', () => {
      redirectTo("/lista-clienti.html"); // Reindirizza alla lista clienti se l'ID non è presente
    });
    return;
  }

  form.addEventListener("submit", async (e) => { // Aggiunto 'async' qui
    e.preventDefault();

    // I campi del form ora corrispondono agli id/name nell'HTML aggiornato
    const tipo = form.tipo_trattamento.value; // Corretto per il <select>
    const descrizione = form.descrizione.value;
    const data = form.data_trattamento.value;
    const note = form.note.value;

    const trattamento = {
      cliente_id: clienteId,
      tipo_trattamento: tipo,
      descrizione: descrizione,
      data_trattamento: data,
      note: note
    };

    try {
      const response = await fetch(`/api/trattamenti`, { // L'endpoint POST è corretto
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trattamento)
      });

      // Gestione dello status 401 (Non Autorizzato)
      if (response.status === 401) {
        showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
            redirectTo('/'); // Reindirizza alla pagina di login
        });
        return; // Ferma l'esecuzione della funzione
      }

      if (!response.ok) {
        // Se la risposta non è OK, assumiamo che il backend invii un JSON di errore
        const errorData = await response.json();
        throw new Error(errorData.message || "Errore durante il salvataggio del trattamento.");
      }

      // Se la risposta è OK, assumiamo che il backend invii un JSON di successo
      const successData = await response.json(); // Il backend ora risponde con JSON per successo

      showCustomModal(successData.message || "Trattamento aggiunto con successo!", 'success', () => {
        redirectTo(`/scheda-cliente.html?id=${clienteId}`); // Torna alla scheda cliente specifica
      });

    } catch (err) {
      console.error("Errore durante l'aggiunta del trattamento:", err);
      // Mostra il messaggio d'errore catturato o un messaggio generico
      showCustomModal(err.message || "Errore durante l'aggiunta del trattamento. Riprova.", 'error');
    }
  });
});

// Nota: Le funzioni showCustomModal e redirectTo DEVONO essere definite
// nella pagina HTML (aggiungi-trattamento.html) prima che questo script venga eseguito,
// come abbiamo fatto nella modifica precedente.
