import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sun, Moon, Coffee, CloudSun, Sunrise, MoonStar } from 'lucide-react';

interface HeaderProps {
  userName: string;
  scrolled: boolean;
  onAboutOpen: () => void;
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const DashboardHeader = memo(({
  userName,
  scrolled,
  onAboutOpen,
  onLogout,
  isDarkMode = true,
  onToggleTheme
}: HeaderProps) => {

  // 1. Logic Waktu yang lebih variatif dengan useMemo
  const timeContext = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { label: "Pagi", icon: <Sunrise className="text-amber-400" size={20} /> };
    if (hour >= 11 && hour < 15) return { label: "Siang", icon: <Coffee className="text-orange-400" size={20} /> };
    if (hour >= 15 && hour < 18) return { label: "Sore", icon: <CloudSun className="text-rose-400" size={20} /> };
    return { label: "Malam", icon: <MoonStar className="text-indigo-400" size={20} /> };
  }, []);

  // 2. Dynamic Class Generator
  const themeClasses = {
    header: scrolled
      ? (isDarkMode ? 'bg-[#050505]/80 backdrop-blur-xl shadow-2xl border-b border-white/5' : 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-zinc-200')
      : 'bg-transparent',
    card: isDarkMode
      ? 'bg-zinc-900/80 border-white/5 text-zinc-400'
      : 'bg-zinc-100 border-zinc-200 text-zinc-600',
    title: isDarkMode
      ? 'from-white to-zinc-500'
      : 'from-zinc-900 to-zinc-500',
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 pt-10 pb-6 transform-gpu ${themeClasses.header}`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Profil & Sapaan */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-inner transform-gpu ${themeClasses.card}`}
          >
            {timeContext.icon}
          </motion.div>

          <div className="space-y-0.5 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 opacity-80">
              Selamat {timeContext.label}
            </p>
            <motion.h1
              whileTap={{ scale: 0.97 }}
              onClick={onAboutOpen}
              className={`text-2xl font-black tracking-tighter bg-gradient-to-b bg-clip-text text-transparent leading-tight cursor-pointer active:opacity-70 transition-all transform-gpu ${themeClasses.title}`}
            >
              {userName}!
            </motion.h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleTheme}
            className={`w-11 h-11 border rounded-2xl flex items-center justify-center transition-all ${themeClasses.card} hover:text-amber-500`}
            title="Ganti Tema"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDarkMode ? 'dark' : 'light'}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
            className={`w-11 h-11 border rounded-2xl flex items-center justify-center transition-all ${themeClasses.card} hover:text-rose-500 hover:border-rose-500/20`}
            title="Keluar"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </header>
  );
});

DashboardHeader.displayName = 'DashboardHeader';