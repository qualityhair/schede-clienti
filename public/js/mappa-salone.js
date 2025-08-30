document.addEventListener('DOMContentLoaded', () => {
    
    const WORKFLOWS = {
        'tg barba': [{ step: 'Lavaggio', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Barba', durata: 55, tipoPostazione: 'lavoro' }],
        'tratt tg barba': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio, Asciugatura e Barba', durata: 90, tipoPostazione: 'lavoro' }],
        'tratt tg': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Asciugatura', durata: 60, tipoPostazione: 'lavoro' }],
        'tn tg': [{ step: 'Applicazione Tinta', durata: 25, tipoPostazione: 'lavoro' }, { step: 'Posa', durata: 35, tipoPostazione: 'lavoro', operatoreLibero: true }, { step: 'Risciacquo', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Taglio e Asciugatura', durata: 50, tipoPostazione: 'lavoro' }],
        'tg': [{ step: 'Lavaggio', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Taglio', durata: 25, tipoPostazione: 'lavoro' }],
        'tn': [{ step: 'Applicazione Tinta', durata: 25, tipoPostazione: 'lavoro' }, { step: 'Posa', durata: 35, tipoPostazione: 'lavoro', operatoreLibero: true }, { step: 'Risciacquo', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura', durata: 20, tipoPostazione: 'lavoro' }],
        'p': [{ step: 'Lavaggio', durata: 10, tipoPostazione: 'lavaggio' }, { step: 'Piega', durata: 20, tipoPostazione: 'lavoro' }],
        'tratt': [{ step: 'Applicazione', durata: 10, tipoPostazione: 'lavoro' }, { step: 'Risciacquo e Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura', durata: 30, tipoPostazione: 'lavoro' }],
        'pul': [{ step: 'Shampoo', durata: 5, tipoPostazione: 'lavaggio' }, { step: 'Asciugatura e Pulizia', durata: 25, tipoPostazione: 'lavoro' }]
    };
    
    const postazioniLavoro = ['postazione-1', 'postazione-2', 'postazione-3'];
    const postazioniLavaggio = ['lavaggio-1', 'lavaggio-2'];
    const areaAttesa = 'area-attesa';
    
    const containers = {};
    [...postazioniLavoro, ...postazioniLavaggio, areaAttesa].forEach(id => { containers[id] = document.querySelector(`#${id} .postazione-content`); });
    const pannelli = {};
    [...postazioniLavoro, ...postazioniLavaggio].forEach(id => { pannelli[id] = document.getElementById(id); });
    let appuntamentiDiOggi = [], tuttiClienti = [], updateInterval = null;

    function getInitials(nome, cognome) {
        const n = nome ? nome.trim().charAt(0).toUpperCase() : '';
        const c = cognome ? cognome.trim().charAt(0).toUpperCase() : '';
        return `${n}${c}` || '?';
    }
    function capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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

        // --- ECCO LA LOGICA RIPRISTINATA ---
        if (clienteTrovato.foto_profilo_url) {
            // Se c'è la foto, usa un tag <img>
            avatarHtml = `<img src="${clienteTrovato.foto_profilo_url}" alt="Profilo" class="profile-avatar-img">`;
        } else {
            // Altrimenti, usa le iniziali
            const iniziali = getInitials(clienteTrovato.nome, clienteTrovato.cognome);
            avatarHtml = `<div class="initials-avatar" style="font-size: 18px;">${iniziali}</div>`;
        }
        // --- FINE DELLA LOGICA RIPRISTINATA ---

    } else {
        // Se non c'è proprio un cliente, usa il cancelletto
        avatarHtml = `<div class="initials-avatar" style="font-size: 18px;">#</div>`;
    }
    
    const stepInfo = stepCorrente ? `<p style="color: #FFD700; font-weight: bold; margin-top: 5px;">${stepCorrente.step}</p>` : '';
    
    return `
        <div class="cliente-token" ${clienteId ? `data-cliente-id="${clienteId}"` : 'style="cursor: default;"'}>
            <div class="avatar-container" style="background-color: #555;">${avatarHtml}</div>
            <div class="info" style="flex-grow: 1;">
                <h5>${nomeDaMostrare}</h5>
                <p>${inizio.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})} - ${fine.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                <div class="progress-bar-container"><div class="progress-bar" style="width: ${progresso}%;"></div></div>
                ${stepInfo}
            </div>
        </div>`;
}

function aggiornaMappa() {
    const oraAttuale = new Date();
    // ... pulizia pannelli ...
    
    appuntamentiDiOggi.forEach(app => {
        // --- MODIFICA CHIAVE QUI ---
        // Se l'appuntamento non ha un cliente collegato, ignoralo completamente.
        if (!app.cliente) {
            return; // 'return' dentro un forEach significa "passa al prossimo elemento"
        }
        // --- FINE MODIFICA ---

        const inizio = new Date(app.start_time);
            const fine = new Date(app.end_time);
            if (oraAttuale < inizio) {
                containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, null);
            } else if (oraAttuale >= inizio && oraAttuale < fine) {
                const summaryLower = app.summary.toLowerCase();
                const servizioKey = Object.keys(WORKFLOWS).find(s => summaryLower.includes(s));
                const workflow = WORKFLOWS[servizioKey];
                if (!workflow) {
                    const postazioneLibera = postazioniLavoro.find(p => !postazioniLavoroOccupate.includes(p));
                    if (postazioneLibera) {
    let classeColore = 'operatore-nessuno';
    if (app.color_id === '2') classeColore = 'operatore-sandro';
    if (app.color_id === '7') classeColore = 'operatore-tino';
    
    // Inserisce il gettone del cliente
containers[postazioneLibera].innerHTML = creaClienteToken(app, app.cliente, { stepCorrente: { step: 'In corso' } });
    
    // --- MODIFICA CHIAVE QUI ---
    // Applica le classi di stato e colore al pannello corretto,
    // che sia una postazione di lavoro O un lavaggio.
    const pannelloCorrispondente = document.getElementById(postazioneLibera);
    if (pannelloCorrispondente) {
        pannelloCorrispondente.classList.add('occupata', classeColore);
        if(stepCorrente.operatoreLibero) {
            pannelloCorrispondente.classList.add('in-posa');
        }
    }
    // --- FINE MODIFICA ---
    
    postazioniOccupateRef.push(postazioneLibera);
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
                        let classeColore = 'operatore-nessuno';
                        if (app.color_id === '2') classeColore = 'operatore-sandro';
                        if (app.color_id === '7') classeColore = 'operatore-tino';
                        pannelli[postazioneLibera].classList.add('occupata', classeColore);
                        if(stepCorrente.operatoreLibero) { pannelli[postazioneLibera].classList.add('in-posa'); }
                        postazioniOccupateRef.push(postazioneLibera);
                    } else {
                        containers[areaAttesa].innerHTML += creaClienteToken(app, app.cliente, { step: `Attesa per ${stepCorrente.tipoPostazione}` });
                    }
                }
            }
        });
    }

    // ======================================================================
// == FUNZIONE INIT (CON LOGICA DI ABBINAMENTO CORRETTA)               ==
// ======================================================================
async function init() {
    try {
        const [appResponse, clientiResponse] = await Promise.all([
            fetch('/api/appuntamenti/oggi'),
            fetch('/api/clienti') 
        ]);
        const appuntamenti = await appResponse.json();
        tuttiClienti = await clientiResponse.json();

        if (!appuntamenti || !tuttiClienti) throw new Error('Dati non ricevuti');
        
        // --- LOGICA DI ABBINAMENTO CHE FUNZIONA ---
        const appuntamentiArricchiti = appuntamenti.map(app => {
            const sigleDaRimuovere = ['tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul', 'colore'];
            // Pulisce il nome dal titolo dell'appuntamento
            const nomePulito = (app.summary || '').toLowerCase().split(' ').filter(p => p && !sigleDaRimuovere.includes(p) && isNaN(p)).join(' ').trim();
            
            let clienteTrovato = null;
            if (nomePulito) {
                // Cerca il cliente corrispondente nella nostra lista completa
                 clienteTrovato = tuttiClienti.find(c => {
                    const nomeCompleto = `${c.nome} ${c.cognome}`.toLowerCase();
                    const cognomeNome = `${c.cognome} ${c.nome}`.toLowerCase();
                    const soprannome = (c.soprannome || '').toLowerCase();
                    return nomeCompleto.includes(nomePulito) || cognomeNome.includes(nomePulito) || (soprannome && soprannome.includes(nomePulito));
                });
            }
            // Restituisce l'appuntamento "arricchito" con il cliente trovato (o null)
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
});