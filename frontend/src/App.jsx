import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  AlertCircle, Zap, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Bell, 
  Activity, Cpu, ShieldAlert, CheckCircle2, ChevronRight, Calendar, Filter,
  LayoutDashboard, PieChart, Settings, LogOut, Menu, X, MessageSquare
} from 'lucide-react';
import AuthPage from './AuthPage';
import LandingPage from './LandingPage';
import { useTheme } from './ThemeContext';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ChatPage from './ChatPage';


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').trim();

/* ─── Color token helper ──────────────────────────────────────────────────── */
const getTokens = () => ({
  surface0: '#030712',
  surface1: '#0a0f1f',
  surface2: '#111827',
  surface3: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  textFaint: '#334155',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderDefault: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  glassBg: 'rgba(15,23,42,0.60)',
  cardBg: 'rgba(255,255,255,0.03)',
  cardShadow: '0 8px 32px rgba(0,0,0,0.40)',
  hoverBg: 'rgba(255,255,255,0.05)',
  overlay: 'rgba(2,6,23,0.80)',
  chartGrid: 'rgba(255,255,255,0.03)',
  chartAxis: 'rgba(255,255,255,0.20)',
  tooltipBg: '#0f172a',
  inputBg: 'rgba(255,255,255,0.04)',
});


// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label, themeColor }) => {
  if (active && payload && payload.length) {
    const t = getTokens();
    return (
      <div className="p-4 rounded-2xl shadow-2xl backdrop-blur-xl" style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${t.borderDefault}` }}>
        <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${themeColor}`}>{new Date(label).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        <div className="flex flex-col gap-1">
          <p className="text-lg font-bold" style={{ color: t.textPrimary }}>Rp {payload[0].value.toLocaleString()}</p>
          <p className="text-xs flex items-center gap-1" style={{ color: t.textSecondary }}>
            <ArrowUpRight size={12} className={themeColor} /> Proyeksi Kas
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// LoginPage digantikan oleh AuthPage yang lebih lengkap (lihat AuthPage.jsx)

// --- Skeleton Loader Component ---
const SkeletonLoader = () => {
  const t = getTokens();
  const skBg = 'rgba(30,41,59,0.3)';
  return (
    <div className="min-h-screen flex p-4 lg:p-10" style={{ background: t.surface0 }}>
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-lg shimmer" style={{ background: skBg }} />
            <div className="h-4 w-48 rounded-lg shimmer" style={{ background: skBg }} />
          </div>
          <div className="h-10 w-32 rounded-full shimmer" style={{ background: skBg }} />
        </div>
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 h-64 rounded-[2.5rem] shimmer" style={{ background: skBg, border: `1px solid ${t.borderSubtle}` }} />
          <div className="col-span-12 lg:col-span-4 h-64 rounded-[2.5rem] shimmer" style={{ background: skBg, border: `1px solid ${t.borderSubtle}` }} />
          <div className="col-span-12 h-96 rounded-[2.5rem] shimmer" style={{ background: skBg, border: `1px solid ${t.borderSubtle}` }} />
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-6 right-6 z-[200] px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm ${
      type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' :
      type === 'error' ? 'bg-rose-500/20 border-rose-500/30 text-rose-300' :
      'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'
    }`}
  >
    <div className="flex items-center gap-3">
      {type === 'success' ? <CheckCircle2 size={20} /> : type === 'error' ? <AlertCircle size={20} /> : <Bell size={20} />}
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={16} /></button>
    </div>
  </motion.div>
);

const App = () => {
  const t = getTokens();
  const navigate = useNavigate();
  const location = useLocation();

  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [withdrawing, setWithdrawing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeframe, setTimeframe] = useState('realtime');
  const [config, setConfig] = useState({
    autoHedging: true,
    riskThreshold: 2500000,
    notificationLevel: 'high',
    vaultAutoLock: true
  });

  // Sync activeTab with URL
  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const validTabs = ['overview', 'analytics', 'vault', 'reports', 'chat'];
    if (validTabs.includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === '/dashboard') {
      setActiveTab('overview');
      navigate('/overview', { replace: true });
    }
  }, [location, navigate]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Historical Data State ---
  const [historicalData, setHistoricalData] = useState(null);
  const [histLoading, setHistLoading] = useState(false);
  const [histDays, setHistDays] = useState(30);
  const [histTypeFilter, setHistTypeFilter] = useState('all');
  const [comparison, setComparison] = useState(null);

  const fetchHistoricalData = async (days = histDays) => {
    setHistLoading(true);
    try {
      const [txnRes, dailyRes, compRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/history/${user.id}?days=${days}${histTypeFilter !== 'all' ? `&txn_type=${histTypeFilter}` : ''}`),
        axios.get(`${API_BASE_URL}/history/daily-summary/${user.id}?days=${days}`),
        axios.get(`${API_BASE_URL}/history/comparison/${user.id}`),
      ]);
      setHistoricalData({ transactions: txnRes.data, daily: dailyRes.data });
      setComparison(compRes.data);
    } catch (e) {
      showToast('Gagal memuat data historis.', 'error');
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    if (timeframe === 'historical') fetchHistoricalData();
  }, [timeframe]);

  useEffect(() => {
    if (timeframe === 'historical') fetchHistoricalData(histDays);
  }, [histDays, histTypeFilter]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn || !user) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/${user.id}`);
        setData(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data riil Anda. Hubungkan rekening Bank/POS untuk memulai.");
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    if (isLoggedIn && user) fetchData();
  }, [isLoggedIn, user]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!isLoggedIn || !user) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/settings/${user.id}`);
        const c = res.data.config;
        setConfig({
          autoHedging: c.auto_hedging,
          riskThreshold: c.risk_threshold,
          notificationLevel: c.notification_level,
          vaultAutoLock: c.vault_auto_lock
        });
      } catch (e) { /* use defaults */ }
    };
    if (isLoggedIn && user) loadSettings();
  }, [isLoggedIn, user]);

  const fetchAuditLogs = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/audit/${user.id}`);
      setAuditLogs(response.data.logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };


  useEffect(() => {
    if (activeTab === 'reports' || showNotifications) {
      fetchAuditLogs();
    }
  }, [activeTab, showNotifications]);

  const handleWithdraw = async () => {
    if (withdrawing) return;
    setWithdrawing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/vault/withdraw`, {
        user_id: String(user.id), amount: 1000000
      });
      showToast('Rp 1.000.000 berhasil ditarik ke rekening utama Anda.', 'success');
      if (response.data?.vault_balance !== undefined) {
        setData(prev => ({
          ...prev,
          hedge: { ...prev.hedge, vault_balance: response.data.vault_balance }
        }));
      }
    } catch (error) {
      showToast(error.response?.data?.detail || 'Penarikan gagal.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDeposit = async () => {
    if (depositing) return;
    setDepositing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/vault/deposit`, {
        user_id: String(user.id), amount: 500000
      });
      showToast('Rp 500.000 berhasil disetor ke Smart Vault.', 'success');
      if (response.data?.vault_balance !== undefined) {
        setData(prev => ({
          ...prev,
          hedge: { ...prev.hedge, vault_balance: response.data.vault_balance }
        }));
      }
    } catch (error) {
      showToast('Deposit gagal.', 'error');
    } finally {
      setDepositing(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put(`${API_BASE_URL}/settings/${user.id}`, {
        auto_hedging: config.autoHedging,
        risk_threshold: config.riskThreshold,
        notification_level: config.notificationLevel,
        vault_auto_lock: config.vaultAutoLock
      });
      showToast('Konfigurasi otonom diperbarui.', 'success');
      setShowSettings(false);
    } catch (error) {
      showToast('Gagal menyimpan konfigurasi.', 'error');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    showToast('AI AURA sedang membaca mutasi Anda...', 'info');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/upload-mutasi/${user.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(response.data.message, 'success');
      // Refresh dashboard data
      const dbRes = await axios.get(`${API_BASE_URL}/dashboard/${user.id}`);
      setData(dbRes.data);
      setShowSettings(false);
    } catch (error) {
      showToast('Gagal memproses mutasi dengan AI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockCapital = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      setIsUnlocking(false);
      if (data?.score?.total_score < 70) {
        showToast(`Score Anda (${data.score.total_score}) belum mencapai threshold 70. Tingkatkan stabilitas kas!`, 'error');
      } else {
        showToast(`Selamat! Limit kredit Rp 250.000.000 disetujui berdasarkan AURA Score ${data.score.total_score}.`, 'success');
      }
    }, 2500);
  };

  const handleVerifyMitigation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reports/verify-mitigation/${user.id}`);
      showToast(response.data.message, 'success');
      fetchAuditLogs();
    } catch (error) {
      showToast('Gagal menjalankan protokol verifikasi.', 'error');
    }
  };

  // Restore session dari localStorage saat app load
  useEffect(() => {
    const token = localStorage.getItem('aura_access_token');
    const savedUser = localStorage.getItem('aura_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch {}
    }
  }, []);

  const handleLogin = (tokenData) => {
    const u = tokenData.user || tokenData;
    setUser(u);
    setIsLoggedIn(true);
    localStorage.setItem('aura_user', JSON.stringify(u));
    navigate('/overview');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setData(null);
    setActiveTab('overview');
    localStorage.removeItem('aura_access_token');
    localStorage.removeItem('aura_refresh_token');
    localStorage.removeItem('aura_user');
    navigate('/');
  };

  // Dynamic Theming based on Risk Zone
  const getThemeConfig = (zone) => {
    switch(zone) {
      case 'Aman': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', fill: '#10b981', icon: <CheckCircle2 size={32} /> };
      case 'Waspada': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', fill: '#f59e0b', icon: <AlertCircle size={32} /> };
      case 'Kritis': return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', fill: '#fb923c', icon: <ShieldAlert size={32} /> };
      case 'Bahaya': return { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', fill: '#fb7185', icon: <ShieldAlert size={32} /> };
      case 'Darurat': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', fill: '#ef4444', icon: <Zap size={32} /> };
      default: return { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', fill: '#6366f1', icon: <Activity size={32} /> };
    }
  };

  const theme = data ? getThemeConfig(data.decision.zone) : getThemeConfig('Aman');

  const renderDashboard = () => {
    if (loading || !data) return <SkeletonLoader />;
    
    if (error) return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: t.surface0 }}>
        <div className="p-10 rounded-[2.5rem] text-center" style={{ background: t.cardBg, border: '1px solid rgba(244,63,94,0.2)', boxShadow: t.cardShadow }}>
          <ShieldAlert size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: t.textPrimary }}>Terjadi Kesalahan</h2>
          <p className="mb-6" style={{ color: t.textSecondary }}>{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 font-bold rounded-xl uppercase tracking-tighter italic" style={{ background: '#fff', color: '#0f172a' }}>Coba Lagi</button>
        </div>
      </div>
    );

    const { prediction, decision, forecast, score, hedge } = data;
    
    return (
      <div className="min-h-screen flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30 overflow-hidden relative" style={{ background: t.surface0, color: t.textSecondary }}>

      
      {/* Background Dynamic Glow */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${theme.bg} rounded-full blur-[120px] pointer-events-none opacity-50 transition-colors duration-1000`} />
      
      {/* Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 z-50 sticky top-0 backdrop-blur-xl" style={{ borderBottom: `1px solid ${t.borderSubtle}`, background: t.glassBg }}>
        <div className="flex items-center gap-2">
          <Zap size={20} className={theme.color} />
          <span className="font-black italic tracking-widest" style={{ color: t.textPrimary }}>AURA</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg" style={{ background: t.hoverBg }}>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:sticky top-0 left-0 h-screen w-64 flex flex-col items-stretch z-40 backdrop-blur-xl"
            style={{ borderRight: `1px solid ${t.borderSubtle}`, background: 'rgba(3,7,18,0.95)' }}
          >
            <div className="hidden lg:flex p-8 mb-4 items-center gap-3">
              <div className={`h-10 w-10 ${theme.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                <Zap size={24} className={theme.color} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic" style={{ color: t.textPrimary }}>AURA</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 lg:mt-0">
              {[
                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Ikhtisar' },
                { id: 'analytics', icon: <Activity size={20} />, label: 'Analitik Mendalam' },
                { id: 'vault', icon: <Wallet size={20} />, label: 'Brankas Pintar' },
                { id: 'reports', icon: <PieChart size={20} />, label: 'Laporan Oracle' },
                { id: 'chat', icon: <MessageSquare size={20} />, label: 'AURA Assistant' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { navigate(`/${item.id}`); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? `${theme.bg} ${theme.color} border ${theme.border}` : ''}`}
                  style={activeTab !== item.id ? { color: t.textMuted } : {}}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              
              <div className="pt-4 mt-2 mb-2 border-t border-white/5">
                <label className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent group">
                  <div className="p-1 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                    <Zap size={18} />
                  </div>
                  <span className="font-medium text-sm">Upload Mutasi Bank</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </nav>

            <div className="p-6 space-y-2" style={{ borderTop: `1px solid ${t.borderSubtle}` }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-full flex items-center gap-4 px-4 py-3 transition-colors relative rounded-xl"
                style={{ color: t.textMuted }}
              >
                <Bell size={20} />
                <span>Notifikasi</span>
                {auditLogs.length > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full" />}
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-4 px-4 py-3 transition-colors rounded-xl"
                style={{ color: t.textMuted }}
              >
                <Settings size={20} />
                <span>Pengaturan</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <LogOut size={20} />
                <span>Keluar</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10"
      >
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: t.textPrimary }}>
              {activeTab === 'overview' && 'Kecerdasan Finansial'}
              {activeTab === 'analytics' && 'Mesin Analitik Mendalam'}
              {activeTab === 'vault' && 'Brankas Pintar Otonom'}
              {activeTab === 'reports' && 'Laporan Kecerdasan Oracle'}
            </h2>
            <p style={{ color: t.textMuted }}>Pemrosesan otonom aktif <span className={`inline-block w-2 h-2 ${theme.bg.replace('/10','')} rounded-full ml-2 animate-pulse`} /></p>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 self-end lg:self-auto">
            <div className="hidden sm:flex p-1 rounded-xl" style={{ background: t.hoverBg, border: `1px solid ${t.borderSubtle}` }}>
              <button 
                onClick={() => setTimeframe('realtime')}
                className="px-4 py-1.5 text-xs rounded-lg transition-colors"
                style={timeframe === 'realtime' ? { fontWeight: 600, background: 'rgba(255,255,255,0.10)', color: t.textPrimary } : { fontWeight: 500, color: t.textMuted }}
              >
                Waktu Nyata
              </button>
              <button 
                onClick={() => { setTimeframe('historical'); showToast('Memuat data historis terenkripsi...', 'info'); }}
                className="px-4 py-1.5 text-xs rounded-lg transition-colors"
                style={timeframe === 'historical' ? { fontWeight: 600, background: 'rgba(255,255,255,0.10)', color: t.textPrimary } : { fontWeight: 500, color: t.textMuted }}
              >
                Historis
              </button>
            </div>
            <div className="relative cursor-pointer group">
              <div className={`absolute -top-1 -right-1 h-3 w-3 ${theme.bg.replace('/10','')} rounded-full z-10 animate-bounce`} style={{ border: `2px solid ${t.surface0}` }} />
              <Bell className="group-hover:opacity-80 transition-colors" style={{ color: t.textMuted }} />
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 p-0.5 cursor-pointer">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name || 'User'} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full flex items-center justify-center font-bold text-sm" style={{ background: t.surface1, color: t.textPrimary }}>
                  {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'chat' && (
              <ChatPage user={user} />
            )}

            {activeTab === 'overview' && timeframe === 'historical' && (
              <div className="space-y-8">
                {/* Header Banner */}
                <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-amber-400" />
                    <span className="text-amber-300 text-sm font-bold">Mode Historis Aktif — Data Terenkripsi AES-256</span>
                  </div>
                  <button onClick={() => setTimeframe('realtime')} className="text-xs text-amber-400 font-black uppercase tracking-widest hover:text-amber-200 transition-colors">
                    Kembali ke Waktu Nyata →
                  </button>
                </div>

                {/* Comparison KPI Cards */}
                {comparison && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Pemasukan', thisVal: comparison.this_month.income, pct: comparison.changes.income_pct, color: 'emerald' },
                      { label: 'Total Pengeluaran', thisVal: comparison.this_month.expense, pct: comparison.changes.expense_pct, color: 'rose' },
                      { label: 'Arus Kas Bersih', thisVal: comparison.this_month.net, pct: comparison.changes.net_pct, color: 'indigo' },
                    ].map((kpi) => {
                      const isUp = kpi.pct >= 0;
                      const isExpense = kpi.label === 'Total Pengeluaran';
                      const isPositive = isExpense ? !isUp : isUp;
                      return (
                        <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">{kpi.label}</p>
                          <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2">
                            Rp {Math.abs(kpi.thisVal).toLocaleString('id-ID')}
                          </h3>
                          <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{Math.abs(kpi.pct)}% vs {comparison.last_month.label}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Daily Chart */}
                <motion.div className="glass-card rounded-[2rem] p-6 lg:p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity size={20} className="text-indigo-400" /> Ringkasan Harian
                      </h4>
                      <p className="text-slate-500 text-sm">Pemasukan vs Pengeluaran dari database terenkripsi</p>
                    </div>
                    <div className="flex gap-2">
                      {[7, 30, 60, 90].map(d => (
                        <button key={d} onClick={() => setHistDays(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${histDays === d ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                          {d}H
                        </button>
                      ))}
                    </div>
                  </div>
                  {histLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : historicalData?.daily ? (
                    <div className="h-64 lg:h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={historicalData.daily.daily_series.filter(d => d.income > 0 || d.expense > 0)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                            formatter={(val, name) => [`Rp ${Number(val).toLocaleString('id-ID')}`, name === 'income' ? 'Pemasukan' : 'Pengeluaran']}
                            labelFormatter={(v) => new Date(v).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                          />
                          <Legend formatter={(v) => v === 'income' ? 'Pemasukan' : 'Pengeluaran'} />
                          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                          <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} fillOpacity={0.7} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                </motion.div>

                {/* Transaction Table */}
                <motion.div className="glass-card rounded-[2rem] p-6 lg:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h4 className="text-xl font-bold text-white flex items-center gap-2">
                      <Filter size={20} className="text-indigo-400" /> Riwayat Mutasi
                    </h4>
                    <div className="flex gap-2">
                      {[['all', 'Semua'], ['income', 'Masuk'], ['expense', 'Keluar']].map(([val, label]) => (
                        <button key={val} onClick={() => setHistTypeFilter(val)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${histTypeFilter === val ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {histLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 rounded-2xl bg-white/5 shimmer" />
                      ))}
                    </div>
                  ) : historicalData?.transactions?.transactions?.length > 0 ? (
                    <>
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {historicalData.transactions.transactions.map((txn) => (
                          <motion.div key={txn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-xl ${txn.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {txn.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{txn.description}</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase">
                                  {new Date(txn.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm font-black ${txn.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {txn.type === 'income' ? '+' : '-'} Rp {txn.amount.toLocaleString('id-ID')}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Masuk</p>
                          <p className="text-emerald-400 font-black">Rp {historicalData.transactions.summary.total_income.toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Keluar</p>
                          <p className="text-rose-400 font-black">Rp {historicalData.transactions.summary.total_expense.toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Arus Kas Bersih</p>
                          <p className={`font-black ${historicalData.transactions.summary.net_cashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            Rp {historicalData.transactions.summary.net_cashflow.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-16 text-slate-500 italic">
                      Tidak ada mutasi ditemukan untuk periode ini.
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'overview' && timeframe === 'realtime' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Main Status Area */}
                <div className="col-span-1 lg:col-span-8 space-y-6 lg:space-y-8">
                  
                  {/* Welcome/Empty State Banner */}
                  {score.tier === "Belum Cukup Data" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-[2.5rem] p-8 lg:p-12 border border-indigo-500/30 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent backdrop-blur-xl group"
                    >
                      <div className="absolute top-0 right-0 -mr-10 -mt-10 h-64 w-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Siapkan Kecerdasan Finansial Anda</span>
                          </div>
                          <h2 className="text-4xl lg:text-5xl font-black text-white italic tracking-tighter leading-none">SELAMAT DATANG <br/> DI AURA</h2>
                          <p className="text-slate-400 text-sm lg:text-lg leading-relaxed max-w-xl">
                            AURA membutuhkan data transaksi untuk mulai memprediksi arus kas dan melindungi bisnis Anda secara otonom. Mulailah dengan mengunggah mutasi bank Anda.
                          </p>
                          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                            <label className="cursor-pointer group/btn relative overflow-hidden bg-white text-slate-950 font-black px-8 py-4 rounded-2xl transition-all active:scale-[0.98] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 italic uppercase tracking-tighter text-sm">
                              <Zap size={20} className="text-indigo-600" />
                              Upload Mutasi Sekarang
                              <input 
                                type="file" 
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                            <button className="px-8 py-4 rounded-2xl font-bold text-sm border border-white/10 text-white hover:bg-white/5 transition-colors">Pelajari Cara Kerja</button>
                          </div>
                        </div>
                        <div className="hidden lg:block w-48 h-48 relative">
                          <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-20"></div>
                          <div className="relative z-10 w-full h-full bg-indigo-500/10 border border-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-2xl">
                            <Activity size={64} className="text-indigo-400 animate-float" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Massive Status Hero */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className={`relative overflow-hidden rounded-[2rem] border ${theme.border} ${theme.bg} p-6 lg:p-10 group transition-all duration-300`}
                  >
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-current opacity-[0.05] blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-8">
                      <div className="space-y-2 lg:space-y-4">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className={`${theme.color} animate-float`}>{theme.icon}</div>
                          <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] ${theme.color}`}>Tingkat Prioritas Sistem</span>
                        </div>
                        <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase" style={{ color: t.textPrimary }}>{decision.zone}</h3>
                        <p className="max-w-md leading-relaxed text-sm lg:text-lg" style={{ color: t.textSecondary }}>{decision.action}</p>
                      </div>
                      <div className="glass p-6 lg:p-8 rounded-3xl border border-white/10 w-full md:w-72 mt-4 md:mt-0">
                        <div className="flex justify-between items-end mb-4">
                          <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-500">Probabilitas Defisit</span>
                          <span className={`text-xl lg:text-2xl font-black ${theme.color}`}>{(prediction.probability_deficit * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 lg:h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${prediction.probability_deficit * 100}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${theme.bg.replace('/10', '')}`}
                          ></motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* The Oracle Forecast Chart Area */}
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" }}
                    className="glass-card rounded-[2rem] p-6 lg:p-10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 lg:mb-10 gap-4">
                      <div>
                        <h4 className="text-xl lg:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                          <Cpu size={20} className={theme.color} /> PROYEKSI ORACLE
                        </h4>
                        <p className="text-slate-500 text-xs lg:text-sm">Proyeksi arus kas ensemble deep learning</p>
                      </div>
                      <div className="flex gap-4 lg:gap-6">
                        <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span className={`h-1.5 w-1.5 rounded-full ${theme.bg.replace('/10', '')}`}></span> Proyeksi
                        </div>
                      </div>
                    </div>
                    <div className="h-64 lg:h-80 w-full min-h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecast}>
                          <defs>
                            <linearGradient id="colorTheme" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.fill} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={theme.fill} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                          <XAxis 
                            dataKey="ds" 
                            tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            tickMargin={10}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis hide domain={['auto', 'auto']} />
                          <Tooltip content={<CustomTooltip themeColor={theme.color} />} cursor={{ stroke: t.borderDefault, strokeWidth: 2 }} />
                          <Area type="monotone" dataKey="yhat_upper" stroke="none" fill={theme.fill} fillOpacity={0.05} />
                          <Area type="monotone" dataKey="yhat_lower" stroke="none" fill={theme.fill} fillOpacity={0.05} />
                          <Area type="monotone" dataKey="yhat" stroke={theme.fill} strokeWidth={3} fill="url(#colorTheme)" animationDuration={2000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Score & Metrics */}
                <div className="col-span-1 lg:col-span-4 space-y-6 lg:space-y-8">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="glass-card rounded-[2rem] p-6 lg:p-10 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 ${theme.bg.replace('/10', '')} opacity-50`}></div>
                    <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 lg:mb-8">Skor Eksklusif AURA</h4>
                    <div className="relative mb-6 lg:mb-8">
                      <div className="h-40 w-40 lg:h-48 lg:w-48 rounded-full border-8 lg:border-[10px] border-white/5 flex flex-col items-center justify-center relative shadow-inner">
                        <div className={`absolute inset-0 rounded-full border-t-8 lg:border-t-[10px] ${theme.border.replace('border-', 'border-t-').replace('/20', '')} rotate-[45deg] group-hover:rotate-[360deg] transition-transform duration-[3000ms] ease-out`}></div>
                        <span className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter">{score.total_score}</span>
                        <span className={`text-[0.5em] lg:text-[0.6em] font-black uppercase tracking-widest ${theme.color} mt-1`}>Poin</span>
                      </div>
                    </div>
                    <div className={`${theme.bg} ${theme.border} border px-4 lg:px-6 py-2 rounded-full mb-6 lg:mb-8`}>
                      <span className={`${theme.color} text-xs lg:text-sm font-bold tracking-tight italic uppercase`}>{score.rating}</span>
                    </div>
                    <div className="w-full space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                      {Object.entries(score.dimensions).map(([key, val], idx) => (
                        <div key={key} className="flex flex-col gap-1 lg:gap-1.5">
                          <div className="flex justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                            <span>{key}</span>
                            <span className="text-slate-300">{val}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }} className={`h-full rounded-full ${val > 80 ? 'bg-emerald-500' : val > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={handleUnlockCapital}
                      disabled={isUnlocking}
                      className={`w-full group/btn relative overflow-hidden bg-white text-slate-950 font-black py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2 italic uppercase tracking-tighter text-sm">
                        {isUnlocking ? 'Memindai Keuangan...' : 'Buka Modal'} 
                        {!isUnlocking && <ChevronRight size={16} />}
                      </span>
                      {isUnlocking && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-indigo-500/10"></motion.div>}
                    </button>
                  </motion.div>

                  <motion.div 
                    whileHover={{ x: 5 }}
                    onClick={() => setActiveTab('vault')}
                    className="glass-card rounded-[2rem] p-6 lg:p-8 border-l-4 border-l-indigo-500 group cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4 lg:mb-6">
                      <div className="p-2 lg:p-3 bg-indigo-600/10 text-indigo-400 rounded-xl lg:rounded-2xl">
                        <Wallet size={20} className="lg:w-6 lg:h-6" />
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs lg:text-sm font-medium mb-1">Saldo Brankas Pintar</p>
                    <h3 className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter mb-4">Rp {(hedge.vault_balance || 0).toLocaleString()}</h3>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs text-indigo-400 font-bold group-hover:gap-3 transition-all uppercase tracking-tighter">Kelola Brankas <ChevronRight size={14} /></div>
                  </motion.div>

                  {/* removed AI Upload Card */}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Detailed Dimension breakdown */}
                  {Object.entries(score.dimensions).map(([key, val]) => (
                    <div key={key} className="glass-card p-6 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Analisis {key}</p>
                      <h4 className="text-2xl font-bold text-white mb-4">{val}%</h4>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                        <div className={`h-full ${val > 80 ? 'bg-emerald-500' : 'bg-amber-500'} rounded-full`} style={{ width: `${val}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {key === 'stability' && "Menganalisis konsistensi dan volatilitas pendapatan selama 30 hari terakhir."}
                        {key === 'growth' && "Mengevaluasi tren pendapatan dan ekspansi kuartal ke kuartal."}
                        {key === 'resilience' && "Mengukur kecepatan pemulihan dari guncangan arus kas dan pemanfaatan brankas pintar."}
                        {key === 'liquidity' && "Ketersediaan kas saat ini vs kewajiban operasional terdekat."}
                        {key === 'predictability' && "Akurasi peramalan vs mutasi arus kas yang direalisasikan sebenarnya."}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="glass-card p-8 rounded-[2rem]">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3"><TrendingUp size={24} className="text-indigo-400" /> Simulasi Dampak Ekonomi</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="py-4 text-[10px] font-black uppercase text-slate-500">Metrik</th>
                          <th className="py-4 text-[10px] font-black uppercase text-slate-500">Batas Dasar (Tanpa AURA)</th>
                          <th className="py-4 text-[10px] font-black uppercase text-slate-500">Dengan AURA (12b)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        <tr className="border-b border-white/5">
                          <td className="py-4 font-medium text-slate-300">Peluang Bertahan (&gt;3 thn)</td>
                          <td className="py-4 text-slate-500">~40%</td>
                          <td className="py-4 text-emerald-400 font-bold">&gt; 65% (+62.5%)</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 font-medium text-slate-300">Dana Darurat</td>
                          <td className="py-4 text-slate-500">Rp 0</td>
                          <td className="py-4 text-emerald-400 font-bold">Rp 28Jt (Otomatis)</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-4 font-medium text-slate-300">Akses Kredit</td>
                          <td className="py-4 text-slate-500">~15% Berhasil</td>
                          <td className="py-4 text-emerald-400 font-bold">&gt; 45% Berhasil</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="space-y-8">
                <div className={`glass-card p-10 rounded-[2.5rem] border ${theme.border} ${theme.bg}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-2xl"><Wallet className={theme.color} size={32} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Modal Diamankan</p>
                          <h2 className="text-5xl font-black text-white italic tracking-tighter">Rp {(hedge.vault_balance || 0).toLocaleString()}</h2>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {decision.zone === 'Darurat' ? 'TERKUNCI' : 'AKTIF'}</span>
                        <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lindung Nilai: {decision.hedging_percentage * 100}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <button 
                        onClick={handleWithdraw}
                        disabled={withdrawing || decision.zone === 'Darurat'}
                        className={`flex-1 md:flex-none px-8 py-4 ${withdrawing ? 'bg-slate-300' : 'bg-white'} text-slate-950 font-black rounded-2xl italic uppercase tracking-tighter text-sm hover:shadow-xl transition-all disabled:opacity-50`}
                      >
                        {withdrawing ? 'Memproses...' : 'Tarik (Rp 1Jt)'}
                      </button>
                      <button 
                        onClick={handleDeposit}
                        disabled={depositing}
                        className="flex-1 md:flex-none px-8 py-4 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black rounded-2xl italic uppercase tracking-tighter text-sm hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                      >
                        {depositing ? 'Memproses...' : 'Setor (Rp 500Rb)'}
                      </button>
                      <button 
                        onClick={() => setShowSettings(true)}
                        className="flex-1 md:flex-none px-8 py-4 bg-white/5 text-white border border-white/10 font-black rounded-2xl italic uppercase tracking-tighter text-sm hover:bg-white/10 transition-all"
                      >
                        Pengaturan
                      </button>
                    </div>
                  </div>
                </div>
                <div className="glass-card p-8 rounded-[2rem]">
                  <h4 className="text-xl font-bold text-white mb-6">Mutasi Brankas Terbaru</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ArrowUpRight size={16} /></div>
                        <div>
                          <p className="text-sm font-bold text-white">Eksekusi Lindung Nilai Berbasis Risiko</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black">Berhasil • Hari ini 08:00 WIB</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-emerald-400">+ Rp {hedge.amount_hedged?.toLocaleString()}</p>
                    </div>
                    <div className="text-center py-10">
                      <p className="text-slate-500 text-sm italic">Mutasi historis dienkripsi melalui AES-256 (Arsitektur Zero Knowledge)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-indigo-500/30 transition-all cursor-pointer">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <PieChart className="text-indigo-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2 italic">Laporan Volatilitas Bulanan</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">Tinjauan mendalam tentang pola volatilitas bisnis Anda dan perkembangan Skor AURA selama 30 hari terakhir.</p>
                    <button 
                      onClick={() => { setActiveTab('analytics'); showToast('Mengarahkan ke Analitik Mendalam...', 'info'); }}
                      className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Lihat Analisis Penuh <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="glass-card p-8 rounded-[2rem] border border-white/5 group hover:border-emerald-500/30 transition-all cursor-pointer">
                    <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <ShieldAlert className="text-emerald-400" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2 italic">Audit Mitigasi Risiko</h4>
                    <p className="text-sm text-slate-500 leading-relaxed mb-6">Verifikasi tindakan otonom yang diambil oleh agen AURA untuk melindungi modal Anda selama zona berisiko tinggi.</p>
                    <button 
                      onClick={handleVerifyMitigation}
                      className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Verifikasi Tindakan <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-[2rem]">
                  <h4 className="text-xl font-bold text-white mb-6">Log Kecerdasan Audit</h4>
                  <div className="space-y-4">
                    {auditLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${log.action === 'WITHDRAWAL' ? 'bg-orange-500/10 text-orange-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <Activity size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{log.action} - {log.resource.toUpperCase()}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black">{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.status}</p>
                          <p className="text-xs text-slate-500">{log.details}</p>
                        </div>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <div className="text-center py-10 text-slate-500 text-sm italic">
                        Tidak ada log aktivitas terbaru yang ditemukan.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {/* --- Settings Modal --- */}
        <AnimatePresence>
          {showSettings && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSettings(false)} className="absolute inset-0 backdrop-blur-sm" style={{ background: t.overlay }} />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg p-10 rounded-[2.5rem] shadow-2xl" style={{ background: t.surface1, border: `1px solid ${t.borderDefault}`, boxShadow: t.cardShadow }}>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: t.textPrimary }}>Konfigurasi Sistem</h3>
                  <button onClick={() => setShowSettings(false)} className="p-2 rounded-full transition-colors" style={{ color: t.textMuted }}><X size={20} /></button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: t.hoverBg, border: `1px solid ${t.borderSubtle}` }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: t.textPrimary }}>Lindung Nilai Otonom</p>
                      <p className="text-[10px] font-bold uppercase" style={{ color: t.textMuted }}>Perlindungan otomatis saat risiko tinggi</p>
                    </div>
                    <button onClick={() => setConfig({...config, autoHedging: !config.autoHedging})} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${config.autoHedging ? 'bg-indigo-500 justify-end' : 'justify-start'}`} style={!config.autoHedging ? { background: t.surface3 } : {}}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: t.hoverBg, border: `1px solid ${t.borderSubtle}` }}>
                    <div>
                      <p className="text-sm font-bold" style={{ color: t.textPrimary }}>Kunci Otomatis Brankas</p>
                      <p className="text-[10px] font-bold uppercase" style={{ color: t.textMuted }}>Kunci brankas di zona Darurat</p>
                    </div>
                    <button onClick={() => setConfig({...config, vaultAutoLock: !config.vaultAutoLock})} className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${config.vaultAutoLock ? 'bg-emerald-500 justify-end' : 'justify-start'}`} style={!config.vaultAutoLock ? { background: t.surface3 } : {}}>
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: t.textMuted }}>Ambang Kritis (IDR)</label>
                    <input type="number" value={config.riskThreshold} onChange={(e) => setConfig({...config, riskThreshold: Number(e.target.value)})} className="w-full rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" style={{ background: t.inputBg, border: `1px solid ${t.borderDefault}`, color: t.textPrimary }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: t.textMuted }}>Tingkat Notifikasi</label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map(level => (
                        <button key={level} onClick={() => setConfig({...config, notificationLevel: level})} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${config.notificationLevel === level ? 'bg-indigo-500 text-white' : ''}`} style={config.notificationLevel !== level ? { background: t.hoverBg, color: t.textMuted } : {}}>{level}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveSettings} className="w-full mt-10 font-black py-4 rounded-2xl italic uppercase tracking-tighter hover:shadow-xl transition-all active:scale-[0.98]" style={{ background: '#fff', color: '#0f172a' }}>Simpan Perubahan</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- Notification Panel --- */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} className="fixed inset-0 z-[90]" style={{ background: t.overlay }} />
              <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md backdrop-blur-2xl z-[100] p-8 shadow-2xl overflow-y-auto" style={{ background: 'rgba(10,15,30,0.97)', borderLeft: `1px solid ${t.borderDefault}` }}>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter" style={{ color: t.textPrimary }}>Pusat Notifikasi</h3>
                  <button onClick={() => setShowNotifications(false)} className="p-2 rounded-full transition-colors" style={{ color: t.textMuted }}><X size={20} /></button>
                </div>
                <div className="space-y-3">
                  {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                    <div key={i} className="p-4 rounded-2xl transition-all" style={{ background: t.hoverBg, border: `1px solid ${t.borderSubtle}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${log.action === 'WITHDRAWAL' ? 'text-orange-400' : log.action === 'DEPOSIT' ? 'text-emerald-400' : log.action === 'CONFIG_UPDATE' ? 'text-amber-400' : 'text-indigo-400'}`}>{log.action}</span>
                        <span className="text-[9px] font-black uppercase" style={{ color: t.textFaint }}>{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                      </div>
                      <p className="text-xs font-medium" style={{ color: t.textSecondary }}>{log.details || log.resource}</p>
                    </div>
                  )) : (
                    <div className="text-center py-20 italic text-sm" style={{ color: t.textFaint }}>Belum ada notifikasi.</div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- Toast --- */}
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </main>
    </div>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage onNavigateToAuth={() => navigate('/login')} />} />
          <Route path="/login" element={<AuthPage mode="login" onLogin={handleLogin} onBack={() => navigate('/')} />} />
          <Route path="/register" element={<AuthPage mode="register" onLogin={handleLogin} onBack={() => navigate('/')} />} />
          <Route path="/auth/callback" element={<AuthPage mode="callback" onLogin={handleLogin} onBack={() => navigate('/')} />} />
          
          {['overview', 'analytics', 'vault', 'reports', 'chat'].map(tab => (
            <Route key={tab} path={`/${tab}`} element={isLoggedIn ? renderDashboard() : <Navigate to="/login" />} />
          ))}
          
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </AnimatePresence>
    </>
  );
}


export default App;
