import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-backend-897592630558.asia-southeast1.run.app/api/v1').trim();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/* ─── Google Sign-In Script Loader ─────────────────────────────────────────── */
function useGoogleSignIn(onSuccess) {
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: onSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [onSuccess]);
}


/* ─── Input Field ──────────────────────────────────────────────────────────── */
const InputField = ({ icon: Icon, type, placeholder, value, onChange, id, isDark }) => {
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
        style={{ color: isDark ? '#475569' : '#94a3b8' }}>
        <Icon size={17} />
      </div>
      <input
        id={id}
        type={isPw && showPw ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={isPw ? 'current-password' : type === 'email' ? 'email' : 'off'}
        className="w-full rounded-2xl pl-11 py-4 text-sm outline-none transition-all duration-200"
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          color: isDark ? '#f8fafc' : '#0f172a',
          paddingRight: isPw ? '3rem' : '1.25rem',
        }}
      />
      {isPw && (
        <button type="button" onClick={() => setShowPw(!showPw)}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
          style={{ color: isDark ? '#475569' : '#94a3b8' }}>
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

/* ─── Google Button ────────────────────────────────────────────────────────── */
const GoogleButton = ({ onClick, loading, label = 'Masuk dengan Google', isDark }) => (
  <button type="button" onClick={onClick} disabled={loading}
    className="w-full font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 text-sm"
    style={{
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      color: isDark ? '#e2e8f0' : '#334155',
    }}>
    {loading ? <Loader2 size={18} className="animate-spin" /> : (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    )}
    {label}
  </button>
);

/* ─── Alert ─────────────────────────────────────────────────────────────────── */
const Alert = ({ message, type }) => (
  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
      type === 'error'
        ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500'
        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
    }`}>
    {type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
    {message}
  </motion.div>
);

/* ─── Divider ──────────────────────────────────────────────────────────────── */
const Divider = ({ text = 'Atau lanjutkan dengan', isDark }) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full" style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }} />
    </div>
    <div className="relative flex justify-center">
      <span className="px-4 text-[10px] uppercase font-black tracking-widest"
        style={{ background: isDark ? '#0a0f1f' : '#ffffff', color: isDark ? '#475569' : '#94a3b8' }}>
        {text}
      </span>
    </div>
  </div>
);

/* ─── Login Form ───────────────────────────────────────────────────────────── */
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleGoogleCredential = useCallback(async ({ credential }) => {
    setGoogleLoading(true); setAlert(null);
    try { const res = await axios.post(`${API_BASE_URL}/auth/google/verify`, { credential }); onSuccess(res.data); }
    catch (err) { setAlert({ type: 'error', message: err.response?.data?.detail || 'Login Google gagal.' }); }
    finally { setGoogleLoading(false); }
  }, [onSuccess]);
  useGoogleSignIn(handleGoogleCredential);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) { window.location.href = `${API_BASE_URL}/auth/google`; return; }
    window.google ? window.google.accounts.id.prompt() : (window.location.href = `${API_BASE_URL}/auth/google`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setAlert(null);
    try { const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }); onSuccess(res.data); }
    catch (err) { setAlert({ type: 'error', message: err.response?.data?.detail || 'Login gagal.' }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alert && <Alert {...alert} />}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Alamat Email</label>
        <InputField id="login-email" icon={Mail} type="email" placeholder="nama@perusahaan.com" value={email} onChange={e => setEmail(e.target.value)} isDark={isDark} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Kata Sandi</label>
        <InputField id="login-password" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} isDark={isDark} />
      </div>
      <button type="submit" disabled={loading || !email || !password}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 rounded-2xl italic uppercase tracking-tighter transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Mengautentikasi...</> : 'Masuk'}
      </button>
      <Divider isDark={isDark} />
      <GoogleButton onClick={handleGoogleClick} loading={googleLoading} isDark={isDark} />
      <p className="text-center text-xs pt-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
        Belum punya akun?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors">Daftar gratis</button>
      </p>
    </form>
  );
};

/* ─── Register Form ────────────────────────────────────────────────────────── */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const passwordStrength = () => {
    if (!password.length) return null;
    if (password.length < 8) return { level: 0, label: 'Terlalu pendek', color: 'bg-rose-500' };
    if (password.length < 10) return { level: 1, label: 'Lemah', color: 'bg-orange-400' };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { level: 2, label: 'Sedang', color: 'bg-amber-400' };
    return { level: 3, label: 'Kuat', color: 'bg-emerald-500' };
  };
  const strength = passwordStrength();

  const handleGoogleCredential = useCallback(async ({ credential }) => {
    setGoogleLoading(true); setAlert(null);
    try { const res = await axios.post(`${API_BASE_URL}/auth/google/verify`, { credential }); onSuccess(res.data); }
    catch (err) { setAlert({ type: 'error', message: err.response?.data?.detail || 'Gagal.' }); }
    finally { setGoogleLoading(false); }
  }, [onSuccess]);
  useGoogleSignIn(handleGoogleCredential);

  const handleGoogleClick = () => {
    if (!GOOGLE_CLIENT_ID) { window.location.href = `${API_BASE_URL}/auth/google`; return; }
    window.google ? window.google.accounts.id.prompt() : (window.location.href = `${API_BASE_URL}/auth/google`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (strength?.level < 1) { setAlert({ type: 'error', message: 'Password minimal 8 karakter.' }); return; }
    setLoading(true); setAlert(null);
    try { const res = await axios.post(`${API_BASE_URL}/auth/register`, { email, password, full_name: name }); onSuccess(res.data); }
    catch (err) { setAlert({ type: 'error', message: err.response?.data?.detail || 'Registrasi gagal.' }); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alert && <Alert {...alert} />}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Nama Lengkap</label>
        <InputField id="reg-name" icon={User} type="text" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} isDark={isDark} />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Alamat Email</label>
        <InputField id="reg-email" icon={Mail} type="email" placeholder="nama@perusahaan.com" value={email} onChange={e => setEmail(e.target.value)} isDark={isDark} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Kata Sandi</label>
        <InputField id="reg-password" icon={Lock} type="password" placeholder="Min. 8 karakter" value={password} onChange={e => setPassword(e.target.value)} isDark={isDark} />
        {strength && (
          <div className="space-y-1 px-1">
            <div className="flex gap-1 h-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : isDark ? 'bg-white/5' : 'bg-black/5'}`} />
              ))}
            </div>
            <p className={`text-[10px] font-bold ${strength.level >= 2 ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Keamanan: {strength.label}
            </p>
          </div>
        )}
      </div>
      <button type="submit" disabled={loading || !name || !email || !password}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black py-4 rounded-2xl italic uppercase tracking-tighter transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
        {loading ? <><Loader2 size={18} className="animate-spin" /> Mendaftarkan...</> : 'Buat Akun'}
      </button>
      <Divider text="Atau daftar dengan" isDark={isDark} />
      <GoogleButton onClick={handleGoogleClick} loading={googleLoading} label="Daftar dengan Google" isDark={isDark} />
      <p className="text-center text-xs pt-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
        Sudah punya akun?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors">Masuk sekarang</button>
      </p>
    </form>
  );
};

/* ═══════════════════════════════════════════════════════
   AUTH PAGE
   ═══════════════════════════════════════════════════════ */
const AuthPage = ({ onLogin, onBack, mode: propMode }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(propMode || 'login');

  useEffect(() => {
    if (propMode) setMode(propMode);
  }, [propMode]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('access_token');
    if (accessToken && location.pathname === '/auth/callback') {
      const userData = {
        access_token: accessToken,
        refresh_token: params.get('refresh_token'),
        user: { id: params.get('user_id'), email: params.get('email'), full_name: decodeURIComponent(params.get('name') || ''), avatar_url: decodeURIComponent(params.get('avatar') || '') },
      };
      localStorage.setItem('aura_access_token', accessToken);
      localStorage.setItem('aura_refresh_token', userData.refresh_token);
      onLogin(userData);
    }
  }, [onLogin, location]);



  const handleSuccess = (tokenData) => {
    localStorage.setItem('aura_access_token', tokenData.access_token);
    localStorage.setItem('aura_refresh_token', tokenData.refresh_token);
    onLogin(tokenData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: isDark ? '#030712' : '#f8fafc' }}>

      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 lg:top-10 lg:left-10 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-colors hover:opacity-80"
          style={{ 
            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            color: isDark ? '#f8fafc' : '#0f172a',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </button>
      )}

      {/* Background effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none animate-pulse"
        style={{ background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.08)' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: isDark ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.07)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isDark ? 0.015 : 0.025,
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Card */}
        <div className="backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl"
          style={{
            background: isDark ? 'rgba(10,15,31,0.92)' : 'rgba(255,255,255,0.92)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            boxShadow: isDark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.08)',
          }}>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="/aura_logo.png" alt="AURA Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600/20 to-violet-700/20 rounded-2xl blur-md -z-10" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase" style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>AURA</h1>
            <p className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Kecerdasan Finansial Otonom</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-2xl mb-6"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
            }}>
            {[['login', 'Masuk'], ['register', 'Daftar']].map(([key, label]) => (
              <button key={key} type="button" onClick={() => navigate(`/${key}`)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                style={{
                  background: mode === key ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.95)') : 'transparent',
                  color: mode === key ? (isDark ? '#f8fafc' : '#0f172a') : (isDark ? '#64748b' : '#94a3b8'),
                  boxShadow: mode === key ? (isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)') : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>


          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}>
              {mode === 'login'
                ? <LoginForm onSuccess={handleSuccess} onSwitchToRegister={() => setMode('register')} />
                : <RegisterForm onSuccess={handleSuccess} onSwitchToLogin={() => setMode('login')} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] mt-6" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
          Dilindungi enkripsi AES-256 · AURA v2.0 · © 2025
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
