import { LogOut, Sun, Moon, Sunrise } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export const Header = ({ userName, onLogout }: HeaderProps) => {
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
    <header className="flex justify-between items-center mb-10 px-1">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col"
      >
        <div className="flex items-center gap-2 mb-1">
          {greeting.icon}
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.25em]">
            {greeting.text}
          </p>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          {userName?.split(' ')[0] || 'Buddy'} <span className="text-emerald-500 italic">!</span>
        </h1>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onLogout}
        className="w-11 h-11 flex items-center justify-center bg-zinc-900/50 border border-white/5 rounded-2xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-300 shadow-xl"
      >
        <LogOut size={20} strokeWidth={2.5} />
      </motion.button>
    </header>
  );
};