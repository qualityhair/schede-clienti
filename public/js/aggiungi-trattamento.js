document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-trattamento");
  const params = new URLSearchParams(window.location.search);
  const clienteId = params.get("id");

  if (!clienteId) {
    alert("ID cliente mancante.");
    window.location.href = "/dashboard.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipo = form.tipo_trattamento.value;
    const descrizione = form.descrizione.value;
    const data = form.data_trattamento.value;
    const note = form.note.value;

    const trattamento = {
      cliente_id: clienteId,
      tipo_trattamento: tipo,
      descrizione: descrizione,
      data_trattamento: data,
      note: note
    };

    fetch(`/api/trattamenti`, { // attenzione: POST è su /api/trattamenti e non /api/clienti/:id/trattamenti
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trattamento)
    })
      .then(res => {
        if (!res.ok) throw new Error("Errore durante il salvataggio");
        return res.text(); // il server risponde con "Trattamento aggiunto" come stringa
      })
      .then(() => {
        alert("Trattamento aggiunto con successo");
        window.location.href = `/scheda-cliente.html?id=${clienteId}`;
      })
      .catch(err => {
        console.error(err);
        alert("Errore durante l'aggiunta del trattamento");
      });
  });
});
