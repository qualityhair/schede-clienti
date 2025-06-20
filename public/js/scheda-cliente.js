// --- Inizializzazione e recupero ID cliente ---
const urlParams = new URLSearchParams(window.location.search);
const clienteId = urlParams.get("id"); // ID del cliente da caricare immediatamente

// Variabili per la gestione della paginazione dei risultati di ricerca
let searchResultsIds = []; // Conterrà gli ID di tutti i clienti trovati nella ricerca
let currentIndex = -1;    // Indice del cliente attualmente visualizzato nell'array searchResultsIds

// Riferimenti agli elementi DOM per la paginazione (NUOVO/AGGIORNATO)
const paginationControls = document.getElementById('navigazione-clienti'); // Il tuo div di navigazione
const prevClientButton = document.getElementById('btnPrecedente');
const nextClientButton = document.getElementById('btnSuccessivo');
const paginationInfo = document.getElementById('info-paginazione');

// --- Funzione per mostrare un messaggio temporaneo ---
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.color = '#1a1a1a';

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda';
        messageDiv.style.borderColor = '#28a745';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.borderColor = '#dc3545';
    } else {
        messageDiv.style.backgroundColor = '#fff3cd';
        messageDiv.style.borderColor = '#ffc107';
    }
    messageDiv.style.border = '1px solid';
    messageDiv.style.textAlign = 'center';

    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.minWidth = '280px';
    messageDiv.style.maxWidth = '90%';
    messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';

    document.body.insertBefore(messageDiv, document.body.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// --- Gestione generica delle risposte API ---
async function handleApiResponse(response) {
    const contentType = response.headers.get("content-type");

    if (response.status === 401) {
        showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error');
        setTimeout(() => {
            window.location.href = '/'; // Reindirizza alla pagina di login dopo un breve ritardo
        }, 1500);
        return null;
    } else if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error');
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
        return null;
    }
}

// *** BLOCCO AGGIUNTO/MODIFICATO PER GESTIRE L'ASSENZA DI UN ID CLIENTE E LA PAGINAZIONE ***
async function initializeClientData() {
    if (!clienteId) {
        showMessage("Nessun ID cliente specificato. Verrai reindirizzato alla Dashboard.", 'info');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
        return; // Interrompe l'esecuzione
    }

    const rawSearchResults = urlParams.get('search_results');
    const rawCurrentIndex = urlParams.get('current_index');

    if (rawSearchResults && rawCurrentIndex !== null) {
        try {
            searchResultsIds = JSON.parse(decodeURIComponent(rawSearchResults));
            currentIndex = parseInt(rawCurrentIndex, 10);

            // Validazione dell'indice e dell'array di ricerca
            if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= searchResultsIds.length || !Array.isArray(searchResultsIds) || searchResultsIds.length === 0) {
                console.warn("Parametri di ricerca non validi. Caricamento singolo cliente.");
                searchResultsIds = [];
                currentIndex = -1;
                // Pulisci localStorage se i parametri URL sono invalidi
                localStorage.removeItem("risultatiRicercaClienti");
                localStorage.removeItem("indiceClienteCorrente");
            } else {
                // Se i parametri URL sono validi, salvali in localStorage per la persistenza della navigazione
                localStorage.setItem("risultatiRicercaClienti", JSON.stringify(searchResultsIds));
                localStorage.setItem("indiceClienteCorrente", currentIndex.toString());
            }

        } catch (e) {
            console.error("Errore nel parsing dei risultati di ricerca dalla URL:", e);
            searchResultsIds = [];
            currentIndex = -1;
            // Pulisci localStorage in caso di errore di parsing
            localStorage.removeItem("risultatiRicercaClienti");
            localStorage.removeItem("indiceClienteCorrente");
        }
    } else {
        // Se non ci sono parametri di ricerca nell'URL, prova a caricare da localStorage
        const storedResults = localStorage.getItem("risultatiRicercaClienti");
        const storedIndex = localStorage.getItem("indiceClienteCorrente");
        if (storedResults && storedIndex !== null) {
            try {
                searchResultsIds = JSON.parse(storedResults);
                currentIndex = parseInt(storedIndex, 10);
                 if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= searchResultsIds.length || !Array.isArray(searchResultsIds) || searchResultsIds.length === 0) {
                    // Se i dati in localStorage non sono validi
                    localStorage.removeItem("risultatiRicercaClienti");
                    localStorage.removeItem("indiceClienteCorrente");
                    searchResultsIds = [];
                    currentIndex = -1;
                 }
            } catch (e) {
                console.error("Errore nel parsing dei risultati di ricerca dal localStorage:", e);
                localStorage.removeItem("risultatiRicercaClienti");
                localStorage.removeItem("indiceClienteCorrente");
                searchResultsIds = [];
                currentIndex = -1;
            }
        }
    }

    // Carica i dettagli del cliente corrente (quello passato via URL o il primo del set di ricerca)
    await fetchClientDetails(clienteId);
    updatePaginationControls(); // Aggiorna la UI di paginazione

    caricaTrattamenti(clienteId); // Carica i trattamenti per il cliente corrente
}

