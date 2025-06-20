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

    // --- NUOVA FUNZIONE: Gestione generica delle risposte API ---
    // Questa funzione centralizza il controllo dell'autenticazione per le risposte fetch
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");

        if (response.status === 401) {
            // Se il server invia esplicitamente 401 per non autorizzato
            showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error');
            setTimeout(() => {
                window.location.href = '/'; // Reindirizza alla pagina di login dopo un breve ritardo
            }, 1500); // Diamo tempo all'utente di leggere il messaggio
            return null; // Indica che l'operazione non è andata a buon fine e c'è stato un reindirizzamento
        } else if (contentType && contentType.includes("application/json")) {
            // Se la risposta è JSON (anche se non è OK, per errori specifici dal server)
            return await response.json();
        } else {
            // Se la risposta non è OK e non è JSON (probabilmente HTML di reindirizzamento)
            showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error');
            setTimeout(() => {
                window.location.href = '/'; // Reindirizza alla pagina di login dopo un breve ritardo
            }, 1500); // Diamo tempo all'utente di leggere il messaggio
            return null; // Indica che l'operazione non è andata a buon fine e c'è stato un reindirizzamento
        }
    }


    // --- Funzioni per la Gestione Clienti ---

    async function fetchAndDisplayClients() {
        clientListContainer.innerHTML = '<p style="text-align: center; color: #666;">Caricamento clienti...</p>';
        try {
            const response = await fetch("/api/clienti");

            // *** Utilizza la nuova funzione handleApiResponse qui ***
            const data = await handleApiResponse(response);
            if (data === null) return; // Se handleApiResponse ha gestito un reindirizzamento, ferma la funzione

            if (!response.ok) { // Controlla lo status OK DOPO aver gestito il reindirizzamento
                    // Se non è 200 ma è JSON valido, allora è un errore specifico dal server
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore nel recupero della lista clienti: ${errorDetails}`);
            }

            const clients = data; // I dati JSON sono già stati parsati da handleApiResponse

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
            showMessage('Errore critico durante il caricamento dei clienti. Controlla la console per dettagli.', 'error');
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

            // *** Utilizza la nuova funzione handleApiResponse qui ***
            const data = await handleApiResponse(response);
            if (data === null) return; // Se handleApiResponse ha gestito un reindirizzamento, ferma la funzione

            if (!response.ok) { // Controlla lo status OK DOPO aver gestito il reindirizzamento
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore nella ricerca clienti: ${errorDetails}`);
            }

            const clients = data; // I dati JSON sono già stati parsati da handleApiResponse

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
            showMessage('Errore critico durante la ricerca dei clienti. Controlla la console per dettagli.', 'error');
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

            const data = await handleApiResponse(response);
            if (data === null) return; // Se handleApiResponse ha gestito un reindirizzamento, ferma la funzione

            if (!response.ok) {
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore durante l'aggiunta del cliente: ${errorDetails}`);
            }

            // Client added successfully, now check for the ID to redirect
            if (data.id) { // Check if the backend returned the ID
                showMessage(`Cliente ${nome} ${cognome} aggiunto con successo! Reindirizzamento...`, 'success');
                // Clean the form fields AFTER successful addition and before redirect
                newClientNameInput.value = "";
                newClientSurnameInput.value = "";
                newClientEmailInput.value = "";
                newClientPhoneInput.value = "";
                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${data.id}`; // Redirect to the new client's detail page
                }, 1500); // Give a moment for the success message to be seen
            } else {
                // Fallback: if for some reason the ID is not returned (shouldn't happen with backend change)
                showMessage(`Cliente ${nome} ${cognome} aggiunto con successo!`, 'success');
                // Clean the form fields
                newClientNameInput.value = "";
                newClientSurnameInput.value = "";
                newClientEmailInput.value = "";
                newClientPhoneInput.value = "";
                // Reload client list or redirect to dashboard as a fallback
                setTimeout(() => {
                    window.location.href = '/dashboard.html'; // Or fetchAndDisplayClients();
                }, 1500);
            }

        } catch (error) {
            console.error("Errore handleAddNewClient:", error);
            showMessage(`Errore durante l'aggiunta del cliente: ${error.message}`, 'error'); // Use error.message for more detail
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
