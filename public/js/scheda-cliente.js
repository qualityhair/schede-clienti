// =======================================================================
// == FILE /public/js/scheda-cliente.js - VERSIONE COMPLETA E CORRETTA ==
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. RIFERIMENTI AGLI ELEMENTI DOM ---
	

// Insieme agli altri riferimenti DOM per galleria fotografica
const addPhotoBtn = document.getElementById('add-photo-btn');
const addPhotoModal = document.getElementById('addPhotoModal');
const formAddPhoto = document.getElementById('formAddPhoto');
const cancelPhotoBtn = document.getElementById('cancel-photo-btn');
const photoGalleryContent = document.getElementById('photo-gallery-content');
const viewPhotoModal = document.getElementById('viewPhotoModal');
const fullscreenPhoto = document.getElementById('fullscreen-photo');
const closeViewPhotoBtn = document.getElementById('close-view-photo-btn');

// --- RIFERIMENTI GALLERIA 'TRICO' (Nuova) ---
const addTrichoPhotoBtn = document.getElementById('add-tricho-photo-btn');
const addTrichoPhotoModal = document.getElementById('addTrichoPhotoModal');
const formAddTrichoPhoto = document.getElementById('formAddTrichoPhoto');
const cancelTrichoPhotoBtn = document.getElementById('cancel-tricho-photo-btn');
const trichoPhotoGalleryContent = document.getElementById('tricho-photo-gallery-content');
const trichoPhotoTagsFilterContainer = document.getElementById('tricho-photo-tags-filter-container');
const trichoPhotoChoiceView = document.getElementById('tricho-photo-choice-view');
const trichoCameraView = document.getElementById('tricho-camera-view');
const trichoPreviewView = document.getElementById('tricho-preview-view');
const trichoStartCameraBtn = document.getElementById('tricho-start-camera-btn');
const trichoCameraVideo = document.getElementById('tricho-camera-video');
const trichoCameraCanvas = document.getElementById('tricho-camera-canvas');
const trichoTakePhotoBtn = document.getElementById('tricho-take-photo-btn');
const trichoCancelCameraBtn = document.getElementById('tricho-cancel-camera-btn');
const trichoPhotoPreview = document.getElementById('tricho-photo-preview');
const trichoUsePhotoBtn = document.getElementById('tricho-use-photo-btn');
const trichoRetakePhotoBtn = document.getElementById('tricho-retake-photo-btn');



// Viste della modale foto
const photoChoiceView = document.getElementById('photo-choice-view');
const cameraView = document.getElementById('camera-view');
const previewView = document.getElementById('preview-view');

// Elementi della fotocamera
const startCameraBtn = document.getElementById('start-camera-btn');
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const takePhotoBtn = document.getElementById('take-photo-btn');
const cancelCameraBtn = document.getElementById('cancel-camera-btn');

// Elementi dell'anteprima
const photoPreview = document.getElementById('photo-preview');
const usePhotoBtn = document.getElementById('use-photo-btn');
const retakePhotoBtn = document.getElementById('retake-photo-btn');

// Riferimenti per la modale di modifica foto
const editPhotoModal = document.getElementById('editPhotoModal');
const formEditPhoto = document.getElementById('formEditPhoto');
const cancelEditPhotoBtn = document.getElementById('cancel-edit-photo-btn');
const editPhotoIdInput = document.getElementById('edit-photo-id');
const editPhotoPreview = document.getElementById('edit-photo-preview');
const editPhotoDidascaliaInput = document.getElementById('edit-photo-didascalia');
const editPhotoTagsInput = document.getElementById('edit-photo-tags');
	
	
	
    const nomeCompletoSpan = document.getElementById("nome-completo");
    const emailSpan = document.getElementById("email");
    const telefonoSpan = document.getElementById("telefono");
	const statoPagamentoBadge = document.getElementById("stato-pagamento-badge");
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
	const pagatoAcquistoInput = document.getElementById("pagato-acquisto");
    const aggiungiTrattamentoBtn = document.getElementById("aggiungiTrattamentoBtn");
    const modalAggiungiTrattamento = document.getElementById("addTrattamentoModal");
    const formAddTrattamento = document.getElementById("formAddTrattamento");
    const cancelTrattamentoBtn = document.getElementById("cancelTrattamentoBtn");
    const tipoTrattamentoInput = document.getElementById('tipoTrattamento');
    const dataTrattamentoInput = document.getElementById('dataTrattamento');
    const prezzoTrattamentoInput = document.getElementById('prezzoTrattamento');
    const descrizioneTrattamentoInput = document.getElementById('descrizioneTrattamento');
    const noteTrattamentoInput = document.getElementById('noteTrattamento');
	const pagatoTrattamentoInput = document.getElementById("pagato-trattamento");
    const modificaDettagliBtn = document.getElementById("modificaDettagliBtn");
    const modificaClienteModal = document.getElementById('modificaClienteModal');
    const formModificaCliente = document.getElementById('formModificaCliente');
    const modificaClienteIdInput = document.getElementById('modifica-cliente-id');
    const modificaNomeInput = document.getElementById('modifica-nome');
    const modificaCognomeInput = document.getElementById('modifica-cognome');
    const modificaEmailInput = document.getElementById('modifica-email');
    const modificaTelefonoInput = document.getElementById('modifica-telefono');
    const annullaModificaClienteBtn = document.getElementById('annullaModificaClienteBtn');
	
	// --- NUOVI RIFERIMENTI PER IL SOPRANNOME ---
	const soprannomeSpan = document.getElementById("soprannome-cliente");
	const modificaSoprannomeInput = document.getElementById('modifica-soprannome');
	// --- FINE NUOVI RIFERIMENTI ---
	// Sotto la riga di 'modificaSoprannomeInput'
	const modificaTagsInput = document.getElementById('modifica-tags'); 
