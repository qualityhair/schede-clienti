// ===================================================================
// == FILE /public/js/dashboard-app.js - VERSIONE FINALE UNIFICATA ==
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- RIFERIMENTI AGLI ELEMENTI DOM ---
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const newClientNameInput = document.getElementById("new-client-name");
    const newClientSurnameInput = document.getElementById("new-client-surname");
    const newClientEmailInput = document.getElementById("new-client-email");
    const newClientPhoneInput = document.getElementById("new-client-phone");
    const addNewClientButton = document.getElementById("add-new-client-button");
    const appointmentsListContainer = document.getElementById('lista-appuntamenti');
	const newClientTagsInput = document.getElementById("new-client-tags");

// Riferimenti per la modale di preparazione
const prepareAppointmentModal = document.getElementById('prepare-appointment-modal');
const prepCloseBtn = document.getElementById('prep-close-btn');
const prepAvatar = document.getElementById('prep-avatar');
const prepClientName = document.getElementById('prep-client-name');
const prepClientTags = document.getElementById('prep-client-tags');
const prepLastPhotoContainer = document.getElementById('prep-last-photo-container');
const prepLastFormula = document.getElementById('prep-last-formula');
const prepLastAnalysis = document.getElementById('prep-last-analysis');
const prepFullCardBtn = document.getElementById('prep-full-card-btn');
const prepWhatsappBtn = document.getElementById('prep-whatsapp-btn');
const prepEmailBtn = document.getElementById('prep-email-btn');



    // --- FUNZIONI DI UTILITÀ ---

    // Funzione per mostrare un messaggio temporaneo all'utente
    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.className = `custom-message message-${type}`;
        document.body.insertBefore(messageDiv, document.body.firstChild);
        setTimeout(() => messageDiv.remove(), 3000);
    }

    // Gestione generica delle risposte API (dal tuo codice originale)
    async function handleApiResponse(response) {
        if (response.redirected) {
            window.location.href = response.url;
            return null;
        }
        if (response.status === 401 || response.status === 403) {
            showMessage('Sessione scaduta o non autorizzato. Verrai reindirizzato al login.', 'error');
            setTimeout(() => { window.location.href = '/'; }, 1500);
            return null;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        console.error("Risposta API non valida:", response);
        showMessage('Errore imprevisto nella comunicazione con il server.', 'error');
        return null;
    }

function openModal(modalElement) {
    if (modalElement) modalElement.classList.add('open');
}

function closeModal(modalElement, formToReset = null) {
    if (modalElement) modalElement.classList.remove('open');
    if (formToReset) formToReset.reset();
}

    // --- LOGICA PANNELLO "CERCA CLIENTE" ---

    async function handleSearchClient() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            showMessage("Per favore, inserisci un nome o cognome.", 'info');
            return;
        }
        try {
            const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
            const data = await handleApiResponse(response);
            if (!data) return;

            if (data.length > 0) {
                const clientIds = data.map(client => client.id);
                const encodedClientIds = encodeURIComponent(JSON.stringify(clientIds));
                showMessage(`Trovati ${data.length} clienti. Reindirizzamento...`, 'success');
                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${data[0].id}&searchIds=${encodedClientIds}&index=0`;
                }, 1500);
            } else {
                showMessage(`Nessun cliente trovato per "${searchTerm}".`, 'info');
            }
        } catch (error) {
            console.error("Errore ricerca cliente:", error);
            showMessage('Errore critico durante la ricerca.', 'error');
        }
    }


    // --- LOGICA PANNELLO "NUOVO CLIENTE" ---

    async function handleAddNewClient() {
    const nome = newClientNameInput.value.trim();
    const cognome = newClientSurnameInput.value.trim();
    
    // Aggiungiamo la lettura anche dei campi opzionali
    const soprannome = document.getElementById('new-client-nickname').value.trim();
    const email = newClientEmailInput.value.trim();
    const telefono = newClientPhoneInput.value.trim();

    // --- NUOVA PARTE: Leggiamo e prepariamo i tag ---
    const tagsInput = newClientTagsInput.value.trim();
    const tagsArray = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    // ---------------------------------------------

    if (!nome || !cognome) {
        showMessage("Nome e Cognome sono obbligatori.", 'error');
        return;
    }

    // Creiamo l'oggetto cliente completo, inclusi i tag
    const newClientData = { nome, cognome, soprannome, email, telefono, tags: tagsArray };

    try {
        const response = await fetch("/api/clienti", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newClientData) // Inviamo il nuovo oggetto completo
        });
        const data = await handleApiResponse(response);
        if (!data) return;

        if (data.id) {
            showMessage(`Cliente ${nome} ${cognome} aggiunto!`, 'success');
            // Puliamo tutti i campi, incluso quello dei tag
            newClientNameInput.value = ""; 
            newClientSurnameInput.value = "";
            document.getElementById('new-client-nickname').value = "";
            newClientEmailInput.value = ""; 
            newClientPhoneInput.value = "";
            newClientTagsInput.value = ""; // Puliamo anche il campo dei tag

            setTimeout(() => {
                window.location.href = `/scheda-cliente.html?id=${data.id}`;
            }, 1500);
        } else {
            throw new Error(data.error || "ID non restituito dal server.");
        }
    } catch (error) {
        console.error("Errore aggiunta cliente:", error);
        showMessage(`Errore durante l'aggiunta: ${error.message}`, 'error');
    }
}

