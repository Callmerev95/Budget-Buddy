import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface BalanceCardProps {
  remainingLimit: number;
  usagePercentage: number;
  dailyLimit: number;
  isDarkMode?: boolean;
}

export const BalanceCard = memo(({ remainingLimit, usagePercentage, dailyLimit, isDarkMode = true }: BalanceCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const isWarning = usagePercentage >= 85 && usagePercentage < 100;
  const isDanger = usagePercentage >= 100;

  const accentColor = isDanger ? '#f43f5e' : isWarning ? '#fbbf24' : '#10b981';
  const statusBadge = isDanger ? 'OVERLIMIT' : isWarning ? 'WASPADA' : 'STABIL';
  const statusNote = isDanger ? '⚠️ Pengeluaran Melebihi Batas' : isWarning ? '🧐 Perlu Kendali Extra' : '🛡️ Pengeluaran Terkendali';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      // Logic Warna Container Utama [cite: 2026-02-03]
      className={`relative overflow-hidden p-7 rounded-[2.5rem] border transition-all duration-500 transform-gpu ${isDarkMode
          ? 'bg-[#0A0A0A] border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]'
          : 'bg-white border-zinc-200 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]'
        }`}
    >
      <motion.div
        animate={{ opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0"
        style={{ background: `radial-gradient(circle at 50% -20%, ${accentColor} 0%, transparent 70%)` }}
      />

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div className="space-y-0.5">
            <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
              Limit Saldo Hari Ini
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'
                }`}>
                System Active
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-colors duration-500"
            style={{ borderColor: `${accentColor}33`, backgroundColor: `${accentColor}1A`, color: accentColor }}>
            {statusBadge}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <span className={`text-2xl font-black tracking-tighter italic flex-shrink-0 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'
              }`}>
              Rp
            </span>
            <div className="relative overflow-hidden flex-1">
              <AnimatePresence mode="wait">
                {isVisible ? (
                  <motion.h2
                    key="visible"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                    className={`text-5xl font-black tracking-tighter truncate ${isDanger ? 'text-rose-500' : (isDarkMode ? 'text-white' : 'text-zinc-900')
                      }`}
                  >
                    {Math.abs(remainingLimit).toLocaleString('id-ID')}
                  </motion.h2>
                ) : (
                  <motion.h2
                    key="hidden"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
                    className={`text-5xl font-black tracking-[0.15em] leading-tight ${isDarkMode ? 'text-zinc-800' : 'text-zinc-200'
                      }`}
                  >
                    ••••••
                  </motion.h2>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }}
            className={`flex-shrink-0 p-3 rounded-2xl transition-all border ${isDarkMode
                ? 'bg-zinc-900/50 text-zinc-600 border-white/5 hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:bg-zinc-200'
              }`}
          >
            {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {dailyLimit > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-end mb-3 px-1">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Kondisi Dompet</p>
                <p className={`text-sm font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
                  {statusNote}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  {Math.round(usagePercentage)}%
                </p>
              </div>
            </div>

            <div className={`w-full h-3.5 rounded-full overflow-hidden p-1 border shadow-inner relative ${isDarkMode ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'
              }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full relative"
                style={{ backgroundColor: accentColor }}
              >
                <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/20 rounded-full mx-1 mt-0.5" />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <div className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full blur-[100px] opacity-10 transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
});