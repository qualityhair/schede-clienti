document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar");
  if (container) {
    fetch("/navbar.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;

        // Dopo il caricamento, collega gli event listener
        const btnCerca = container.querySelector("#btnCerca");
        if (btnCerca) {
          btnCerca.addEventListener("click", () => {
            const modal = document.getElementById("modal-cerca-cliente");
            if (modal) {
              modal.classList.remove("hidden");
            } else {
              console.error("Modale di ricerca cliente non trovata.");
            }
          });
        }
      })
      .catch(err => console.error("Errore nel caricamento della navbar:", err));
  }
});

