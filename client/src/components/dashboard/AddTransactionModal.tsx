import React from 'react';
import { X, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    description: string;
    amount: string | number;
    category: string;
  };
  setFormData: (data: any) => void;
  loading: boolean;
}

export const AddTransactionModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal / Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-zinc-900 rounded-t-[3rem] p-8 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Handle Bar untuk kesan Drawer HP */}
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8"></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Tambah Catatan</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Uang jajan hari ini</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Input Deskripsi */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="Beli apa hari ini?"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 px-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Input Nominal dengan Simbol Rp */}
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-lg">Rp</div>
                <input
                  type="number"
                  required
                  placeholder="0"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-emerald-400 font-black text-2xl focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* Select Category Custom Style */}
              <div className="relative">
                <select
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-[1.5rem] py-4 px-6 text-white appearance-none focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Makan & Minum">🍔 Makan & Minum</option>
                  <option value="Transportasi">🚗 Transportasi</option>
                  <option value="Belanja">🛍️ Belanja</option>
                  <option value="Hiburan">🎮 Hiburan</option>
                  <option value="Lainnya">✨ Lainnya</option>
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={18} />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-5 rounded-[1.5rem] shadow-[0_10px_20px_rgba(16,185,129,0.2)] mt-4 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Memproses...' : (
                  <>
                    <Zap size={20} fill="currentColor" />
                    Simpan Transaksi
                  </>
                )}
              </button>
            </form>

            {/* Spacing buat Keyboard Mobile */}
            <div className="h-6"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};