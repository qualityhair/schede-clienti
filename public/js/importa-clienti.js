document.getElementById('uploadBtn').addEventListener('click', () => {
  const fileInput = document.getElementById('csvFile');
  const file = fileInput.files[0];

  if (!file) {
    alert('Seleziona un file CSV prima di procedere.');
    return;
  }

  document.getElementById('status').textContent = 'Caricamento in corso...';

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async function(results) {
      const clienti = results.data;
      let success = 0;
      let fail = 0;

      for (const row of clienti) {
        const cliente = {
          nome: row['nome']?.trim(),
          cognome: row['Cognome']?.trim(),
          email: row['indirizzo email']?.trim(),
          telefono: row['Numero di telefono o  cellulare']?.trim()
        };

        // Inserisce solo se nome e cognome sono presenti
        if (cliente.nome && cliente.cognome) {
          try {
            const res = await fetch('/api/clienti', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(cliente)
            });

            if (!res.ok) throw new Error(await res.text());
            success++;
          } catch (err) {
            console.error(`Errore con ${cliente.nome} ${cliente.cognome}:`, err);
            fail++;
          }
        } else {
          console.warn('Record saltato per dati mancanti:', cliente);
        }
      }

      document.getElementById('status').textContent =
        `Importazione completata: ${success} riusciti, ${fail} falliti.`;
    }
  });
});
