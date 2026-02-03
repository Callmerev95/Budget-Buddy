import React from 'react';
import { SummaryGrid } from './SummaryGrid';

interface SummarySectionProps {
  dailyLimit: number;
  spentToday: number;
  onEdit: () => void;
}

export const SummarySection = ({ dailyLimit, spentToday, onEdit }: SummarySectionProps) => (
  <section>
    <div className="flex items-center gap-3 mb-6 px-1">
      <div className="flex items-center gap-2">
        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400">Ringkasan</h3>
      </div>
      <div className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent" />
    </div>
    <SummaryGrid dailyLimit={dailyLimit} totalSpent={spentToday} onEditLimit={onEdit} />
  </section>
);