const profileAvatar = document.getElementById('profile-avatar');

    // Variabili di stato
    let currentClientId = null;
    let searchResultsIds = [];
    let currentIndex = 0;
    let currentClienteData = null;
	// Insieme alle altre variabili di stato
	let stream = null; // Conterrà il flusso video della fotocamera
	let capturedBlob = null; // Conterrà la foto scattata come oggetto Blob
	let trichoStream = null;
	let trichoCapturedBlob = null;

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

// <--- AGGIUNGI QUESTA INTERA NUOVA FUNZIONE QUI ---
function displayClientTags(tags = []) {
    let tagsContainer = document.getElementById('client-tags-container');
    if (!tagsContainer) {
        tagsContainer = document.createElement('div');
        tagsContainer.id = 'client-tags-container';
        tagsContainer.className = 'tags-container';
        const panelTitle = document.querySelector('.client-details-panel .panel-title');
        if (panelTitle) {
            panelTitle.parentNode.insertBefore(tagsContainer, panelTitle.nextSibling);
        }
    }

    tagsContainer.innerHTML = ''; 

    if (tags && tags.length > 0) {
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'client-tag';
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag.toLowerCase().trim().replace(/\s+/g, '-');
            tagsContainer.appendChild(tagElement);
        });
    }
}

