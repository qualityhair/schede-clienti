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
            const item = document.createElement('a');
            item.className = 'catalog-photo-item';
            item.href = `/scheda-cliente.html?id=${photo.cliente.id}`;
            
            const img = document.createElement('img');
            img.src = photo.url;
            img.alt = photo.didascalia || 'Foto Lavoro';

            const overlay = document.createElement('div');
            overlay.className = 'photo-overlay';
            const clienteNome = document.createElement('h4');
            clienteNome.textContent = `${photo.cliente.nome} ${photo.cliente.cognome}`;
            
            const displayTags = (photo.tags || []).filter(t => t !== '_trico');
            const photoTags = document.createElement('p');
            photoTags.textContent = displayTags.join(', ');

            overlay.appendChild(clienteNome);
            overlay.appendChild(photoTags);
            item.appendChild(img);
            item.appendChild(overlay);
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

        // --- NUOVA LOGICA PER IL TITOLO DINAMICO ---
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
        // --- FINE NUOVA LOGICA ---


        // 1. Filtra i dati in memoria, non il DOM
        const filteredPhotos = allPhotosData.filter(photo => {
            const tags = photo.tags || [];
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
            if (tagFilter && !displayTags.some(tag => tag.toLowerCase().startsWith(tagFilter))) return false;

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

    // --- AVVIO ---
    loadAllPhotos();
});