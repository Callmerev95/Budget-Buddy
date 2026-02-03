import React, { memo } from 'react'; // 1. Tambah memo
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

// 2. Definisikan interface agar tidak pakai 'any'
interface ReportStatsProps {
  totalExpense: number;
  count: number;
  selectedDate: string;
}

// 3. Bungkus dengan memo
export const ReportStats = memo(({ totalExpense, count, selectedDate }: ReportStatsProps) => (
  <motion.div
    key={`total-${selectedDate}`}
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    // Tambah transform-gpu untuk handle blur-[80px] yang berat
    className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-6 transform-gpu"
  >
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
          <TrendingDown size={20} className="text-rose-500" strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Pemakaian</p>
          <span className="px-3 py-1 bg-zinc-800/80 rounded-full text-[9px] font-black uppercase text-zinc-300 border border-white/5 backdrop-blur-sm">
            {count} Transaksi
          </span>
        </div>
      </div>

      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Total Outflow</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-rose-500/40 tracking-tighter">Rp</span>
        <h2 className="text-5xl font-black tracking-tighter text-white">
          {totalExpense.toLocaleString('id-ID')}
        </h2>
      </div>
    </div>

    {/* Subtle Background Glow - Diberi GPU layer agar tidak memberatkan CPU */}
    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[80px] pointer-events-none transform-gpu" />
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-zinc-500/5 blur-[60px] pointer-events-none transform-gpu" />
  </motion.div>
));