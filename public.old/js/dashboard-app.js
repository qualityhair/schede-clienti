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
        async function searchClientFromEvent(rawTitle) {
        const title = (rawTitle || '').trim();
        if (!title) {
            showMessage('Titolo evento non valido.', 'error');
            return;
        }

        // --- Tentativo #1: Ricerca per Nome e Cognome esatti ---
        const parole = title.split(' ');
        const nomeCompleto = (parole.length > 1) ? `${parole[0]} ${parole[1]}` : parole[0];
        
        try {
            let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}&exact=true`);
            let data = await handleApiResponse(response);

            if (data && data.length === 1) {
                // SUCCESSO AL PRIMO TENTATIVO! Trovato un unico cliente per nome e cognome.
                showMessage(`Trovata corrispondenza esatta per "${nomeCompleto}".`, 'success');
                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
                }, 1000);
                return; // Esce dalla funzione
            }

            // --- Tentativo #2: Ricerca per Soprannome esatto (solo se il primo fallisce) ---
            const soloPrimaParola = parole[0];
            
            response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(soloPrimaParola)}&exact=true`);
            data = await handleApiResponse(response);

            if (data && data.length === 1) {
                // SUCCESSO AL SECONDO TENTATIVO! Trovato un unico cliente per soprannome.
                showMessage(`Trovata corrispondenza esatta per il soprannome "${soloPrimaParola}".`, 'success');
                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
                }, 1000);
                return; // Esce dalla funzione
            }

            // --- Se entrambi i tentativi falliscono ---
            if (data && data.length > 1) {
                showMessage(`Trovate troppe corrispondenze per "${title}". Usa la ricerca manuale.`, 'info');
            } else {
                showMessage(`Nessuna corrispondenza trovata per "${title}".`, 'info');
            }

        } catch (error) {
            console.error("Errore ricerca da evento:", error);
            showMessage('Errore critico durante la ricerca da evento.', 'error');
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

});