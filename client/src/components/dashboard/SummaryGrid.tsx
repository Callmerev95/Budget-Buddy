import React, { memo } from 'react'; // 1. Tambah memo
import { Edit3, ArrowDownCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Menghindari any sesuai instruksi [cite: 2026-01-10]
interface SummaryGridProps {
  dailyLimit: number;
  totalSpent: number;
  onEditLimit: () => void;
}

// 2. Bungkus dengan memo agar grid statis ini tidak re-render saat list transaksi di bawahnya update
export const SummaryGrid = memo(({ dailyLimit, totalSpent, onEditLimit }: SummaryGridProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8 transform-gpu"> {/* Gunakan GPU layer untuk grid container */}

      {/* CARD LIMIT HARIAN - Mobile Optimized */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onEditLimit}
        // Pakai transform-gpu agar scaling animasi tidak buram/pecah
        className="relative overflow-hidden group active:brightness-90 transition-all transform-gpu"
      >
        <div className="bg-zinc-900/40 p-5 rounded-[2.25rem] border border-white/5 backdrop-blur-xl text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          {/* Inner Glow Decorative */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Edit3 size={18} strokeWidth={2.5} />
            </div>
            <div className="p-1 opacity-40">
              <ChevronRight size={14} className="text-emerald-500" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">Limit Harian</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-emerald-500/40">Rp</span>
              <p className="text-xl font-black text-white leading-none tracking-tighter">
                {dailyLimit.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>
      </motion.button>

      {/* CARD TERPAKAI - Mobile Optimized */}
      <div className="relative overflow-hidden transform-gpu">
        <div className="bg-zinc-900/40 p-5 rounded-[2.25rem] border border-white/5 backdrop-blur-xl text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/10 to-transparent" />

          <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <ArrowDownCircle size={18} strokeWidth={2.5} />
          </div>

          <div className="space-y-1">
            <p className="text-zinc-500 text-[10px] uppercase font-black tracking-[0.2em]">Terpakai</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-rose-500/40">Rp</span>
              <p className="text-xl font-black text-white leading-none tracking-tighter">
                {totalSpent.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Blur-3xl sangat berat, transform-gpu wajib di sini */}
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-rose-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
});