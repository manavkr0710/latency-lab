FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

RUN chown -R pptruser:pptruser /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

USER pptruser

CMD ["node", "index.js"]