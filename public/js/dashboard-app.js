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
	
	// --- RIFERIMENTI DOM PER I CLIENTI A RISCHIO (NUOVO) ---
const clientiARischioContainer = document.getElementById('clienti-a-rischio-container');
	
	

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

// --- RIFERIMENTI DOM PER IL BLOCCO NOTE (NUOVO) ---
const bloccoNoteTextarea = document.getElementById('blocco-note-textarea');
const bloccoNoteStatus = document.getElementById('blocco-note-status');

const apriMappaBtn = document.getElementById('apri-mappa-btn');
const mappaSaloneModal = document.getElementById('mappa-salone-modal');
const closeMappaBtn = document.getElementById('close-mappa-btn');
const mappaIframe = document.getElementById('mappa-iframe');

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
        // === LOGICA PER IL SALUTO DINAMICO ===
const oraCorrente = new Date().getHours();
let saluto;

if (oraCorrente < 12) {
    saluto = "👋 Buongiorno, che il vento soffi sempre alle tue spalle.";
} else if (oraCorrente < 17) {
    saluto = "👋 Buon Pomeriggio, il sole tramonta, ma non la tua determinazione.";
} else {
    saluto = "🌙 Buonasera, ogni storia finisce. E anche ogni giornata.";
}

summaryGreeting.textContent = saluto;
// ===================================

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
        <small>per </small><strong style="color: yellow;">${buono.beneficiario_nome} ${buono.beneficiario_cognome}</strong><br>
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


// --- FUNZIONE PER CARICARE E MOSTRARE I CLIENTI "A RISCHIO" ---
async function fetchAndDisplayClientiARischio() {
    if (!clientiARischioContainer) {
        console.error("Contenitore 'clienti-a-rischio-container' non trovato.");
        return;
    }

    try {
        const response = await fetch('/api/clienti/a-rischio');
        const clienti = await handleApiResponse(response);
        if (!clienti) {
            clientiARischioContainer.innerHTML = '<p class="error">Impossibile caricare la lista dei clienti.</p>';
            return;
        }

        // Pulisce il contenitore prima di riempirlo
        clientiARischioContainer.innerHTML = ''; 
        
        if (clienti.length === 0) {
            clientiARischioContainer.innerHTML = '<p class="info">Fantastico! Nessun cliente "a rischio" attualmente.</p>';
            return;
        }

        // Crea e aggiunge un elemento per ogni cliente
        clienti.forEach(cliente => {
            const listItem = document.createElement('div');
            listItem.className = 'rischio-item'; // Classe CSS per stilizzare il widget

            // Logica per determinare la severità del rischio e lo stile
            let emoji = '⏳';
            if (cliente.giorni_di_ritardo > 90) {
                emoji = '🚨';
                listItem.style.backgroundColor = 'rgba(255, 100, 100, 0.1)'; // Sfondo più scuro per avviso
            } else if (cliente.giorni_di_ritardo > 60) {
                emoji = '⚠️';
                listItem.style.backgroundColor = 'rgba(255, 200, 0, 0.1)';
            }
            
            const daysText = cliente.giorni_di_ritardo === 1 ? '1 giorno' : `${cliente.giorni_di_ritardo} giorni`;

            listItem.innerHTML = `
                <div class="rischio-info">
                    <span class="rischio-emoji">${emoji}</span>
                    <a href="/scheda-cliente.html?id=${cliente.id}" class="rischio-link">${cliente.nome} ${cliente.cognome}</a>
                </div>
                <div class="rischio-dettagli">
                    <span>Manca da ${daysText}</span>
                </div>
            `;
            
            clientiARischioContainer.appendChild(listItem);
        });

    } catch (error) {
        console.error('Errore nel caricamento dei clienti a rischio:', error);
        clientiARischioContainer.innerHTML = '<p class="error">Errore nel caricamento.</p>';
    }
}


	
// --- FUNZIONE PER GESTIRE IL BLOCCO NOTE (NUOVA) ---
function initBloccoNote() {
    let saveTimeout; // Variabile per il timer del salvataggio automatico

    // 1. Carica la nota iniziale dal server
    async function caricaNotaIniziale() {
        try {
            const response = await fetch('/api/note');
            const data = await handleApiResponse(response);
            if (data && data.nota !== undefined) {
                bloccoNoteTextarea.value = data.nota;
            }
        } catch (error) {
            console.error('Errore nel caricamento della nota:', error);
            bloccoNoteStatus.textContent = "Errore di caricamento.";
        }
    }

    // 2. Ascolta ogni modifica nella textarea
    bloccoNoteTextarea.addEventListener('input', () => {
        // Mostra "Salvataggio..."
        bloccoNoteStatus.textContent = "Salvataggio in corso...";
        
        // Cancella il timer precedente per evitare salvataggi multipli
        clearTimeout(saveTimeout);
        
        // Imposta un nuovo timer: dopo 1.5 secondi di inattività, salva.
        saveTimeout = setTimeout(async () => {
            try {
                const notaDaSalvare = bloccoNoteTextarea.value;
                const response = await fetch('/api/note', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nota: notaDaSalvare })
                });
                
                if (!response.ok) throw new Error('Salvataggio fallito');

                const oraSalvataggio = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                bloccoNoteStatus.textContent = `Salvato alle ${oraSalvataggio}`;

            } catch (error) {
                console.error('Errore nel salvataggio della nota:', error);
                bloccoNoteStatus.textContent = "Errore di salvataggio.";
            }
        }, 1500); // 1.5 secondi di ritardo
    });

    // 3. Carica la nota quando la funzione viene chiamata
    caricaNotaIniziale();
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


