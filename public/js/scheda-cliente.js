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

    // --- NUOVI Riferimenti per Modale Aggiungi Trattamento (CORRETTI CON GLI ID DEL TUO HTML) ---
    const aggiungiTrattamentoBtn = document.getElementById("aggiungiTrattamentoBtn");
    const modalAggiungiTrattamento = document.getElementById("addTrattamentoModal");
    const formAddTrattamento = document.getElementById("formAddTrattamento");
    const cancelTrattamentoBtn = document.getElementById("cancelTrattamentoBtn");

    // Campi input specifici della modale trattamento (AGGIORNATI CON ID COERENTI AL TUO HTML)
    const tipoTrattamentoInput = document.getElementById('tipoTrattamento');
    const dataTrattamentoInput = document.getElementById('dataTrattamento');
    const descrizioneTrattamentoInput = document.getElementById('descrizioneTrattamento');
    const noteTrattamentoInput = document.getElementById('noteTrattamento');
    // ********************

    // --- NUOVI Riferimenti per Modale Modifica Cliente ---
    const modificaDettagliBtn = document.getElementById("modificaDettagliBtn"); // Il bottone nella scheda cliente
    const modificaClienteModal = document.getElementById('modificaClienteModal');
    const formModificaCliente = document.getElementById('formModificaCliente');
    const modificaClienteIdInput = document.getElementById('modifica-cliente-id');
    const modificaNomeInput = document.getElementById('modifica-nome');
    const modificaCognomeInput = document.getElementById('modifica-cognome');
    const modificaEmailInput = document.getElementById('modifica-email');
    const modificaTelefonoInput = document.getElementById('modifica-telefono');
    const annullaModificaClienteBtn = document.getElementById('annullaModificaClienteBtn');
    // ********************


    let currentClientId = null;
    let searchResultsIds = []; // Per la paginazione dei risultati di ricerca
    let currentIndex = 0; // Indice corrente nei risultati di ricerca
    let currentClienteData = null; // Variabile per memorizzare i dati del cliente corrente

    // Funzione per mostrare un messaggio temporaneo (modificata per callback)
    function showMessage(message, type = 'info', onCloseCallback = null) {
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
            if (onCloseCallback) {
                onCloseCallback();
            }
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

    // --- Gestione generica delle risposte API (modificata per callback) ---
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");

        if (response.status === 401) {
            showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error', () => {
                window.location.href = '/';
            });
            return null;
        } else if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Se la risposta non è JSON ma è 200 OK (es. no content per delete)
            if (response.ok) {
                return {}; // Restituisci un oggetto vuoto se non c'è contenuto JSON ma l'operazione è riuscita
            }
            // Altrimenti, è un errore non JSON o un problema generico
            showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error', () => {
                window.location.href = '/';
            });
            return null;
        }
    }

    // --- Funzione per caricare i dati del cliente ---
    async function loadClientData(clientId) {
        if (!clientId) {
            showMessage("ID Cliente non fornito nell'URL. Ricarica la pagina da un cliente valido.", 'error');
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

            // Popola i campi del cliente e salva i dati nella variabile globale
            const client = data.client;
            if (client) {
                currentClienteData = client; // Salva i dati completi del cliente
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
            // *** MODIFICATO QUI: Ora usa 'tipo_trattamento' ***
            row.insertCell().textContent = trattamento.tipo_trattamento;
            // ********************
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
        if (typeof showCustomModal !== 'function') {
            console.warn('showCustomModal non è definita. Usando confirm() di fallback.');
            if (!confirm("Sei sicuro di voler eliminare questo trattamento?")) {
                return;
            }
        } else {
            showCustomModal("Sei sicuro di voler eliminare questo trattamento?", 'confirm', async (confirmed) => {
                if (!confirmed) return;

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
            });
            return;
        }

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
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore eliminazione trattamento:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }


    async function confirmDeleteClient() {
        if (typeof showCustomModal !== 'function') {
            console.warn('showCustomModal non è definita. Usando confirm() di fallback.');
            if (!confirm(`Sei sicuro di voler eliminare il cliente ${nomeCompletoSpan.textContent}? Questa azione è irreversibile e cancellerà anche tutti i trattamenti associati.`)) {
                return;
            }
        } else {
            showCustomModal(`Sei sicuro di voler eliminare il cliente ${nomeCompletoSpan.textContent}? Questa azione è irreversibile e cancellerà anche tutti i trattamenti associati.`, 'confirm', async (confirmed) => {
                if (!confirmed) return;

                try {
                    const response = await fetch(`/api/clienti/${currentClientId}`, {
                        method: 'DELETE',
                    });
                    const data = await handleApiResponse(response);

                    if (data === null) return;

                    if (!response.ok) {
                        throw new Error(data.error || "Errore durante l'eliminazione del cliente.");
                    }
                    showMessage("Cliente eliminato con successo! Reindirizzamento alla dashboard...", 'success', () => {
                        window.location.href = "/dashboard.html";
                    });
                } catch (error) {
                    console.error("Errore eliminazione cliente:", error);
                    showMessage(`Errore: ${error.message}`, 'error');
                }
            });
            return;
        }

        try {
            const response = await fetch(`/api/clienti/${currentClientId}`, {
                method: 'DELETE',
            });
            const data = await handleApiResponse(response);

            if (data === null) return;

            if (!response.ok) {
                throw new Error(data.error || "Errore durante l'eliminazione del cliente.");
            }
            showMessage("Cliente eliminato con successo! Reindirizzamento alla dashboard...", 'success', () => {
                window.location.href = "/dashboard.html";
            });
        } catch (error) {
            console.error("Errore eliminazione cliente:", error);
            showMessage(`Errore: ${error.message}`, 'error');
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
        event.preventDefault();
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
                storicoAcquisti = [];
            }

            storicoAcquisti.push(nuovoAcquisto);

            const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storico_acquisti: JSON.stringify(storicoAcquisti) })
            });
            const dataResponse = await handleApiResponse(response);

            if (dataResponse === null) return;

            if (!response.ok) {
                throw new Error(dataResponse.error || "Errore nell'aggiunta dell'acquisto.");
            }

            showMessage("Acquisto aggiunto con successo!", 'success');
            closeModal(modalAggiungiAcquisto, formAggiungiAcquisto);
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore aggiunta acquisto:", error);
            showMessage(`Errore nell'aggiunta dell'acquisto: ${error.message}`, 'error');
        }
    }

    // --- NUOVA FUNZIONE: Gestione dell'aggiunta Trattamento tramite Modale ---
    async function handleAddTrattamento(event) {
        event.preventDefault();

        if (!currentClientId) {
            showMessage("Impossibile aggiungere il trattamento: ID cliente mancante. Ricarica la pagina da un cliente valido.", 'error');
            return;
        }

        // *** MODIFICATO QUI: Usiamo le variabili con gli ID corretti e il nome coerente ***
        const tipo_trattamento = tipoTrattamentoInput.value.trim(); // <-- MODIFICATO
        const data_trattamento = dataTrattamentoInput.value;
        const descrizione = descrizioneTrattamentoInput.value.trim();
        const note = noteTrattamentoInput.value.trim();
        // ********************

        if (!tipo_trattamento || !data_trattamento) { // <-- MODIFICATO
            showMessage("Per favore, compila tutti i campi obbligatori (Tipo, Data).", 'error');
            return;
        }

        try {
            const response = await fetch(`/api/trattamenti`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_id: currentClientId,
                    tipo_trattamento, // <-- MODIFICATO: ora è tipo_trattamento
                    data_trattamento,
                    descrizione,
                    note
                })
            });
            const data = await handleApiResponse(response);

            if (data === null) return;

            if (!response.ok) {
                throw new Error(data.error || "Errore nell'aggiunta del trattamento.");
            }

            showMessage("Trattamento aggiunto con successo!", 'success');
            closeModal(modalAggiungiTrattamento, formAddTrattamento);
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore aggiunta trattamento:", error);
            showMessage(`Errore nell'aggiunta del trattamento: ${error.message}`, 'error');
        }
    }

    async function confirmDeleteAcquisto(indexToDelete) {
        if (typeof showCustomModal !== 'function') {
            console.warn('showCustomModal non è definita. Usando confirm() di fallback.');
            if (!confirm("Sei sicuro di voler eliminare questo acquisto?")) {
                return;
            }
        } else {
            showCustomModal("Sei sicuro di voler eliminare questo acquisto?", 'confirm', async (confirmed) => {
                if (!confirmed) return;

                try {
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
                        storicoAcquisti.splice(indexToDelete, 1);

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
                        loadClientData(currentClientId);
                    } else {
                        showMessage("Errore: Indice acquisto non valido.", 'error');
                    }

                } catch (error) {
                    console.error("Errore eliminazione acquisto:", error);
                    showMessage(`Errore nell'eliminazione dell'acquisto: ${error.message}`, 'error');
                }
            });
            return;
        }

        try {
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
                storicoAcquisti.splice(indexToDelete, 1);

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
                loadClientData(currentClientId);
            } else {
                showMessage("Errore: Indice acquisto non valido.", 'error');
            }

        } catch (error) {
            console.error("Errore eliminazione acquisto:", error);
            showMessage(`Errore nell'eliminazione dell'acquisto: ${error.message}`, 'error');
        }
    }

    // --- NUOVA FUNZIONE: Gestione del salvataggio delle modifiche al cliente (tramite modale) ---
    async function handleModificaCliente(event) {
        event.preventDefault();

        const clienteId = modificaClienteIdInput.value;
        const updatedCliente = {
            nome: modificaNomeInput.value.trim(),
            cognome: modificaCognomeInput.value.trim(),
            email: modificaEmailInput.value.trim(),
            telefono: modificaTelefonoInput.value.trim()
            // Se ci sono altri campi da modificare nel form, aggiungili qui
        };

        try {
            const response = await fetch(`/api/clienti/${clienteId}`, {
                method: 'PUT', // O 'PATCH' a seconda della tua API backend
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCliente)
            });

            const data = await handleApiResponse(response);

            if (data === null) return; // handleApiResponse ha già gestito errori di sessione

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il salvataggio delle modifiche al cliente.');
            }

            showMessage('Dettagli cliente aggiornati con successo!', 'success');
            closeModal(modificaClienteModal, formModificaCliente);
            loadClientData(currentClientId); // Ricarica i dati per aggiornare la scheda
        } catch (error) {
            console.error('Errore durante l\'aggiornamento del cliente:', error);
            showMessage('Errore durante il salvataggio delle modifiche: ' + error.message, 'error');
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
        currentClientId = newClientId;
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
                    currentIndex = 0;
                }
            } catch (e) {
                console.error("Errore nel parsing dei search_results:", e);
                searchResultsIds = [currentClientId];
                currentIndex = 0;
            }
        } else {
            searchResultsIds = [currentClientId];
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
            dataAcquistoInput.valueAsDate = new Date();
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
            // *** MODIFICATO QUI: Ora dataTrattamentoInput è correttamente definito ***
            if (dataTrattamentoInput) {
                dataTrattamentoInput.valueAsDate = new Date();
            } else {
                console.warn("Elemento 'dataTrattamentoInput' non trovato per impostare la data predefinita.");
            }
            // ********************
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

    // --- NUOVI Event Listeners per la modale "Modifica Cliente" ---
    if (modificaDettagliBtn) {
        modificaDettagliBtn.addEventListener('click', () => {
            if (currentClienteData) {
                modificaClienteIdInput.value = currentClienteData.id;
                modificaNomeInput.value = currentClienteData.nome || '';
                modificaCognomeInput.value = currentClienteData.cognome || '';
                modificaEmailInput.value = currentClienteData.email || '';
                modificaTelefonoInput.value = currentClienteData.telefono || '';
                openModal(modificaClienteModal);
            } else {
                console.error("Errore: Dati cliente non disponibili per la modifica.");
                showMessage("Impossibile caricare i dati del cliente per la modifica.", 'error');
            }
        });
    }
    if (annullaModificaClienteBtn) {
        annullaModificaClienteBtn.addEventListener('click', () => {
            closeModal(modificaClienteModal, formModificaCliente);
        });
    }
    // Chiusura della modale cliccando fuori
    if (modificaClienteModal) {
        modificaClienteModal.addEventListener('click', (event) => {
            if (event.target === modificaClienteModal) {
                closeModal(modificaClienteModal, formModificaCliente);
            }
        });
    }
    if (formModificaCliente) {
        formModificaCliente.addEventListener('submit', handleModificaCliente);
    }
    // ********************


    // Event listeners per la paginazione
    btnPrecedente.addEventListener("click", () => navigateClient('prev'));
    btnSuccessivo.addEventListener("click", () => navigateClient('next'));

    // Inizializza la pagina al caricamento
    initializePage();
});
