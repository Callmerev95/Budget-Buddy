import React, { useState } from 'react';
import { X, Calculator, Target, Wallet, Sparkles, Percent, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    monthlyIncome: number;
    savingsTarget: number;
    isPercentTarget: boolean;
    dailyLimit: number;
  }) => void;
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

  const calculateLimit = () => {
    const savingsAmount = isPercent ? (income * savings) / 100 : savings;
    const surplus = income - savingsAmount - totalFixed;
    return Math.max(0, Math.floor(surplus / 30));
  };

  const currentLimit = calculateLimit();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[160] flex items-end justify-center">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-zinc-900 rounded-t-[3rem] p-8 border-t border-white/5 shadow-2xl flex flex-col"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8"></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Smart Planner <Sparkles size={20} className="text-emerald-500" />
                </h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Rancang strategi hematmu</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Input Gaji */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4 flex items-center gap-2">
                  <Wallet size={12} /> Gaji Bulanan
                </label>
                <div className="relative group">
                  {/* Fixed: Label transparan tanpa bg putih [cite: 2026-01-12] */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg pointer-events-none select-none bg-transparent z-10">
                    Rp
                  </div>
                  <input
                    type="number"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 pl-14 pr-6 text-white font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                    value={income || ''}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Input Tabungan */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                    <Target size={12} /> Target Tabungan
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPercent(!isPercent)}
                    className="flex items-center gap-1.5 text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20 active:scale-95 transition-all uppercase tracking-tighter"
                  >
                    {isPercent ? <Percent size={10} /> : <Coins size={10} />}
                    Pakai {isPercent ? 'Nominal' : 'Persen'}
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 px-6 text-white font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                    value={savings || ''}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    placeholder="0"
                  />
                  {/* Fixed: Label transparan tanpa bg putih [cite: 2026-01-12] */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-lg pointer-events-none select-none bg-transparent z-10">
                    {isPercent ? '%' : 'Rp'}
                  </div>
                </div>
              </div>

              {/* Live Preview Hasil */}
              <motion.div
                layout
                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-6 text-center shadow-inner relative overflow-hidden"
              >
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Limit Harian Otomatis</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm font-bold text-white/40 italic">Rp</span>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      {currentLimit.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2 py-1.5 px-3 bg-black/20 rounded-full w-fit mx-auto border border-white/5">
                    <Calculator size={10} className="text-zinc-500" />
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter italic">
                      Potong Tagihan: Rp {totalFixed.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => onSave({ monthlyIncome: income, savingsTarget: savings, isPercentTarget: isPercent, dailyLimit: currentLimit })}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-5 rounded-[1.5rem] shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
              >
                TERAPKAN RENCANA
              </button>
            </div>

            <div className="h-6"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};