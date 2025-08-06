document.addEventListener('DOMContentLoaded', () => {

    // --- RIFERIMENTI AGLI ELEMENTI DOM ---
    const grid = document.getElementById('photo-catalog-grid');
    const clienteFilterInput = document.getElementById('filter-cliente');
    const tagFilterInput = document.getElementById('filter-tag');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    let allPhotos = []; // Conterrà tutte le foto caricate, per non ricaricarle ogni volta

    // --- FUNZIONI ---

    /**
     * Crea l'HTML per una singola foto nella griglia.
     */
    function createPhotoElement(photo) {
        const item = document.createElement('a'); // Usiamo un link per andare alla scheda cliente
        item.className = 'catalog-photo-item';
        item.href = `/scheda-cliente.html?id=${photo.cliente.id}`;
        
        // Aggiungiamo attributi dati per il filtraggio
        item.dataset.clienteNome = `${photo.cliente.nome} ${photo.cliente.cognome}`.toLowerCase();
        item.dataset.tags = (photo.tags || []).join(',').toLowerCase();

        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.didascalia || 'Foto Lavoro';

        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';

        const clienteNome = document.createElement('h4');
        clienteNome.textContent = `${photo.cliente.nome} ${photo.cliente.cognome}`;
        
        const photoTags = document.createElement('p');
        photoTags.textContent = (photo.tags || []).join(', ');

        overlay.appendChild(clienteNome);
        overlay.appendChild(photoTags);
        item.appendChild(img);
        item.appendChild(overlay);

        return item;
    }

    /**
     * Applica i filtri correnti a tutte le foto nella griglia.
     */
    function applyFilters() {
        const clienteFilter = clienteFilterInput.value.toLowerCase();
        const tagFilter = tagFilterInput.value.toLowerCase();

        grid.querySelectorAll('.catalog-photo-item').forEach(item => {
            // --- LOGICA DI FILTRAGGIO CORRETTA ---

            // 1. Controlla il cliente (la ricerca parziale qui va bene)
            const matchesCliente = item.dataset.clienteNome.includes(clienteFilter);

            // 2. Controlla i tag in modo preciso
            let matchesTag = true; // Di default, il tag corrisponde
            if (tagFilter) { // Se è stato inserito un filtro per tag...
                const photoTagsArray = item.dataset.tags.split(',');
                // ...controlliamo che ALMENO UNO dei tag della foto INIZI con il testo del filtro
                matchesTag = photoTagsArray.some(tag => tag.trim().startsWith(tagFilter));
            }
            // ------------------------------------

            // La foto è visibile solo se corrisponde a ENTRAMBI i filtri
            if (matchesCliente && matchesTag) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }


    /**
     * Funzione principale: carica tutte le foto dal server e le mostra.
     */
    async function loadAllPhotos() {
        grid.innerHTML = '<p>Caricamento catalogo in corso...</p>';
        try {
            const response = await fetch('/api/photos/all');
            if (!response.ok) throw new Error('Errore di rete');

            allPhotos = await response.json();
            grid.innerHTML = '';

            if (allPhotos.length === 0) {
                grid.innerHTML = '<p>Nessuna foto trovata nel catalogo.</p>';
                return;
            }

            allPhotos.forEach(photo => {
                const photoElement = createPhotoElement(photo);
                grid.appendChild(photoElement);
            });

        } catch (error) {
            console.error("Errore nel caricamento del catalogo:", error);
            grid.innerHTML = '<p class="error-message">Impossibile caricare il catalogo.</p>';
        }
    }


    // --- EVENT LISTENERS ---

    // Applica i filtri ogni volta che l'utente scrive nei campi di input
    clienteFilterInput.addEventListener('input', applyFilters);
    tagFilterInput.addEventListener('input', applyFilters);

    // Resetta i filtri e mostra di nuovo tutte le foto
    resetFiltersBtn.addEventListener('click', () => {
        clienteFilterInput.value = '';
        tagFilterInput.value = '';
        applyFilters();
    });

    // --- AVVIO ---
    loadAllPhotos();

});