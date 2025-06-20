document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti agli elementi DOM esistenti
    const nomeCompletoSpan = document.getElementById("nome-completo");
    const emailSpan = document.getElementById("email");
    const telefonoSpan = document.getElementById("telefono");
    const listaTrattamentiBody = document.getElementById("lista-trattamenti");
    const btnEliminaCliente = document.getElementById("btnEliminaCliente");
    const btnPrecedente = document.getElementById("btnPrecedente");
    const btnSuccessivo = document.getElementById("btnSuccessivo");
    const infoPaginazione = document.getElementById("info-paginazione");

    // Riferimenti ai NUOVI elementi DOM per Note/Preferenze
    const clienteNoteTextarea = document.getElementById("cliente-note");
    const salvaNoteBtn = document.getElementById("salva-note-btn");

    // Riferimenti ai NUOVI elementi DOM per Storico Acquisti
    const aggiungiAcquistoBtn = document.getElementById("aggiungi-acquisto-btn");
    const listaAcquistiBody = document.getElementById("lista-acquisti");
    const modalAggiungiAcquisto = document.getElementById("modalAggiungiAcquisto");
    const formAggiungiAcquisto = document.getElementById("formAggiungiAcquisto");
    const annullaAcquistoBtn = document.getElementById("annulla-acquisto-btn");
    const prodottoAcquistoInput = document.getElementById("prodotto-acquisto");
    const dataAcquistoInput = document.getElementById("data-acquisto");
    const prezzoAcquistoInput = document.getElementById("prezzo-acquisto");
    const quantitaAcquistoInput = document.getElementById("quantita-acquisto");
    const noteAcquistoTextarea = document.getElementById("note-acquisto");

    // --- NUOVI Riferimenti per Modale Aggiungi Trattamento ---
    const aggiungiTrattamentoBtn = document.getElementById("aggiungiTrattamentoBtn"); // Assicurati che questo ID sia sul bottone HTML
    const modalAggiungiTrattamento = document.getElementById("addTrattamentoModal"); // ID della modale creata prima
    const formAddTrattamento = document.getElementById("formAddTrattamento"); // ID del form nella modale
    const cancelTrattamentoBtn = document.getElementById("cancelTrattamentoBtn"); // ID del bottone Annulla nella modale

    // Campi input specifici della modale trattamento
    const tipoTrattamentoInput = document.getElementById('tipoTrattamento');
    const dataTrattamentoInput = document.getElementById('dataTrattamento');
    // RIMOSSO: const prezzoTrattamentoInput = document.getElementById('prezzoTrattamento'); // Questo campo non c'è più nell'HTML
    const descrizioneTrattamentoInput = document.getElementById('descrizioneTrattamento'); // CORRETTO ID: da 'dettagliTrattamento' a 'descrizioneTrattamento'
    // Considera di aggiungere qui un riferimento per le note se hai un campo note separato nell'HTML della modale
    const noteTrattamentoInput = null; // Impostato a null per ora, da verificare se serve un campo note separato.


    let currentClientId = null;
    let searchResultsIds = []; // Per la paginazione dei risultati di ricerca
    let currentIndex = 0; // Indice corrente nei risultati di ricerca

    // Funzione per mostrare un messaggio temporaneo
    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.padding = '10px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.color = '#1a1a1a';

        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.borderColor = '#28a745';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.borderColor = '#dc3545';
        } else {
            messageDiv.style.backgroundColor = '#fff3cd';
            messageDiv.style.borderColor = '#ffc107';
        }
        messageDiv.style.border = '1px solid';
        messageDiv.style.textAlign = 'center';

        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '50%';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translate(-50%, -50%)';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.minWidth = '280px';
        messageDiv.style.maxWidth = '90%';
        messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';

        document.body.insertBefore(messageDiv, document.body.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Funzioni per aprire/chiudere modali (GENERICHE)
    function openModal(modalElement) {
        modalElement.classList.add('open');
    }

    function closeModal(modalElement, formToReset = null) {
        modalElement.classList.remove('open');
        if (formToReset) {
            formToReset.reset();
        }
    }

    // --- Gestione generica delle risposte API ---
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");

        if (response.status === 401) {
            showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            return null;
        } else if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Se la risposta non è JSON ma è 200 OK (es. no content per delete)
            if (response.ok) {
                return {}; // Restituisci un oggetto vuoto se non c'è contenuto JSON ma l'operazione è riuscita
            }
            // Altrimenti, è un errore non JSON o un problema generico
            showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
            return null;
        }
    }

    // --- Funzione per caricare i dati del cliente ---
    async function loadClientData(clientId) {
        if (!clientId) {
            showMessage("ID Cliente non fornito nell'URL.", 'error');
            return;
        }
        try {
            const response = await fetch(`/api/clienti/${clientId}`);
            const data = await handleApiResponse(response);

            if (data === null) {
                // handleApiResponse ha già gestito l'errore o il reindirizzamento
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || "Errore nel caricamento dei dati del cliente.");
            }

            // Popola i campi del cliente
            const client = data.client;
            if (client) {
                nomeCompletoSpan.textContent = `${client.nome} ${client.cognome}`;
                emailSpan.textContent = client.email || "N/A";
                telefonoSpan.textContent = client.telefono || "N/A";

                // Popola le Note/Preferenze
                clienteNoteTextarea.value = client.preferenze_note || '';

                // Popola lo Storico Acquisti
                displayAcquisti(client.storico_acquisti);
            } else {
                showMessage("Cliente non trovato.", 'error');
            }

            // Popola la lista trattamenti
            const trattamenti = data.trattamenti || [];
            displayTrattamenti(trattamenti);

        } catch (error) {
            console.error("Errore nel caricamento dei dati del cliente:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    // --- Funzione per visualizzare i trattamenti ---
    function displayTrattamenti(trattamenti) {
        listaTrattamentiBody.innerHTML = ''; // Pulisce la lista esistente
        if (trattamenti.length === 0) {
            listaTrattamentiBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nessun trattamento registrato per questo cliente.</td></tr>';
            return;
        }

        trattamenti.forEach(trattamento => {
            const row = listaTrattamentiBody.insertRow();
            row.insertCell().textContent = trattamento.tipo;
            row.insertCell().textContent = trattamento.descrizione;
            row.insertCell().textContent = new Date(trattamento.data_trattamento).toLocaleDateString('it-IT');
            row.insertCell().textContent = trattamento.note || "N/A";

            const actionCell = row.insertCell();
            const editButton = document.createElement("button");
            editButton.textContent = "✏️ Modifica";
            editButton.className = "btn btn-edit";
            editButton.onclick = () => {
                window.location.href = `/modifica-trattamento.html?id=${trattamento.id}&clientId=${currentClientId}`;
            };
            actionCell.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Elimina";
            deleteButton.className = "btn btn-delete";
            deleteButton.style.marginLeft = "5px";
            deleteButton.onclick = () => confirmDeleteTrattamento(trattamento.id);
            actionCell.appendChild(deleteButton);
        });
    }

    // --- Funzione per visualizzare gli acquisti ---
    function displayAcquisti(acquistiString) {
        listaAcquistiBody.innerHTML = ''; // Pulisce la lista esistente
        let acquisti = [];
        try {
            // Tenta di parsare la stringa JSON. Se fallisce, assume che sia testo o vuota.
            acquisti = acquistiString ? JSON.parse(acquistiString) : [];
        } catch (e) {
            console.error("Errore nel parsing dello storico acquisti JSON:", e);
            // Se il JSON è malformato, inizializza come array vuoto
            acquisti = [];
        }


        if (acquisti.length === 0) {
            listaAcquistiBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nessun acquisto registrato per questo cliente.</td></tr>';
            return;
        }

        acquisti.forEach((acquisto, index) => {
            const row = listaAcquistiBody.insertRow();
            row.insertCell().textContent = acquisto.prodotto;
            row.insertCell().textContent = new Date(acquisto.data).toLocaleDateString('it-IT');
            row.insertCell().textContent = `${acquisto.prezzo.toFixed(2)} €`;
            row.insertCell().textContent = acquisto.quantita;
            row.insertCell().textContent = acquisto.note || "N/A";

            const actionCell = row.insertCell();
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Elimina";
            deleteButton.className = "btn btn-delete";
            deleteButton.style.marginLeft = "5px";
            deleteButton.onclick = () => confirmDeleteAcquisto(index); // Passa l'indice dell'acquisto
            actionCell.appendChild(deleteButton);
        });
    }

    // --- Funzioni di salvataggio/eliminazione ---

    async function confirmDeleteTrattamento(trattamentoId) {
        if (confirm("Sei sicuro di voler eliminare questo trattamento?")) {
            try {
                const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                    method: 'DELETE',
                });
                const data = await handleApiResponse(response);

                if (data === null) return;

                if (!response.ok) {
                    throw new Error(data.error || "Errore durante l'eliminazione del trattamento.");
                }
                showMessage("Trattamento eliminato con successo!", 'success');
                loadClientData(currentClientId); // Ricarica i dati del cliente per aggiornare la lista
            } catch (error) {
                console.error("Errore eliminazione trattamento:", error);
                showMessage(`Errore: ${error.message}`, 'error');
            }
        }
    }

    async function confirmDeleteClient() {
        if (confirm(`Sei sicuro di voler eliminare il cliente ${nomeCompletoSpan.textContent}? Questa azione è irreversibile e cancellerà anche tutti i trattamenti associati.`)) {
            try {
                const response = await fetch(`/api/clienti/${currentClientId}`, {
                    method: 'DELETE',
                });
                const data = await handleApiResponse(response);

                if (data === null) return;

                if (!response.ok) {
                    throw new Error(data.error || "Errore durante l'eliminazione del cliente.");
                }
                showMessage("Cliente eliminato con successo! Reindirizzamento alla dashboard...", 'success');
                setTimeout(() => {
                    window.location.href = "/dashboard.html";
                }, 1500);
            } catch (error) {
                console.error("Errore eliminazione cliente:", error);
                showMessage(`Errore: ${error.message}`, 'error');
            }
        }
    }

    async function handleSalvaNote() {
        const note = clienteNoteTextarea.value.trim();
        try {
            const response = await fetch(`/api/clienti/${currentClientId}/note`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferenze_note: note })
            });
            const data = await handleApiResponse(response);

            if (data === null) return;

            if (!response.ok) {
                throw new Error(data.error || "Errore nel salvataggio delle note.");
            }
            showMessage("Note salvate con successo!", 'success');
        } catch (error) {
            console.error("Errore salvataggio note:", error);
            showMessage(`Errore nel salvataggio delle note: ${error.message}`, 'error');
        }
    }

    async function handleAddAcquisto(event) {
        event.preventDefault(); // Impedisce il ricaricamento della pagina
        const prodotto = prodottoAcquistoInput.value.trim();
        const data = dataAcquistoInput.value;
        const prezzo = parseFloat(prezzoAcquistoInput.value);
        const quantita = parseInt(quantitaAcquistoInput.value);
        const note = noteAcquistoTextarea.value.trim();

        if (!prodotto || !data || isNaN(prezzo) || isNaN(quantita) || prezzo < 0 || quantita < 1) {
            showMessage("Per favore, compila tutti i campi obbligatori (Prodotto, Data, Prezzo, Quantità) con valori validi.", 'error');
            return;
        }

        const nuovoAcquisto = { prodotto, data, prezzo, quantita, note };

        try {
            // Carica i dati attuali del cliente per ottenere lo storico acquisti corrente
            const clientResponse = await fetch(`/api/clienti/${currentClientId}`);
            const clientData = await handleApiResponse(clientResponse);
            if (clientData === null || !clientResponse.ok || !clientData.client) {
                throw new Error(clientData ? (clientData.error || "Errore nel recupero dati cliente per acquisto.") : "Errore sconosciuto nel recupero dati cliente.");
            }

            let storicoAcquisti = [];
            try {
                storicoAcquisti = clientData.client.storico_acquisti ? JSON.parse(clientData.client.storico_acquisti) : [];
            } catch (e) {
                console.error("Errore nel parsing dello storico acquisti esistente:", e);
                // In caso di errore parsing, riparti da zero per non bloccare
                storicoAcquisti = [];
            }

            storicoAcquisti.push(nuovoAcquisto);

            // Invia lo storico acquisti aggiornato al server
            const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storico_acquisti: JSON.stringify(storicoAcquisti) }) // Stringifica l'array JSON
            });
            const dataResponse = await handleApiResponse(response);

            if (dataResponse === null) return;

            if (!response.ok) {
                throw new Error(dataResponse.error || "Errore nell'aggiunta dell'acquisto.");
            }

            showMessage("Acquisto aggiunto con successo!", 'success');
            closeModal(modalAggiungiAcquisto, formAggiungiAcquisto); // Usa la funzione generica
            loadClientData(currentClientId); // Ricarica i dati per aggiornare la lista acquisti
        } catch (error) {
            console.error("Errore aggiunta acquisto:", error);
            showMessage(`Errore nell'aggiunta dell'acquisto: ${error.message}`, 'error');
        }
    }

    // --- NUOVA FUNZIONE: Gestione dell'aggiunta Trattamento tramite Modale ---
    async function handleAddTrattamento(event) {
        event.preventDefault(); // Impedisce il ricaricamento della pagina

        const tipo = tipoTrattamentoInput.value.trim();
        const data_trattamento = dataTrattamentoInput.value;
        const descrizione = descrizioneTrattamentoInput.value.trim(); // Usa il nuovo riferimento
        const note = (noteTrattamentoInput ? noteTrattamentoInput.value.trim() : ""); // Gestisce se c'è un campo note separato o no

        // Validazione aggiornata (senza prezzo)
        if (!tipo || !data_trattamento) {
            showMessage("Per favore, compila tutti i campi obbligatori (Tipo, Data).", 'error');
            return;
        }

        try {
            const response = await fetch(`/api/trattamenti`, { // Endpoint POST per aggiungere un trattamento
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_cliente: currentClientId, // Assicurati di passare l'ID del cliente
                    tipo,
                    data_trattamento,
                    descrizione,
                    // RIMOSSO: prezzo, // Non c'è più il campo prezzo
                    note // Invia le note (anche se vuote se non c'è un campo dedicato)
                })
            });
            const data = await handleApiResponse(response);

            if (data === null) return;

            if (!response.ok) {
                throw new Error(data.error || "Errore nell'aggiunta del trattamento.");
            }

            showMessage("Trattamento aggiunto con successo!", 'success');
            closeModal(modalAggiungiTrattamento, formAddTrattamento); // Chiude e resetta la modale
            loadClientData(currentClientId); // Ricarica i dati per aggiornare la lista trattamenti
        } catch (error) {
            console.error("Errore aggiunta trattamento:", error);
            showMessage(`Errore nell'aggiunta del trattamento: ${error.message}`, 'error');
        }
    }

    async function confirmDeleteAcquisto(indexToDelete) {
        if (confirm("Sei sicuro di voler eliminare questo acquisto?")) {
            try {
                // Recupera lo storico acquisti attuale
                const clientResponse = await fetch(`/api/clienti/${currentClientId}`);
                const clientData = await handleApiResponse(clientResponse);
                if (clientData === null || !clientResponse.ok || !clientData.client) {
                    throw new Error(clientData ? (clientData.error || "Errore nel recupero dati cliente per eliminazione acquisto.") : "Errore sconosciuto nel recupero dati cliente.");
                }

                let storicoAcquisti = [];
                try {
                    storicoAcquisti = clientData.client.storico_acquisti ? JSON.parse(clientData.client.storico_acquisti) : [];
                } catch (e) {
                    console.error("Errore nel parsing dello storico acquisti esistente per eliminazione:", e);
                    showMessage("Errore: Impossibile eliminare l'acquisto. Dati storici malformati.", 'error');
                    return;
                }

                if (indexToDelete >= 0 && indexToDelete < storicoAcquisti.length) {
                    storicoAcquisti.splice(indexToDelete, 1); // Rimuovi l'elemento all'indice specificato

                    // Invia lo storico acquisti aggiornato al server
                    const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ storico_acquisti: JSON.stringify(storicoAcquisti) })
                    });
                    const dataResponse = await handleApiResponse(response);

                    if (dataResponse === null) return;

                    if (!response.ok) {
                        throw new Error(dataResponse.error || "Errore nell'eliminazione dell'acquisto.");
                    }
                    showMessage("Acquisto eliminato con successo!", 'success');
                    loadClientData(currentClientId); // Ricarica i dati per aggiornare la lista
                } else {
                    showMessage("Errore: Indice acquisto non valido.", 'error');
                }

            } catch (error) {
                console.error("Errore eliminazione acquisto:", error);
                showMessage(`Errore nell'eliminazione dell'acquisto: ${error.message}`, 'error');
            }
        }
    }

    // --- Gestione della paginazione (esistente) ---
    function updatePaginationButtons() {
        if (searchResultsIds.length > 1) {
            btnPrecedente.style.display = 'inline-block';
            btnSuccessivo.style.display = 'inline-block';
            infoPaginazione.textContent = `Cliente ${currentIndex + 1} di ${searchResultsIds.length}`;
            btnPrecedente.disabled = currentIndex === 0;
            btnSuccessivo.disabled = currentIndex === searchResultsIds.length - 1;
        } else {
            btnPrecedente.style.display = 'none';
            btnSuccessivo.style.display = 'none';
            infoPaginazione.textContent = '';
        }
    }

    function navigateClient(direction) {
        if (direction === 'prev' && currentIndex > 0) {
            currentIndex--;
        } else if (direction === 'next' && currentIndex < searchResultsIds.length - 1) {
            currentIndex++;
        }
        const newClientId = searchResultsIds[currentIndex];
        window.history.pushState({ clientId: newClientId, searchResultsIds, currentIndex }, '', `/scheda-cliente.html?id=${newClientId}&search_results=${encodeURIComponent(JSON.stringify(searchResultsIds))}&current_index=${currentIndex}`);
        currentClientId = newClientId; // Aggiorna l'ID cliente corrente
        loadClientData(currentClientId);
        updatePaginationButtons();
    }

    // --- Inizializzazione della pagina ---
    function initializePage() {
        const params = new URLSearchParams(window.location.search);
        currentClientId = params.get("id");

        const searchResultsParam = params.get("search_results");
        if (searchResultsParam) {
            try {
                searchResultsIds = JSON.parse(decodeURIComponent(searchResultsParam));
                currentIndex = parseInt(params.get("current_index") || '0');
                if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= searchResultsIds.length) {
                    currentIndex = 0; // Fallback se l'indice non è valido
                }
            } catch (e) {
                console.error("Errore nel parsing dei search_results:", e);
                searchResultsIds = [currentClientId]; // Fallback al solo cliente corrente
                currentIndex = 0;
            }
        } else {
            searchResultsIds = [currentClientId]; // Nessun risultato di ricerca, solo il cliente corrente
            currentIndex = 0;
        }

        loadClientData(currentClientId);
        updatePaginationButtons();
    }

    // --- Event Listeners ---
    btnEliminaCliente.addEventListener("click", confirmDeleteClient);
    salvaNoteBtn.addEventListener("click", handleSalvaNote);

    // Event listener per la modale "Aggiungi Acquisto"
    if (aggiungiAcquistoBtn) {
        aggiungiAcquistoBtn.addEventListener("click", () => {
            openModal(modalAggiungiAcquisto);
            dataAcquistoInput.valueAsDate = new Date(); // Imposta la data di oggi come default
        });
    }
    if (annullaAcquistoBtn) {
        annullaAcquistoBtn.addEventListener("click", () => {
            closeModal(modalAggiungiAcquisto, formAggiungiAcquisto);
        });
    }
    if (formAggiungiAcquisto) {
        formAggiungiAcquisto.addEventListener("submit", handleAddAcquisto);
    }

    // --- NUOVI Event Listeners per la modale "Aggiungi Trattamento" ---
    if (aggiungiTrattamentoBtn) {
        aggiungiTrattamentoBtn.addEventListener("click", () => {
            openModal(modalAggiungiTrattamento);
            dataTrattamentoInput.valueAsDate = new Date(); // Imposta la data di oggi come default
        });
    }
    if (cancelTrattamentoBtn) {
        cancelTrattamentoBtn.addEventListener("click", () => {
            closeModal(modalAggiungiTrattamento, formAddTrattamento);
        });
    }
    if (formAddTrattamento) {
        formAddTrattamento.addEventListener("submit", handleAddTrattamento);
    }


    // Event listeners per la paginazione
    btnPrecedente.addEventListener("click", () => navigateClient('prev'));
    btnSuccessivo.addEventListener("click", () => navigateClient('next'));

    // Inizializza la pagina al caricamento
    initializePage();
});
