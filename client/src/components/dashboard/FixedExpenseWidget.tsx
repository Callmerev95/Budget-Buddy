import { CreditCard, ListFilter } from 'lucide-react';

interface FixedExpenseWidgetProps {
  totalFixed: number;
  onOpen: () => void;
}

export const FixedExpenseWidget = ({ totalFixed, onOpen }: FixedExpenseWidgetProps) => (
  <button
    onClick={onOpen}
    className="w-full bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-3xl mb-8 flex items-center justify-between active:scale-[0.98] transition-all group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-colors">
        <CreditCard size={20} />
      </div>
      <div className="text-left">
        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest text-zinc-500">Tagihan Tetap</p>
        <p className="text-lg font-bold text-amber-200 leading-none mt-1">Rp {totalFixed.toLocaleString('id-ID')}</p>
      </div>
    </div>
    <div className="bg-zinc-800 p-2.5 rounded-xl text-zinc-500 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all">
      <ListFilter size={18} />
    </div>
  </button>
);