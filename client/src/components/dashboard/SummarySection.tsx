import React, { memo } from 'react';
import { SummaryGrid } from './SummaryGrid';

interface SummarySectionProps {
  dailyLimit: number;
  spentToday: number;
  isDarkMode?: boolean; // Sudah ada [cite: 2026-02-03]
  onEdit: () => void;
}

export const SummarySection = memo(({ dailyLimit, spentToday, isDarkMode = true, onEdit }: SummarySectionProps) => (
  <section className="transform-gpu">
    <div className="flex items-center gap-3 mb-6 px-1">
      <div className="flex items-center gap-2">
        {/* Dekorasi indikator tetap kita pertahankan untuk estetika */}
        <div className={`w-1 h-3 bg-emerald-500 rounded-full transition-shadow ${isDarkMode ? 'shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'shadow-none'
          }`} />
        <h3 className={`text-xs font-black tracking-[0.3em] uppercase transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
          Ringkasan
        </h3>
      </div>
      {/* Garis pemisah adaptif [cite: 2026-02-03] */}
      <div className={`h-[1px] flex-grow bg-gradient-to-r transition-colors duration-500 ${isDarkMode ? 'from-zinc-800 to-transparent' : 'from-zinc-200 to-transparent'
        }`} />
    </div>

    {/* FOKUS: Sekarang isDarkMode dioper ke SummaryGrid! [cite: 2026-02-03] */}
    <SummaryGrid
      dailyLimit={dailyLimit}
      totalSpent={spentToday}
      onEditLimit={onEdit}
      isDarkMode={isDarkMode}
    />
  </section>
));