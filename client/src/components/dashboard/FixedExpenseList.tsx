import React, { memo } from 'react';
import { Trash2, X, Calendar as CalendarIcon, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
}

interface FixedExpenseListProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: FixedExpense[];
  onDelete: (id: string) => void;
  onPay: (expense: FixedExpense) => void;
  onAddClick: () => void;
  isDarkMode?: boolean; // Sekarang sudah terpakai
}

export const FixedExpenseList = memo(({ isOpen, onClose, expenses, onDelete, onPay, onAddClick, isDarkMode = true }: FixedExpenseListProps) => {
  const today = new Date().getDate();

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        type: "tween",
        ease: "easeOut"
      }
    }
  };

  const itemAnim: Variants = {
    hidden: { x: -10, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[140] flex items-end justify-center">
          {/* Backdrop Blur Premium - Adaptif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 backdrop-blur-md transform-gpu transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950/90' : 'bg-zinc-900/40'
              }`}
            onClick={onClose}
          />

          {/* List Content - Adaptif */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            className={`relative w-full max-w-md rounded-t-[3rem] p-8 border-t shadow-2xl flex flex-col max-h-[90vh] transform-gpu transition-all duration-500 ${isDarkMode
                ? 'bg-zinc-900 border-white/5'
                : 'bg-white border-zinc-200 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]'
              }`}
          >
            {/* Handle Bar */}
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className={`text-2xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>Daftar Tagihan</h2>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Jangan sampai telat! </p>
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

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-4 overflow-y-auto pr-2 mb-8 custom-scrollbar flex-1 transform-gpu"
            >
              {expenses.length > 0 ? (
                expenses.map((item) => {
                  const isDueSoon = item.dueDate <= today + 3 && item.dueDate >= today;

                  return (
                    <motion.div
                      key={item.id}
                      variants={itemAnim}
                      className={`p-5 rounded-[2rem] border transition-all duration-500 relative overflow-hidden group transform-gpu ${isDueSoon
                          ? (isDarkMode ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.1)]' : 'bg-amber-50 border-amber-200')
                          : (isDarkMode ? 'bg-zinc-950/50 border-white/5' : 'bg-zinc-50 border-zinc-100')
                        }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-black text-base transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                              }`}>{item.name}</p>
                            {isDueSoon && <AlertCircle size={14} className="text-amber-500 animate-pulse" />}
                          </div>
                          <div className={`flex items-center text-[10px] font-black uppercase tracking-widest mt-1.5 transition-colors ${isDueSoon ? (isDarkMode ? 'text-amber-500' : 'text-amber-600') : 'text-zinc-500'
                            }`}>
                            <CalendarIcon size={12} className="mr-1.5" />
                            Tgl {item.dueDate} {isDueSoon && '• Segera Bayar!'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right mr-1">
                            <p className={`font-black text-sm transition-colors ${isDarkMode ? 'text-amber-400' : 'text-amber-600'
                              }`}>
                              Rp {item.amount.toLocaleString('id-ID')}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onPay(item)}
                              className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center shadow-lg active:scale-90 transition-all ${isDarkMode ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-600 text-white'
                                }`}
                              title="Bayar"
                            >
                              <CheckCircle2 size={20} strokeWidth={3} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(item.id)}
                              className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center border active:scale-90 transition-all ${isDarkMode ? 'bg-zinc-800/80 text-rose-500 border-white/5' : 'bg-zinc-100 text-rose-600 border-zinc-200'
                                }`}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-12 opacity-50">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDarkMode ? 'bg-zinc-800/50' : 'bg-zinc-100'
                    }`}>
                    <AlertCircle size={32} className="text-zinc-600" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Belum ada tagihan</p>
                </div>
              )}
            </motion.div>

            <button
              type="button"
              onClick={onAddClick}
              className={`w-full font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all ${isDarkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                }`}
            >
              <Plus size={20} strokeWidth={3} />
              TAMBAH TAGIHAN BARU
            </button>

            <div className="h-4"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});