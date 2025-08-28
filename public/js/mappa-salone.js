document.addEventListener('DOMContentLoaded', () => {
   const postazioni = {
    'postazione-1': document.querySelector('#postazione-1 .postazione-content'),
    'postazione-2': document.querySelector('#postazione-2 .postazione-content'),
    'postazione-3': document.querySelector('#postazione-3 .postazione-content'), // AGGIUNTO
    'attesa': document.querySelector('#area-attesa .postazione-content'),
};
const pannelliPostazione = {
    'postazione-1': document.getElementById('postazione-1'),
    'postazione-2': document.getElementById('postazione-2'),
    'postazione-3': document.getElementById('postazione-3'), // AGGIUNTO
};
    let appuntamentiDiOggi = [];
    let tuttiClienti = [];

    function getInitials(nome, cognome) {
        const n = nome ? nome.trim().charAt(0).toUpperCase() : '';
        const c = cognome ? cognome.trim().charAt(0).toUpperCase() : '';
        return `${n}${c}` || '?';
    }
    function capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    function creaClienteToken(app, clienteTrovato) {
        const inizio = new Date(app.start_time);
        const fine = new Date(app.end_time);
        if (isNaN(fine.getTime())) return '';
        const oraAttuale = new Date();
        const durataTotale = fine - inizio;
        const tempoTrascorso = oraAttuale - inizio;
        let progresso = Math.max(0, Math.min(100, (tempoTrascorso / durataTotale) * 100));
        const nomeDaMostrare = clienteTrovato ? `${capitalizeWords(clienteTrovato.nome)} ${capitalizeWords(clienteTrovato.cognome)}` : capitalizeWords(app.summary);
        const iniziali = clienteTrovato ? getInitials(clienteTrovato.nome, clienteTrovato.cognome) : '#';
        const clienteId = clienteTrovato ? clienteTrovato.id : null;
        return `
            <div class="cliente-token" ${clienteId ? `data-cliente-id="${clienteId}"` : 'style="cursor: default;"'}>
                <div class="avatar-container" style="background-color: #555;"><div class="initials-avatar" style="font-size: 18px;">${iniziali}</div></div>
                <div class="info" style="flex-grow: 1;">
                    <h5>${nomeDaMostrare}</h5>
                    <p>${inizio.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})} - ${fine.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                    <div class="progress-bar-container"><div class="progress-bar" style="width: ${progresso}%;"></div></div>
                </div>
            </div>`;
    }

    // SOSTITUISCI L'INTERA FUNZIONE aggiornaMappa CON QUESTA
function aggiornaMappa() {
    const oraAttuale = new Date();

    // 1. Pulisci tutte le postazioni
    Object.values(postazioni).forEach(el => el.innerHTML = '');
    Object.values(pannelliPostazione).forEach(el => {
        el.classList.remove('occupata', 'operatore-sandro', 'operatore-tino', 'operatore-nessuno');
        el.classList.add('libera');
    });

    // 2. Analizza ogni appuntamento e posizionalo
    appuntamentiDiOggi.forEach(app => {
        const inizio = new Date(app.start_time);
        const fine = new Date(app.end_time);

        if (oraAttuale >= inizio && oraAttuale < fine) {
            // L'appuntamento è IN CORSO
            let postazioneAssegnata = null;
if (!postazioni['postazione-1'].innerHTML) {
    postazioneAssegnata = 'postazione-1';
} else if (!postazioni['postazione-2'].innerHTML) {
    postazioneAssegnata = 'postazione-2';
} else if (!postazioni['postazione-3'].innerHTML) {
    postazioneAssegnata = 'postazione-3';
}
            
            if (postazioneAssegnata) {
                // --- MODIFICA CHIAVE QUI ---
                // Determina la classe del colore in base al colorId dell'appuntamento
                let classeColore = 'operatore-nessuno'; // Default
                if (app.color_id === '2') classeColore = 'operatore-sandro';
                if (app.color_id === '7') classeColore = 'operatore-tino';

                postazioni[postazioneAssegnata].innerHTML = creaClienteToken(app, app.cliente);
                
                // Applica le classi di stato e colore
                pannelliPostazione[postazioneAssegnata].classList.add('occupata', classeColore);
                pannelliPostazione[postazioneAssegnata].classList.remove('libera');

            } else {
                postazioni['attesa'].innerHTML += creaClienteToken(app, app.cliente);
            }
        
        } else if (oraAttuale < inizio) {
            // L'appuntamento deve ANCORA INIZIARE
            postazioni['attesa'].innerHTML += creaClienteToken(app, app.cliente);
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
            
            const appuntamentiArricchiti = appuntamenti.map(app => {
                const sigleDaRimuovere = ['tg', 'tn', 'tratt', 'p', 'piega', 'perm', 'balajage', 'schiariture', 'meches', 'barba', 'pul', 'colore'];
                const nomePulito = (app.summary || '').toLowerCase().split(' ').filter(p => p && !sigleDaRimuovere.includes(p) && isNaN(p)).join(' ').trim();
                
                let clienteTrovato = null;
                if (nomePulito) {
                    clienteTrovato = tuttiClienti.find(c => {
                        const nomeCompleto = `${c.nome} ${c.cognome}`.toLowerCase();
                        const cognomeNome = `${c.cognome} ${c.nome}`.toLowerCase();
                        const soprannome = (c.soprannome || '').toLowerCase();
                        return nomeCompleto.includes(nomePulito) || cognomeNome.includes(nomePulito) || (soprannome && soprannome.includes(nomePulito));
                    });
                }
                return { ...app, cliente: clienteTrovato || null };
            });
            
            appuntamentiDiOggi = appuntamentiArricchiti.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            aggiornaMappa();
            setInterval(aggiornaMappa, 30000);
        } catch (error) {
            console.error("Errore fatale nel caricamento dati:", error);
            if(postazioni['attesa']) postazioni['attesa'].innerHTML = '<p class="error-message">Impossibile caricare gli appuntamenti.</p>';
        }
    }
    init();
});