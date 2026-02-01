import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, LogOut, TrendingUp, TrendingDown, X, Utensils, Car, ShoppingBag, Gamepad2, Layers } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]); // State data transaksi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Makan & Minum'
  });

  // Fungsi ambil data transaksi dari backend
  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Gagal ambil transaksi");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUserName(userRes.data.name);
        await fetchTransactions();
      } catch (err) {
        console.error("Gagal ambil data user");
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions', formData);
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: 'Makan & Minum' });
      await fetchTransactions(); // Refresh data setelah input
    } catch (err) {
      alert("Gagal menyimpan catatan");
    } finally {
      setLoading(false);
    }
  };

  // Helper Icon Kategori
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Makan & Minum': return <Utensils size={18} />;
      case 'Transportasi': return <Car size={18} />;
      case 'Belanja': return <ShoppingBag size={18} />;
      case 'Hiburan': return <Gamepad2 size={18} />;
      default: return <Layers size={18} />;
    }
  };

  // Kalkulasi Total (Berdasarkan DailyLog)
  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      {/* Header Section */}
      <div className="p-6 pt-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Selamat datang</p>
            <h1 className="text-2xl font-bold text-white mt-1">
              {userName || 'Buddy'} <span className="text-emerald-500">👋</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Main Balance Card - Glassmorphism style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-7 rounded-[2rem] shadow-2xl shadow-emerald-900/20 mb-8">
          <div className="relative z-10">
            <p className="text-emerald-100/80 text-sm font-medium mb-1">Total Pengeluaran</p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              Rp {totalSpent.toLocaleString('id-ID')}
            </h2>
            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="bg-emerald-400 p-1 rounded-full text-zinc-900">
                  <TrendingUp size={12} />
                </div>
                <span className="text-xs font-bold text-emerald-50">Rp 0</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="bg-rose-400 p-1 rounded-full text-zinc-900">
                  <TrendingDown size={12} />
                </div>
                <span className="text-xs font-bold text-rose-50">
                  Rp {totalSpent.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Quick Stats Grid */}
        <h3 className="text-lg font-bold mb-4 px-1">Ringkasan Bulan Ini</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-zinc-500 text-xs mb-1">Pemasukan</p>
            <p className="text-lg font-bold text-emerald-400 leading-none">Rp 0</p>
          </div>
          <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-3">
              <TrendingDown size={20} />
            </div>
            <p className="text-zinc-500 text-xs mb-1">Pengeluaran</p>
            <p className="text-lg font-bold text-rose-400 leading-none">
              Rp {totalSpent.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold">Transaksi Terakhir</h3>
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
                <p className="text-sm font-bold text-rose-400">
                  - Rp {item.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))
          ) : (
            <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-600 text-sm">Belum ada catatan hari ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL INPUT (BOTTOM SHEET) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl border-t border-zinc-800">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Tambah Catatan 📝</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Deskripsi</label>
                <input
                  type="text" required placeholder="Makan siang, bensin, dll"
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Nominal (Rp)</label>
                <input
                  type="number" required placeholder="0"
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 text-emerald-400 text-xl font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Kategori</label>
                <select
                  className="w-full bg-zinc-800 border-none rounded-2xl p-4 mt-1 focus:ring-2 focus:ring-emerald-500 transition-all appearance-none text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Makan & Minum">🍔 Makan & Minum</option>
                  <option value="Transportasi">🚗 Transportasi</option>
                  <option value="Belanja">🛍️ Belanja</option>
                  <option value="Hiburan">🎮 Hiburan</option>
                  <option value="Lainnya">✨ Lainnya</option>
                </select>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all mt-4 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Catatan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center text-emerald-500 transition-transform active:scale-90">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Home</span>
        </button>

        <div className="relative -mt-14">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        <button className="flex flex-col items-center text-zinc-600 hover:text-zinc-300 transition-all">
          <PieChart size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;