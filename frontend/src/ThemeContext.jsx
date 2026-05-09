import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  // Selalu gunakan dark mode sesuai permintaan user
  const [mode] = useState('dark');

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    localStorage.setItem('aura_theme', 'dark');
  }, []);

  const isDark = true;
  const toggleTheme = () => {}; // No-op since we only have dark mode

  return (
    <ThemeContext.Provider value={{ mode: 'dark', isDark, toggleTheme, setMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

