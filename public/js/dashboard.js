const btnCerca = document.getElementById("btnCerca");
if (btnCerca) {
  btnCerca.addEventListener("click", () => {
    const termine = prompt("Inserisci il nome o cognome del cliente:");
    if (!termine) return;

    fetch(`/api/clienti/cerca?term=${encodeURIComponent(termine)}`)
      .then(res => {
        if (!res.ok) throw new Error("Errore nella ricerca");
        return res.json();
      })
      .then(clienti => {
        if (clienti.length > 0) {
          const ids = clienti.map(c => c.id);
          localStorage.setItem("risultatiRicercaClienti", JSON.stringify(ids));
          localStorage.setItem("indiceClienteCorrente", "0");
          window.location.href = `/scheda-cliente.html?id=${ids[0]}`;
        } else {
          const conferma = confirm(`Cliente "${termine}" non trovato. Vuoi aggiungerlo?`);
          if (conferma) {
            const nome = prompt("Nome:");
            const cognome = prompt("Cognome:");
            const email = prompt("Email (opzionale):");
            const telefono = prompt("Telefono (opzionale):");

            const dataCliente = { nome, cognome, email, telefono };

            fetch("/api/clienti", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dataCliente)
            })
              .then(res => res.json())
              .then(data => {
                alert("Cliente aggiunto!");
                window.location.href = `/scheda-cliente.html?id=${data.id}`;
              })
              .catch(err => {
                console.error("Errore durante l'aggiunta:", err);
                alert("Errore durante l'inserimento");
              });
          }
        }
      })
      .catch(err => {
        console.error("Errore:", err);
        alert("Errore durante la ricerca");
      });
  });
}

const btnNuovo = document.getElementById("btnNuovoCliente");
if (btnNuovo) {
  btnNuovo.addEventListener("click", () => {
    const modal = document.getElementById("modal-nuovo-cliente");
    if (modal) modal.classList.remove("hidden");
  });
}

const annullaBtn = document.getElementById("annullaCliente");
if (annullaBtn) {
  annullaBtn.addEventListener("click", () => {
    const modal = document.getElementById("modal-nuovo-cliente");
    if (modal) modal.classList.add("hidden");
  });
}

const salvaBtn = document.getElementById("salvaCliente");
if (salvaBtn) {
  salvaBtn.addEventListener("click", async () => {
    const nome = document.getElementById("input-nome").value.trim();
    const cognome = document.getElementById("input-cognome").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const telefono = document.getElementById("input-telefono").value.trim();

    if (!nome || !cognome) {
      alert("Nome e cognome sono obbligatori.");
      return;
    }

    const nuovoCliente = { nome, cognome, email, telefono };

    try {
      const res = await fetch("/api/clienti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuovoCliente)
      });

      if (!res.ok) throw new Error("Errore durante la creazione del cliente");

      const clienteCreato = await res.json();
      alert(`Cliente ${clienteCreato.nome} ${clienteCreato.cognome} aggiunto con successo!`);
      window.location.href = `/scheda-cliente.html?id=${clienteCreato.id}`;
    } catch (err) {
      console.error(err);
      alert("Errore durante la creazione del cliente.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btnLista = document.getElementById("btnListaClienti");
  if (btnLista) {
    btnLista.addEventListener("click", () => {
      window.location.href = "lista-clienti.html";
    });
  } else {
    console.warn('Bottone "Lista Clienti" non trovato');
  }
});



