document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar");
  if (container) {
    fetch("/navbar.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
      })
      .catch(err => console.error("Errore nel caricamento della navbar:", err));
  }
});
