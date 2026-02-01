// client/src/components/dashboard/SummaryGrid.tsx
import { Edit2, TrendingDown } from 'lucide-react';

interface SummaryGridProps {
  dailyLimit: number;
  totalSpent: number;
  onEditLimit: () => void;
}

export const SummaryGrid = ({ dailyLimit, totalSpent, onEditLimit }: SummaryGridProps) => (
  <div className="grid grid-cols-2 gap-4 mb-8">
    <button
      onClick={onEditLimit}
      className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm text-left active:scale-95 transition-all group"
    >
      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3 group-hover:bg-emerald-500/20 transition-colors">
        <span className="text-emerald-500"><Edit2 size={18} /></span>
      </div>
      <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tighter">Set Limit Harian</p>
      <p className="text-lg font-bold text-emerald-400 leading-none">Rp {dailyLimit.toLocaleString('id-ID')}</p>
    </button>

    <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-3">
        <TrendingDown size={20} />
      </div>
      <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tighter">Pengeluaran</p>
      <p className="text-lg font-bold text-rose-400 leading-none">Rp {totalSpent.toLocaleString('id-ID')}</p>
    </div>
  </div>
);