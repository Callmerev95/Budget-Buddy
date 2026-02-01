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
      className={`relative overflow-hidden p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-700 ${isDanger ? 'bg-gradient-to-br from-rose-600 to-red-900' :
          isWarning ? 'bg-gradient-to-br from-orange-500 to-amber-700' :
            'bg-gradient-to-br from-emerald-500 to-teal-800'
        }`}
    >
      {/* Glossy Overlay Effect */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.25em]">
            Sisa Limit Hari Ini
          </p>
          <div className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse"></div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-white/50">Rp</span>
          <h2 className="text-4xl font-black tracking-tighter text-white">
            {remainingLimit.toLocaleString('id-ID')}
          </h2>
        </div>

        {dailyLimit > 0 && (
          <div className="mt-10">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Status Pemakaian</span>
                <span className="text-sm font-bold text-white">
                  {isDanger ? 'Limit Terlampaui' : isWarning ? 'Hampir Habis' : 'Aman Terkendali'}
                </span>
              </div>
              <span className="text-lg font-black text-white">{Math.round(usagePercentage)}%</span>
            </div>

            {/* High-End Progress Bar */}
            <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden p-1 border border-white/5 backdrop-blur-md">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className={`h-full rounded-full relative shadow-[0_0_15px_rgba(255,255,255,0.2)] ${isDanger ? 'bg-white' :
                    isWarning ? 'bg-amber-300' :
                      'bg-emerald-300'
                  }`}
              >
                {/* Refleksi cahaya pada progress bar */}
                <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/30 rounded-t-full"></div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Glass Orbs Decorations */}
      <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-[60px]"></div>
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/30 rounded-full blur-[70px]"></div>
    </motion.div>
  );
};