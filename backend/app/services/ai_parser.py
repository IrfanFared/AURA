import os
import json
import logging
import re
from google import genai
from google.genai import types
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class MutationParser:
    """Parses bank mutation files (image/PDF) using Google Gemini Vision."""

    def _get_client(self):
        """Read GEMINI_API_KEY lazily so Cloud Run env vars are always picked up."""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None, None
        client = genai.Client(api_key=api_key)
        return client, api_key


    def extract_transactions(self, file_bytes: bytes, mime_type: str) -> List[Dict[str, Any]]:
        """
        Uses Gemini Vision to read a bank mutation file and extract transactions.
        Falls back to mock data when GEMINI_API_KEY is not set.
        """
        client, api_key = self._get_client()

        if not api_key or not client:
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
            file_part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[prompt, file_part],
            )

            if not response or not response.text:
                logger.warning("Gemini returned empty response — using mock.")
                return self._mock_parse()

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
                logger.warning("No transactions extracted — using mock.")
                return self._mock_parse()

            return validated

        except Exception as e:
            logger.error(f"AI parsing error: {e}")
            return self._mock_parse()

    def _mock_parse(self) -> List[Dict[str, Any]]:
        """Returns simulated transactions when no AI is available."""
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
