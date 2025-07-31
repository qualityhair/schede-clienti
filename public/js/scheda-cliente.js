// =======================================================================
// == FILE /public/js/scheda-cliente.js - VERSIONE COMPLETA E CORRETTA ==
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. RIFERIMENTI AGLI ELEMENTI DOM ---
    const nomeCompletoSpan = document.getElementById("nome-completo");
    const emailSpan = document.getElementById("email");
    const telefonoSpan = document.getElementById("telefono");
    const listaTrattamentiBody = document.getElementById("lista-trattamenti");
    const btnEliminaCliente = document.getElementById("btnEliminaCliente");
    const btnPrecedente = document.getElementById("btnPrecedente");
    const btnSuccessivo = document.getElementById("btnSuccessivo");
    const infoPaginazione = document.getElementById("info-paginazione");
    const clienteNoteTextarea = document.getElementById("cliente-note");
    const salvaNoteBtn = document.getElementById("salva-note-btn");
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
    const aggiungiTrattamentoBtn = document.getElementById("aggiungiTrattamentoBtn");
    const modalAggiungiTrattamento = document.getElementById("addTrattamentoModal");
    const formAddTrattamento = document.getElementById("formAddTrattamento");
    const cancelTrattamentoBtn = document.getElementById("cancelTrattamentoBtn");
    const tipoTrattamentoInput = document.getElementById('tipoTrattamento');
    const dataTrattamentoInput = document.getElementById('dataTrattamento');
    const prezzoTrattamentoInput = document.getElementById('prezzoTrattamento');
    const descrizioneTrattamentoInput = document.getElementById('descrizioneTrattamento');
    const noteTrattamentoInput = document.getElementById('noteTrattamento');
    const modificaDettagliBtn = document.getElementById("modificaDettagliBtn");
    const modificaClienteModal = document.getElementById('modificaClienteModal');
    const formModificaCliente = document.getElementById('formModificaCliente');
    const modificaClienteIdInput = document.getElementById('modifica-cliente-id');
    const modificaNomeInput = document.getElementById('modifica-nome');
    const modificaCognomeInput = document.getElementById('modifica-cognome');
    const modificaEmailInput = document.getElementById('modifica-email');
    const modificaTelefonoInput = document.getElementById('modifica-telefono');
    const annullaModificaClienteBtn = document.getElementById('annullaModificaClienteBtn');

    // Variabili di stato
    let currentClientId = null;
    let searchResultsIds = [];
    let currentIndex = 0;
    let currentClienteData = null;

    // --- 2. FUNZIONI DI UTILITÀ ---

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
            if (onCloseCallback) onCloseCallback();
        }, 3000);
    }

    function openModal(modalElement) {
        modalElement.classList.add('open');
    }

    function closeModal(modalElement, formToReset = null) {
        modalElement.classList.remove('open');
        if (formToReset) formToReset.reset();
    }

    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");
        if (response.status === 401) {
            showMessage('Sessione scaduta. Effettua nuovamente il login.', 'error', () => { window.location.href = '/'; });
            return null;
        } else if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else if (response.ok) {
            return {};
        } else {
            showMessage('Accesso non autorizzato o errore server.', 'error', () => { window.location.href = '/'; });
            return null;
        }
    }

    // --- 3. FUNZIONI DI CARICAMENTO E VISUALIZZAZIONE DATI ---

    async function loadClientData(clientId) {
        if (!clientId) {
            showMessage("ID Cliente non fornito.", 'error');
            return;
        }
        try {
            const response = await fetch(`/api/clienti/${clientId}`);
            const data = await handleApiResponse(response);
            if (!data || !response.ok) throw new Error(data?.error || "Errore caricamento dati cliente.");

            const client = data.client;
            if (client) {
                currentClienteData = client;
                nomeCompletoSpan.textContent = `${client.nome} ${client.cognome}`;
                emailSpan.textContent = client.email || "N/A";
                telefonoSpan.textContent = client.telefono || "N/A";
                clienteNoteTextarea.value = client.preferenze_note || '';
                displayAcquisti(client.storico_acquisti);
            } else {
                showMessage("Cliente non trovato.", 'error');
            }
            displayTrattamenti(data.trattamenti || []);
        } catch (error) {
            console.error("Errore in loadClientData:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    function displayTrattamenti(trattamenti) {
        listaTrattamentiBody.innerHTML = '';
        if (trattamenti.length === 0) {
            listaTrattamentiBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nessun trattamento registrato.</td></tr>';
            return;
        }
        trattamenti.sort((a, b) => new Date(a.data_trattamento) - new Date(b.data_trattamento));
        trattamenti.forEach(trattamento => {
            const row = listaTrattamentiBody.insertRow();
            row.insertCell().textContent = trattamento.tipo_trattamento;
            row.insertCell().textContent = trattamento.descrizione;
            row.insertCell().textContent = new Date(trattamento.data_trattamento).toLocaleDateString('it-IT');
            row.insertCell().textContent = trattamento.prezzo ? `€ ${parseFloat(trattamento.prezzo).toFixed(2)}` : 'N/A';
            row.insertCell().textContent = trattamento.note || "N/A";
            const actionCell = row.insertCell();
            const editButton = document.createElement("button");
            editButton.textContent = "✏️ Modifica";
            editButton.className = "btn btn-edit";
            editButton.onclick = () => { window.location.href = `/modifica-trattamento.html?id=${trattamento.id}&clientId=${currentClientId}`; };
            actionCell.appendChild(editButton);
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "🗑️ Elimina";
            deleteButton.className = "btn btn-delete";
            deleteButton.style.marginLeft = "5px";
            deleteButton.onclick = () => confirmDeleteTrattamento(trattamento.id);
            actionCell.appendChild(deleteButton);
        });
    }

    function displayAcquisti(acquistiString) {
        listaAcquistiBody.innerHTML = '';
        let acquisti = [];
        try {
            acquisti = acquistiString ? JSON.parse(acquistiString) : [];
        } catch (e) {
            console.error("Errore parsing storico acquisti:", e);
        }
        if (acquisti.length === 0) {
            listaAcquistiBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nessun acquisto registrato.</td></tr>';
            return;
        }
        acquisti.sort((a, b) => new Date(a.data) - new Date(b.data));
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
            deleteButton.onclick = () => confirmDeleteAcquisto(index);
            actionCell.appendChild(deleteButton);
        });
    }
    
    async function caricaRiepilogoAnalisi(clienteId) {
        const contentDiv = document.getElementById('analisi-riepilogo-content');
        const storicoBtn = document.getElementById('storico-analisi-btn');
        const panel = document.getElementById('analisi-tricologica-panel');
        if (!contentDiv || !storicoBtn || !panel) return;

        try {
            const response = await fetch(`/api/clienti/${clienteId}/analisi/riepilogo`);
            const riepilogo = await handleApiResponse(response);
            if (riepilogo === null && !response.ok) throw new Error('Errore di rete');
            contentDiv.innerHTML = '';

            if (riepilogo) {
                const dataFormattata = new Date(riepilogo.data_analisi).toLocaleDateString('it-IT');
                contentDiv.innerHTML = `
    <div class="riepilogo-item"><strong>Data Ultima Analisi:</strong><span>${dataFormattata}</span></div>
    <div class="riepilogo-item"><strong>Esigenza Cliente:</strong><span>"${riepilogo.esigenza_cliente || 'N/D'}"</span></div>
    <div class="riepilogo-item"><strong>Diagnosi Primaria:</strong><span>${riepilogo.diagnosi_primaria || 'N/D'}</span></div>
    <div class="riepilogo-item"><strong>Quadro Riepilogativo:</strong><span>${riepilogo.diagnosi_riepilogo || 'N/D'}</span></div>
`;
                storicoBtn.style.display = 'inline-flex';
                storicoBtn.href = `/storico-analisi.html?clienteId=${clienteId}`;
                contentDiv.style.cursor = 'pointer';
                contentDiv.onclick = () => { window.location.href = `/visualizza-analisi.html?analisiId=${riepilogo.id}`; };
                storicoBtn.onclick = (e) => e.stopPropagation();
            } else {
                contentDiv.innerHTML = '<p>Nessuna analisi effettuata per questo cliente.</p>';
            }
        } catch (error) {
            console.error("Errore caricamento riepilogo analisi:", error);
            contentDiv.innerHTML = '<p class="error-message">Impossibile caricare il riepilogo.</p>';
        }
    }

    // --- 4. FUNZIONI DI GESTIONE (DELETE, SAVE, UPDATE, etc.) ---

    async function confirmDeleteTrattamento(trattamentoId) {
        if (!confirm("Sei sicuro di voler eliminare questo trattamento?")) return;
        try {
            const response = await fetch(`/api/trattamenti/${trattamentoId}`, { method: 'DELETE' });
            const data = await handleApiResponse(response);
            if (!data) return;
            if (!response.ok) throw new Error(data.error || "Errore eliminazione trattamento.");
            showMessage("Trattamento eliminato!", 'success');
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore eliminazione trattamento:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    async function confirmDeleteClient() {
        if (!confirm(`Sei sicuro di voler eliminare ${nomeCompletoSpan.textContent}? L'azione è irreversibile.`)) return;
        try {
            const response = await fetch(`/api/clienti/${currentClientId}`, { method: 'DELETE' });
            const data = await handleApiResponse(response);
            if (!data) return;
            if (!response.ok) throw new Error(data.error || "Errore eliminazione cliente.");
            showMessage("Cliente eliminato! Reindirizzamento...", 'success', () => { window.location.href = "/dashboard.html"; });
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
            if (!data) return;
            if (!response.ok) throw new Error(data.error || "Errore salvataggio note.");
            showMessage("Note salvate!", 'success');
        } catch (error) {
            console.error("Errore salvataggio note:", error);
            showMessage(`Errore: ${error.message}`, 'error');
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
            showMessage("Compila tutti i campi obbligatori con valori validi.", 'error');
            return;
        }
        const nuovoAcquisto = { prodotto, data, prezzo, quantita, note };
        try {
            const clientResponse = await fetch(`/api/clienti/${currentClientId}`);
            const clientData = await handleApiResponse(clientResponse);
            if (!clientData || !clientResponse.ok) throw new Error("Errore recupero dati cliente.");
            let storicoAcquisti = [];
            try {
                storicoAcquisti = clientData.client.storico_acquisti ? JSON.parse(clientData.client.storico_acquisti) : [];
            } catch (e) { console.error("Errore parsing storico acquisti:", e); }
            storicoAcquisti.push(nuovoAcquisto);
            const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storico_acquisti: JSON.stringify(storicoAcquisti) })
            });
            const dataResponse = await handleApiResponse(response);
            if (!dataResponse) return;
            if (!response.ok) throw new Error(dataResponse.error || "Errore aggiunta acquisto.");
            showMessage("Acquisto aggiunto!", 'success');
            closeModal(modalAggiungiAcquisto, formAggiungiAcquisto);
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore aggiunta acquisto:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    async function handleAddTrattamento(event) {
        event.preventDefault();
        if (!currentClientId) {
            showMessage("ID cliente mancante.", 'error');
            return;
        }
        const tipo_trattamento = tipoTrattamentoInput.value.trim();
        const data_trattamento = dataTrattamentoInput.value;
        const prezzo_trattamento = parseFloat(prezzoTrattamentoInput.value);
        if (isNaN(prezzo_trattamento) || prezzo_trattamento < 0) {
            showMessage("Inserisci un prezzo valido.", 'error');
            return;
        }
        if (!tipo_trattamento || !data_trattamento) {
            showMessage("Compila Tipo e Data.", 'error');
            return;
        }
        try {
            const response = await fetch(`/api/trattamenti`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cliente_id: currentClientId,
                    tipo_trattamento,
                    data_trattamento,
                    prezzo: prezzo_trattamento,
                    descrizione: descrizioneTrattamentoInput.value.trim(),
                    note: noteTrattamentoInput.value.trim()
                })
            });
            const data = await handleApiResponse(response);
            if (!data) return;
            if (!response.ok) throw new Error(data.error || "Errore aggiunta trattamento.");
            showMessage("Trattamento aggiunto!", 'success');
            closeModal(modalAggiungiTrattamento, formAddTrattamento);
            loadClientData(currentClientId);
        } catch (error) {
            console.error("Errore aggiunta trattamento:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    async function confirmDeleteAcquisto(indexToDelete) {
        if (!confirm("Sei sicuro di voler eliminare questo acquisto?")) return;
        try {
            const clientResponse = await fetch(`/api/clienti/${currentClientId}`);
            const clientData = await handleApiResponse(clientResponse);
            if (!clientData || !clientResponse.ok) throw new Error("Errore recupero dati cliente.");
            let storicoAcquisti = [];
            try {
                storicoAcquisti = clientData.client.storico_acquisti ? JSON.parse(clientData.client.storico_acquisti) : [];
            } catch (e) {
                showMessage("Errore: Dati storici malformati.", 'error');
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
                if (!dataResponse) return;
                if (!response.ok) throw new Error(dataResponse.error || "Errore eliminazione acquisto.");
                showMessage("Acquisto eliminato!", 'success');
                loadClientData(currentClientId);
            } else {
                showMessage("Errore: Indice acquisto non valido.", 'error');
            }
        } catch (error) {
            console.error("Errore eliminazione acquisto:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    }

    async function handleModificaCliente(event) {
        event.preventDefault();
        const clienteId = modificaClienteIdInput.value;
        const updatedCliente = {
            nome: modificaNomeInput.value.trim(),
            cognome: modificaCognomeInput.value.trim(),
            email: modificaEmailInput.value.trim(),
            telefono: modificaTelefonoInput.value.trim()
        };
        try {
            const response = await fetch(`/api/clienti/${clienteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCliente)
            });
            const data = await handleApiResponse(response);
            if (!data) return;
            if (!response.ok) throw new Error(data.error || 'Errore salvataggio modifiche.');
            showMessage('Dettagli cliente aggiornati!', 'success');
            closeModal(modificaClienteModal, formModificaCliente);
            loadClientData(currentClientId);
        } catch (error) {
            console.error('Errore aggiornamento cliente:', error);
            showMessage('Errore: ' + error.message, 'error');
        }
    }

    // --- 5. GESTIONE PAGINAZIONE E AVVIO ---

    function updatePaginationButtons() {
        if (searchResultsIds.length > 1) {
            btnPrecedente.disabled = (currentIndex === 0);
            btnSuccessivo.disabled = (currentIndex === searchResultsIds.length - 1);
            infoPaginazione.textContent = `Cliente ${currentIndex + 1} di ${searchResultsIds.length}`;
            btnPrecedente.style.display = 'inline-block';
            btnSuccessivo.style.display = 'inline-block';
            infoPaginazione.style.display = 'inline-block';
        } else {
            btnPrecedente.style.display = 'none';
            btnSuccessivo.style.display = 'none';
            infoPaginazione.style.display = 'none';
        }
    }

    async function getClientIdsFromSearch() {
        const urlParams = new URLSearchParams(window.location.search);
        const clientIdParam = urlParams.get('id');
        const searchIdsParam = urlParams.get('searchIds');
        const initialIndexParam = urlParams.get('index');

        if (searchIdsParam) {
            try {
                searchResultsIds = JSON.parse(searchIdsParam);
                if (!Array.isArray(searchResultsIds) || searchResultsIds.some(isNaN)) {
                    throw new Error("Dati di ricerca non validi.");
                }
                currentIndex = parseInt(initialIndexParam, 10) || 0;
                if (currentIndex < 0 || currentIndex >= searchResultsIds.length) currentIndex = 0;
                currentClientId = searchResultsIds[currentIndex];
            } catch (e) {
                console.error("Errore parsing searchIds:", e);
                showMessage("Errore nei dati di ricerca. Carico singolo cliente.", 'error');
                if (clientIdParam) {
                    currentClientId = parseInt(clientIdParam, 10);
                    searchResultsIds = [currentClientId];
                    currentIndex = 0;
                }
            }
        } else if (clientIdParam) {
            currentClientId = parseInt(clientIdParam, 10);
            searchResultsIds = [currentClientId];
            currentIndex = 0;
        }

        if (currentClientId) {
            await loadClientData(currentClientId);
            await caricaRiepilogoAnalisi(currentClientId);
            
            const nuovaAnalisiIconBtn = document.getElementById('nuova-analisi-btn');
            if (nuovaAnalisiIconBtn) {
                nuovaAnalisiIconBtn.addEventListener('click', () => {
                    window.location.href = `/nuova-analisi.html?clienteId=${currentClientId}`;
                });
            }
            
            updatePaginationButtons();
        } else {
            showMessage("Nessun ID cliente valido trovato.", 'error');
        }
    }

    // --- 6. EVENT LISTENERS ---
    
    btnEliminaCliente.addEventListener('click', confirmDeleteClient);
    salvaNoteBtn.addEventListener('click', handleSalvaNote);
    btnPrecedente.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            window.location.href = `/scheda-cliente.html?id=${searchResultsIds[currentIndex]}&searchIds=${encodeURIComponent(JSON.stringify(searchResultsIds))}&index=${currentIndex}`;
        }
    });
    btnSuccessivo.addEventListener('click', () => {
        if (currentIndex < searchResultsIds.length - 1) {
            currentIndex++;
            window.location.href = `/scheda-cliente.html?id=${searchResultsIds[currentIndex]}&searchIds=${encodeURIComponent(JSON.stringify(searchResultsIds))}&index=${currentIndex}`;
        }
    });
    aggiungiTrattamentoBtn.addEventListener('click', () => openModal(modalAggiungiTrattamento));
    cancelTrattamentoBtn.addEventListener('click', () => closeModal(modalAggiungiTrattamento, formAddTrattamento));
    formAddTrattamento.addEventListener('submit', handleAddTrattamento);
    aggiungiAcquistoBtn.addEventListener('click', () => openModal(modalAggiungiAcquisto));
    annullaAcquistoBtn.addEventListener('click', () => closeModal(modalAggiungiAcquisto, formAggiungiAcquisto));
    formAggiungiAcquisto.addEventListener('submit', handleAddAcquisto);
    modificaDettagliBtn.addEventListener('click', () => {
        if (currentClienteData) {
            modificaClienteIdInput.value = currentClienteData.id;
            modificaNomeInput.value = currentClienteData.nome;
            modificaCognomeInput.value = currentClienteData.cognome;
            modificaEmailInput.value = currentClienteData.email || '';
            modificaTelefonoInput.value = currentClienteData.telefono || '';
            openModal(modificaClienteModal);
        } else {
            showMessage("Dati cliente non disponibili per la modifica.", 'info');
        }
    });
    annullaModificaClienteBtn.addEventListener('click', () => closeModal(modificaClienteModal, formModificaCliente));
    formModificaCliente.addEventListener('submit', handleModificaCliente);

    // --- 7. AVVIO ---
    getClientIdsFromSearch();
});