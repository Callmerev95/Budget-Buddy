import React, { memo } from 'react'; // 1. Tambah memo
import { LogOut, Sun, Moon, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
  isDarkMode?: boolean; // Tambahkan props tema [cite: 2026-02-03]
}

// 2. Bungkus dengan memo
export const Header = memo(({ userName, onLogout, isDarkMode = true }: HeaderProps) => {
  // Logika ucapan berdasarkan waktu [cite: 2026-01-14]
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return { text: 'Selamat Pagi', icon: <Sunrise size={14} className="text-amber-400" /> };
    if (hour < 15) return { text: 'Selamat Siang', icon: <Sun size={14} className="text-orange-400" /> };
    if (hour < 19) return { text: 'Selamat Sore', icon: <Sun size={14} className="text-amber-500" /> };
    return { text: 'Selamat Malam', icon: <Moon size={14} className="text-blue-400" /> };
  };

  const greeting = getGreeting();

  return (
    <header className="flex justify-between items-center mb-10 px-1 transform-gpu">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        // 3. Tambahkan GPU layer untuk animasi x-axis yang halus
        className="flex flex-col transform-gpu"
      >
        <div className="flex items-center gap-2 mb-1">
          {greeting.icon}
          <p className={`transition-colors duration-500 text-[10px] font-black uppercase tracking-[0.25em] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
            {greeting.text}
          </p>
        </div>
        <h1 className={`text-2xl font-black tracking-tight transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-zinc-900'
          }`}>
          {userName?.split(' ')[0] || 'Buddy'} <span className="text-emerald-500 italic">!</span>
        </h1>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLogout}
        className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-xl border ${isDarkMode
            ? 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'
            : 'bg-white border-zinc-200 text-zinc-400 hover:text-rose-500 hover:bg-rose-50'
          }`}
      >
        <LogOut size={20} strokeWidth={2.5} />
      </motion.button>
    </header>
  );
});