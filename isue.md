# 📋 AURA Project Tracker (isue.md)

Dokumen ini berisi daftar tugas, bug, dan fitur yang harus dikerjakan untuk proyek **AURA (Autonomous Risk & Cashflow Assistant)**. Anda dapat mencentang kotak `[ ]` menjadi `[x]` saat tugas selesai.

## 🚨 To Do (Prioritas Tinggi)

- [ ] **[AI/ML] Integrasikan Meta Prophet:** Saat ini prediksi arus kas baru menggunakan model probabilitas Gaussian. Ganti atau tambahkan model `prophet` untuk menghasilkan peramalan rentang menengah (14-90 hari) dengan parameter *multiplicative seasonality*.
- [ ] **[KEAMANAN] Enkripsi AES-256 (Zero-Knowledge):** Terapkan fungsi enkripsi untuk semua data transaksi sebelum disimpan ke tabel database (di `app/models/transaction.py`).
- [ ] **[INTEGRASI] Endpoint Open Banking (SNAP API):** Buat modul di backend untuk menarik data mutasi bank secara *real-time* (menggantikan script mock `seed.py`).

## ⏳ In Progress (Sedang Dikerjakan)

- [ ] **[LOGIKA] Smart Vault Hedging Executor:** Logika batas persentase (1%, 2.5%, 5%) sudah ada di `AuraAgent`, namun fungsi aktual untuk "memindahkan dana" belum ada. Perlu diimplementasikan di layer `services`.

## 💡 Backlog Fitur (Prioritas Menengah)

- [ ] **[CREDIT SCORING] Pembuatan Modul AURA Score:** Kembangkan algoritma penilaian kelayakan kredit berdasarkan 5 dimensi: *Stability*, *Growth*, *Resilience*, *Liquidity*, dan *Predictability*.
- [ ] **[TESTING] Skenario Krisis Lanjutan:** Tambahkan dataset ekstrem pada `test_resilience.py` untuk menguji reaksi sistem jika pendapatan turun drastis berturut-turut.

## 🎨 UI/UX & Frontend

- [ ] **[FRONTEND] Bangun Dashboard React.js:** Buat antarmuka pengguna berbasis web untuk memvisualisasikan "The Oracle Forecast" (grafik arus kas dengan *confidence bands* 80% & 95%).
- [ ] **[NOTIFIKASI] Firebase Cloud Messaging:** Terapkan sistem *push notification* untuk memberi peringatan instan kepada UMKM ketika probabilitas defisit (Zona Kritis/Darurat) terdeteksi.

---
*Silakan sesuaikan, hapus, atau tambahkan item di atas sesuai dengan berjalannya proses pengembangan proyek.*
