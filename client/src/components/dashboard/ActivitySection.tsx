import React, { memo } from 'react'; // 1. Tambah memo
import { Calendar } from 'lucide-react';
import { TransactionList } from './TransactionList';

interface ActivitySectionProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  transactions: any[];
  onDelete: (id: string) => void;
  isDarkMode?: boolean; // Tambahkan ini [cite: 2026-02-03]
}

// 2. Bungkus dengan memo agar tidak re-render saat Dashboard scroll
export const ActivitySection = memo(({ selectedDate, onDateChange, transactions, onDelete, isDarkMode = true }: ActivitySectionProps) => (
  <section className="transform-gpu"> {/* Tambah GPU layer */}
    <div className="flex items-center justify-between mb-6 px-1">
      <div className="flex items-center gap-2 flex-grow">
        <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <h3 className={`text-xs font-black tracking-[0.3em] uppercase whitespace-nowrap transition-colors duration-500 ${
          isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          Aktivitas
        </h3>
        {/* Divider dinamis sesuai tema [cite: 2026-02-03] */}
        <div className={`h-[1px] flex-grow ml-2 transition-all duration-500 bg-gradient-to-r ${
          isDarkMode ? 'from-zinc-800 to-transparent' : 'from-zinc-200 to-transparent'
        }`} />
      </div>

      {/* Container Input date dengan logic tema [cite: 2026-02-03] */}
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 ml-4 shadow-sm transform-gpu active:scale-95 transition-all duration-500 ${
        isDarkMode 
          ? 'bg-zinc-900 border-white/5' 
          : 'bg-white border-zinc-200 shadow-zinc-200/50'
      }`}>
        <Calendar size={12} className="text-emerald-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={`bg-transparent text-[9px] font-black focus:outline-none uppercase cursor-pointer transition-colors duration-500 ${
            isDarkMode ? 'text-emerald-500' : 'text-emerald-600'
          }`}
          // Menyesuaikan color-scheme browser agar popup kalender sinkron [cite: 2026-02-03]
          style={{ colorScheme: isDarkMode ? 'dark' : 'light' }} 
        />
      </div>
    </div>

    {/* Pastikan TransactionList juga menerima props isDarkMode jika perlu modifikasi warna item */}
    <TransactionList transactions={transactions} onDelete={onDelete} isDarkMode={isDarkMode} />
  </section>
));