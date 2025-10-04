document.addEventListener('DOMContentLoaded', () => {

    if (window.self !== window.top) {
        document.body.classList.add('iframe-mode');
    }

    const WORKFLOWS = {
    'tratt tg barba': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio, Asciugatura e Barba', durata: 90, tipoPostazione: 'lavoro' }],
    'tratt tg': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Asciugatura', durata: 60, tipoPostazione: 'lavoro' }],
    'tg barba': [{ step: 'Lavaggio', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Barba', durata: 55, tipoPostazione: 'lavoro' }],
    'tn tg': [{ step: 'Applicazione Tinta', durata: 25, tipoPostazione: 'lavoro' }, { step: 'Posa', durata: 35, tipoPostazione: 'lavoro', operatoreLibero: true }, { step: 'Risciacquo', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Asciugatura', durata: 50, tipoPostazione: 'lavoro' }],
    'tratt': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura', durata: 30, tipoPostazione: 'lavoro' }],
    'pul': [{ step: 'Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura e Pulizia', durata: 25, tipoPostazione: 'lavoro' }],
    'tn': [{ step: 'Applicazione Tinta', durata: 25, tipoPostazione: 'lavoro' }, { step: 'Posa', durata: 35, tipoPostazione: 'lavoro', operatoreLibero: true }, { step: 'Risciacquo', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura', durata: 20, tipoPostazione: 'lavoro' }],
    'tg': [{ step: 'Lavaggio', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio', durata: 25, tipoPostazione: 'lavoro' }],
    'p': [{ step: 'Lavaggio', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Piega', durata: 20, tipoPostazione: 'lavoro' }]
};

const ICONS = {
    'tratt tg barba': 'fas fa-spa',
    'tratt tg': 'fas fa-tint',
    'tg barba': 'fas fa-cut',
    'tn tg': 'fas fa-tint',
    'tratt': 'fas fa-spa',
    'pul': 'fas fa-broom',
    'tn': 'fas fa-tint',
    'tg': 'fas fa-cut',
    'p': 'fas fa-wind'
};


// === FUNZIONE 1: Genera Timeline Visiva ===
function generaTimelineCliente(app, workflow) {
    if (!workflow) return '';
    
    const inizio = new Date(app.start_time);
    const oraAttuale = new Date();
    const tempoTrascorsoMs = oraAttuale - inizio;
    
    let tempoCumulativo = 0;
    let timelineHtml = '<div class="cliente-timeline">';
    
    workflow.forEach((step, index) => {
        const durataStepMs = step.durata * 60 * 1000;
        const inizioStep = tempoCumulativo;
        const fineStep = tempoCumulativo + durataStepMs;
        
        let stato = '';
        let icona = '';
        let tempoInfo = '';
        
        if (tempoTrascorsoMs >= fineStep) {
            stato = 'completato';
            icona = '✅';
        } else if (tempoTrascorsoMs >= inizioStep && tempoTrascorsoMs < fineStep) {
            stato = 'in-corso';
            icona = '🟡';
            const minutiRimanenti = Math.ceil((fineStep - tempoTrascorsoMs) / 60000);
            tempoInfo = `<span class="timeline-step-tempo">${minutiRimanenti} min</span>`;
        } else {
            stato = 'da-fare';
            icona = '⏳';
            const minutiPrimaInizio = Math.ceil((inizioStep - tempoTrascorsoMs) / 60000);
            tempoInfo = `<span class="timeline-step-tempo">tra ${minutiPrimaInizio} min</span>`;
        }
        
        timelineHtml += `
            <div class="timeline-step ${stato}">
                <span class="timeline-step-icon">${icona}</span>
                <span>${step.step}</span>
                ${tempoInfo}
            </div>
        `;
        
        tempoCumulativo += durataStepMs;
    });
    
    timelineHtml += '</div>';
    return timelineHtml;
}

// === FUNZIONE 2: Aggiorna Statistiche ===
function aggiornaStatistiche() {
    const oraAttuale = new Date();
    
    let serviti = 0;
    let inCorso = 0;
    let inArrivo = 0;
    let durateTotali = 0;
    let conteggioCompletati = 0;
    
    appuntamentiDiOggi.forEach(app => {
        const inizio = new Date(app.start_time);
        const fine = new Date(app.end_time);
        
        if (oraAttuale >= fine) {
            serviti++;
            durateTotali += (fine - inizio) / 60000;
            conteggioCompletati++;
        } else if (oraAttuale >= inizio && oraAttuale < fine) {
            inCorso++;
        } else if (oraAttuale < inizio) {
            inArrivo++;
        }
    });
    
    document.getElementById('stat-serviti').textContent = serviti;
    document.getElementById('stat-in-corso').textContent = inCorso;
    document.getElementById('stat-in-arrivo').textContent = inArrivo;
    
    if (conteggioCompletati > 0) {
        const mediaMinuti = Math.round(durateTotali / conteggioCompletati);
        const ore = Math.floor(mediaMinuti / 60);
        const minuti = mediaMinuti % 60;
        document.getElementById('stat-tempo-medio').textContent = 
            ore > 0 ? `${ore}h ${minuti}min` : `${minuti}min`;
    } else {
        document.getElementById('stat-tempo-medio').textContent = '--';
    }
    
    calcolaProssimoSlotLibero();
}

// === FUNZIONE 3: Calcola Prossimo Slot ===
function calcolaProssimoSlotLibero() {
    const oraAttuale = new Date();
    
    const appuntamentiAttivi = appuntamentiDiOggi.filter(app => {
        const fine = new Date(app.end_time);
        return fine > oraAttuale;
    }).sort((a, b) => new Date(a.end_time) - new Date(b.end_time));
    
    if (appuntamentiAttivi.length === 0 || appuntamentiAttivi.length < 3) {
        document.getElementById('stat-prossimo-slot').textContent = 'Ora';
        return;
    }
    
    const prossimaFine = new Date(appuntamentiAttivi[2].end_time);
    
    if (prossimaFine <= oraAttuale) {
        document.getElementById('stat-prossimo-slot').textContent = 'Ora';
    } else {
        const ore = prossimaFine.getHours().toString().padStart(2, '0');
        const minuti = prossimaFine.getMinutes().toString().padStart(2, '0');
        document.getElementById('stat-prossimo-slot').textContent = `${ore}:${minuti}`;
    }
}

    const postazioniLavoro = ['postazione-1', 'postazione-2', 'postazione-3'];
    const postazioniLavaggio = ['lavaggio-1', 'lavaggio-2'];
    const areaAttesa = 'area-attesa';

    const containers = {};
    [...postazioniLavoro, ...postazioniLavaggio, areaAttesa].forEach(id => { containers[id] = document.querySelector(`#${id} .postazione-content`); });
    const pannelli = {};
    [...postazioniLavoro, ...postazioniLavaggio].forEach(id => { pannelli[id] = document.getElementById(id); });
    let appuntamentiDiOggi = [], tuttiClienti = [], updateInterval = null;

    // --- NUOVA COSTANTE PER LA URL DELLA SCHEDA CLIENTE ---
    const URL_BASE_SCHEDA_CLIENTE = '/scheda-cliente.html?id=';
    // ---------------------------------------------------

    function getInitials(nome, cognome) {
        const n = nome ? nome.trim().charAt(0).toUpperCase() : '';
        const c = cognome ? cognome.trim().charAt(0).toUpperCase() : '';
        return `${n}${c}` || '?';
    }

    function capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function getOperatoreClasse(app) {
        let classeColore = 'operatore-sandro';
        if (app.color_id === '7') {
            classeColore = 'operatore-tino';
        } else if (app.color_id === '6') {
            classeColore = 'operatore-nessuno';
        }
        return classeColore;
    }

    function creaClienteToken(app, clienteTrovato, stepCorrente) {
        const inizio = new Date(app.start_time);
        const fine = new Date(app.end_time);
        if (isNaN(fine.getTime())) return '';

        const oraAttuale = new Date();
        const durataTotale = fine - inizio;
        const tempoTrascorso = oraAttuale - inizio;
        let progresso = Math.max(0, Math.min(100, (tempoTrascorso / durataTotale) * 100));

        let avatarHtml = '';
        let nomeDaMostrare = capitalizeWords(app.summary);
        let clienteId = null;

        if (clienteTrovato) {
            nomeDaMostrare = `${capitalizeWords(clienteTrovato.nome)} ${capitalizeWords(clienteTrovato.cognome)}`;
            clienteId = clienteTrovato.id;

            if (clienteTrovato.foto_profilo_url) {
                avatarHtml = `<img src="${clienteTrovato.foto_profilo_url}" alt="Profilo" class="profile-avatar-img">`;
            } else {
                const iniziali = getInitials(clienteTrovato.nome, clienteTrovato.cognome);
                avatarHtml = `<div class="initials-avatar" style="font-size: 18px;">${iniziali}</div>`;
            }

        } else {
            avatarHtml = `<div class="initials-avatar" style="font-size: 18px;">#</div>`;
        }

        const stepInfo = stepCorrente ? `<p style="color: #FFD700; font-weight: bold; margin-top: 5px;">${stepCorrente.step}</p>` : '';
		// Genera timeline se c'è un workflow
let timelineHtml = '';
if (stepCorrente) {
    const summaryLower = app.summary.toLowerCase();
    const matchingKeys = Object.keys(WORKFLOWS).filter(s => summaryLower.includes(s));
    if (matchingKeys.length > 0) {
        matchingKeys.sort((a, b) => b.length - a.length);
        const servizioKey = matchingKeys[0];
        const workflow = WORKFLOWS[servizioKey];
        if (workflow) {
            timelineHtml = generaTimelineCliente(app, workflow);
        }
    }
}
        
        const servizioKey = Object.keys(WORKFLOWS).find(s => app.summary.toLowerCase().includes(s));
        const iconaHtml = servizioKey && ICONS[servizioKey] ? `<i class="${ICONS[servizioKey]} service-icon"></i>` : '';

        return `
            <div class="cliente-token ${clienteId ? 'clickable' : ''}" ${clienteId ? `data-cliente-id="${clienteId}"` : ''}>
                <div class="avatar-container" style="background-color: #555;">${avatarHtml}</div>
                <div class="info" style="flex-grow: 1;">
                    <h5>${nomeDaMostrare} ${iconaHtml}</h5>
                    <p>${inizio.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})} - ${fine.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${progresso}%;"></div></div>
                    ${stepInfo}
					${timelineHtml}
                </div>
            </div>`;
    }

    function aggiornaMappa() {
    const oraAttuale = new Date();
    Object.values(containers).forEach(el => { if (el) el.innerHTML = ''; });
    Object.values(pannelli).forEach(el => { if (el) el.classList.remove('occupata', 'in-posa', 'operatore-sandro', 'operatore-tino', 'operatore-nessuno'); });
    
    let postazioniLavoroOccupate = [];
    let postazioniLavaggioOccupate = [];
    
    appuntamentiDiOggi.forEach(app => {
        if (!app.cliente) {
            // Se non c'è un cliente associato, crea comunque un token base per l'attesa
            if (oraAttuale < new Date(app.start_time) && containers[areaAttesa]) {
                containers[areaAttesa].innerHTML += creaClienteToken(app, null, null); // Passa null per clienteTrovato
            }
            return; // Continua a processare gli altri appuntamenti
        }

        const inizio = new Date(app.start_time);
        const fine = new Date(app.end_time);
        if (oraAttuale < inizio) {
            containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, null);
        } else if (oraAttuale >= inizio && oraAttuale < fine) {
            const summaryLower = app.summary.toLowerCase();
            
            // Trova tutti i servizi che sono inclusi nel titolo dell'appuntamento
            const matchingKeys = Object.keys(WORKFLOWS).filter(s => summaryLower.includes(s));
            
            let servizioKey = null;
            if (matchingKeys.length > 0) {
                // Ordina le corrispondenze dalla più lunga alla più corta
                matchingKeys.sort((a, b) => b.length - a.length);
                // Prende la prima, che è la più specifica
                servizioKey = matchingKeys[0];
            }
            
            const workflow = WORKFLOWS[servizioKey];
            
            if (!workflow) {
                const postazioneLibera = postazioniLavoro.find(p => !postazioniLavoroOccupate.includes(p));
                if (postazioneLibera) {
                    const classeColore = getOperatoreClasse(app);
                    
                    containers[postazioneLibera].innerHTML = creaClienteToken(app, app.cliente, { step: 'In corso' }); // Usato 'step' al posto di 'stepCorrente'
                    
                    const pannelloCorrispondente = document.getElementById(postazioneLibera);
                    if (pannelloCorrispondente) {
                        pannelloCorrispondente.classList.add('occupata', classeColore);
                    }
                    
                    postazioniLavoroOccupate.push(postazioneLibera);
                } else {
                    // Se non ci sono postazioni lavoro disponibili per un appuntamento senza workflow
                    containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, { step: 'Attesa per postazione' });
                }
                return;
            }
            
            const tempoTrascorsoMs = oraAttuale - inizio;
            let tempoCumulativo = 0;
            let stepCorrente = null;
            for(const step of workflow) {
                const durataStepMs = step.durata * 60 * 1000;
                if (tempoTrascorsoMs >= tempoCumulativo && tempoTrascorsoMs < tempoCumulativo + durataStepMs) {
                    stepCorrente = step;
                    break;
                }
                tempoCumulativo += durataStepMs;
            }
            
            if (stepCorrente) {
                let postazioniDisponibili = stepCorrente.tipoPostazione === 'lavoro' ? postazioniLavoro : postazioniLavaggio;
                let postazioniOccupateRef = stepCorrente.tipoPostazione === 'lavoro' ? postazioniLavoroOccupate : postazioniLavaggioOccupate;
                let postazioneLibera = postazioniDisponibili.find(p => !postazioniOccupateRef.includes(p));
                
                if (postazioneLibera) {
                    containers[postazioneLibera].innerHTML = creaClienteToken(app, app.cliente, stepCorrente);
                    
                    const classeColore = getOperatoreClasse(app);

                    pannelli[postazioneLibera].classList.add('occupata', classeColore);
                    if(stepCorrente.operatoreLibero) { pannelli[postazioneLibera].classList.add('in-posa'); }
                    postazioniOccupateRef.push(postazioneLibera);
                } else {
                    containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, { step: `Attesa per ${stepCorrente.tipoPostazione}` });
                }
            } else if (oraAttuale > fine) {
                // Appuntamento terminato, non mostrar nella mappa
            } else {
                // Se non c'è uno step corrente definito ma l'appuntamento è in corso
                // Questo potrebbe significare che il tempo cumulativo ha superato la durata totale del workflow
                // o che c'è un gap tra gli step. Potremmo volerlo mettere in attesa o in una postazione generica.
                const postazioneLibera = postazioniLavoro.find(p => !postazioniLavoroOccupate.includes(p));
                if (postazioneLibera) {
                    const classeColore = getOperatoreClasse(app);
                    containers[postazioneLibera].innerHTML = creaClienteToken(app, app.cliente, { step: 'Fase finale o transizione' });
                    const pannelloCorrispondente = document.getElementById(postazioneLibera);
                    if (pannelloCorrispondente) {
                        pannelloCorrispondente.classList.add('occupata', classeColore);
                    }
                    postazioniLavoroOccupate.push(postazioneLibera);
                } else {
                     containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, { step: 'Attesa (fase finale)' });
                }
            }
        } else {
            // Appuntamento passato, non mostrarlo nella mappa
        }
    });
	// Aggiorna anche le statistiche
aggiornaStatistiche();
}


    async function init() {
        try {
            const [appResponse, clientiResponse] = await Promise.all([
                fetch('/api/appuntamenti/oggi'),
                fetch('/api/clienti')
            ]);
            const appuntamenti = await appResponse.json();
            tuttiClienti = await clientiResponse.json();

            if (!appuntamenti || !tuttiClienti) throw new Error('Dati non ricevuti');
            
            // Definisce una lista di parole chiave da rimuovere per un corretto abbinamento
            const sigleDaRimuovere = [
                'tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 
                'schiariture', 'meches', 'barba', 'pul', 'colore',
                'tg barba', 'tratt tg barba', 'tratt tg', 'tn tg'
            ];
            
            // Crea un indice per il fuzzy matching
            const clientiPerFuzzy = tuttiClienti.map(c => ({
                ...c,
                nomeCompleto: `${c.nome} ${c.cognome}`.toLowerCase(),
                cognomeNome: `${c.cognome} ${c.nome}`.toLowerCase(),
                soprannome: (c.soprannome || '').toLowerCase()
            }));

            const appuntamentiArricchiti = appuntamenti.map(app => {
                let nomePulito = (app.summary || '').toLowerCase();
                // Rimuove ogni parola chiave del servizio dalla stringa del nome
                sigleDaRimuovere.forEach(sigla => {
                    const regex = new RegExp(`\\b${sigla}\\b`, 'gi');
                    nomePulito = nomePulito.replace(regex, '').trim();
                });

                let clienteTrovato = null;
                if (nomePulito) {
                    const risultati = fuzzysort.go(nomePulito, clientiPerFuzzy, { keys: ['nomeCompleto', 'cognomeNome', 'soprannome'] });
                    if (risultati.length > 0) {
                        clienteTrovato = risultati[0].obj;
                    }
                }
                return { ...app, cliente: clienteTrovato || null };
            });

            appuntamentiDiOggi = appuntamentiArricchiti.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

            aggiornaMappa();
            updateInterval = setInterval(aggiornaMappa, 30000);

        } catch (error) {
            console.error("Errore fatale nel caricamento dati:", error);
            if(containers[areaAttesa]) containers[areaAttesa].innerHTML = '<p class="error-message">Impossibile caricare gli appuntamenti.</p>';
        }
    }
    init();

    // --- NUOVO LISTENER PER I CLICK SUI CLIENTE-TOKEN ---
    // Questo listener è delegato al body per catturare i click su elementi generati dinamicamente
    document.body.addEventListener('click', (event) => {
        const clienteToken = event.target.closest('.cliente-token.clickable');
        if (clienteToken) {
            const clienteId = clienteToken.dataset.clienteId;
            if (clienteId) {
                // MODIFICA QUI: Usa window.top.location.href per uscire dall'iframe (se presente)
                if (window.self !== window.top) {
                    window.top.location.href = `${URL_BASE_SCHEDA_CLIENTE}${clienteId}`;
                } else {
                    window.location.href = `${URL_BASE_SCHEDA_CLIENTE}${clienteId}`;
                }
            } else {
                console.warn('ID cliente non trovato sul ticket cliccato:', clienteToken);
            }
        }
    });
    // ----------------------------------------------------

});