import React, { memo } from 'react'; // 1. Tambah memo
import { AlertCircle, PieChart, ChevronRight } from 'lucide-react';

interface QuickActionsProps {
  totalFixed: number;
  monthlyBudgetFree: number;
  isDarkMode?: boolean; // Pastikan ini diterima [cite: 2026-02-03]
  onListOpen: () => void;
}

// 2. Bungkus dengan memo agar hemat baterai & CPU saat Dashboard re-render
export const QuickActions = memo(({ totalFixed, monthlyBudgetFree, onListOpen, isDarkMode = true }: QuickActionsProps) => {
  return (
    <section className="-mt-4 transform-gpu"> {/* Pastikan GPU layer aktif */}
      <div className={`backdrop-blur-2xl border rounded-[2.25rem] p-4 flex items-center transform-gpu transition-all duration-500 ${isDarkMode
          ? 'bg-zinc-900/30 border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]'
          : 'bg-white/80 border-zinc-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]'
        }`}>

        {/* Tombol List Tagihan */}
        <button
          type="button"
          onClick={onListOpen}
          className="flex-1 flex items-center gap-3 px-2 relative active:scale-95 transition-transform"
        >
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${totalFixed > 0
              ? (isDarkMode ? 'bg-amber-500/10 text-amber-500 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' : 'bg-amber-50 text-amber-600')
              : (isDarkMode ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400')
            }`}>
            <AlertCircle size={18} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Tagihan Bulanan</p>
            <p className={`text-sm font-black tracking-tight transition-colors duration-500 ${totalFixed > 0
                ? (isDarkMode ? 'text-amber-500/90' : 'text-amber-600')
                : (isDarkMode ? 'text-zinc-600' : 'text-zinc-400')
              }`}>
              {totalFixed > 0 ? `Rp ${totalFixed.toLocaleString('id-ID')}` : 'Belum Ada'}
            </p>
          </div>
          <ChevronRight size={12} className={`absolute top-0 right-0 transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`} />
        </button>

        {/* Vertical Divider - Dinamis sesuai tema [cite: 2026-02-03] */}
        <div className={`w-[1px] h-8 mx-2 transition-all duration-500 bg-gradient-to-b ${isDarkMode ? 'from-transparent via-zinc-800 to-transparent' : 'from-transparent via-zinc-200 to-transparent'
          }`} />

        {/* Status Saldo Tersimpan */}
        <div className="flex-1 flex items-center gap-3 px-2">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${monthlyBudgetFree < 0
              ? (isDarkMode ? 'bg-rose-500/10 text-rose-500 shadow-[inset_0_0_10px_rgba(244,63,94,0.1)]' : 'bg-rose-50 text-rose-600')
              : (isDarkMode ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]' : 'bg-emerald-50 text-emerald-600')
            }`}>
            <PieChart size={18} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Saldo Tersimpan</p>
            <p className={`text-sm font-black tracking-tight transition-colors duration-500 ${monthlyBudgetFree < 0
                ? (isDarkMode ? 'text-rose-500/90' : 'text-rose-600')
                : (isDarkMode ? 'text-emerald-500/90' : 'text-emerald-600')
              }`}>
              Rp {monthlyBudgetFree.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});