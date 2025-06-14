// scheda-cliente.js

document.addEventListener("DOMContentLoaded", async () => {
    // Riferimenti agli elementi DOM principali della pagina
    const nomeCompletoSpan = document.getElementById("nome-completo");
    const emailSpan = document.getElementById("email");
    const telefonoSpan = document.getElementById("telefono");
    const listaTrattamentiBody = document.getElementById("lista-trattamenti"); // Il tbody della tabella dei trattamenti
    const btnEliminaCliente = document.getElementById("btnEliminaCliente");

    let clienteId = null; // Variabile per memorizzare l'ID del cliente corrente

    // Funzione per ottenere l'ID cliente dall'URL
    function getIdCliente() {
        const params = new URLSearchParams(window.location.search);
        // La pagina scheda-cliente.html passa l'ID come 'id'
        return params.get("id"); 
    }

    clienteId = getIdCliente();

    // Se l'ID cliente non è disponibile, mostra un errore e reindirizza
    if (!clienteId) {
        showCustomModal("ID cliente mancante nell'URL. Non è possibile caricare la scheda. Verrai reindirizzato alla lista clienti.", 'error', () => {
            redirectTo('/lista-clienti.html');
        });
        return; // Ferma l'esecuzione dello script
    }

    // --- Funzioni di Recupero Dati dal Backend ---

    // Recupera i dettagli del cliente specifico
    async function fetchClientDetails(id) {
        try {
            const response = await fetch(`/api/clienti/${id}`);
            if (response.status === 401) {
                // Gestione sessione scaduta/non autorizzato
                showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                    redirectTo('/'); // Reindirizza alla pagina di login
                });
                return; // Ferma l'esecuzione
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
            }
            const cliente = await response.json();
            if (cliente) {
                nomeCompletoSpan.textContent = `${cliente.nome} ${cliente.cognome}`;
                emailSpan.textContent = cliente.email || 'N/A';
                telefonoSpan.textContent = cliente.telefono || 'N/A';
            } else {
                showCustomModal('Dettagli cliente non trovati per l\'ID specificato.', 'alert', () => {
                    redirectTo('/lista-clienti.html'); // Torna alla lista se cliente non trovato
                });
            }
        } catch (error) {
            console.error('Errore nel recupero dettagli cliente:', error);
            showCustomModal(`Errore nel caricamento dettagli cliente: ${error.message}`, 'error', () => {
                redirectTo('/lista-clienti.html'); // In caso di errore grave
            });
        }
    }

    // Recupera tutti i trattamenti associati a questo cliente
    async function fetchClientTreatments(id) {
        try {
            const response = await fetch(`/api/clienti/${id}/trattamenti`);
            if (response.status === 401) {
                showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                    redirectTo('/');
                });
                return;
            }
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
            }
            const trattamenti = await response.json();
            renderTrattamenti(trattamenti); // Passa i trattamenti alla funzione di rendering
        } catch (error) {
            console.error('Errore nel recupero trattamenti:', error);
            showCustomModal(`Errore nel caricamento trattamenti: ${error.message}`, 'error');
        }
    }

    // --- Funzione per il Rendering dei Dati ---

    // Renderizza i trattamenti nella tabella HTML
    function renderTrattamenti(trattamenti) {
        listaTrattamentiBody.innerHTML = ''; // Pulisci il corpo della tabella prima di aggiungere nuove righe

        if (trattamenti.length === 0) {
            listaTrattamentiBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Nessun trattamento registrato per questo cliente.</td></tr>';
            return;
        }

        trattamenti.forEach(trattamento => {
            const tr = document.createElement('tr'); // Crea un nuovo elemento riga della tabella (tr)
            // Popola l'HTML interno della riga con i dati del trattamento
            tr.innerHTML = `
                <td>${trattamento.tipo_trattamento || ''}</td>
                <td>${trattamento.descrizione || ''}</td>
                <td>${new Date(trattamento.data_trattamento).toLocaleDateString('it-IT') || ''}</td>
                <td>${trattamento.note || ''}</td>
                <td class="action-button-group">
                    <button onclick="modificaTrattamento(${trattamento.id})" class="edit-treatment-button">✏️ Modifica</button>
                    <button onclick="eliminaTrattamento(${trattamento.id})" class="delete-treatment-button">🗑️ Elimina</button>
                </td>
            `;
            listaTrattamentiBody.appendChild(tr); // Aggiungi la riga al corpo della tabella
        });
    }

    // --- Funzioni per le Azioni (Elimina Trattamento, Elimina Cliente) ---

    // Funzione per eliminare un trattamento specifico
    // Nota: questa funzione è globale e viene chiamata direttamente dall'onclick nel HTML
    async function eliminaTrattamento(trattamentoId) {
        showCustomModal('Sei sicuro di voler eliminare questo trattamento?', 'confirm', async (confirmed) => {
            if (confirmed) {
                try {
                    const response = await fetch(`/api/trattamenti/${trattamentoId}`, {
                        method: 'DELETE'
                    });

                    if (response.status === 401) {
                        showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                            redirectTo('/');
                        });
                        return;
                    }

                    if (response.ok) {
                        showCustomModal('Trattamento eliminato con successo!', 'success', () => {
                            fetchClientTreatments(clienteId); // Ricarica la lista dei trattamenti dopo l'eliminazione
                        });
                    } else {
                        const errorData = await response.json();
                        showCustomModal(`Errore durante l'eliminazione del trattamento: ${errorData.message || 'Errore sconosciuto.'}`, 'error');
                    }
                } catch (error) {
                    console.error('Errore durante l\'eliminazione del trattamento:', error);
                    showCustomModal(`Errore di rete o server: ${error.message}`, 'error');
                }
            }
        });
    }

    // Event listener per il bottone 'Elimina Cliente'
    if (btnEliminaCliente) {
        btnEliminaCliente.addEventListener('click', () => {
            showCustomModal('Sei sicuro di voler eliminare questo cliente e TUTTI i suoi trattamenti?', 'confirm', async (confirmed) => {
                if (confirmed) {
                    try {
                        const response = await fetch(`/api/clienti/${clienteId}`, {
                            method: 'DELETE'
                        });

                        if (response.status === 401) {
                            showCustomModal('Sessione scaduta o non autorizzato. Effettua nuovamente il login.', 'alert', () => {
                                redirectTo('/');
                            });
                            return;
                        }

                        if (response.ok) {
                            showCustomModal('Cliente eliminato con successo!', 'success', () => {
                                redirectTo('/lista-clienti.html'); // Torna alla lista clienti dopo l'eliminazione
                            });
                        } else {
                            const errorData = await response.json();
                            showCustomModal(`Errore durante l'eliminazione del cliente: ${errorData.message || 'Errore sconosciuto.'}`, 'error');
                        }
                    } catch (error) {
                        console.error('Errore durante l\'eliminazione del cliente:', error);
                        showCustomModal(`Errore di rete o server: ${error.message}`, 'error');
                    }
                }
            });
        });
    }

    // --- Esecuzione iniziale al caricamento della pagina ---
    // Carica i dettagli del cliente e i suoi trattamenti all'avvio della pagina
    await fetchClientDetails(clienteId);
    await fetchClientTreatments(clienteId);
});

// Le funzioni globali showCustomModal, redirectTo, e modificaTrattamento
// devono essere definite nel blocco <script> in linea di scheda-cliente.html
// PRIMA che scheda-cliente.js venga caricato.
// Ad esempio:
// <script>
//   function showCustomModal(...) { ... }
//   function redirectTo(...) { ... }
//   function modificaTrattamento(trattamentoId) { redirectTo(`/modifica-trattamento.html?id=${trattamentoId}`); }
// </script>
// <script src="/js/scheda-cliente.js"></script>