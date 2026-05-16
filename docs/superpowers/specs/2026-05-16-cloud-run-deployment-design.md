# Cloud Run Deployment Design - AURA Platform

## Overview
This document outlines the manual deployment process for the AURA (Autonomous Risk & Cashflow Assistant) platform to Google Cloud Run using Google Cloud Build for containerization.

## Architecture
- **Backend**: FastAPI application serving the API.
- **Frontend**: React (Vite) application served via Nginx.
- **Environment**: Google Cloud Platform (GCP).
- **Region**: `asia-southeast1` (Singapore).

## Deployment Steps

### Phase 1: Authentication & Configuration
- Ensure the user is authenticated with `gcloud auth login`.
- Set the active project to `aura-platform-495406`.
- Enable necessary APIs: `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`.

### Phase 2: Backend Deployment
1. **Build**: Use `gcloud builds submit` from the `backend/` directory.
2. **Deploy**: Deploy to Cloud Run as `aura-backend`.
3. **Secrets**: Deploy with default values initially; user can update secrets (GEMINI_API_KEY, etc.) manually later.
4. **URL**: Capture the assigned service URL (e.g., `https://aura-backend-xxx-as.a.run.app`).

### Phase 3: Frontend Deployment
1. **Build**: Use `gcloud builds submit` from the `frontend/` directory.
2. **Build Argument**: Pass `VITE_API_BASE_URL` pointing to the Backend URL from Phase 2.
3. **Deploy**: Deploy to Cloud Run as `aura-platform`.

## Security & Reliability
- Both services will allow unauthenticated access (publicly accessible).
- Cloud Build handles image creation and storage in Artifact Registry automatically or uses a default bucket.
- SPA routing is handled by custom `nginx.conf` in the frontend container.

## Success Criteria
- Backend is reachable and returns the root JSON response.
- Frontend loads and communicates with the Backend API.