// ==========================================================
// === LOGICA DI COLORAZIONE (COPIATA DA CALENDARIO.HTML) ===
// ==========================================================
// Sostituisci la vecchia getAppointmentColor con questa
function getAppointmentColor(app) {
    const googleColorMap = {
        '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
        '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
        '9': '#5484ed', '10': '#51b749', '11': '#dc2127'
    };
    
    // Colori di default
    let backgroundColor = '#FF9800'; // Mandarino (Generale)
    let textColor = '#FFFFFF';       // Bianco

    // Logica Google Calendar
    if (app.color_id && googleColorMap[app.color_id]) {
        backgroundColor = googleColorMap[app.color_id];
        // Se il colore è chiaro, usa testo nero, altrimenti bianco (la tua logica!)
        const coloriChiari = ['#fbd75b', '#ffb878', '#e1e1e1', '#a4bdfc', '#7ae7bf'];
        if (coloriChiari.includes(backgroundColor.toLowerCase())) {
            textColor = '#000000';
        }
    } else {
        // Logica personalizzata
        const titolo = app.summary ? app.summary.toLowerCase() : '';
        const sigleTrattamenti = ['tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul'];
        
        if (titolo.includes('tino')) {
            backgroundColor = '#46d6db'; // Pavone
            textColor = '#FFFFFF';
        } else if (titolo.includes('sandro')) {
            backgroundColor = '#81C784'; // Salvia
            textColor = '#FFFFFF';
        } else if (sigleTrattamenti.some(sigla => titolo.endsWith(' ' + sigla) || titolo.endsWith(sigla) || titolo.includes(' ' + sigla + ' '))) {
            backgroundColor = '#81C784'; // Salvia
            textColor = '#000000';
        }
    }

    return { backgroundColor, textColor };
}



    // --- LOGICA PANNELLO "APPUNTAMENTI DI OGGI" ---

    // Funzione per cercare un cliente dal titolo di un evento
        // VERSIONE AGGIORNATA CHE APRE LA MODALE DI PREPARAZIONE
