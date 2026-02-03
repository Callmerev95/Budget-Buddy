import React from 'react';
import { Calendar } from 'lucide-react';
import { TransactionList } from './TransactionList';

interface ActivitySectionProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  transactions: any[];
  onDelete: (id: string) => void;
}

export const ActivitySection = ({ selectedDate, onDateChange, transactions, onDelete }: ActivitySectionProps) => (
  <section>
    <div className="flex items-center justify-between mb-6 px-1">
      <div className="flex items-center gap-2 flex-grow">
        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400 whitespace-nowrap">Aktivitas</h3>
        <div className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent ml-2" />
      </div>
      <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-xl px-3 py-1.5 ml-4 shadow-sm transform-gpu">
        <Calendar size={12} className="text-emerald-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-transparent text-emerald-500 text-[9px] font-black focus:outline-none uppercase cursor-pointer"
        />
      </div>
    </div>
    <TransactionList transactions={transactions} onDelete={onDelete} />
  </section>
);