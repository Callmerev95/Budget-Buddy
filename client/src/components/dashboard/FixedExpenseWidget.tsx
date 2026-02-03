import React, { memo } from 'react'; // 1. Tambah memo
import { ReceiptText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FixedExpenseWidgetProps {
  totalFixed: number;
  onOpen: () => void;
  isDarkMode?: boolean; // Tambahkan ini [cite: 2026-02-03]
}

// 2. Bungkus dengan memo agar tidak re-render saat Dashboard re-render (misal saat scroll)
export const FixedExpenseWidget = memo(({ totalFixed, onOpen, isDarkMode = true }: FixedExpenseWidgetProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onOpen}
    // Logic Background & Border Dinamis [cite: 2026-02-03]
    className={`w-full relative overflow-hidden p-6 rounded-[2rem] mb-10 flex items-center justify-between backdrop-blur-md group transform-gpu transition-all duration-500 border ${isDarkMode
        ? 'bg-zinc-900/40 border-white/5'
        : 'bg-white border-zinc-200 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)]'
      }`}
  >
    {/* Dekorasi Light Beam - Hanya di Dark Mode biar tetep clean */}
    {isDarkMode && (
      <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
    )}

    <div className="flex items-center gap-5 relative z-10">
      <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 shadow-sm ${isDarkMode
          ? 'bg-amber-500/10 text-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-amber-500/20'
          : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
        }`}>
        <ReceiptText size={22} strokeWidth={2.5} />
      </div>

      <div className="text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Tagihan Bulanan</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xs font-bold ${isDarkMode ? 'text-amber-500/50' : 'text-amber-600/40'}`}>Rp</span>
          <p className={`text-xl font-black leading-none transition-colors duration-500 ${isDarkMode ? 'text-amber-200' : 'text-amber-600'
            }`}>
            {totalFixed.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>

    {/* Detail Button Adaptif */}
    <div className={`relative z-10 flex items-center gap-2 py-2 px-3 rounded-2xl border transition-all duration-500 ${isDarkMode
        ? 'bg-zinc-800/50 border-white/5 group-hover:bg-amber-500/10 group-hover:border-amber-500/20'
        : 'bg-zinc-50 border-zinc-200 group-hover:bg-amber-50 group-hover:border-amber-200'
      }`}>
      <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors ${isDarkMode ? 'text-zinc-500 group-hover:text-amber-500' : 'text-zinc-400 group-hover:text-amber-600'
        }`}>
        Detail
      </span>
      <ChevronRight size={16} className={`transition-colors ${isDarkMode ? 'text-zinc-600 group-hover:text-amber-500' : 'text-zinc-300 group-hover:text-amber-600'
        }`} />
    </div>

    {/* Subtle Background Glow */}
    <div className={`absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl transition-all duration-700 ${isDarkMode ? 'bg-amber-500/5 group-hover:bg-amber-500/10' : 'bg-amber-500/10 opacity-50'
      }`}></div>
  </motion.button>
));