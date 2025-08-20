// Codice corretto per public/js/calendario-logic.js

document.addEventListener('DOMContentLoaded', function() {

    // --- FASE 1: INIZIALIZZAZIONE (ESEGUITA UNA SOLA VOLTA) ---
    // Recuperiamo tutti gli elementi HTML necessari una sola volta all'inizio.
    const calendarEl = document.getElementById('calendar');
    const syncButton = document.getElementById('syncButton');
    
    // Elementi del Modal
    const modalElement = document.getElementById('eventActionModal');
    const modalTitle = document.getElementById('modalEventTitle');
    const btnGoToClient = document.getElementById('btnGoToClient');
    const btnEditInGoogle = document.getElementById('btnEditInGoogle');
    const btnDeleteEvent = document.getElementById('btnDeleteEvent');

    // CREIAMO L'OGGETTO MODAL (IL "TELECOMANDO") UNA SOLA VOLTA!
    const eventModal = new bootstrap.Modal(modalElement);

    // --- FASE 2: CONFIGURAZIONE DI FULLCALENDAR ---
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'it',
        firstDay: 1,
        // ... (altre opzioni che avevi già)
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

        // Funzione per creare un nuovo evento (rimane invariata)
        select: function(selectionInfo) {
            const formatDateForGoogleLink = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
            const startTime = formatDateForGoogleLink(selectionInfo.start);
            const endTime = formatDateForGoogleLink(selectionInfo.end);
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${startTime}/${endTime}&text=&details=Appuntamento inserito dal gestionale.`;
            window.open(googleCalendarUrl, '_blank');
            calendar.unselect();
        },

        // Funzione che si attiva al click su un evento (MODIFICATA)
        eventClick: function(info) {
            // Ora non creiamo un nuovo modal, usiamo quello già esistente.
            // Aggiorniamo solo le parti dinamiche.
            
            // 1. Aggiorna il titolo del modal
            modalTitle.textContent = info.event.title;
            
            // 2. Costruisci l'URL di modifica
            const googleEventId = info.event.id.replace('@google.com', '');
            const calendarId = 'qualityhairbolzano@gmail.com';
            const encodedEventDetails = btoa(`${googleEventId} ${calendarId}`).replace(/=/g, '');
            const googleEditUrl = `https://calendar.google.com/calendar/event?eid=${encodedEventDetails}`;

            // 3. Assegna le azioni ai pulsanti
            btnGoToClient.onclick = async () => {
                eventModal.hide();
                // ... (la logica di ricerca cliente qui è la stessa di prima, non la cambio)
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
                window.open(googleEditUrl, '_blank');
                eventModal.hide();
            };

            btnDeleteEvent.onclick = () => {
                if (confirm(`Sei sicuro di voler cancellare l'appuntamento "${info.event.title}"?\n\nVerrai reindirizzato a Google Calendar per completare l'operazione.`)) {
                    window.open(googleEditUrl, '_blank');
                    eventModal.hide();
                }
            };
            
            // 4. Mostra il modal usando l'istanza che abbiamo creato all'inizio
            eventModal.show();
        },

        // Funzione per caricare gli eventi (rimane invariata)
        events: function(fetchInfo, successCallback, failureCallback) {
            // ... (la logica per caricare e colorare gli eventi è la stessa di prima, non la cambio)
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
                        return { id: event.google_event_id, title: event.summary, start: event.start_time, end: event.end_time, allDay: event.is_all_day, color: coloreDaUsare, textColor: testoColore, extendedProps: { description: event.description, location: event.location, creator_email: event.creator_email } };
                    });
                    successCallback(events);
                })
                .catch(error => failureCallback(error));
        }
    });

    // --- FASE 3: AVVIO E LISTENER AGGIUNTIVI ---
    // Mostra il calendario
    calendar.render();

    // Aggiungi il listener per il pulsante di sincronizzazione (rimane invariato)
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
});