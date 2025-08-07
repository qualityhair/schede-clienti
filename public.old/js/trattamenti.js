const params = new URLSearchParams(window.location.search);
const clienteId = params.get("cliente_id");

const container = document.getElementById("trattamenti-container");
const form = document.getElementById("trattamento-form");

function caricaTrattamenti() {
  fetch(`/api/clienti/${clienteId}/trattamenti`)
    .then(res => res.json())
    .then(renderTrattamenti);
}

function renderTrattamenti(trattamenti) {
  container.innerHTML = "";

  trattamenti.forEach(trattamento => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <strong>${trattamento.tipo_trattamento}</strong>
      <p>${trattamento.descrizione}</p>
      <p>Data: ${new Date(trattamento.data_trattamento).toISOString().split("T")[0]}</p>
      <p>Note: ${trattamento.note || "-"}</p>
      <button onclick="modifica(${trattamento.id}, '${trattamento.tipo_trattamento}', '${trattamento.descrizione}', '${trattamento.data_trattamento}', \`${trattamento.note || ""}\`)">Modifica</button>
    `;
    container.appendChild(div);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = form.dataset.editing;
  const tipo_trattamento = form.tipo_trattamento.value;
  const descrizione = form.descrizione.value;
  const data_trattamento = form.data_trattamento.value;
  const note = form.note.value;

  const payload = { tipo_trattamento, descrizione, data_trattamento, note };

  if (id) {
    fetch(`/api/trattamenti/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.text())
      .then(() => {
        form.reset();
        delete form.dataset.editing;
        caricaTrattamenti();
      });
  } else {
    fetch("/api/trattamenti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, cliente_id: clienteId })
    })
      .then(res => res.text())
      .then(() => {
        form.reset();
        caricaTrattamenti();
      });
  }
});

function modifica(id, tipo, descrizione, data, note) {
  form.dataset.editing = id;
  form.tipo_trattamento.value = tipo;
  form.descrizione.value = descrizione;
  form.data_trattamento.value = new Date(data).toISOString().split("T")[0];
  form.note.value = note;
}

caricaTrattamenti();
