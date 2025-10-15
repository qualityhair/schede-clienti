// =======================================================
// === CONFIGURAZIONE COLORI E UTILITY ===
// =======================================================

// Funzione per generare colori casuali, più FORTI e VIVACI
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    // Usiamo HSL per garantire colori più forti: Saturazione 100%, Luminosità 50%
    return `hsl(${hue}, 100%, 50%)`; 
}

// Oggetto per memorizzare i colori dei servizi - USARE CHIAVI NORMALIZZATE
const coloriServiziMappati = {
    colore: '#F39C12',             // Arancione Saturo
    taglio: '#3498DB',             // Blu Brillante
    piega: '#2ECC71',              // Verde Smeraldo
    barba: '#95A5A6',              // Grigio Medio
    meches: '#9B59B6',             // Viola Profondo
    tonalizzazione: '#1ABC9C',     // Turchese
    // Colore Rosso Vivo per il Trattamento (massimo contrasto)
    trattamento: '#E74C3C',        
    
    // Chiavi composte che verranno trovate nel JSON del backend
    tagliobarba: '#5D6D7E',        // Grigio Blu
    coloretaglio: '#E67E22',       // Arancione Scuro
    maschera: '#A6B1E1',           // Lavanda Chiaro
    
    altro: '#5D6D7E',              // Colore di fallback scuro
};

