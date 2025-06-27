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

    // *** AGGIUNTO/RIPRISTINATO ***
    // Riferimenti ai NUOVI elementi DOM per Storico Acquisti
    const aggiungiAcquistoBtn = document.getElementById("aggiungi-acquisto-btn");
    const listaAcquistiBody = document.getElementById("lista-acquisti");
    const modalAggiungiAcquisto = document.getElementById("modalAggiungiAcquisto");
    const formAggiungiAcquisto = document.getElementById("formAggiungiAcquisto");
    const annullaAcquistoBtn = document.getElementById("annulla-acquisto-btn");
    const prodottoAcquistoInput = document.getElementById("prodotto-acquisto"); // Questo dovrebbe essere il dropdown dei trattamenti
    const dataAcquistoInput = document.getElementById("data-acquisto");
    const prezzoAcquistoInput = document.getElementById("prezzo-acquisto");
    const quantitaAcquistoInput = document.getElementById("quantita-acquisto");
    const noteAcquistoTextarea = document.getElementById("note-acquisto");
    // ********************

    // *** AGGIUNTO/RIPRISTINATO ***
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

    // --- Gestione generica delle risposte API (già ok) ---
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            if (response.ok) {
                return {};
            }
            throw new Error(`Errore HTTP: ${response.status} ${response.statusText}`);
        }
    }

    // --- Funzione per caricare i dati del cliente (MODIFICATO: AGGIUNTO /api/) ---
    async function loadClientData(clientId) {
        if (!clientId) {
            showMessage("ID Cliente non fornito nell'URL. Ricarica la pagina da un cliente valido.", 'error');
            return;
        }
        try {
            // MODIFICATO: AGGIUNTO /api/
            const response = await fetch(`/api/clienti/${clientId}`);
            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Errore nel caricamento dei dati del cliente.");
            }

            // Popola i campi del cliente e salva i dati nella variabile globale
            // Il backend ora dovrebbe restituire direttamente i dati del cliente
            const client = data; // Il tuo backend /api/clienti/:id restituisce direttamente i dati del cliente

            if (client) {
                currentClienteData = client; // Salva i dati completi del cliente
                nomeCompletoSpan.textContent = `${client.nome} ${client.cognome}`;
                emailSpan.textContent = client.email || "N/A";
                telefonoSpan.textContent = client.telefono || "N/A";

                // Popola le Note/Preferenze
                clienteNoteTextarea.value = client.note || ''; // La colonna è 'note' in index.js, non 'preferenze_note'

                // Popola lo Storico Acquisti
                displayAcquisti(client.acquisti); // Ora client.acquisti è già un array di oggetti dal backend
            } else {
                showMessage("Cliente non trovato.", 'error');
            }

            // Popola la lista trattamenti (Nota: il tuo index.js non carica i trattamenti con l'endpoint /api/clienti/:id.
            // Se i trattamenti devono essere mostrati qui, dovrai o caricarli separatamente
            // o modificare l'endpoint /api/clienti/:id per includerli.)
            // Per ora, li lascio come erano, ma se non appaiono, sai perché.
            // Idealmente, l'endpoint /api/clienti/:id dovrebbe restituire anche i trattamenti associati.
            // Dato che il backend ora non li restituisce automaticamente con il cliente, potresti dover fare una fetch separata qui
            // oppure modificare l'endpoint '/api/clienti/:id' nel backend per includerli.
            // Per ora, lascio la riga così com'è, ma se la lista trattamenti rimane vuota è per questo motivo.
            const trattamenti = data.trattamenti || []; // Se non ci sono 'trattamenti' nella risposta da /api/clienti/:id, sarà vuoto
            displayTrattamenti(trattamenti);

        } catch (error) {
            console.error("Errore nel caricamento dei dati del cliente:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    // --- Funzione per visualizzare i trattamenti (Nessuna modifica necessaria qui) ---
    function displayTrattamenti(trattamenti) {
        listaTrattamentiBody.innerHTML = ''; // Pulisce la lista esistente
        if (trattamenti.length === 0) {
            listaTrattamentiBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nessun trattamento registrato per questo cliente.</td></tr>';
            return;
        }

        trattamenti.forEach(trattamento => {
            const row = listaTrattamentiBody.insertRow();
            row.insertCell().textContent = trattamento.tipo_trattamento;
            row.insertCell().textContent = trattamento.descrizione;
            row.insertCell().textContent = new Date(trattamento.data_trattamento).toLocaleDateString('it-IT');
            row.insertCell().textContent = trattamento.note || "N/A";

            const actionCell = row.insertCell();
            const editButton = document.createElement("button");
            editButton.textContent = "✏️ Modifica";
            editButton.className = "btn btn-edit";
            editButton.onclick = () => {
                // Questa rotta /modifica-trattamento.html non è un'API, quindi non ha /api/
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

    // --- Funzione per visualizzare gli acquisti (MODIFICATO: Non parsare più JSON, l'array arriva direttamente dal backend) ---
    function displayAcquisti(acquistiArray) { // Ora riceve direttamente l'array
        listaAcquistiBody.innerHTML = ''; // Pulisce la lista esistente

        if (!Array.isArray(acquistiArray) || acquistiArray.length === 0) {
            listaAcquistiBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nessun acquisto registrato per questo cliente.</td></tr>';
            return;
        }

        acquistiArray.forEach((acquisto) => { // Itera direttamente sull'array
            const row = listaAcquistiBody.insertRow();
            // Assicurati che i nomi delle proprietà corrispondano a quelli restituiti dal tuo backend per gli acquisti
            // (es. trattamento_id, data_acquisto, prezzo, note)
            row.insertCell().textContent = acquisto.trattamento_nome || `ID Trattamento: ${acquisto.trattamento_id}`; // Assumendo che il backend possa restituire il nome del trattamento
            row.insertCell().textContent = new Date(acquisto.data_acquisto).toLocaleDateString('it-IT');
            row.insertCell().textContent = `${parseFloat(acquisto.prezzo).toFixed(2)} €`; // Assicurati che prezzo sia un numero
            row.insertCell().textContent = acquisto.quantita || 1; // Se non c'è quantità, default a 1
            row.insertCell().textContent = acquisto.note || "N/A";

            const actionCell = row.insertCell();
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Elimina";
            deleteButton.className = "btn btn-delete";
            deleteButton.style.marginLeft = "5px";
            deleteButton.onclick = () => confirmDeleteAcquisto(acquisto.id); // Passa l'ID dell'acquisto, non l'indice
            actionCell.appendChild(deleteButton);
        });
    }


    // --- Funzioni di salvataggio/eliminazione (MODIFICATE: AGGIUNTO /api/) ---

    async function confirmDeleteTrattamento(trattamentoId) {
        if (typeof showCustomModal !== 'function') {
            console.warn('showCustomModal non è definita. Usando confirm() di fallback.');
            if (!confirm("Sei sicuro di voler eliminare questo trattamento?")) {
                return;
            }
        } else {
            // Questo blocco non verrà mai eseguito finché showCustomModal non è definita
            showCustomModal("Sei sicuro di voler eliminare questo trattamento?", 'confirm', async (confirmed) => {
                if (!confirmed) return;

                try {
                    // MODIFICATO: AGGIUNTO /api/
                    const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                        method: 'DELETE',
                    });
                    const data = await handleApiResponse(response);

                    if (!response.ok) {
                        throw new Error(data?.error || "Errore durante l'eliminazione del trattamento.");
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

        // Questo blocco viene eseguito se showCustomModal non è definita e l'utente conferma
        try {
            // MODIFICATO: AGGIUNTO /api/
            const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                method: 'DELETE',
            });
            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Errore durante l'eliminazione del trattamento.");
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
            // Questo blocco non verrà mai eseguito finché showCustomModal non è definita
            showCustomModal(`Sei sicuro di voler eliminare il cliente ${nomeCompletoSpan.textContent}? Questa azione è irreversibile e cancellerà anche tutti i trattamenti associati.`, 'confirm', async (confirmed) => {
                if (!confirmed) return;

                try {
                    // MODIFICATO: AGGIUNTO /api/
                    const response = await fetch(`/api/clienti/${currentClientId}`, {
                        method: 'DELETE',
                    });
                    const data = await handleApiResponse(response);

                    if (!response.ok) {
                        throw new Error(data?.error || "Errore durante l'eliminazione del cliente.");
                    }
                    showMessage("Cliente eliminato con successo! Reindirizzamento alla dashboard...", 'success', () => {
                        window.location.href = "/clienti"; // Reindirizza alla pagina clienti principale
                    });
                } catch (error) {
                    console.error("Errore eliminazione cliente:", error);
                    showMessage(`Errore: ${error.message}`, 'error');
                }
            });
            return;
        }

        // Questo blocco viene eseguito se showCustomModal non è definita e l'utente conferma
        try {
            // MODIFICATO: AGGIUNTO /api/
            const response = await fetch(`/api/clienti/${currentClientId}`, {
                method: 'DELETE',
            });
            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Errore durante l'eliminazione del cliente.");
            }
            showMessage("Cliente eliminato con successo! Reindirizzamento alla dashboard...", 'success', () => {
                window.location.href = "/clienti"; // Reindirizza alla pagina clienti principale
            });
        } catch (error) {
            console.error("Errore eliminazione cliente:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    async function handleSalvaNote() {
        const note = clienteNoteTextarea.value.trim();
        try {
            // MODIFICATO: AGGIUNTO /api/
            const response = await fetch(`/api/clienti/${currentClientId}/note`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: note }) // Assicurati che il nome della proprietà corrisponda a quello che il backend si aspetta
            });
            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Errore nel salvataggio delle note.");
            }
            showMessage("Note salvate con successo!", 'success');
        } catch (error) {
            console.error("Errore salvataggio note:", error);
            showMessage(`Errore nel salvataggio delle note: ${error.message}`, 'error');
        }
    }

    // *** AGGIUNTO/RIPRISTINATO (MODIFICATO: AGGIUNTO /api/) ***
    async function handleAddAcquisto(event) {
        event.preventDefault();
        // prodottoAcquistoInput dovrebbe essere un select con i trattamenti
        const trattamento_id = prodottoAcquistoInput.value; // Assume che il value sia l'ID del trattamento
        const data_acquisto = dataAcquistoInput.value;
        const prezzo = parseFloat(prezzoAcquistoInput.value);
        // La tua logica backend non ha quantità per gli acquisti, rimuovo o metto default a 1
        const quantita = 1; // Se non gestisci la quantità, puoi impostarla a 1
        const note = noteAcquistoTextarea.value.trim();

        if (!trattamento_id || !data_acquisto || isNaN(prezzo) || prezzo < 0) {
            showMessage("Per favore, compila tutti i campi obbligatori (Trattamento, Data, Prezzo) con valori validi.", 'error');
            return;
        }

        const nuovoAcquisto = {
            cliente_id: currentClientId,
            trattamento_id: parseInt(trattamento_id),
            data_acquisto: data_acquisto,
            prezzo: prezzo,
            note: note
        };

        try {
            // MODIFICATO: AGGIUNTO /api/
            // L'endpoint per aggiungere acquisti è ora /api/clienti/:id/acquisti con POST
            const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuovoAcquisto)
            });
            const dataResponse = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(dataResponse?.error || "Errore nell'aggiunta dell'acquisto.");
            }

            showMessage("Acquisto aggiunto con successo!", 'success');
            closeModal(modalAggiungiAcquisto, formAggiungiAcquisto);
            loadClientData(currentClientId); // Ricarica i dati del cliente per aggiornare lo storico
        } catch (error) {
            console.error("Errore aggiunta acquisto:", error);
            showMessage(`Errore nell'aggiunta dell'acquisto: ${error.message}`, 'error');
        }
    }
    // ********************

    // --- NUOVA FUNZIONE: Gestione dell'aggiunta Trattamento tramite Modale (MODIFICATO: AGGIUNTO /api/) ---
    async function handleAddTrattamento(event) {
        event.preventDefault();

        if (!currentClientId) {
            showMessage("Impossibile aggiungere il trattamento: ID cliente mancante. Ricarica la pagina da un cliente valido.", 'error');
            return;
        }

        const tipo_trattamento = tipoTrattamentoInput.value.trim();
        const data_trattamento = dataTrattamentoInput.value;
        const descrizione = descrizioneTrattamentoInput.value.trim();
        const note = noteTrattamentoInput.value.trim();

        if (!tipo_trattamento || !data_trattamento) {
            showMessage("Per favor, compila tutti i campi obbligatori (Tipo, Data).", 'error');
            return;
        }

        try {
            // MODIFICATO: AGGIUNTO /api/
            // L'endpoint per aggiungere trattamenti è ora /api/trattamenti con POST
            const response = await fetch(`/api/trattamenti`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_id: currentClientId,
                    tipo_trattamento,
                    data_trattamento,
                    descrizione,
                    note
                })
            });
            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || "Errore nell'aggiunta del trattamento.");
            }

            showMessage("Trattamento aggiunto con successo!", 'success');
            closeModal(modalAggiungiTrattamento, formAddTrattamento);
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore aggiunta trattamento:", error);
            showMessage(`Errore nell'aggiunta del trattamento: ${error.message}`, 'error');
        }
    }

    async function confirmDeleteAcquisto(acquistoId) { // Ora riceve l'ID dell'acquisto
        if (typeof showCustomModal !== 'function') {
            console.warn('showCustomModal non è definita. Usando confirm() di fallback.');
            if (!confirm("Sei sicuro di voler eliminare questo acquisto?")) {
                return;
            }
        } else {
            // Questo blocco non verrà mai eseguito finché showCustomModal non è definita
            showCustomModal("Sei sicuro di voler eliminare questo acquisto?", 'confirm', async (confirmed) => {
                if (!confirmed) return;

                try {
                    // MODIFICATO: AGGIUNTO /api/
                    // Endpoint per eliminare un acquisto è /api/acquisti/:id con DELETE
                    const response = await fetch(`/api/acquisti/${acquistoId}`, {
                        method: 'DELETE',
                    });
                    const dataResponse = await handleApiResponse(response);

                    if (!response.ok) {
                        throw new Error(dataResponse?.error || "Errore nell'eliminazione dell'acquisto.");
                    }
                    showMessage("Acquisto eliminato con successo!", 'success');
                    loadClientData(currentClientId); // Ricarica i dati per aggiornare lo storico
                } catch (error) {
                    console.error("Errore eliminazione acquisto:", error);
                    showMessage(`Errore nell'eliminazione dell'acquisto: ${error.message}`, 'error');
                }
            });
            return;
        }

        // Questo blocco viene eseguito se showCustomModal non è definita e l'utente conferma
        try {
            // MODIFICATO: AGGIUNTO /api/
            // Endpoint per eliminare un acquisto è /api/acquisti/:id con DELETE
            const response = await fetch(`/api/acquisti/${acquistoId}`, {
                method: 'DELETE',
            });
            const dataResponse = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(dataResponse?.error || "Errore nell'eliminazione dell'acquisto.");
            }
            showMessage("Acquisto eliminato con successo!", 'success');
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore eliminazione acquisto:", error);
            showMessage(`Errore nell'eliminazione dell'acquisto: ${error.message}`, 'error');
        }
    }

    // --- NUOVA FUNZIONE: Gestione del salvataggio delle modifiche al cliente (tramite modale) (MODIFICATO: AGGIUNTO /api/) ---
    async function handleModificaCliente(event) {
        event.preventDefault();

        const clienteId = modificaClienteIdInput.value;
        const updatedCliente = {
            nome: modificaNomeInput.value.trim(),
            cognome: modificaCognomeInput.value.trim(),
            email: modificaEmailInput.value.trim(),
            telefono: modificaTelefonoInput.value.trim()
            // Assicurati che data_nascita e note vengano inclusi se presenti nel form
            // e se il backend li gestisce in questo endpoint PUT/PATCH.
            // Esempio: data_nascita: modificaDataNascitaInput.value || null,
            //          note: modificaNoteInput.value.trim()
        };

        try {
            // MODIFICATO: AGGIUNTO /api/
            // L'endpoint per la modifica dei dettagli del cliente è ora /api/clienti/:id con PUT
            const response = await fetch(`/api/clienti/${clienteId}`, {
                method: 'PUT', // Utilizziamo PUT come da te definito in index.js per l'aggiornamento
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedCliente)
            });

            const data = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(data?.error || 'Errore durante il salvataggio delle modifiche al cliente.');
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
        // MODIFICATO: La URL della pagina rimane la stessa, ma l'ID del cliente viene passato correttamente
        // Non è una chiamata API, quindi non serve /api/
        window.history.pushState({ clientId: newClientId, searchResultsIds, currentIndex }, '', `/scheda-cliente.html?id=${newClientId}&search_results=${encodeURIComponent(JSON.stringify(searchResultsIds))}&current_index=${currentIndex}`);
        currentClientId = newClientId;
        loadClientData(currentClientId);
        updatePaginationButtons();
    }

    // --- Inizializzazione all'apertura della pagina ---
    // Estrai l'ID del cliente dall'URL e carica i dati
    const urlParams = new URLSearchParams(window.location.search);
    const clientIdFromUrl = urlParams.get('id');

    // Recupera i risultati di ricerca e l'indice corrente se presenti nell'URL o nello stato
    const searchResultsFromUrl = urlParams.get('search_results');
    const currentIndexFromUrl = urlParams.get('current_index');

    if (searchResultsFromUrl) {
        try {
            searchResultsIds = JSON.parse(decodeURIComponent(searchResultsFromUrl));
            currentIndex = parseInt(currentIndexFromUrl) || 0;
        } catch (e) {
            console.error("Errore nel parsing dei risultati di ricerca URL:", e);
            searchResultsIds = [];
            currentIndex = 0;
        }
    } else if (window.history.state && window.history.state.searchResultsIds) {
        // Se non nell'URL, prova a recuperare dallo stato della cronologia
        searchResultsIds = window.history.state.searchResultsIds;
        currentIndex = window.history.state.currentIndex;
    }

    currentClientId = clientIdFromUrl;
    if (currentClientId) {
        loadClientData(currentClientId);
    } else {
        // Se non c'è un ID, potresti reindirizzare o mostrare un messaggio di errore
        showMessage("ID cliente non specificato nell'URL.", "error");
    }

    updatePaginationButtons();

    // Event Listeners
    if (btnEliminaCliente) {
        btnEliminaCliente.addEventListener('click', confirmDeleteClient);
    }
    if (salvaNoteBtn) {
        salvaNoteBtn.addEventListener('click', handleSalvaNote);
    }

    if (aggiungiAcquistoBtn) {
        aggiungiAcquistoBtn.addEventListener('click', () => {
            // Qui devi popolare il dropdown dei trattamenti prima di aprire la modale
            populateTrattamentiDropdown(); // Funzione da implementare
            openModal(modalAggiungiAcquisto);
            // Imposta la data corrente come default
            dataAcquistoInput.valueAsDate = new Date();
        });
    }
    if (annullaAcquistoBtn) {
        annullaAcquistoBtn.addEventListener('click', () => closeModal(modalAggiungiAcquisto, formAggiungiAcquisto));
    }
    if (formAggiungiAcquisto) {
        formAggiungiAcquisto.addEventListener('submit', handleAddAcquisto);
    }

    // Event Listeners per la modale Aggiungi Trattamento
    if (aggiungiTrattamentoBtn) {
        aggiungiTrattamentoBtn.addEventListener('click', () => {
            openModal(modalAggiungiTrattamento);
            dataTrattamentoInput.valueAsDate = new Date(); // Imposta la data corrente
        });
    }
    if (cancelTrattamentoBtn) {
        cancelTrattamentoBtn.addEventListener('click', () => closeModal(modalAggiungiTrattamento, formAddTrattamento));
    }
    if (formAddTrattamento) {
        formAddTrattamento.addEventListener('submit', handleAddTrattamento);
    }

    // Event Listeners per la modale Modifica Cliente
    if (modificaDettagliBtn) {
        modificaDettagliBtn.addEventListener('click', () => {
            if (currentClienteData) {
                // Popola il form con i dati attuali del cliente
                modificaClienteIdInput.value = currentClienteData.id;
                modificaNomeInput.value = currentClienteData.nome;
                modificaCognomeInput.value = currentClienteData.cognome;
                modificaEmailInput.value = currentClienteData.email || '';
                modificaTelefonoInput.value = currentClienteData.telefono || '';
                // Popola altri campi se esistono (es. data_nascita, note)
            }
            openModal(modificaClienteModal);
        });
    }
    if (annullaModificaClienteBtn) {
        annullaModificaClienteBtn.addEventListener('click', () => closeModal(modificaClienteModal, formModificaCliente));
    }
    if (formModificaCliente) {
        formModificaCliente.addEventListener('submit', handleModificaCliente);
    }

    if (btnPrecedente) {
        btnPrecedente.addEventListener('click', () => navigateClient('prev'));
    }
    if (btnSuccessivo) {
        btnSuccessivo.addEventListener('click', () => navigateClient('next'));
    }

    // *** NUOVA FUNZIONE: Popolare il dropdown dei trattamenti nel form "Aggiungi Acquisto" ***
    async function populateTrattamentiDropdown() {
        try {
            // MODIFICATO: AGGIUNTO /api/
            const response = await fetch('/api/trattamenti');
            const trattamenti = await handleApiResponse(response);

            if (!response.ok) {
                throw new Error(trattamenti?.error || "Errore nel caricamento dei trattamenti.");
            }

            prodottoAcquistoInput.innerHTML = '<option value="">Seleziona un trattamento</option>'; // Pulisci e aggiungi opzione di default
            trattamenti.forEach(trattamento => {
                const option = document.createElement('option');
                option.value = trattamento.id; // Usa l'ID del trattamento
                option.textContent = `${trattamento.nome} (${trattamento.prezzo.toFixed(2)}€)`; // Mostra nome e prezzo
                prodottoAcquistoInput.appendChild(option);
            });
        } catch (error) {
            console.error("Errore nel caricamento dei trattamenti per il dropdown:", error);
            showMessage("Errore nel caricamento dei trattamenti.", 'error');
        }
    }
});
