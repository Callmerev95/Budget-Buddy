import { Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  fixedData: any;
  setFixedData: (data: any) => void;
  loading: boolean;
}

export const AddFixedExpenseModal = ({ isOpen, onClose, onSubmit, fixedData, setFixedData, loading }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-200 shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-white">Tagihan Baru 📌</h2>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <input type="text" required placeholder="Nama Tagihan" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500" value={fixedData.name} onChange={(e) => setFixedData({ ...fixedData, name: e.target.value })} />
          <input type="number" required placeholder="Nominal" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-amber-400 font-bold text-lg focus:ring-2 focus:ring-amber-500" value={fixedData.amount} onChange={(e) => setFixedData({ ...fixedData, amount: e.target.value })} />
          <div className="flex items-center bg-zinc-800 rounded-2xl p-4 text-white">
            <Calendar size={18} className="text-zinc-500 mr-3" />
            <input type="number" min="1" max="31" required placeholder="Tgl (1-31)" className="w-full bg-transparent focus:outline-none font-medium" value={fixedData.dueDate} onChange={(e) => setFixedData({ ...fixedData, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-zinc-800 font-bold py-4 rounded-2xl text-white">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-2xl disabled:opacity-50">
              {loading ? '...' : 'SIMPAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};