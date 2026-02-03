import React, { memo } from 'react';
import { Edit3, ArrowDownCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryGridProps {
  dailyLimit: number;
  totalSpent: number;
  onEditLimit: () => void;
  isDarkMode?: boolean;
}

export const SummaryGrid = memo(({ dailyLimit, totalSpent, onEditLimit, isDarkMode = true }: SummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8 transform-gpu">

      {/* CARD LIMIT HARIAN */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onEditLimit}
        className="relative overflow-hidden group active:brightness-95 transition-all transform-gpu"
      >
        <div className={`p-5 rounded-[2.25rem] border text-left transition-all duration-500 h-full ${isDarkMode
            ? 'bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            : 'bg-white border-zinc-200 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]'
          }`}>

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'
              }`}>
              <Edit3 size={18} strokeWidth={2.5} />
            </div>
            <div className={`p-1 transition-opacity ${isDarkMode ? 'opacity-40' : 'opacity-30'}`}>
              <ChevronRight size={14} className={isDarkMode ? 'text-emerald-500' : 'text-emerald-600'} />
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">Limit Harian</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-[10px] font-bold transition-colors ${isDarkMode ? 'text-emerald-500/40' : 'text-emerald-600/60'
                }`}>
                Rp
              </span>
              <p className={`text-xl font-black leading-none tracking-tighter transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-zinc-900'
                }`}>
                {dailyLimit.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Background Glow - Dimatikan pas Light Mode biar ga bikin Card jadi abu-abu */}
          {isDarkMode && (
            <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full blur-2xl bg-emerald-500/5 opacity-100 transition-opacity" />
          )}
        </div>
      </motion.button>

      {/* CARD TERPAKAI */}
      <div className="relative overflow-hidden transform-gpu">
        <div className={`p-5 rounded-[2.25rem] border text-left transition-all duration-500 h-full ${isDarkMode
            ? 'bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
            : 'bg-white border-zinc-200 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]'
          }`}>

          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 relative z-10 ${isDarkMode ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-50 text-rose-600'
            }`}>
            <ArrowDownCircle size={18} strokeWidth={2.5} />
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">Terpakai</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-[10px] font-bold transition-colors ${isDarkMode ? 'text-rose-500/40' : 'text-rose-600/60'
                }`}>
                Rp
              </span>
              <p className={`text-xl font-black leading-none tracking-tighter transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-zinc-900'
                }`}>
                {totalSpent.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Background Glow */}
          {isDarkMode && (
            <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full blur-3xl bg-rose-500/5 opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    </div>
  );
});