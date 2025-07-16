document.addEventListener("DOMContentLoaded", () => {
  const clienteForm = document.getElementById("clienteForm");
  const trattamentoForm = document.getElementById("trattamentoForm");
  const clientiList = document.getElementById("clientiList");
  const searchInput = document.getElementById("searchInput");

  if (clienteForm) {
    clienteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(clienteForm);
      const data = Object.fromEntries(formData.entries());
      await fetch("/api/clienti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("Cliente salvato!");
      clienteForm.reset();
    });
  }

  if (trattamentoForm) {
    trattamentoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(trattamentoForm);
      const data = Object.fromEntries(formData.entries());
      await fetch("/api/trattamenti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("Trattamento salvato!");
      trattamentoForm.reset();
    });
  }

  if (clientiList && searchInput) {
    const caricaClienti = async () => {
      const res = await fetch("/api/clienti");
      const clienti = await res.json();
      clientiList.innerHTML = "";
      clienti.forEach(c => {
        const li = document.createElement("li");
        li.textContent = `${c.nome} ${c.cognome} - ${c.email}`;
        clientiList.appendChild(li);
      });
    };

    searchInput.addEventListener("input", () => {
      const valore = searchInput.value.toLowerCase();
      const clienti = clientiList.querySelectorAll("li");
      clienti.forEach(li => {
        li.style.display = li.textContent.toLowerCase().includes(valore) ? "" : "none";
      });
    });

    caricaClienti();
  }
});
