document.addEventListener('DOMContentLoaded', async () => {
    // Stato dell'applicazione
    let allClienti = [];
    let filteredClienti = [];
    let currentPage = 1;
    let itemsPerPage = 10;

    // Riferimenti DOM
    const listaContainer = document.getElementById('lista-clienti');
    const totaleSpan = document.getElementById('totale-clienti');
    const btnPrev = document.getElementById('btnPrecedente');
    const btnNext = document.getElementById('btnSuccessivo');
    const pageInfo = document.getElementById('info-paginazione');
    const itemsPerPageSelect = document.getElementById('items-per-page');
    const searchInput = document.getElementById('search-input');

    // Funzione principale per caricare i dati
    async function init() {
        try {
            const response = await fetch('/api/clienti');
            allClienti = await response.json();
            allClienti.sort((a, b) => a.cognome.localeCompare(b.cognome)); // Ordina per cognome
            filteredClienti = [...allClienti];
            updateView();
        } catch (error) {
            console.error('Errore nel caricamento dei clienti:', error);
            listaContainer.innerHTML = '<div class="client-list-item">Errore nel caricamento dei dati.</div>';
        }
    }

    // Funzione per aggiornare la vista (lista e paginazione)
    function updateView() {
        renderClientList();
        renderPagination();
    }

    // Funzione per "disegnare" la lista dei clienti
    function renderClientList() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const clientiDaMostrare = filteredClienti.slice(start, end);

        listaContainer.innerHTML = '';
        if (clientiDaMostrare.length === 0) {
            listaContainer.innerHTML = '<div class="client-list-item">Nessun cliente trovato.</div>';
            return;
        }

        clientiDaMostrare.forEach(cliente => {
            const item = document.createElement('div');
            item.className = 'client-list-item';

            const nomeFormattato = capitalizeWords(cliente.nome);
            const cognomeFormattato = capitalizeWords(cliente.cognome);

            const tagsHtml = (cliente.tags && cliente.tags.length > 0)
                ? cliente.tags.map(tag => `<span class="client-tag">${tag}</span>`).join('')
                : '';

            item.innerHTML = `
                <div class="client-info">
                    <h4>${cognomeFormattato} ${nomeFormattato}</h4>
                    <p>${cliente.email || ''} ${cliente.email && cliente.telefono ? '|' : ''} ${cliente.telefono || ''}</p>
                </div>
                <div class="client-item-tags">${tagsHtml}</div>
                <div class="client-item-actions">
                    <button class="btn btn-primary" data-id="${cliente.id}">Dettagli</button>
                    <button class="btn btn-danger" data-id="${cliente.id}">Elimina</button>
                </div>
            `;
            listaContainer.appendChild(item);
        });
    }

    // Funzione per aggiornare i controlli di paginazione
    function renderPagination() {
        const totalPages = Math.ceil(filteredClienti.length / itemsPerPage);
        totaleSpan.textContent = `(${filteredClienti.length})`;
        pageInfo.textContent = `Pagina ${currentPage} di ${totalPages || 1}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage >= totalPages;
    }

    // Funzione per filtrare i clienti in base alla ricerca
    function filterClienti() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
            filteredClienti = [...allClienti];
        } else {
            filteredClienti = allClienti.filter(c => {
                const fullName = `${c.nome} ${c.cognome}`.toLowerCase();
                const tagsString = (c.tags || []).join(' ').toLowerCase();
                return fullName.includes(searchTerm) || tagsString.includes(searchTerm);
            });
        }
        currentPage = 1; // Resetta la pagina alla prima
        updateView();
    }

    // Funzioni di utilità
    function capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    
    // Gestione dei click (usando event delegation)
    listaContainer.addEventListener('click', e => {
        const target = e.target;
        if (target.tagName === 'BUTTON') {
            const id = target.dataset.id;
            if (target.classList.contains('btn-primary')) {
                window.location.href = `/scheda-cliente.html?id=${id}`;
            } else if (target.classList.contains('btn-danger')) {
                if (confirm('Sei sicuro di voler eliminare questo cliente? L\'azione è irreversibile.')) {
                    fetch(`/api/clienti/${id}`, { method: 'DELETE' })
                        .then(res => {
                            if (res.ok) {
                                init(); // Ricarica tutti i dati
                            } else {
                                alert('Errore durante l\'eliminazione.');
                            }
                        });
                }
            }
        }
    });

    // Event listeners per i controlli
    itemsPerPageSelect.addEventListener('change', e => {
        itemsPerPage = parseInt(e.target.value, 10);
        currentPage = 1;
        updateView();
    });

    searchInput.addEventListener('input', filterClienti);
    btnNext.addEventListener('click', () => { currentPage++; updateView(); });
    btnPrev.addEventListener('click', () => { currentPage--; updateView(); });
    
    // Avvio
    init();
});