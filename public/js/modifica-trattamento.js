// Riferimenti al DOM della modale (dal tuo codice originale)
const customModal = document.getElementById('customModal');
const modalMessage = document.getElementById('modalMessage');
const modalButtons = document.getElementById('modalButtons');

function showCustomModal(message, type = 'alert', onConfirmCallback = null) {
    modalMessage.textContent = message;
    modalButtons.innerHTML = '';

    if (type === 'confirm') {
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = 'Conferma';
        confirmBtn.className = 'modal-button confirm';
        confirmBtn.onclick = () => {
            customModal.classList.remove('open');
            if (onConfirmCallback) onConfirmCallback(true);
        };
        modalButtons.appendChild(confirmBtn);

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Annulla';
        cancelBtn.className = 'modal-button cancel';
        cancelBtn.onclick = () => {
            customModal.classList.remove('open');
            if (onConfirmCallback) onConfirmCallback(false);
        };
        modalButtons.appendChild(cancelBtn);
    } else {
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.className = 'modal-button ok';
        okBtn.onclick = () => {
            customModal.classList.remove('open');
            if (onConfirmCallback) onConfirmCallback();
        };
        modalButtons.appendChild(okBtn);
    }
    customModal.classList.add('open');
}

function redirectTo(path) {
    window.location.href = path;
}

// --- Logica della Pagina Modifica Trattamento ---
const formModificaTrattamento = document.getElementById('form-modifica-trattamento');
const tipoTrattamentoSelect = document.getElementById('tipo_trattamento');
const descrizioneTextarea = document.getElementById('descrizione');
const dataTrattamentoInput = document.getElementById('data_trattamento');
const prezzoModificaTrattamentoInput = document.getElementById('prezzo_modifica_trattamento'); // AGGIUNTA
const noteTextarea = document.getElementById('note');
const pageTitle = document.getElementById('pageTitle');
const backToSchedaBtn = document.getElementById('backToSchedaBtn');

let trattamentoId = null;
let clienteId = null; // Sarà utile per tornare alla scheda cliente

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    trattamentoId = urlParams.get('id');

    if (trattamentoId) {
        await fetchTrattamentoDetails(trattamentoId);
    } else {
        showCustomModal('ID Trattamento mancante nell\'URL. Non è possibile modificare il trattamento.', 'error', () => {
            redirectTo('/lista-clienti.html'); // Reindirizza alla lista clienti se l'ID è mancante
        });
    }

    // Imposta l'onclick per il bottone Annulla/Torna
    if (backToSchedaBtn) {
        backToSchedaBtn.onclick = () => {
            // Se abbiamo l'ID del cliente, torniamo alla sua scheda, altrimenti alla lista
            if (clienteId) {
                redirectTo(`/scheda-cliente.html?id=${clienteId}`);
            } else {
                redirectTo('/lista-clienti.html');
            }
        };
    }
});

