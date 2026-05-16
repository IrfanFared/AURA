import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Send, Loader2, Bot, Info } from 'lucide-react';
import { useTheme } from './ThemeContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://aura-backend-897592630558.asia-southeast1.run.app/api/v1').trim();

const ChatPage = ({ user }) => {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! Saya AURA Assistant, Virtual CFO Anda. Ada yang bisa saya bantu terkait laporan keuangan, AURA Score, atau analisis arus kas?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const themeConfig = {
    surface: isDark ? 'rgba(15,23,42,0.4)' : '#ffffff',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#475569',
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !user) return;

    const newMsg = { id: Date.now(), sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/message`, {
        user_id: user.id.toString(),
        message: newMsg.text
      });
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: response.data.reply
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Maaf, saya tidak dapat merespons saat ini. Pastikan GEMINI_API_KEY sudah disetel di backend.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    "Bagaimana arus kas saya bulan ini?",
    "Apa itu AURA Score?",
    "Berapa saldo Smart Vault saya?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-120px)] w-full max-w-4xl mx-auto rounded-[2rem] overflow-hidden border shadow-2xl backdrop-blur-md"
         style={{ backgroundColor: themeConfig.surface, borderColor: themeConfig.borderColor }}>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Bot size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-wide italic uppercase">AURA Assistant</h3>
            <p className="text-xs text-indigo-100 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Virtual CFO Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: isDark ? 'transparent' : '#f8fafc' }}>
        


        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-sm shadow-lg' 
                : isDark ? 'bg-[#1e293b]/80 text-slate-200 rounded-tl-sm border border-white/5' : 'bg-white text-slate-800 border shadow-sm rounded-tl-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className={`max-w-[80%] p-4 rounded-3xl ${isDark ? 'bg-[#1e293b]/80 border border-white/5' : 'bg-white border shadow-sm'} rounded-tl-sm flex items-center gap-3`}>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && !isLoading && (
        <div className="px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
          {quickReplies.map((qr, idx) => (
            <button 
              key={idx}
              onClick={() => { setInputMessage(qr); setTimeout(() => handleSendMessage({preventDefault:()=>null}), 10); }}
              className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20 transition-all shadow-sm"
            >
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-[#020617]/50 backdrop-blur-xl border-t shrink-0" style={{ borderColor: themeConfig.borderColor }}>
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Tanyakan analisis keuangan Anda..."
            className="flex-1 bg-white/5 px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-full border shadow-inner"
            style={{ color: themeConfig.textPrimary, borderColor: themeConfig.borderColor }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-lg"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
