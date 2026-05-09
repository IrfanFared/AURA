import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Wallet, ShieldAlert, ChevronRight, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTheme } from './ThemeContext';

const LandingPage = ({ onNavigateToAuth }) => {
  const { isDark } = useTheme();

  const themeConfig = {
    surface: isDark ? '#030712' : '#f8fafc',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    cardBg: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  const features = [
    {
      id: 'oracle',
      title: 'The Oracle Forecast',
      desc: 'Proyeksi arus kas masa depan secara probabilistik dengan tingkat akurasi tinggi, memberikan pandangan ke depan hingga 90 hari.',
      icon: <Activity size={32} className="text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-500/0',
      border: 'border-indigo-500/20'
    },
    {
      id: 'vault',
      title: 'Autonomous Smart Vault',
      desc: 'Sistem micro-hedging otomatis yang menyisihkan dana cadangan berdasarkan prediksi risiko kas, melindungi UMKM dari krisis.',
      icon: <Wallet size={32} className="text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-500/0',
      border: 'border-emerald-500/20'
    },
    {
      id: 'score',
      title: 'AURA Score',
      desc: 'Profil kredit alternatif berbasis pola transaksi riil untuk membuka akses permodalan dari perbankan secara lebih mudah.',
      icon: <TrendingUp size={32} className="text-amber-400" />,
      color: 'from-amber-500/20 to-amber-500/0',
      border: 'border-amber-500/20'
    }
  ];

  return (
    <div className="min-h-screen overflow-hidden selection:bg-indigo-500/30" style={{ background: themeConfig.surface }}>
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 lg:px-12 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase" style={{ color: themeConfig.textPrimary }}>AURA</span>
        </div>
        <div>
          <button 
            onClick={onNavigateToAuth}
            className="px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
          >
            Masuk / Daftar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 lg:px-12 pt-16 lg:pt-32 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8"
            style={{ borderColor: themeConfig.borderColor, background: themeConfig.cardBg }}
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: themeConfig.textSecondary }}>Virtual CFO untuk UMKM</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight"
            style={{ color: themeConfig.textPrimary }}
          >
            Autonomous Risk & <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 italic pr-2">Cashflow Assistant</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl max-w-2xl mb-10"
            style={{ color: themeConfig.textSecondary }}
          >
            Platform kecerdasan buatan pertama di Indonesia yang memprediksi, melindungi, dan menumbuhkan arus kas UMKM secara otonom.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <button 
              onClick={onNavigateToAuth}
              className="px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-xl shadow-indigo-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase italic tracking-tighter"
            >
              Mulai Sekarang <ChevronRight size={20} />
            </button>
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl font-bold text-lg border hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              style={{ borderColor: themeConfig.borderColor, color: themeConfig.textPrimary }}
            >
              Pelajari Lebih Lanjut
            </button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-24">
          {features.map((feat, index) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
              className={`p-8 rounded-[2rem] border bg-gradient-to-b ${feat.color} backdrop-blur-xl transition-all hover:-translate-y-2`}
              style={{ borderColor: themeConfig.borderColor, backgroundColor: themeConfig.cardBg }}
            >
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center border ${feat.border} bg-white/5`}>
                {feat.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight" style={{ color: themeConfig.textPrimary }}>
                {feat.title}
              </h3>
              <p className="leading-relaxed" style={{ color: themeConfig.textSecondary }}>
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-32 p-10 lg:p-16 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative"
          style={{ borderColor: themeConfig.borderColor, backgroundColor: themeConfig.cardBg }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl lg:text-4xl font-black mb-4 tracking-tighter" style={{ color: themeConfig.textPrimary }}>
              Masa Depan UMKM
            </h2>
            <p className="mb-6" style={{ color: themeConfig.textSecondary }}>
              Beralih dari pencatatan reaktif menjadi pengelolaan kas proaktif. AURA meningkatkan probabilitas UMKM bertahan lebih dari 3 tahun hingga 65%.
            </p>
            <ul className="space-y-3">
              {['Proyeksi Probabilistik Gaussian', 'Micro-hedging Terintegrasi', 'Analisis Data Historis Aman'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium" style={{ color: themeConfig.textPrimary }}>
                  <CheckCircle2 size={18} className="text-emerald-500" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 w-full md:w-auto">
            <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl bg-indigo-950/40 backdrop-blur-md rotate-3 transform transition-transform hover:rotate-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                  <ShieldAlert size={24} className="text-white" />
                </div>
                <div>
                  <div className="text-xs text-indigo-200 font-bold uppercase tracking-widest">Status Proteksi</div>
                  <div className="text-xl font-black text-white italic">AKTIF (99.9%)</div>
                </div>
              </div>
              <div className="h-2 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[99.9%]"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t relative z-10" style={{ borderColor: themeConfig.borderColor }}>
        <p className="text-xs uppercase tracking-widest font-bold" style={{ color: themeConfig.textSecondary }}>
          © 2026 Tim MatchaLatte · AURA Platform
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