function displayStatoPagamento(stato) {
    if (!statoPagamentoBadge) return; // Controllo di sicurezza

    // Rimuove le classi di stile precedenti per evitare conflitti
    statoPagamentoBadge.classList.remove('status-regolare', 'status-sospeso');
    
    if (stato === 'sospeso') {
        statoPagamentoBadge.textContent = 'In Sospeso';
        statoPagamentoBadge.classList.add('status-sospeso');
    } else { // 'regolare' e qualsiasi altro caso
        statoPagamentoBadge.textContent = 'Regolare';
        statoPagamentoBadge.classList.add('status-regolare');
    }
}


    async function loadClientData(clientId) {
    if (!clientId) {
        showMessage("ID Cliente non fornito.", 'error');
        return;
    }
    try {
        // --- PARTE 1: Recupera i dati principali del cliente ---
        const clientResponse = await fetch(`/api/clienti/${clientId}`);
        const data = await handleApiResponse(clientResponse);
        if (!data || !clientResponse.ok) throw new Error(data?.error || "Errore caricamento dati cliente.");
        
        const client = data.client;
        if (!client) {
            showMessage("Cliente non trovato.", 'error');
            return;
        }

        currentClienteData = client; // Salva i dati base

        // --- PARTE 2 (NUOVA): Recupera le foto e imposta l'avatar ---
        const photoResponse = await fetch(`/api/clienti/${clientId}/photos`);
        const allPhotos = await handleApiResponse(photoResponse) || [];
        currentClienteData.photos = allPhotos; // Salva le foto per un uso futuro

        const profilePhoto = allPhotos.find(p => (p.tags || []).includes('profilo'));
        
        if (profilePhoto) {
            profileAvatar.src = profilePhoto.url;
        } else {
            profileAvatar.src = '/img/default-avatar.png';
        }

        // --- PARTE 3: Popola il resto della pagina con i dati ---
        nomeCompletoSpan.textContent = `${client.nome} ${client.cognome}`;
        soprannomeSpan.textContent = client.soprannome || "N/A";
        emailSpan.textContent = client.email || "N/A";
        telefonoSpan.textContent = client.telefono || "N/A";
        clienteNoteTextarea.value = client.preferenze_note || '';
        displayClientTags(client.tags);
		displayStatoPagamento(client.stato_pagamento);
        displayAcquisti(client.storico_acquisti);
        displayTrattamenti(data.trattamenti || []);
        
        // --- PARTE 4: Avvia il caricamento delle gallerie ---
        loadStyleClientPhotos(clientId);
        loadTrichoClientPhotos(clientId);

    } catch (error) {
        console.error("Errore in loadClientData:", error);
        showMessage(`Errore: ${error.message}`, 'error');
    }
}

    function displayTrattamenti(trattamenti) {
    listaTrattamentiBody.innerHTML = '';
    if (trattamenti.length === 0) {
        // La tabella ora ha 7 colonne, quindi aggiorniamo colspan
        listaTrattamentiBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nessun trattamento registrato.</td></tr>';
        return;
    }

    // L'ordinamento è già gestito dal backend, quindi questa riga non è più necessaria
    // trattamenti.sort((a, b) => new Date(a.data_trattamento) - new Date(b.data_trattamento));
    
    trattamenti.forEach(trattamento => {
        const row = listaTrattamentiBody.insertRow();
        
        row.insertCell().textContent = trattamento.tipo_trattamento;
        row.insertCell().textContent = trattamento.descrizione || 'N/A';
        row.insertCell().textContent = new Date(trattamento.data_trattamento).toLocaleDateString('it-IT');
        row.insertCell().textContent = trattamento.prezzo ? `€ ${parseFloat(trattamento.prezzo).toFixed(2)}` : 'N/A';

        // --- NUOVA CELLA PER LA CHECKBOX "PAGATO" ---
        const pagatoCell = row.insertCell();
        pagatoCell.style.textAlign = 'center';
        const pagatoCheckbox = document.createElement('input');
        pagatoCheckbox.type = 'checkbox';
        pagatoCheckbox.checked = trattamento.pagato;
        pagatoCheckbox.title = trattamento.pagato ? 'Marcato come Pagato' : 'Marca come Pagato';
        
        // Quando l'utente clicca, chiamiamo la funzione per aggiornare il DB
        pagatoCheckbox.addEventListener('change', () => {
            updateStatoPagamentoTrattamento(trattamento.id, pagatoCheckbox.checked);
        });
        pagatoCell.appendChild(pagatoCheckbox);
        // --- FINE NUOVA CELLA ---

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
        listaAcquistiBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nessun acquisto registrato.</td></tr>';
        return;
    }

    // Ordiniamo qui per visualizzazione, ma l'indice originale è importante per le modifiche
    const acquistiOrdinati = [...acquisti]
        .map((acquisto, index) => ({ ...acquisto, originalIndex: index })) // Aggiungiamo l'indice originale
        .sort((a, b) => new Date(a.data) - new Date(b.data));

    acquistiOrdinati.forEach(acquisto => {
        const isNewFormat = 'prezzo_unitario' in acquisto;
        
        const prezzoUnitario = isNewFormat ? acquisto.prezzo_unitario : acquisto.prezzo;
        const quantita = acquisto.quantita || 1;
        const prezzoTotale = prezzoUnitario * quantita;
        const isPagato = isNewFormat ? (acquisto.pagato || false) : true;

        const row = listaAcquistiBody.insertRow();
        row.insertCell().textContent = acquisto.prodotto;
        row.insertCell().textContent = new Date(acquisto.data).toLocaleDateString('it-IT');
        row.insertCell().textContent = `€ ${parseFloat(prezzoUnitario).toFixed(2)}`;
        row.insertCell().textContent = quantita;
        row.insertCell().textContent = `€ ${prezzoTotale.toFixed(2)}`;

        const pagatoCell = row.insertCell();
        pagatoCell.style.textAlign = 'center';
        const pagatoCheckbox = document.createElement('input');
        pagatoCheckbox.type = 'checkbox';
        pagatoCheckbox.checked = isPagato;
        
        // Per i vecchi acquisti, la checkbox è disabilitata
        pagatoCheckbox.disabled = !isNewFormat;
        pagatoCheckbox.title = isNewFormat 
            ? (isPagato ? 'Marcato come Pagato' : 'Marca come Pagato') 
            : 'Acquisto in vecchio formato (considerato pagato)';
        
        if (isNewFormat) {
            pagatoCheckbox.addEventListener('change', () => {
                // Usiamo l'INDICE ORIGINALE non ordinato per modificare l'array giusto
                updateStatoPagamentoAcquisto(acquisto.originalIndex, pagatoCheckbox.checked);
            });
        }
        pagatoCell.appendChild(pagatoCheckbox);

        row.insertCell().textContent = acquisto.note || "N/A";
        
        const actionCell = row.insertCell();
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️ Elimina";
        deleteButton.className = "btn btn-delete";
        deleteButton.onclick = () => confirmDeleteAcquisto(acquisto.originalIndex); // Usiamo l'indice originale
        actionCell.appendChild(deleteButton);
    });
}
	
// VERSIONE COMPLETA CON INFO SOTTO LA MINIATURA
	async function loadStyleClientPhotos(clientId) {
    const galleryContent = document.getElementById('photo-gallery-content');
    const filterContainer = document.getElementById('photo-tags-filter-container');

    galleryContent.innerHTML = '<p class="loading-message">Caricamento foto...</p>';
    filterContainer.innerHTML = '';

    try {
        const response = await fetch(`/api/clienti/${clientId}/photos`);
        const photos = await handleApiResponse(response);
		const stylePhotos = photos.filter(p => !(p.tags || []).includes('_trico'));
        galleryContent.innerHTML = '';

        if (!stylePhotos || stylePhotos.length === 0) {
            galleryContent.innerHTML = '<p>Nessuna foto presente.</p>';
            return;
        }

        // --- 1. CREAZIONE DEGLI ELEMENTI (Logica Modificata) ---
        stylePhotos.forEach(photo => {
            // Contenitore principale per ogni "card" della foto
            const itemContainer = document.createElement('div');
            itemContainer.className = 'photo-item-container';
            itemContainer.dataset.tags = (photo.tags || []).join(',').toLowerCase();

            // Contenitore per la miniatura cliccabile e le azioni
            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'photo-thumbnail';
            
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = photo.didascalia || 'Foto cliente';
            thumbDiv.onclick = () => {
                fullscreenPhoto.src = photo.url;
                openModal(viewPhotoModal);
            };
            thumbDiv.appendChild(img);

            // Contenitore per i bottoni di azione (Modifica/Elimina)
            const actionsOverlay = document.createElement('div');
            actionsOverlay.className = 'photo-actions-overlay';

            const editBtn = document.createElement('button');
            editBtn.className = 'photo-action-btn edit';
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Modifica Dettagli';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                openEditPhotoModal(photo);
            };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'photo-action-btn delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Elimina Foto';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm('Sei sicuro di voler eliminare questa foto?')) {
                    deletePhoto(photo.id);
                }
            };

            actionsOverlay.appendChild(editBtn);
            actionsOverlay.appendChild(deleteBtn);
            thumbDiv.appendChild(actionsOverlay);

            // Contenitore per le informazioni testuali (sotto la foto)
            const infoContainer = document.createElement('div');
            infoContainer.className = 'photo-info-container';

            if (photo.didascalia) {
                const didascaliaP = document.createElement('p');
                didascaliaP.className = 'photo-didascalia';
                didascaliaP.textContent = photo.didascalia;
                infoContainer.appendChild(didascaliaP);
            }

            if (photo.tags && photo.tags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'photo-tags-container';
                photo.tags.forEach(tagText => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'photo-tag';
                    tagEl.textContent = tagText;
                    tagsContainer.appendChild(tagEl);
                });
                infoContainer.appendChild(tagsContainer);
            }

            // Assembla la card completa: prima l'immagine, poi le info
            itemContainer.appendChild(thumbDiv);
            if (infoContainer.hasChildNodes()) {
                itemContainer.appendChild(infoContainer);
            }
            galleryContent.appendChild(itemContainer);
        });

        // --- 2. LOGICA DEI FILTRI (Aggiornata per il nuovo contenitore) ---
        const allTags = stylePhotos.flatMap(p => p.tags || []);
        const uniqueTags = [...new Set(allTags)];
        uniqueTags.sort();

        const filterPhotos = (tagToFilter) => {
            const allItems = galleryContent.querySelectorAll('.photo-item-container'); // <-- Selettore aggiornato
            
            allItems.forEach(item => {
                const itemTagsArray = item.dataset.tags.split(',');
                if (!tagToFilter || itemTagsArray.includes(tagToFilter.toLowerCase())) {
                    item.style.display = 'flex'; // Usiamo flex perché il contenitore è flex-direction: column
                } else {
                    item.style.display = 'none';
                }
            });
            
            filterContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
                if (btn.dataset.tag === tagToFilter) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        const allBtn = document.createElement('button');
        allBtn.className = 'tag-filter-btn active';
        allBtn.textContent = 'Mostra Tutti';
        allBtn.dataset.tag = '';
        allBtn.onclick = () => filterPhotos('');
        filterContainer.appendChild(allBtn);

        uniqueTags.forEach(tag => {
            const filterBtn = document.createElement('button');
            filterBtn.className = 'tag-filter-btn';
            filterBtn.textContent = tag;
            filterBtn.dataset.tag = tag;
            filterBtn.onclick = () => filterPhotos(tag);
            filterContainer.appendChild(filterBtn);
        });

    } catch (error) {
        console.error('Errore nel caricamento delle foto:', error);
        galleryContent.innerHTML = '<p class="error-message">Impossibile caricare le foto.</p>';
    }
}

