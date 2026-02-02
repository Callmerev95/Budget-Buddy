import { Utensils, Car, ShoppingBag, Gamepad2, Layers, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
}

// Tambahkan prop limit agar bisa dikontrol dari parent [cite: 2026-01-12]
interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
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

export const TransactionList = ({ transactions, limit }: TransactionListProps) => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Logika pembatasan list [cite: 2026-01-14]
  const displayedTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-5 px-2">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
          {limit ? 'Aktivitas Terbaru' : 'Semua Aktivitas'}
        </h3>

        {/* Tombol Semua hanya muncul jika ada limit (di Dashboard) [cite: 2026-01-14] */}
        {limit && transactions.length > limit && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 py-1.5 px-4 rounded-full border border-emerald-500/10 hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-500/5"
          >
            Semua <ChevronRight size={12} strokeWidth={3} />
          </motion.button>
        )}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {displayedTransactions.length > 0 ? (
          displayedTransactions.map((item) => {
            const details = getCategoryDetails(item.category);
            return (
              <motion.div
                key={item.id}
                variants={itemAnim}
                whileTap={{ scale: 0.98 }}
                className="bg-zinc-900/40 border border-white/5 p-4 rounded-[1.75rem] flex items-center justify-between backdrop-blur-sm group active:bg-zinc-900/60 transition-all cursor-pointer shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    className={`w-12 h-12 ${details.bg} ${details.color} rounded-2xl flex items-center justify-center shadow-inner`}
                  >
                    {details.icon}
                  </motion.div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight group-hover:text-emerald-400 transition-colors">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">
                      {item.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-rose-400">
                    - Rp {item.amount.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">Berhasil</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900/20 border border-dashed border-zinc-800 rounded-[2rem] p-10 text-center"
          >
            <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-600">
              <Layers size={20} />
            </div>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Belum ada transaksi</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};