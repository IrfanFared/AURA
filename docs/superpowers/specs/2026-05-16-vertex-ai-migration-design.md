# Spec: Vertex AI Migration for AURA Chatbot

**Status:** Draft
**Date:** 2026-05-16
**Topic:** Migrating from Google AI Studio (Gemini API) to Vertex AI on Google Cloud Platform.

## 1. Executive Summary
The AURA Virtual CFO chatbot currently uses the `google-generativeai` library which requires a manual API Key. This migration moves the chatbot to Google Cloud's **Vertex AI**, enabling enterprise-grade features, native Cloud Run authentication via IAM, and better scalability within the existing GCP project (`aura-platform-495406`).

## 2. Technical Architecture
- **Environment:** Google Cloud Run.
- **SDK:** `google-cloud-aiplatform` (Python).
- **Model:** `gemini-1.5-flash-001` (or latest available in region).
- **Region:** `asia-southeast1` (Singapore).
- **Authentication:** Application Default Credentials (ADC) via Cloud Run Service Account.

## 3. Implementation Details

### 3.1 Dependencies
Update `backend/requirements.txt`:
- Remove `google-generativeai`.
- Add `google-cloud-aiplatform`.

### 3.2 Service Refactoring (`backend/app/services/chatbot.py`)
- Replace `google.generativeai` imports with `vertexai` and `vertexai.generative_models`.
- Implement a singleton-like initialization for `vertexai.init()`.
- Update `generate_response` logic to use Vertex AI's `GenerativeModel`.
- Remove manual `GEMINI_API_KEY` checks.

### 3.3 Configuration (`backend/app/core/config.py` & Environment)
New environment variables required:
- `GCP_PROJECT_ID`: `aura-platform-495406`
- `GCP_LOCATION`: `asia-southeast1`

### 3.4 Infrastructure Requirements (IAM)
The Cloud Run service account must be granted the following role:
- `roles/aiplatform.user` (Vertex AI User)

## 4. Success Criteria
1. Backend successfully builds with `google-cloud-aiplatform`.
2. Chatbot responds correctly in the development environment (using local ADC).
3. Chatbot responds correctly in the Cloud Run environment without a manual API Key.
4. Response quality and formatting (Markdown) remain consistent with the previous implementation.

## 5. Risk Assessment
- **Quota:** Vertex AI has different quota limits than AI Studio. Monitor initial usage.
- **Costs:** Vertex AI usage is billed to the GCP project.
- **Region Availability:** Ensure `gemini-1.5-flash` is available in `asia-southeast1`.
