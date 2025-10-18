// public/js/calendario-logic.js
// Versione completa con:
// - drag normale (sposta) / ALT+drag (duplica)
// - auto cambio settimana ai bordi con ritardo
// - orari locali (niente shift UTC)
// - logiche colore/toolbar/modali come nel tuo file

document.addEventListener('DOMContentLoaded', function () {

  // ---------- Helpers ----------
  const toLocalInputValue = (date) => {
    // Ritorna "YYYY-MM-DDTHH:mm" in ORA LOCALE (come i tuoi input datetime-local)
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
  };

  const toLocalMinuteString = (date) => {
    // Stesso formato degli input, utile per POST/PUT verso il tuo backend
    return toLocalInputValue(date);
  };

  // ---------- Riferimenti DOM ----------
  const calendarEl = document.getElementById('calendar');

  // Modal azioni su evento
  const modalElement = document.getElementById('eventActionModal');
  const modalTitle = document.getElementById('modalEventTitle');
  const btnGoToClient = document.getElementById('btnGoToClient');
  const btnEditInGoogle = document.getElementById('btnEditInGoogle');
  const btnDeleteEvent = document.getElementById('btnDeleteEvent');
  const eventModal = new bootstrap.Modal(modalElement);

  // Modal aggiunta
  const addEventModalEl = document.getElementById('addEventModal');
  const addEventModal = new bootstrap.Modal(addEventModalEl);

  // Modal modifica
  const editEventModalEl = document.getElementById('editEventModal');
  const editEventModal = new bootstrap.Modal(editEventModalEl);

const eventTitleInput = document.getElementById('eventTitle');
const searchResultsContainer = document.getElementById('searchResultsContainer');
const editEventTitleInput = document.getElementById('editEventTitle');
const searchResultsContainerEdit = document.getElementById('searchResultsContainerEdit');


  // ---------- Stato auto-scroll durante drag ----------
  let isDragging = false;
  let edgeTimer = null;
  const EDGE_THRESHOLD = 100;  // px dal bordo
  const EDGE_DELAY = 700;      // ms prima di cambiare settimana

  // ---------- Calendar ----------
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    locale: 'it',
    firstDay: 1,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,syncButton'
    },

    customButtons: {
      syncButton: {
        text: 'Sincronizza',
        click: async function () {
          const syncBtn = document.querySelector('.fc-syncButton-button');
          const originalText = syncBtn.textContent;
          syncBtn.textContent = 'Sinc...';
          syncBtn.disabled = true;
          try {
            await fetch('/api/sync-now', { method: 'POST' });
            calendar.refetchEvents();
            syncBtn.textContent = 'Fatto!';
          } catch (error) {
            console.error('Errore sincronizzazione:', error);
            syncBtn.textContent = 'Errore!';
          } finally {
            setTimeout(() => {
              syncBtn.textContent = originalText;
              syncBtn.disabled = false;
            }, 2000);
          }
        }
      }
    },

    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    navLinks: true,
    editable: true,              // <— abilita drag & drop
    selectable: true,
    displayEventTime: false,
    eventStartEditable: true,
    eventDurationEditable: true,

    // ---------- Selezione slot → apri modal "Nuovo" ----------
    select(selectionInfo) {
      document.getElementById('addEventForm').reset();
      const startStr = toLocalInputValue(selectionInfo.start);
      const endStr = toLocalInputValue(selectionInfo.end);
      document.getElementById('eventStart').value = startStr;
      document.getElementById('eventEnd').value = endStr;
      addEventModal.show();
      calendar.unselect();
    },

    // ---------- Click evento → modal azioni ----------
    eventClick(info) {
      modalTitle.textContent = info.event.title;

      // Vai a scheda cliente (logica identica al tuo file)
      btnGoToClient.onclick = async () => {
        eventModal.hide();
        const rawTitle = info.event.title.trim();
        if (!rawTitle) return;
        try {
          const parole = rawTitle.split(' ');
          const nomeCompleto = (parole.length > 1) ? `${parole[0]} ${parole[1]}` : parole[0];

          let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}&exact=true`);
          let data = await response.json();
          if (data && data.length === 1) {
            window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
            return;
          }

          const soloPrimaParola = parole[0];
          response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(soloPrimaParola)}&exact=true`);
          data = await response.json();
          if (data && data.length === 1) {
            window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
            return;
          }

          response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(nomeCompleto)}`);
          data = await response.json();
          if (data && data.length > 0) {
            alert(`Trovate ${data.length} corrispondenze.`);
            const ids = data.map(c => c.id);
            window.location.href = `/scheda-cliente.html?id=${ids[0]}&searchIds=${encodeURIComponent(JSON.stringify(ids))}&index=0`;
          } else {
            alert(`Nessuna corrispondenza trovata.`);
          }
        } catch (error) {
          console.error("Errore ricerca cliente:", error);
          alert('Errore durante la ricerca.');
        }
      };

      // Modifica (compila modal "Modifica")
      btnEditInGoogle.onclick = () => {
        eventModal.hide();
        const startStr = toLocalInputValue(info.event.start);
        const endStr = toLocalInputValue(info.event.end);
        document.getElementById('editEventId').value = info.event.id;
        document.getElementById('editEventTitle').value = info.event.title;
        document.getElementById('editEventStart').value = startStr;
        document.getElementById('editEventEnd').value = endStr;

        const currentColorId = info.event.extendedProps.colorId || "";
        const radioToCheck =
          document.querySelector(`input[name="operatorColorEdit"][value="${currentColorId}"]`) ||
          document.getElementById('op_default_edit');
        if (radioToCheck) radioToCheck.checked = true;

        editEventModal.show();
      };

      // Cancella
      btnDeleteEvent.onclick = async () => {
        if (confirm(`Sei sicuro di voler cancellare definitivamente l'appuntamento "${info.event.title}"?`)) {
          try {
            const eventId = info.event.id;
            const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('La richiesta di cancellazione è fallita.');
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

    // ---------- Drag terminato (drop) ----------
    // - ALT premuto = DUPLICA
    // - altrimenti = SPOSTA
    eventDrop(info) {
      const altPressed = info.jsEvent && info.jsEvent.altKey;
      const colorId = info.event.extendedProps.colorId || "6"; // preserva colore (default 6)
      const payload = {
        summary: info.event.title,
        start: toLocalMinuteString(info.event.start),
        end: toLocalMinuteString(info.event.end),
        colorId
      };

      if (altPressed) {
        // DUPLICA nella nuova posizione, mantieni l'originale dov'era
        fetch('/api/events/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(r => {
            if (!r.ok) throw new Error('Errore duplicazione');
            // Torna l'evento originale al punto di partenza (abbiamo creato il clone nel nuovo punto)
            info.revert();
            calendar.refetchEvents();
          })
          .catch(err => {
            console.error(err);
            alert('Errore durante la duplicazione.');
            info.revert();
          });
      } else {
        // SPOSTA l'evento esistente
        fetch(`/api/events/${info.event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(r => {
            if (!r.ok) throw new Error('Errore spostamento');
            calendar.refetchEvents();
          })
          .catch(err => {
            console.error(err);
            alert('Errore durante lo spostamento.');
            info.revert();
          });
      }
    },

    // ---------- Ridimensiona durata ----------
    eventResize(info) {
      const colorId = info.event.extendedProps.colorId || "6";
      const payload = {
        summary: info.event.title,
        start: toLocalMinuteString(info.event.start),
        end: toLocalMinuteString(info.event.end),
        colorId
      };
      fetch(`/api/events/${info.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(r => {
          if (!r.ok) throw new Error('Errore modifica durata');
          calendar.refetchEvents();
        })
        .catch(err => {
          console.error(err);
          alert('Errore durante la modifica della durata.');
          info.revert();
        });
    },

    // ---------- Auto-scroll settimana durante il drag ----------
    eventDragStart(info) {
      isDragging = true;
      // Listener sul contenitore del calendario per misurare la posizione del mouse
      calendarEl.addEventListener('mousemove', onCalendarMouseMove);
    },

    eventDragStop(info) {
      isDragging = false;
      calendarEl.removeEventListener('mousemove', onCalendarMouseMove);
      if (edgeTimer) {
        clearTimeout(edgeTimer);
        edgeTimer = null;
      }
    },

    // ---------- Caricamento eventi dal tuo backend con colori ----------
    events(fetchInfo, successCallback, failureCallback) {
      fetch('/api/events')
        .then(response => response.json())
        .then(data => {
          const googleColorMap = {
            '1': '#a4bdfc', '2': '#81C784', '3': '#dbadff', '4': '#ff887c', '5': '#fbd75b',
            '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1', '9': '#5484ed', '10': '#51b749', '11': '#dc2127'
          };
          const coloreGenerale = googleColorMap['6']; // Arancione
          const sigleTrattamenti = ['tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul'];

          const events = data.map(event => {
            let coloreDaUsare = null;
            let testoColore = 'white';
            const titolo = (event.summary || '').toLowerCase();

            if (event.color_id && googleColorMap[event.color_id]) {
              // 1) priorità alla scelta operatore
              coloreDaUsare = googleColorMap[event.color_id];
            } else if (titolo.includes('tino')) {
              // 2) titolo contiene "tino"
              coloreDaUsare = googleColorMap['7'];
            } else if (titolo.includes('sandro')) {
              // 3) titolo contiene "sandro"
              coloreDaUsare = googleColorMap['2'];
            } else if (sigleTrattamenti.some(sig =>
              titolo.endsWith(' ' + sig) || titolo.endsWith(sig) || titolo.includes(' ' + sig + ' ')
            )) {
              // 4) sigle trattamenti
              coloreDaUsare = googleColorMap['2'];
            } else {
              // 5) colore generale
              coloreDaUsare = coloreGenerale;
            }

            // testo nero su sfondi chiari
            const coloriConTestoNero = ['#fbd75b', '#ffb878', '#e1e1e1', '#81C784'];
            if (coloriConTestoNero.includes(coloreDaUsare.toLowerCase())) {
              testoColore = '#000000';
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
                colorId: event.color_id
              }
            };
          });

          successCallback(events);
        })
        .catch(error => failureCallback(error));
    }

  }); // fine new FullCalendar

  // ---------- Gestione auto-scroll ai bordi ----------
  function onCalendarMouseMove(e) {
    if (!isDragging) return;

    const rect = calendarEl.getBoundingClientRect();

    // reset timer ad ogni movimento
    if (edgeTimer) {
      clearTimeout(edgeTimer);
      edgeTimer = null;
    }

    if (e.clientX > rect.right - EDGE_THRESHOLD) {
      edgeTimer = setTimeout(() => {
        calendar.next(); // settimana successiva
      }, EDGE_DELAY);
    } else if (e.clientX < rect.left + EDGE_THRESHOLD) {
      edgeTimer = setTimeout(() => {
        calendar.prev(); // settimana precedente
      }, EDGE_DELAY);
    }
  }

  // ---------- Render ----------
  calendar.render();

  // ---------- Salvataggio NUOVO event (modal "Nuovo") ----------
  document.getElementById('btnSaveEvent').addEventListener('click', async function () {
    const checkedRadio = document.querySelector('input[name="operatorColorAdd"]:checked');
    const selectedColorId = checkedRadio ? checkedRadio.value : "";
    const finalColorId = selectedColorId === "" ? "6" : selectedColorId;

    const eventData = {
      summary: document.getElementById('eventTitle').value,
      start: document.getElementById('eventStart').value, // "YYYY-MM-DDTHH:mm" (locale)
      end: document.getElementById('eventEnd').value,     // "YYYY-MM-DDTHH:mm" (locale)
      colorId: finalColorId
    };

    if (!eventData.summary || !eventData.start) {
      alert('Per favore, inserisci almeno un titolo per l\'appuntamento.');
      return;
    }

    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante il salvataggio.');
      }
      addEventModal.hide();
      calendar.refetchEvents();
    } catch (error) {
      console.error('Errore salvataggio evento:', error);
      alert(`Impossibile salvare l'appuntamento: ${error.message}`);
    }
  });

  // ---------- Salvataggio MODIFICA event (modal "Modifica") ----------
  document.getElementById('btnSaveChanges').addEventListener('click', async function () {
    const eventId = document.getElementById('editEventId').value;

    const checkedRadio = document.querySelector('input[name="operatorColorEdit"]:checked');
    const selectedColorId = checkedRadio ? checkedRadio.value : "";
    const finalColorId = selectedColorId === "" ? "6" : selectedColorId;

    const eventData = {
      summary: document.getElementById('editEventTitle').value,
      start: document.getElementById('editEventStart').value, // "YYYY-MM-DDTHH:mm" (locale)
      end: document.getElementById('editEventEnd').value,     // "YYYY-MM-DDTHH:mm" (locale)
      colorId: finalColorId
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
      if (!response.ok) throw new Error('Salvataggio delle modifiche fallito.');
      editEventModal.hide();
      calendar.refetchEvents();
    } catch (error) {
      console.error("Errore durante la modifica:", error);
      alert("Impossibile salvare le modifiche. Riprova.");
    }
  });

