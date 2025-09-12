document.addEventListener("DOMContentLoaded", () => {
    // === Inizio Logica di Apertura/Chiusura Sidebar ===
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar-btn');
    

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            sidebar.classList.add('is-open');
        });
    }


    // === Fine Logica di Apertura/Chiusura Sidebar ===
	
	    // Nuova logica per chiudere la sidebar cliccando fuori
    document.addEventListener('click', (event) => {
        // Controlla se il clic è avvenuto al di fuori della sidebar E non sul bottone di apertura
        if (sidebar.classList.contains('is-open') && !sidebar.contains(event.target) && event.target !== openBtn) {
            sidebar.classList.remove('is-open');
        }
    });
	

    // === Inizio Logica di Ricerca (dal vecchio navbar-loader.js) ===
    const navbarSearchInput = document.getElementById("navbar-search-input");
    const navbarSearchButton = document.getElementById("navbar-search-button");

    // Funzione per mostrare un messaggio temporaneo (copiata da navbar-loader.js)
    function showMessage(message, type = 'info') {
        let messageDiv = document.getElementById('navbar-message');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'navbar-message';
            messageDiv.style.cssText = `
                position: fixed;
                top: 80px; /* Sotto la navbar */
                left: 50%;
                transform: translateX(-50%);
                padding: 10px 20px;
                border-radius: 5px;
                font-weight: bold;
                color: #1a1a1a;
                border: 1px solid;
                text-align: center;
                z-index: 1001;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                background-color: #fff3cd;
                border-color: #ffc107;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            `;
            document.body.appendChild(messageDiv);
        }

        messageDiv.textContent = message;
        messageDiv.className = ''; // Reset classes
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

        messageDiv.style.opacity = '1';

        setTimeout(() => {
            messageDiv.style.opacity = '0';
        }, 3000);
    }

    // Funzione handleApiResponse (copiata da navbar-loader.js)
    async function handleApiResponse(response) {
        const contentType = response.headers.get("content-type");
        if (response.status === 401) {
            showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error');
            setTimeout(() => { window.location.href = '/'; }, 1500);
            return null;
        } else if (contentType && contentType.includes("application/json")) {
            return await response.json();
        } else {
            showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error');
            setTimeout(() => { window.location.href = '/'; }, 1500);
            return null;
        }
    }

    // Logica di ricerca (copiata da navbar-loader.js)
    async function handleNavbarSearchClient() {
        const searchTerm = navbarSearchInput.value.trim();
        if (!searchTerm) {
            showMessage("Per favore, inserisci un nome o cognome per la ricerca nella navbar.", 'info');
            return;
        }

        try {
            const response = await fetch(`/api/clienti/cerca?term=${encodeURIComponent(searchTerm)}`);
            const data = await handleApiResponse(response);
            if (data === null) return;

            if (!response.ok) {
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Errore nella ricerca clienti dalla navbar: ${errorDetails}`);
            }

            const clients = data;
            if (clients.length > 0) {
                const clientIds = clients.map(client => client.id);
                const encodedClientIds = encodeURIComponent(JSON.stringify(clientIds));

                showMessage(`Trovati ${clients.length} clienti per "${searchTerm}". Reindirizzamento alla scheda del primo risultato...`, 'success');

                setTimeout(() => {
                    window.location.href = `/scheda-cliente.html?id=${clients[0].id}&searchIds=${encodedClientIds}&index=0`;
                }, 1500);
            } else {
                showMessage(`Nessun cliente trovato per "${searchTerm}" dalla navbar.`, 'info');
            }
        } catch (error) {
            console.error("Errore handleNavbarSearchClient:", error);
            showMessage('Errore critico durante la ricerca dei clienti dalla navbar. Controlla la console per dettagli.', 'error');
        }
    }

    // Event Listeners per la ricerca della navbar
    if (navbarSearchButton) {
        navbarSearchButton.addEventListener("click", handleNavbarSearchClient);
    }
    if (navbarSearchInput) {
        navbarSearchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                handleNavbarSearchClient();
            }
        });
    }
    // === Fine Logica di Ricerca ===
});