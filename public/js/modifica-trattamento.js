// ===============================================================
// == FILE /js/modifica-trattamento.js (CON INTEGRAZIONE PALETTE) ==
// ===============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // --- RIFERIMENTI DOM ---
    const formModifica = document.getElementById('form-modifica-trattamento');
    const dataInput = document.getElementById('data_trattamento_modifica');
    const descrizioneTextarea = document.getElementById('descrizione_modifica');
    const serviziContainer = document.getElementById('servizi-container-modifica');
    const aggiungiServizioBtn = document.getElementById('aggiungi-servizio-btn-modifica');
    const totaleSpan = document.getElementById('totale-trattamento-modifica');
    const pagatoCheckbox = document.getElementById('pagato_modifica');
    const noteTextarea = document.getElementById('note_modifica');
    const backToSchedaBtn = document.getElementById('backToSchedaBtn');

    // Riferimenti per la Palette (NUOVI)
    const apriPaletteBtn = document.getElementById('apri-palette-btn-modifica');
    const salvaInPaletteCheckbox = document.getElementById('salva-in-palette-checkbox-modifica');
    const selezionaFormulaModal = document.getElementById('selezionaFormulaModal');
    const listaFormuleSelezionabili = document.getElementById('lista-formule-selezionabili');
    
    // Variabili di stato
    let trattamentoId = null;
    let clienteId = null;
    
    const LISTA_SERVIZI_DISPONIBILI = [
        "Colore", "Tonalizzazione", "Schiariture", "Meches", "Maschera", 
        "Permanente", "Taglio", "Piega", "Barba", "Trattamento", "Altro"
    ];

    // --- FUNZIONI ---

    function showMessage(message, type = 'info') { alert(message); }

    function creaRigaServizio(servizio = null) {
        // ... (Questa funzione rimane identica a prima)
        const div = document.createElement('div');
        div.className = 'servizio-row-modal';
        let selectOptions = LISTA_SERVIZI_DISPONIBILI.map(s => `<option value="${s}" ${servizio && servizio.servizio === s ? 'selected' : ''}>${s}</option>`).join('');
        div.innerHTML = `
            <select class="select-field servizio-nome-modifica">${selectOptions}</select>
            <input type="number" class="input-field servizio-prezzo-modifica" value="${servizio && servizio.prezzo !== null ? parseFloat(servizio.prezzo).toFixed(2) : ''}" min="0" step="0.01" placeholder="Prezzo (€)" required>
            <button type="button" class="btn-remove-servizio" onclick="this.parentElement.remove(); calcolaTotale();">×</button>
        `;
        div.querySelector('input').addEventListener('input', calcolaTotale);
        serviziContainer.appendChild(div);
    }

    function calcolaTotale() {
        // ... (Questa funzione rimane identica a prima)
        let totale = 0;
        serviziContainer.querySelectorAll('.servizio-prezzo-modifica').forEach(input => {
            totale += parseFloat(input.value) || 0;
        });
        totaleSpan.textContent = `€ ${totale.toFixed(2)}`;
    }
    
    // --- CARICAMENTO INIZIALE ---
    const urlParams = new URLSearchParams(window.location.search);
    trattamentoId = urlParams.get('id');

    if (!trattamentoId) {
        return showMessage("ID Trattamento non trovato.", "error");
    }

    try {
        const response = await fetch(`/api/trattamenti/${trattamentoId}`);
        const trattamento = await response.json();
        
        clienteId = trattamento.cliente_id;
        backToSchedaBtn.onclick = () => window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        
        dataInput.value = trattamento.data_trattamento;
        descrizioneTextarea.value = trattamento.descrizione || '';
        noteTextarea.value = trattamento.note || '';
        pagatoCheckbox.checked = trattamento.pagato;

        serviziContainer.innerHTML = '';
        if (trattamento.servizi && trattamento.servizi.length > 0) {
            trattamento.servizi.forEach(servizio => creaRigaServizio(servizio));
        } else {
            creaRigaServizio({ servizio: trattamento.tipo_trattamento, prezzo: trattamento.prezzo });
        }
        calcolaTotale();

    } catch (error) {
        console.error("Errore caricamento trattamento:", error);
        showMessage("Impossibile caricare i dati del trattamento.", "error");
    }

    // --- EVENT LISTENERS ---
    
    aggiungiServizioBtn.addEventListener('click', () => creaRigaServizio());

    formModifica.addEventListener('submit', async (e) => {
        e.preventDefault();
        const servizi = [];
        serviziContainer.querySelectorAll('.servizio-row-modal').forEach(riga => {
            servizi.push({
                servizio: riga.querySelector('.servizio-nome-modifica').value,
                prezzo: parseFloat(riga.querySelector('.servizio-prezzo-modifica').value) || 0
            });
        });

        const datiAggiornati = {
            data_trattamento: dataInput.value,
            descrizione: descrizioneTextarea.value.trim(),
            servizi: servizi,
            pagato: pagatoCheckbox.checked,
            note: noteTextarea.value.trim()
        };

        try {
            const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datiAggiornati)
            });
            if (!response.ok) throw new Error("Errore durante l'aggiornamento.");
            
            // Logica di salvataggio in Palette (AGGIUNTA)
            if (salvaInPaletteCheckbox.checked && datiAggiornati.descrizione) {
                const nomeFormula = prompt("Dai un nome a questa formula per salvarla in palette:");
                if (nomeFormula) {
                    await fetch('/api/formule', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            cliente_id: clienteId,
                            nome_formula: nomeFormula,
                            testo_formula: datiAggiornati.descrizione
                        })
                    });
                }
            }

            showMessage("Trattamento aggiornato con successo!", "success");
            setTimeout(() => window.location.href = `/scheda-cliente.html?id=${clienteId}`, 1500);

        } catch (error) {
            console.error("Errore salvataggio:", error);
            showMessage("Errore durante il salvataggio delle modifiche.", "error");
        }
    });

    // Listener per aprire la Palette (NUOVO)
    apriPaletteBtn.addEventListener('click', async () => {
        listaFormuleSelezionabili.innerHTML = '<p class="loading-message">Caricamento...</p>';
        
        try {
            const response = await fetch(`/api/clienti/${clienteId}/formule`);
            const formule = await response.json();
            
            listaFormuleSelezionabili.innerHTML = '';
            if (!formule || formule.length === 0) {
                listaFormuleSelezionabili.innerHTML = '<p>Nessuna formula salvata in palette per questo cliente.</p>';
            } else {
                formule.forEach(formula => {
                    const cartellino = document.createElement('div');
                    cartellino.className = 'formula-cartellino clickable';
                    cartellino.innerHTML = `<h5>${formula.nome_formula}</h5><p>${formula.testo_formula}</p>`;
                    cartellino.onclick = () => {
                        descrizioneTextarea.value = formula.testo_formula;
                        selezionaFormulaModal.style.display = 'none';
                    };
                    listaFormuleSelezionabili.appendChild(cartellino);
                });
            }
            selezionaFormulaModal.style.display = 'block';
        } catch (error) {
            listaFormuleSelezionabili.innerHTML = '<p class="error-message">Impossibile caricare la palette.</p>';
        }
    });

    // Listener per chiudere la modale Palette (NUOVO)
    selezionaFormulaModal.querySelector('.close-btn').onclick = () => {
        selezionaFormulaModal.style.display = 'none';
    };
    window.addEventListener('click', (event) => {
        if (event.target == selezionaFormulaModal) {
            selezionaFormulaModal.style.display = 'none';
        }
    });
});