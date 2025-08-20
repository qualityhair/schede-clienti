// Codice COMPLETO e CORRETTO per public/js/calendario-logic.js
// Contiene sia il caricamento degli eventi, sia l'apertura del nuovo modal.

document.addEventListener('DOMContentLoaded', function() {

    // --- FASE 1: INIZIALIZZAZIONE ---
    const calendarEl = document.getElementById('calendar');
    const syncButton = document.getElementById('syncButton');
    
    // Elementi del Modal per le azioni (quello che c'era già)
    const modalElement = document.getElementById('eventActionModal');
    const modalTitle = document.getElementById('modalEventTitle');
    const btnGoToClient = document.getElementById('btnGoToClient');
    const btnEditInGoogle = document.getElementById('btnEditInGoogle');
    const btnDeleteEvent = document.getElementById('btnDeleteEvent');
    const eventModal = new bootstrap.Modal(modalElement);
    
    // Elementi del Modal NUOVO (per l'aggiunta)
    const addEventModalEl = document.getElementById('addEventModal');
    const addEventModal = new bootstrap.Modal(addEventModalEl);
	
	const editEventModalEl = document.getElementById('editEventModal');
	const editEventModal = new bootstrap.Modal(editEventModalEl);


    // --- FASE 2: CONFIGURAZIONE DI FULLCALENDAR ---
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'it',
        firstDay: 1,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        navLinks: true,
        editable: false,
        selectable: true,
        displayEventTime: false,

        // Funzione per creare un nuovo evento (MODIFICATA per usare il nostro modal)
        select: function(selectionInfo) {
            document.getElementById('addEventForm').reset();
            const startStr = new Date(selectionInfo.start.getTime() - (selectionInfo.start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            const endStr = new Date(selectionInfo.end.getTime() - (selectionInfo.end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            document.getElementById('eventStart').value = startStr;
            document.getElementById('eventEnd').value = endStr;
            addEventModal.show();
            calendar.unselect();
        },

        // Funzione che si attiva al click su un evento (ORIGINALE)
        eventClick: function(info) {
            modalTitle.textContent = info.event.title;
            const googleEventId = info.event.id.replace('@google.com', '');
            const calendarId = 'qualityhairbolzano@gmail.com';
            const encodedEventDetails = btoa(`${googleEventId} ${calendarId}`).replace(/=/g, '');
            const googleEditUrl = `https://calendar.google.com/calendar/event?eid=${encodedEventDetails}`;

            btnGoToClient.onclick = async () => {
                eventModal.hide();
                const rawTitle = info.event.title.trim();
                if (!rawTitle) return;
                try {
                    const parole = rawTitle.split(' ');
                    const nomeCompleto = (parole.length > 1) ? `${parole[0]} ${parole[1]}` : parole[0];
                    let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}&exact=true`);
                    let data = await response.json();
                    if (data && data.length === 1) { window.location.href = `/scheda-cliente.html?id=${data[0].id}`; return; }
                    const soloPrimaParola = parole[0];
                    response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(soloPrimaParola)}&exact=true`);
                    data = await response.json();
                    if (data && data.length === 1) { window.location.href = `/scheda-cliente.html?id=${data[0].id}`; return; }
                    response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}`);
                    data = await response.json();
                    if (data && data.length > 0) {
                        alert(`Trovate ${data.length} corrispondenze.`);
                        const ids = data.map(c => c.id);
                        window.location.href = `/scheda-cliente.html?id=${ids[0]}&searchIds=${encodeURIComponent(JSON.stringify(ids))}&index=0`;
                    } else { alert(`Nessuna corrispondenza trovata.`); }
                } catch (error) { console.error("Errore ricerca cliente:", error); alert('Errore durante la ricerca.'); }
            };

                                   btnEditInGoogle.onclick = () => {
                eventModal.hide();
                
                const startStr = new Date(info.event.start.getTime() - (info.event.start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                const endStr = new Date(info.event.end.getTime() - (info.event.end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

                document.getElementById('editEventId').value = info.event.id;
                document.getElementById('editEventTitle').value = info.event.title;
                document.getElementById('editEventStart').value = startStr;
                document.getElementById('editEventEnd').value = endStr;

                // --- NUOVA LOGICA PER IL COLORE ---
                const currentColorId = info.event.extendedProps.colorId || "";
                const radioToCheck = document.querySelector(`input[name="operatorColorEdit"][value="${currentColorId}"]`);
                if (radioToCheck) {
                    radioToCheck.checked = true;
                }
                // --- FINE NUOVA LOGICA ---
                
                editEventModal.show();
            };

                        btnDeleteEvent.onclick = async () => {
                if (confirm(`Sei sicuro di voler cancellare definitivamente l'appuntamento "${info.event.title}"?`)) {
                    try {
                        const eventId = info.event.id;
                        
                        // Invia l'ordine di cancellazione al nostro server
                        const response = await fetch(`/api/events/${eventId}`, {
                            method: 'DELETE'
                        });

                        if (!response.ok) {
                            throw new Error('La richiesta di cancellazione è fallita.');
                        }

                        // Se tutto è andato bene, chiudi la finestra e ricarica il calendario
                        eventModal.hide();
                        calendar.refetchEvents();

                    } catch (error) {
                        console.error("Errore durante la cancellazione:", error);
                        alert("Impossibile cancellare l'appuntamento. Riprova.");
                    }
                }
            };
            
            eventModal.show();
        },

        // Funzione per caricare gli eventi (ORIGINALE)
        events: function(fetchInfo, successCallback, failureCallback) {
             fetch('/api/events')
                .then(response => response.json())
                .then(data => {
                     const googleColorMap = { '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c', '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1', '9': '#5484ed', '10': '#51b749', '11': '#dc2127' };
                    const coloreTino = '#46d6db';
                    const coloreSandro = '#81C784';
                    const coloreClienti = '#81C784';
                    const coloreGenerale = '#FF9800';
                    const sigleTrattamenti = [ 'tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul' ];
                    const events = data.map(event => {
                        let coloreDaUsare = null;
                        let testoColore = 'white';
                        if (event.color_id && googleColorMap[event.color_id]) {
                            coloreDaUsare = googleColorMap[event.color_id];
                            testoColore = ['#fbd75b', '#ffb878', '#e1e1e1'].includes(coloreDaUsare.toLowerCase()) ? '#000000' : 'white';
                        } else {
                            const titolo = event.summary ? event.summary.toLowerCase() : '';
                            coloreDaUsare = coloreGenerale;
                            if (sigleTrattamenti.some(sigla => titolo.endsWith(' ' + sigla) || titolo.endsWith(sigla) || titolo.includes(' ' + sigla + ' '))) {
                                coloreDaUsare = coloreClienti;
                                testoColore = '#000000';
                            }
                            if (titolo.includes('sandro')) coloreDaUsare = coloreSandro;
                            if (titolo.includes('tino')) coloreDaUsare = coloreTino;
                        }
                                            return { 
                        id: event.google_event_id, 
                        title: event.summary, 
                        start: event.start_time, 
                        end: event.end_time, 
                        allDay: event.is_all_day, 
                        color: coloreDaUsare, 
                        textColor: testoColore, 
                        extendedProps: { 
                            description: event.description, 
                            location: event.location, 
                            creator_email: event.creator_email,
                            colorId: event.color_id // <-- AGGIUNGI QUESTA RIGA
                        } 
                    };
                    });
                    successCallback(events);
                })
                .catch(error => failureCallback(error));
        }
    });


    // --- FASE 3: AVVIO E LISTENER AGGIUNTIVI ---
    calendar.render();

    syncButton.addEventListener('click', async () => {
        const originalText = syncButton.innerHTML;
        syncButton.innerHTML = 'Sincronizzazione in corso...';
        syncButton.disabled = true;
        try {
            const response = await fetch('/api/sync-now', { method: 'POST' });
            if (!response.ok) throw new Error('Errore dal server.');
            calendar.refetchEvents();
            syncButton.innerHTML = 'Completata!';
            setTimeout(() => { syncButton.innerHTML = originalText; syncButton.disabled = false; }, 2000);
        } catch (error) {
            console.error('Errore sincronizzazione:', error);
            syncButton.innerHTML = 'Errore!';
            setTimeout(() => { syncButton.innerHTML = originalText; syncButton.disabled = false; }, 3000);
        }
    });

        // --- FASE 4: GESTIONE SALVATAGGIO NUOVO EVENTO (VERSIONE FINALE) ---
    document.getElementById('btnSaveEvent').addEventListener('click', async function() {
        // 1. Recuperiamo i dati dal modulo
          const eventData = {
        summary: document.getElementById('eventTitle').value,
        start: document.getElementById('eventStart').value,
        end: document.getElementById('eventEnd').value,
        colorId: document.querySelector('input[name="operatorColorAdd"]:checked').value
    };

        // 2. Controlliamo che il titolo ci sia
        if (!eventData.summary || !eventData.start) {
            alert('Per favore, inserisci almeno un titolo per l\'appuntamento.');
            return;
        }

        try {
            // 3. INVIAMO I DATI AL SERVER con una richiesta POST
            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData) // Convertiamo i dati in formato JSON
            });

            // 4. Controlliamo la risposta del server
            if (!response.ok) {
                // Se il server risponde con un errore, lo mostriamo
                const errorData = await response.json();
                throw new Error(errorData.message || 'Errore durante il salvataggio.');
            }

            // 5. Se tutto è andato bene...
            addEventModal.hide(); // Chiudiamo la finestra
            calendar.refetchEvents(); // E diciamo al calendario di ricaricare TUTTI gli eventi dal server

        } catch (error) {
            // In caso di errore di rete o dal server, mostriamo un allarme
            console.error('Errore salvataggio evento:', error);
            alert(`Impossibile salvare l'appuntamento: ${error.message}`);
        }
    });
	
	
	// --- FASE 5: GESTIONE SALVATAGGIO MODIFICHE EVENTO ---
document.getElementById('btnSaveChanges').addEventListener('click', async function() {
    const eventId = document.getElementById('editEventId').value;
       const eventData = {
        summary: document.getElementById('editEventTitle').value,
        start: document.getElementById('editEventStart').value,
        end: document.getElementById('editEventEnd').value,
        colorId: document.querySelector('input[name="operatorColorEdit"]:checked').value
    };

    if (!eventData.summary || !eventData.start) {
        alert('Il titolo e le date sono obbligatori.');
        return;
    }

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });

        if (!response.ok) {
            throw new Error('Salvataggio delle modifiche fallito.');
        }

        editEventModal.hide();
        calendar.refetchEvents();

    } catch (error) {
        console.error("Errore durante la modifica:", error);
        alert("Impossibile salvare le modifiche. Riprova.");
    }
});

});