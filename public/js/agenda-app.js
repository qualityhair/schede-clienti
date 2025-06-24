// agenda-app.js

// --- Selettori DOM ---
const calendarDaysGrid = document.getElementById('calendar-days-grid');
const currentWeekDisplay = document.getElementById('current-week-display');
const prevWeekBtn = document.getElementById('prev-week-btn');
const nextWeekBtn = document.getElementById('next-week-btn');
const addAppointmentBtn = document.getElementById('add-appointment-btn');

const appointmentModal = document.getElementById('appointment-modal');
const appointmentForm = document.getElementById('appointment-form');
const modalTitle = document.getElementById('modal-title');
const appointmentId = document.getElementById('appointment-id');
const appointmentDateModal = document.getElementById('appointment-date-modal');
const appointmentTimeStart = document.getElementById('appointment-time-start');
const appointmentDuration = document.getElementById('appointment-duration');
const appointmentClientSearch = document.getElementById('appointment-client-search');
const clientSuggestions = document.getElementById('client-suggestions');
const appointmentNewClientName = document.getElementById('appointment-new-client-name');
const appointmentNewClientSurname = document.getElementById('appointment-new-client-surname');
const appointmentService = document.getElementById('appointment-service');
const appointmentOperator = document.getElementById('appointment-operator');
const appointmentNotes = document.getElementById('appointment-notes');
const appointmentStatus = document.getElementById('appointment-status');
const modalCancelBtn = appointmentModal.querySelector('.modal-button.cancel');

// --- Dati di Esempio (In un'app reale, questi verrebbero dal tuo database) ---
// Impostiamo la data per essere sicuri di visualizzare gli appuntamenti di esempio.
// currentWeek = new Date(); prenderà la data corrente del tuo sistema (oggi 24 Giugno 2025)
// Se vuoi forzare una settimana specifica, usa: new Date('ANNO-MESE-GIORNO T00:00:00')
let currentWeek = new Date('2025-06-24T12:00:00'); // Forza la data a oggi 24 Giugno 2025 per essere nella settimana giusta

let appointments = [
    { id: 'app1', date: '2025-06-23', time: '10:00', duration: 60, client: 'Mario Rossi', service: 'Taglio Uomo', operator: 'operator1', notes: '', status: 'confirmed' },
    { id: 'app2', date: '2025-06-24', time: '11:30', duration: 90, client: 'Luisa Bianchi', service: 'Colore & Piega', operator: 'operator2', notes: 'Capelli lunghi', status: 'confirmed' },
    { id: 'app3', date: '2025-06-23', time: '14:00', duration: 45, client: 'Giovanni Verdi', service: 'Barba', operator: 'operator1', notes: '', status: 'pending' },
    { id: 'app4', date: '2025-06-26', time: '09:00', duration: 120, client: 'Anna Neri', service: 'Permanente', operator: 'operator2', notes: 'Riccia', status: 'confirmed' },
    { id: 'app5', date: '2025-06-27', time: '16:00', duration: 30, client: 'Paolo Gialli', service: 'Pulizia viso', operator: 'operator1', notes: '', status: 'completed' },
];

// Lista di clienti di esempio per l'autocompletamento
const clients = [
    { id: 'c1', name: 'Mario Rossi', email: 'mario@example.com', phone: '3331234567' },
    { id: 'c2', name: 'Luisa Bianchi', email: 'luisa@example.com', phone: '3339876543' },
    { id: 'c3', name: 'Giovanni Verdi', email: 'giovanni@example.com', phone: '3331122334' },
    { id: 'c4', name: 'Anna Neri', email: 'anna@example.com', phone: '3335566778' },
    { id: 'c5', name: 'Paolo Gialli', email: 'paolo@example.com', phone: '3332233445' },
    { id: 'c6', name: 'Elena Bruno', email: 'elena@example.com', phone: '3338877665' }
];

// Funzione per popolare la datalist dei clienti
function populateClientDatalist() {
    clientSuggestions.innerHTML = '';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.name;
        clientSuggestions.appendChild(option);
    });
}

// --- Funzioni di Utilità per Date ---
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
    // Calcola la differenza per arrivare a Lunedì. Se è Domenica (0), sottrai 6 giorni. Altrimenti, sottrai (giorno - 1).
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Azzera l'ora per evitare problemi di confronto date
    return monday;
}

function formatDate(date) {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

function formatTime(date) {
    return date.toTimeString().split(' ')[0].substring(0, 5); // Formato HH:MM
}

function getDayName(date) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString('it-IT', options);
}

function getDayNumber(date) {
    return date.getDate();
}

// Funzione per convertire un orario HH:MM in minuti dalla mezzanotte del giorno di riferimento (09:00)
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const startHour = 9; // L'ora in cui inizia la griglia visiva del calendario
    return (hours - startHour) * 60 + minutes;
}