// Recupera i dettagli di un singolo trattamento per precompilare il form
// --- SOSTITUISCI QUESTA INTERA FUNZIONE ---
async function fetchTrattamentoDetails(id) {
    try {
        const response = await fetch(`/api/trattamenti/${id}`);

        if (response.status === 401) {
            showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => redirectTo('/'));
            return;
        }
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
        }
        
        const trattamento = await response.json();

        if (trattamento) {
            // ======================================================
            // 1. POPOLA TUTTI I CAMPI IMMEDIATAMENTE. Questa è la priorità.
            // ======================================================
            tipoTrattamentoSelect.value = trattamento.tipo_trattamento || '';
            descrizioneTextarea.value = trattamento.descrizione || '';
            dataTrattamentoInput.value = trattamento.data_trattamento || ''; // La data arriva già formattata
            prezzoModificaTrattamentoInput.value = trattamento.prezzo !== null ? parseFloat(trattamento.prezzo).toFixed(2) : '';
            noteTextarea.value = trattamento.note || '';

            // Memorizza l'ID del cliente
            clienteId = trattamento.cliente_id;
            
            // ======================================================
            // 2. ORA, come operazione secondaria, aggiorna il titolo.
            // Se fallisce, i campi del form saranno comunque popolati.
            // ======================================================
            if (clienteId) {
                backToSchedaBtn.textContent = `Annulla e Torna alla Scheda Cliente`; // Testo di default
                try {
                    const clientResponse = await fetch(`/api/clienti/${clienteId}`);
                    if (clientResponse.ok) {
                        const clientData = await clientResponse.json();
                        // json() su una risposta vuota lancia un errore, quindi dobbiamo gestire il caso in cui clientData.client non esista
                        if (clientData && clientData.client && clientData.client.nome) {
                            pageTitle.textContent = `Modifica Servizio di ${clientData.client.nome} ${clientData.client.cognome}`;
                            backToSchedaBtn.textContent = `Annulla e Torna alla scheda di ${clientData.client.nome} ${clientData.client.cognome}`;
                        } else {
                           pageTitle.textContent = `Modifica Servizio`;
                        }
                    } else {
                         pageTitle.textContent = `Modifica Servizio`;
                    }
                } catch (clientError) {
                    console.error("Errore nel recuperare il nome del cliente per il titolo:", clientError);
                    pageTitle.textContent = `Modifica Servizio`;
                }
            } else {
                pageTitle.textContent = `Modifica Servizio`;
                backToSchedaBtn.textContent = `Annulla e Torna alla Lista Clienti`;
            }

        } else {
            showCustomModal('Trattamento non trovato.', 'alert', () => redirectTo('/lista-clienti.html'));
        }
    } catch (error) {
        console.error('Errore nel recupero dettagli trattamento:', error);
        showCustomModal(`Errore nel caricamento dei dettagli del trattamento: ${error.message}`, 'error', () => redirectTo('/lista-clienti.html'));
    }
}

// Gestione submit del form per modificare trattamento
formModificaTrattamento.addEventListener('submit', async (event) => {
    event.preventDefault();

    const updatedTreatment = {
        tipo_trattamento: tipoTrattamentoSelect.value,
        descrizione: descrizioneTextarea.value,
        data_trattamento: dataTrattamentoInput.value,
        prezzo: parseFloat(prezzoModificaTrattamentoInput.value), // AGGIUNTA
        note: noteTextarea.value
    };
    // AGGIUNTA DELLA VALIDAZIONE DEL PREZZO
    if (isNaN(updatedTreatment.prezzo) || updatedTreatment.prezzo < 0) {
        showCustomModal('Il prezzo deve essere un numero valido e non negativo.', 'error');
        return; // Ferma l'esecuzione se il prezzo non è valido
    }
    if (!updatedTreatment.tipo_trattamento || !updatedTreatment.data_trattamento) {
        showCustomModal('Tipo Trattamento e Data Trattamento sono obbligatori.', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTreatment),
        });

        if (response.status === 401) {
            showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                redirectTo('/');
            });
            return;
        }

        if (!response.ok) {
            // Se la risposta non è OK, tenta di leggere un messaggio di errore dal corpo
            const errorData = await response.json().catch(() => ({ message: 'Errore sconosciuto.' }));
            showCustomModal(`Errore nell'aggiornamento del trattamento: ${errorData.message || 'Errore sconosciuto.'}`, 'error');
            return; // Interrompi l'esecuzione
        }

        // Se la risposta è OK, tenta di leggere un messaggio di successo
        const successData = await response.json().catch(() => ({ message: 'Trattamento aggiornato con successo!' }));
        showCustomModal(successData.message || 'Trattamento aggiornato con successo!', 'success', () => {
            if (clienteId) {
                redirectTo(`/scheda-cliente.html?id=${clienteId}`);
            } else {
                redirectTo('/lista-clienti.html');
            }
        });

    } catch (error) {
        console.error('Errore durante l\'aggiornamento del trattamento:', error);
        showCustomModal(`Errore di rete o server: ${error.message}`, 'error');
    }
});
