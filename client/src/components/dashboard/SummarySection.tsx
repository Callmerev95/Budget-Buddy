import React, { memo } from 'react';
import { SummaryGrid } from './SummaryGrid';

interface SummarySectionProps {
  dailyLimit: number;
  spentToday: number;
  onEdit: () => void;
}

export const SummarySection = memo(({ dailyLimit, spentToday, onEdit }: SummarySectionProps) => (
  <section className="transform-gpu">
    <div className="flex items-center gap-3 mb-6 px-1">
      <div className="flex items-center gap-2">
        {/* Dekorasi indikator tetap kita pertahankan untuk estetika */}
        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400">Ringkasan</h3>
      </div>
      <div className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent" />
    </div>

    {/* Progress Bar sudah dihapus, langsung fokus ke Grid Angka */}
    <SummaryGrid
      dailyLimit={dailyLimit}
      totalSpent={spentToday}
      onEditLimit={onEdit}
    />
  </section>
));