document.addEventListener('DOMContentLoaded', async () => {
    // Riferimenti agli elementi della pagina
    const loadingView = document.getElementById('loading-view');
    const buonoView = document.getElementById('buono-view');
    const errorView = document.getElementById('error-view');
    const errorMessage = document.getElementById('error-message');

    const titoloSaluto = document.getElementById('titolo-saluto');
    const regalatoDa = document.getElementById('regalato-da');
    const descrizioneBuono = document.getElementById('descrizione-buono');
    const dettagliQuantita = document.getElementById('dettagli-quantita');
    const dettagliValore = document.getElementById('dettagli-valore');
    const valoreRimanente = document.getElementById('valore-rimanente');
    const valoreIniziale = document.getElementById('valore-iniziale');
    const statoBuono = document.getElementById('stato-buono');
    
    // --- FUNZIONE PRINCIPALE ---
    async function caricaBuono() {
        try {
            // 1. Estrai il token dall'URL
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');

            if (!token) {
                throw new Error("Token mancante. Il link non è valido.");
            }

            // 2. Chiama l'API pubblica per ottenere i dati del buono
            const response = await fetch(`/api/buono/public/${token}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Buono non trovato o link scaduto.");
            }
            const buono = await response.json();

            // 3. Popola la pagina con i dati ricevuti
            popolaPagina(buono);
            
            // 4. Mostra la vista corretta
            loadingView.style.display = 'none';
            buonoView.style.display = 'block';

        } catch (error) {
            console.error("Errore nel caricamento del buono:", error);
            errorMessage.textContent = error.message;
            loadingView.style.display = 'none';
            errorView.style.display = 'block';
        }
    }

    // --- FUNZIONE PER POPOLARE L'HTML ---
    function popolaPagina(buono) {
        titoloSaluto.textContent = `Un Regalo Speciale per te, ${buono.beneficiario_nome}!`;
        regalatoDa.textContent = `${buono.acquirente_nome} ${buono.acquirente_cognome} ha pensato a te regalandoti:`;
        descrizioneBuono.textContent = buono.descrizione || 'Un fantastico buono regalo';

        if (buono.tipo_buono === 'quantita') {
            dettagliQuantita.style.display = 'block';
            dettagliValore.style.display = 'none';
            
            buono.servizi_inclusi.forEach(servizio => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'servizio-item';
                
                let progressBarHtml = '<div class="progress-bar">';
                for(let i = 0; i < servizio.totali; i++) {
                    progressBarHtml += `<div class="progress-box ${i < servizio.usati ? 'used' : ''}"></div>`;
                }
                progressBarHtml += '</div>';

                itemDiv.innerHTML = `
                    <strong>${servizio.servizio}</strong>
                    ${progressBarHtml}
                    <div class="servizio-conto">Utilizzati ${servizio.usati} su ${servizio.totali}</div>
                `;
                dettagliQuantita.appendChild(itemDiv);
            });

        } else if (buono.tipo_buono === 'valore') {
            dettagliQuantita.style.display = 'none';
            dettagliValore.style.display = 'block';
            valoreRimanente.textContent = `€ ${parseFloat(buono.valore_rimanente_euro).toFixed(2)}`;
            valoreIniziale.textContent = `Valore iniziale: € ${parseFloat(buono.valore_iniziale_euro).toFixed(2)}`;
        }

        statoBuono.textContent = buono.stato.charAt(0).toUpperCase() + buono.stato.slice(1);
        statoBuono.className = `status-badge ${buono.stato}`;
    }

    // Avvia il caricamento
    caricaBuono();
});
