import { motion } from 'framer-motion';

interface BalanceCardProps {
  remainingLimit: number;
  usagePercentage: number;
  dailyLimit: number;
}

export const BalanceCard = ({ remainingLimit, usagePercentage, dailyLimit }: BalanceCardProps) => {
  const isWarning = usagePercentage >= 85;
  const isDanger = usagePercentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isDanger ? 'bg-rose-600' :
          isWarning ? 'bg-orange-500' :
            'bg-emerald-600'
        }`}
    >
      {/* 1. Animated Gradient Background Layer [cite: 2026-01-14] */}
      <motion.div
        animate={{
          background: [
            `radial-gradient(circle at 20% 30%, ${isDanger ? '#9f1239' : isWarning ? '#b45309' : '#065f46'} 0%, transparent 50%)`,
            `radial-gradient(circle at 80% 70%, ${isDanger ? '#be123c' : isWarning ? '#d97706' : '#047857'} 0%, transparent 50%)`,
            `radial-gradient(circle at 20% 30%, ${isDanger ? '#9f1239' : isWarning ? '#b45309' : '#065f46'} 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0"
      />

      {/* 2. Glassy Overlay with subtle movement [cite: 2026-01-14] */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none border border-white/10 rounded-[2.5rem] z-[1]"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">
            Sisa Limit Hari Ini
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse"></div>
            <div className="text-[8px] font-black text-white/30 uppercase tracking-tighter">Live Status</div>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white/50 italic">Rp</span>
          <motion.h2
            key={remainingLimit} // Triggers animation on change [cite: 2026-01-14]
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black tracking-tighter text-white"
          >
            {remainingLimit.toLocaleString('id-ID')}
          </motion.h2>
        </div>

        {dailyLimit > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Pemakaian</span>
                <span className="text-sm font-black text-white italic">
                  {isDanger ? '🔥 Limit Terlampaui' : isWarning ? '⚠️ Hampir Habis' : '✅ Aman Terkendali'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white">{Math.round(usagePercentage)}%</span>
              </div>
            </div>

            {/* High-End Progress Bar [cite: 2026-01-14] */}
            <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden p-1 border border-white/5 backdrop-blur-md shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }} // Custom spring-like feel
                className={`h-full rounded-full relative ${isDanger ? 'bg-white shadow-[0_0_20px_#fff]' :
                    isWarning ? 'bg-amber-300 shadow-[0_0_20px_rgba(252,211,77,0.5)]' :
                      'bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.5)]'
                  }`}
              >
                {/* Refleksi cahaya bergerak pada progress bar */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Orbs with slower animation [cite: 2026-01-14] */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -right-10 -top-10 w-44 h-44 bg-white rounded-full blur-[60px]"
      />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/30 rounded-full blur-[70px]"></div>
    </motion.div>
  );
};