import React, { useState, memo } from 'react'; // 1. Tambah memo
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
  isDarkMode?: boolean; // Tambah props tema
}

// 2. Bungkus dengan memo agar Dashboard scroll nggak bikin modal ini re-render
export const FinancialPlanModal = memo(({ isOpen, onClose, onSave, initialData, totalFixed, isDarkMode = true }: Props) => {
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
          {/* Backdrop Blur Premium - Adaptif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 backdrop-blur-md transform-gpu transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950/90' : 'bg-zinc-900/40'
              }`}
            onClick={onClose}
          />

          {/* Drawer Content - Adaptif */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            className={`relative w-full max-w-md rounded-t-[3rem] p-8 border-t shadow-2xl flex flex-col transform-gpu transition-all duration-500 ${isDarkMode
                ? 'bg-zinc-900 border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'
                : 'bg-white border-zinc-200 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]'
              }`}
          >
            {/* Handle Bar */}
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className={`text-2xl font-black tracking-tight flex items-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>
                  Smart Planner <Sparkles size={20} className="text-emerald-500" />
                </h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Rancang strategi hematmu</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                  }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Input Gaji */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest ml-4 flex items-center gap-2 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'
                  }`}>
                  <Wallet size={12} /> Gaji Bulanan
                </label>
                <div className="relative group">
                  <div className={`absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg pointer-events-none select-none z-10 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'
                    }`}>
                    Rp
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    className={`w-full border rounded-[2rem] py-4 pl-14 pr-6 font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all appearance-none ${isDarkMode
                        ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    value={income || ''}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Input Tabungan */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'
                    }`}>
                    <Target size={12} /> Target Tabungan
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsPercent(!isPercent)}
                    className={`flex items-center gap-1.5 text-[9px] font-black px-3 py-1.5 rounded-full border active:scale-95 transition-all uppercase tracking-tighter ${isDarkMode
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}
                  >
                    {isPercent ? <Percent size={10} /> : <Coins size={10} />}
                    Pakai {isPercent ? 'Nominal' : 'Persen'}
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    inputMode="numeric"
                    className={`w-full border rounded-[2rem] py-4 px-6 font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-all appearance-none ${isDarkMode
                        ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                      }`}
                    value={savings || ''}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    placeholder="0"
                  />
                  <div className={`absolute right-6 top-1/2 -translate-y-1/2 font-black text-lg pointer-events-none select-none z-10 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                    {isPercent ? '%' : 'Rp'}
                  </div>
                </div>
              </div>

              {/* Live Preview Hasil - Adaptif */}
              <motion.div
                layout
                className={`border rounded-[2rem] p-6 text-center shadow-inner relative overflow-hidden transform-gpu transition-all duration-500 ${isDarkMode
                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20'
                    : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'
                  }`}
              >
                <div className="relative z-10">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'
                    }`}>
                    Limit Harian Otomatis
                  </p>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className={`text-sm font-bold italic ${isDarkMode ? 'text-white/40' : 'text-zinc-400'}`}>Rp</span>
                    <p className={`text-3xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                      }`}>
                      {currentLimit.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className={`mt-3 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full w-fit mx-auto border transition-colors ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-zinc-200 shadow-sm'
                    }`}>
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
                className={`w-full font-black py-5 rounded-[2rem] shadow-[0_15px_30px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 ${isDarkMode ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-600 text-white'
                  }`}
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
});