// Funzione per convertire minuti in un orario HH:MM (per il caso inverso)
function minutesToTime(totalMinutes) {
    // totalMinutes qui include già l'offset di startHour, quindi lo trasformiamo in ore/minuti
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// --- Funzione Principale per Renderizzare la Settimana ---
function renderWeek() {
    calendarDaysGrid.innerHTML = ''; // Pulisce la griglia precedente

    const startOfWeek = getStartOfWeek(currentWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Aggiorna la visualizzazione della settimana corrente
    const options = { month: 'long', day: 'numeric' };
    const startWeekFormatted = startOfWeek.toLocaleDateString('it-IT', options);
    const endWeekFormatted = endOfWeek.toLocaleDateString('it-IT', options);
    currentWeekDisplay.textContent = `${startWeekFormatted} - ${endWeekFormatted} ${endOfWeek.getFullYear()}`;

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        day.setHours(0, 0, 0, 0); // Azzera l'ora per confronti precisi
        const formattedDay = formatDate(day);

        const dayCol = document.createElement('div');
        dayCol.classList.add('calendar-day-col');

        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        // Aggiungi la classe 'current-day' se è il giorno corrente
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Azzera l'ora per confronti precisi
        if (day.getTime() === today.getTime()) {
            dayHeader.classList.add('current-day');
        }
        dayHeader.innerHTML = `
            <span class="day-name">${getDayName(day)}</span>
            <span class="day-date">${getDayNumber(day)}</span>
        `;
        dayCol.appendChild(dayHeader);

        const daySlots = document.createElement('div');
        daySlots.classList.add('day-slots');

        // Genera i placeholder per gli orari per allungare la colonna
        const startAgendaHour = 9; // Ora di inizio della visualizzazione dell'agenda (corrisponde al CSS)
        const endAgendaHour = 20;  // Ora di fine della visualizzazione dell'agenda (corrisponde al CSS)
        const intervalMinutes = 60; // Intervallo orario dei placeholder (es. ogni ora)

        for (let h = startAgendaHour; h <= endAgendaHour; h++) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('time-slot-placeholder');
            daySlots.appendChild(placeholder);
        }

        // Filtra e posiziona gli appuntamenti per questo giorno
        const dayAppointments = appointments.filter(app => app.date === formattedDay);

        dayAppointments.forEach(app => {
            const appointmentElement = document.createElement('div');
            appointmentElement.classList.add('appointment');
            appointmentElement.classList.add(`operator-${app.operator}`);

            // Calcola la posizione 'top' e l'altezza 'height'
            // timeToMinutes(app.time) qui restituisce i minuti dall'inizio della griglia (es. 09:00 = 0)
            const topPosition = timeToMinutes(app.time); // 1px per minuto

            appointmentElement.style.top = `${topPosition}px`;
            appointmentElement.style.height = `${app.duration}px`; // Altezza in base alla durata in minuti

            // Calcola l'ora di fine per visualizzarla
            const appStartMinutesOverall = (parseInt(app.time.split(':')[0]) * 60) + parseInt(app.time.split(':')[1]);
            const appEndMinutesOverall = appStartMinutesOverall + app.duration;
            const endTimeHour = Math.floor(appEndMinutesOverall / 60);
            const endTimeMinute = appEndMinutesOverall % 60;
            const endTime = `${String(endTimeHour).padStart(2, '0')}:${String(endTimeMinute).padStart(2, '0')}`;


            appointmentElement.innerHTML = `
                <span class="appointment-time">${app.time} - ${endTime}</span>
                <span class="appointment-client">${app.client}</span>
                <span class="appointment-service">${app.service}</span>
            `;
            appointmentElement.dataset.id = app.id; // Per identificare l'appuntamento al click

            // Aggiungi event listener per la modifica
            appointmentElement.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita che il click sul blocco propaghi al contenitore
                openAppointmentModal(app.id);
            });

            daySlots.appendChild(appointmentElement);
        });

        dayCol.appendChild(daySlots);
        calendarDaysGrid.appendChild(dayCol);
    }
}

