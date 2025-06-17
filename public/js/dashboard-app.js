document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti agli elementi DOM
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const newClientNameInput = document.getElementById("new-client-name");
    const newClientSurnameInput = document.getElementById("new-client-surname");
    const newClientEmailInput = document.getElementById("new-client-email");
    const newClientPhoneInput = document.getElementById("new-client-phone");
    const addNewClientButton = document.getElementById("add-new-client-button");

    const clientListContainer = document.getElementById("client-list-container");
    const viewAllClientsButton = document.getElementById("view-all-clients-button");

// Funzione per mostrare un messaggio temporaneo
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    // messageDiv.style.margin = '10px 0'; // Rimuovi o commenta questa riga
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.color = '#1a1a1a'; // Testo scuro

    if (type === 'success') {
        messageDiv.style.backgroundColor = '#d4edda'; // Verde chiaro
        messageDiv.style.borderColor = '#28a745'; // Verde scuro
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#f8d7da'; // Rosso chiaro
        messageDiv.style.borderColor = '#dc3545'; // Rosso scuro
    } else {
        messageDiv.style.backgroundColor = '#fff3cd'; // Giallo chiaro
        messageDiv.style.borderColor = '#ffc107'; // Giallo scuro
    }
    messageDiv.style.border = '1px solid';
    messageDiv.style.textAlign = 'center';

    // === NUOVE STILI PER POSIZIONAMENTO E VISIBILITÀ ===
    messageDiv.style.position = 'fixed';       // Lo rende fisso sullo schermo
    messageDiv.style.top = '20px';             // Distanza da 20px dal bordo superiore
    messageDiv.style.left = '50%';             // Lo sposta al 50% della larghezza della pagina
    messageDiv.style.transform = 'translateX(-50%)'; // Lo centra perfettamente orizzontalmente
    messageDiv.style.zIndex = '1000';          // Assicura che sia sopra a tutti gli altri elementi
    messageDiv.style.minWidth = '280px';       // Larghezza minima per una buona leggibilità
    messageDiv.style.maxWidth = '90%';         // Larghezza massima per schermi piccoli
    messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'; // Un'ombra leggera per farlo risaltare
    // ====================================================

    // Inserisce il messaggio all'inizio del body
    document.body.insertBefore(messageDiv, document.body.firstChild);

    // Rimuove il messaggio dopo 3 secondi (o il valore che hai messo tu)
    setTimeout(() => {
        messageDiv.remove();
    }, 3000); // Se l'avevi messo a 10000 per il test, puoi rimetterlo a 3000 qui.
}


    // --- Funzioni per la Gestione Clienti ---

    async function fetchAndDisplayClients() {
        clientListContainer.innerHTML = '<p style="text-align: center; color: #666;">Caricamento clienti...</p>';
        try {
            const response = await fetch("/api/clienti");
            if (!response.ok) {
                throw new Error("Errore nel recupero della lista clienti");
            }
            const clients = await response.json();
            
            clientListContainer.innerHTML = ''; // Pulisce il messaggio di caricamento

            if (clients.length === 0) {
                clientListContainer.innerHTML = '<p style="text-align: center; color: #666;">Nessun cliente trovato.</p>';
                return;
            }

            clients.forEach(client => {
                const clientItem = document.createElement("div");
                clientItem.className = "client-list-item";
                clientItem.innerHTML = `
                    <span class="client-name">${client.nome} ${client.cognome}</span>
                    <div class="client-actions">
                        <button class="view-client-button" data-id="${client.id}">Visualizza Scheda</button>
                    </div>
                `;
                clientListContainer.appendChild(clientItem);
            });

            // Aggiungi event listener per i bottoni "Visualizza Scheda"
            document.querySelectorAll(".view-client-button").forEach(button => {
                button.addEventListener("click", (event) => {
                    const clientId = event.target.dataset.id;
                    window.location.href = `/scheda-cliente.html?id=${clientId}`;
                });
            });

        } catch (error) {
            console.error("Errore fetchAndDisplayClients:", error);
            clientListContainer.innerHTML = '<p style="text-align: center; color: red;">Errore nel caricamento dei clienti.</p>';
            showMessage('Errore nel caricamento della lista clienti.', 'error');
        }
    }

    async function handleSearchClient() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            showMessage("Per favore, inserisci un nome o cognome per la ricerca.", 'info');
            return;
        }

        try {
            const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error("Errore nella ricerca clienti");
            }
            const clients = await response.json();

            clientListContainer.innerHTML = ''; // Pulisce il container

            if (clients.length > 0) {
                showMessage(`Trovati ${clients.length} clienti per "${searchTerm}".`, 'success');
                clients.forEach(client => {
                    const clientItem = document.createElement("div");
                    clientItem.className = "client-list-item";
                    clientItem.innerHTML = `
                        <span class="client-name">${client.nome} ${client.cognome}</span>
                        <div class="client-actions">
                            <button class="view-client-button" data-id="${client.id}">Visualizza Scheda</button>
                        </div>
                    `;
                    clientListContainer.appendChild(clientItem);
                });

                // Aggiungi event listener per i bottoni "Visualizza Scheda"
                document.querySelectorAll(".view-client-button").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const clientId = event.target.dataset.id;
                        window.location.href = `/scheda-cliente.html?id=${clientId}`;
                    });
                });

            } else {
                clientListContainer.innerHTML = '<p style="text-align: center; color: #666;">Nessun cliente trovato con questo termine.</p>';
                showMessage(`Nessun cliente trovato per "${searchTerm}".`, 'info');
            }
        } catch (error) {
            console.error("Errore handleSearchClient:", error);
            clientListContainer.innerHTML = '<p style="text-align: center; color: red;">Errore durante la ricerca.</p>';
            showMessage('Errore durante la ricerca dei clienti.', 'error');
        }
    }

    async function handleAddNewClient() {
        const nome = newClientNameInput.value.trim();
        const cognome = newClientSurnameInput.value.trim();
        const email = newClientEmailInput.value.trim();
        const telefono = newClientPhoneInput.value.trim();

        if (!nome || !cognome) {
            showMessage("Nome e Cognome sono obbligatori per aggiungere un cliente.", 'error');
            return;
        }

        const newClientData = { nome, cognome, email, telefono };

        try {
            const response = await fetch("/api/clienti", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClientData),
            });

            if (!response.ok) {
                throw new Error("Errore durante l'aggiunta del cliente");
            }

            const result = await response.json();
            showMessage(`Cliente ${nome} ${cognome} aggiunto con successo!`, 'success');

            // Pulisci i campi del form
            newClientNameInput.value = "";
            newClientSurnameInput.value = "";
            newClientEmailInput.value = "";
            newClientPhoneInput.value = "";

            // Ricarica la lista dei clienti
            fetchAndDisplayClients();

            // Opzionale: reindirizza alla scheda del nuovo cliente
            // window.location.href = `/scheda-cliente.html?id=${result.id}`;

        } catch (error) {
            console.error("Errore handleAddNewClient:", error);
            showMessage('Errore durante l\'aggiunta del cliente.', 'error');
        }
    }


    // --- Event Listeners ---

    // Carica la lista clienti all'avvio della pagina
    fetchAndDisplayClients();

    // Event listener per il bottone "Cerca"
    if (searchButton) {
        searchButton.addEventListener("click", handleSearchClient);
    }
    // Permetti la ricerca anche premendo Invio nel campo input
    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                handleSearchClient();
            }
        });
    }

    // Event listener per il bottone "Aggiungi Cliente"
    if (addNewClientButton) {
        addNewClientButton.addEventListener("click", handleAddNewClient);
    }

    // Event listener per il bottone "Ricarica Lista"
    if (viewAllClientsButton) {
        viewAllClientsButton.addEventListener("click", fetchAndDisplayClients);
    }
});
