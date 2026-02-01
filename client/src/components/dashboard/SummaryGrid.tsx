import { Edit3, ArrowDownCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SummaryGridProps {
  dailyLimit: number;
  totalSpent: number;
  onEditLimit: () => void;
}

export const SummaryGrid = ({ dailyLimit, totalSpent, onEditLimit }: SummaryGridProps) => (
  <div className="grid grid-cols-2 gap-4 mb-8">
    {/* Card Set Limit - Interactive */}
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onEditLimit}
      className="relative overflow-hidden bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md text-left group"
    >
      <div className="absolute top-0 right-0 p-3 opacity-20 group-active:opacity-100 transition-opacity">
        <ChevronRight size={16} className="text-emerald-500" />
      </div>

      <div className="w-11 h-11 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 shadow-inner">
        <Edit3 size={20} strokeWidth={2.5} />
      </div>

      <p className="text-zinc-500 text-[10px] mb-1.5 uppercase font-black tracking-[0.15em]">Limit Harian</p>
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-bold text-emerald-500/50">Rp</span>
        <p className="text-base font-black text-white leading-none">
          {dailyLimit.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl"></div>
    </motion.button>

    {/* Card Pengeluaran - Static Info */}
    <div className="relative overflow-hidden bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 backdrop-blur-md">
      <div className="w-11 h-11 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-inner">
        <ArrowDownCircle size={20} strokeWidth={2.5} />
      </div>

      <p className="text-zinc-500 text-[10px] mb-1.5 uppercase font-black tracking-[0.15em]">Terpakai</p>
      <div className="flex items-baseline gap-1">
        <span className="text-[10px] font-bold text-rose-500/50">Rp</span>
        <p className="text-base font-black text-white leading-none">
          {totalSpent.toLocaleString('id-ID')}
        </p>
      </div>

      {/* Subtle Glow Effect */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-rose-500/5 rounded-full blur-xl"></div>
    </div>
  </div>
);