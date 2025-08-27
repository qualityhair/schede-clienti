document.addEventListener('DOMContentLoaded', () => {
    // --- RIFERIMENTI DOM ---
    const form = document.getElementById('prodotto-form');
    const formTitle = document.getElementById('form-title');
    const prodottoIdInput = document.getElementById('prodotto-id');
    const prodottoNomeInput = document.getElementById('prodotto-nome');
    const prodottoPrezzoInput = document.getElementById('prodotto-prezzo');
    const prodottoCategoriaInput = document.getElementById('prodotto-categoria');
    const annullaModificaBtn = document.getElementById('annulla-modifica-btn');
    const listaProdottiBody = document.getElementById('lista-prodotti');

    let tuttiProdotti = [];

    // --- FUNZIONI ---

    // Carica e visualizza tutti i prodotti
    async function caricaProdotti() {
        try {
            const response = await fetch('/api/prodotti');
            if (!response.ok) throw new Error('Errore nel caricamento dei prodotti.');
            tuttiProdotti = await response.json();
            renderListaProdotti();
        } catch (error) {
            console.error(error);
            listaProdottiBody.innerHTML = `<tr><td colspan="4" class="text-center">Impossibile caricare i prodotti.</td></tr>`;
        }
    }

    // "Disegna" la tabella dei prodotti
    function renderListaProdotti() {
        listaProdottiBody.innerHTML = '';
        if (tuttiProdotti.length === 0) {
            listaProdottiBody.innerHTML = `<tr><td colspan="4" class="text-center">Nessun prodotto in catalogo.</td></tr>`;
            return;
        }
        tuttiProdotti.forEach(prodotto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prodotto.nome}</td>
                <td>${prodotto.categoria || 'N/A'}</td>
                <td>€ ${parseFloat(prodotto.prezzo_vendita).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-secondary btn-edit" data-id="${prodotto.id}">Modifica</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${prodotto.id}">Elimina</button>
                </td>
            `;
            listaProdottiBody.appendChild(row);
        });
    }

    // Gestisce il salvataggio (creazione o modifica)
    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = prodottoIdInput.value;
        const isModifica = !!id;

        const prodottoData = {
            nome: prodottoNomeInput.value.trim(),
            prezzo_vendita: parseFloat(prodottoPrezzoInput.value) || 0,
            categoria: prodottoCategoriaInput.value.trim()
        };

        if (!prodottoData.nome) {
            alert('Il nome del prodotto è obbligatorio.');
            return;
        }

        try {
            const url = isModifica ? `/api/prodotti/${id}` : '/api/prodotti';
            const method = isModifica ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prodottoData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Salvataggio fallito.');
            }
            
            resetForm();
            await caricaProdotti(); // Ricarica la lista aggiornata
            
        } catch (error) {
            console.error(error);
            alert(`Errore: ${error.message}`);
        }
    }
    
    // Prepara il form per la modifica di un prodotto
    function preparaModifica(id) {
        const prodotto = tuttiProdotti.find(p => p.id == id);
        if (!prodotto) return;

        formTitle.textContent = 'Modifica Prodotto';
        prodottoIdInput.value = prodotto.id;
        prodottoNomeInput.value = prodotto.nome;
        prodottoPrezzoInput.value = prodotto.prezzo_vendita;
        prodottoCategoriaInput.value = prodotto.categoria || '';
        annullaModificaBtn.style.display = 'inline-block';
        window.scrollTo(0, 0); // Scorre la pagina in cima per vedere il form
    }

    // Disattiva un prodotto
    async function eliminaProdotto(id) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto? Verrà solo nascosto, non cancellato definitivamente.')) return;
        
        try {
            const response = await fetch(`/api/prodotti/${id}`, { method: 'DELETE' });
             if (!response.ok) throw new Error('Eliminazione fallita.');
            await caricaProdotti();
        } catch (error) {
             console.error(error);
             alert('Errore durante l\'eliminazione.');
        }
    }
    
    // Resetta il form allo stato iniziale
    function resetForm() {
        form.reset();
        prodottoIdInput.value = '';
        formTitle.textContent = 'Aggiungi Nuovo Prodotto';
        annullaModificaBtn.style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    form.addEventListener('submit', handleFormSubmit);
    annullaModificaBtn.addEventListener('click', resetForm);

    // Usa la delegazione di eventi per i pulsanti modifica/elimina
    listaProdottiBody.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            const id = target.dataset.id;
            if (target.classList.contains('btn-edit')) {
                preparaModifica(id);
            } else if (target.classList.contains('btn-delete')) {
                eliminaProdotto(id);
            }
        }
    });

    // --- AVVIO ---
    caricaProdotti();
});