// NUOVA FUNZIONE PER CARICARE LE FOTO DELLA GALLERIA TRICO
async function loadTrichoClientPhotos(clientId) {
    const galleryContent = trichoPhotoGalleryContent; // Usa il contenitore TRICO
    const filterContainer = trichoPhotoTagsFilterContainer; // Usa il contenitore filtri TRICO

    galleryContent.innerHTML = '<p class="loading-message">Caricamento foto...</p>';
    if (filterContainer) filterContainer.innerHTML = '';

    try {
        const response = await fetch(`/api/clienti/${clientId}/photos`);
        const allPhotos = await handleApiResponse(response);
        if (!allPhotos) return;

        // FILTRA E PRENDE SOLO LE FOTO CON IL TAG '_trico'
        const trichoPhotos = allPhotos.filter(p => (p.tags || []).includes('_trico'));

        galleryContent.innerHTML = '';
        if (trichoPhotos.length === 0) {
            galleryContent.innerHTML = '<p>Nessuna foto presente.</p>';
            return;
        }

        trichoPhotos.forEach(photo => {
            // Rimuove il tag speciale '_trico' prima di mostrarli
            const displayTags = (photo.tags || []).filter(t => t !== '_trico');
            
            const itemContainer = document.createElement('div');
            itemContainer.className = 'photo-item-container';
            itemContainer.dataset.tags = displayTags.join(',').toLowerCase();

            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'photo-thumbnail';
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = photo.didascalia || 'Foto cliente';
            thumbDiv.onclick = () => {
                fullscreenPhoto.src = photo.url;
                openModal(viewPhotoModal);
            };
            thumbDiv.appendChild(img);

            const actionsOverlay = document.createElement('div');
            actionsOverlay.className = 'photo-actions-overlay';
            const editBtn = document.createElement('button');
            editBtn.className = 'photo-action-btn edit';
            editBtn.innerHTML = '✏️';
            editBtn.title = 'Modifica Dettagli';
            editBtn.onclick = (e) => { e.stopPropagation(); openEditPhotoModal(photo); };
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'photo-action-btn delete';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.title = 'Elimina Foto';
            deleteBtn.onclick = (e) => { e.stopPropagation(); if (confirm('Sei sicuro?')) { deletePhoto(photo.id); } };
            actionsOverlay.appendChild(editBtn);
            actionsOverlay.appendChild(deleteBtn);
            thumbDiv.appendChild(actionsOverlay);

            const infoContainer = document.createElement('div');
            infoContainer.className = 'photo-info-container';
            if (photo.didascalia) {
                const didascaliaP = document.createElement('p');
                didascaliaP.className = 'photo-didascalia';
                didascaliaP.textContent = photo.didascalia;
                infoContainer.appendChild(didascaliaP);
            }
            if (displayTags.length > 0) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'photo-tags-container';
                displayTags.forEach(tagText => {
                    const tagEl = document.createElement('span');
                    tagEl.className = 'photo-tag';
                    tagEl.textContent = tagText;
                    tagsContainer.appendChild(tagEl);
                });
                infoContainer.appendChild(tagsContainer);
            }
            itemContainer.appendChild(thumbDiv);
            if (infoContainer.hasChildNodes()) { itemContainer.appendChild(infoContainer); }
            galleryContent.appendChild(itemContainer);
        });

        const allDisplayTags = trichoPhotos.flatMap(p => (p.tags || []).filter(t => t !== '_trico'));
        const uniqueTags = [...new Set(allDisplayTags)];
        uniqueTags.sort();
        
        const filterPhotos = (tagToFilter) => {
            const allItems = galleryContent.querySelectorAll('.photo-item-container');
            allItems.forEach(item => {
                const itemTagsArray = item.dataset.tags.split(',');
                if (!tagToFilter || itemTagsArray.includes(tagToFilter.toLowerCase())) {
                    item.style.display = 'flex';
                } else { item.style.display = 'none'; }
            });
            filterContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tag === tagToFilter);
            });
        };

        const allBtn = document.createElement('button');
        allBtn.className = 'tag-filter-btn active';
        allBtn.textContent = 'Mostra Tutti';
        allBtn.dataset.tag = '';
        allBtn.onclick = () => filterPhotos('');
        filterContainer.appendChild(allBtn);
        uniqueTags.forEach(tag => {
            const filterBtn = document.createElement('button');
            filterBtn.className = 'tag-filter-btn';
            filterBtn.textContent = tag;
            filterBtn.dataset.tag = tag;
            filterBtn.onclick = () => filterPhotos(tag);
            filterContainer.appendChild(filterBtn);
        });
    } catch (error) {
        console.error('Errore caricamento foto Trico:', error);
        galleryContent.innerHTML = '<p class="error-message">Impossibile caricare le foto.</p>';
    }
}



