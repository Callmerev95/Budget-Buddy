// client/src/components/dashboard/TransactionList.tsx
import { Utensils, Car, ShoppingBag, Gamepad2, Layers } from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Makan & Minum': return <Utensils size={18} />;
    case 'Transportasi': return <Car size={18} />;
    case 'Belanja': return <ShoppingBag size={18} />;
    case 'Hiburan': return <Gamepad2 size={18} />;
    default: return <Layers size={18} />;
  }
};

export const TransactionList = ({ transactions }: { transactions: Transaction[] }) => (
  <div className="mt-4">
    <div className="flex justify-between items-center mb-4 px-1">
      <h3 className="text-lg font-bold text-white">Transaksi Terakhir</h3>
      <button className="text-emerald-500 text-sm font-medium">Lihat Semua</button>
    </div>
    <div className="space-y-3">
      {transactions.length > 0 ? (
        transactions.slice(0, 5).map((item) => (
          <div key={item.id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-500">
                {getCategoryIcon(item.category)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.description}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-medium">{item.category}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-rose-400">- Rp {item.amount.toLocaleString('id-ID')}</p>
          </div>
        ))
      ) : (
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-600">
          <p className="text-sm">Belum ada catatan hari ini.</p>
        </div>
      )}
    </div>
  </div>
);