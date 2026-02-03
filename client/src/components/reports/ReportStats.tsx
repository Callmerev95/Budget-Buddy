import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown } from 'lucide-react';

export const ReportStats = ({ totalExpense, count, selectedDate }: { totalExpense: number, count: number, selectedDate: string }) => (
  <motion.div key={`total-${selectedDate}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 rounded-[2.5rem] shadow-2xl mb-6">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20"><TrendingDown size={20} className="text-rose-500" /></div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Pemakaian</p>
          <span className="px-3 py-1 bg-zinc-800 rounded-full text-[9px] font-black uppercase text-zinc-300">{count} Transaksi</span>
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Total Outflow</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-rose-500/40 tracking-tighter">Rp</span>
        <h2 className="text-5xl font-black tracking-tighter text-white">{totalExpense.toLocaleString('id-ID')}</h2>
      </div>
    </div>
    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[80px]" />
  </motion.div>
);