import React from 'react';
import { AlertCircle, PieChart, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  totalFixed: number;
  monthlyBudgetFree: number;
  onListOpen: () => void;
}

export const QuickActions = ({ totalFixed, monthlyBudgetFree, onListOpen }: QuickActionsProps) => {
  return (
    <section className="-mt-4">
      <div className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 rounded-[2.25rem] p-4 flex items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transform-gpu">
        <button
          onClick={onListOpen}
          className="flex-1 flex items-center gap-3 px-2 relative active:scale-95 transition-transform"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${totalFixed > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-500'}`}>
            <AlertCircle size={18} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Tagihan Bulanan</p>
            <p className={`text-sm font-black tracking-tight ${totalFixed > 0 ? 'text-amber-500/90' : 'text-zinc-600'}`}>
              {totalFixed > 0 ? `Rp ${totalFixed.toLocaleString('id-ID')}` : 'Belum Ada'}
            </p>
          </div>
          <ChevronRight size={12} className="absolute top-0 right-0 text-zinc-700" />
        </button>

        <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-zinc-800 to-transparent mx-2" />

        <div className="flex-1 flex items-center gap-3 px-2">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${monthlyBudgetFree < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            <PieChart size={18} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Saldo Tersimpan</p>
            <p className={`text-sm font-black tracking-tight ${monthlyBudgetFree < 0 ? 'text-rose-500/90' : 'text-emerald-500/90'}`}>
              Rp {monthlyBudgetFree.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};