// --- Gestione Modale Appuntamento ---
function openAppointmentModal(appointmentIdToEdit = null) {
    appointmentForm.reset(); // Pulisci il form
    appointmentId.value = ''; // Pulisci l'ID
    appointmentNewClientName.value = ''; // Assicurati che siano vuoti di default
    appointmentNewClientSurname.value = ''; // Assicurati che siano vuoti di default
    
    // Disabilita i campi nuovo cliente di default
    appointmentNewClientName.disabled = true;
    appointmentNewClientSurname.disabled = true;

    // Listener per la ricerca cliente (mostra campi nuovo cliente se non trova)
    appointmentClientSearch.addEventListener('input', () => {
        const value = appointmentClientSearch.value;
        const clientExists = clients.some(client => client.name === value);
        if (clientExists) {
            appointmentNewClientName.disabled = true;
            appointmentNewClientSurname.disabled = true;
            appointmentNewClientName.value = '';
            appointmentNewClientSurname.value = '';
        } else {
            appointmentNewClientName.disabled = false;
            appointmentNewClientSurname.disabled = false;
        }
    });


    if (appointmentIdToEdit) {
        // Modalità modifica
        modalTitle.textContent = 'Modifica Appuntamento';
        const app = appointments.find(a => a.id === appointmentIdToEdit);
        if (app) {
            appointmentId.value = app.id;
            appointmentDateModal.value = app.date;
            appointmentTimeStart.value = app.time;
            appointmentDuration.value = app.duration;
            appointmentClientSearch.value = app.client;
            // Se si modifica un appuntamento di un cliente non esistente, i campi nuovo cliente non devono apparire
            // ma l'utente dovrebbe poter modificare il nome del cliente direttamente in appointmentClientSearch.
            // Qui assumiamo che sia sempre un cliente esistente per semplicità, se no serve logica più complessa.
            
            appointmentService.value = app.service;
            appointmentOperator.value = app.operator;
            appointmentNotes.value = app.notes;
            appointmentStatus.value = app.status;

            // In modifica, disabilita sempre i campi nuovo cliente perché stiamo modificando un appuntamento esistente
            appointmentNewClientName.disabled = true;
            appointmentNewClientSurname.disabled = true;
            appointmentNewClientName.value = '';
            appointmentNewClientSurname.value = '';
        }
    } else {
        // Modalità aggiungi
        modalTitle.textContent = 'Aggiungi Appuntamento';
        // Pre-compila con data e ora correnti
        const now = new Date();
        appointmentDateModal.value = formatDate(now);
        appointmentTimeStart.value = formatTime(now);
        appointmentDuration.value = 60; // Default 1 ora
        appointmentStatus.value = 'confirmed';
    }

    appointmentModal.classList.add('open');
}

function closeAppointmentModal() {
    appointmentModal.classList.remove('open');
}

appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = appointmentId.value || `app${Date.now()}`; // Genera ID se nuovo
    const date = appointmentDateModal.value;
    const time = appointmentTimeStart.value;
    const duration = parseInt(appointmentDuration.value);
    const client = appointmentClientSearch.value;
    const newClientName = appointmentNewClientName.value; // Potrebbe essere vuoto
    const newClientSurname = appointmentNewClientSurname.value; // Potrebbe essere vuoto
    const service = appointmentService.value;
    const operator = appointmentOperator.value;
    const notes = appointmentNotes.value;
    const status = appointmentStatus.value;

    // Logica per aggiungere un nuovo cliente se non trovato e i campi sono compilati
    let finalClientName = client;
    if (!clients.some(c => c.name === client) && newClientName && newClientSurname) {
        const newClientId = `c${Date.now()}`;
        finalClientName = `${newClientName} ${newClientSurname}`;
        clients.push({ id: newClientId, name: finalClientName, email: '', phone: '' });
        populateClientDatalist(); // Aggiorna la datalist
    } else if (!client && newClientName && newClientSurname) { // Caso in cui non si usa la ricerca ma solo i campi nuovo cliente
        const newClientId = `c${Date.now()}`;
        finalClientName = `${newClientName} ${newClientSurname}`;
        clients.push({ id: newClientId, name: finalClientName, email: '', phone: '' });
        populateClientDatalist();
    } else if (!client && (!newClientName || !newClientSurname)) {
        alert('Per favore inserisci il nome del cliente o seleziona uno esistente.');
        return; // Non procedere con il salvataggio
    }
    
    // Aggiorna il nome del cliente nell'appuntamento se è stato creato un nuovo cliente
    const newAppointment = {
        id, date, time, duration, client: finalClientName, service, operator, notes, status
    };

    if (appointmentId.value) {
        // Modifica appuntamento esistente
        const index = appointments.findIndex(app => app.id === id);
        if (index !== -1) {
            appointments[index] = newAppointment;
        }
    } else {
        // Aggiungi nuovo appuntamento
        appointments.push(newAppointment);
    }

    closeAppointmentModal();
    renderWeek(); // Ricarica la settimana per mostrare le modifiche
});

// Listener per chiudere la modale
modalCancelBtn.addEventListener('click', closeAppointmentModal);
appointmentModal.addEventListener('click', (e) => {
    if (e.target === appointmentModal) { // Chiudi solo se clicchi sull'overlay
        closeAppointmentModal();
    }
});


// --- Listener Eventi Navigazione Settimana ---
prevWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() - 7);
    renderWeek();
});

nextWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() + 7);
    renderWeek();
});

addAppointmentBtn.addEventListener('click', () => openAppointmentModal());

// --- Inizializzazione ---
document.addEventListener('DOMContentLoaded', () => {
    populateClientDatalist(); // Popola la datalist all'avvio
    renderWeek(); // Renderizza la settimana iniziale
});
