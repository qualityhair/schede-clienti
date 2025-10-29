// ============================
// CHARTS LIVE DASHBOARD
// ============================

const ctxApp = document.getElementById('chart-appuntamenti').getContext('2d');
const ctxCli = document.getElementById('chart-clienti').getContext('2d');
const ctxTratt = document.getElementById('chart-trattamenti').getContext('2d');

let chartApp, chartCli, chartTratt;

// Funzione per prendere i KPI dal backend (con credenziali di sessione)
async function fetchKPI() {
    try {
        const res = await fetch('/api/kpi', {
            credentials: 'include' // <- invia i cookie di sessione
        });
        if (!res.ok) throw new Error(`Errore fetch KPI: ${res.status}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
        return {
            appuntamentiOggi: [],
            clientiNuovi: { labels: [], data: [] },
            trattamenti: { labels: [], data: [] }
        };
    }
}

// Funzione per aggiornare i grafici
async function updateCharts() {
    const kpi = await fetchKPI();

    // ===== Appuntamenti Oggi =====
    if(!chartApp){
        chartApp = new Chart(ctxApp, {
            type: 'bar',
            data: {
                labels: kpi.appuntamentiOggi.map(a => a.operatore),
                datasets: [{
                    label: 'Appuntamenti',
                    data: kpi.appuntamentiOggi.map(a => a.count),
                    backgroundColor: kpi.appuntamentiOggi.map(a => a.operatore === 'Sandro' ? '#4CAF50' : '#2196F3')
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                animation: { duration: 800 }
            }
        });
    } else {
        chartApp.data.labels = kpi.appuntamentiOggi.map(a => a.operatore);
        chartApp.data.datasets[0].data = kpi.appuntamentiOggi.map(a => a.count);
        chartApp.update();
    }

    // ===== Clienti Nuovi / Mese =====
    if(!chartCli){
        chartCli = new Chart(ctxCli, {
            type: 'line',
            data: {
                labels: kpi.clientiNuovi.labels,
                datasets: [{
                    label: 'Clienti Nuovi',
                    data: kpi.clientiNuovi.data,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255,152,0,0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, animation: { duration: 800 } }
        });
    } else {
        chartCli.data.labels = kpi.clientiNuovi.labels;
        chartCli.data.datasets[0].data = kpi.clientiNuovi.data;
        chartCli.update();
    }

    // ===== Trattamenti Più Richiesti =====
    if(!chartTratt){
        chartTratt = new Chart(ctxTratt, {
            type: 'doughnut',
            data: {
                labels: kpi.trattamenti.labels,
                datasets: [{
                    label: 'Trattamenti',
                    data: kpi.trattamenti.data,
                    backgroundColor: ['#FF5722','#3F51B5','#4CAF50','#FFC107','#9C27B0']
                }]
            },
            options: { responsive: true, animation: { duration: 800 } }
        });
    } else {
        chartTratt.data.labels = kpi.trattamenti.labels;
        chartTratt.data.datasets[0].data = kpi.trattamenti.data;
        chartTratt.update();
    }
}

// Aggiornamento automatico ogni 10 secondi
updateCharts();
setInterval(updateCharts, 10000);
