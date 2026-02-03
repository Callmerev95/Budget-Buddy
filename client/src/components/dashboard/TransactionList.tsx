import React, { memo } from 'react'; // 1. Tambah memo
import { Utensils, Car, ShoppingBag, Gamepad2, Layers, ChevronRight, Trash2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
  onDelete?: (id: string) => void;
  isDarkMode?: boolean; // Pastikan ini diterima [cite: 2026-02-03]
}

// Helper warna kategori yang adaptif terhadap tema [cite: 2026-02-03]
const getCategoryDetails = (category: string, isDarkMode: boolean) => {
  const isLight = !isDarkMode;
  switch (category) {
    case 'Makan & Minum':
      return {
        icon: <Utensils size={18} />,
        color: isLight ? 'text-orange-600' : 'text-orange-400',
        bg: isLight ? 'bg-orange-100' : 'bg-orange-500/10'
      };
    case 'Transportasi':
      return {
        icon: <Car size={18} />,
        color: isLight ? 'text-blue-600' : 'text-blue-400',
        bg: isLight ? 'bg-blue-100' : 'bg-blue-500/10'
      };
    case 'Belanja':
      return {
        icon: <ShoppingBag size={18} />,
        color: isLight ? 'text-purple-600' : 'text-purple-400',
        bg: isLight ? 'bg-purple-100' : 'bg-purple-500/10'
      };
    case 'Hiburan':
      return {
        icon: <Gamepad2 size={18} />,
        color: isLight ? 'text-pink-600' : 'text-pink-400',
        bg: isLight ? 'bg-pink-100' : 'bg-pink-500/10'
      };
    default:
      return {
        icon: <Layers size={18} />,
        color: isLight ? 'text-emerald-600' : 'text-emerald-400',
        bg: isLight ? 'bg-emerald-100' : 'bg-emerald-500/10'
      };
  }
};

// 2. Bungkus dengan memo
export const TransactionList = memo(({ transactions, limit, onDelete, isDarkMode = true }: TransactionListProps) => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { x: -5, opacity: 0 },
    show: { x: 0, opacity: 1, transition: { duration: 0.2 } }
  };

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className={`text-[11px] font-black uppercase tracking-[0.25em] transition-colors duration-500 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
          }`}>
          {limit ? 'Aktivitas Terbaru' : 'Daftar Transaksi'}
        </h3>

        {limit && transactions.length > limit && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/reports')}
            className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest py-2 px-4 rounded-xl border transition-all duration-500 ${isDarkMode
                ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/10 active:bg-emerald-500/10'
                : 'text-emerald-600 bg-emerald-50 border-emerald-100 active:bg-emerald-100'
              }`}
          >
            Lihat Semua <ChevronRight size={12} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((item) => {
              const details = getCategoryDetails(item.category, isDarkMode);
              return (
                <motion.div
                  key={item.id}
                  variants={itemAnim}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  layout
                  className={`p-4 rounded-[1.75rem] border flex items-center justify-between backdrop-blur-md relative overflow-hidden transform-gpu transition-all duration-500 ${isDarkMode
                      ? 'bg-zinc-900/30 border-white/5 shadow-none'
                      : 'bg-white border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]'
                    }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 flex-shrink-0 ${details.bg} ${details.color} rounded-2xl flex items-center justify-center shadow-sm transition-colors duration-500`}>
                      {details.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-black leading-tight tracking-tight truncate transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-zinc-900'
                        }`}>
                        {item.description}
                      </p>
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-black text-rose-500 tracking-tight whitespace-nowrap">
                        - Rp {item.amount.toLocaleString('id-ID')}
                      </p>
                      <div className={`flex items-center gap-1 transition-opacity duration-500 ${isDarkMode ? 'text-emerald-500/60' : 'text-emerald-600/80'
                        }`}>
                        <CheckCircle2 size={10} strokeWidth={3} />
                        <p className="text-[8px] font-black uppercase tracking-wider">Settled</p>
                      </div>
                    </div>

                    {onDelete && (
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className={`w-9 h-9 flex items-center justify-center transition-colors ${isDarkMode ? 'text-zinc-700 active:text-rose-500' : 'text-zinc-300 active:text-rose-500 hover:text-zinc-400'
                          }`}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`border border-dashed rounded-[2.5rem] py-16 text-center w-full transition-all duration-500 ${isDarkMode ? 'bg-zinc-900/20 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border transition-all duration-500 ${isDarkMode ? 'bg-zinc-900/50 text-zinc-700 border-white/5' : 'bg-white text-zinc-300 border-zinc-200'
                }`}>
                <Layers size={24} />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">No Transactions Found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});