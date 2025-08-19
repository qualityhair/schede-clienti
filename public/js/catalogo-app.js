document.addEventListener('DOMContentLoaded', () => {

    // --- RIFERIMENTI AGLI ELEMENTI DOM ---
    const grid = document.getElementById('photo-catalog-grid');
    const clienteFilterInput = document.getElementById('filter-cliente');
    const tagFilterInput = document.getElementById('filter-tag');
    const didascaliaFilterInput = document.getElementById('filter-didascalia');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const categoryFilterBtns = document.querySelectorAll('.btn-filter');
	const filterResultsTitle = document.getElementById('filter-results-title');

    let allPhotosData = []; // Conterrà i dati originali dal server
    let activeCategory = 'style'; // Categoria attiva di default

    // --- FUNZIONI ---

    /**
     * Prende i dati di tutte le foto e popola la griglia con gli elementi HTML
     */
    function renderGrid(photosToRender) {
    grid.innerHTML = ''; // Pulisce la griglia
    if (photosToRender.length === 0) {
        grid.innerHTML = '<p>Nessuna foto trovata con i filtri attuali.</p>';
        return;
    }

    photosToRender.forEach(photo => {
        // --- MODIFICA CHIAVE: L'ELEMENTO ORA È UN DIV, NON UN LINK <a> ---
        const item = document.createElement('div');
        item.className = 'catalog-photo-item';
        
        // Salviamo i dati necessari direttamente sull'elemento
        item.dataset.imageUrl = photo.url;
        item.dataset.clienteId = photo.cliente.id;
        item.dataset.didascalia = photo.didascalia || `Lavoro su ${photo.cliente.nome} ${photo.cliente.cognome}`;

        item.innerHTML = `
            <img src="${photo.url}" alt="${photo.didascalia || 'Foto Lavoro'}">
            <div class="photo-overlay">
                <h4>${photo.cliente.nome} ${photo.cliente.cognome}</h4>
                <p>${(photo.tags || []).filter(t => t !== '_trico').join(', ')}</p>
            </div>
        `;
        
        // --- L'EVENT LISTENER ORA APRE LA MODALE ---
        item.addEventListener('click', () => {
            const modal = document.getElementById('catalogViewPhotoModal');
            const fullPhoto = document.getElementById('catalog-fullscreen-photo');
            const didascaliaP = document.getElementById('catalog-photo-didascalia');
            const clientBtn = document.getElementById('goto-client-btn');

            // Popola la modale con i dati salvati
            fullPhoto.src = item.dataset.imageUrl;
            didascaliaP.textContent = item.dataset.didascalia;
            clientBtn.href = `/scheda-cliente.html?id=${item.dataset.clienteId}`;
            
            // Apri la modale (usando la funzione openModal che hai già in scheda-cliente.js,
            // che dovresti rendere globale o duplicare qui se necessario)
            modal.classList.add('open');
        });

        grid.appendChild(item);
    });
}

    
    /**
 * Applica i filtri ai dati originali e chiama renderGrid per aggiornare la vista
 */
function applyFilters() {
    const clienteFilter = clienteFilterInput.value.toLowerCase();
    const tagFilter = tagFilterInput.value.toLowerCase();
    const didascaliaFilter = didascaliaFilterInput.value.toLowerCase();

    // --- LOGICA PER IL TITOLO DINAMICO (invariata) ---
    let titleParts = [];
    if (clienteFilter) {
        titleParts.push(`cliente: "${clienteFilter}"`);
    }
    if (tagFilter) {
        titleParts.push(`tag: "${tagFilter}"`);
    }
    if (didascaliaFilter) {
        titleParts.push(`descrizione: "${didascaliaFilter}"`);
    }

    if (titleParts.length > 0) {
        filterResultsTitle.textContent = `Risultati per ${titleParts.join(' & ')}`;
    } else {
        filterResultsTitle.textContent = '';
    }
    // --- FINE LOGICA TITOLO ---


    // 1. Filtra i dati in memoria, non il DOM
    const filteredPhotos = allPhotosData.filter(photo => {
        // Mettiamo subito tutti i tag in minuscolo per confronti più semplici
        const tags = (photo.tags || []).map(t => t.toLowerCase());
        
        // --- LOGICA DI FILTRAGGIO CORRETTA PER LE FOTO PROFILO ---
        const haTagProfilo = tags.includes('profilo');
        const utenteStaCercandoUnTag = tagFilter.length > 0;

        // Regola: Nascondi la foto se ha il tag 'profilo' E l'utente NON sta cercando un tag.
        if (haTagProfilo && !utenteStaCercandoUnTag) {
            return false;
        }
        // --- FINE LOGICA PROFILO ---

        const didascalia = (photo.didascalia || '').toLowerCase();
        const clienteNome = `${photo.cliente.nome} ${photo.cliente.cognome}`.toLowerCase();
        const displayTags = tags.filter(t => t !== '_trico');

        // Filtro Categoria
        if (activeCategory === 'trico' && !tags.includes('_trico')) return false;
        if (activeCategory === 'style' && tags.includes('_trico')) return false;

        // Filtro Cliente
        if (clienteFilter && !clienteNome.includes(clienteFilter)) return false;

        // Filtro Descrizione
        if (didascaliaFilter && !didascalia.includes(didascaliaFilter)) return false;
        
        // Filtro Tag
        if (tagFilter && !displayTags.some(tag => tag.startsWith(tagFilter))) return false;

        // Se ha superato tutti i controlli, la foto è valida
        return true;
    });

    // 2. Renderizza solo le foto filtrate
    renderGrid(filteredPhotos);
}

    /**
     * Funzione principale: carica tutte le foto dal server una sola volta.
     */
    async function loadAllPhotos() {
    grid.innerHTML = '<p>Caricamento catalogo in corso...</p>';
    try {
        const response = await fetch('/api/photos/all');
        if (!response.ok) throw new Error('Errore di rete');

        allPhotosData = await response.json(); // Salva i dati originali
        
        // --- NUOVA LOGICA: INIZIALIZZAZIONE MODALE ---
        initializePhotoModal(); // Chiama la funzione che imposta la modale
        
        applyFilters(); // Applica i filtri di default e renderizza

    } catch (error) {
        console.error("Errore nel caricamento del catalogo:", error);
        grid.innerHTML = '<p class="error-message">Impossibile caricare il catalogo.</p>';
    }
}

    // --- EVENT LISTENERS ---

    clienteFilterInput.addEventListener('input', applyFilters);
    tagFilterInput.addEventListener('input', applyFilters);
    didascaliaFilterInput.addEventListener('input', applyFilters);

    categoryFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCategory = btn.dataset.category;
            applyFilters();
        });
    });

    resetFiltersBtn.addEventListener('click', () => {
        clienteFilterInput.value = '';
        tagFilterInput.value = '';
        didascaliaFilterInput.value = '';
        
        categoryFilterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'style');
        });
        activeCategory = 'style';
        filterResultsTitle.textContent = '';
        applyFilters();
    });

// =========================================================================
// === AGGIUNGI QUESTO BLOCCO ALLA FINE DEL TUO catalogo-app.js ==========
// =========================================================================

/**
 * Inizializza gli eventi per la modale di visualizzazione foto.
 */
function initializePhotoModal() {
    const modal = document.getElementById('catalogViewPhotoModal');
    const closeBtn = document.getElementById('catalog-close-view-photo-btn');

    if (!modal || !closeBtn) return;

    // Funzione helper per chiudere la modale
    const closeModal = () => modal.classList.remove('open');

    // Eventi per chiudere la modale
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        // Chiude solo se si clicca sullo sfondo scuro, non sull'immagine o sui bottoni
        if (e.target === modal) {
            closeModal();
        }
    });
}


    // --- AVVIO ---
    loadAllPhotos();
});