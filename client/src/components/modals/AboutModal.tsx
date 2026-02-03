import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ShieldCheck, Cpu, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, userEmail }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-zinc-900 border border-white/5 rounded-[40px] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>

            <div className="p-8 pt-12">
              {/* Header: Logo & Branding */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-inner">
                  <Wallet className="text-emerald-500" size={36} />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white">
                  BUDGET<span className="text-emerald-500">BUDDY</span>
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[3px] mt-1">Premium Personal Finance</p>
              </div>

              {/* Filosofi Budget Buddy */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 mb-6 text-center">
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  "Budget Buddy lahir dari keresahan akan manajemen keuangan yang ribet. Dibuat sesimpel mungkin, seaman mungkin, agar Anda bisa fokus pada masa depan, bukan sekadar angka."
                </p>
              </div>

              {/* Info Teknis & Integrity */}
              <div className="space-y-3 px-1 mb-8">
                <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" /> Authorized User
                  </span>
                  <span className="text-zinc-200 truncate max-w-[140px] font-medium">{userEmail || 'Buddy'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Cpu size={12} className="text-emerald-500" /> Build Version
                  </span>
                  <span className="text-zinc-200 font-mono text-[9px]">v1.0.0-stable</span>
                </div>
                <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-2">
                  <span className="text-zinc-500 uppercase font-bold tracking-widest flex items-center gap-2">
                    <Globe size={12} className="text-emerald-500" /> Cloud Sync
                  </span>
                  <span className="text-zinc-300 font-bold uppercase tracking-tighter text-[9px]">Verified & Synchronized</span>
                </div>
              </div>

              {/* Creator Badge (REV Corner) */}
              <div className="text-center pt-2">
                <p className="text-[9px] text-zinc-600 uppercase tracking-[4px] mb-4 font-bold">Crafted with passion by</p>
                <a
                  href="https://www.tiktok.com/@callmerev95"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-white/[0.03] border border-white/10 px-12 py-3 rounded-full active:scale-95 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all group"
                >
                  <span className="text-zinc-400 font-black text-xs tracking-[8px] group-hover:text-emerald-400 transition-colors uppercase ml-2">REV</span>
                </a>
              </div>
            </div>

            {/* Footer Tagline: Diperkecil agar lebih elegan & tidak press */}
            <div className="bg-black/40 py-5 text-center border-t border-white/5">
              <p className="text-[7px] text-zinc-700 uppercase tracking-[4px] font-black italic opacity-80">
                Next Gen Financial Framework · 2026
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutModal;