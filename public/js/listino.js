document.addEventListener("DOMContentLoaded", () => {

    const listinoContainer = document.getElementById('listino-prezzi-container');
    const stampaBtn = document.getElementById('stampa-listino-btn');

    // Funzione per caricare e visualizzare il listino
    async function fetchAndDisplayPriceList() {
        try {
            const response = await fetch('/price-list.json');
            const categorie = await response.json();
            
            listinoContainer.innerHTML = ''; // Pulisce il contenitore

            categorie.forEach(cat => {
                const categoriaDiv = document.createElement('div');
                categoriaDiv.className = 'categoria-listino';
                categoriaDiv.innerHTML = `<h3>${cat.categoria}</h3>`;
                
                const serviziList = document.createElement('ul');
                serviziList.className = 'servizi-list';
                
                cat.servizi.forEach(servizio => {
                    const servizioItem = document.createElement('li');
                    servizioItem.className = 'servizio-item';
                    servizioItem.innerHTML = `
                        <span class="nome-servizio">${servizio.nome}</span>
                        <span class="dettagli-servizio">€${servizio.prezzo} | ${servizio.durata}</span>
                    `;
                    serviziList.appendChild(servizioItem);
                });
                
                categoriaDiv.appendChild(serviziList);
                listinoContainer.appendChild(categoriaDiv);
            });

        } catch (error) {
            console.error("Errore nel caricamento del listino:", error);
            listinoContainer.innerHTML = '<p class="error">Impossibile caricare il listino prezzi.</p>';
        }
    }

    // Funzione per stampare la pagina
    function printPriceList() {
        window.print();
    }

    // Chiamata alle funzioni
    if (listinoContainer) {
        fetchAndDisplayPriceList();
    }

    if (stampaBtn) {
        stampaBtn.addEventListener('click', printPriceList);
    }

});