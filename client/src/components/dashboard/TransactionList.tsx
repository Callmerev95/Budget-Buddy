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
}

const getCategoryDetails = (category: string) => {
  switch (category) {
    case 'Makan & Minum':
      return { icon: <Utensils size={18} />, color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'Transportasi':
      return { icon: <Car size={18} />, color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'Belanja':
      return { icon: <ShoppingBag size={18} />, color: 'text-purple-400', bg: 'bg-purple-500/10' };
    case 'Hiburan':
      return { icon: <Gamepad2 size={18} />, color: 'text-pink-400', bg: 'bg-pink-500/10' };
    default:
      return { icon: <Layers size={18} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  }
};

export const TransactionList = ({ transactions, limit, onDelete }: TransactionListProps) => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemAnim = {
    hidden: { x: -10, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
          {limit ? 'Aktivitas Terbaru' : 'Daftar Transaksi'}
        </h3>

        {limit && transactions.length > limit && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/5 py-2 px-4 rounded-xl border border-emerald-500/10 active:bg-emerald-500/10 transition-all"
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
        <AnimatePresence mode="popLayout">
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((item) => {
              const details = getCategoryDetails(item.category);
              return (
                <motion.div
                  key={item.id}
                  variants={itemAnim}
                  exit={{ opacity: 0, scale: 0.95, x: 20 }}
                  layout
                  className="bg-zinc-900/30 border border-white/5 p-4 rounded-[1.75rem] flex items-center justify-between backdrop-blur-md relative overflow-hidden active:bg-zinc-900/60 transition-all"
                >
                  {/* SISI KIRI: Ikon & Info Deskripsi */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 flex-shrink-0 ${details.bg} ${details.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      {details.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white leading-tight tracking-tight truncate">
                        {item.description}
                      </p>
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mt-1">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  {/* SISI KANAN: Nominal & Status Settled (Saran User) */}
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-sm font-black text-rose-500 tracking-tight whitespace-nowrap">
                        - Rp {item.amount.toLocaleString('id-ID')}
                      </p>

                      {/* Badge Settled diletakkan di bawah nominal */}
                      <div className="flex items-center gap-1 text-emerald-500/60">
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
                        className="w-9 h-9 flex items-center justify-center text-zinc-700 active:text-rose-500 transition-colors"
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
              className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2.5rem] py-16 text-center w-full"
            >
              <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-700 border border-white/5">
                <Layers size={24} />
              </div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">No Transactions Found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};