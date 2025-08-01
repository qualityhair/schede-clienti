// ===================================================================
// == FILE /public/js/nuova-analisi-app.js - VERSIONE CORRETTA E COMPLETA ==
// ===================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // --- 1. RIFERIMENTI AGLI ELEMENTI DEL DOM ---
    const nomeClienteTitolo = document.getElementById('nome-cliente-titolo');
    const dataAnalisiSpan = document.getElementById('data-analisi-span');
    const dataNascitaInput = document.getElementById('data-nascita-input');
    const etaCalcolataSpan = document.getElementById('eta-calcolata-span');
    const formAnalisi = document.getElementById('form-analisi-tricologica');
    const annullaBtn = document.getElementById('annulla-btn');
    const tipologiaAlopeciaSelect = document.getElementById('tipologia-alopecia');
    const gruppoEstensione = document.getElementById('gruppo-estensione-alopecia');

    // --- 2. RECUPERO ID CLIENTE E CARICAMENTO DATI INIZIALI ---
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('clienteId');
    
    if (!clienteId) {
        alert("ID Cliente non trovato. Si prega di accedere a questa pagina dalla scheda di un cliente.");
        window.location.href = '/dashboard.html';
        return;
    }

    // Funzione di utilità per calcolare l'età
    function calcolaEta(dataNascita) {
        if (!dataNascita) return 'N/D';
        const oggi = new Date();
        const nascita = new Date(dataNascita);
        let eta = oggi.getFullYear() - nascita.getFullYear();
        const m = oggi.getMonth() - nascita.getMonth();
        if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
            eta--;
        }
        return `${eta} anni`;
    }

    // Funzione per popolare i dati iniziali del cliente (nome, data di nascita, ecc.)
    async function popolaDatiIniziali() {
        try {
            const response = await fetch(`/api/clienti/${clienteId}`);
            if (!response.ok) throw new Error("Cliente non trovato.");
            
            const data = await response.json();
            const cliente = data.client;

            nomeClienteTitolo.textContent = `per ${cliente.nome} ${cliente.cognome}`;
            dataAnalisiSpan.textContent = new Date().toLocaleDateString('it-IT');
            
            if (cliente.data_nascita) {
                dataNascitaInput.value = new Date(cliente.data_nascita).toISOString().split('T')[0];
                etaCalcolataSpan.textContent = calcolaEta(cliente.data_nascita);
            } else {
                dataNascitaInput.value = '';
                etaCalcolataSpan.textContent = 'Da inserire';
            }
        } catch (error) {
            console.error(error);
            alert("Impossibile caricare i dati del cliente.");
        }
    }
    
    // Aggiungiamo un listener per calcolare l'età in tempo reale
    dataNascitaInput.addEventListener('change', () => {
        etaCalcolataSpan.textContent = calcolaEta(dataNascitaInput.value);
    });

    // --- 3. POPOLAMENTO DEI MENU A TENDINA ---
    
    function popolaSelect(selectElement, opzioni) {
        opzioni.forEach(opt => {
            selectElement.add(new Option(opt, opt === "Seleziona..." ? "" : opt));
        });
    }

    const opzioniStatoCute = ["Seleziona...", "Eudermica", "Desquamazione", "Ortocheratosi", "Ipercheratosi", "Paracheratosi", "Discheratosi", "Pityriasis Simplex", "Pityriasis Steatoides", "Follicolite", "Seborrea", "Iperidrosi", "Bromidrosi", "Altro"];
    const opzioniStatoCapello = ["Seleziona...", "Sano", "Unto", "Secco", "Trattato Chimicamente", "Tricoptilosi", "Triconodosi", "Altro"];
    const opzioniEffluvio = ["Seleziona...", "Nessuno", "Sindrome da Stress", "Shock Chirurgico", "Malattia Febbrile", "Stress Emotivo", "Trattamenti Farmacologici", "Post-Partum", "Post-Menopausale", "Altro"];
    const opzioniAlopecia = ["Seleziona...", "Nessuna", "Areata", "Androgenetica", "Cicatriziale", "Universale", "Altro"];
    const opzioniDiagnosi = ["Seleziona...", "Stato Fisiologico / Nessuna Patologia Rilevata", "Anomalie del Cuoio Capelluto", "Anomalie della Secrezione Sebacea", "Anomalie della Cheratinizzazione (Forfora)", "Anomalie del Fusto (Danneggiamento Capello)", "Forme di Caduta non Cicatriziale ", "Forme di Caduta Cicatriziale", "Altro (da specificare nel riepilogo)"];

    popolaSelect(document.getElementById('stato-cute'), opzioniStatoCute);
    popolaSelect(document.getElementById('stato-capello'), opzioniStatoCapello);
    popolaSelect(document.getElementById('tipologia-effluvio'), opzioniEffluvio);
    popolaSelect(tipologiaAlopeciaSelect, opzioniAlopecia);
    popolaSelect(document.getElementById('diagnosi-primaria'), opzioniDiagnosi);
    
    tipologiaAlopeciaSelect.addEventListener('change', () => {
        const valoreSelezionato = tipologiaAlopeciaSelect.value;
        if (valoreSelezionato && valoreSelezionato !== 'Nessuna') {
            gruppoEstensione.style.display = 'block';
        } else {
            gruppoEstensione.style.display = 'none';
        }
    });

    // --- 4. GESTIONE DEI PULSANTI E DEL SALVATAGGIO ---
    
    annullaBtn.addEventListener('click', () => {
        if (confirm("Sei sicuro di voler annullare? I dati non salvati andranno persi.")) {
            window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        }
    });

    formAnalisi.addEventListener('submit', async (event) => {
        event.preventDefault();
        const salvaBtn = document.getElementById('salva-analisi-btn');
        salvaBtn.disabled = true;
        salvaBtn.textContent = 'Salvataggio in corso...';

        const datiAnalisi = {
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
            const response = await fetch('/api/analisi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datiAnalisi)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Si è verificato un errore sconosciuto.');
            }

            alert("Analisi salvata con successo!");
            window.location.href = `/scheda-cliente.html?id=${clienteId}`;

        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            alert(`Errore: ${error.message}`);
            salvaBtn.disabled = false;
            salvaBtn.textContent = 'Salva Analisi';
        }
    });

    // --- 5. CHIAMATA INIZIALE PER POPOLARE I DATI ---
    await popolaDatiIniziali();

}); // <-- QUESTA PARENTESI MANCAVA E CAUSAVA L'ERRORE
