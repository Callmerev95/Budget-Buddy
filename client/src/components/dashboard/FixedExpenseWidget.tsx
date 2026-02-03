import React, { memo } from 'react'; // 1. Tambah memo
import { ReceiptText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface FixedExpenseWidgetProps {
  totalFixed: number;
  onOpen: () => void;
}

// 2. Bungkus dengan memo agar tidak re-render saat Dashboard re-render (misal saat scroll)
export const FixedExpenseWidget = memo(({ totalFixed, onOpen }: FixedExpenseWidgetProps) => (
  <motion.button
    whileTap={{ scale: 0.97 }}
    onClick={onOpen}
    // Tambah transform-gpu buat optimasi backdrop-blur dan animasi scale
    className="w-full relative overflow-hidden bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] mb-10 flex items-center justify-between backdrop-blur-md group transform-gpu"
  >
    {/* Dekorasi Light Beam */}
    <div className="absolute top-0 left-0 w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

    <div className="flex items-center gap-5 relative z-10">
      <div className="w-12 h-12 bg-amber-500/10 rounded-[1.25rem] flex items-center justify-center text-amber-500 shadow-[inset_0_0_15px_rgba(245,158,11,0.1)] group-hover:bg-amber-500/20 transition-all duration-500">
        <ReceiptText size={22} strokeWidth={2.5} />
      </div>

      <div className="text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Tagihan Bulanan</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-bold text-amber-500/50">Rp</span>
          <p className="text-xl font-black text-amber-200 leading-none">
            {totalFixed.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>

    <div className="relative z-10 flex items-center gap-2 bg-zinc-800/50 py-2 px-3 rounded-2xl border border-white/5 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-all duration-500">
      <span className="text-[10px] font-black text-zinc-500 group-hover:text-amber-500 uppercase tracking-tighter">Detail</span>
      <ChevronRight size={16} className="text-zinc-600 group-hover:text-amber-500" />
    </div>

    {/* Subtle Background Glow */}
    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
  </motion.button>
));