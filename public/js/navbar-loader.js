document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("navbar");
    if (container) {
        fetch("/navbar.html")
            .then(res => res.text())
            .then(html => {
                container.innerHTML = html;

                // *** INIZIO LOGICA RICERCA NAVBAR ***
                const navbarSearchInput = document.getElementById("navbar-search-input");
                const navbarSearchButton = document.getElementById("navbar-search-button");

                // Funzione per mostrare un messaggio temporaneo (la stessa di dashboard-app.js, copiata qui)
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
                            background-color: #fff3cd; /* Default info color */
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

                // Funzione handleApiResponse (copiata da dashboard-app.js)
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

                // Logica di ricerca (adattata da handleSearchClient di dashboard-app.js)
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
                                window.location.href = `/scheda-cliente.html?id=${clients[0].id}&search_results=${encodedClientIds}&current_index=0`;
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
                // *** FINE LOGICA RICERCA NAVBAR ***

                // Logica per il toggle della navbar su mobile (come avevamo già)
                const navbarToggle = document.getElementById('navbar-toggle');
                const navbarLinks = document.querySelector('.navbar-links');

                if (navbarToggle && navbarLinks) {
                    navbarToggle.addEventListener('click', () => {
                        navbarLinks.classList.toggle('active');
                    });
                }

                // NON CARICHIAMO dashboard.js QUI DINAMICAMENTE
                // Assicurati che dashboard.html carichi dashboard-app.js direttamente.
                // const dashboardScript = document.createElement("script");
                // dashboardScript.src = "/js/dashboard.js";
                // dashboardScript.defer = true;
                // document.body.appendChild(dashboardScript);
            })
            .catch(err => console.error("Errore nel caricamento della navbar:", err));
    }
});
