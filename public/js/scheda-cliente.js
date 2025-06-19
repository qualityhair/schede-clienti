if (!localStorage.getItem("risultatiRicercaClienti")) {
    localStorage.removeItem("indiceClienteCorrente");
}

// Estrai ID cliente dall'URL
const params = new URLSearchParams(window.location.search);
const clienteId = params.get("id");

// --- NUOVA FUNZIONE: Funzione per mostrare un messaggio temporaneo ---
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

// --- NUOVA FUNZIONE: Gestione generica delle risposte API ---
async function handleApiResponse(response) {
    const contentType = response.headers.get("content-type");

    if (response.status === 401) {
        showMessage('La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.', 'error');
        setTimeout(() => {
            window.location.href = '/'; // Reindirizza alla pagina di login dopo un breve ritardo
        }, 1500); // Diamo tempo all'utente di leggere il messaggio
        return null; // Indica che l'operazione non è andata a buon fine e c'è stato un reindirizzamento
    } else if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        // Questo è il caso in cui ricevi HTML (es. la pagina di login) quando ti aspetti JSON
        showMessage('Accesso non autorizzato o sessione scaduta. Verrai reindirizzato al login.', 'error');
        setTimeout(() => {
            window.location.href = '/'; // Reindirizza alla pagina di login dopo un breve ritardo
        }, 1500); // Diamo tempo all'utente di leggere il messaggio
        return null; // Indica che l'operazione non è andata a buon fine e c'è stato un reindirizzamento
    }
}


// Carica dati cliente e trattamenti
if (clienteId) {
    fetch(`/api/clienti/${clienteId}`)
        .then(async res => { // Aggiunto async qui per await handleApiResponse
            const data = await handleApiResponse(res);
            if (data === null) {
                throw new Error("Reindirizzamento handled"); // Ferma la catena .then()
            }
            if (!res.ok) {
                const errorDetails = data.error || "Errore sconosciuto";
                throw new Error(`Cliente non trovato: ${errorDetails}`);
            }
            return data; // Ritorna i dati parsati
        })
        .then(cliente => mostraCliente(cliente))
        .catch(err => {
            if (err.message !== "Reindirizzamento handled") { // Non mostrare errore se è stato un reindirizzamento
                console.error("Errore caricamento cliente:", err);
                showMessage('Errore nel caricamento del cliente.', 'error');
            }
        });

    caricaTrattamenti(clienteId);
}

// Mostra i dati del cliente
function mostraCliente(cliente) {
    const nomeEl = document.getElementById("nome-completo");
    if (nomeEl) nomeEl.innerText = `${cliente.nome} ${cliente.cognome}`;

    const emailEl = document.getElementById("email");
    if (emailEl) emailEl.innerText = cliente.email;

    const telefonoEl = document.getElementById("telefono");
    if (telefonoEl) telefonoEl.innerText = cliente.telefono;

    // Se esiste il form di modifica, precompila i campi
    const inputNome = document.getElementById("modifica-nome");
    if (inputNome) inputNome.value = cliente.nome;

    const inputCognome = document.getElementById("modifica-cognome");
    if (inputCognome) inputCognome.value = cliente.cognome;

    const inputEmail = document.getElementById("modifica-email");
    if (inputEmail) inputEmail.value = cliente.email;

    const inputTelefono = document.getElementById("modifica-telefono");
    if (inputTelefono) inputTelefono.value = cliente.telefono;

    const form = document.getElementById("form-trattamento");
    if (form) form.dataset.clienteId = cliente.id;
}

const lista = JSON.parse(localStorage.getItem("risultatiRicercaClienti") || "[]");
const indice = parseInt(localStorage.getItem("indiceClienteCorrente") || "0");
const info = document.getElementById("info-paginazione");

if (info) {
    info.innerText = `Cliente ${indice + 1} di ${lista.length}`;
}