// =======================================================
// === NUOVE FUNZIONI PER LA GESTIONE DELLA FOTOCAMERA ===
// =======================================================

// Funzione per avviare la fotocamera
async function startCamera() {
    try {
        // Chiede al browser l'accesso alla fotocamera
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Preferisce la fotocamera posteriore sui cellulari
        });
        cameraVideo.srcObject = stream;
        // Passa alla vista della fotocamera
        photoChoiceView.style.display = 'none';
        cameraView.style.display = 'block';
        previewView.style.display = 'none';
    } catch (err) {
        console.error("Errore nell'accesso alla fotocamera:", err);
        showMessage("Impossibile accedere alla fotocamera. Assicurati di aver dato i permessi.", "error");
    }
}

// Funzione per fermare lo stream video
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// Funzione per scattare la foto
function takePhoto() {
    cameraCanvas.width = cameraVideo.videoWidth;
    cameraCanvas.height = cameraVideo.videoHeight;
    const context = cameraCanvas.getContext('2d');
    context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
    
    // Converte l'immagine del canvas in un Blob (un "file" in memoria)
    cameraCanvas.toBlob(blob => {
        capturedBlob = blob;
        photoPreview.src = URL.createObjectURL(blob);
        // Ferma la fotocamera e passa alla vista di anteprima
        stopCamera();
        cameraView.style.display = 'none';
        previewView.style.display = 'block';
    }, 'image/jpeg', 0.9); // Salva come JPEG di alta qualità
}

// Funzione per tornare indietro alla scelta iniziale
function resetPhotoModal() {
    stopCamera();
    capturedBlob = null;
    // Ripristina la visibilità, mostrando solo la prima vista
    photoChoiceView.style.display = 'block';
    cameraView.style.display = 'none';
    previewView.style.display = 'none';
    // Pulisce il campo file per evitare confusioni
    document.getElementById('photo-file').value = '';
}


// =======================================================
// === FUNZIONI DUPLICATE PER LA FOTOCAMERA 'TRICO' ===
// =======================================================

async function startTrichoCamera() {
    try {
        trichoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }
        });
        trichoCameraVideo.srcObject = trichoStream;
        trichoPhotoChoiceView.style.display = 'none';
        trichoCameraView.style.display = 'block';
        trichoPreviewView.style.display = 'none';
    } catch (err) {
        console.error("Errore nell'accesso alla fotocamera Trico:", err);
        showMessage("Impossibile accedere alla fotocamera. Assicurati di aver dato i permessi.", "error");
    }
}

function stopTrichoCamera() {
    if (trichoStream) {
        trichoStream.getTracks().forEach(track => track.stop());
        trichoStream = null;
    }
}

function takeTrichoPhoto() {
    trichoCameraCanvas.width = trichoCameraVideo.videoWidth;
    trichoCameraCanvas.height = trichoCameraVideo.videoHeight;
    const context = trichoCameraCanvas.getContext('2d');
    context.drawImage(trichoCameraVideo, 0, 0, trichoCameraCanvas.width, trichoCameraCanvas.height);
    
    trichoCameraCanvas.toBlob(blob => {
        trichoCapturedBlob = blob;
        trichoPhotoPreview.src = URL.createObjectURL(blob);
        stopTrichoCamera();
        trichoCameraView.style.display = 'none';
        trichoPreviewView.style.display = 'block';
    }, 'image/jpeg', 0.9);
}

function resetTrichoPhotoModal() {
    stopTrichoCamera();
    trichoCapturedBlob = null;
    trichoPhotoChoiceView.style.display = 'block';
    trichoCameraView.style.display = 'none';
    trichoPreviewView.style.display = 'none';
    document.getElementById('tricho-photo-file').value = '';
}

// =======================================================
// === FUNZIONI PER GESTIRE I DETTAGLI DELLE FOTO ===
// =======================================================

// Funzione per eliminare una foto
async function deletePhoto(photoId) {
    try {
        const response = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Errore server durante l\'eliminazione.');
        showMessage('Foto eliminata con successo.', 'success');
        // Ricarica entrambe le gallerie per riflettere la cancellazione
        loadStyleClientPhotos(currentClientId);
        loadTrichoClientPhotos(currentClientId);
    } catch (error) {
        console.error('Errore eliminazione foto:', error);
        showMessage('Errore durante l\'eliminazione della foto.', 'error');
    }
}

