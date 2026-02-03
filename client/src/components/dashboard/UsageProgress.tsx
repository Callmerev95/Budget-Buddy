import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle } from 'lucide-react';

interface UsageProgressProps {
  spent: number;
  limit: number;
}

export const UsageProgress = memo(({ spent, limit }: UsageProgressProps) => {
  // Hitung persentase, maksimal 100% biar gak kebablasan keluar layar
  const percentage = Math.min((spent / limit) * 100, 100) || 0;
  const isOverLimit = spent > limit;

  // Jurus penentu warna dinamis
  const getStatusColor = () => {
    if (percentage < 60) return 'bg-emerald-500'; // Aman
    if (percentage < 85) return 'bg-amber-500';   // Hati-hati
    return 'bg-rose-500';                          // Kritis / Over
  };

  const getStatusBg = () => {
    if (percentage < 60) return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    if (percentage < 85) return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    return 'bg-rose-500/10 border-rose-500/20 text-rose-500';
  };

  return (
    <div className="mb-10 px-1 space-y-4 transform-gpu">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest w-fit transition-all duration-500 ${getStatusBg()}`}>
            {isOverLimit ? <AlertTriangle size={10} /> : <Zap size={10} fill="currentColor" />}
            {isOverLimit ? 'Limit Terlampaui' : 'Penggunaan Harian'}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Progress</p>
          <p className={`text-sm font-black italic transition-colors duration-500 ${isOverLimit ? 'text-rose-500' : 'text-white'}`}>
            {Math.round(percentage)}%
          </p>
        </div>
      </div>

      {/* Track Bar */}
      <div className="h-4 w-full bg-zinc-900/50 rounded-full border border-white/5 overflow-hidden p-[3px] shadow-inner relative">
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className={`h-full rounded-full relative transition-colors duration-700 ${getStatusColor()}`}
        >
          {/* Efek Kilau (Glossy) */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

          {/* Animasi Cahaya Berjalan */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
          />
        </motion.div>
      </div>

      <div className="flex justify-between items-center text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">
        <span>Rp 0</span>
        <span>Target: Rp {limit.toLocaleString('id-ID')}</span>
      </div>
    </div>
  );
});