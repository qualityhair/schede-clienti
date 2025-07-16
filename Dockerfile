FROM node:current-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

ARG CACHE_BUSTER=$(date +%s)
RUN echo "Cache Buster: $CACHE_BUSTER"

RUN npm install --production

COPY . .

ENV PORT=8080

EXPOSE 8080

CMD ["node", "index.js"]