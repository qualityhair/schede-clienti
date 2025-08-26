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

// --- RIFERIMENTI DOM PER IL RIEPILOGO GIORNALIERO (NUOVI) ---
const summaryGreeting = document.getElementById('summary-greeting');
const weatherText = document.getElementById('weather-text');
const weatherIcon = document.getElementById('weather-icon');
const sospesiCount = document.getElementById('sospesi-count');
const buoniCount = document.getElementById('buoni-count');
const aforismaFrase = document.getElementById('aforisma-frase');
const aforismaAutore = document.getElementById('aforisma-autore');
const widgetSospesi = document.getElementById('widget-sospesi');
const widgetBuoni = document.getElementById('widget-buoni');
const sospesiModal = document.getElementById('sospesiModal');
const buoniModal = document.getElementById('buoniModal');
const sospesiLista = document.getElementById('sospesi-lista');
const buoniLista = document.getElementById('buoni-lista');




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
	
	
	// --- FUNZIONE PER CARICARE E MOSTRARE IL RIEPILOGO GIORNALIERO (NUOVA) ---
async function fetchAndDisplaySummary() {
    try {
        const response = await fetch('/api/dashboard/summary');
        const data = await handleApiResponse(response);
        if (!data) return;

        // 1. Popola Meteo e Saluto
        if (data.meteo) {
            weatherText.textContent = `Oggi a Bolzano: ${data.meteo.descrizione}, ${data.meteo.temperatura}°C`;
            weatherIcon.src = `https://openweathermap.org/img/wn/${data.meteo.icona}.png`;
            weatherIcon.style.display = 'inline-block';
        }
        summaryGreeting.textContent = "👋 Buongiorno!";

        // 2. Popola Aforisma
        if (data.aforisma) {
            aforismaFrase.textContent = `“${data.aforisma.frase}”`;
            aforismaAutore.textContent = `– ${data.aforisma.autore}`;
        }

        // 3. Popola Metriche e prepara le modali
        sospesiCount.textContent = data.clientiSospesi.count;
        buoniCount.textContent = data.buoniAttivi.count;

        widgetSospesi.onclick = () => {
            sospesiLista.innerHTML = ''; // Pulisce la tabella
            if (data.clientiSospesi.count > 0) {
                data.clientiSospesi.lista.forEach(cliente => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${cliente.nome} ${cliente.cognome}</td>
                        <td>€ ${parseFloat(cliente.totale_sospeso).toFixed(2)}</td>
                        <td><a href="/scheda-cliente.html?id=${cliente.id}" class="btn btn-sm btn-primary">Apri Scheda</a></td>
                    `;
                    sospesiLista.appendChild(row);
                });
            } else {
                sospesiLista.innerHTML = '<tr><td colspan="3">Nessun cliente con pagamenti in sospeso. Ottimo!</td></tr>';
            }
            sospesiModal.style.display = 'block';
        };

        widgetBuoni.onclick = () => {
            buoniLista.innerHTML = ''; // Pulisce la lista
             if (data.buoniAttivi.count > 0) {
                data.buoniAttivi.lista.forEach(buono => {
                    const item = document.createElement('div');
                    item.className = 'summary-list-item';
                    let dettagli = '';
                    if (buono.tipo_buono === 'valore') {
                        dettagli = `Buono a Valore: €${parseFloat(buono.valore_rimanente_euro).toFixed(2)}`;
                    } else {
                        const servizi = buono.servizi_inclusi.map(s => `${s.servizio} (${s.totali - s.usati} rim.)`).join(', ');
                        dettagli = `Pacchetto: ${servizi}`;
                    }
                    item.innerHTML = `
    <div>
        <strong>${buono.descrizione || 'Buono Prepagato'}</strong><br>
        <small>per ${buono.beneficiario_nome} ${buono.beneficiario_cognome}</small><br>
        <em>${dettagli}</em>
    </div>
    <a href="/scheda-cliente.html?id=${buono.beneficiario_id}" class="btn btn-sm btn-primary">Apri Scheda</a>
`;
buoniLista.appendChild(item);
                });
            } else {
                buoniLista.innerHTML = '<p>Nessun buono regalo o pacchetto attualmente attivo.</p>';
            }
            buoniModal.style.display = 'block';
        };

    } catch (error) {
        console.error("Errore nel caricamento del riepilogo:", error);
        // Puoi aggiungere un messaggio di errore nel pannello se vuoi
    }
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

// =========================================================================
// == GESTIONE APPUNTAMENTI CON MINI-CRUSCOTTO (SOSTITUISCE LA VECCHIA LOGICA) ==
// =========================================================================

async function fetchAndDisplayAppointments() {
    if (!appointmentsListContainer) return;
    try {
        const response = await fetch('/api/appuntamenti/oggi');
        const appointments = await handleApiResponse(response);
        if (!appointments) return;

        appointmentsListContainer.innerHTML = '';
        if (appointments.length === 0) {
            appointmentsListContainer.innerHTML = '<li class="appointment-item info">Nessun appuntamento per oggi.</li>';
            return;
        }

        appointments.forEach(app => {
            const appointmentTime = new Date(app.start_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
            const { backgroundColor, textColor } = getAppointmentColor(app);

            const listItem = document.createElement('li');
            listItem.className = 'appointment-item';
            listItem.style.backgroundColor = backgroundColor;

            let statusIconsHtml = '';
            let detailsPanelHtml = '';
            
            if (app.cliente) {
                listItem.classList.add('clickable');
                listItem.dataset.clienteId = app.cliente.id;

                // Costruisci le icone di stato
                if (app.cliente.note || (app.cliente.tags && app.cliente.tags.length > 0)) statusIconsHtml += '<span>💬</span>';
                if (app.cliente.haSospesi) statusIconsHtml += '<span>🚨</span>';
                if (app.cliente.haBuoniAttivi) statusIconsHtml += '<span>🎁</span>';

                // Costruisci il pannello a scomparsa con i dettagli
                detailsPanelHtml += '<div class="appointment-details-panel">';
                if (app.cliente.note) {
                    detailsPanelHtml += `<div class="detail-section"><h5>Note e Preferenze</h5><p>${app.cliente.note}</p></div>`;
                }
                if (app.cliente.tags && app.cliente.tags.length > 0) {
                    const tagsHtml = app.cliente.tags.map(tag => `<span class="client-tag">${tag}</span>`).join('');
                    detailsPanelHtml += `<div class="detail-section"><h5>Tags</h5><div class="tags-container">${tagsHtml}</div></div>`;
                }
                if (app.cliente.haSospesi) {
                    detailsPanelHtml += `<div class="detail-section"><h5>Avvisi</h5><p class="detail-alert">❗️ Cliente con pagamenti in sospeso.</p></div>`;
                }
                if (app.cliente.haBuoniAttivi) {
                    detailsPanelHtml += `<div class="detail-section"><h5>Info</h5><p class="detail-info">✅ Cliente con buoni o pacchetti attivi.</p></div>`;
                }
                detailsPanelHtml += '</div>';
            }
            
            // Assembla l'HTML finale dell'appuntamento
            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div>
                        <span class="appointment-time" style="color: ${textColor};">${appointmentTime}</span>
                        <span class="appointment-summary" style="color: ${textColor};">${app.summary}</span>
                    </div>
                    <div class="appointment-status-icons">${statusIconsHtml}</div>
                </div>
                ${detailsPanelHtml}
            `;
            
            appointmentsListContainer.appendChild(listItem);
        });

    } catch (error) {
        console.error('Errore caricamento appuntamenti:', error);
        appointmentsListContainer.innerHTML = '<li class="appointment-item error">Errore nel caricamento.</li>';
    }
}

// Listener con delegazione per gestire i click sulla lista appuntamenti
// =========================================================================
// == LISTENER POTENZIATO: GESTISCE CLICK E DOPPIO CLICK SULLA LISTA APPUNTAMENTI ==
// =========================================================================

if (appointmentsListContainer) {
    appointmentsListContainer.addEventListener('click', (event) => {
        const listItem = event.target.closest('li.appointment-item.clickable');
        if (!listItem) return;

        // Se l'utente clicca su un link o un bottone specifico all'interno, non facciamo nulla
        if (event.target.closest('a, button')) {
            return;
        }

        const detailsPanel = listItem.querySelector('.appointment-details-panel');
        if (detailsPanel) {
            // Logica per mostrare/nascondere il pannello con un CLICK SINGOLO
            const isVisible = detailsPanel.style.display === 'block';
            detailsPanel.style.display = isVisible ? 'none' : 'block';
        }
    });

    // Aggiungiamo un listener SEPARATO per il DOPPIO CLICK (dblclick)
    appointmentsListContainer.addEventListener('dblclick', (event) => {
        const listItem = event.target.closest('li.appointment-item.clickable');
        if (!listItem) return;

        const clienteId = listItem.dataset.clienteId;
        if (clienteId) {
            // Logica per andare alla scheda cliente con DOPPIO CLICK
            window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        }
    });
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


// --- EVENT LISTENERS PER PANNELLI TEMPO E BUONI---

if (searchButton) searchButton.addEventListener("click", handleSearchClient);
if (searchInput) searchInput.addEventListener("keypress", e => { if (e.key === "Enter") handleSearchClient(); });
if (addNewClientButton) addNewClientButton.addEventListener("click", handleAddNewClient);

// Aggiungi queste due righe per le nuove funzionalità
if (appointmentsListContainer) fetchAndDisplayAppointments();
fetchAndDisplaySummary(); // <-- CHIAMATA ALLA NUOVA FUNZIONE!

// Logica per chiudere le modali del riepilogo
[sospesiModal, buoniModal].forEach(modal => {
    if (modal) {
        // Chiude la modale se si clicca sulla 'x'
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        // Chiude la modale se si clicca fuori dal contenuto
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }
});



});