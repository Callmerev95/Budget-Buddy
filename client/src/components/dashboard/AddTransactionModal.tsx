import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  loading: boolean;
}

export const AddTransactionModal = ({ isOpen, onClose, onSubmit, formData, setFormData, loading }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] p-8 border-t border-zinc-800 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Tambah Catatan 📝</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          <input type="text" required placeholder="Deskripsi" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <input type="number" required placeholder="Nominal" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-emerald-400 font-bold text-xl focus:ring-2 focus:ring-emerald-500" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          <select className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white appearance-none focus:ring-2 focus:ring-emerald-500" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <option value="Makan & Minum">🍔 Makan & Minum</option>
            <option value="Transportasi">🚗 Transportasi</option>
            <option value="Belanja">🛍️ Belanja</option>
            <option value="Hiburan">🎮 Hiburan</option>
            <option value="Lainnya">✨ Lainnya</option>
          </select>
          <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg mt-4 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </form>
      </div>
    </div>
  );
};