import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  AlertCircle, Zap, TrendingUp, ArrowUpRight, Wallet, Bell, 
  Activity, Cpu, ShieldAlert, CheckCircle2, ChevronRight,
  LayoutDashboard, PieChart, Settings, LogOut, Menu, X
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label, themeColor }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-[#0f172a]/90">
        <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${themeColor}`}>{new Date(label).toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
        <div className="flex flex-col gap-1">
          <p className="text-white text-lg font-bold">
            Rp {payload[0].value.toLocaleString()}
          </p>
          <p className="text-slate-400 text-xs flex items-center gap-1">
            <ArrowUpRight size={12} className={themeColor} /> Predicted Cashflow
          </p>
        </div>
      </div>
    );
  }
  return null;
};

// --- Skeleton Loader Component ---
const SkeletonLoader = () => (
  <div className="min-h-screen flex bg-[#020617] p-4 lg:p-10">
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center mb-10">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-800/50 rounded-lg shimmer"></div>
          <div className="h-4 w-48 bg-slate-800/30 rounded-lg shimmer"></div>
        </div>
        <div className="h-10 w-32 bg-slate-800/50 rounded-full shimmer"></div>
      </div>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 h-64 rounded-[2.5rem] bg-slate-800/20 shimmer border border-white/5"></div>
        <div className="col-span-12 lg:col-span-4 h-64 rounded-[2.5rem] bg-slate-800/20 shimmer border border-white/5"></div>
        <div className="col-span-12 h-96 rounded-[2.5rem] bg-slate-800/20 shimmer border border-white/5"></div>
      </div>
    </div>
  </div>
);

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/dashboard/user_123`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 1500); // 1.5s delay to show shimmer
      }
    };
    fetchData();
  }, []);

  if (loading) return <SkeletonLoader />;

  const { prediction, decision, forecast, score, hedge } = data;

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

  const theme = getThemeConfig(decision.zone);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* Background Dynamic Glow */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 ${theme.bg} rounded-full blur-[120px] pointer-events-none opacity-50 transition-colors duration-1000`}></div>
      
      {/* Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 glass z-50 sticky top-0">
        <div className="flex items-center gap-2">
          <Zap size={20} className={theme.color} />
          <span className="font-black italic tracking-widest">AURA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:static top-[65px] lg:top-0 left-0 h-[calc(100vh-65px)] lg:h-screen w-64 border-r border-white/5 flex flex-col items-stretch glass z-40 bg-[#020617]/95 lg:bg-transparent"
          >
            <div className="hidden lg:flex p-8 mb-4 items-center gap-3">
              <div className={`h-10 w-10 ${theme.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                <Zap size={24} className={theme.color} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">AURA</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4 lg:mt-0">
              {[
                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                { id: 'analytics', icon: <Activity size={20} />, label: 'Deep Analytics' },
                { id: 'vault', icon: <Wallet size={20} />, label: 'Smart Vault' },
                { id: 'reports', icon: <PieChart size={20} />, label: 'Oracle Reports' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === item.id ? `${theme.bg} ${theme.color} border ${theme.border}` : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-6 border-t border-white/5 space-y-2">
              <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-200 transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main 
        className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-10 w-full lg:ml-64"
        style={{ marginLeft: window.innerWidth >= 1024 ? '16rem' : '0' }}
      >
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-4"
        >
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Financial Intelligence</h2>
            <p className="text-slate-500">Autonomous processing active <span className={`inline-block w-2 h-2 ${theme.bg.replace('/10','')} rounded-full ml-2 animate-pulse`}></span></p>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 self-end lg:self-auto">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 hidden sm:flex">
              <button className="px-4 py-1.5 text-xs font-semibold bg-white/10 text-white rounded-lg">Real-time</button>
              <button className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-300">Historic</button>
            </div>
            <div className="relative cursor-pointer group">
              <div className={`absolute -top-1 -right-1 h-3 w-3 ${theme.bg.replace('/10','')} rounded-full border-2 border-[#020617] z-10 animate-bounce`}></div>
              <Bell className="text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className={`h-10 w-10 rounded-full bg-gradient-to-tr from-slate-600 to-slate-400 p-0.5 cursor-pointer`}>
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-sm">IP</div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8"
        >
          {/* Main Status Area */}
          <div className="col-span-1 lg:col-span-8 space-y-6 lg:space-y-8">
            
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
                    <span className={`text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] ${theme.color}`}>System Priority Level</span>
                  </div>
                  <h3 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white uppercase">{decision.zone}</h3>
                  <p className="max-w-md text-slate-400 leading-relaxed text-sm lg:text-lg">{decision.action}</p>
                </div>
                
                <div className="glass p-6 lg:p-8 rounded-3xl border border-white/10 w-full md:w-72 mt-4 md:mt-0">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-slate-500">Deficit Probability</span>
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
                    <Cpu size={20} className={theme.color} /> THE ORACLE FORECAST
                  </h4>
                  <p className="text-slate-500 text-xs lg:text-sm">Deep learning ensemble cashflow projection</p>
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
                    <Tooltip content={<CustomTooltip themeColor={theme.color} />} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                    <Area 
                      type="monotone" 
                      dataKey="yhat_upper" 
                      stroke="none" 
                      fill={theme.fill} 
                      fillOpacity={0.05} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="yhat_lower" 
                      stroke="none" 
                      fill={theme.fill} 
                      fillOpacity={0.05} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="yhat" 
                      stroke={theme.fill} 
                      strokeWidth={3}
                      fill="url(#colorTheme)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Score & Metrics */}
          <div className="col-span-1 lg:col-span-4 space-y-6 lg:space-y-8">
            
            {/* AURA SCORE Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-[2rem] p-6 lg:p-10 flex flex-col items-center text-center relative overflow-hidden group transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${theme.bg.replace('/10', '')} opacity-50`}></div>
              
              <h4 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 lg:mb-8">AURA Proprietary Score</h4>
              
              <div className="relative mb-6 lg:mb-8">
                <div className="h-40 w-40 lg:h-48 lg:w-48 rounded-full border-8 lg:border-[10px] border-white/5 flex flex-col items-center justify-center relative shadow-inner">
                  <div className={`absolute inset-0 rounded-full border-t-8 lg:border-t-[10px] ${theme.border.replace('border-', 'border-t-').replace('/20', '')} rotate-[45deg] group-hover:rotate-[360deg] transition-transform duration-[3000ms] ease-out`}></div>
                  <span className="text-5xl lg:text-6xl font-black text-white italic tracking-tighter">{score.total_score}</span>
                  <span className={`text-[0.5em] lg:text-[0.6em] font-black uppercase tracking-widest ${theme.color} mt-1`}>Points</span>
                </div>
              </div>

              <div className={`${theme.bg} ${theme.border} border px-4 lg:px-6 py-2 rounded-full mb-6 lg:mb-8`}>
                <span className={`${theme.color} text-xs lg:text-sm font-bold tracking-tight italic uppercase`}>{score.rating}</span>
              </div>

              <div className="w-full space-y-3 lg:space-y-4 mb-6 lg:mb-8">
                {Object.entries(score.dimensions).map(([key, val], idx) => (
                  <motion.div 
                    key={key} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="flex flex-col gap-1 lg:gap-1.5"
                  >
                    <div className="flex justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                      <span>{key}</span>
                      <span className="text-slate-300">{val}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                        className={`h-full rounded-full ${val > 80 ? 'bg-emerald-500' : val > 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className={`w-full group/btn relative overflow-hidden bg-white text-slate-950 font-black py-3 lg:py-4 rounded-xl lg:rounded-2xl transition-all active:scale-[0.98] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]`}>
                <span className="relative z-10 flex items-center justify-center gap-2 italic uppercase tracking-tighter text-sm">
                  Unlock Capital <ChevronRight size={16} />
                </span>
              </button>
            </motion.div>

            {/* Smart Vault Quick Card */}
            <motion.div 
              whileHover={{ x: 5 }}
              className="glass-card rounded-[2rem] p-6 lg:p-8 border-l-4 border-l-indigo-500 group cursor-pointer hover:bg-white/5 transition-all"
            >
              <div className="flex justify-between items-start mb-4 lg:mb-6">
                <div className="p-2 lg:p-3 bg-indigo-600/10 text-indigo-400 rounded-xl lg:rounded-2xl">
                  <Wallet size={20} className="lg:w-6 lg:h-6" />
                </div>
              </div>
              <p className="text-slate-400 text-xs lg:text-sm font-medium mb-1">Smart Vault Balance</p>
              <h3 className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter mb-4">
                Rp {(hedge.vault_balance || 0).toLocaleString()}
              </h3>
              <div className="flex items-center gap-2 text-[10px] lg:text-xs text-indigo-400 font-bold group-hover:gap-3 transition-all uppercase tracking-tighter">
                Manage Vault <ChevronRight size={14} />
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;
