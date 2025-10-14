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
async function fetchDati(endpoint, parametri = {}) {
    const url = new URL(endpoint, window.location.origin);
    Object.keys(parametri).forEach(key => {
        if (endpoint.includes('trend-mensile') && key === 'periodo') {
            return;
        }
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
    console.log("📊 Pagina Analisi e Statistiche caricata!");

    // ===== ELEMENTI DOM =====
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const aggiornaDatiBtn = document.getElementById('aggiorna-dati-btn');

    // Mappa periodi per API
    const mappaPeriodi = {
        'ultimo-mese': '1',
        'ultimi-3-mesi': '3', 
        'ultimi-6-mesi': '6',
        'ultimo-anno': '12'
    };

    // ============================
    // === FUNZIONE CARICAMENTO ===
    // ============================
    async function caricaDatiAnalisi() {
        console.log("=== DEBUG INIZIO CARICAMENTO ===");

        if (aggiornaDatiBtn) {
            aggiornaDatiBtn.disabled = true;
            aggiornaDatiBtn.textContent = "🔄 Caricamento...";
        }

        const periodo = filtroPeriodo.value;
        // Il parametro 'mesi' per l'API trend-mensile
        const parametriAPI = mappaPeriodi[periodo] || '3'; 

        try {
            console.log("Caricamento dati in parallelo...");

            const [clientiAssidui, serviziPopolari, distribuzioneFedelta, trendMensile, insights] = await Promise.all([
                fetchDati('/api/analisi/clienti-assidui', { periodo }),
                fetchDati('/api/analisi/servizi-popolari', { periodo }),
                fetchDati('/api/analisi/distribuzione-fedelta'),
                fetchDati('/api/analisi/trend-mensile', { mesi: parametriAPI }),
                fetchDati('/api/analisi/insights')
            ]);

            popolaPagina({
                clientiAssidui, serviziPopolari, distribuzioneFedelta, trendMensile, insights
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
            console.log("=== DEBUG FINE CARICAMENTO ===");
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

    function popolaServiziPopolari(servizi) {
        const container = document.getElementById('classifica-servizi');
        if (!container) return;
        container.innerHTML = servizi.map((s, i) => `
            <div class="servizio-item">
                <div>${i + 1}. <strong>${s.servizio.charAt(0).toUpperCase() + s.servizio.slice(1)}</strong></div>
                <div>Richieste: ${s.totale_richieste}</div>
            </div>
        `).join('');
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
                    const chiavePulita = key.trim();
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
            .filter(chiave => aggregati[chiave] > 0) // Esclude i servizi con somma totale zero
            .sort((a, b) => {
                 // Usa il nome visualizzato per l'ordinamento alfabetico (più pulito)
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
            
            // Usa il colore mappato (assicurandoti che il trattamento sia #E74C3C)
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
            type: 'doughnut', // 🛑 TIPO DI GRAFICO CAMBIATO IN DOUGHNUT (CIAMBELLA) 🛑
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
                                // Calcola la percentuale per il tooltip
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
        popolaServiziPopolari(dati.serviziPopolari);
        popolaDistribuzioneFedelta(dati.distribuzioneFedelta);
        // 🛑 AGGIORNA LA CHIAMATA ALLA NUOVA FUNZIONE
        popolaDistribuzioneServizi(dati.trendMensile); 
        popolaInsights(dati.insights);
    }

    // ===== EVENT LISTENER =====
    if (aggiornaDatiBtn) aggiornaDatiBtn.addEventListener('click', caricaDatiAnalisi);
    if (filtroPeriodo) filtroPeriodo.addEventListener('change', caricaDatiAnalisi);

    // Caricamento iniziale
    caricaDatiAnalisi();
});