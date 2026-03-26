# Use the official Puppeteer image which has Chrome and all dependencies
FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Environment variables for Puppeteer to run in a restricted container
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3001

# Start the server
CMD ["node", "index.js"]