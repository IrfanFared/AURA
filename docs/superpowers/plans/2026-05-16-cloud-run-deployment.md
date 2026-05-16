# Cloud Run Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manually deploy the AURA platform (Backend and Frontend) to Google Cloud Run using Cloud Build.

**Architecture:** Backend (FastAPI) and Frontend (Vite/Nginx) deployed as separate services in the `asia-southeast1` region. Frontend build injected with Backend URL.

**Tech Stack:** Google Cloud SDK (gcloud), Google Cloud Build, Google Cloud Run, Docker.

---

### Task 1: Setup GCP Project & Auth

**Files:**
- N/A

- [ ] **Step 1: Authenticate with Google Cloud**

Run: `gcloud auth login`
Expected: Success message in terminal after browser login.

- [ ] **Step 2: Set Project ID**

Run: `gcloud config set project aura-platform-495406`
Expected: `Updated property [core/project].`

- [ ] **Step 3: Enable APIs**

Run: `gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com`
Expected: Success message.

---

### Task 2: Build & Deploy Backend

**Files:**
- Modify: `backend/Dockerfile` (Ensure it's ready)

- [ ] **Step 1: Build Backend using Cloud Build**

Run: `cd backend && gcloud builds submit --tag asia-southeast1-docker.pkg.dev/aura-platform-495406/cloud-run-source-lib/aura-backend`
Expected: `SUCCESS` at the end of build logs.

- [ ] **Step 2: Deploy Backend to Cloud Run**

Run: `gcloud run deploy aura-backend --image asia-southeast1-docker.pkg.dev/aura-platform-495406/cloud-run-source-lib/aura-backend --platform managed --region asia-southeast1 --allow-unauthenticated`
Expected: `Service [aura-backend] revision [aura-backend-xxx] has been deployed and is serving 100% of traffic. Service URL: https://aura-backend-xxx-as.a.run.app`

- [ ] **Step 3: Capture Backend URL**

Capture the URL from the previous step output.

---

### Task 3: Build & Deploy Frontend

**Files:**
- Modify: `frontend/Dockerfile` (Ensure it's ready)

- [ ] **Step 1: Build Frontend using Cloud Build with Backend URL**

Replace `<BACKEND_URL>` with the URL from Task 2.
Run: `cd frontend && gcloud builds submit --tag asia-southeast1-docker.pkg.dev/aura-platform-495406/cloud-run-source-lib/aura-platform --build-arg VITE_API_BASE_URL=<BACKEND_URL>`
Expected: `SUCCESS` at the end of build logs.

- [ ] **Step 2: Deploy Frontend to Cloud Run**

Run: `gcloud run deploy aura-platform --image asia-southeast1-docker.pkg.dev/aura-platform-495406/cloud-run-source-lib/aura-platform --platform managed --region asia-southeast1 --allow-unauthenticated --port 8080`
Expected: `Service [aura-platform] revision [aura-platform-xxx] has been deployed and is serving 100% of traffic. Service URL: https://aura-platform-xxx-as.a.run.app`

---

### Task 4: Final Verification

- [ ] **Step 1: Verify Backend Health**

Run: `curl https://aura-backend-xxx-as.a.run.app`
Expected: `{"message": "Selamat datang di AURA API", ...}`

- [ ] **Step 2: Verify Frontend Loading**

Visit the Frontend URL in a browser and check if it loads correctly and can call the Backend.