// Funzione che carica i dettagli del cliente e popola l'HTML
async function fetchClientDetails(id) {
    try {
        const response = await fetch(`/api/clienti/${id}`);
        const client = await handleApiResponse(response);
        if (client === null) return; // handleApiResponse gestisce il reindirizzamento

        if (!response.ok) {
            const errorDetails = client.error || "Errore sconosciuto";
            throw new Error(`Cliente non trovato: ${errorDetails}`);
        }

        // Popola gli elementi HTML con i dati del cliente
        document.getElementById("nome-completo").innerText = `${client.nome} ${client.cognome}`;
        document.getElementById("email").innerText = client.email || 'N/A';
        document.getElementById("telefono").innerText = client.telefono || 'N/A';

        // Precompila il form di modifica (se presente nell'HTML)
        const inputNome = document.getElementById("modifica-nome");
        if (inputNome) inputNome.value = client.nome || '';
        const inputCognome = document.getElementById("modifica-cognome");
        if (inputCognome) inputCognome.value = client.cognome || '';
        const inputEmail = document.getElementById("modifica-email");
        if (inputEmail) inputEmail.value = client.email || '';
        const inputTelefono = document.getElementById("modifica-telefono");
        if (inputTelefono) inputTelefono.value = client.telefono || '';

        const formTrattamento = document.getElementById("form-trattamento");
        if (formTrattamento) formTrattamento.dataset.clienteId = client.id;

    } catch (err) {
        if (err.message !== "Reindirizzamento handled") {
            console.error("Errore caricamento cliente:", err);
            showMessage('Errore nel caricamento del cliente.', 'error');
        }
    }
}


// --- Logica di Paginazione Risultati di Ricerca (AGGIORNATO) ---
function updatePaginationControls() {
    if (searchResultsIds.length > 1) {
        paginationControls.style.display = 'block'; // Mostra il blocco di navigazione
        paginationInfo.textContent = `Cliente ${currentIndex + 1} di ${searchResultsIds.length}`;

        prevClientButton.disabled = currentIndex === 0;
        nextClientButton.disabled = currentIndex === searchResultsIds.length - 1;
    } else {
        paginationControls.style.display = 'none'; // Nascondi se c'è solo 1 o 0 risultati
    }
}

// Funzione per cambiare cliente (AGGIORNATO)
function cambiaCliente(direzione) {
    let newIndex = currentIndex + direzione;

    if (newIndex >= 0 && newIndex < searchResultsIds.length) {
        currentIndex = newIndex;
        const newClientId = searchResultsIds[currentIndex];

        // Aggiorna localStorage
        localStorage.setItem("indiceClienteCorrente", currentIndex.toString());

        // Aggiorna l'URL senza ricaricare la pagina completamente (importante per l'esperienza utente)
        // Questo mantiene i parametri di ricerca nella URL per coerenza
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('id', newClientId);
        currentUrl.searchParams.set('current_index', currentIndex); // Aggiorna anche l'indice nella URL
        window.history.pushState({ path: currentUrl.href }, '', currentUrl.href);

        // Carica i dettagli del nuovo cliente
        fetchClientDetails(newClientId);
        caricaTrattamenti(newClientId); // Ricarica anche i trattamenti per il nuovo cliente
        updatePaginationControls(); // Aggiorna i controlli di paginazione
    }
}


