import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  userName: string;
  scrolled: boolean;
  onAboutOpen: () => void;
  onLogout: () => void;
}

export const DashboardHeader = ({ userName, scrolled, onAboutOpen, onLogout }: HeaderProps) => {
  const getTimeDetail = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return { label: "Pagi", icon: "🌅" };
    if (hour >= 11 && hour < 15) return { label: "Siang", icon: "☀️" };
    if (hour >= 15 && hour < 18) return { label: "Sore", icon: "🌇" };
    return { label: "Malam", icon: "🌙" };
  };

  const { label, icon } = getTimeDetail();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 pt-12 pb-6 transform-gpu ${scrolled ? 'bg-[#050505]/70 backdrop-blur-xl shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-center shadow-xl">
            <span className="text-xl">{icon}</span>
          </div>
          <div className="space-y-0.5 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Selamat {label}</p>
            <motion.h1
              whileTap={{ scale: 0.95 }}
              onClick={onAboutOpen}
              className="text-3xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent leading-tight pb-1 cursor-pointer active:opacity-70 transition-all"
            >
              {userName}!
            </motion.h1>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLogout}
          className="w-12 h-12 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500"
        >
          <LogOut size={20} strokeWidth={2.5} />
        </motion.button>
      </div>
    </header>
  );
};