# Latency Lab 

Latency Lab is a network diagnostic tool that gives Shopify DTC merchants a "performance reality check" by monitoring the browser’s **Main Thread**. It identifies the hidden "Performance Tax" caused by third-party apps like chatbots, widgets, and tracking pixels. 

By pinpointing the specific **App Bloat** that drives up mobile bounce rates, Latency Lab reveals exactly which integrations are costing merchants sales before a customer even interacts.

In a nutshell, Latency Lab tells the merchant why the user left before they could even do anything.

---

## Tech Stack


* **Frontend:** Built with **Next.js 14/15** and **Tailwind CSS**
* **Audit Engine (The "Core"):** A **Fastify (Node.js)** server that orchestrates a **Headless Chromium** instance via **Puppeteer**.
* **Infrastructure:** The backend is **Dockerized** to handle complex Linux dependencies required by Chrome, ensuring the audit environment is identical across local development and **AWS App Runner**.
* **CI/CD:** Automated deployment pipeline using **GitHub Actions** to build and push Docker images to the cloud.



## 🚀 Getting Started

### 1. Prerequisites
* **Docker Desktop** (with WSL2 enabled for Windows)
* **Node.js v18+**

### 2. Start the Audit Engine (Backend)
```bash
cd backend
docker build -t latency-backend .
docker run -p 3001:3001 latency-backend
```

### 3. Start the Dashboard (Frontend)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to view the dashboard
