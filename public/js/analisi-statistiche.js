document.addEventListener("DOMContentLoaded", () => {
    console.log("📊 Pagina Analisi e Statistiche caricata!");
    
    // Elementi DOM
    const filtroPeriodo = document.getElementById('filtro-periodo');
    const aggiornaDatiBtn = document.getElementById('aggiorna-dati-btn');
    
    // Mappa periodi per API
    const mappaPeriodi = {
        'ultimo-mese': '1',
        'ultimi-3-mesi': '3', 
        'ultimi-6-mesi': '6',
        'ultimo-anno': '12'
    };

    // Funzione principale di caricamento
    // Funzione principale di caricamento
async function caricaDatiAnalisi() {
    console.log("=== DEBUG INIZIO CARICAMENTO ===");
    console.log("1. Periodo selezionato nell'HTML:", filtroPeriodo.value);
    console.log("2. Parametro convertito per API:", mappaPeriodi[filtroPeriodo.value] || '3');
    
    // Aggiungi feedback visivo
    if (aggiornaDatiBtn) {
        aggiornaDatiBtn.disabled = true;
        aggiornaDatiBtn.textContent = "🔄 Caricamento...";
    }
    
    const periodo = filtroPeriodo.value;
    const parametriAPI = mappaPeriodi[periodo] || '3';
    
    try {
        console.log("3. Inizio caricamento dati in parallelo...");
        
        // Carica tutti i dati in parallelo
        const [clientiAssidui, serviziPopolari, distribuzioneFedelta, trendMensile, insights] = await Promise.all([
            fetchDati('/api/analisi/clienti-assidui', { periodo }),
            fetchDati('/api/analisi/servizi-popolari', { periodo }),
            fetchDati('/api/analisi/distribuzione-fedelta'),
            fetchDati('/api/analisi/trend-mensile', { mesi: parametriAPI }),
            fetchDati('/api/analisi/insights')
        ]);
        
        console.log("4. Dati ricevuti:", {
            clienti: clientiAssidui.length,
            servizi: serviziPopolari.length,
            trend: trendMensile.length,
            insights: insights.length
        });
        
        // Popola la pagina con i dati reali
        popolaPagina({
            clientiAssidui,
            serviziPopolari, 
            distribuzioneFedelta,
            trendMensile,
            insights
        });
        
        console.log("5. Pagina aggiornata con successo!");
        mostraMessaggioTemporaneo("Dati aggiornati!", "success");
        
    } catch (error) {
        console.error("6. ERRORE nel caricamento:", error);
        mostraErrore("Impossibile caricare i dati delle statistiche");
        mostraMessaggioTemporaneo("Errore nel caricamento", "error");
    } finally {
        // Ripristina il pulsante
        if (aggiornaDatiBtn) {
            aggiornaDatiBtn.disabled = false;
            aggiornaDatiBtn.textContent = "🔄 Aggiorna";
        }
        console.log("=== DEBUG FINE CARICAMENTO ===");
    }
}

    // Funzione helper per fetch API
    // Funzione helper per fetch API
async function fetchDati(endpoint, parametri = {}) {
    const url = new URL(endpoint, window.location.origin);
    
    console.log(`   Chiamando API: ${endpoint}`);
    console.log(`   Parametri:`, parametri);
    
    Object.keys(parametri).forEach(key => {
        url.searchParams.append(key, parametri[key]);
        console.log(`   - ${key}: ${parametri[key]}`);
    });
    
    console.log(`   URL completo: ${url.toString()}`);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Errore API: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`   Risultato: ${data.length} elementi`);
    return data;
}

// Funzione per mostrare messaggi temporanei
function mostraMessaggioTemporaneo(messaggio, tipo = "info") {
    // Rimuovi messaggi precedenti
    const messaggiEsistenti = document.querySelectorAll('.messaggio-temporaneo');
    messaggiEsistenti.forEach(msg => msg.remove());
    
    const messaggioDiv = document.createElement('div');
    messaggioDiv.className = `messaggio-temporaneo messaggio-${tipo}`;
    messaggioDiv.textContent = messaggio;
    messaggioDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        ${tipo === 'success' ? 'background: #4CAF50;' : ''}
        ${tipo === 'error' ? 'background: #f44336;' : ''}
        ${tipo === 'info' ? 'background: #2196F3;' : ''}
    `;
    
    document.body.appendChild(messaggioDiv);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        if (messaggioDiv.parentNode) {
            messaggioDiv.remove();
        }
    }, 3000);
}



	// =======================================================
// === FUNZIONI PER POPOLARE L'INTERFACCIA ==============
// =======================================================

// Classifica clienti più fedeli
function popolaClassificaClienti(clienti) {
    const container = document.getElementById('classifica-clienti');
    
    container.innerHTML = clienti.map((cliente, index) => `
        <div class="cliente-item">
            <div class="cliente-info">
                <div class="cliente-nome">
                    ${index + 1}. ${cliente.nome} ${cliente.cognome}
                </div>
                <div class="cliente-dettagli">
                    Frequenza media: ${cliente.frequenzaMedia} giorni • Ultima visita: ${cliente.ultimaVisita}
                </div>
            </div>
            <div class="cliente-statistiche">
                <div class="visite-count">${cliente.visite}</div>
                <div class="frequenza-media">visite</div>
            </div>
        </div>
    `).join('');
}

// Servizi più richiesti
function popolaServiziPopolari(servizi) {
    const container = document.getElementById('classifica-servizi');
    
    container.innerHTML = servizi.map((servizio, index) => `
        <div class="servizio-item">
            <div class="servizio-info">
                <div class="cliente-nome">
                    ${index + 1}. ${servizio.servizio}
                </div>
            </div>
            <div class="servizio-statistiche">
                <div class="richieste-count">${servizio.totale_richieste}</div>
                <div class="frequenza-media">richieste</div>
            </div>
        </div>
    `).join('');
}

// Distribuzione fedeltà clienti
function popolaDistribuzioneFedelta(distribuzione) {
    const container = document.getElementById('mappa-fidelita');
    
    container.innerHTML = distribuzione.map(cat => `
        <div class="categoria-fidelita categoria-${cat.categoria.toLowerCase().replace(' ', '-')}">
            <div class="categoria-titolo">${cat.categoria}</div>
            <div class="categoria-count">${cat.count} clienti</div>
            <div class="categoria-intervallo">${cat.intervallo}</div>
        </div>
    `).join('');
}

// Trend mensile servizi
function popolaTrendMensile(trend) {
    const container = document.getElementById('grafico-trend');
    
    // Trova il valore massimo per la scala
    const maxValore = Math.max(...trend.flatMap(m => [m.colore, m.taglio, m.meches]));
    
    container.innerHTML = trend.map(mese => `
        <div class="trend-mese">
            <div class="mese-header">
                <span class="mese-nome">${mese.mese}</span>
                <span style="color: #ccc; font-size: 0.9em;">
                    C:${mese.colore} T:${mese.taglio} M:${mese.meches}
                </span>
            </div>
            <div class="barra-trend">
                <div class="barra-interna" style="width: ${(mese.colore / maxValore) * 100}%"></div>
            </div>
        </div>
    `).join('');
}

// Insights e raccomandazioni
function popolaInsights(insights) {
    const container = document.getElementById('insights-container');
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-item insight-${insight.tipo}">
            <div class="insight-titolo">${insight.titolo}</div>
            <div class="insight-descrizione">${insight.descrizione}</div>
        </div>
    `).join('');
}

