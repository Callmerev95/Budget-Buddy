import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, AlertCircle, Calendar, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { TransactionList } from '../components/dashboard/TransactionList';
import { FixedExpenseList } from '../components/dashboard/FixedExpenseList';
import { AddTransactionModal } from '../components/dashboard/AddTransactionModal';
import { AddFixedExpenseModal } from '../components/dashboard/AddFixedExpenseModal';
import { FinancialPlanModal } from '../components/dashboard/FinancialPlanModal';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  date?: string;
}

interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
}

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    monthlyIncome: 0,
    savingsTarget: 0,
    isPercentTarget: false
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const [fixedData, setFixedData] = useState({ name: '', amount: '', dueDate: '1' });
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Makan & Minum' });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setupNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      if (Notification.permission === 'default') await Notification.requestPermission();
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription && Notification.permission === 'granted') {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BCOnabemphnHRb2QkI-q6xeeehSk0F-mmharx8sLeAJ2LWEn-0HIR4nRlUilHY5rClK2TBoAhV0IfH-lKdqdhzA'
        });
      }
      if (subscription) await api.post('/auth/subscribe', subscription);
    } catch (err) {
      console.error('Push notification setup failed:', err);
    }
  };

  const fetchData = async () => {
    try {
      const [userRes, transRes, fixedRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions'),
        api.get('/fixed-expenses')
      ]);
      setUserName(userRes.data.name);
      setDailyLimit(Number(userRes.data.dailyLimit) || 0);
      setTransactions(transRes.data);
      setFixedExpenses(fixedRes.data);
      setUserData({
        monthlyIncome: userRes.data.monthlyIncome || 0,
        savingsTarget: userRes.data.savingsTarget || 0,
        isPercentTarget: userRes.data.isPercentTarget || false,
      });
    } catch (err) {
      toast.error("Gagal sinkronisasi data");
    }
  };

  useEffect(() => {
    fetchData();
    setupNotifications();
  }, []);

  // Perbaikan Fungsi Delete: Menggunakan Optimistic Update
  const handleDeleteTransaction = async (id: string) => {
    const originalTransactions = [...transactions];

    try {
      // Hapus langsung dari UI agar responsif
      setTransactions(prev => prev.filter(t => t.id !== id));

      // Kirim perintah hapus ke API
      await api.delete(`/transactions/${id}`);
      toast.success('Transaksi berhasil dihapus');

      // Refresh data background untuk memastikan konsistensi saldo
      fetchData();
    } catch (err) {
      // Kembalikan data jika API gagal
      setTransactions(originalTransactions);
      toast.error('Gagal menghapus transaksi dari server');
      console.error("Delete error:", err);
    }
  };

  const handleSavePlan = async (data: any) => {
    setLoading(true);
    try {
      await api.patch('/auth/financial-plan', data);
      toast.success('Rencana keuangan diterapkan!');
      setIsPlanModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan rencana');
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
      toast.success('Transaksi disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const spentToday = transactions
    .filter((t: Transaction) => (t.createdAt || t.date || "").startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredActivities = transactions.filter((t: Transaction) =>
    (t.createdAt || t.date || "").startsWith(selectedDate)
  );

  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSpentAllTime = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const savingsAmount = userData.isPercentTarget
    ? (userData.monthlyIncome * userData.savingsTarget) / 100
    : userData.savingsTarget;

  const remainingLimit = dailyLimit - spentToday;
  const monthlyBudgetFree = userData.monthlyIncome - savingsAmount - totalSpentAllTime - totalFixed;
  const usagePercentage = dailyLimit > 0 ? (spentToday / dailyLimit) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-40 font-sans selection:bg-emerald-500/30">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 pt-12 pb-6 ${scrolled ? 'bg-[#050505]/60 backdrop-blur-[32px] shadow-2xl' : 'bg-transparent'}`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
              {new Date().getHours() < 12 ? '☀️ Selamat Pagi' : '🌙 Selamat Malam'}
            </p>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent leading-none">
              {userName}!
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="w-12 h-12 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 active:bg-zinc-800 transition-all"
          >
            <LogOut size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </header>

      <div className="h-32" />

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 max-w-md mx-auto relative z-10">
        <BalanceCard remainingLimit={remainingLimit} usagePercentage={usagePercentage} dailyLimit={dailyLimit} />

        <div className="mt-10 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400">Ringkasan</h3>
              </div>
              <div className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent" />
            </div>
            <SummaryGrid dailyLimit={dailyLimit} totalSpent={spentToday} onEditLimit={() => setIsPlanModalOpen(true)} />
          </section>

          <section className="-mt-4">
            <AnimatePresence>
              {totalFixed > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/30 backdrop-blur-2xl border border-white/5 rounded-[2.25rem] p-4 flex items-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]">
                  <button onClick={() => setIsListModalOpen(true)} className="flex-1 flex items-center gap-3 px-2 relative active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                      <AlertCircle size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Tagihan Bulanan</p>
                      <p className="text-sm font-black text-amber-500/90 tracking-tight">Rp {totalFixed.toLocaleString('id-ID')}</p>
                    </div>
                    <ChevronRight size={12} className="absolute top-0 right-0 text-zinc-700" />
                  </button>
                  <div className="w-[1px] h-8 bg-gradient-to-b from-transparent via-zinc-800 to-transparent mx-2" />
                  <div className="flex-1 flex items-center gap-3 px-2">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${monthlyBudgetFree < 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <PieChart size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-0.5">Saldo Tersimpan</p>
                      <p className={`text-sm font-black tracking-tight ${monthlyBudgetFree < 0 ? 'text-rose-500/90' : 'text-emerald-500/90'}`}>Rp {monthlyBudgetFree.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section>
            <div className="flex flex-col gap-4 mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <h3 className="text-xs font-black tracking-[0.3em] uppercase text-zinc-400">Aktivitas</h3>
                </div>
                <div className="h-[1px] flex-grow bg-gradient-to-r from-zinc-800 to-transparent" />
              </div>
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-xl px-3 py-1.5 active:bg-zinc-800 transition-colors">
                  <Calendar size={12} className="text-emerald-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-emerald-500 text-[9px] font-black focus:outline-none uppercase cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Pastikan props onDelete dilempar ke sini */}
            <TransactionList
              transactions={filteredActivities}
              onDelete={handleDeleteTransaction}
            />
          </section>
        </div>
      </motion.div>

      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-emerald-500 active:scale-90 transition-transform">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>
        <div className="relative -mt-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2.2rem] shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-4 border-zinc-950 relative z-20"
          >
            <Plus size={32} strokeWidth={3.5} />
          </motion.button>
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 -z-10" />
        </div>
        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 active:scale-90 transition-transform">
          <PieChart size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>

      <FixedExpenseList
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        expenses={fixedExpenses}
        onDelete={async (id) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }}
        onPay={async (expense) => { await api.post('/transactions', { description: `Bayar: ${expense.name}`, amount: expense.amount, category: 'Tagihan' }); fetchData(); }}
        onAddClick={() => { setIsListModalOpen(false); setIsFixedModalOpen(true); }}
      />
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        loading={loading}
      />
      <AddFixedExpenseModal
        isOpen={isFixedModalOpen}
        onClose={() => setIsFixedModalOpen(false)}
        onSubmit={async (e) => { e.preventDefault(); await api.post('/fixed-expenses', fixedData); setIsFixedModalOpen(false); fetchData(); }}
        fixedData={fixedData}
        setFixedData={setFixedData}
        loading={loading}
      />
      <FinancialPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSave={handleSavePlan}
        initialData={userData}
        totalFixed={totalFixed}
      />
    </div>
  );
};

export default Dashboard;