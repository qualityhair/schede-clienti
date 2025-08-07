// File: /public/js/storico-analisi-app.js

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. RIFERIMENTI AGLI ELEMENTI E RECUPERO ID ---
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('clienteId');
    
    const nomeClienteTitolo = document.getElementById('nome-cliente-titolo');
    const listaStoricoBody = document.getElementById('lista-storico-analisi');
    const tornaBtn = document.getElementById('torna-a-scheda-cliente');

    if (!clienteId) {
        alert("ID Cliente non trovato. Impossibile caricare lo storico.");
        window.location.href = '/dashboard.html'; // Reindirizza se manca l'ID
        return;
    }

    // Imposta subito il link del pulsante "Torna"
    tornaBtn.href = `/scheda-cliente.html?id=${clienteId}`;

    // --- 2. FUNZIONE PER CARICARE E VISUALIZZARE I DATI ---
    async function caricaStorico() {
        try {
            // Chiamata per recuperare il nome del cliente per il titolo
            const clientResponse = await fetch(`/api/clienti/${clienteId}`);
            if (!clientResponse.ok) throw new Error("Cliente non trovato.");
            const clientData = await clientResponse.json();
            nomeClienteTitolo.textContent = `per ${clientData.client.nome} ${clientData.client.cognome}`;

            // Chiamata all'API dello storico che abbiamo creato
            const analisiResponse = await fetch(`/api/clienti/${clienteId}/analisi`);
            if (!analisiResponse.ok) throw new Error("Errore nel caricamento dello storico analisi.");
            
            const storico = await analisiResponse.json();

            // Pulisci il messaggio di "caricamento..." dalla tabella
            listaStoricoBody.innerHTML = '';

            if (storico.length === 0) {
                listaStoricoBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nessuna analisi trovata per questo cliente.</td></tr>';
                return;
            }

            // Per ogni analisi trovata, crea una riga nella tabella
            storico.forEach(analisi => {
                const row = listaStoricoBody.insertRow();
                
                row.insertCell().textContent = new Date(analisi.data_analisi).toLocaleDateString('it-IT');
                row.insertCell().textContent = analisi.esigenza_cliente || 'N/D';
                row.insertCell().textContent = analisi.diagnosi_primaria || 'N/D';
                
                const actionCell = row.insertCell();
                actionCell.style.whiteSpace = 'nowrap';

                // Pulsante "Vedi Dettagli"
                const vediBtn = document.createElement('a');
                vediBtn.href = `/visualizza-analisi.html?analisiId=${analisi.id}`;
                vediBtn.className = 'btn btn-primary';
                vediBtn.textContent = 'Vedi';
                vediBtn.style.marginRight = '5px';
                actionCell.appendChild(vediBtn);
                
                // Pulsante "Modifica"
                const modificaBtn = document.createElement('a');
                modificaBtn.href = `/modifica-analisi.html?analisiId=${analisi.id}`; // Pagina che creeremo in futuro
                modificaBtn.className = 'btn btn-nav';
                modificaBtn.textContent = 'Modifica';
                modificaBtn.style.marginRight = '5px';
                actionCell.appendChild(modificaBtn);

                // Pulsante "Elimina"

				const eliminaBtn = document.createElement('button');
				eliminaBtn.className = 'btn btn-danger';
				eliminaBtn.textContent = 'Elimina';
				eliminaBtn.onclick = () => {
				// Chiama la nostra nuova funzione di eliminazione
				handleDeleteAnalisi(analisi.id, new Date(analisi.data_analisi).toLocaleDateString('it-IT'));
				};
				actionCell.appendChild(eliminaBtn);;
            });

        } catch (error) {
            console.error(error);
            listaStoricoBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">${error.message}</td></tr>`;
        }
    }

// ... fine della funzione caricaStorico() ...

// =======================================================
// === NUOVA FUNZIONE PER GESTIRE L'ELIMINAZIONE         ===
// =======================================================
async function handleDeleteAnalisi(analisiId, dataAnalisi) {
    // Usiamo il tuo metodo di conferma preferito
    if (!confirm(`Sei sicuro di voler eliminare l'analisi del ${dataAnalisi}? L'azione è irreversibile.`)) {
        return; // L'utente ha annullato
    }

    try {
        const response = await fetch(`/api/analisi/${analisiId}`, {
            method: 'DELETE'
        });

        if (response.status === 204) { // 204 No Content = Successo!
            alert("Analisi eliminata con successo!");
            // Ricarichiamo lo storico per mostrare la lista aggiornata
            await caricaStorico(); 
        } else if (response.status === 404) {
            alert("Errore: Analisi non trovata. Potrebbe essere già stata eliminata.");
        } else {
            // Per altri errori (es. 500)
            const errorData = await response.json();
            throw new Error(errorData.error || "Si è verificato un errore sconosciuto.");
        }
    } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        alert(`Errore: ${error.message}`);
    }
}



    // --- 3. ESECUZIONE ---
    await caricaStorico();
});