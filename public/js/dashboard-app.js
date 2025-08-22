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


// =======================================================
// === LOGICA DI COLORAZIONE (AGGIORNATA E CORRETTA) ===
// =======================================================
function getAppointmentColor(app) {
    // La nostra mappa dei colori personalizzata, identica a quella del calendario
    const googleColorMap = { 
        '1': '#a4bdfc', 
        '2': '#81C784',  // <-- Colore Sandro/Clienti
        '3': '#dbadff', 
        '4': '#ff887c', 
        '5': '#fbd75b', 
        '6': '#ffb878',  // <-- Colore Arancione ("Nessuno")
        '7': '#46d6db',  // <-- Colore Tino
        '8': '#e1e1e1', 
        '9': '#5484ed', 
        '10': '#51b749', 
        '11': '#dc2127' 
    };

    const coloreGenerale = googleColorMap['6']; // Arancione di default
    const sigleTrattamenti = [ 'tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul' ];

    let backgroundColor = coloreGenerale;
    let textColor = '#FFFFFF'; // Default testo bianco
    const titolo = app.summary ? app.summary.toLowerCase() : '';

    // Logica unificata e pulita
    if (app.color_id && googleColorMap[app.color_id]) {
        // Se c'è un colorId (da scelta operatore), usa la mappa
        backgroundColor = googleColorMap[app.color_id];
    } else if (sigleTrattamenti.some(sigla => titolo.endsWith(' ' + sigla) || titolo.endsWith(sigla) || titolo.includes(' ' + sigla + ' '))) {
        // Altrimenti, se il titolo contiene una sigla, usa il verde clienti
        backgroundColor = googleColorMap['2']; // Usa il verde clienti/Sandro dalla mappa
    } else {
        // Altrimenti, usa il colore generale (Arancione)
        backgroundColor = coloreGenerale;
    }

    // REGOLA FINALE PER IL COLORE DEL TESTO
    // Se il colore di sfondo è uno di questi, il testo diventa nero.
    const coloriConTestoNero = ['#fbd75b', '#ffb878', '#e1e1e1', '#81C784'];
    if (coloriConTestoNero.includes(backgroundColor.toLowerCase())) {
        textColor = '#000000';
    }
    
    return { backgroundColor, textColor };
}




    // Funzione per caricare e mostrare gli appuntamenti

async function fetchAndDisplayAppointments() {
    const listElement = document.getElementById('lista-appuntamenti');
    if (!listElement) return;

    try {
        const response = await fetch('/api/appuntamenti/oggi');
        const appointments = await handleApiResponse(response);
        if (!appointments) return;

        listElement.innerHTML = '';
        if (appointments.length === 0) {
            listElement.innerHTML = '<li class="appointment-item info">Nessun appuntamento per oggi.</li>';
            return;
        }

        appointments.forEach(app => {
            const appointmentTime = new Date(app.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const { backgroundColor, textColor } = getAppointmentColor(app);

            const listItem = document.createElement('li');
            listItem.className = 'appointment-item';
            listItem.style.backgroundColor = backgroundColor;
            
            let whatsappIconHtml = '';
            if (app.cliente && app.cliente.telefono) {
                let telefono = app.cliente.telefono.trim();

                // --- NORMALIZZAZIONE NUMERO ---
                // Se numero italiano che inizia con 3 (es. 3331234567), aggiungiamo prefisso 39
                if (/^3\d{8,9}$/.test(telefono)) {
                    telefono = "39" + telefono;
                }
                // Rimuoviamo qualsiasi carattere non numerico (+, spazi, trattini)
                telefono = telefono.replace(/[^\d]/g, '');
                // --- FINE NORMALIZZAZIONE ---

                const nomeCliente = app.summary.trim().split(' ')[0];
                const messaggio = encodeURIComponent(`Ciao ${nomeCliente}, ti ricordiamo il tuo appuntamento da Quality Hair oggi alle ${appointmentTime}. A dopo!`);

                // --- COSTRUZIONE LINK WHATSAPP ---
                const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
                let whatsappLink;
                if (isMobile) {
                    // Su smartphone funziona meglio wa.me
                    whatsappLink = `https://wa.me/${telefono}?text=${messaggio}`;
                } else {
                    // Su PC apriamo WhatsApp Web con messaggio precompilato
                    whatsappLink = `https://web.whatsapp.com/send?phone=${telefono}&text=${messaggio}`;
                }
                // --- FINE COSTRUZIONE LINK ---

                whatsappIconHtml = `<a href="${whatsappLink}" class="whatsapp-icon" target="_blank" title="Invia promemoria WhatsApp">💬</a>`;
            }

            listItem.innerHTML = `
                <div class="appointment-details">
                    <span class="appointment-time" style="color: ${textColor};">${appointmentTime}</span>
                    <span class="appointment-summary" style="color: ${textColor};">${app.summary}</span>
                </div>
                ${whatsappIconHtml}
            `;

            if (app.cliente && app.cliente.id) {
                listItem.querySelector('.appointment-details').classList.add('clickable');
                listItem.querySelector('.appointment-details').addEventListener('click', () => {
                    window.location.href = `/scheda-cliente.html?id=${app.cliente.id}`;
                });
            }
            
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
	
// ========================
// PANNELLO MUSICA - DASHBOARD
// ========================

// Pulsanti
// Pulsanti
const btnRadio = document.getElementById('play-radiofreccia');
const btnSpotify = document.getElementById('play-spotify');
const btnPlayer = document.getElementById('play-player');

// Apri Radiofreccia in nuova finestra
btnRadio.addEventListener('click', () => {
    window.open('https://ascoltareradio.com/freccia/', '_blank');
});

// Apri Spotify in nuova finestra
btnSpotify.addEventListener('click', () => {
    window.open('https://open.spotify.com/', '_blank');
});

// Apri Player Musica esterno
btnPlayer.addEventListener('click', () => {
    window.open('http://79.6.136.236:32400/web/index.html#!/server/6ebfb71d58fed1206d2c273ca1b96e2e9c3ead61/playlist?key=%2Fplaylists%2F19976&context=source%3Acontent.playlists~0~5', '_blank');
});




});