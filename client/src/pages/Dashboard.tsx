import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, LogOut, TrendingDown, X, Utensils, Car, ShoppingBag, Gamepad2, Layers, Edit2 } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Makan & Minum'
  });

  // Fungsi Fetching sinkron menggunakan Promise.all [cite: 2026-01-14]
  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions')
      ]);

      // Pastikan dailyLimit dikonversi ke Number agar kalkulasi matematika benar
      const serverLimit = Number(userRes.data.dailyLimit) || 0;

      setUserName(userRes.data.name);
      setDailyLimit(serverLimit);
      setNewLimit(serverLimit.toString());
      setTransactions(transRes.data);
    } catch (err) {
      console.error("Gagal sinkronisasi data");
      toast.error("Gagal mengambil data terbaru");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    toast.success('Sampai jumpa lagi! 👋');
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update ke backend
      const res = await api.patch('/auth/limit', { dailyLimit: parseFloat(newLimit) });

      // Update state lokal seketika
      setDailyLimit(Number(res.data.dailyLimit));
      setIsLimitModalOpen(false);

      // Tarik data ulang untuk memastikan sinkronisasi database total
      await fetchData();

      toast.success('Limit harian diperbarui! 🎯', {
        style: { borderRadius: '16px', background: '#18181b', color: '#fff', border: '1px solid #27272a' },
      });
    } catch (err) {
      toast.error('Gagal update limit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions', formData);
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: 'Makan & Minum' });

      // Tunggu fetchData selesai agar kalkulasi limit sisa tidak minus salah [cite: 2026-01-14]
      await fetchData();
      toast.success('Catatan berhasil disimpan! 💸');
    } catch (err) {
      toast.error('Gagal menyimpan catatan');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Makan & Minum': return <Utensils size={18} />;
      case 'Transportasi': return <Car size={18} />;
      case 'Belanja': return <ShoppingBag size={18} />;
      case 'Hiburan': return <Gamepad2 size={18} />;
      default: return <Layers size={18} />;
    }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingLimit = dailyLimit - totalSpent;
  const usagePercentage = dailyLimit > 0 ? (totalSpent / dailyLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      <div className="p-6 pt-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest text-zinc-500">Selamat datang</p>
            <h1 className="text-2xl font-bold text-white mt-1">
              {userName || 'Buddy'} <span className="text-emerald-500">👋</span>
            </h1>
          </div>
          <button onClick={handleLogout} className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </header>

        {/* Card Sisa Limit */}
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

        {/* Ringkasan Grid */}
        <h3 className="text-lg font-bold mb-4 px-1 text-white">Ringkasan Bulan Ini</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setIsLimitModalOpen(true)}
            className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm text-left active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <Edit2 size={18} />
            </div>
            <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tighter">Set Limit Harian</p>
            <p className="text-lg font-bold text-emerald-400 leading-none">Rp {dailyLimit.toLocaleString('id-ID')}</p>
          </button>

          <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-3">
              <TrendingDown size={20} />
            </div>
            <p className="text-zinc-500 text-xs mb-1 uppercase font-bold tracking-tighter">Pengeluaran</p>
            <p className="text-lg font-bold text-rose-400 leading-none">Rp {totalSpent.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Recent Transactions */}
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

      {/* MODAL UPDATE LIMIT */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLimitModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-white">Set Limit Harian 🎯</h2>
            <p className="text-zinc-500 text-sm mb-6 font-medium">Berapa target maksimal jajan kamu sehari?</p>
            <form onSubmit={handleUpdateLimit} className="space-y-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">Rp</span>
                <input
                  type="number" required autoFocus
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 pl-12 text-white font-bold text-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsLimitModalOpen(false)} className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl active:scale-95 transition-all disabled:opacity-50">
                  {loading ? '...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Tambah Catatan 📝</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Deskripsi</label>
                <input type="text" required placeholder="Makan siang, bensin, dll" className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-500 transition-all text-white" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Nominal (Rp)</label>
                <input type="number" required placeholder="0" className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 text-emerald-400 text-xl font-bold focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Kategori</label>
                <select className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none text-white" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="Makan & Minum">🍔 Makan & Minum</option>
                  <option value="Transportasi">🚗 Transportasi</option>
                  <option value="Belanja">🛍️ Belanja</option>
                  <option value="Hiburan">🎮 Hiburan</option>
                  <option value="Lainnya">✨ Lainnya</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all mt-4 disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center text-emerald-500 transition-transform active:scale-90"><Home size={24} strokeWidth={2.5} /><span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Home</span></button>
        <div className="relative -mt-14"><button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"><Plus size={28} strokeWidth={3} /></button></div>
        <button className="flex flex-col items-center text-zinc-600 hover:text-zinc-300 transition-all"><PieChart size={24} /><span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Laporan</span></button>
      </nav>
    </div>
  );
};

export default Dashboard;