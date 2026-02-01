import { Trash2, X, Calendar as CalendarIcon, Plus, CheckCircle2 } from 'lucide-react';

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
}

interface FixedExpenseListProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: FixedExpense[];
  onDelete: (id: string) => void;
  onPay: (expense: FixedExpense) => void; // Tambahkan fungsi bayar
  onAddClick: () => void;
}

export const FixedExpenseList = ({ isOpen, onClose, expenses, onDelete, onPay, onAddClick }: FixedExpenseListProps) => {
  if (!isOpen) return null;

  const today = new Date().getDate();

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Daftar Tagihan 📌</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 mb-6 custom-scrollbar flex-1">
          {expenses.length > 0 ? (
            expenses.map((item) => {
              // Poin 3: Indikator Jatuh Tempo (H-3)
              const isDueSoon = item.dueDate <= today + 3 && item.dueDate >= today;

              return (
                <div key={item.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${isDueSoon ? 'bg-amber-500/10 border-amber-500/30' : 'bg-zinc-800/50 border-zinc-700/50'}`}>
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <div className={`flex items-center text-[10px] uppercase font-bold mt-1 ${isDueSoon ? 'text-amber-500' : 'text-zinc-500'}`}>
                      <CalendarIcon size={12} className="mr-1" />
                      Tgl {item.dueDate} {isDueSoon && '• Segera Bayar!'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-amber-400 font-bold text-sm mr-2">Rp {item.amount.toLocaleString('id-ID')}</p>

                    {/* Poin 2: Tombol Bayar Otomatis */}
                    <button
                      onClick={() => onPay(item)}
                      className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-zinc-950 transition-all"
                    >
                      <CheckCircle2 size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2.5 text-zinc-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-zinc-500 py-8 text-sm italic">Belum ada tagihan terdaftar.</p>
          )}
        </div>

        <button
          onClick={onAddClick}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          TAMBAH TAGIHAN BARU
        </button>
      </div>
    </div>
  );
};