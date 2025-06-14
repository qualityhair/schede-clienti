// /js/scheda-cliente.js - Ripristina ricerca e paginazione

document.addEventListener("DOMContentLoaded", async () => {
    // Riferimenti agli elementi DOM principali della pagina
    const nomeCompletoSpan = document.getElementById("nome-completo");
    const emailSpan = document.getElementById("email");
    const telefonoSpan = document.getElementById("telefono");
    const listaTrattamentiBody = document.getElementById("lista-trattamenti"); // Il tbody della tabella dei trattamenti
    const btnEliminaCliente = document.getElementById("btnEliminaCliente");

    // Elementi per la paginazione e ricerca (dalla tua scheda-cliente.html)
    const infoPaginazione = document.getElementById("info-paginazione");
    const btnPrecedente = document.getElementById("btnPrecedente");
    const btnSuccessivo = document.getElementById("btnSuccessivo");

    let clienteId = null; // ID del cliente attualmente visualizzato
    let searchTerm = null; // Termine di ricerca (se la pagina è stata aperta da una ricerca)
    let currentClientIndex = -1; // Indice del cliente corrente nella lista di ricerca
    let searchedClientIds = []; // Array degli ID dei clienti trovati con la ricerca

    // Funzione per ottenere i parametri dall'URL e impostare lo stato
    function getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        clienteId = params.get("id"); // ID del cliente corrente
        searchTerm = params.get("term"); // Termine di ricerca, se presente
        currentClientIndex = parseInt(params.get("idx"), 10); // Indice del cliente nella lista di ricerca
        if (isNaN(currentClientIndex)) currentClientIndex = -1; // Inizializza a -1 se non è un numero valido
    }

    getUrlParams(); // Carica i parametri all'avvio

    // Se l'ID cliente non è disponibile, mostra un errore e reindirizza
    if (!clienteId) {
        showCustomModal("ID cliente mancante nell'URL. Non è possibile caricare la scheda. Verrai reindirizzato alla lista clienti.", 'error', () => {
            redirectTo('/lista-clienti.html');
        });
        return; // Ferma l'esecuzione dello script
    }

    // --- Logica per la Ricerca e Paginazione ---
    async function handleSearchContext() {
        if (searchTerm) { // Se c'è un termine di ricerca, gestiamo il contesto di paginazione
            try {
                // Esegui la ricerca sul backend per ottenere tutti gli ID dei clienti corrispondenti
                const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
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
                const results = await response.json(); // Array di oggetti cliente
                searchedClientIds = results.map(client => client.id); // Estrai solo gli ID

                // Trova l'indice del cliente corrente nell'array dei risultati di ricerca
                // Questo è cruciale se la pagina è stata caricata direttamente con un ID ma in un contesto di ricerca
                if (currentClientIndex === -1 || searchedClientIds[currentClientIndex] !== parseInt(clienteId, 10)) {
                    currentClientIndex = searchedClientIds.indexOf(parseInt(clienteId, 10));
                }

                updatePaginationButtons(); // Aggiorna lo stato dei bottoni
                updatePaginationInfo(); // Aggiorna il testo di paginazione

            } catch (error) {
                console.error("Errore durante la ricerca per la paginazione:", error);
                showCustomModal(`Errore nel caricamento dei risultati di ricerca: ${error.message}`, 'error');
                // In caso di errore, nascondi i bottoni di paginazione per evitare confusione
                btnPrecedente.style.display = 'none';
                btnSuccessivo.style.display = 'none';
                infoPaginazione.textContent = '';
            }
        } else {
            // Se non c'è un termine di ricerca, nascondi i bottoni di paginazione
            btnPrecedente.style.display = 'none';
            btnSuccessivo.style.display = 'none';
            infoPaginazione.textContent = '';
        }
    }

    // Aggiorna lo stato (abilitato/disabilitato) dei bottoni di navigazione
    function updatePaginationButtons() {
        if (searchTerm && searchedClientIds.length > 0) {
            btnPrecedente.style.display = 'inline-block'; // Mostra i bottoni
            btnSuccessivo.style.display = 'inline-block';
            btnPrecedente.disabled = currentClientIndex <= 0; // Disabilita 'Indietro' se siamo al primo
            btnSuccessivo.disabled = currentClientIndex >= searchedClientIds.length - 1; // Disabilita 'Avanti' se siamo all'ultimo
        } else {
            btnPrecedente.style.display = 'none'; // Nascondi i bottoni se non c'è contesto di ricerca
            btnSuccessivo.style.display = 'none';
        }
    }

    // Aggiorna il testo che mostra l'informazione di paginazione (es. "Cliente 1 di 5")
    function updatePaginationInfo() {
        if (searchTerm && searchedClientIds.length > 0 && currentClientIndex !== -1) {
            infoPaginazione.textContent = `Cliente ${currentClientIndex + 1} di ${searchedClientIds.length} (ricerca per "${searchTerm}")`;
        } else {
            infoPaginazione.textContent = ''; // Pulisci il testo se non c'è contesto di ricerca
        }
    }

    // Aggiungi event listener ai bottoni di paginazione
    btnPrecedente.addEventListener('click', () => navigateClient(-1));
    btnSuccessivo.addEventListener('click', () => navigateClient(1));

    // Funzione per navigare al cliente precedente/successivo nella lista di ricerca
    function navigateClient(direction) {
        const newIndex = currentClientIndex + direction;
        if (newIndex >= 0 && newIndex < searchedClientIds.length) {
            const newClientId = searchedClientIds[newIndex];
            // Reindirizza alla stessa pagina con il nuovo ID del cliente e il contesto di ricerca
            redirectTo(`/scheda-cliente.html?id=${newClientId}&term=${encodeURIComponent(searchTerm)}&idx=${newIndex}`);
        }
    }

    // --- Funzioni di Recupero Dati dal Backend ---

    // Recupera i dettagli del cliente specifico
    async function fetchClientDetails(id) {
        try {
            const response = await fetch(`/api/clienti/${id}`);
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
            const cliente = await response.json();
            if (cliente) {
                nomeCompletoSpan.textContent = `${cliente.nome} ${cliente.cognome}`;
                emailSpan.textContent = cliente.email || 'N/A';
                telefonoSpan.textContent = cliente.telefono || 'N/A';
            } else {
                showCustomModal('Dettagli cliente non trovati per l\'ID specificato.', 'alert', () => {
                    redirectTo('/lista-clienti.html');
                });
            }
        } catch (error) {
            console.error('Errore nel recupero dettagli cliente:', error);
            showCustomModal(`Errore nel caricamento dettagli cliente: ${error.message}`, 'error', () => {
                redirectTo('/lista-clienti.html');
            });
        }
    }

    // Recupera tutti i trattamenti associati a questo cliente
    async function fetchClientTreatments(id) {
        try {
            // Assumiamo che il backend ordini i trattamenti per data
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
        listaTrattamentiBody.innerHTML = ''; // Pulisci il corpo della tabella

        if (trattamenti.length === 0) {
            listaTrattamentiBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-500">Nessun trattamento registrato per questo cliente.</td></tr>';
            return;
        }

        trattamenti.forEach(trattamento => {
            const tr = document.createElement('tr'); // Crea un nuovo elemento riga della tabella (tr)
            // Popola l'HTML interno della riga con i dati del trattamento e i bottoni di azione
            tr.innerHTML = `
                <td>${trattamento.tipo_trattamento || ''}</td>
                <td>${trattamento.descrizione || ''}</td>
                <td>${new Date(trattamento.data_trattamento).toLocaleDateString('it-IT') || ''}</td>
                <td>${trattamento.note || ''}</td>
                <td class="action-button-group">
                    <button onclick="modificaTrattamento(${trattamento.id})" class="edit-treatment-button">Modifica</button>
                    <button onclick="eliminaTrattamento(${trattamento.id})" class="delete-treatment-button">Elimina</button>
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
                                // Dopo aver eliminato il cliente, torna alla lista principale dei clienti
                                redirectTo('/lista-clienti.html');
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

    // Gestisci il contesto di ricerca e paginazione se la pagina è stata aperta da una ricerca
    await handleSearchContext();
});

// Nota: Le funzioni globali showCustomModal, redirectTo, e modificaTrattamento
// DEVONO essere definite nel blocco <script> in linea di scheda-cliente.html
// PRIMA che scheda-cliente.js venga caricato, per garantire che siano accessibili.
