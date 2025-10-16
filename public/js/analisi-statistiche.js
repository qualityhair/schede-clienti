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
    colore: '#F39C12',             // Arancione Saturo
    taglio: '#3498DB',             // Blu Brillante
    piega: '#2ECC71',              // Verde Smeraldo
    barba: '#95A5A6',              // Grigio Medio
    meches: '#9B59B6',             // Viola Profondo
    tonalizzazione: '#1ABC9C',     // Turchese
    // Colore Rosso Vivo per il Trattamento (massimo contrasto)
    trattamento: '#E74C3C',        
    
    // Chiavi composte che verranno trovate nel JSON del backend
    tagliobarba: '#5D6D7E',        // Grigio Blu
    coloretaglio: '#E67E22',       // Arancione Scuro
    maschera: '#A6B1E1',           // Lavanda Chiaro
    
    altro: '#5D6D7E',              // Colore di fallback scuro
};

// =======================================================
// === FUNZIONE DI CHIAMATA API REALE (VERSIONE CORRETTA) ===
// =======================================================
async function fetchDati(endpoint, parametri = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(parametri).forEach(key => {
        // ORA TUTTI I PARAMETRI VENGONO AGGIUNTI
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

    // ===== IMPOSTAZIONE DEFAULT FILTRO =====
    if (filtroPeriodo) {
        filtroPeriodo.value = "ultimo-mese";              // Imposta "Ultimo Mese" come default
        filtroPeriodo.dispatchEvent(new Event("change")); // Trigger per caricare subito i dati
    }

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

        const periodo = filtroPeriodo.value;

        try {

            // 🛑 AGGIORNATO: L'API trend-mensile restituisce ora { trendDati, totaleServizi }
            const [clientiAssidui, distribuzioneFedelta, trendResponse, insights] = await Promise.all([
                fetchDati('/api/analisi/clienti-assidui', { periodo }),
                fetchDati('/api/analisi/distribuzione-fedelta'),
                fetchDati('/api/analisi/trend-mensile', { periodo }),
                fetchDati('/api/analisi/insights')
            ]);

            popolaPagina({
                clientiAssidui,
                distribuzioneFedelta,
                trendMensile: trendResponse.trendDati,
                totaleServizi: trendResponse.totaleServizi,
                insights
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
            <div class="cliente-header">
                <div class="cliente-nome">${i + 1}. ${c.nome} ${c.cognome}</div>
                <div class="cliente-visite">${c.visite} visite</div>
            </div>
            <div class="cliente-info">
                <div>Frequenza media: ${c.frequenzaMedia || '?'} giorni</div>
                <div>Ultima visita: ${c.ultimaVisita || 'N/D'}</div>
            </div>
        </div>
    `).join('');
}


    // Classifica Servizi Popolari Aggregata
    function popolaServiziPopolariAggregati(trend) {
        const container = document.getElementById('classifica-servizi');
        if (!container) return;

        const aggregati = {};
        let nomiServiziOriginali = {};

        trend.forEach(t => {
            Object.keys(t).forEach(key => {
                if (key !== 'mese' && key !== 'nomiServizi') {
                    const chiavePulita = key.trim().toLowerCase();
                    const valore = t[key] || 0;
                    aggregati[chiavePulita] = (aggregati[chiavePulita] || 0) + valore;

                    if (t.nomiServizi && t.nomiServizi[key]) {
                        nomiServiziOriginali[chiavePulita] = t.nomiServizi[key];
                    }
                }
            });
        });

        const serviziAggregati = Object.keys(aggregati)
            .filter(chiave => aggregati[chiave] > 0)
            .map(chiave => {
                let nome = nomiServiziOriginali[chiave] || chiave.charAt(0).toUpperCase() + chiave.slice(1);
                nome = nome.replace(/([A-Z])/g, ' $1').trim();
                return { servizio: nome, chiaveAPI: chiave, totale_richieste: aggregati[chiave] };
            })
            .sort((a, b) => b.totale_richieste - a.totale_richieste);

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

        container.querySelectorAll('.servizio-item.clickable').forEach(item => {
            item.addEventListener('click', function () {
                const nomeServizio = item.querySelector('strong').textContent;
                const chiaveServizio = this.getAttribute('data-servizio-chiave');
                mostraClientiServizio(nomeServizio, chiaveServizio);
            });
        });
    }

    let fedeltaChart = null;

    function popolaDistribuzioneFedelta(distribuzione) {
        const container = document.getElementById('mappa-fidelita');
        if (!container) return;

        let canvas = container.querySelector('canvas');
        if (!canvas) {
            container.innerHTML = '';
            canvas = document.createElement('canvas');
            canvas.id = 'fedeltaChart';
            container.appendChild(canvas);
        }
        const ctx = canvas.getContext('2d');

        const labels = distribuzione.map(cat => cat.categoria);
        const dati = distribuzione.map(cat => cat.count);
        const colori = distribuzione.map(cat => {
            const nome = cat.categoria.toLowerCase();
            if (nome.includes('vip')) return '#3498DB';
            if (nome.includes('regolari')) return '#2ECC71';
            if (nome.includes('occasionali')) return '#F1C40F';
            if (nome.includes('a rischio')) return '#E74C3C';
            return '#95A5A6';
        });

        const config = {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Numero Clienti',
                    data: dati,
                    backgroundColor: colori,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                animation: { duration: 800, easing: 'easeOutCubic' },
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'Distribuzione Fedeltà Clienti' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const cat = distribuzione[context.dataIndex];
                                return `${cat.categoria}: ${context.raw} clienti (${cat.intervallo})`;
                            }
                        }
                    }
                },
                scales: { x: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        };

        if (fedeltaChart) {
            fedeltaChart.data.labels = labels;
            fedeltaChart.data.datasets[0].data = dati;
            fedeltaChart.data.datasets[0].backgroundColor = colori;
            fedeltaChart.update();
        } else {
            fedeltaChart = new Chart(ctx, config);
        }
    }



    // =======================================================
    // === GRAFICO DISTRIBUZIONE SERVIZI (TORTA/DOUGHNUT) ===
    // =======================================================
    let distribuzioneServiziChart = null;
let datiTrendMensile = null;
let graficoInizializzato = false;

function popolaDistribuzioneServizi(trend, tipoSelezionato = null) {
    datiTrendMensile = trend;

    const container = document.getElementById('grafico-trend');
    if (!container) return;

    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'distribuzioneServiziChart';
        canvas.style.opacity = 0; // start hidden for fade
        container.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');

    // Aggregazione dati
    const aggregati = {};
    let serviziTotali = new Set();
    let nomiServiziOriginali = {};

    trend.forEach(t => {
        Object.keys(t).forEach(key => {
            if (key !== 'mese' && key !== 'nomiServizi') {
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

    const datiFiltrati = Array.from(serviziTotali)
        .filter(chiave => aggregati[chiave] > 0)
        .sort((a, b) => {
            const labelA = nomiServiziOriginali[a] || a.charAt(0).toUpperCase() + a.slice(1);
            const labelB = nomiServiziOriginali[b] || b.charAt(0).toUpperCase() + b.slice(1);
            return labelA.localeCompare(labelB);
        });

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

    tipoSelezionato = tipoSelezionato || document.getElementById('tipoGrafico')?.value || 'barOrizzontale';

    const configBase = {
        type: tipoSelezionato === 'doughnut' ? 'doughnut' : 'bar',
        data: {
            labels,
            datasets: [{
    label: 'Richieste Totali',
    data: dati,
    backgroundColor: colori,
    barThickness: 20   // <--- Stessa altezza barre del grafico fedeltà
}]

        },
        options: {
            responsive: true,
            animation: { duration: 1000, easing: 'easeOutBounce' }, // <--- effetto bounce
            plugins: {
                title: { display: true, text: 'Distribuzione Servizi nel Periodo' },
                legend: { position: 'bottom', labels: { usePointStyle: true }, display: tipoSelezionato==='doughnut' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if(label) label += ': ';
                            const total = context.dataset.data.reduce((a,b)=>a+b,0);
                            const current = context.raw;
                            const perc = ((current/total)*100).toFixed(1);
                            return `${label} ${current} (${perc}%)`;
                        }
                    }
                }
            },
            scales: {}
        }
    };

    if(tipoSelezionato === 'barVertical') {
        configBase.options.indexAxis = 'x';
        configBase.options.scales = { y: { beginAtZero: true, ticks: { precision: 0 } } };
    } else if(tipoSelezionato === 'barOrizzontale') {
        configBase.options.indexAxis = 'y';
        configBase.options.scales = { x: { beginAtZero: true, ticks: { precision: 0 } } };
    }

    canvas.style.transition = 'opacity 0.4s';

    if(distribuzioneServiziChart) {
        // Fade out + update + fade in + bounce
        canvas.style.opacity = 0;
        setTimeout(() => {
            distribuzioneServiziChart.config.type = configBase.type;
            distribuzioneServiziChart.config.options.indexAxis = configBase.options.indexAxis;
            distribuzioneServiziChart.data.labels = labels;
            distribuzioneServiziChart.data.datasets[0].data = dati;
            distribuzioneServiziChart.data.datasets[0].backgroundColor = colori;
            distribuzioneServiziChart.options.scales = configBase.options.scales;
            distribuzioneServiziChart.options.plugins.legend.display = configBase.options.plugins.legend.display;
            distribuzioneServiziChart.options.animation.easing = 'easeOutBounce';
            distribuzioneServiziChart.update({ duration: 1000 });
            canvas.style.opacity = 1;
        }, 300);
    } else {
        // Primo caricamento: slide + grow + bounce
        const datiIniziali = dati.map(() => 0);
        configBase.data.datasets[0].data = datiIniziali;
        distribuzioneServiziChart = new Chart(ctx, configBase);

        setTimeout(() => {
            distribuzioneServiziChart.data.datasets[0].data = dati;
            distribuzioneServiziChart.update({ duration: 1200, easing: 'easeOutBounce' });
            canvas.style.opacity = 1;
        }, 50);
    }
}

// Listener select tipo grafico
document.getElementById('tipoGrafico')?.addEventListener('change', () => {
    if(datiTrendMensile) popolaDistribuzioneServizi(datiTrendMensile);
});


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
    // === NUOVA FUNZIONE PER IL TOTALE SERVIZI ===
    // =======================================================
    function popolaTotaleServizi(totale) {
        const container = document.getElementById('totale-servizi-box'); 
        if (!container) {
            console.warn("Elemento #totale-servizi-box non trovato. Assicurati che sia nel file HTML.");
            return;
        }

        container.innerHTML = `
            <div class="data-box metric-box">
                <small>Trattamenti/Servizi Totali nel Periodo</small>
                <strong style="font-size: 2em; color: #3498DB;">${totale || 0}</strong>
            </div>
        `;
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
        
        <a href="/scheda-cliente.html?id=${c.id}" class="link-cliente nome-cliente-modale">
            ${c.nome} ${c.cognome}
        </a>
        
        <span class="dettagli-modale">
            | Visite: <span style="color: #FFD700; font-weight: bold;">${c.visite}</span> 
            | Ultima: ${c.ultimaVisita || 'N/D'}
        </span>
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
        // 🚀 NUOVO: Chiama la funzione per popolare il totale dei servizi
        popolaTotaleServizi(dati.totaleServizi); 
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

function generaInsightTrendReale(datiTrendMensile) {
    if (!datiTrendMensile || datiTrendMensile.length < 2) 
        return ["Non ci sono abbastanza dati per calcolare il trend."];

    const ultimo = datiTrendMensile[datiTrendMensile.length - 1];
    const precedente = datiTrendMensile[datiTrendMensile.length - 2];

    const insights = [];

    // Prende tutte le chiavi dei servizi
    const chiaviServizi = Object.keys(ultimo).filter(k => k !== 'mese' && k !== 'nomiServizi');

    chiaviServizi.forEach(key => {
        const valoreUltimo = ultimo[key] || 0;
        const valorePrecedente = precedente[key] || 0;

        if (valorePrecedente === 0 && valoreUltimo > 0) {
            insights.push(`Il servizio ${key} ha avuto richieste nel mese corrente, ma nessuna nel mese precedente!`);
        } else if (valorePrecedente > 0) {
            const diffPercent = ((valoreUltimo - valorePrecedente) / valorePrecedente * 100).toFixed(1);
            if (diffPercent > 0) {
                insights.push(`Il servizio ${key} è in crescita del ${diffPercent}% rispetto al mese scorso.`);
            } else if (diffPercent < 0) {
                insights.push(`Il servizio ${key} è in calo del ${Math.abs(diffPercent)}% rispetto al mese scorso.`);
            } else {
                insights.push(`Il servizio ${key} ha mantenuto lo stesso livello rispetto al mese scorso.`);
            }
        }
    });

    return insights;
}


document.getElementById('btnInsightTrend')?.addEventListener('click', () => {
    const container = document.getElementById('insightTrendContainer');
    container.innerHTML = ""; // pulisce vecchi messaggi

    const insights = generaInsightTrendReale(datiTrendMensile); // usa i dati del grafico
    insights.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add("insight-item", "data-box");

    // 🔸 Determina il colore in base al testo
    if (msg.includes("crescita")) {
        div.classList.add("insight-up");
    } else if (msg.includes("calo")) {
        div.classList.add("insight-down");
    } else {
        div.classList.add("insight-stable");
    }

    div.innerHTML = `<p>${msg}</p>`;
    container.appendChild(div);
});

});

window.addEventListener("DOMContentLoaded", () => {
    const filtroTop = document.getElementById("filtro-periodo");
    const filtroBottom = document.getElementById("filtro-periodo-bottom");

    // Imposta il default su "ultimo-mese"
    if (filtroTop) filtroTop.value = "ultimo-mese";
    if (filtroBottom) filtroBottom.value = "ultimo-mese";

    // Sincronizza i due selettori
    if (filtroTop && filtroBottom) {
        filtroTop.addEventListener("change", () => {
            filtroBottom.value = filtroTop.value;
            filtroBottom.dispatchEvent(new Event("change"));
        });

        filtroBottom.addEventListener("change", () => {
            filtroTop.value = filtroBottom.value;
            filtroTop.dispatchEvent(new Event("change"));
        });
    }

    // Triggera subito il change per caricare i dati all'apertura
    if (filtroTop) filtroTop.dispatchEvent(new Event("change"));
});



});