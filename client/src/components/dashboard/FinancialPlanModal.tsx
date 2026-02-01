import React, { useState, useEffect } from 'react';
import { X, Wallet, Target, Calculator } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData: {
    monthlyIncome: number;
    savingsTarget: number;
    isPercentTarget: boolean;
  };
  totalFixed: number;
}

export const FinancialPlanModal = ({ isOpen, onClose, onSave, initialData, totalFixed }: Props) => {
  const [income, setIncome] = useState(initialData.monthlyIncome || 0);
  const [savings, setSavings] = useState(initialData.savingsTarget || 0);
  const [isPercent, setIsPercent] = useState(initialData.isPercentTarget || false);

  // Rumus Sakti: (Gaji - Tabungan - Tagihan) / 30 [cite: 2026-01-14]
  const calculateLimit = () => {
    const savingsAmount = isPercent ? (income * savings) / 100 : savings;
    const surplus = income - savingsAmount - totalFixed;
    return Math.max(0, Math.floor(surplus / 30));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calculator className="text-emerald-500" /> Smart Planner
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
        </div>

        <div className="space-y-6">
          {/* Input Gaji */}
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Gaji Bulanan</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">Rp</span>
              <input
                type="number"
                className="w-full bg-zinc-800 border-none rounded-2xl p-4 pl-12 text-white font-bold focus:ring-2 focus:ring-emerald-500"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Input Tabungan */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Target Tabungan</label>
              <button
                onClick={() => setIsPercent(!isPercent)}
                className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-bold"
              >
                PAKAI {isPercent ? 'NOMINAL' : 'PERSEN (%)'}
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white font-bold focus:ring-2 focus:ring-emerald-500"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{isPercent ? '%' : 'Rp'}</span>
            </div>
          </div>

          {/* Live Preview Hasil */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Limit Harian Otomatis</p>
            <p className="text-3xl font-black text-white">Rp {calculateLimit().toLocaleString('id-ID')}</p>
            <p className="text-[9px] text-zinc-500 mt-2 italic">*Setelah dikurangi tagihan Rp {totalFixed.toLocaleString('id-ID')}</p>
          </div>

          <button
            onClick={() => onSave({ monthlyIncome: income, savingsTarget: savings, isPercentTarget: isPercent, dailyLimit: calculateLimit() })}
            className="w-full bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            TERAPKAN RENCANA 🚀
          </button>
        </div>
      </div>
    </div>
  );
};