// --- Carica la lista trattamenti (La tua funzione esistente) ---
function caricaTrattamenti(clienteId) {
    fetch(`/api/clienti/${clienteId}/trattamenti`)
        .then(async res => {
            const data = await handleApiResponse(res);
            if (data === null) {
                throw new Error("Reindirizzamento handled");
            }
            if (!res.ok) {
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore caricamento trattamenti: ${errorDetails}`);
            }
            return data;
        })
        .then(trattamenti => {
            const container = document.getElementById("lista-trattamenti");
            if (!container) return;

            container.innerHTML = "";
            if (trattamenti.length === 0) {
                container.innerHTML = '<tr><td colspan="5" style="text-align: center;">Nessun trattamento registrato per questo cliente.</td></tr>';
                return;
            }

            trattamenti.forEach(t => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${t.tipo_trattamento}</td>
                    <td>${t.descrizione || ''}</td>
                    <td>${new Date(t.data_trattamento).toLocaleDateString('it-IT')}</td>
                    <td>${t.note || ''}</td>
                    <td>
                        <button onclick="modificaTrattamento(${t.id})">Modifica</button>
                        <button onclick="eliminaTrattamento(${t.id}, ${clienteId})">Elimina</button>
                    </td>
                `;
                container.appendChild(row);
            });
        })
        .catch(err => {
            if (err.message !== "Reindirizzamento handled") {
                console.error("Errore caricamento trattamenti:", err);
                showMessage('Errore nel caricamento dei trattamenti.', 'error');
            }
        });
}

// --- Funzioni globali (le tue esistenti, usate negli onclick) ---
// Queste funzioni devono rimanere globali (o essere assegnate agli eventi in JS)
// per essere raggiungibili dagli attributi `onclick` nell'HTML.

function vaiAggiungiTrattamento() {
    const id = clienteId; // Usa l'ID del cliente attualmente caricato
    window.location.href = `/aggiungi-trattamento.html?id=${id}`;
}

function vaiModificaCliente() {
    const id = clienteId; // Usa l'ID del cliente attualmente caricato
    window.location.href = `/modifica-cliente.html?id=${id}`;
}

function modificaTrattamento(trattamentoId) {
    window.location.href = `/modifica-trattamento.html?id=${trattamentoId}`;
}

function eliminaTrattamento(id, clienteId) {
    if (confirm("Sei sicuro di voler eliminare questo trattamento?")) {
        fetch(`/api/trattamenti/${id}`, {
                method: "DELETE"
            })
            .then(async res => {
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore eliminazione trattamento: ${errorDetails}`);
                }
                return data;
            })
            .then(() => {
                caricaTrattamenti(clienteId);
                showMessage('Trattamento eliminato con successo!', 'success');
            })
            .catch(err => {
                if (err.message !== "Reindirizzamento handled") {
                    console.error("Errore eliminazione trattamento:", err);
                    showMessage('Errore durante l\'eliminazione del trattamento.', 'error');
                }
            });
    }
}

// --- Eliminazione cliente (La tua funzione esistente) ---
const btnElimina = document.getElementById("btnEliminaCliente");
if (btnElimina) {
    btnElimina.addEventListener("click", () => {
        if (!clienteId) return;

        const conferma = confirm("Sei sicuro di voler eliminare questo cliente? L'azione è irreversibile.");
        if (!conferma) return;

        fetch(`/api/clienti/${clienteId}`, {
                method: "DELETE"
            })
            .then(async res => {
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore eliminazione cliente: ${errorDetails}`);
                }
                return data;
            })
            .then(() => {
                showMessage("Cliente eliminato con successo", 'success');
                setTimeout(() => {
                    window.location.href = "/dashboard.html";
                }, 1500);
            })
            .catch(err => {
                if (err.message !== "Reindirizzamento handled") {
                    console.error("Errore durante l'eliminazione del cliente:", err);
                    showMessage('Errore durante l\'eliminazione del cliente.', 'error');
                }
            });
    });
}

