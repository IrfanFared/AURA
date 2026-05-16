import sqlite3
from datetime import datetime, timedelta
import random
import os

# Path ke database (sesuaikan jika di Cloud Run menggunakan path lain, tapi untuk lokal ini standar)
db_path = os.path.join(os.path.dirname(__file__), 'aura.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Bersihkan data lama agar demo bersih
try:
    cursor.execute("DELETE FROM transactions")
    print("🧹 Membersihkan data lama...")
except:
    pass

# Buat data 60 hari ke belakang agar grafik Forecast terlihat bagus
today = datetime.now()
descriptions = ["Pembayaran Supplier", "Sewa Cloud", "Gaji Karyawan", "Restock Stok", "Biaya Listrik"]

print("🚀 Menghasilkan data transaksi untuk demo...")
for i in range(60, 0, -1):
    txn_date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
    
    # 1. Simulasi Pemasukan (Ada tren pertumbuhan sedikit)
    growth_factor = (60 - i) * 50000
    amount_in = random.uniform(3000000, 6000000) + growth_factor
    cursor.execute("INSERT INTO transactions (date, amount, type, description) VALUES (?, ?, ?, ?)",
                   (txn_date, amount_in, 'income', f"Penjualan Harian #{60-i}"))
    
    # 2. Simulasi Pengeluaran (Acak)
    if random.random() > 0.4: # 60% peluang ada pengeluaran harian
        amount_out = random.uniform(1000000, 3500000)
        cursor.execute("INSERT INTO transactions (date, amount, type, description) VALUES (?, ?, ?, ?)",
                       (txn_date, amount_out, 'expense', random.choice(descriptions)))

conn.commit()
conn.close()
print("✅ Selesai! Script seed_demo.py siap digunakan untuk demo.")
