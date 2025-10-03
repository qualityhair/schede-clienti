document.addEventListener('DOMContentLoaded', () => {
    // --- RIFERIMENTI DOM ---
    const form = document.getElementById('prodotto-form');
    const formTitle = document.getElementById('form-title');
    const prodottoIdInput = document.getElementById('prodotto-id');
    const prodottoNomeInput = document.getElementById('prodotto-nome');
    const prodottoPrezzoInput = document.getElementById('prodotto-prezzo');
    const prodottoCategoriaInput = document.getElementById('prodotto-categoria');
    const prodottoQuantitaInput = document.getElementById('prodotto-quantita'); // NUOVO
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
            listaProdottiBody.innerHTML = `<tr><td colspan="5" class="text-center">Impossibile caricare i prodotti.</td></tr>`;
        }
    }

    // "Disegna" la tabella dei prodotti - AGGIUNGI COLONNA QUANTITÀ
    function renderListaProdotti() {
        listaProdottiBody.innerHTML = '';
        if (tuttiProdotti.length === 0) {
            listaProdottiBody.innerHTML = `<tr><td colspan="5" class="text-center">Nessun prodotto in catalogo.</td></tr>`;
            return;
        }
        tuttiProdotti.forEach(prodotto => {
            const row = document.createElement('tr');
            
            // Aggiungi logica colore per scorte basse
            const quantitaCellClass = prodotto.quantita < 2 ? 'scorta-bassa' : '';
            const quantitaWarning = prodotto.quantita < 2 ? ' ⚠️' : '';
            
            row.innerHTML = `
                <td>${prodotto.nome}</td>
                <td>${prodotto.categoria || 'N/A'}</td>
                <td>€ ${parseFloat(prodotto.prezzo_vendita).toFixed(2)}</td>
                <td class="${quantitaCellClass}">${prodotto.quantita}${quantitaWarning}</td>
                <td>
                    <button class="btn btn-sm btn-secondary btn-edit" data-id="${prodotto.id}">Modifica</button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${prodotto.id}">Elimina</button>
                </td>
            `;
            listaProdottiBody.appendChild(row);
        });
    }

    // Gestisce il salvataggio (creazione o modifica) - AGGIUNGI QUANTITÀ
    async function handleFormSubmit(event) {
        event.preventDefault();
        const id = prodottoIdInput.value;
        const isModifica = !!id;

        const prodottoData = {
            nome: prodottoNomeInput.value.trim(),
            prezzo_vendita: parseFloat(prodottoPrezzoInput.value) || 0,
            categoria: prodottoCategoriaInput.value.trim(),
            quantita: parseInt(prodottoQuantitaInput.value) || 0 // NUOVO CAMPO
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
    
    // Prepara il form per la modifica di un prodotto - AGGIUNGI QUANTITÀ
    function preparaModifica(id) {
        const prodotto = tuttiProdotti.find(p => p.id == id);
        if (!prodotto) return;

        formTitle.textContent = 'Modifica Prodotto';
        prodottoIdInput.value = prodotto.id;
        prodottoNomeInput.value = prodotto.nome;
        prodottoPrezzoInput.value = prodotto.prezzo_vendita;
        prodottoCategoriaInput.value = prodotto.categoria || '';
        prodottoQuantitaInput.value = prodotto.quantita || 0; // NUOVO
        annullaModificaBtn.style.display = 'inline-block';
        window.scrollTo(0, 0);
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
        prodottoQuantitaInput.value = '0'; // NUOVO
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