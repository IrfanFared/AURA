import os
import json
import logging
import re
import google.generativeai as genai
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class MutationParser:
    """Parses bank mutation files (image/PDF) using Google Gemini Vision."""

    def _get_model(self):
        """Read GEMINI_API_KEY lazily so Cloud Run env vars are always picked up."""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None, None
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        return model, api_key

    def extract_transactions(self, file_bytes: bytes, mime_type: str) -> List[Dict[str, Any]]:
        """
        Uses Gemini Vision to read a bank mutation file and extract transactions.
        Falls back to mock data when GEMINI_API_KEY is not set.
        """
        model, api_key = self._get_model()

        if not api_key or not model:
            logger.warning("GEMINI_API_KEY not set. Falling back to mock parsing.")
            return self._mock_parse()

        prompt = """
You are a financial AI assistant. Carefully read this bank mutation statement (image or PDF).
Extract ALL transactions into a strict JSON array. Output ONLY the raw JSON array — no markdown, no code fences, no explanation.

Required format:
[
    {
        "date": "YYYY-MM-DD",
        "amount": 150000.0,
        "type": "income",
        "description": "Transfer from XYZ"
    }
]

Rules:
- "type" must be exactly "income" (credit/deposit) or "expense" (debit/withdrawal).
- "amount" must be a positive float.
- "date" must be exactly in YYYY-MM-DD format.
- "description" should be a short summary of the transaction.
- If you cannot read the document clearly, return an empty array: []
"""

        try:
            file_part = {"mime_type": mime_type, "data": file_bytes}
            response = model.generate_content([prompt, file_part])

            text = response.text.strip()

            # Strip markdown code fences if present
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
            text = text.strip()

            data = json.loads(text)

            # Validate and coerce each record
            validated = []
            for item in data:
                if not isinstance(item, dict):
                    continue
                txn_type = str(item.get("type", "")).lower()
                if txn_type not in ("income", "expense"):
                    txn_type = "income"
                validated.append({
                    "date": str(item.get("date", "")),
                    "amount": float(item.get("amount", 0)),
                    "type": txn_type,
                    "description": str(item.get("description", "-")),
                })

            if not validated:
                logger.warning("Gemini returned empty transaction list — using mock.")
                return self._mock_parse()

            return validated

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini JSON response: {e}")
            raise ValueError(f"Gemini mengembalikan format yang tidak valid. Detail: {e}")
        except Exception as e:
            logger.error(f"AI parsing error: {e}")
            err = str(e)
            if "API key not valid" in err or "API_KEY_INVALID" in err:
                raise ValueError("GEMINI_API_KEY tidak valid. Periksa konfigurasi environment Anda.")
            if "quota" in err.lower() or "RESOURCE_EXHAUSTED" in err:
                raise ValueError("Kuota Gemini API habis. Silakan coba lagi nanti.")
            raise ValueError(f"Gagal memproses file dengan AI: {e}")

    def _mock_parse(self) -> List[Dict[str, Any]]:
        """Returns simulated transactions when no API key is available."""
        from datetime import date, timedelta
        today = date.today()
        return [
            {
                "date": (today - timedelta(days=5)).isoformat(),
                "amount": 7500000.0,
                "type": "income",
                "description": "Pembayaran Invoice A (Demo)",
            },
            {
                "date": (today - timedelta(days=3)).isoformat(),
                "amount": 2500000.0,
                "type": "expense",
                "description": "Belanja Bahan Baku (Demo)",
            },
            {
                "date": (today - timedelta(days=1)).isoformat(),
                "amount": 5000000.0,
                "type": "income",
                "description": "Sales POS (Demo)",
            },
        ]
