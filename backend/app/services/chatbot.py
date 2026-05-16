import os
import logging
from google import genai

logger = logging.getLogger(__name__)


class ChatbotService:
    """AURA Virtual CFO Chatbot powered by Google Gemini."""

    def _get_api_key(self):
        return os.environ.get("GEMINI_API_KEY")

    def generate_response(self, user_message: str, context: dict) -> str:
        api_key = self._get_api_key()
        if not api_key:
            return (
                "Maaf, fitur AI Chatbot belum dikonfigurasi. "
                "GEMINI_API_KEY tidak ditemukan di environment."
            )

        try:
            client = genai.Client(api_key=api_key)

            system_prompt = f"""Anda adalah AURA Assistant, konsultan keuangan virtual (Virtual CFO) untuk UMKM.
Gunakan bahasa Indonesia yang ramah, profesional, namun mudah dipahami oleh orang awam.
Jangan gunakan istilah akuntansi yang terlalu rumit.
Jawablah pertanyaan secara ringkas dan praktis.
Gunakan markdown untuk menebalkan teks penting atau membuat daftar poin-poin.

Berikut adalah konteks data keuangan pengguna saat ini:
- AURA Score: {context.get('score', 'Belum ada data')}
- Saldo Smart Vault (Dana Darurat): Rp {context.get('vault_balance', 0):,.0f}
- Ringkasan Arus Cash 30 Hari Terakhir:
  * Total Pemasukan: Rp {context.get('total_income', 0):,.0f}
  * Total Pengeluaran: Rp {context.get('total_expense', 0):,.0f}
  * Net Cashflow: Rp {context.get('net_cashflow', 0):,.0f}

Panduan menjawab:
1. Jika pengguna bertanya tentang kas, rujuk pada data di atas.
2. Jika kas minus, sarankan mereka berhemat. Jika surplus, sarankan menabung di Smart Vault.
3. Tetap ringkas dan praktis."""

            full_prompt = f"{system_prompt}\n\nPertanyaan Pengguna: {user_message}\nJawaban:"

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt,
            )

            if response and response.text:
                return response.text
            return "Maaf, saya tidak mendapatkan respon dari AI. Silakan coba lagi."

        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            error_msg = str(e).lower()
            if "quota" in error_msg or "429" in error_msg:
                return "Maaf, kuota Gemini API Anda telah habis. Silakan coba lagi nanti."
            if "api key" in error_msg or "api_key" in error_msg:
                return "Maaf, konfigurasi API Key tidak valid."
            if "not found" in error_msg or "404" in error_msg:
                return "Maaf, model AI tidak ditemukan. Silakan hubungi administrator."

            return "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi."
