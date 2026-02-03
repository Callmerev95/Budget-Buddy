import React, { memo } from 'react'; // 1. Tambah memo
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface ReportHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

// 2. Bungkus dengan memo agar tidak re-render saat komponen lain di halaman Report berubah
export const ReportHeader = memo(({ selectedDate, onDateChange }: ReportHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    // Tambah transform-gpu untuk optimasi rendering gradasi teks
    className="relative z-20 flex items-end justify-between mb-10 px-1 transform-gpu"
  >
    <div className="space-y-2">
      <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent leading-none">
        Analytics
      </h1>
      <div className="flex items-center gap-2 bg-zinc-900/50 w-fit px-2 py-1 rounded-full border border-white/5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Insights</p>
      </div>
    </div>

    {/* Input Date Picker Styling */}
    <div className="relative flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-2 py-2 shadow-sm focus-within:border-emerald-500/50 transition-colors">
      <Calendar size={14} className="text-emerald-500" />
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        // Native date picker reset styling
        className="bg-transparent text-emerald-500 text-[10px] font-black focus:outline-none uppercase cursor-pointer tracking-tighter [color-scheme:dark]"
      />
    </div>
  </motion.div>
));