// Gestione errori
function mostraErrore(messaggio) {
    const containers = [
        'classifica-clienti',
        'classifica-servizi', 
        'mappa-fidelita',
        'grafico-trend',
        'insights-container'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="error-message" style="color: #f44336; text-align: center; padding: 20px;">${messaggio}</div>`;
        }
    });
}

// Popola tutte le sezioni della pagina
function popolaPagina(dati) {
    popolaClassificaClienti(dati.clientiAssidui);
    popolaServiziPopolari(dati.serviziPopolari);
    popolaDistribuzioneFedelta(dati.distribuzioneFedelta);
    popolaTrendMensile(dati.trendMensile);
    popolaInsights(dati.insights);
}


    // Event Listeners CON CONTROLLO DI SICUREZZA
    if (aggiornaDatiBtn) {
        aggiornaDatiBtn.addEventListener('click', caricaDatiAnalisi);
    } else {
        console.error("Pulsante aggiorna non trovato!");
    }
    
    if (filtroPeriodo) {
        filtroPeriodo.addEventListener('change', caricaDatiAnalisi);
    } else {
        console.error("Filtro periodo non trovato!");
    }

    // Caricamento iniziale
    caricaDatiAnalisi();
	
	
	// =============================================
// FIX IMMEDIATO PER LA SIDEBAR
// =============================================
console.log("🔧 Applico fix sidebar...");

const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('open-sidebar-btn');

if (hamburger && sidebar) {
    // 1. APRI SIDEBAR quando clicchi ☰
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log("➡️ Apro sidebar");
        sidebar.classList.add('is-open');
    });
    
    // 2. CHIUDI SIDEBAR quando clicchi fuori
    document.addEventListener('click', function(e) {
        if (sidebar.classList.contains('is-open') && 
            !sidebar.contains(e.target) && 
            e.target !== hamburger) {
            console.log("⬅️ Chiudo sidebar");
            sidebar.classList.remove('is-open');
        }
    });
    
    console.log("✅ Fix sidebar applicato!");
} else {
    console.error("❌ Non trovo sidebar o pulsante");
}
	
	
});