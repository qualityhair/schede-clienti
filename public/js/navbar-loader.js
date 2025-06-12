document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("navbar");
  if (container) {
    fetch("/navbar.html")
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;

        // Dopo aver caricato la navbar, carichiamo anche dashboard.js
        const dashboardScript = document.createElement("script");
        dashboardScript.src = "/js/dashboard.js";
        dashboardScript.defer = true; // mantiene coerenza con il vecchio comportamento
        document.body.appendChild(dashboardScript);
      })
      .catch(err => console.error("Errore nel caricamento della navbar:", err));
  }
});


