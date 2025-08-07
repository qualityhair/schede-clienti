// Sostituisci tutto il contenuto del file con questo
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const analisiId = urlParams.get('analisiId');
	const stampaBtn = document.getElementById('stampa-analisi-btn');
	const modificaAnalisiBtn = document.getElementById('modifica-analisi-btn'); 
    
    if (!analisiId) {
        alert("ID Analisi non trovato.");
        window.location.href = '/dashboard.html';
        return;
    }

    try {
        // Ora facciamo una sola chiamata API che restituisce tutto
        const response = await fetch(`/api/analisi/${analisiId}`);
        if (!response.ok) throw new Error("Analisi non trovata o errore del server.");
        
        const analisi = await response.json();

        // Dobbiamo recuperare il nome del cliente separatamente
        const clientResponse = await fetch(`/api/clienti/${analisi.cliente_id}`);
        const clientData = await clientResponse.json();
        const cliente = clientData.client;
        document.getElementById('nome-cliente-titolo').textContent = `per ${cliente.nome} ${cliente.cognome}`;

        // Popoliamo l'header
        const dataAnalisi = new Date(analisi.data_analisi);
        document.getElementById('data-analisi').textContent = dataAnalisi.toLocaleDateString('it-IT');
        
        // --- LOGICA CORRETTA PER DATA NASCITA ED ETÀ ---
        if (analisi.data_nascita) {
            const nascita = new Date(analisi.data_nascita);
            document.getElementById('data-nascita').textContent = nascita.toLocaleDateString('it-IT');

            // Calcoliamo l'età che il cliente aveva al momento dell'analisi
            let eta = dataAnalisi.getFullYear() - nascita.getFullYear();
            const m = dataAnalisi.getMonth() - nascita.getMonth();
            if (m < 0 || (m === 0 && dataAnalisi.getDate() < nascita.getDate())) {
                eta--;
            }
            document.getElementById('eta-analisi').textContent = `${eta} anni`;
        } else {
             document.getElementById('data-nascita').textContent = 'N/D';
             document.getElementById('eta-analisi').textContent = 'N/D';
        }
        // --- FINE LOGICA CORRETTA ---
        
        // Popoliamo tutti gli altri campi (codice esistente)
        document.getElementById('esigenza-cliente').textContent = analisi.esigenza_cliente || 'N/D';
        document.getElementById('patologie-dichiarate').textContent = analisi.patologie_dichiarate || 'N/D';
        document.getElementById('frequenza-lavaggi').textContent = analisi.frequenza_lavaggi || 'N/D';
        document.getElementById('presenza-prurito').textContent = analisi.presenza_prurito || 'N/D';
        document.getElementById('tappo-cheratosico').textContent = analisi.tappo_cheratosico ? 'Sì' : 'No';
        document.getElementById('stato-cute').textContent = analisi.stato_cute || 'N/D';
        document.getElementById('stato-capello').textContent = analisi.stato_capello || 'N/D';
        document.getElementById('tipologia-effluvio').textContent = analisi.tipologia_effluvio || 'N/D';
        document.getElementById('tipologia-alopecia').textContent = analisi.tipologia_alopecia || 'N/D';
        document.getElementById('estensione-alopecia').textContent = analisi.estensione_alopecia || 'N/D';
        document.getElementById('diagnosi-primaria').textContent = analisi.diagnosi_primaria || 'N/D';
        document.getElementById('diagnosi-riepilogo').textContent = analisi.diagnosi_riepilogo || 'N/D';
        document.getElementById('piano-trattamenti').textContent = analisi.piano_trattamenti || 'N/D';
        document.getElementById('piano-prodotti').textContent = analisi.piano_prodotti || 'N/D';

        document.getElementById('torna-a-scheda-cliente').href = `/scheda-cliente.html?id=${analisi.cliente_id}`;
		// Impostiamo il link del pulsante "Modifica"
		modificaAnalisiBtn.href = `/modifica-analisi.html?analisiId=${analisiId}`;

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
	
	// Logica per il pulsante di stampa
stampaBtn.addEventListener('click', () => {
    window.print(); // Questo comando magico apre la finestra di dialogo di stampa del browser
});
	
});