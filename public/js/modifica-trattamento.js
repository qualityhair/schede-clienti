document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const trattamentoId = params.get("id"); // *** CORRETTO: Ora cerca 'id' invece di 'idTrattamento' ***

    // Riferimenti agli elementi del form (assicurati che esistano nell'HTML)
    const form = document.getElementById("form-modifica-trattamento");
    const tipoTrattamentoSelect = document.getElementById("tipo_trattamento"); // È un <select>
    const descrizioneTextarea = document.getElementById("descrizione"); // È una <textarea>
    const dataTrattamentoInput = document.getElementById("data_trattamento");
    const noteTextarea = document.getElementById("note"); // È una <textarea>
    const pageTitle = document.getElementById('pageTitle'); // Titolo della pagina
    const backToSchedaBtn = document.getElementById('backToSchedaBtn'); // Bottone "Annulla e Torna"

    let clienteId = null; // Memorizzeremo l'ID del cliente una volta recuperato il trattamento

    if (!trattamentoId) {
        // Usa la modale personalizzata invece di alert()
        showCustomModal("ID trattamento mancante nell'URL. Non è possibile modificare il trattamento. Verrai reindirizzato alla lista clienti.", 'error', () => {
            redirectTo("/lista-clienti.html"); // Torna alla lista clienti
        });
        return;
    }

    // Carica i dati del trattamento esistente per pre-popolare il form
    async function fetchTrattamentoDetails(id) {
        try {
            const response = await fetch(`/api/trattamenti/${id}`);
            
            if (response.status === 401) {
                showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                    redirectTo('/');
                });
                return null; // Ritorna null per indicare fallimento
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
            }
            const trattamento = await response.json();
            if (trattamento) {
                // Precompila il form
                tipoTrattamentoSelect.value = trattamento.tipo_trattamento || '';
                descrizioneTextarea.value = trattamento.descrizione || '';
                dataTrattamentoInput.value = trattamento.data_trattamento ? new Date(trattamento.data_trattamento).toISOString().split('T')[0] : '';
                noteTextarea.value = trattamento.note || '';

                // Memorizza l'ID del cliente per il reindirizzamento
                clienteId = trattamento.cliente_id;
                pageTitle.textContent = `Modifica Trattamento per ${trattamento.tipo_trattamento}`; // Aggiorna il titolo della pagina
                
                // Aggiorna anche il testo del bottone "Annulla e Torna"
                if (clienteId && backToSchedaBtn) {
                    const clientResponse = await fetch(`/api/clienti/${clienteId}`);
                    if (clientResponse.ok) {
                        const clientData = await clientResponse.json();
                        if (clientData && clientData.nome && clientData.cognome) {
                            backToSchedaBtn.textContent = `Annulla e Torna alla scheda di ${clientData.nome} ${clientData.cognome}`;
                            // Imposta l'onclick per il bottone Annulla/Torna
                            backToSchedaBtn.onclick = () => {
                                redirectTo(`/scheda-cliente.html?id=${clienteId}`);
                            };
                        } else {
                            backToSchedaBtn.textContent = 'Annulla e Torna alla Scheda Cliente';
                            backToSchedaBtn.onclick = () => redirectTo('/lista-clienti.html'); // Fallback
                        }
                    } else {
                        backToSchedaBtn.textContent = 'Annulla e Torna alla Scheda Cliente';
                        backToSchedaBtn.onclick = () => redirectTo('/lista-clienti.html'); // Fallback
                    }
                } else if (backToSchedaBtn) {
                    backToSchedaBtn.textContent = 'Annulla e Torna alla Lista Clienti';
                    backToSchedaBtn.onclick = () => redirectTo('/lista-clienti.html'); // Fallback se ID cliente non disponibile
                }
                
            } else {
                showCustomModal('Trattamento non trovato.', 'alert', () => {
                    redirectTo('/lista-clienti.html');
                });
            }
        } catch (error) {
            console.error('Errore nel caricamento del trattamento:', error);
            showCustomModal(`Errore nel caricamento del trattamento da modificare: ${error.message}`, 'error', () => {
                redirectTo('/lista-clienti.html'); // Torna alla lista se errore grave
            });
        }
    }

    // Chiamata alla funzione di caricamento dettagli all'avvio
    fetchTrattamentoDetails(trattamentoId);

    // Gestisce l'invio del form per aggiornare il trattamento
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const datiAggiornati = {
                tipo_trattamento: tipoTrattamentoSelect.value,
                descrizione: descrizioneTextarea.value,
                data_trattamento: dataTrattamentoInput.value,
                note: noteTextarea.value,
            };

            // Aggiungi validazione minima prima di inviare
            if (!datiAggiornati.tipo_trattamento || !datiAggiornati.data_trattamento) {
                showCustomModal("Tipo Trattamento e Data Trattamento sono obbligatori.", 'error');
                return;
            }

            try {
                const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                    method: "PUT", // Metodo HTTP per l'aggiornamento
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(datiAggiornati)
                });

                if (response.status === 401) {
                    showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                        redirectTo('/');
                    });
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json(); // Assumiamo che il backend invii un JSON di errore
                    throw new Error(errorData.message || "Errore durante l'aggiornamento del trattamento.");
                }

                const successData = await response.json(); // Assumiamo che il backend invii un JSON di successo
                showCustomModal(successData.message || "Trattamento aggiornato con successo!", 'success', () => {
                    // Reindirizza alla scheda cliente dopo un aggiornamento riuscito
                    if (clienteId) { // Assicurati che clienteId sia stato recuperato
                        redirectTo(`/scheda-cliente.html?id=${clienteId}`);
                    } else {
                        redirectTo('/lista-clienti.html'); // Fallback
                    }
                });

            } catch (err) {
                console.error("Errore durante l'aggiornamento del trattamento:", err);
                showCustomModal(err.message || "Errore durante l'aggiornamento del trattamento.", 'error');
            }
        });
    }
    // Nota: Le funzioni showCustomModal e redirectTo DEVONO essere definite
    // nella pagina HTML (modifica-trattamento.html) prima che questo script venga eseguito.
});
