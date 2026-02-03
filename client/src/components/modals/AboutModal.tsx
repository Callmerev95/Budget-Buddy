import React, { memo } from 'react'; // 1. Tambah memo
import { motion, AnimatePresence, Variants } from 'framer-motion'; // 2. Tambah Variants
import { Wallet, X, ShieldCheck, Cpu, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isDarkMode?: boolean; // Tambah props tema
}

// 3. Bungkus dengan memo
const AboutModal: React.FC<AboutModalProps> = memo(({ isOpen, onClose, userEmail, isDarkMode = true }) => {

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "tween", ease: "easeOut", duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          {/* Backdrop Blur Premium - Adaptif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 backdrop-blur-2xl transform-gpu transition-colors duration-500 ${isDarkMode ? 'bg-black/90' : 'bg-zinc-900/30'
              }`}
          />

          {/* Modal Content - Adaptif */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={`relative w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden transform-gpu transition-all duration-500 border ${isDarkMode
                ? 'bg-zinc-900 border-white/5'
                : 'bg-white border-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className={`absolute top-6 right-6 p-2 rounded-full transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 text-zinc-500 hover:text-white' : 'bg-zinc-100 text-zinc-400 hover:text-zinc-900'
                }`}
            >
              <X size={16} />
            </button>

            <div className="p-8 pt-12">
              {/* Header: Logo & Branding */}
              <div className="text-center mb-8">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-4 border shadow-inner transform-gpu transition-all ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                  <Wallet className="text-emerald-500" size={36} />
                </div>
                <h2 className={`text-2xl font-black italic tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'
                  }`}>
                  BUDGET<span className="text-emerald-500">BUDDY</span>
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[3px] mt-1">Premium Personal Finance</p>
              </div>

              {/* Filosofi Budget Buddy */}
              <div className={`border rounded-3xl p-5 mb-6 text-center transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'
                }`}>
                <p className={`text-[11px] leading-relaxed italic transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                  "Budget Buddy lahir dari keresahan akan manajemen keuangan yang ribet. Dibuat sesimpel mungkin, seaman mungkin, agar Anda bisa fokus pada masa depan, bukan sekadar angka."
                </p>
              </div>

              {/* Info Teknis & Integrity */}
              <div className="space-y-3 px-1 mb-8">
                <div className={`flex justify-between items-center text-[10px] border-b pb-2 transition-colors ${isDarkMode ? 'border-white/5' : 'border-zinc-100'
                  }`}>
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authorized User
                  </span>
                  <span className={`truncate max-w-[140px] font-medium transition-colors ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'
                    }`}>{userEmail || 'Buddy'}</span>
                </div>
                <div className={`flex justify-between items-center text-[10px] border-b pb-2 transition-colors ${isDarkMode ? 'border-white/5' : 'border-zinc-100'
                  }`}>
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Cpu size={12} className="text-emerald-500" /> Build Version
                  </span>
                  <span className={`font-mono text-[9px] transition-colors ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'
                    }`}>v1.0.0-stable</span>
                </div>
                <div className={`flex justify-between items-center text-[10px] border-b pb-2 transition-colors ${isDarkMode ? 'border-white/5' : 'border-zinc-100'
                  }`}>
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Globe size={12} className="text-emerald-500" /> Cloud Sync
                  </span>
                  <span className={`font-bold uppercase tracking-tighter text-[9px] transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-emerald-600'
                    }`}>Verified & Synchronized</span>
                </div>
              </div>

              {/* Creator Badge (REV Corner) */}
              <div className="text-center pt-2">
                <p className="text-[9px] text-zinc-600 uppercase tracking-[4px] mb-4 font-bold">Crafted with passion by</p>
                <a
                  href="https://www.tiktok.com/@callmerev95"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center border px-12 py-3 rounded-full active:scale-95 transition-all group ${isDarkMode ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                    }`}
                >
                  <span className={`font-black text-xs tracking-[8px] transition-colors uppercase ml-2 group-hover:text-emerald-500 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>REV</span>
                </a>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className={`py-5 text-center border-t transition-all ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-zinc-50 border-zinc-100'
              }`}>
              <p className={`text-[7px] uppercase tracking-[4px] font-black italic opacity-80 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'
                }`}>
                Next Gen Financial Framework · 2026
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default AboutModal;