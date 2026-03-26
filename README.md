# Latency Lab 

<img width="1294" height="596" alt="image" src="https://github.com/user-attachments/assets/cad170e3-ea46-4e01-ba5c-a08118c95390" />



Latency Lab is a network diagnostic tool that gives Shopify DTC merchants a "performance reality check" by monitoring the browser’s **Main Thread**. It identifies the hidden "Performance Tax" caused by third-party apps like chatbots, widgets, and tracking pixels. 

By pinpointing the specific **App Bloat** that drives up mobile bounce rates, Latency Lab reveals exactly which integrations are costing merchants sales before a customer even interacts.

In a nutshell, Latency Lab tells the merchant why the user left before they could even do anything.

---

## How it works

### 1. Enter a link (that is hosted on Shopify)

<img width="736" height="175" alt="image" src="https://github.com/user-attachments/assets/84e1da0b-8d8d-4dbd-b230-40d2d7d229f4" />


### 2. Wait (can take a few seconds)

<img width="1132" height="426" alt="image" src="https://github.com/user-attachments/assets/4a9b034e-02cb-49fe-9e15-ced75316dc3d" />


### 3. View Results

<img width="694" height="566" alt="image" src="https://github.com/user-attachments/assets/293b2c81-c8e1-4d5c-90d0-f0a208d3ea9f" />

#### Note: May have to run multiple times for accurate results since first time run may also include cold start delay, which would affect the final latency results.
---

## Tech Stack


* **Frontend:** Built with **React**, **Next.js 14/15** and **Tailwind CSS**
* **Backend/Audit Engine:** A **Fastify (Node.js)** server that orchestrates a **Headless Chromium** instance via **Puppeteer**.
* **Containerization**: **Docker** used to package the Chromium engine and Linux system dependencies into a portable image.

* **Cloud Infrastructure**: **AWS Lambda** (Backend) & **Vercel** (Frontend).
* **CI/CD:** Automated deployment pipeline using **GitHub Actions** to build and push Docker images to the cloud.



## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (Required for local development)
- Docker Desktop (**Optional**, but recommended for testing the stable audit environment)

### 2. Configure Environment Variables
Create a .env.local file in the /frontend directory to point the dashboard to your local engine:

```Plaintext
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AUDIT_SECRET= fallback_key_for_local_dev
```

### 3. Run Locally (The Quick Way)
This method uses your local machine's Node.js and Chrome installation.

Start the Backend:

```Bash
cd backend
npm install
# Set the secret for your local session
$env:AUDIT_SECRET= process.env.NEXT_PUBLIC_AUDIT_SECRET || 'fallback_key_for_local_dev'
npm run dev
```

Start the Frontend:

```Bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 to view the dashboard.

## Run with Docker (The Stable Way)
If you encounter "Chromium not found" or OS-dependency issues, use Docker to run the backend in a pre-configured Linux environment:

```Bash
cd backend
# 1. Build the image
docker build -t latency-backend .

# 2. Run the container with the secret key
docker run -p 3001:3001 -e AUDIT_SECRET=fallback_key_for_local_dev latency-backend
```