// Funzione per aprire la modale di modifica con i dati della foto
function openEditPhotoModal(photo) {
    editPhotoIdInput.value = photo.id;
    editPhotoPreview.src = photo.url;
    editPhotoDidascaliaInput.value = photo.didascalia || '';
    editPhotoTagsInput.value = (photo.tags || []).join(', ');
    openModal(editPhotoModal);
}

// Funzione per salvare le modifiche ai dettagli della foto
async function handleEditPhoto(event) {
    event.preventDefault();
    
    const photoId = editPhotoIdInput.value;
    const didascalia = editPhotoDidascaliaInput.value.trim();
    const tagsString = editPhotoTagsInput.value.trim();
    let tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    try {
        // Prima di salvare, controlliamo se la foto originale era 'trico'
    const originalPhoto = currentClienteData.photos.find(p => p.id == photoId);
        
        if (originalPhoto && (originalPhoto.tags || []).includes('_trico')) {
            tags.push('_trico'); // Se era una foto trico, ri-aggiungiamo il tag nascosto
        }

        const response = await fetch(`/api/photos/${photoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ didascalia, tags })
        });

        const data = await handleApiResponse(response);
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante l\'aggiornamento.');
        }

        showMessage('Dettagli della foto aggiornati!', 'success');
        closeModal(editPhotoModal, formEditPhoto);
        // Ricarica entrambe le gallerie per vedere le modifiche
        loadStyleClientPhotos(currentClientId);
        loadTrichoClientPhotos(currentClientId);

    } catch (error) {
        console.error('Errore durante la modifica della foto:', error);
        showMessage(`Errore: ${error.message}`, 'error');
    }
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

async function updateStatoPagamentoTrattamento(trattamentoId, nuovoStato) {
    showMessage("Aggiornamento in corso...", 'info');

    try {
        // 1. Recuperiamo i dati completi del trattamento che stiamo per modificare.
        // Questo è necessario perché il tuo backend si aspetta l'oggetto completo per la modifica.
        const responseTrattamento = await fetch(`/api/trattamenti/${trattamentoId}`);
        if (!responseTrattamento.ok) {
            throw new Error('Impossibile recuperare i dati del trattamento da modificare.');
        }
        const trattamento = await responseTrattamento.json();

        // 2. Aggiorniamo solo il campo 'pagato' con il nuovo valore (true/false) dalla checkbox.
        trattamento.pagato = nuovoStato;

        // 3. Inviamo l'intero oggetto aggiornato al backend.
        const updateResponse = await fetch(`/api/trattamenti/${trattamentoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trattamento)
        });

        // La funzione handleApiResponse gestisce già i possibili errori di rete/server.
        const data = await handleApiResponse(updateResponse);
        if (!updateResponse.ok) {
            throw new Error(data.error || 'Errore durante l\'aggiornamento del trattamento.');
        }

        // 4. Se tutto va a buon fine, ricarichiamo i dati del cliente.
        // Questo è il modo più semplice e sicuro per garantire che sia la tabella
        // che il badge principale "Sospeso/Regolare" siano perfettamente sincronizzati.
        await loadClientData(currentClientId);

        // Mostriamo il messaggio di successo solo alla fine, quando l'utente vede l'interfaccia aggiornata.
        showMessage("Stato pagamento aggiornato!", 'success');

    } catch (error) {
        console.error("Errore nell'aggiornare lo stato di pagamento:", error);
        showMessage(`Errore: ${error.message}`, 'error');
        
        // In caso di errore, è una buona pratica ricaricare comunque i dati.
        // Questo assicura che la checkbox torni allo stato reale presente nel database,
        // evitando che l'utente veda uno stato che non è stato salvato.
        await loadClientData(currentClientId);
    }
}

// --- INCOLLA QUESTO BLOCCO AL POSTO DELLA VECCHIA FUNZIONE updateStatoPagamentoAcquisto ---
async function updateStatoPagamentoAcquisto(acquistoIndex, nuovoStato) {
    showMessage("Aggiornamento in corso...", 'info');

    try {
        let storicoAcquisti = [];
        if (currentClienteData && currentClienteData.storico_acquisti) {
            storicoAcquisti = JSON.parse(currentClienteData.storico_acquisti);
        }

        if (acquistoIndex < 0 || acquistoIndex >= storicoAcquisti.length) {
            throw new Error("Acquisto non trovato per la modifica.");
        }
        
        const acquistoDaModificare = storicoAcquisti[acquistoIndex];
        
        if (!('prezzo_unitario' in acquistoDaModificare)) {
            acquistoDaModificare.prezzo_unitario = acquistoDaModificare.prezzo;
            delete acquistoDaModificare.prezzo;
        }
        acquistoDaModificare.pagato = nuovoStato;
        
        // Prepariamo il corpo della richiesta con i dati aggiornati
        const updatedStorico = JSON.stringify(storicoAcquisti);

        const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storico_acquisti: updatedStorico })
        });

        const dataResponse = await handleApiResponse(response);
        if (!response.ok) {
            throw new Error(dataResponse.error || "Errore durante il salvataggio.");
        }
        
        // ==========> LA MODIFICA CHIAVE È QUI <==========
        // Invece di ridisegnare solo la tabella, ora ricarichiamo TUTTI i dati.
        // Questo garantisce che anche il badge dello stato generale venga aggiornato.
        await loadClientData(currentClientId);
        
        showMessage("Stato pagamento acquisto aggiornato!", 'success');
        
    } catch (error) {
        console.error("Errore nell'aggiornare lo stato dell'acquisto:", error);
        showMessage(`Errore: ${error.message}`, 'error');
        await loadClientData(currentClientId);
    }
}


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

    // --- SOSTITUISCI LA VECCHIA handleAddAcquisto ---
