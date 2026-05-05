# 📋 AURA Project Tracker (isue.md)

Dokumen ini berisi daftar tugas, bug, dan fitur yang harus dikerjakan untuk proyek **AURA (Autonomous Risk & Cashflow Assistant)**. Anda dapat mencentang kotak `[ ]` menjadi `[x]` saat tugas selesai.

## 🚨 To Do (Prioritas Tinggi)

- [ ] **[AI/ML] Integrasikan Meta Prophet:** Saat ini prediksi arus kas baru menggunakan model probabilitas Gaussian. Ganti atau tambahkan model `prophet` untuk menghasilkan peramalan rentang menengah (14-90 hari) dengan parameter *multiplicative seasonality*.
- [ ] **[KEAMANAN] Enkripsi AES-256 (Zero-Knowledge):** Terapkan fungsi enkripsi untuk semua data transaksi sebelum disimpan ke tabel database (di `app/models/transaction.py`).
- [ ] **[INTEGRASI] Endpoint Open Banking (SNAP API):** Buat modul di backend untuk menarik data mutasi bank secara *real-time* (menggantikan script mock `seed.py`).

## ⏳ In Progress (Sedang Dikerjakan)
- [ ] **[FRONTEND] Bangun Dashboard React.js:** Buat antarmuka pengguna berbasis web untuk memvisualisasikan "The Oracle Forecast" (grafik arus kas dengan *confidence bands* 80% & 95%).

- [ ] **[LOGIKA] Smart Vault Hedging Executor:** Logika batas persentase (1%, 2.5%, 5%) sudah ada di `AuraAgent`, namun fungsi aktual untuk "memindahkan dana" belum ada. Perlu diimplementasikan di layer `services`.
- [ ] **[ORCHESTRATION] Autonomous Workflow:** Menggabungkan seluruh layanan (Bank, Agent, Vault, Score, Notif) ke dalam satu alur otonom melalui `AuraOrchestrator` dan menyediakan API FastAPI.

## 🚨 To Do (Prioritas Tinggi - Tahap Bisnis)

- [ ] **[MONETISASI] Implementasi Tiering System**: Buat logika untuk membedakan fitur berdasarkan tier pengguna (Free, Starter, Pro, Business) sesuai BAB IV laporan.
- [ ] **[B2B] AURA Score API Gateway**: Sediakan endpoint API bagi lembaga perbankan mitra untuk mengakses skor kredit UMKM secara aman.
- [ ] **[INFRA] Retraining Scheduler**: Implementasi penjadwalan otomatis untuk pelatihan ulang model (*retraining*) setiap 30 hari untuk mencegah *model drift* (Risiko R01).

## 💡 Backlog Fitur (Pengembangan Lanjutan)

- [ ] **[DATA] Multi-Bank Fallback**: Dukungan untuk integrasi lebih dari satu bank sebagai mekanisme *failover* (Risiko R05).
- [ ] **[ANALYTICS] Ensemble Model**: Menggabungkan Prophet dengan ARIMA/LSTM untuk meningkatkan akurasi prediksi saat krisis besar (Risiko R07).
- [ ] **[LEGAL] Audit Log & UU PDP**: Implementasi pencatatan log akses data sensitif sesuai UU Pelindungan Data Pribadi No. 27/2022.

## ✨ UI/UX Enhancement (Interactivity & Modernization)

- [ ] **[ANIMASI] Transisi Halaman & State**: Tambahkan pustaka seperti `framer-motion` untuk memberikan animasi masuk (*entry animations*) yang mulus pada setiap komponen saat halaman dimuat, serta transisi antar-tab yang *fluid*.
- [ ] **[INTERAKSI] Micro-interactions pada Kartu**: Berikan efek skala (*scale up*), pendaran (*hover glow*), dan perubahan warna batas (*border color shift*) saat kursor diarahkan ke kartu metrik utama (Smart Vault, AURA Score, dll) agar UI terasa lebih responsif.
- [ ] **[GRAFIK] Tooltip Kustom & Interaktif**: Perbarui *tooltip* pada grafik Recharts agar memiliki latar belakang *glassmorphism* (blur), menampilkan persentase perubahan dari hari sebelumnya, dan mengikuti gerakan kursor dengan halus.
- [ ] **[TEMA] Dynamic Color Theming**: Sesuaikan warna dominan dashboard (misalnya dari indigo ke merah) secara dinamis berdasarkan "Zone" risiko saat ini (Aman, Kritis, Darurat), sehingga pengguna langsung merasakan urgensi situasi hanya dari palet warna.
- [ ] **[UX] Loading State Skeleton**: Ganti *spinner* dasar dengan efek *skeleton loading* yang elegan (*shimmer effect*) yang mereplika tata letak akhir sebelum data sebenarnya selesai diunduh dari API.
- [ ] **[RESPONSIVITAS] Optimasi Mobile**: Pastikan struktur *sidebar* dan *grid layout* pada `App.jsx` dapat beradaptasi menjadi menu *hamburger* dan tumpukan (*stack*) yang rapi saat diakses melalui perangkat seluler.

---
*Silakan sesuaikan, hapus, atau tambahkan item di atas sesuai dengan berjalannya proses pengembangan proyek.*
