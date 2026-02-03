import React, { memo } from 'react'; // 1. Tambah memo
import { Calendar, X, Pin, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  fixedData: {
    name: string;
    amount: string | number;
    dueDate: string | number;
  };
  setFixedData: (data: any) => void;
  loading: boolean;
}

// 2. Bungkus dengan memo
export const AddFixedExpenseModal = memo(({ isOpen, onClose, onSubmit, fixedData, setFixedData, loading }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          {/* Backdrop dengan GPU acceleration */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md transform-gpu"
            onClick={onClose}
          />

          {/* Drawer Content - Optimasi transisi */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            // Ganti spring ke tween yang lebih enteng buat HP low-end
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            className="relative w-full max-w-md bg-zinc-900 rounded-t-[3rem] p-8 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] transform-gpu"
          >
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8"></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Tagihan Baru <Pin size={20} className="text-amber-500 rotate-12" />
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Komitmen bulananmu</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Netflix, Listrik, Kosan"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 px-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/50 transition-all"
                  value={fixedData.name}
                  onChange={(e) => setFixedData({ ...fixedData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Nominal</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 font-black text-lg">Rp</div>
                  <input
                    type="number"
                    inputMode="numeric" // Munculin keypad angka di HP
                    required
                    placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-amber-400 font-black text-2xl focus:outline-none transition-all"
                    value={fixedData.amount}
                    onChange={(e) => setFixedData({ ...fixedData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Tanggal Jatuh Tempo (1-31)</label>
                <div className="relative group">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="31"
                    required
                    placeholder="Pilih Tanggal"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 pl-14 pr-6 text-white focus:outline-none transition-all font-bold"
                    value={fixedData.dueDate}
                    onChange={(e) => setFixedData({ ...fixedData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-zinc-800/50 border border-white/5 text-zinc-400 font-black py-5 rounded-[1.5rem] active:scale-95 transition-all"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-amber-500 text-zinc-950 font-black py-5 rounded-[1.5rem] shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'MENYIMPAN...' : (
                    <>
                      <Sparkles size={18} fill="currentColor" />
                      SIMPAN TAGIHAN
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="h-6"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});