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
        
        const servizioKey = Object.keys(WORKFLOWS).find(s => app.summary.toLowerCase().includes(s));
        const iconaHtml = servizioKey && ICONS[servizioKey] ? `<i class="${ICONS[servizioKey]} service-icon"></i>` : '';

        return `
            <div class="cliente-token" ${clienteId ? `data-cliente-id="${clienteId}"` : 'style="cursor: default;"'}>
                <div class="avatar-container" style="background-color: #555;">${avatarHtml}</div>
                <div class="info" style="flex-grow: 1;">
                    <h5>${nomeDaMostrare} ${iconaHtml}</h5>
                    <p>${inizio.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})} - ${fine.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${progresso}%;"></div></div>
                    ${stepInfo}
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
            return;
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
                    
                    containers[postazioneLibera].innerHTML = creaClienteToken(app, app.cliente, { stepCorrente: { step: 'In corso' } });
                    
                    const pannelloCorrispondente = document.getElementById(postazioneLibera);
                    if (pannelloCorrispondente) {
                        pannelloCorrispondente.classList.add('occupata', classeColore);
                    }
                    
                    postazioniLavoroOccupate.push(postazioneLibera);
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
            }
        }
    });
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
});