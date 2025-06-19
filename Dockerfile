FROM node:current-slim

WORKDIR /app

# Copia solo i file essenziali per installare le dipendenze
COPY package.json ./
COPY package-lock.json ./

# Installa le dipendenze
RUN npm install --production

# Copia il resto del codice
COPY . .

# Esegui il build script se presente (non dovrebbe esserci nel tuo caso)
RUN npm run build --if-present

# Imposta la porta su cui l'app ascolterà
ENV PORT=8080

# Espone la porta
EXPOSE 8080

# Esegui l'applicazione
CMD ["node", "index.js"]
