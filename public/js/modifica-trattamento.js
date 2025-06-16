document.addEventListener("DOMContentLoaded", () => {
    // Estrai ID trattamento dall'URL
    const params = new URLSearchParams(window.location.search);
    const trattamentoId = params.get("id");

    let clienteIdAssociato = null; // Variabile per memorizzare l'ID del cliente associato

    // Se non c'è un ID trattamento, reindirizza o mostra un errore
    if (!trattamentoId) {
        console.error("ID Trattamento non trovato nell'URL.");
        alert("ID Trattamento mancante. Impossibile modificare.");
        window.location.href = "/dashboard.html"; // O qualsiasi pagina di fallback
        return;
    }

    const formModificaTrattamento = document.getElementById("form-modifica-trattamento");
    const inputTipo = document.getElementById("modifica-tipo-trattamento");
    const inputDescrizione = document.getElementById("modifica-descrizione");
    const inputData = document.getElementById("modifica-data-trattamento");
    const inputNote = document.getElementById("modifica-note");
    const backToClientLink = document.getElementById("back-to-client-link");

    // 1. Carica i dati del trattamento esistente per precompilare il form
    fetch(`/api/trattamenti/${trattamentoId}`)
        .then(res => {
            if (!res.ok) throw new Error("Trattamento non trovato");
            return res.json();
        })
        .then(trattamento => {
            if (inputTipo) inputTipo.value = trattamento.tipo_trattamento || "";
            if (inputDescrizione) inputDescrizione.value = trattamento.descrizione || "";
            // Formatta la data per l'input type="date" (YYYY-MM-DD)
            if (inputData) {
                const data = new Date(trattamento.data_trattamento);
                inputData.value = data.toISOString().split('T')[0];
            }
            if (inputNote) inputNote.value = trattamento.note || "";

            // Salva l'ID del cliente per il link di ritorno
            clienteIdAssociato = trattamento.cliente_id;
            if (backToClientLink && clienteIdAssociato) {
                backToClientLink.href = `/scheda-cliente.html?id=${clienteIdAssociato}`;
            }
        })
        .catch(err => {
            console.error("Errore durante il caricamento del trattamento:", err);
            alert("Impossibile caricare i dati del trattamento.");
        });

    // 2. Gestisci l'invio del form di modifica
    if (formModificaTrattamento) {
        formModificaTrattamento.addEventListener("submit", (e) => {
            e.preventDefault();

            const datiAggiornati = {
                tipo_trattamento: inputTipo.value,
                descrizione: inputDescrizione.value,
                data_trattamento: inputData.value,
                note: inputNote.value,
                // Assicurati di includere l'ID del cliente associato se il backend lo richiede nel PUT
                // Questo dipende dalla tua API PUT /api/trattamenti/:id
                cliente_id: clienteIdAssociato // Potrebbe essere necessario o meno a seconda dell'API
            };

            fetch(`/api/trattamenti/${trattamentoId}`, {
                method: "PUT", // O PATCH, a seconda di come è implementata la tua API
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datiAggiornati)
            })
            .then(res => {
                if (!res.ok) throw new Error(`Errore HTTP: ${res.status}`);
                return res.json(); // O res.text() se la tua API PUT non restituisce JSON
            })
            .then(() => {
                alert("Trattamento aggiornato con successo!");
                // Reindirizza alla scheda cliente o a una pagina di conferma
                if (clienteIdAssociato) {
                    window.location.href = `/scheda-cliente.html?id=${clienteIdAssociato}`;
                } else {
                    window.location.href = "/dashboard.html"; // Fallback
                }
            })
            .catch(err => {
                console.error("Errore durante l'aggiornamento del trattamento:", err);
                alert("Errore durante l'aggiornamento del trattamento: " + err.message);
            });
        });
    }
});
