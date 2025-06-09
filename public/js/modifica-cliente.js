document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-modifica-cliente");
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  if (!clienteId) {
    alert("ID cliente mancante.");
    window.location.href = "/dashboard.html";
    return;
  }

  // Precarica i dati del cliente
  fetch(`/api/clienti/${clienteId}`)
    .then(res => {
      if (!res.ok) throw new Error("Errore nel caricamento del cliente");
      return res.json();
    })
    .then(cliente => {
      document.getElementById("modifica-nome").value = cliente.nome || "";
      document.getElementById("modifica-cognome").value = cliente.cognome || "";
      document.getElementById("modifica-email").value = cliente.email || "";
      document.getElementById("modifica-telefono").value = cliente.telefono || "";
    })
    .catch(err => {
      console.error(err);
      alert("Errore durante il caricamento del cliente");
    });

  // Gestione salvataggio modifiche
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nome = document.getElementById("modifica-nome").value;
    const cognome = document.getElementById("modifica-cognome").value;
    const email = document.getElementById("modifica-email").value;
    const telefono = document.getElementById("modifica-telefono").value;

    fetch(`/api/clienti/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cognome, email, telefono })
    })
      .then(res => {
        if (!res.ok) throw new Error("Errore durante il salvataggio");
        return res.text();
      })
      .then(() => {
        alert("Modifiche salvate con successo");
        window.location.href = `/scheda-cliente.html?id=${clienteId}`;
      })
      .catch(err => {
        console.error(err);
        alert("Errore durante il salvataggio delle modifiche");
      });
  });
});