async function handleAddAcquisto(event) {
    event.preventDefault();
    const prodotto = prodottoAcquistoInput.value.trim();
    const data = dataAcquistoInput.value;
    const prezzo_unitario = parseFloat(prezzoAcquistoInput.value);
    const quantita = parseInt(quantitaAcquistoInput.value);
    const note = noteAcquistoTextarea.value.trim();
    // Leggiamo lo stato della nuova checkbox
    const pagato = pagatoAcquistoInput.checked;

    if (!prodotto || !data || isNaN(prezzo_unitario) || isNaN(quantita) || prezzo_unitario < 0 || quantita < 1) {
        showMessage("Compila tutti i campi obbligatori con valori validi.", 'error');
        return;
    }

    // Creiamo l'oggetto acquisto includendo il valore di 'pagato'
    const nuovoAcquisto = { 
        prodotto, 
        data, 
        prezzo_unitario,
        quantita, 
        pagato, // <-- valore dinamico dalla checkbox
        note 
    };

    try {
        let storicoAcquisti = [];
        if (currentClienteData && currentClienteData.storico_acquisti) {
            try {
                storicoAcquisti = JSON.parse(currentClienteData.storico_acquisti);
            } catch (e) {
                console.error("Storico acquisti malformato, verrà sovrascritto.", e);
            }
        }
        storicoAcquisti.push(nuovoAcquisto);
        
        const response = await fetch(`/api/clienti/${currentClientId}/acquisti`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ storico_acquisti: JSON.stringify(storicoAcquisti) })
        });
        
        const dataResponse = await handleApiResponse(response);
        if (!response.ok) {
            throw new Error(dataResponse.error || "Errore durante l'aggiunta dell'acquisto.");
        }
        
        showMessage("Acquisto aggiunto!", 'success');
        closeModal(modalAggiungiAcquisto, formAggiungiAcquisto);
        loadClientData(currentClientId);
    } catch (error) {
        console.error("Errore aggiunta acquisto:", error);
        showMessage(`Errore: ${error.message}`, 'error');
    }
}

    // --- SOSTITUISCI LA VECCHIA handleAddTrattamento ---
async function handleAddTrattamento(event) {
    event.preventDefault();
    if (!currentClientId) {
        showMessage("ID cliente mancante.", 'error');
        return;
    }
    const tipo_trattamento = tipoTrattamentoInput.value.trim();
    const data_trattamento = dataTrattamentoInput.value;
    const prezzo_trattamento = parseFloat(prezzoTrattamentoInput.value);
    // Leggiamo lo stato della nuova checkbox
    const pagato = pagatoTrattamentoInput.checked;

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
            // Aggiungiamo il campo 'pagato' all'oggetto inviato
            body: JSON.stringify({
                cliente_id: currentClientId,
                tipo_trattamento,
                data_trattamento,
                prezzo: prezzo_trattamento,
                descrizione: descrizioneTrattamentoInput.value.trim(),
                note: noteTrattamentoInput.value.trim(),
                pagato // <-- valore dinamico dalla checkbox
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

    // --- Logica per gestire i tag ---
    const tagsString = modificaTagsInput.value.trim();
    const tagsArray = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    // --------------------------------

    const updatedCliente = {
        nome: modificaNomeInput.value.trim(),
        cognome: modificaCognomeInput.value.trim(),
        soprannome: modificaSoprannomeInput.value.trim(),
        email: modificaEmailInput.value.trim(),
        telefono: modificaTelefonoInput.value.trim(),
        tags: tagsArray // <--- Aggiungiamo l'array di tag all'oggetto da inviare
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
        loadClientData(currentClientId); // Questo ricaricherà i dati e mostrerà i nuovi tag
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
			modificaSoprannomeInput.value = currentClienteData.soprannome || ''; // <-- AGGIUNGI QUESTA RIGA
            modificaEmailInput.value = currentClienteData.email || '';
            modificaTelefonoInput.value = currentClienteData.telefono || '';
			modificaTagsInput.value = (currentClienteData.tags || []).join(', '); // <--- AGGIUNGI QUESTA RIGA
            openModal(modificaClienteModal);
        } else {
            showMessage("Dati cliente non disponibili per la modifica.", 'info');
        }
    });
    annullaModificaClienteBtn.addEventListener('click', () => closeModal(modificaClienteModal, formModificaCliente));
    formModificaCliente.addEventListener('submit', handleModificaCliente);
	
    // =======================================================
    // === EVENT LISTENERS PER LA GALLERIA (VERSIONE SICURA) ===
    // =======================================================
    
    if(addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            resetPhotoModal();
            openModal(addPhotoModal);
        });
    }

    if(cancelPhotoBtn) {
        cancelPhotoBtn.addEventListener('click', () => {
            resetPhotoModal();
            closeModal(addPhotoModal, formAddPhoto);
        });
    }
    
    if(startCameraBtn) {
        startCameraBtn.addEventListener('click', startCamera);
    }

    if(cancelCameraBtn) {
        cancelCameraBtn.addEventListener('click', () => {
            stopCamera();
            resetPhotoModal();
        });
    }

    if(takePhotoBtn) {
        takePhotoBtn.addEventListener('click', takePhoto);
    }
    
    if(retakePhotoBtn) {
        retakePhotoBtn.addEventListener('click', () => {
            capturedBlob = null;
            startCamera();
        });
    }

    if(usePhotoBtn) {
        usePhotoBtn.addEventListener('click', () => {
            if (capturedBlob) {
                const photoFile = new File([capturedBlob], "scatto.jpg", { type: "image/jpeg" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(photoFile);
                document.getElementById('photo-file').files = dataTransfer.files;
                previewView.style.display = 'none';
                photoChoiceView.style.display = 'block';
                showMessage("Foto pronta per l'upload. Aggiungi didascalia/tag e carica.", "info");
            }
        });
    }

    if(formAddPhoto) {
        formAddPhoto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const photoFileInput = document.getElementById('photo-file');
            if (photoFileInput.files.length === 0) {
                showMessage('Per favore, seleziona un file o scatta una foto.', 'error');
                return;
            }
            const formData = new FormData();
            formData.append('clientImage', photoFileInput.files[0]);
            formData.append('didascalia', document.getElementById('photo-didascalia').value);
            formData.append('tags', document.getElementById('photo-tags').value);
            showMessage('Caricamento foto in corso...', 'info');
            try {
                const response = await fetch(`/api/clienti/${currentClientId}/photos`, {
                    method: 'POST',
                    body: formData
                });
                const data = await handleApiResponse(response);
                if (!response.ok) {
                    throw new Error(data.error || 'Errore durante l\'upload.');
                }
                showMessage('Foto caricata con successo!', 'success');
                resetPhotoModal();
                closeModal(addPhotoModal, formAddPhoto);
                loadStyleClientPhotos(currentClientId);
            } catch (error) {
                console.error("Errore durante l'upload della foto:", error);
                showMessage(`Errore: ${error.message}`, 'error');
            }
        });
    }
    
    if(closeViewPhotoBtn) {
        closeViewPhotoBtn.addEventListener('click', () => closeModal(viewPhotoModal));
    }

    if(viewPhotoModal) {
        viewPhotoModal.addEventListener('click', (e) => {
            if (e.target === viewPhotoModal) {
                closeModal(viewPhotoModal);
            }
        });
    }



