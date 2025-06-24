// agenda-app.js

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
let currentWeek = new Date(); // Inizialmente la settimana corrente

// Struttura dati per gli appuntamenti (come li salveresti in un DB o in un array)
// {
//     id: 'app1',
//     date: '2025-06-25', // Formato YYYY-MM-DD
//     time: '10:00',     // Formato HH:MM
//     duration: 60,      // Durata in minuti
//     client: 'Mario Rossi',
//     service: 'Taglio Uomo',
//     operator: 'operator1', // Corrisponde al valore dell'option nel select
//     notes: '',
//     status: 'confirmed'
// }
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
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Differenza per Lunedì
    return new Date(d.setDate(diff));
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

// Funzione per convertire un orario HH:MM in minuti dalla mezzanotte
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Funzione per convertire minuti in un orario HH:MM (per il caso inverso)
function minutesToTime(totalMinutes) {
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
    currentWeekDisplay.textContent = `${startOfWeek.toLocaleDateString('it-IT', options)} - ${endOfWeek.toLocaleDateString('it-IT', options)} ${endOfWeek.getFullYear()}`;

    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const formattedDay = formatDate(day);

        const dayCol = document.createElement('div');
        dayCol.classList.add('calendar-day-col');

        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        dayHeader.innerHTML = `
            <span class="day-name">${getDayName(day)}</span>
            <span class="day-date">${getDayNumber(day)}</span>
        `;
        dayCol.appendChild(dayHeader);

        const daySlots = document.createElement('div');
        daySlots.classList.add('day-slots');

        // Aggiungi placeholder per ogni ora o mezz'ora (60px per ora)
        // Adatta l'intervallo di orari in base alle tue esigenze (es. 9:00 - 20:00)
        for (let hour = 9; hour <= 20; hour++) {
             // Puoi aggiungere placeholder anche per le mezz'ore se vuoi una griglia più fine
            const placeholder = document.createElement('div');
            placeholder.classList.add('time-slot-placeholder');
            daySlots.appendChild(placeholder);
        }

        // Filtra e posiziona gli appuntamenti per questo giorno
        const dayAppointments = appointments.filter(app => app.date === formattedDay);

        dayAppointments.forEach(app => {
            const appointmentElement = document.createElement('div');
            appointmentElement.classList.add('appointment');
            appointmentElement.classList.add(`operator-${app.operator}`); // Aggiunge la classe operatore

            // Calcola la posizione e l'altezza
            const startMinutes = timeToMinutes(app.time) - timeToMinutes('09:00'); // Minuti dall'inizio del giorno visualizzato (9:00)
            const topPosition = startMinutes; // 1px = 1 minuto, quindi 60px = 1 ora

            appointmentElement.style.top = `${topPosition}px`;
            appointmentElement.style.height = `${app.duration}px`;

            const endTimeMinutes = timeToMinutes(app.time) + app.duration;
            const endTime = minutesToTime(endTimeMinutes);

            appointmentElement.innerHTML = `
                <span class="appointment-time">${app.time} - ${endTime}</span>
                <span class="appointment-client">${app.client}</span>
                <span class="appointment-service">${app.service}</span>
            `;
            appointmentElement.dataset.id = app.id; // Per identificare l'appuntamento al click

            // Aggiungi event listener per la modifica
            appointmentElement.addEventListener('click', () => openAppointmentModal(app.id));

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
            appointmentNewClientName.value = ''; // Non rilevante in modifica di cliente esistente
            appointmentNewClientSurname.value = ''; // Non rilevante
            appointmentService.value = app.service;
            appointmentOperator.value = app.operator;
            appointmentNotes.value = app.notes;
            appointmentStatus.value = app.status;
        }
    } else {
        // Modalità aggiungi
        modalTitle.textContent = 'Aggiungi Appuntamento';
        // Pre-compila con data e ora correnti o del giorno selezionato se ci fosse
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
    const newClientName = appointmentNewClientName.value;
    const newClientSurname = appointmentNewClientSurname.value;
    const service = appointmentService.value;
    const operator = appointmentOperator.value;
    const notes = appointmentNotes.value;
    const status = appointmentStatus.value;

    // TODO: Qui dovresti gestire il salvataggio nel tuo backend.
    // Per questo esempio, modifichiamo l'array locale.
    const newAppointment = {
        id, date, time, duration, client, service, operator, notes, status
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


// --- Listener Eventi ---
prevWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() - 7);
    renderWeek();
});

nextWeekBtn.addEventListener('click', () => {
    currentWeek.setDate(currentWeek.getDate() + 7);
    renderWeek();
});

addAppointmentBtn.addEventListener('click', () => openAppointmentModal());

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    populateClientDatalist(); // Popola la datalist all'avvio
    renderWeek(); // Renderizza la settimana iniziale
});
