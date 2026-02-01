// client/src/components/dashboard/BalanceCard.tsx
interface BalanceCardProps {
  remainingLimit: number;
  usagePercentage: number;
  dailyLimit: number;
}

export const BalanceCard = ({ remainingLimit, usagePercentage, dailyLimit }: BalanceCardProps) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-7 rounded-[2rem] shadow-2xl mb-8">
    <div className="relative z-10">
      <p className="text-emerald-100/80 text-sm font-medium mb-1 uppercase tracking-tighter">Sisa Limit Hari Ini</p>
      <h2 className="text-4xl font-extrabold tracking-tight">
        Rp {remainingLimit.toLocaleString('id-ID')}
      </h2>

      {dailyLimit > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-widest text-emerald-100/60">
            <span>Pemakaian</span>
            <span>{Math.min(Math.round(usagePercentage), 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={`h-full transition-all duration-700 ease-out ${usagePercentage >= 90 ? 'bg-rose-400' : 'bg-emerald-300'}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
  </div>
);