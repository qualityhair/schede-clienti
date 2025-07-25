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
    // Se la risposta è un reindirizzamento (gestito dal guardiano del server)
    // il browser lo seguirà automaticamente. Qui, intercettiamo il caso
    // in cui il reindirizzamento è "manuale" o fallisce.
    if (response.redirected) {
        window.location.href = response.url; // Segui il reindirizzamento del server
        return null;
    }

    // Se il server risponde con un 401 o 403 (Non autorizzato)
    if (response.status === 401 || response.status === 403) {
        showMessage('Sessione scaduta o non autorizzato. Verrai reindirizzato al login.', 'error');
        setTimeout(() => {
            window.location.href = '/'; // Vai alla home, che gestirà il login
        }, 1500);
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    
    // Se la risposta non è JSON e non è un errore gestito,
    // potrebbe essere un altro problema. Evitiamo il loop.
    console.error("Risposta API non valida:", response);
    showMessage('Errore imprevisto nella comunicazione con il server.', 'error');
    return null; // Non fare nulla, evita il loop
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
            const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
            const data = await handleApiResponse(response);
            if (data === null) return;

            if (!response.ok) {
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore nella ricerca clienti: ${errorDetails}`);
            }

            const clients = data; // I dati JSON sono già stati parsati da handleApiResponse

            if (clients.length > 0) {
                // Estrai solo gli ID dei clienti trovati
                const clientIds = clients.map(client => client.id);
                // Converti l'array di ID in una stringa JSON e URL-encodala
                const encodedClientIds = encodeURIComponent(JSON.stringify(clientIds));

                showMessage(`Trovati ${clients.length} clienti per "${searchTerm}". Reindirizzamento alla scheda del primo risultato...`, 'success');

                setTimeout(() => {
                    // Reindirizza alla scheda del PRIMO cliente trovato
                    // e passa tutti gli ID e l'indice corrente (0 per il primo)
                    window.location.href = `/scheda-cliente.html?id=${clients[0].id}&searchIds=${encodedClientIds}&index=0`;
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
            const response = await fetch("/api/clienti", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClientData),
            });

            const data = await handleApiResponse(response);
            if (data === null) return;

            if (!response.ok) {
                const errorDetail = data.error || "Errore sconosciuto";
                throw new Error(`Errore durante l'aggiunta del cliente: ${errorDetail}`);
            }

            // Cliente aggiunto con successo, reindirizza direttamente alla sua scheda
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
                // Fallback: se per qualche motivo l'ID non viene restituito
                showMessage(`Cliente ${nome} ${cognome} aggiunto con successo!`, 'success');
                // Pulisci i campi del form
                newClientNameInput.value = "";
                newClientSurnameInput.value = "";
                newClientEmailInput.value = "";
                newClientPhoneInput.value = "";
                // Poiché non visualizziamo più la lista, un redirect alla dashboard o lista clienti può essere un fallback sensato
                setTimeout(() => {
                    window.location.href = '/dashboard.html'; // Torna alla dashboard "vuota" o a lista-clienti
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
