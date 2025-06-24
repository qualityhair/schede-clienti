FROM node:current-slim

WORKDIR /app

# Copia solo i file essenziali per installare le dipendenze
COPY package.json ./
COPY package-lock.json ./

# --- INIZIO: RIGHE AGGIUNTE PER INVALIDARE LA CACHE DI NPM INSTALL ---
# Questa riga genera un timestamp unico a ogni build, invalidando la cache.
ARG CACHE_BUSTER=$(date +%s)
RUN echo "Cache Buster: $CACHE_BUSTER"
# --- FINE: RIGHE AGGIUNTE ---

# Installa le dipendenze
RUN npm install --production

# Copia il resto del codice
COPY . .

# Esegui il build script se presente (utile per frontend o TypeScript, lascialo pure)
RUN npm run build --if-present

# Imposta la porta su cui l'app ascolterà
ENV PORT=8080

# Espone la porta
EXPOSE 8080

# Esegui l'applicazione
CMD ["node", "index.js"]
