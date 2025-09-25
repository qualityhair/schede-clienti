import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pkg from 'pg';
const { Client } = pkg;

// Inserisci la base URL del tuo sito qui
const BASE_URL = 'https://clienti.qualityhair.it';


const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'schede_clienti_dev',
  password: 'postgres_password',
  port: 5432,
});

async function main() {
  await client.connect();

  const res = await client.query('SELECT file_path FROM client_photos');
  const photos = res.rows;

  for (let photo of photos) {
    const filePath = photo.file_path;
    const fileName = path.basename(filePath);
    const localPath = path.join('public/uploads', fileName);

    if (!fs.existsSync(localPath)) {
      // Se il percorso è relativo, aggiungiamo la base URL
      let url;
      if (filePath.startsWith('http')) {
        url = filePath;
      } else {
        url = BASE_URL + filePath;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.log(`Errore fetch ${url}: ${response.statusText}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(localPath, Buffer.from(buffer));
        console.log(`Scaricato: ${fileName}`);
      } catch (err) {
        console.log(`Errore fetch ${url}: ${err.message}`);
      }
    }
  }

  await client.end();
  console.log('Fatto!');
}

main();
