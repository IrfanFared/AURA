import os
import logging
import google.generativeai as genai

logger = logging.getLogger(__name__)


class ChatbotService:
    """AURA Virtual CFO Chatbot powered by Google Gemini."""

    def _get_model(self):
        """Get a configured Gemini model, reading API key lazily per call."""
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return None, None
        genai.configure(api_key=api_key)
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
        except Exception:
            model = genai.GenerativeModel("gemini-pro")
        return model, api_key

    def generate_response(self, user_message: str, context: dict) -> str:
        model, api_key = self._get_model()

        if not api_key or not model:
            return (
                "Maaf, fitur AI Chatbot belum dikonfigurasi. "
                "GEMINI_API_KEY tidak ditemukan di environment."
            )

        system_prompt = f"""
Anda adalah AURA Assistant, konsultan keuangan virtual (Virtual CFO) untuk UMKM.
Gunakan bahasa Indonesia yang ramah, profesional, namun mudah dipahami oleh orang awam.
Jangan gunakan istilah akuntansi yang terlalu rumit.
Jawablah pertanyaan secara ringkas dan praktis.
Gunakan markdown untuk menebalkan teks penting atau membuat daftar poin-poin.

Berikut adalah konteks data keuangan pengguna saat ini:
- AURA Score: {context.get('score', 'Belum ada data')}
- Saldo Smart Vault (Dana Darurat): Rp {context.get('vault_balance', 0):,.0f}
- Ringkasan Arus Kas 30 Hari Terakhir:
  * Total Pemasukan: Rp {context.get('total_income', 0):,.0f}
  * Total Pengeluaran: Rp {context.get('total_expense', 0):,.0f}
  * Net Cashflow: Rp {context.get('net_cashflow', 0):,.0f}

Panduan menjawab:
1. Jika pengguna bertanya tentang kas, rujuk pada data di atas.
2. Jika kas minus, sarankan mereka berhemat. Jika surplus, sarankan menabung di Smart Vault.
3. Tetap ringkas dan praktis.
"""
        try:
            prompt = f"{system_prompt}\n\nPertanyaan Pengguna: {user_message}\nJawaban:"
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Chatbot Gemini error: {e}")
            err = str(e)
            if "API has not been used" in err or "SERVICE_DISABLED" in err:
                return (
                    "Maaf, Gemini API belum diaktifkan di Google Cloud Project Anda. "
                    "Silakan aktifkan Generative Language API di GCP Console."
                )
            if "API key not valid" in err or "API_KEY_INVALID" in err:
                return (
                    "Maaf, GEMINI_API_KEY yang digunakan tidak valid. "
                    "Silakan periksa kembali konfigurasi environment Anda."
                )
            if "quota" in err.lower() or "RESOURCE_EXHAUSTED" in err:
                return (
                    "Maaf, kuota Gemini API Anda telah habis. "
                    "Silakan cek Google AI Studio untuk detail penggunaan."
                )
            return "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi dalam beberapa saat."
