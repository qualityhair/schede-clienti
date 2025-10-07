document.addEventListener('DOMContentLoaded', () => {
    // --- RIFERIMENTI DOM ---
    const form = document.getElementById('prodotto-form');
    const formTitle = document.getElementById('form-title');
    const prodottoIdInput = document.getElementById('prodotto-id');
    const prodottoNomeInput = document.getElementById('prodotto-nome');
    const prodottoPrezzoInput = document.getElementById('prodotto-prezzo');
    const prodottoCategoriaInput = document.getElementById('prodotto-categoria');
    const prodottoQuantitaInput = document.getElementById('prodotto-quantita');
    const annullaModificaBtn = document.getElementById('annulla-modifica-btn');
    const listaProdottiBody = document.getElementById('lista-prodotti');
    const mostraDisattivatiBtn = document.getElementById('mostra-disattivati-btn');

    let tuttiProdotti = [];
    let visualizzazioneCorrente = 'attivi';

    // --- FUNZIONI PRINCIPALI ---

    // Carica e visualizza tutti i prodotti ATTIVI
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

    // "Disegna" la tabella dei prodotti ATTIVI
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

    // Funzione per mostrare i prodotti DISATTIVATI
    async function mostraProdottiDisattivati() {
        try {
            const response = await fetch('/api/prodotti/disattivati');
            if (!response.ok) throw new Error('Errore nel caricamento dei prodotti disattivati.');
            const prodottiDisattivati = await response.json();
            
            // Modifica l'interfaccia per mostrare i disattivati
            document.querySelector('.panel-title').textContent = 'Prodotti Eliminati (Nascosti)';
            mostraDisattivatiBtn.textContent = '↩️ Torna ai Prodotti Attivi';
            
            renderListaProdottiDisattivati(prodottiDisattivati);
            visualizzazioneCorrente = 'disattivati';
            
        } catch (error) {
            console.error(error);
            alert('Errore nel caricamento dei prodotti eliminati.');
        }
    }

    // Funzione per tornare ai prodotti ATTIVI
    function mostraProdottiAttivi() {
        document.querySelector('.panel-title').textContent = 'Prodotti Attualmente in Catalogo';
        mostraDisattivatiBtn.textContent = '📁 Prodotti Eliminati';
        
        caricaProdotti(); // Ricarica i prodotti attivi
        visualizzazioneCorrente = 'attivi';
    }

    // Funzione per renderizzare i prodotti DISATTIVATI
    // Funzione per renderizzare i prodotti DISATTIVATI
function renderListaProdottiDisattivati(prodottiDisattivati) {
    listaProdottiBody.innerHTML = '';
    
    if (prodottiDisattivati.length === 0) {
        listaProdottiBody.innerHTML = `<tr><td colspan="5" class="text-center">Nessun prodotto eliminato.</td></tr>`;
        return;
    }
    
    prodottiDisattivati.forEach(prodotto => {
        const row = document.createElement('tr');
        row.style.opacity = '0.7'; // Rende visivamente "spenti" i prodotti disattivati
        row.innerHTML = `
            <td>${prodotto.nome}</td>
            <td>${prodotto.categoria || 'N/A'}</td>
            <td>€ ${parseFloat(prodotto.prezzo_vendita).toFixed(2)}</td>
            <td>${prodotto.quantita}</td>
            <td>
                <button class="btn btn-sm btn-success btn-riattiva" data-id="${prodotto.id}">Riattiva</button>
                <button class="btn btn-sm btn-danger btn-elimina-definitivo" data-id="${prodotto.id}">Elimina Definitivamente</button>
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
            categoria: prodottoCategoriaInput.value.trim(),
            quantita: parseInt(prodottoQuantitaInput.value) || 0
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
            
            // Ricarica la vista appropriata dopo il salvataggio
            if (visualizzazioneCorrente === 'disattivati') {
                await mostraProdottiDisattivati();
            } else {
                await caricaProdotti();
            }
            
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
        prodottoQuantitaInput.value = prodotto.quantita || 0;
        annullaModificaBtn.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }

    // Disattiva un prodotto
    async function eliminaProdotto(id) {
        if (!confirm('Sei sicuro di voler eliminare questo prodotto? Verrà solo nascosto, non cancellato definitivamente.')) return;
        
        try {
            const response = await fetch(`/api/prodotti/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Eliminazione fallita.');
            
            // Ricarica la vista appropriata
            if (visualizzazioneCorrente === 'disattivati') {
                await mostraProdottiDisattivati();
            } else {
                await caricaProdotti();
            }
            
        } catch (error) {
            console.error(error);
            alert('Errore durante l\'eliminazione.');
        }
    }

    // Riattiva un prodotto disattivato
    async function riattivaProdotto(id) {
        if (!confirm('Sei sicuro di voler riattivare questo prodotto?')) return;
        
        try {
            const response = await fetch(`/api/prodotti/${id}/riattiva`, { 
                method: 'PATCH' 
            });
            
            if (!response.ok) throw new Error('Riattivazione fallita.');
            
            alert('Prodotto riattivato con successo!');
            
            // Ricarica la vista appropriata
            if (visualizzazioneCorrente === 'disattivati') {
                await mostraProdottiDisattivati();
            } else {
                await caricaProdotti();
            }
            
        } catch (error) {
            console.error(error);
            alert('Errore durante la riattivazione.');
        }
    }
	
	// Elimina DEFINITIVAMENTE un prodotto disattivato
async function eliminaDefinitivamente(id) {
    if (!confirm('⚠️ ATENZIONE: Stai per eliminare DEFINITIVAMENTE questo prodotto!\n\nQuesta azione non può essere annullata. Il prodotto verrà rimosso permanentemente dal database.\n\nSei assolutamente sicuro?')) return;
    
    try {
        const response = await fetch(`/api/prodotti/${id}/definitivo`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) throw new Error('Eliminazione definitiva fallita.');
        
        alert('Prodotto eliminato definitivamente con successo!');
        
        // Ricarica la vista dei prodotti disattivati
        await mostraProdottiDisattivati();
        
    } catch (error) {
        console.error(error);
        alert('Errore durante l\'eliminazione definitiva.');
    }
}
	
	
    
    // Resetta il form allo stato iniziale
    function resetForm() {
        form.reset();
        prodottoIdInput.value = '';
        formTitle.textContent = 'Aggiungi Nuovo Prodotto';
        annullaModificaBtn.style.display = 'none';
        prodottoQuantitaInput.value = '0';
    }

    // --- EVENT LISTENERS ---
    form.addEventListener('submit', handleFormSubmit);
    annullaModificaBtn.addEventListener('click', resetForm);
    mostraDisattivatiBtn.addEventListener('click', () => {
        if (visualizzazioneCorrente === 'attivi') {
            mostraProdottiDisattivati();
        } else {
            mostraProdottiAttivi();
        }
    });

    // Usa la delegazione di eventi per i pulsanti modifica/elimina/riattiva
    // Usa la delegazione di eventi per i pulsanti modifica/elimina/riattiva
listaProdottiBody.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
        const id = target.dataset.id;
        if (target.classList.contains('btn-edit')) {
            preparaModifica(id);
        } else if (target.classList.contains('btn-delete')) {
            eliminaProdotto(id);
        } else if (target.classList.contains('btn-riattiva')) {
            riattivaProdotto(id);
        } else if (target.classList.contains('btn-elimina-definitivo')) {
            eliminaDefinitivamente(id);
        }
    }
});
	
	
	

    // --- AVVIO ---
    caricaProdotti();
});