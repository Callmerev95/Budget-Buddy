import React, { memo } from 'react'; // 1. Import memo
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
  isDarkMode?: boolean; // Tambahkan ini buat sinkronisasi tema
}

// 2. Bungkus dengan memo agar tidak re-render saat state dashboard lain berubah
export const AddTransactionModal = memo(({ isOpen, onClose, onSubmit, formData, setFormData, loading, isDarkMode = true }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop Blur - Sesuaikan kegelapan sesuai tema */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 backdrop-blur-md transform-gpu transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950/80' : 'bg-zinc-900/40'
              }`}
            onClick={onClose}
          />

          {/* Modal / Drawer Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
            className={`relative w-full max-w-md rounded-t-[3rem] p-8 border-t shadow-2xl transform-gpu transition-all duration-500 ${isDarkMode
                ? 'bg-zinc-900 border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]'
                : 'bg-white border-zinc-200 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]'
              }`}
          >
            {/* Handle Bar */}
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-8 transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'
              }`}></div>

            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h2 className={`text-2xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>
                  Tambah Catatan
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Uang jajan hari ini</p>
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

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Input Deskripsi */}
              <div className="relative group">
                <input
                  type="text"
                  required
                  placeholder="Beli apa hari ini?"
                  className={`w-full border rounded-[1.5rem] py-4 px-6 focus:outline-none focus:border-emerald-500/50 transition-all ${isDarkMode
                      ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'
                    }`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Input Nominal */}
              <div className="relative">
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 font-black text-lg transition-colors ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'
                  }`}>
                  Rp
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  className={`w-full border rounded-[1.5rem] py-5 pl-14 pr-6 font-black text-2xl focus:outline-none focus:border-emerald-500/50 transition-all ${isDarkMode
                      ? 'bg-zinc-950 border-zinc-800 text-emerald-400'
                      : 'bg-zinc-50 border-zinc-200 text-emerald-600'
                    }`}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* Select Category */}
              <div className="relative">
                <select
                  className={`w-full border rounded-[1.5rem] py-4 px-6 appearance-none focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer ${isDarkMode
                      ? 'bg-zinc-950 border-zinc-800 text-white'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
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
                className={`w-full font-black py-5 rounded-[1.5rem] shadow-[0_10px_20px_rgba(16,185,129,0.2)] mt-4 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-emerald-500 text-zinc-950' : 'bg-emerald-600 text-white'
                  }`}
              >
                {loading ? 'Memproses...' : (
                  <>
                    <Zap size={20} fill="currentColor" />
                    Simpan Transaksi
                  </>
                )}
              </button>
            </form>

            <div className="h-6"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});