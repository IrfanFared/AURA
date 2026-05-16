import logging
import vertexai
from vertexai.generative_models import GenerativeModel
from app.core.config import settings

logger = logging.getLogger(__name__)


class ChatbotService:
    """AURA Virtual CFO Chatbot powered by Google Vertex AI."""

    _initialized = False

    def _ensure_initialized(self):
        """Lazy initialization for Vertex AI."""
        if not ChatbotService._initialized:
            try:
                vertexai.init(
                    project=settings.GCP_PROJECT_ID,
                    location=settings.GCP_LOCATION
                )
                ChatbotService._initialized = True
            except Exception as e:
                logger.error(f"Failed to initialize Vertex AI: {e}")
                raise

    def generate_response(self, user_message: str, context: dict) -> str:
        try:
            self._ensure_initialized()
        except Exception as e:
            return f"Maaf, sistem AI sedang mengalami kendala inisialisasi. (Error: {str(e)[:50]}...)"
        
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
            model = GenerativeModel("gemini-1.5-flash-001")
            prompt = f"{system_prompt}\n\nPertanyaan Pengguna: {user_message}\nJawaban:"
            response = model.generate_content(prompt)
            
            if response and response.text:
                return response.text
            else:
                return "Maaf, saya tidak dapat memberikan jawaban saat ini. Silakan coba beberapa saat lagi."
                
        except Exception as e:
            logger.error(f"Vertex AI generation failed: {e}")
            
            error_msg = str(e).lower()
            if "permission denied" in error_msg or "403" in error_msg:
                return (
                    "Maaf, akses ke layanan AI ditolak. "
                    "Pastikan Vertex AI API telah diaktifkan di Google Cloud Console."
                )
            if "quota" in error_msg or "429" in error_msg:
                return (
                    "Maaf, kuota layanan AI saat ini sedang penuh. "
                    "Silakan coba lagi beberapa saat lagi."
                )
            
            return f"Maaf, saya sedang mengalami kendala teknis (Error: {str(e)[:50]}...). Silakan coba lagi nanti."