// =======================================================
// === FUNZIONE DI CHIAMATA API REALE ===
// =======================================================
// =======================================================
// === FUNZIONE DI CHIAMATA API REALE (VERSIONE CORRETTA) ===
// =======================================================
async function fetchDati(endpoint, parametri = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(parametri).forEach(key => {
        // 🛑 RIMOZIONE DELLA CONDIZIONE BLOCCANTE: ORA TUTTI I PARAMETRI VENGONO AGGIUNTI
        url.searchParams.append(key, parametri[key]);
    });
    
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Errore API: ${response.status} - ${response.statusText}`);
    }
    return await response.json();
}


// =======================================================
// === LOGICA CLIENT-SIDE ===
// =======================================================

document.addEventListener("DOMContentLoaded", () => {


    // ===== ELEMENTI DOM =====
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const aggiornaDatiBtn = document.getElementById('aggiorna-dati-btn');
    const modal = document.getElementById('modal-clienti-servizio');
    const closeBtn = document.querySelector('.close-btn');

   

    // ============================
    // === FUNZIONE CARICAMENTO ===
    // ============================
async function caricaDatiAnalisi() {
    

    if (!filtroPeriodo) {
        console.error("ERRORE: Elemento filtro-periodo non trovato nel DOM.");
        return;
    }

    if (aggiornaDatiBtn) {
        aggiornaDatiBtn.disabled = true;
        aggiornaDatiBtn.textContent = "🔄 Caricamento...";
    }

    const periodo = filtroPeriodo.value; // Ottiene 'ultimo-mese', 'ultimi-3-mesi', etc.
    // L'oggetto 'mappaPeriodi' e 'parametriAPI' non è più necessario!

    try {
       

        // VERSIONE CORRETTA:
const [clientiAssidui, distribuzioneFedelta, trendMensile, insights] = await Promise.all([
    fetchDati('/api/analisi/clienti-assidui', { periodo }),
    fetchDati('/api/analisi/distribuzione-fedelta'),
    fetchDati('/api/analisi/trend-mensile', { periodo }), // 🚀 CORRETTO
    fetchDati('/api/analisi/insights')
]);

        popolaPagina({
            clientiAssidui, distribuzioneFedelta, trendMensile, insights
        });

        mostraMessaggioTemporaneo("Dati aggiornati!", "success");

    } catch (error) {
        console.error("ERRORE nel caricamento:", error);
        mostraErrore(`Impossibile caricare i dati. Dettaglio: ${error.message}`);
        mostraMessaggioTemporaneo("Errore nel caricamento", "error");
    } finally {
        if (aggiornaDatiBtn) {
            aggiornaDatiBtn.disabled = false;
            aggiornaDatiBtn.textContent = "🔄 Aggiorna";
        }
        
    }
}
    
    // =============================
    // === FUNZIONI POPOLA PAGINA ===
    // =============================
    function popolaClassificaClienti(clienti) {
        const container = document.getElementById('classifica-clienti');
        if (!container) return;
        container.innerHTML = clienti.map((c, i) => `
            <div class="cliente-item">
                <div>${i + 1}. <strong>${c.nome} ${c.cognome}</strong> (${c.visite} visite)</div>
                <div>Frequenza media: ${c.frequenzaMedia || '?'} giorni • Ultima visita: ${c.ultimaVisita || 'N/D'}</div>
            </div>
        `).join('');
    }

    // NUOVA FUNZIONE: Classifica Servizi Popolari Aggregata (per coerenza)
    function popolaServiziPopolariAggregati(trend) {
        const container = document.getElementById('classifica-servizi');
        if (!container) return;
        
        const aggregati = {};
        let nomiServiziOriginali = {};

        // 1. Aggrega i dati totali per TUTTO il periodo
        trend.forEach(t => {
            Object.keys(t).forEach(key => {
                if (key !== 'mese' && key !== 'nomiServizi') { 
                    // CORREZIONE CRUCIALE: Normalizza a minuscolo per aggregazione
                    const chiavePulita = key.trim().toLowerCase();
                    const valore = t[key] || 0;
                    aggregati[chiavePulita] = (aggregati[chiavePulita] || 0) + valore;
                    
                    if (t.nomiServizi && t.nomiServizi[key]) {
                        nomiServiziOriginali[chiavePulita] = t.nomiServizi[key];
                    }
                }
            });
        });

        // 2. Converte in array per ordinare e filtrare
        const serviziAggregati = Object.keys(aggregati)
            .filter(chiave => aggregati[chiave] > 0) 
            .map(chiave => {
                let nome = nomiServiziOriginali[chiave] || chiave.charAt(0).toUpperCase() + chiave.slice(1);
                nome = nome.replace(/([A-Z])/g, ' $1').trim(); // Rende leggibili i camelCase (es. tagliobarba -> Taglio Barba)
                return {
                    servizio: nome,
                    // La chiave API pulita sarà usata per il data-attributo
                    chiaveAPI: chiave, 
                    totale_richieste: aggregati[chiave]
                };
            })
            // 3. Ordina per il più richiesto
            .sort((a, b) => b.totale_richieste - a.totale_richieste);
            
        // 4. Popola l'HTML
        container.innerHTML = serviziAggregati.map((s, i) => `
            <div class="servizio-item clickable" data-servizio-chiave="${s.chiaveAPI}" title="Clicca per vedere i clienti">
                <div>${i + 1}. <strong>${s.servizio}</strong></div>
                <div>Richieste: ${s.totale_richieste}</div>
            </div>
        `).join('');
        
        if (serviziAggregati.length === 0) {
            container.innerHTML = `<div class="loading-message">Nessun servizio richiesto nel periodo.</div>`;
            return;
        }

        // AGGIUNGI L'EVENT LISTENER ai nuovi elementi per aprire la modale
        container.querySelectorAll('.servizio-item.clickable').forEach(item => {
            item.addEventListener('click', function() {
                const nomeServizio = item.querySelector('strong').textContent;
                const chiaveServizio = this.getAttribute('data-servizio-chiave');
                mostraClientiServizio(nomeServizio, chiaveServizio);
            });
        });
    }

    function popolaDistribuzioneFedelta(distribuzione) {
        const container = document.getElementById('mappa-fidelita');
        if (!container) return;
        container.innerHTML = distribuzione.map(cat => `
            <div class="categoria-fidelita data-box">
                <strong>${cat.categoria}</strong>
                <div>${cat.count} clienti</div>
                <small>(${cat.intervallo})</small>
            </div>
        `).join('');
    }

    // =======================================================
    // === GRAFICO DISTRIBUZIONE SERVIZI (TORTA/DOUGHNUT) ===
    // =======================================================
    function popolaDistribuzioneServizi(trend) {
        const container = document.getElementById('grafico-trend');
        if (!container) return;

        // Setup Canvas e contesto
        container.innerHTML = '';
        const canvas = document.createElement('canvas');
        canvas.id = 'distribuzioneServiziChart';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d'); 
        
        const aggregati = {};
        let serviziTotali = new Set();
        let nomiServiziOriginali = {};

        // 1. Aggrega i dati di tutti i mesi nel periodo selezionato
        trend.forEach(t => {
            Object.keys(t).forEach(key => {
                if (key !== 'mese' && key !== 'nomiServizi') { 
                    // CORREZIONE CRUCIALE: Normalizza a minuscolo per aggregazione
                    const chiavePulita = key.trim().toLowerCase();
                    const valore = t[key] || 0;
                    
                    aggregati[chiavePulita] = (aggregati[chiavePulita] || 0) + valore;
                    serviziTotali.add(chiavePulita);
                    
                    if (t.nomiServizi && t.nomiServizi[key]) {
                        nomiServiziOriginali[chiavePulita] = t.nomiServizi[key];
                    }
                }
            });
        });

        // 2. Filtra i servizi con somma totale > 0 e li ordina alfabeticamente
        const datiFiltrati = Array.from(serviziTotali)
            .filter(chiave => aggregati[chiave] > 0) 
            .sort((a, b) => {
                 const labelA = nomiServiziOriginali[a] || a.charAt(0).toUpperCase() + a.slice(1);
                 const labelB = nomiServiziOriginali[b] || b.charAt(0).toUpperCase() + b.slice(1);
                 return labelA.localeCompare(labelB);
            }); 

        // 3. Prepara i dati per Chart.js
        const labels = [];
        const dati = [];
        const colori = [];

        datiFiltrati.forEach(chiavePulita => {
            let labelDaMostrare = nomiServiziOriginali[chiavePulita] 
                || chiavePulita.charAt(0).toUpperCase() + chiavePulita.slice(1);
            labelDaMostrare = labelDaMostrare.replace(/([A-Z])/g, ' $1').trim();
            
            labels.push(labelDaMostrare);
            dati.push(aggregati[chiavePulita]);
            
            if (!coloriServiziMappati[chiavePulita]) {
                coloriServiziMappati[chiavePulita] = getRandomColor();
            }
            colori.push(coloriServiziMappati[chiavePulita]);
        });

        // 4. Configurazione del grafico a torta (Doughnut)
        const datasets = [{
            label: 'Richieste Totali nel Periodo',
            data: dati,
            backgroundColor: colori,
            hoverOffset: 4
        }];

        new Chart(ctx, { 
            type: 'doughnut', 
            data: { labels, datasets },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'Distribuzione Servizi nel Periodo' },
                    legend: { 
                        position: 'bottom',
                        labels: { usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const currentValue = context.raw;
                                const percentage = parseFloat(((currentValue / total) * 100).toFixed(1));
                                return `${label} ${currentValue} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    function popolaInsights(insights) {
        const container = document.getElementById('insights-container');
        if (!container) return;
        container.innerHTML = insights.map(i => `
            <div class="insight-item data-box">
                <strong>${i.titolo}</strong>
                <p>${i.descrizione}</p>
            </div>
        `).join('');
    }

    // =======================================================
    // === FUNZIONE GESTIONE MODALE SERVIZI ===
    // =======================================================
    async function mostraClientiServizio(nomeServizio, chiaveServizio) {
        const modalContent = document.getElementById('modal-lista-clienti');
        const modalTitle = document.getElementById('modal-titolo-servizio');
        const periodo = filtroPeriodo ? filtroPeriodo.value : 'ultimi-3-mesi'; // Fallback
    
        if (!modal || !modalContent) return;

        modalTitle.textContent = `Clienti per: ${nomeServizio} (${periodo})`;
        modalContent.innerHTML = `<div class="loading-message">Caricamento clienti per ${nomeServizio}...</div>`;
        modal.style.display = 'block'; // Mostra la modale

        try {
            // Chiamata API per ottenere la lista clienti per quel servizio e periodo
            const clienti = await fetchDati('/api/analisi/clienti-per-servizio', { 
                servizio: chiaveServizio, 
                periodo: periodo 
            });

                   if (clienti.length > 0) {
            modalContent.innerHTML = clienti.map(c => `
                <div class="cliente-servizio-item">
                    <a href="/scheda-cliente.html?id=${c.id}" class="link-cliente">
                        <strong>${c.nome} ${c.cognome}</strong> 
                    </a>
                    
                            <small>| 
            <span style="color: #FFD700; font-weight: bold;">Visite: ${c.visite}</span> 
            | Ultima: ${c.ultimaVisita || 'N/D'}
        </small>
                </div>
            `).join('');
        } else {
                modalContent.innerHTML = `<div class="loading-message">Nessun cliente trovato per questo servizio nel periodo.</div>`;
            }
            
        } catch (error) {
            console.error("Errore caricamento lista clienti:", error);
            modalContent.innerHTML = `<div style="color:red;">Errore nel caricamento della lista.</div>`;
        }
    }


    function mostraErrore(messaggio) {
        ['classifica-clienti','classifica-servizi','mappa-fidelita','grafico-trend','insights-container']
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = `<div style="color:red;text-align:center;padding:20px;">${messaggio}</div>`;
            });
    }

    function mostraMessaggioTemporaneo(msg, tipo="info") {
        const esistenti = document.querySelectorAll('.messaggio-temporaneo');
        esistenti.forEach(m => m.remove());
        const div = document.createElement('div');
        div.className = `messaggio-temporaneo messaggio-${tipo}`;
        div.textContent = msg;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        `;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function popolaPagina(dati) {
        popolaClassificaClienti(dati.clientiAssidui);
        popolaServiziPopolariAggregati(dati.trendMensile); 
        popolaDistribuzioneFedelta(dati.distribuzioneFedelta);
        popolaDistribuzioneServizi(dati.trendMensile); 
        popolaInsights(dati.insights);
    }

    // ===== EVENT LISTENER =====
    if (aggiornaDatiBtn) aggiornaDatiBtn.addEventListener('click', caricaDatiAnalisi);
    if (filtroPeriodo) filtroPeriodo.addEventListener('change', caricaDatiAnalisi);

    // Chiusura della modale
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }
    }
    // Chiusura con click fuori dalla modale
    window.onclick = function(event) {
        if (modal && event.target == modal) {
            modal.style.display = "none";
        }
    }
    
    // Caricamento iniziale
    caricaDatiAnalisi();
});