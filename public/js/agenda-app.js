// agenda-app.js

// ... (tutto il codice esistente) ...

// --- Funzioni di Utilità per Date e Orari ---
// Assicurati che questi siano corretti e che timeToMinutes gestisca correttamente il tuo orario di inizio giornata (es. 09:00)
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    // Assumiamo che l'agenda inizi alle 09:00
    // Quindi 09:00 = 0 minuti dal "top" del calendario
    // 10:00 = 60 minuti dal "top"
    // Questo è il punto chiave per il calcolo della "top"
    const startHour = 9; // L'ora in cui inizia la griglia del calendario
    return (hours - startHour) * 60 + minutes;
}


// --- Funzione Principale per Renderizzare la Settimana ---
function renderWeek() {
    calendarDaysGrid.innerHTML = '';

    const startOfWeek = getStartOfWeek(currentWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

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
        // Aggiungi la classe 'current-day' se è il giorno corrente
        if (day.toDateString() === new Date().toDateString()) {
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
        // Adatta questo loop per coprire tutte le ore che mostri (es. 9-20)
        // L'altezza di ogni placeholder deve corrispondere a un "minuto" o "intervallo base"
        const intervalHeight = 60; // 60px per ora (corrisponde a 1px per minuto)
        const startHour = 9; // Ora di inizio della visualizzazione oraria
        const endHour = 20;  // Ora di fine della visualizzazione oraria

        for (let hour = startHour; hour <= endHour; hour++) {
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
            const startMinutesFromDayStart = timeToMinutes(app.time); // Minuti dall'inizio della griglia (09:00 = 0)
            const topPosition = startMinutesFromDayStart; // 1px per minuto, quindi 10:00 (60 min) sarà a 60px

            appointmentElement.style.top = `${topPosition}px`;
            appointmentElement.style.height = `${app.duration}px`; // Altezza in base alla durata in minuti

            const endTimeMinutes = timeToMinutes(app.time) + app.duration + (9 * 60); // Aggiungi le 9 ore di partenza per il calcolo dell'ora di fine
            const endTime = minutesToTime(endTimeMinutes);


            appointmentElement.innerHTML = `
                <span class="appointment-time">${app.time} - ${endTime}</span>
                <span class="appointment-client">${app.client}</span>
                <span class="appointment-service">${app.service}</span>
            `;
            appointmentElement.dataset.id = app.id;

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

// ... (tutto il resto del codice JS rimane uguale) ...
