# Product Requirements Document (PRD): AI Chatbot untuk UMKM (AURA Assistant)

## 1. Ringkasan Eksekutif
AURA Assistant adalah fitur *chatbot* interaktif berbasis Kecerdasan Buatan (AI) yang diintegrasikan ke dalam platform AURA. Chatbot ini bertindak sebagai "Konsultan Keuangan Virtual" (Virtual CFO) yang dapat diakses 24/7 oleh pelaku UMKM. Fitur ini dirancang untuk menjawab pertanyaan, memberikan *insight* keuangan secara proaktif berdasarkan data kas pengguna, serta memberikan rekomendasi bisnis yang praktis.

## 2. Tujuan dan Sasaran
*   **Meningkatkan Literasi Keuangan:** Membantu UMKM memahami metrik keuangan mereka (seperti AURA Score, proyeksi arus kas, dan status *hedging*).
*   **Keputusan Bisnis yang Lebih Baik:** Memberikan rekomendasi berbasis data secara *real-time* (misalnya: peringatan saat kas menipis atau saran untuk melakukan *restocking*).
*   **Peningkatan *User Engagement*:** Meningkatkan waktu interaksi pengguna di dalam dashboard AURA melalui komunikasi dua arah yang natural.

## 3. Persona Pengguna
*   **Nama:** Budi (Pemilik Kedai Kopi / UMKM Retail)
*   **Pain Points:** Tidak paham cara membaca laporan keuangan yang rumit, tidak tahu kapan harus menahan pengeluaran, dan butuh saran cepat sebelum mengambil pinjaman modal.
*   **Kebutuhan:** Penjelasan sederhana tentang kondisi usahanya saat ini dan prediksi 30 hari ke depan dalam bahasa awam.

## 4. Fitur Utama (User Stories)

### a. Context-Aware Financial Q&A
*   *Sebagai pengguna, saya ingin bertanya tentang kondisi keuangan saya bulan ini, sehingga saya tahu apakah saya sedang untung atau rugi.*
*   **Acceptance Criteria:** Chatbot dapat membaca data transaksi pengguna dan memberikan jawaban yang akurat (contoh: "Bulan ini pemasukan Anda Rp 15 juta, namun pengeluaran meningkat 20% dibanding bulan lalu.").

### b. Penjelasan AURA Score & Smart Vault
*   *Sebagai pengguna, saya ingin tahu mengapa AURA Score saya turun dan apa yang harus dilakukan.*
*   **Acceptance Criteria:** Chatbot dapat menjelaskan komponen skor kredit dan menyarankan pengguna untuk menyetorkan lebih banyak dana darurat ke *Smart Vault*.

### c. Proactive Alerts (Notifikasi Proaktif)
*   *Sebagai pengguna, saya ingin diberi peringatan jika saldo saya diperkirakan akan negatif minggu depan.*
*   **Acceptance Criteria:** Saat pengguna membuka chat, bot akan memberikan *insight* awal jika mendeteksi anomali pada arus kas (The Oracle Forecast).

### d. Export & Laporan Instan
*   *Sebagai pengguna, saya ingin meminta ringkasan mutasi minggu ini dalam bentuk poin-poin singkat.*
*   **Acceptance Criteria:** Bot dapat merangkum transaksi berdasarkan perintah teks ("Tolong buatkan ringkasan pengeluaran minggu ini").

## 5. Arsitektur & Spesifikasi Teknis

*   **Model AI:** Menggunakan **Google Gemini (gemini-1.5-flash)** via `google.generativeai` (atau `google.genai` SDK terbaru) yang sudah dikonfigurasi di *backend*.
*   **System Prompt:** Bot akan diberikan "konteks" (System Instruction) berupa profil UMKM, saldo saat ini, tren 30 hari, dan AURA Score agar jawabannya relevan dan personal.
*   **Database:** 
    *   Tabel `chat_sessions` untuk menyimpan riwayat percakapan (memori kontekstual).
    *   Tabel `chat_messages` untuk menyimpan *prompt* pengguna dan respons AI.
*   **Backend (FastAPI):**
    *   Endpoint `POST /api/v1/chat/message` (menerima pesan dan mengirimkan respons *stream* atau *sync*).
    *   Endpoint `GET /api/v1/chat/history` (mengambil riwayat percakapan sebelumnya).
*   **Frontend (React/Vite):**
    *   Widget *floating chat* di sudut kanan bawah Dashboard.
    *   UI menyerupai aplikasi *messenger* modern (mendukung Markdown *rendering* untuk tabel/poin).

## 6. Desain UI/UX
*   **Posisi:** *Floating Action Button* (FAB) bergambar robot/petir AURA di kanan bawah layar.
*   **Tampilan:** Panel chat yang dapat di-*expand* (*Glassmorphism design* sesuai tema AURA saat ini).
*   **Fitur UI:** 
    *   *Quick suggestion chips* (contoh tombol: "Berapa saldo Smart Vault saya?", "Bagaimana proyeksi kas bulan depan?").
    *   Indikator *typing* (animasi saat AI sedang berpikir).

## 7. Metrik Keberhasilan (KPI)
*   **Adoption Rate:** 40% pengguna aktif mencoba fitur chatbot dalam bulan pertama.
*   **Resolution Rate:** 80% pertanyaan finansial terjawab tanpa pengguna harus mencari menu laporan secara manual.
*   **Latency:** Respons AI harus muncul di bawah 2.5 detik.

## 8. Rencana Rilis (Roadmap)
*   **Fase 1 (MVP):** UI Chatbot dasar, integrasi Gemini 1.5, System Prompt statis yang mengambil data saldo terakhir dan ringkasan 30 hari.
*   **Fase 2 (Interactive):** Bot dapat mengeksekusi aksi (Function Calling) seperti "Pindahkan 1 juta ke Smart Vault".
*   **Fase 3 (Voice):** Input pertanyaan menggunakan suara (Voice-to-Text).
