import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, X, Calendar, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Header } from '../components/dashboard/Header';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { TransactionList } from '../components/dashboard/TransactionList';
import { FixedExpenseWidget } from '../components/dashboard/FixedExpenseWidget';
import { FixedExpenseList } from '../components/dashboard/FixedExpenseList';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const navigate = useNavigate();

  // State untuk Fixed Expense
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [fixedData, setFixedData] = useState({ name: '', amount: '', dueDate: '1' });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Makan & Minum'
  });

  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions')
      ]);

      const serverLimit = Number(userRes.data.dailyLimit) || 0;
      setUserName(userRes.data.name);
      setDailyLimit(serverLimit);
      setNewLimit(serverLimit.toString());
      setTransactions(transRes.data);

      try {
        const fixedRes = await api.get('/fixed-expenses');
        setFixedExpenses(fixedRes.data);
      } catch (e) {
        console.warn("Endpoint fixed-expenses belum siap di backend.");
      }

    } catch (err) {
      console.error("Gagal fetch data utama:", err);
      toast.error("Gagal mengambil data terbaru.");
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

  // Poin 2: Fungsi Bayar Otomatis
  const handlePayFixedExpense = async (expense: any) => {
    setLoading(true);
    try {
      await api.post('/transactions', {
        description: `Bayar: ${expense.name}`,
        amount: Number(expense.amount),
        category: 'Lainnya'
      });
      toast.success(`${expense.name} berhasil dibayar! 💸`);
      await fetchData();
    } catch (err) {
      toast.error('Gagal memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/auth/limit', { dailyLimit: parseFloat(newLimit) });
      setDailyLimit(Number(res.data.dailyLimit));
      setIsLimitModalOpen(false);
      await fetchData();
      toast.success('Limit harian diperbarui! 🎯');
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
      await fetchData();
      toast.success('Catatan berhasil disimpan! 💸');
    } catch (err) {
      toast.error('Gagal menyimpan catatan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fixed-expenses', fixedData);
      setIsFixedModalOpen(false);
      setIsListModalOpen(true);
      setFixedData({ name: '', amount: '', dueDate: '1' });
      await fetchData();
      toast.success('Tagihan berhasil disimpan! 📌');
    } catch (err) {
      toast.error('Gagal menyimpan tagihan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFixed = async (id: string) => {
    if (!window.confirm('Hapus tagihan ini?')) return;
    try {
      await api.delete(`/fixed-expenses/${id}`);
      toast.success('Tagihan dihapus');
      await fetchData();
    } catch (err) {
      toast.error('Gagal menghapus tagihan');
    }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const remainingLimit = dailyLimit - totalSpent;

  // Poin 1: Kalkulasi Saldo Aman (Sisa - Tagihan Tetap)
  const safeBalance = remainingLimit - totalFixed;
  const usagePercentage = dailyLimit > 0 ? (totalSpent / dailyLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      <div className="p-6 pt-8">
        <Header userName={userName} onLogout={handleLogout} />

        <BalanceCard
          remainingLimit={remainingLimit}
          usagePercentage={usagePercentage}
          dailyLimit={dailyLimit}
        />

        {/* Notifikasi Saldo Aman (Poin 1) */}
        {totalFixed > 0 && (
          <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 border ${safeBalance < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
            <AlertCircle size={20} />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider opacity-60">Sisa Saldo Bebas</p>
              <p className="text-sm font-bold mt-0.5">Rp {safeBalance.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold mb-4 mt-8 px-1 text-white">Ringkasan Bulan Ini</h3>
        <SummaryGrid
          dailyLimit={dailyLimit}
          totalSpent={totalSpent}
          onEditLimit={() => setIsLimitModalOpen(true)}
        />

        <FixedExpenseWidget
          totalFixed={totalFixed}
          onOpen={() => setIsListModalOpen(true)}
        />

        <TransactionList transactions={transactions} />
      </div>

      {/* MODAL LIST TAGIHAN */}
      <FixedExpenseList
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        expenses={fixedExpenses}
        onDelete={handleDeleteFixed}
        onPay={handlePayFixedExpense} // Poin 2: Kirim fungsi bayar
        onAddClick={() => {
          setIsListModalOpen(false);
          setIsFixedModalOpen(true);
        }}
      />

      {/* MODAL INPUT TAGIHAN BARU */}
      {isFixedModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsFixedModalOpen(false)}></div>
          <div className="relative w-full max-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-white">Tagihan Baru 📌</h2>
            <form onSubmit={handleSubmitFixed} className="space-y-4 mt-4">
              <input
                type="text" required placeholder="Nama Tagihan"
                className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500"
                value={fixedData.name} onChange={(e) => setFixedData({ ...fixedData, name: e.target.value })}
              />
              <input
                type="number" required placeholder="Nominal"
                className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-amber-400 font-bold text-lg focus:ring-2 focus:ring-amber-500"
                value={fixedData.amount} onChange={(e) => setFixedData({ ...fixedData, amount: e.target.value })}
              />
              <div className="flex items-center bg-zinc-800 rounded-2xl p-4">
                <Calendar size={18} className="text-zinc-500 mr-3" />
                <input
                  type="number" min="1" max="31" required placeholder="Tgl (1-31)"
                  className="w-full bg-transparent text-white focus:outline-none font-medium"
                  value={fixedData.dueDate} onChange={(e) => setFixedData({ ...fixedData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setIsFixedModalOpen(false); setIsListModalOpen(true); }} className="flex-1 bg-zinc-800 font-bold py-4 rounded-2xl">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-amber-500 text-zinc-950 font-bold py-4 rounded-2xl disabled:opacity-50">
                  {loading ? '...' : 'SIMPAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UPDATE LIMIT */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLimitModalOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-white">Set Limit Harian 🎯</h2>
            <form onSubmit={handleUpdateLimit} className="space-y-6 mt-4">
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
                <button type="button" onClick={() => setIsLimitModalOpen(false)} className="flex-1 bg-zinc-800 text-white font-bold py-4 rounded-2xl">Batal</button>
                <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 text-zinc-950 font-bold py-4 rounded-2xl">
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
          <div className="relative w-full max-w-md bg-zinc-900 rounded-t-[2.5rem] p-8 border-t border-zinc-800 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Tambah Catatan 📝</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" required placeholder="Deskripsi" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <input type="number" required placeholder="Nominal" className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-emerald-400 font-bold text-xl focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
              <select className="w-full bg-zinc-800 border-none rounded-2xl p-4 text-white appearance-none focus:ring-2 focus:ring-emerald-500 transition-all" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
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
      )}

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center text-emerald-500"><Home size={24} strokeWidth={2.5} /><span className="text-[10px] font-bold mt-1 uppercase">Home</span></button>
        <div className="relative -mt-14"><button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-lg active:scale-95 transition-all"><Plus size={28} strokeWidth={3} /></button></div>
        <button className="flex flex-col items-center text-zinc-600 hover:text-zinc-300 transition-all"><PieChart size={24} /><span className="text-[10px] font-bold mt-1 uppercase">Laporan</span></button>
      </nav>
    </div>
  );
};

export default Dashboard;