// =======================================================
// === EVENT LISTENERS PER LA GALLERIA 'TRICO' (Nuova) ===
// =======================================================

if(addTrichoPhotoBtn) {
    addTrichoPhotoBtn.addEventListener('click', () => {
        resetTrichoPhotoModal();
        openModal(addTrichoPhotoModal);
    });
}
if(cancelTrichoPhotoBtn) {
    cancelTrichoPhotoBtn.addEventListener('click', () => {
        resetTrichoPhotoModal();
        closeModal(addTrichoPhotoModal, formAddTrichoPhoto);
    });
}
if(trichoStartCameraBtn) {
    trichoStartCameraBtn.addEventListener('click', startTrichoCamera);
}
if(trichoCancelCameraBtn) {
    trichoCancelCameraBtn.addEventListener('click', () => {
        stopTrichoCamera();
        resetTrichoPhotoModal();
    });
}
if(trichoTakePhotoBtn) {
    trichoTakePhotoBtn.addEventListener('click', takeTrichoPhoto);
}
if(trichoRetakePhotoBtn) {
    trichoRetakePhotoBtn.addEventListener('click', () => {
        trichoCapturedBlob = null;
        startTrichoCamera();
    });
}
if(trichoUsePhotoBtn) {
    trichoUsePhotoBtn.addEventListener('click', () => {
        if (trichoCapturedBlob) {
            const photoFile = new File([trichoCapturedBlob], "scatto_trico.jpg", { type: "image/jpeg" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(photoFile);
            document.getElementById('tricho-photo-file').files = dataTransfer.files;
            trichoPreviewView.style.display = 'none';
            trichoPhotoChoiceView.style.display = 'block';
            showMessage("Foto pronta per l'upload.", "info");
        }
    });
}
if(formAddTrichoPhoto) {
    formAddTrichoPhoto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const photoFileInput = document.getElementById('tricho-photo-file');
        if (photoFileInput.files.length === 0) {
            showMessage('Seleziona un file o scatta una foto.', 'error');
            return;
        }
        const formData = new FormData();
        formData.append('clientImage', photoFileInput.files[0]);
        formData.append('didascalia', document.getElementById('tricho-photo-didascalia').value);
        
        // Aggiunge il tag nascosto '_trico' ai tag inseriti dall'utente
        const tags = document.getElementById('tricho-photo-tags').value;
        const finalTags = tags ? `_trico, ${tags}` : '_trico';
        formData.append('tags', finalTags);

        showMessage('Caricamento foto in corso...', 'info');
        try {
            const response = await fetch(`/api/clienti/${currentClientId}/photos`, {
                method: 'POST',
                body: formData
            });
            const data = await handleApiResponse(response);
            if (!response.ok) { throw new Error(data.error || 'Errore upload.'); }
            
            showMessage('Foto Trico caricata!', 'success');
            resetTrichoPhotoModal();
            closeModal(addTrichoPhotoModal, formAddTrichoPhoto);
            loadTrichoClientPhotos(currentClientId); // Ricarica solo la galleria trico
        } catch (error) {
            console.error("Errore upload trico:", error);
            showMessage(`Errore: ${error.message}`, 'error');
        }
    });
}


// Aggiungi questo blocco alla fine della sezione degli event listeners

if(cancelEditPhotoBtn) {
    cancelEditPhotoBtn.addEventListener('click', () => closeModal(editPhotoModal, formEditPhoto));
}
if(formEditPhoto) {
    formEditPhoto.addEventListener('submit', handleEditPhoto);
}


    // --- 7. AVVIO ---
    getClientIdsFromSearch();
});