// =======================================================
// == LOGICA PER LA RICERCA CLIENTE LIVE NEL CALENDARIO ==
// =======================================================
// =======================================================
// == LOGICA PER LA RICERCA CLIENTE LIVE NEL CALENDARIO ==
// =======================================================
if (eventTitleInput && searchResultsContainer) {
    let searchTimeout;

    eventTitleInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const searchTerm = eventTitleInput.value.trim();

        if (searchTerm.length < 2) {
            searchResultsContainer.style.display = 'none';
            return;
        }

        searchTimeout = setTimeout(async () => {
            try {
                let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
                let clienti = await response.json();

                // 🔁 Se nessun risultato, prova a invertire "cognome nome" → "nome cognome"
                if (clienti.length === 0 && searchTerm.includes(' ')) {
                    const parts = searchTerm.split(/\s+/);
                    if (parts.length === 2) {
                        const inverted = `${parts[1]} ${parts[0]}`;
                        response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(inverted)}`);
                        clienti = await response.json();
                    }
                }

                searchResultsContainer.innerHTML = '';
                if (clienti.length > 0) {
                    clienti.forEach(cliente => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        div.textContent = `${cliente.nome} ${cliente.cognome}`;
                        
                        div.addEventListener('mousedown', (e) => {
                            e.preventDefault(); // evita blur
                            eventTitleInput.value = `${cliente.nome} ${cliente.cognome}`;
                            searchResultsContainer.style.display = 'none';
                        });

                        searchResultsContainer.appendChild(div);
                    });
                    searchResultsContainer.style.display = 'block';
                } else {
                    searchResultsContainer.style.display = 'none';
                }
            } catch (error) {
                console.error("Errore nella ricerca live:", error);
            }
        }, 300);
    });

    // Nasconde i risultati se l'input perde il focus
    eventTitleInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResultsContainer.style.display = 'none';
        }, 150);
    });
}


// =======================================================
// == LOGICA PER LA RICERCA CLIENTE LIVE (MODALE MODIFICA) ==
// =======================================================
// =======================================================
// == LOGICA PER LA RICERCA CLIENTE LIVE (MODALE MODIFICA) ==
// =======================================================
if (editEventTitleInput && searchResultsContainerEdit) {
    let searchTimeoutEdit;

    editEventTitleInput.addEventListener('input', () => {
        clearTimeout(searchTimeoutEdit);
        const searchTerm = editEventTitleInput.value.trim();

        if (searchTerm.length < 2) {
            searchResultsContainerEdit.style.display = 'none';
            return;
        }

        searchTimeoutEdit = setTimeout(async () => {
            try {
                let response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
                let clienti = await response.json();

                // 🔁 Se nessun risultato, prova a invertire "cognome nome" → "nome cognome"
                if (clienti.length === 0 && searchTerm.includes(' ')) {
                    const parts = searchTerm.split(/\s+/);
                    if (parts.length === 2) {
                        const inverted = `${parts[1]} ${parts[0]}`;
                        response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(inverted)}`);
                        clienti = await response.json();
                    }
                }

                searchResultsContainerEdit.innerHTML = '';
                if (clienti.length > 0) {
                    clienti.forEach(cliente => {
                        const div = document.createElement('div');
                        div.className = 'search-result-item';
                        div.textContent = `${cliente.nome} ${cliente.cognome}`;
                        
                        div.addEventListener('mousedown', (e) => {
                            e.preventDefault();
                            editEventTitleInput.value = `${cliente.nome} ${cliente.cognome}`;
                            searchResultsContainerEdit.style.display = 'none';
                        });

                        searchResultsContainerEdit.appendChild(div);
                    });
                    searchResultsContainerEdit.style.display = 'block';
                } else {
                    searchResultsContainerEdit.style.display = 'none';
                }
            } catch (error) {
                console.error("Errore nella ricerca live (edit):", error);
            }
        }, 300);
    });

    editEventTitleInput.addEventListener('blur', () => {
        setTimeout(() => {
            searchResultsContainerEdit.style.display = 'none';
        }, 150);
    });
}


});
