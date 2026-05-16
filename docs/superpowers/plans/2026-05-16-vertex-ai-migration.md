# Vertex AI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the AURA Virtual CFO chatbot from Google AI Studio (Gemini API) to Vertex AI for enterprise-grade deployment on Cloud Run.

**Architecture:** Replace the `google-generativeai` SDK with `google-cloud-aiplatform`. Use Application Default Credentials (ADC) for authentication. Initialize Vertex AI in a singleton-like pattern within the `ChatbotService`.

**Tech Stack:** Python, FastAPI, Google Cloud Vertex AI SDK (`google-cloud-aiplatform`).

---

### Task 1: Update Dependencies

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Update requirements.txt**

Replace `google-generativeai` with `google-cloud-aiplatform`.

```text
# ... existing dependencies ...
google-cloud-aiplatform
```

- [ ] **Step 2: Install dependencies**

Run: `pip install -r backend/requirements.txt`
Expected: `google-cloud-aiplatform` is installed and `google-generativeai` is removed.

- [ ] **Step 3: Commit**

```bash
git add backend/requirements.txt
git commit -m "build: replace google-generativeai with google-cloud-aiplatform"
```

---

### Task 2: Update Configuration

**Files:**
- Modify: `backend/app/core/config.py`

- [ ] **Step 1: Add Vertex AI settings**

```python
class Settings:
    # ... existing settings ...
    
    # Vertex AI
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "aura-platform-495406")
    GCP_LOCATION: str = os.getenv("GCP_LOCATION", "asia-southeast1")
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/core/config.py
git commit -m "config: add GCP_PROJECT_ID and GCP_LOCATION for Vertex AI"
```

---

### Task 3: Refactor Chatbot Service to Vertex AI

**Files:**
- Modify: `backend/app/services/chatbot.py`

- [ ] **Step 1: Update imports and initialization logic**

```python
import logging
import vertexai
from vertexai.generative_models import GenerativeModel, Part
from app.core.config import settings

logger = logging.getLogger(__name__)

class ChatbotService:
    _initialized = False

    def _ensure_initialized(self):
        if not ChatbotService._initialized:
            vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_LOCATION)
            ChatbotService._initialized = True
```

- [ ] **Step 2: Implement Vertex AI generation logic**

Replace the old `generate_response` method.

```python
    def generate_response(self, user_message: str, context: dict) -> str:
        self._ensure_initialized()
        
        system_prompt = f"""...""" # keep existing prompt logic

        try:
            model = GenerativeModel("gemini-1.5-flash-001")
            full_prompt = f"{system_prompt}\n\nPertanyaan Pengguna: {user_message}\nJawaban:"
            response = model.generate_content(full_prompt)
            
            if response and response.text:
                return response.text
            return "Maaf, saya tidak mendapatkan respon dari AI."
        except Exception as e:
            logger.error(f"Vertex AI Error: {e}")
            return f"Maaf, saya sedang mengalami kendala teknis (Vertex AI)."
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/services/chatbot.py
git commit -m "feat: migrate chatbot service to Vertex AI"
```

---

### Task 4: Verification

- [ ] **Step 1: Run local test (requires gcloud auth application-default login)**

Run a simple script or use the existing API if possible.
Expected: Chatbot returns a valid response using Vertex AI.

- [ ] **Step 2: Final Commit**

```bash
git commit --allow-empty -m "chore: vertex ai migration complete"
```