// Carica la lista trattamenti
function caricaTrattamenti(clienteId) {
    fetch(`/api/clienti/${clienteId}/trattamenti`)
        .then(async res => { // Aggiunto async qui
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
            trattamenti.forEach(t => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${t.tipo_trattamento}</td>
                    <td>${t.descrizione}</td>
                    <td>${new Date(t.data_trattamento).toLocaleDateString()}</td>
                    <td>${t.note || ""}</td>
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

// Aggiungi questa nuova funzione in scheda-cliente.js
function modificaTrattamento(trattamentoId) {
    window.location.href = `/modifica-trattamento.html?id=${trattamentoId}`;
}

// Elimina trattamento
function eliminaTrattamento(id, clienteId) {
    if (confirm("Sei sicuro di voler eliminare questo trattamento?")) {
        fetch(`/api/trattamenti/${id}`, {
                method: "DELETE"
            })
            .then(async res => { // Aggiunto async qui
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore eliminazione trattamento: ${errorDetails}`);
                }
                return data; // res.text() se la risposta è solo testo
            })
            .then(() => caricaTrattamenti(clienteId))
            .catch(err => {
                if (err.message !== "Reindirizzamento handled") {
                    console.error("Errore eliminazione trattamento:", err);
                    showMessage('Errore durante l\'eliminazione del trattamento.', 'error');
                }
            });
    }
}

// Aggiunta trattamento
const form = document.getElementById("form-trattamento");
if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const cliente_id = form.dataset.clienteId;
        const tipo_trattamento = form.tipo_trattamento.value;
        const descrizione = form.descrizione.value;
        const data_trattamento = form.data_trattamento.value;
        const note = form.note.value;

        fetch('/api/trattamenti', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cliente_id, tipo_trattamento, descrizione, data_trattamento, note })
            })
            .then(async res => { // Aggiunto async qui
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore aggiunta trattamento: ${errorDetails}`);
                }
                return data; // res.text() se la risposta è solo testo
            })
            .then(() => {
                caricaTrattamenti(cliente_id);
                form.reset();
                showMessage('Trattamento aggiunto con successo!', 'success'); // Messaggio di successo
            })
            .catch(err => {
                if (err.message !== "Reindirizzamento handled") {
                    console.error("Errore aggiunta trattamento:", err);
                    showMessage('Errore durante l\'aggiunta del trattamento.', 'error');
                }
            });
    });
}

// Eliminazione cliente
const btnElimina = document.getElementById("btnEliminaCliente");
if (btnElimina) {
    btnElimina.addEventListener("click", () => {
        if (!clienteId) return;

        const conferma = confirm("Sei sicuro di voler eliminare questo cliente? L'azione è irreversibile.");
        if (!conferma) return;

        fetch(`/api/clienti/${clienteId}`, {
                method: "DELETE"
            })
            .then(async res => { // Aggiunto async qui
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore eliminazione cliente: ${errorDetails}`);
                }
                return data; // res.text() se la risposta è solo testo
            })
            .then(() => {
                showMessage("Cliente eliminato con successo", 'success');
                setTimeout(() => { // Dai tempo all'utente di leggere il messaggio
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

// Modifica cliente
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
            .then(async res => { // Aggiunto async qui
                const data = await handleApiResponse(res);
                if (data === null) {
                    throw new Error("Reindirizzamento handled");
                }
                if (!res.ok) {
                    const errorDetails = data.error || "Errore sconosciuto";
                    throw new Error(`Errore aggiornamento cliente: ${errorDetails}`);
                }
                return data; // res.text() se la risposta è solo testo
            })
            .then(() => {
                showMessage("Cliente aggiornato con successo", 'success');
                setTimeout(() => { // Dai tempo all'utente di leggere il messaggio
                    window.location.reload();
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


document.getElementById("btnPrecedente").addEventListener("click", () => cambiaCliente(-1));
document.getElementById("btnSuccessivo").addEventListener("click", () => cambiaCliente(1));

function cambiaCliente(direzione) {
    const lista = JSON.parse(localStorage.getItem("risultatiRicercaClienti")) || [];
    let indice = parseInt(localStorage.getItem("indiceClienteCorrente") || "0");

    indice += direzione;

    if (indice >= 0 && indice < lista.length) {
        localStorage.setItem("indiceClienteCorrente", indice.toString());
        window.location.href = `/scheda-cliente.html?id=${lista[indice]}`;
    }
}