// --- Modifica cliente (La tua funzione esistente - NOTA: IL TUO HTML NON HA form-modifica-cliente) ---
// Se non hai un form con id "form-modifica-cliente" nel tuo scheda-cliente.html, questa parte non farà nulla.
// La tua funzione `vaiModificaCliente()` reindirizza a `modifica-cliente.html` che probabilmente ha un suo JS.
// Quindi, questa parte potrebbe essere ridondante qui o potrebbe esserci un'incoerenza.
// La lascio per completezza, ma tieni presente che l'HTML che mi hai dato non la supporta direttamente.
const formModifica = document.getElementById("form-modifica-cliente");
if (formModifica) {
    formModifica.addEventListener("submit", (e) => {
        e.preventDefault();

        const datiAggiornati = {
            nome: document.getElementById("modifica-nome").value,
            cognome: document.getElementById("modifica-cognome").value,
            email: document.getElementById("modifica-email").value,
            telefono: document.getElementById("modifica-telefono").value,
        };

        fetch(`/api/clienti/${clienteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datiAggiornati)
            })
            .then(async res => {
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore aggiornamento cliente: ${errorDetails}`);
                }
                return data;
            })
            .then(() => {
                showMessage("Cliente aggiornato con successo", 'success');
                setTimeout(() => {
                    window.location.reload(); // Potresti voler ricaricare solo i dettagli del cliente anziché tutta la pagina
                }, 1500);
            })
            .catch(err => {
                if (err.message !== "Reindirizzamento handled") {
                    console.error("Errore aggiornamento:", err);
                    showMessage('Errore durante l\'aggiornamento del cliente.', 'error');
                }
            });
    });
}

// --- Event Listeners per i pulsanti di paginazione (AGGIORNATO) ---
// Questi devono essere attaccati DOPO che gli elementi DOM sono stati caricati e le variabili inizializzate.
// Si consiglia di avvolgere il tutto in un DOMContentLoaded listener per sicurezza.
document.addEventListener("DOMContentLoaded", () => {
    // Chiama la funzione di inizializzazione principale
    initializeClientData();

    if (prevClientButton) {
        prevClientButton.addEventListener("click", () => cambiaCliente(-1));
    }
    if (nextClientButton) {
        nextClientButton.addEventListener("click", () => cambiaCliente(1));
    }

    // Le tue funzioni `vaiAggiungiTrattamento`, `vaiModificaCliente`,
    // `modificaTrattamento`, `eliminaTrattamento` sono già globali o gestite
    // tramite `onclick` nell'HTML, quindi non richiedono `addEventListener` qui
    // a meno che tu non voglia centralizzare la gestione degli eventi.

    // Aggiungi un listener per l'evento popstate (quando l'utente usa le frecce avanti/indietro del browser)
    window.addEventListener('popstate', (event) => {
        // Quando lo stato della history cambia (es. con frecce del browser), ri-inizializza
        // per caricare il cliente corretto e aggiornare la UI di paginazione.
        const newUrlParams = new URLSearchParams(window.location.search);
        const newClienteId = newUrlParams.get('id');
        const newRawSearchResults = newUrlParams.get('search_results');
        const newRawCurrentIndex = newUrlParams.get('current_index');

        if (newClienteId) {
            // Aggiorna le variabili globali della paginazione
            if (newRawSearchResults && newRawCurrentIndex !== null) {
                searchResultsIds = JSON.parse(decodeURIComponent(newRawSearchResults));
                currentIndex = parseInt(newRawCurrentIndex, 10);
                localStorage.setItem("risultatiRicercaClienti", JSON.stringify(searchResultsIds));
                localStorage.setItem("indiceClienteCorrente", currentIndex.toString());
            } else {
                // Se non ci sono parametri di ricerca, pulisci i dati di paginazione
                searchResultsIds = [];
                currentIndex = -1;
                localStorage.removeItem("risultatiRicercaClienti");
                localStorage.removeItem("indiceClienteCorrente");
            }
            fetchClientDetails(newClienteId);
            caricaTrattamenti(newClienteId);
            updatePaginationControls();
        } else {
            // Nessun ID nella URL, reindirizza alla dashboard
            showMessage("Nessun ID cliente specificato. Reindirizzamento alla Dashboard.", 'info');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
        }
    });

});
