document.getElementById("cerca-btn").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.trim();

  fetch(`/api/clienti/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        // Nessun cliente trovato
        document.getElementById("result").innerHTML = `
          <p>Cliente non trovato.</p>
          <button id="add-new-client">Aggiungi nuovo cliente</button>
        `;

        document.getElementById("add-new-client").addEventListener("click", () => {
          window.location.href = "/aggiungi-cliente.html"; // o apri un modal
        });

      } else {
        // Cliente trovato, reindirizza a scheda
        window.location.href = `/scheda-cliente.html?id=${data[0].id}`;
      }
    })
    .catch(err => {
      console.error("Errore nella ricerca:", err);
    });
});

