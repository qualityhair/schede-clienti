// Incolla questo intero blocco in /js/modifica-trattamento.js
    
const LISTA_SERVIZI_DISPONIBILI = [
    "Colore", "Tonalizzazione", "Schiariture", "Meches", "Maschera", 
    "Permanente", "Taglio", "Piega", "Barba", "Trattamento", "Altro"
];

// Riferimenti DOM
const pageTitle = document.getElementById('pageTitle');
const formModifica = document.getElementById('form-modifica-trattamento');
const dataInput = document.getElementById('data_trattamento_modifica');
const descrizioneTextarea = document.getElementById('descrizione_modifica'); // NUOVO
const serviziContainer = document.getElementById('servizi-container-modifica');
const aggiungiServizioBtn = document.getElementById('aggiungi-servizio-btn-modifica');
const totaleSpan = document.getElementById('totale-trattamento-modifica');
const pagatoCheckbox = document.getElementById('pagato_modifica');
const noteTextarea = document.getElementById('note_modifica');
const backToSchedaBtn = document.getElementById('backToSchedaBtn');

let trattamentoId = null;
let clienteId = null;

// Funzione di utilità (semplificata per questa pagina)
function showMessage(message, type = 'info') { alert(message); }

function creaRigaServizio(servizio = null) {
    const div = document.createElement('div');
    div.className = 'servizio-row-modal';
    
    let selectOptions = LISTA_SERVIZI_DISPONIBILI.map(s => 
        `<option value="${s}" ${servizio && servizio.servizio === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    div.innerHTML = `
        <select class="select-field servizio-nome-modifica">
            ${selectOptions}
        </select>
        <input type="number" class="input-field servizio-prezzo-modifica" value="${servizio && servizio.prezzo !== null ? parseFloat(servizio.prezzo).toFixed(2) : ''}" min="0" step="0.01" placeholder="Prezzo (€)" required>
        <button type="button" class="btn-remove-servizio" onclick="this.parentElement.remove(); calcolaTotale();">×</button>
    `;
    
    div.querySelector('input').addEventListener('input', calcolaTotale);
    serviziContainer.appendChild(div);
}

function calcolaTotale() {
    let totale = 0;
    serviziContainer.querySelectorAll('.servizio-prezzo-modifica').forEach(input => {
        totale += parseFloat(input.value) || 0;
    });
    totaleSpan.textContent = `€ ${totale.toFixed(2)}`;
}

aggiungiServizioBtn.addEventListener('click', () => creaRigaServizio());

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    trattamentoId = urlParams.get('id');

    if (!trattamentoId) {
        showMessage("ID Trattamento non trovato.", "error");
        return;
    }

    try {
        const response = await fetch(`/api/trattamenti/${trattamentoId}`);
        const trattamento = await response.json();
        
        clienteId = trattamento.cliente_id;
        backToSchedaBtn.onclick = () => window.location.href = `/scheda-cliente.html?id=${clienteId}`;
        
        // Popola tutti i campi, inclusa la nuova descrizione
        dataInput.value = trattamento.data_trattamento;
        descrizioneTextarea.value = trattamento.descrizione || ''; // NUOVO
        noteTextarea.value = trattamento.note || '';
        pagatoCheckbox.checked = trattamento.pagato;

        serviziContainer.innerHTML = '';
        if (trattamento.servizi && trattamento.servizi.length > 0) {
            trattamento.servizi.forEach(servizio => creaRigaServizio(servizio));
        } else {
            creaRigaServizio();
        }
        calcolaTotale();

    } catch (error) {
        console.error("Errore caricamento trattamento:", error);
        showMessage("Impossibile caricare i dati del trattamento.", "error");
    }
});

formModifica.addEventListener('submit', async (e) => {
    e.preventDefault();

    const servizi = [];
    const righe = serviziContainer.querySelectorAll('.servizio-row-modal');
    if (righe.length === 0) {
        return showMessage("Aggiungi almeno un servizio.", "error");
    }
    righe.forEach(riga => {
        servizi.push({
            servizio: riga.querySelector('.servizio-nome-modifica').value,
            prezzo: parseFloat(riga.querySelector('.servizio-prezzo-modifica').value)
        });
    });

    // Aggiunge la descrizione ai dati da inviare
    const datiAggiornati = {
        data_trattamento: dataInput.value,
        descrizione: descrizioneTextarea.value.trim(), // NUOVO
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
        if (!response.ok) throw new Error("Errore durante il salvataggio.");

        showMessage("Trattamento aggiornato con successo!", "success");
        setTimeout(() => window.location.href = `/scheda-cliente.html?id=${clienteId}`, 1500);

    } catch (error) {
        console.error("Errore salvataggio:", error);
        showMessage("Errore durante il salvataggio delle modifiche.", "error");
    }
});