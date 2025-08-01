// ===================================================================
// == FILE /public/js/modifica-analisi-app.js - VERSIONE COMPLETA  ==
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. RIFERIMENTI E RECUPERO ID ---
    const urlParams = new URLSearchParams(window.location.search);
    const analisiId = urlParams.get('analisiId');
    let clienteId = null; // Lo recupereremo insieme ai dati dell'analisi

    // Riferimenti a tutti gli elementi del DOM
    const nomeClienteTitolo = document.getElementById('nome-cliente-titolo');
    const dataAnalisiSpan = document.getElementById('data-analisi-span');
    const dataNascitaInput = document.getElementById('data-nascita-input');
    const etaCalcolataSpan = document.getElementById('eta-calcolata-span');
    const formAnalisi = document.getElementById('form-analisi-tricologica');
    const annullaBtn = document.getElementById('annulla-btn');
    const tipologiaAlopeciaSelect = document.getElementById('tipologia-alopecia');
    const gruppoEstensione = document.getElementById('gruppo-estensione-alopecia');

    if (!analisiId) {
        alert("ID Analisi non trovato. Impossibile modificare.");
        window.location.href = '/dashboard.html';
        return;
    }

    // --- 2. FUNZIONI DI UTILITÀ E POPOLAMENTO MENU ---

    function calcolaEta(dataNascita) {
        if (!dataNascita) return 'N/D';
        const oggi = new Date();
        const nascita = new Date(dataNascita);
        let eta = oggi.getFullYear() - nascita.getFullYear();
        const m = oggi.getMonth() - nascita.getMonth();
        if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) eta--;
        return `${eta} anni`;
    }

    function popolaSelect(selectElement, opzioni) {
        opzioni.forEach(opt => {
            selectElement.add(new Option(opt, opt === "Seleziona..." ? "" : opt));
        });
    }

    // Le tue opzioni per i menu a tendina
    const opzioniStatoCute = ["Seleziona...", "Eudermica", "Desquamazione", "Ortocheratosi", "Ipercheratosi", "Paracheratosi", "Discheratosi", "Pityriasis Simplex", "Pityriasis Steatoides", "Follicolite", "Seborrea", "Iperidrosi", "Bromidrosi", "Altro"];
    const opzioniStatoCapello = ["Seleziona...", "Sano", "Unto", "Secco", "Trattato Chimicamente", "Tricoptilosi", "Triconodosi", "Altro"];
    const opzioniEffluvio = ["Seleziona...", "Nessuno", "Sindrome da Stress", "Shock Chirurgico", "Malattia Febbrile", "Stress Emotivo", "Trattamenti Farmacologici", "Post-Partum", "Post-Menopausale", "Altro"];
    const opzioniAlopecia = ["Seleziona...", "Nessuna", "Areata", "Androgenetica", "Cicatriziale", "Universale", "Altro"];
    const opzioniDiagnosi = ["Seleziona...", "Stato Fisiologico / Nessuna Patologia Rilevata", "Anomalie del Cuoio Capelluto", "Anomalie della Secrezione Sebacea", "Anomalie della Cheratinizzazione (Forfora)", "Anomalie del Fusto (Danneggiamento Capello)", "Forme di Caduta Non Cicatriziale", "Forme di Caduta Cicatriziale", "Altro (da specificare nel riepilogo)"];

    popolaSelect(document.getElementById('stato-cute'), opzioniStatoCute);
    popolaSelect(document.getElementById('stato-capello'), opzioniStatoCapello);
    popolaSelect(document.getElementById('tipologia-effluvio'), opzioniEffluvio);
    popolaSelect(tipologiaAlopeciaSelect, opzioniAlopecia);
    popolaSelect(document.getElementById('diagnosi-primaria'), opzioniDiagnosi);
    
    // --- 3. CARICAMENTO DATI E PRE-COMPILAZIONE FORM ---
    async function caricaDatiAnalisi() {
        try {
            const response = await fetch(`/api/analisi/${analisiId}`);
            if (!response.ok) throw new Error("Dati dell'analisi non trovati.");
            const analisi = await response.json();
            
            clienteId = analisi.cliente_id;
            

            const clientResponse = await fetch(`/api/clienti/${clienteId}`);
            const clientData = await clientResponse.json();
            nomeClienteTitolo.textContent = `per ${clientData.client.nome} ${clientData.client.cognome}`;

            // Pre-compila l'header
            dataAnalisiSpan.textContent = new Date(analisi.data_analisi).toLocaleDateString('it-IT');
            if (analisi.data_nascita) {
                dataNascitaInput.value = new Date(analisi.data_nascita).toISOString().split('T')[0];
                etaCalcolataSpan.textContent = calcolaEta(analisi.data_nascita);
            }
            dataNascitaInput.addEventListener('change', () => { etaCalcolataSpan.textContent = calcolaEta(dataNascitaInput.value); });


            // Pre-compila tutti i campi del form
            document.getElementById('esigenza-cliente').value = analisi.esigenza_cliente || '';
            document.getElementById('patologie-dichiarate').value = analisi.patologie_dichiarate || '';
            document.getElementById('frequenza-lavaggi').value = analisi.frequenza_lavaggi || '';
            
            if(analisi.presenza_prurito) document.querySelector(`input[name="prurito"][value="${analisi.presenza_prurito}"]`).checked = true;
            if(analisi.tappo_cheratosico !== null) document.querySelector(`input[name="tappo-cheratosico"][value="${analisi.tappo_cheratosico}"]`).checked = true;

            document.getElementById('stato-cute').value = analisi.stato_cute || '';
            document.getElementById('stato-capello').value = analisi.stato_capello || '';
            document.getElementById('tipologia-effluvio').value = analisi.tipologia_effluvio || '';
            tipologiaAlopeciaSelect.value = analisi.tipologia_alopecia || '';
            
            // Attiva la visibilità del campo estensione se necessario
            if (analisi.tipologia_alopecia && analisi.tipologia_alopecia !== 'Nessuna') {
                gruppoEstensione.style.display = 'block';
                if(analisi.estensione_alopecia) document.querySelector(`input[name="estensione-alopecia"][value="${analisi.estensione_alopecia}"]`).checked = true;
            }

            document.getElementById('diagnosi-riepilogo').value = analisi.diagnosi_riepilogo || '';
            document.getElementById('diagnosi-primaria').value = analisi.diagnosi_primaria || '';
            document.getElementById('piano-trattamenti').value = analisi.piano_trattamenti || '';
            document.getElementById('piano-prodotti').value = analisi.piano_prodotti || '';

        } catch (error) {
            alert(`Errore nel caricamento dei dati: ${error.message}`);
            window.location.href = '/dashboard.html';
        }
    }

    tipologiaAlopeciaSelect.addEventListener('change', () => {
        if (tipologiaAlopeciaSelect.value && tipologiaAlopeciaSelect.value !== 'Nessuna') {
            gruppoEstensione.style.display = 'block';
        } else {
            gruppoEstensione.style.display = 'none';
        }
    });

	annullaBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Impedisce al link di partire subito
    if (confirm("Sei sicuro di voler annullare? Le modifiche non salvate andranno perse.")) {
        // Reindirizza solo se l'utente conferma
        window.location.href = `/scheda-cliente.html?id=${clienteId}`;
    }
});



    // --- 4. GESTIONE SALVATAGGIO MODIFICHE ---
    formAnalisi.addEventListener('submit', async (event) => {
        event.preventDefault();
        const salvaBtn = document.getElementById('salva-analisi-btn');
        salvaBtn.disabled = true;
        salvaBtn.textContent = 'Salvataggio in corso...';

        const datiAggiornati = {
            clienteId: clienteId,
            dataNascitaCliente: dataNascitaInput.value || null,
            esigenzaCliente: document.getElementById('esigenza-cliente').value.trim(),
            patologieDichiarate: document.getElementById('patologie-dichiarate').value.trim(),
            frequenzaLavaggi: document.getElementById('frequenza-lavaggi').value,
            presenzaPrurito: document.querySelector('input[name="prurito"]:checked')?.value || null,
            tappoCheratosico: document.querySelector('input[name="tappo-cheratosico"]:checked')?.value === 'true',
            statoCute: document.getElementById('stato-cute').value,
            statoCapello: document.getElementById('stato-capello').value,
            tipologiaEffluvio: document.getElementById('tipologia-effluvio').value,
            tipologiaAlopecia: tipologiaAlopeciaSelect.value,
            estensioneAlopecia: document.querySelector('input[name="estensione-alopecia"]:checked')?.value || null,
            diagnosiRiepilogo: document.getElementById('diagnosi-riepilogo').value.trim(),
            diagnosiPrimaria: document.getElementById('diagnosi-primaria').value,
            pianoTrattamenti: document.getElementById('piano-trattamenti').value.trim(),
            pianoProdotti: document.getElementById('piano-prodotti').value.trim()
        };

        try {
            const response = await fetch(`/api/analisi/${analisiId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datiAggiornati)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Errore durante il salvataggio.");
            }
            
            alert("Modifiche salvate con successo!");
            window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        } catch (error) {
            alert(`Errore: ${error.message}`);
            salvaBtn.disabled = false;
            salvaBtn.textContent = 'Salva Modifiche';
        }
    });
    
    // Avvia il caricamento dei dati all'apertura della pagina
    await caricaDatiAnalisi();

});