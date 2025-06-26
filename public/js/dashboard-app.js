document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti agli elementi DOM
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");

    const newClientNameInput = document.getElementById("new-client-name");
    const newClientSurnameInput = document.getElementById("new-client-surname");
    const newClientEmailInput = document.getElementById("new-client-email");
    const newClientPhoneInput = document.getElementById("new-client-phone");
    const addNewClientButton = document.getElementById("add-new-client-button");

    // RIMOSSO: clientListContainer e viewAllClientsButton non sono più necessari
    // const clientListContainer = document.getElementById("client-list-container");
    // const viewAllClientsButton = document.getElementById("view-all-clients-button");

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

    // --- Gestione generica delle risposte API ---
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");

        // RIMOSSO IL CONTROLLO E REINDIRIZZAMENTO PER 401 E ALTRI STATUS NON JSON
        // Dato che il login è stato disabilitato, non ha più senso questa logica lato client.
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            // Se la risposta non è JSON, e non è un 401 specifico,
            // logga l'errore ma non reindirizzare al login.
            // Potrebbe essere un 404 (come ora) o un altro errore server.
            const textResponse = await response.text(); // Leggi il testo della risposta per debugging
            console.error('Risposta API non JSON o inattesa:', response.status, textResponse);
            // Potresti mostrare un messaggio più generico all'utente se la risposta non è OK.
            if (!response.ok) {
                 showMessage(`Errore server (${response.status}): ${textResponse.substring(0, 100)}...`, 'error');
            }
            return null; // Ritorna null per indicare che non ci sono dati JSON validi
        }
    }


    // --- Funzioni per la Gestione Clienti ---

    // RIMOSSO: fetchAndDisplayClients non è più usata sulla dashboard
    // async function fetchAndDisplayClients() { /* ... */ }

    async function handleSearchClient() {
        const searchTerm = searchInput.value.trim();
        if (!searchTerm) {
            showMessage("Per favore, inserisci un nome o cognome per la ricerca.", 'info');
            return;
        }

        try {
            // ***** MODIFICA QUI: L'URL DEVE CORRISPONDERE ALLA ROTTA DEL BACKEND *****
            // Il backend ha app.get('/cerca-clienti', ...)
            const response = await fetch(`/cerca-clienti?query=${encodeURIComponent(searchTerm)}`);
            // ************************************************************************

            // Questo blocco if(!response.ok) è già gestito in handleApiResponse, ma lo lascio se vuoi un controllo più specifico qui
            // const data = await handleApiResponse(response);
            // if (data === null) return; // handleApiResponse potrebbe reindirizzare o mostrare errore

            if (!response.ok) {
                // Se la risposta non è OK, gestiscila (handleApiResponse si è già occupata del messaggio)
                const errorText = await response.text(); // Per debugging
                throw new Error(`Errore HTTP ${response.status} durante la ricerca: ${errorText}`);
            }
            
            // Assicurati che il backend ritorni JSON anche in caso di 404 o altri errori
            const clients = await response.json(); // Tenta di parsare JSON

            if (clients.length > 0) {
                // Estrai solo gli ID dei clienti trovati
                const clientIds = clients.map(client => client.id);
                // Converti l'array di ID in una stringa JSON e URL-encodala
                const encodedClientIds = encodeURIComponent(JSON.stringify(clientIds));

                showMessage(`Trovati ${clients.length} clienti per "${searchTerm}". Reindirizzamento alla scheda del primo risultato...`, 'success');

                setTimeout(() => {
                    // Reindirizza alla scheda del PRIMO cliente trovato
                    // e passa tutti gli ID e l'indice corrente (0 per il primo)
                    window.location.href = `/scheda-cliente.html?id=${clients[0].id}&search_results=${encodedClientIds}&current_index=0`;
                }, 1500);

            } else {
                // Se non trova nessun cliente
                showMessage(`Nessun cliente trovato per "${searchTerm}".`, 'info');
            }
        } catch (error) {
            console.error("Errore handleSearchClient:", error);
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
            // ***** MODIFICA QUI: L'URL DEVE CORRISPONDERE ALLA ROTTA DEL BACKEND *****
            // Il backend ha app.post('/clienti', ...)
            const response = await fetch("/clienti", { // Rimosso '/api'
            // ************************************************************************
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClientData),
            });

            // Gestione della risposta API. handleApiResponse ora non reindirizza al login
            if (!response.ok) {
                 const errorDetails = await response.text(); // Leggi il testo della risposta per debugging
                 console.error('Errore risposta API aggiunta cliente:', errorDetails);
                 throw new Error(`Errore durante l'aggiunta del cliente (${response.status}): ${errorDetails.substring(0, 100)}`);
            }

            const data = await response.json(); // Tentiamo di parsare JSON direttamente qui, senza handleApiResponse per evitare logica non necessaria

            if (data.id) {
                showMessage(`Cliente ${nome} ${cognome} aggiunto con successo! Reindirizzamento alla scheda cliente...`, 'success');
                // Pulisci i campi del form dopo l'aggiunta riuscita e prima del reindirizzamento
                newClientNameInput.value = "";
                newClientSurnameInput.value = "";
                newClientEmailInput.value = "";
                newClientPhoneInput.value = "";
                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${data.id}`;
                }, 1500);
            } else {
                showMessage(`Cliente ${nome} ${cognome} aggiunto con successo!`, 'success');
                newClientNameInput.value = "";
                newClientSurnameInput.value = "";
                newClientEmailInput.value = "";
                newClientPhoneInput.value = "";
                setTimeout(() => {
                    window.location.href = '/clienti'; // Reindirizza a /clienti che mostra la lista di tutti i clienti
                }, 1500);
            }

        } catch (error) {
            console.error("Errore handleAddNewClient:", error);
            showMessage(`Errore durante l'aggiunta del cliente: ${error.message}`, 'error');
        }
    }


    // --- Event Listeners ---

    // RIMOSSO: Caricamento iniziale della lista clienti
    // fetchAndDisplayClients();

    // Event listener per il bottone "Cerca"
    if (searchButton) {
        searchButton.addEventListener("click", handleSearchClient);
    }
    // Permetti la ricerca anche premendo Invio nel campo input
    if (searchInput) {
        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault(); // Previeni l'invio del form HTML standard
                handleSearchClient();
            }
        });
    }

    // Event listener per il bottone "Aggiungi Cliente"
    if (addNewClientButton) {
        addNewClientButton.addEventListener("click", handleAddNewClient);
    }

    // RIMOSSO: Event listener per il bottone "Ricarica Lista"
    // if (viewAllClientsButton) {
    //      viewAllClientsButton.addEventListener("click", fetchAndDisplayClients);
    // }
});
