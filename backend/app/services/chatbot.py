import os
import google.generativeai as genai
import logging

logger = logging.getLogger(__name__)

api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class ChatbotService:
    def __init__(self):
        # Using gemini-1.5-flash for fast chat responses
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def generate_response(self, user_message: str, context: dict) -> str:
        if not api_key:
            return "Maaf, fitur AI Chatbot belum dikonfigurasi (GEMINI_API_KEY tidak ditemukan)."
            
        system_prompt = f"""
Anda adalah AURA Assistant, konsultan keuangan virtual (Virtual CFO) untuk UMKM.
Gunakan bahasa Indonesia yang ramah, profesional, namun mudah dipahami oleh orang awam. Jangan gunakan istilah akuntansi yang terlalu rumit.
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
3. Tetap ringkas.
"""
        try:
            prompt = f"{system_prompt}\n\nPertanyaan Pengguna: {user_message}\nJawaban:"
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Chatbot error: {e}")
            error_str = str(e)
            if "API has not been used" in error_str or "SERVICE_DISABLED" in error_str:
                return "Maaf, Gemini API belum diaktifkan di Google Cloud Project Anda. Silakan cek console GCP Anda untuk mengaktifkan Generative Language API."
            if "API key not valid" in error_str or "API_KEY_INVALID" in error_str:
                return "Maaf, GEMINI_API_KEY yang digunakan tidak valid. Silakan periksa kembali file .env Anda."
            return "Maaf, saya sedang mengalami kendala teknis dalam memproses pertanyaan Anda."
