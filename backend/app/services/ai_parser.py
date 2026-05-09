import os
import json
import logging
import google.generativeai as genai
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Configure Gemini
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class MutationParser:
    def __init__(self):
        # We use gemini-1.5-flash for fast multimodal extraction
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def extract_transactions(self, file_bytes: bytes, mime_type: str) -> List[Dict[str, Any]]:
        """
        Uses Gemini to read the bank mutation file (image/pdf) and extract transactions.
        """
        if not api_key:
            logger.warning("GEMINI_API_KEY not set. Using mock parsing.")
            return self._mock_parse()

        prompt = """
        You are a financial AI assistant. Read this bank mutation statement (can be an image or PDF).
        Extract all transactions into a strict JSON format. 
        Only output the JSON array, nothing else. No markdown formatting.
        
        Format:
        [
            {
                "date": "YYYY-MM-DD",
                "amount": 150000.0,
                "type": "income" | "expense",
                "description": "Transfer from XYZ"
            }
        ]
        
        Notes:
        - Identify credits/deposits as "income" and debits/withdrawals as "expense".
        - Ensure "amount" is a positive float number.
        - Ensure "date" is strictly in YYYY-MM-DD format.
        """
        
        try:
            # Prepare the part for the model
            file_part = {
                "mime_type": mime_type,
                "data": file_bytes
            }
            
            response = self.model.generate_content([prompt, file_part])
            
            # Clean up the response (remove ```json if present)
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            data = json.loads(text.strip())
            return data
            
        except Exception as e:
            logger.error(f"Failed to parse mutation with AI: {e}")
            raise ValueError(f"AI Parsing failed: {e}")

    def _mock_parse(self) -> List[Dict[str, Any]]:
        from datetime import date, timedelta
        # Simulated parsing result if no API key
        today = date.today()
        return [
            {"date": (today - timedelta(days=2)).isoformat(), "amount": 7500000.0, "type": "income", "description": "Pembayaran Invoice A"},
            {"date": (today - timedelta(days=1)).isoformat(), "amount": 2500000.0, "type": "expense", "description": "Belanja Bahan Baku"},
            {"date": today.isoformat(), "amount": 5000000.0, "type": "income", "description": "Sales POS Hari Ini"}
        ]