// --- FUNZIONE PER GESTIRE I PANNELLI COLLASSABILI ---
function initCollapsibles() {
  // Unico listener per tutti i pannelli
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.collapsible-header');
    if (!header) return;

    // Non collassare se il click è su un bottone interno all'header
    if (e.target.closest('button, .btn, a, [data-no-collapse]')) return;

    const panel = header.closest('.collapsible-panel');
    if (!panel) return;

    const arrow = header.querySelector('.collapsible-arrow');
    
    panel.classList.toggle('closed');
    
    if (arrow) {
        arrow.textContent = panel.classList.contains('closed') ? '▼' : '▲';
    }
  });

  // Imposta lo stato iniziale delle frecce
  document.querySelectorAll('.collapsible-panel').forEach(panel => {
    const header = panel.querySelector('.collapsible-header');
    const arrow = header.querySelector('.collapsible-arrow');
    if (header && arrow) {
        arrow.textContent = panel.classList.contains('closed') ? '▼' : '▲';
    }
  });
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
    const sigleTrattamenti = [ 'flash', 'tg', 'tn', 'tratt', 'tr', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul' ];

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

// =========================================================================
// == GESTIONE APPUNTAMENTI CON MINI-CRUSCOTTO (VERSIONE FINALE CORRETTA) ==
// =========================================================================

async function fetchAndDisplayAppointments() {
    if (!appointmentsListContainer) return;

    try {
        const response = await fetch('/api/appuntamenti/oggi');
        const appointments = await handleApiResponse(response);
        if (!appointments) return;

        appointmentsListContainer.innerHTML = '';

        const normalAppointments = [];
        const allDayAppointments = [];

        // LOG: Mostra tutti gli appuntamenti in arrivo
        console.log("=== Appuntamenti ricevuti ===");
        appointments.forEach(app => {
            console.log(
                "summary:", app.summary,
                "| start_time:", app.start_time,
                "| end_time:", app.end_time,
                "| allDay:", app.allDay
            );
        });

        appointments.forEach(app => {
            const start = new Date(app.start_time);
            const end = new Date(app.end_time);

            // LOG: Mostra i valori calcolati per ogni appuntamento
            console.log(
                `[${app.summary}] start:`, start,
                "end:", end,
                "start UTC:", start.getUTCHours(), start.getUTCMinutes(), start.getUTCSeconds(),
                "end UTC:", end.getUTCHours(), end.getUTCMinutes(), end.getUTCSeconds()
            );

            // Identifica gli all-day sia in UTC che in locale
            const isAllDay =
                (app.allDay === true) ||
                (
                    (start.getUTCHours() === 0 || start.getHours() === 0) &&
                    (start.getUTCMinutes() === 0 || start.getMinutes() === 0) &&
                    (start.getUTCSeconds() === 0 || start.getSeconds() === 0) &&
                    (end.getUTCHours() === 0 || end.getHours() === 0) &&
                    (end.getUTCMinutes() === 0 || end.getMinutes() === 0) &&
                    (end.getUTCSeconds() === 0 || end.getSeconds() === 0) &&
                    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) === 1
                );

            // LOG: Mostra la decisione
            console.log(`[${app.summary}] isAllDay:`, isAllDay);

            if (isAllDay) {
                allDayAppointments.push(app);
            } else {
                normalAppointments.push(app);
            }
        });

        // LOG: Riepilogo separazione
        console.log("--- All day appointments ---", allDayAppointments.map(a => a.summary));
        console.log("--- Normal appointments ---", normalAppointments.map(a => a.summary));

        // --- Rendering degli ALL-DAY: SOLO minHeight, MAI height ---
        allDayAppointments.forEach(app => {
            const { backgroundColor, textColor } = getAppointmentColor(app);
            const listItem = document.createElement('li');
            listItem.className = 'appointment-item all-day-item clickable';
            listItem.style.backgroundColor = backgroundColor;
            listItem.style.color = textColor;
            listItem.style.minHeight = '50px'; // solo minHeight!
            // NON impostare height per gli all-day!

            if (app.cliente) listItem.dataset.clienteId = app.cliente.id;

            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center w-100">
                    <span class="appointment-summary" style="color: ${textColor};">${app.summary}</span>
                </div>
            `;
            appointmentsListContainer.appendChild(listItem);

            // LOG: Verifica il rendering all-day
            console.log(`[RENDER ALLDAY] ${app.summary}:`, listItem);
        });

        // --- Rendering degli appuntamenti normali: height proporzionale ---
        if (normalAppointments.length === 0 && allDayAppointments.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.className = 'appointment-item info';
            emptyMsg.textContent = 'Nessun appuntamento per oggi.';
            appointmentsListContainer.appendChild(emptyMsg);
        } else if (normalAppointments.length > 0) {
            normalAppointments.forEach(app => {
                const start = new Date(app.start_time);
                const end = new Date(app.end_time);
                const durationMinutes = (end - start) / 60000;

                const appointmentTime = `${start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
                const { backgroundColor, textColor } = getAppointmentColor(app);

                const listItem = document.createElement('li');
                listItem.className = 'appointment-item clickable';
                listItem.style.backgroundColor = backgroundColor;

                // Height proporzionale SOLO per appuntamenti normali!
                const pixelsPerMinute = 50 / 30;
                listItem.style.height = `${durationMinutes * pixelsPerMinute}px`;
                listItem.style.minHeight = '50px';

                if (app.cliente) listItem.dataset.clienteId = app.cliente.id;

                let detailsPanelHtml = '<div class="appointment-details-panel">';
                if (app.cliente && app.cliente.note) {
                    detailsPanelHtml += `<div class="detail-section"><h5>Note e Preferenze</h5><p>${app.cliente.note}</p></div>`;
                }
                detailsPanelHtml += '</div>';

                listItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center w-100">
                        <div>
                            <span class="appointment-time" style="color: ${textColor};">${appointmentTime}</span>
                            <span class="appointment-summary" style="color: ${textColor};">${app.summary}</span>
                        </div>
                    </div>
                    ${detailsPanelHtml}
                `;

                appointmentsListContainer.appendChild(listItem);

                // LOG: Verifica il rendering normale
                console.log(`[RENDER NORMALE] ${app.summary}: height ${listItem.style.height}`, listItem);
            });
        }

    } catch (error) {
        console.error('Errore caricamento appuntamenti:', error);
        appointmentsListContainer.innerHTML = '<li class="appointment-item error">Errore nel caricamento.</li>';
    }
}






// Listener con delegazione per gestire i click sulla lista appuntamenti
// =========================================================================


appointmentsListContainer.addEventListener('click', async (event) => {
    const listItem = event.target.closest('li.appointment-item.clickable');
    if (!listItem) return;

    // Se l'ID cliente è già presente (dal server), usalo direttamente
    const clienteId = listItem.dataset.clienteId;
    if (clienteId) {
        window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        return;
    }

    const appointmentSummary = listItem.querySelector('.appointment-summary').textContent.trim();
    if (!appointmentSummary) return;

    try {
        const parole = appointmentSummary.split(' ').map(p => p.trim()).filter(p => p);
        const nomeCompleto = (parole.length >= 2) ? `${parole[0]} ${parole[1]}` : parole[0];
        
        // Tentativo 1: Cerca il cliente con una corrispondenza esatta
        let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}&exact=true`);
        let data = await response.json();

        if (data && data.length > 0) {
            window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
            return;
        }

        // Tentativo 2: Se la prima ricerca non ha funzionato, cerca con la prima parola
        const soloPrimaParola = parole[0];
        response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(soloPrimaParola)}&exact=true`);
        data = await response.json();

        if (data && data.length > 0) {
            window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
            return;
        }
        
        // Tentativo 3: Se nessuna delle precedenti ha funzionato, fai una ricerca generica
        response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}`);
        data = await response.json();
        
        if (data && data.length > 0) {
            const ids = data.map(c => c.id);
            alert(`Trovate ${data.length} corrispondenze.`);
            window.location.href = `/scheda-cliente.html?id=${ids[0]}&searchIds=${encodeURIComponent(JSON.stringify(ids))}&index=0`;
        } else {
            alert(`Nessuna corrispondenza trovata per "${nomeCompleto}".`);
        }

    } catch (error) {
        console.error("Errore ricerca cliente:", error);
        alert('Errore durante la ricerca.');
    }
});
    



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
initCollapsibles();
initBloccoNote();
// === CHIAMATA ALLA NUOVA FUNZIONE! ===
fetchAndDisplayClientiARischio();


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






    // == LOGICA PER LA MODALE DELLA MAPPA SALONE (NUOVA) - DA AGGIUNGERE ==
    // ====================================================================
    if (apriMappaBtn) {
        apriMappaBtn.addEventListener('click', () => {
            mappaIframe.src = '/mappa-salone.html';
            mappaSaloneModal.style.display = 'block';
        });
    }

    if (closeMappaBtn) {
        closeMappaBtn.addEventListener('click', () => {
            mappaSaloneModal.style.display = 'none';
            mappaIframe.src = 'about:blank'; 
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target == mappaSaloneModal) {
            mappaSaloneModal.style.display = 'none';
            mappaIframe.src = 'about:blank';
        }
    })


    // =======================================================
    // === GESTIONE MODALE IMPOSTAZIONI E GESTIONE ===
    // =======================================================
    const impostazioniModal = document.getElementById('impostazioni-modal');
    const apriImpostazioniBtn = document.getElementById('apri-impostazioni-btn');
    const chiudiImpostazioniBtn = document.getElementById('close-impostazioni-btn');

    // Funzione per aprire la modale
    if (apriImpostazioniBtn) {
        apriImpostazioniBtn.addEventListener('click', function() {
            impostazioniModal.style.display = 'block';
        });
    }

    // Funzione per chiudere la modale cliccando sulla 'X'
    if (chiudiImpostazioniBtn) {
        chiudiImpostazioniBtn.addEventListener('click', function() {
            impostazioniModal.style.display = 'none';
        });
    }

    // Funzione per chiudere la modale cliccando fuori dal contenuto
    // (Aggiungo anche la tua modale a questa logica che probabilmente già esiste)
    window.addEventListener('click', function(event) {
        if (event.target == impostazioniModal) {
            impostazioniModal.style.display = 'none';
        }
    });


});