async function searchClientFromEvent(rawTitle) {
    const title = (rawTitle || '').trim();
    if (!title) { showMessage('Titolo evento non valido.', 'error'); return; }

    // Pulisce il nome per la ricerca
    const parole = title.split(' ');
    const nomeDaCercare = (parole.length > 1) ? `${parole[0]} ${parole[1]}` : parole[0];

    try {
        // Cerchiamo il cliente per trovare il suo ID
        const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeDaCercare)}`);
        const clients = await handleApiResponse(response);

        if (!clients || clients.length === 0) {
            showMessage(`Nessun cliente trovato per "${nomeDaCercare}".`, 'info');
            return;
        }

        // Se trova più clienti, per ora prendiamo il primo (il più pertinente)
        const clienteId = clients[0].id;
        
        // Apriamo la modale di preparazione con l'ID del cliente trovato
        openPreparationModal(clienteId);

    } catch (error) {
        console.error("Errore ricerca da evento:", error);
        showMessage('Errore critico durante la ricerca da evento.', 'error');
    }
}

// NUOVA FUNZIONE PER APRIRE E POPOLARE LA MODALE DI PREPARAZIONE
async function openPreparationModal(clienteId) {
    // Reset dei contenuti
    prepAvatar.src = '/img/default-avatar.png';
    prepClientName.textContent = 'Caricamento...';
    prepClientTags.innerHTML = '';
    prepLastPhotoContainer.innerHTML = '<p>...</p>';
    prepLastFormula.innerHTML = '<strong>Formula Colore:</strong><p>...</p>';
    prepLastAnalysis.innerHTML = '<p>...</p>';
    prepWhatsappBtn.style.display = 'none';
    prepEmailBtn.style.display = 'none';

    openModal(prepareAppointmentModal);

    try {
        // --- 1. Recupera i dati principali e le foto del cliente ---
        const clientResponse = await fetch(`/api/clienti/${clienteId}`);
        const clientData = await handleApiResponse(clientResponse);
        if (!clientData || !clientData.client) throw new Error('Dati cliente non trovati.');
        
        const photoResponse = await fetch(`/api/clienti/${clienteId}/photos`);
        const allPhotos = await handleApiResponse(photoResponse) || [];

        const cliente = clientData.client;

        // --- 2. Popola l'header ---
        prepClientName.textContent = `${cliente.nome} ${cliente.cognome}`;
        prepFullCardBtn.href = `/scheda-cliente.html?id=${cliente.id}`;

        const profilePhoto = allPhotos.find(p => (p.tags || []).includes('profilo'));
        if (profilePhoto) {
            prepAvatar.src = profilePhoto.url;
        }

        if (cliente.tags && cliente.tags.length > 0) {
            cliente.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'client-tag';
                tagElement.textContent = tag;
                tagElement.dataset.tag = tag.toLowerCase().trim();
                prepClientTags.appendChild(tagElement);
            });
        }

// --- 3. Popola l'ultimo lavoro (foto e dettagli tecnici) ---
            const lastStylePhoto = allPhotos.find(p => {
                const tags = p.tags || [];
                return !tags.includes('_trico') && !tags.includes('profilo');
            });
            if (lastStylePhoto) {
                prepLastPhotoContainer.innerHTML = `<img src="${lastStylePhoto.url}" alt="Ultimo lavoro">`;
            } else {
                prepLastPhotoContainer.innerHTML = '<p>Nessuna foto "style" trovata.</p>';
            }

                       // --- NUOVA LOGICA: Mostra l'ultimo servizio effettuato (con stile) ---
            const trattamenti = clientData.trattamenti || [];
            if (trattamenti.length > 0) {
                const ultimoTrattamento = trattamenti[0];
                const dataFormattata = new Date(ultimoTrattamento.data_trattamento).toLocaleDateString('it-IT');
                
                // Usiamo una struttura a div con classi per un migliore styling
                prepLastFormula.innerHTML = `
                    <strong>Ultimo Servizio (${dataFormattata}):</strong>
                    <div class="prep-last-service-details">
                        <div class="detail-row">
                            <strong>Tipo:</strong>
                            <span>${ultimoTrattamento.tipo_trattamento}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Dettagli:</strong>
                            <span>${ultimoTrattamento.descrizione || 'Nessuna descrizione.'}</span>
                        </div>
                    </div>
                `;
            } else {
                prepLastFormula.innerHTML = '<strong>Ultimo Servizio:</strong><p>Nessun servizio registrato.</p>';
            }
            // --- FINE NUOVA LOGICA ---

                    // --- 4. Popola l'ultima analisi (con stile e più dettagli) ---
            const analysisResponse = await fetch(`/api/clienti/${clienteId}/analisi/riepilogo`);
            const riepilogo = await handleApiResponse(analysisResponse);
            if (riepilogo) {
                // Usiamo la stessa struttura a div con classi dell'altro pannello
                prepLastAnalysis.innerHTML = `
                    <div class="prep-last-service-details">
                        <div class="detail-row">
                            <strong>Esigenza:</strong>
                            <span>${riepilogo.esigenza_cliente || 'N/D'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Diagnosi:</strong>
                            <span>${riepilogo.diagnosi_primaria || 'N/D'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Piano:</strong>
                            <span>${riepilogo.piano_trattamenti || 'Nessun piano specificato.'}</span>
                        </div>
                    </div>
                `;
            } else {
                prepLastAnalysis.innerHTML = '<p style="background-color: #2a2a2a; padding: 10px; border-radius: 6px;">Nessuna analisi trovata.</p>';
            }
            // --- FINE NUOVA LOGICA ---

        // --- 5. Arma i bottoni di contatto ---
        if (cliente.email) {
            const subject = encodeURIComponent("Info sul tuo appuntamento");
            prepEmailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${cliente.email}&su=${subject}`;
            prepEmailBtn.setAttribute('target', '_blank');
            prepEmailBtn.style.display = 'inline-block';
        }
        if (cliente.telefono) {
            const numeroPulito = cliente.telefono.replace(/\s+/g, '');
            prepWhatsappBtn.href = `https://wa.me/${numeroPulito}`;
            prepWhatsappBtn.setAttribute('target', '_blank');
            prepWhatsappBtn.style.display = 'inline-block';
        }

    } catch (error) {
        console.error('Errore durante la preparazione della scheda:', error);
        showMessage('Impossibile caricare i dati di preparazione.', 'error');
        closeModal(prepareAppointmentModal);
    }
}


    // Funzione per caricare e mostrare gli appuntamenti
    async function fetchAndDisplayAppointments() {
    const listElement = document.getElementById('lista-appuntamenti');
    try {
        const response = await fetch('/api/appuntamenti/oggi');
        const appointments = await handleApiResponse(response);
        if (!appointments) return;

        listElement.innerHTML = '';
        if (appointments.length === 0) {
            listElement.innerHTML = '<li class="appointment-item info">Nessun appuntamento per oggi.</li>';
            return;
        }

        // Sostituisci il forEach esistente con questo
appointments.forEach(app => {
    const appointmentTime = new Date(app.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    
    // Ottieni entrambi i colori
    const { backgroundColor, textColor } = getAppointmentColor(app);

    const listItem = document.createElement('li');
    listItem.className = 'appointment-item clickable';
    
    // Applica entrambi gli stili
    listItem.style.backgroundColor = backgroundColor;
    listItem.style.color = textColor;
    
    // Selezioniamo gli span interni per applicare il colore del testo anche a loro
    listItem.innerHTML = `
        <span class="appointment-time">${appointmentTime}</span>
        <span class="appointment-summary">${app.summary}</span>
    `;

    // Applica il colore del testo anche ai figli per specificità
    listItem.querySelectorAll('span').forEach(span => {
        span.style.color = textColor;
    });

    listItem.addEventListener('click', () => searchClientFromEvent(app.summary));
    listElement.appendChild(listItem);
});
    } catch (error) {
        console.error('Errore caricamento appuntamenti:', error);
        listElement.innerHTML = '<li class="appointment-item error">Errore nel caricamento.</li>';
    }
}


    // --- INIZIALIZZAZIONE DEGLI EVENT LISTENERS ---

    if (searchButton) searchButton.addEventListener("click", handleSearchClient);
    if (searchInput) searchInput.addEventListener("keypress", e => { if (e.key === "Enter") handleSearchClient(); });
    if (addNewClientButton) addNewClientButton.addEventListener("click", handleAddNewClient);
    if (appointmentsListContainer) fetchAndDisplayAppointments();
	if (prepCloseBtn) prepCloseBtn.addEventListener('click', () => closeModal(prepareAppointmentModal));

});