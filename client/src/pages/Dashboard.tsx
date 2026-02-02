import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, AlertCircle, Calendar, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { TransactionList } from '../components/dashboard/TransactionList';
import { FixedExpenseWidget } from '../components/dashboard/FixedExpenseWidget';
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
      setScrolled(window.scrollY > 15); // Sensitivitas scroll sedikit ditingkatkan [cite: 2026-01-14]
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
      console.error('Gagal setup notifikasi:', err);
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

  const handleDeleteTransaction = async (id: string) => {
    try {
      const updatedTransactions = transactions.filter(t => t.id !== id);
      setTransactions(updatedTransactions);
      await api.delete(`/transactions/${id}`);
      toast.success('Transaksi dihapus! 🔄');
      await fetchData();
    } catch (err) {
      toast.error('Gagal menghapus transaksi');
      fetchData();
    }
  };

  const handleSavePlan = async (data: any) => {
    setLoading(true);
    try {
      await api.patch('/auth/financial-plan', data);
      toast.success('Rencana keuangan diterapkan! 💰');
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
    .filter((t: any) => (t.createdAt || t.date || "").startsWith(todayStr))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredActivities = transactions.filter((t: any) =>
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

      {/* FLOATING HEADER: Increased transparency (60%) & higher backdrop-blur [cite: 2026-01-12, 2026-01-14] */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 pt-12 pb-6 ${scrolled
          ? 'bg-[#050505]/60 backdrop-blur-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
          : 'bg-transparent'
          }`}
      >
        <div className="max-max-w-md mx-auto flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                {new Date().getHours() < 12 ? '☀️ Selamat Pagi' : '🌙 Selamat Malam'}
              </p>
            </div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-zinc-600 bg-clip-text text-transparent leading-none">
              {userName}!
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(244, 63, 94, 0.1)' }} // Sedikit merah transparan saat hover
            whileTap={{ scale: 0.9 }} // Efek membal (Haptic feel) saat ditekan
            onClick={() => {
              toast.promise(new Promise((resolve) => setTimeout(resolve, 500)), {
                loading: 'Logging out...',
                success: () => {
                  localStorage.removeItem('token');
                  navigate('/login');
                  return 'Sampai jumpa lagi! 👋';
                },
              });
            }}
            className="w-12 h-12 bg-zinc-900/80 border border-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-colors shadow-lg shadow-black/40 group"
          >
            <LogOut
              size={20}
              strokeWidth={2.5}
              className="group-hover:-translate-x-0.5 transition-transform" // Animasi icon sedikit bergeser
            />
          </motion.button>
        </div>
      </header>

      {/* SPACER REVISED: Reduced from h-44 to h-36 for tighter gap [cite: 2026-01-12] */}
      <div className="h-36" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 max-w-md mx-auto relative z-10"
      >
        <BalanceCard remainingLimit={remainingLimit} usagePercentage={usagePercentage} dailyLimit={dailyLimit} />

        <div className="mt-10 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-xl font-black tracking-tight uppercase text-zinc-200">Ringkasan</h3>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 active:scale-95 transition-transform"
              >
                Atur Limit
              </button>
            </div>
            <SummaryGrid dailyLimit={dailyLimit} totalSpent={spentToday} onEditLimit={() => setIsPlanModalOpen(true)} />
          </section>

          <div className="space-y-5">
            <FixedExpenseWidget totalFixed={totalFixed} onOpen={() => setIsListModalOpen(true)} />
            <AnimatePresence>
              {totalFixed > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-[2.25rem] flex items-center gap-4 border backdrop-blur-xl transition-all ${monthlyBudgetFree < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                >
                  <div className={`p-3 rounded-2xl ${monthlyBudgetFree < 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                    <AlertCircle size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">Sisa Saldo Aman Bulanan</p>
                    <p className="text-xl font-black tracking-tight">Rp {monthlyBudgetFree.toLocaleString('id-ID')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <section>
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-xl font-black tracking-tight uppercase text-zinc-200">Aktivitas</h3>
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-xl px-3 py-1.5">
                <Calendar size={14} className="text-emerald-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-emerald-500 text-[10px] font-black focus:outline-none uppercase cursor-pointer"
                />
              </div>
            </div>
            {filteredActivities.length > 0 ? (
              <TransactionList
                transactions={filteredActivities}
                limit={10}
                onDelete={handleDeleteTransaction}
              />
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-zinc-900 rounded-[2.25rem]">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No logs for today ☕</p>
              </div>
            )}
          </section>
        </div>
      </motion.div>

      <FixedExpenseList
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        expenses={fixedExpenses}
        onDelete={async (id: string) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }}
        onPay={async (expense: any) => { await api.post('/transactions', { description: `Bayar: ${expense.name}`, amount: expense.amount, category: 'Tagihan' }); fetchData(); }}
        onAddClick={() => { setIsListModalOpen(false); setIsFixedModalOpen(true); }}
      />
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} loading={loading} />
      <AddFixedExpenseModal isOpen={isFixedModalOpen} onClose={() => setIsFixedModalOpen(false)} onSubmit={async (e: any) => { e.preventDefault(); await api.post('/fixed-expenses', fixedData); setIsFixedModalOpen(false); fetchData(); }} fixedData={fixedData} setFixedData={setFixedData} loading={loading} />
      <FinancialPlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} onSave={handleSavePlan} initialData={userData} totalFixed={totalFixed} />

      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-[0_25px_50px_rgba(0,0,0,0.8)]">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-emerald-500 group">
          <Home size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest text-emerald-500">Home</span>
        </button>
        <div className="relative -mt-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2.2rem] shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-4 border-zinc-950 relative z-20"
          >
            <Plus size={32} strokeWidth={3.5} />
          </motion.button>
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 -z-10" />
        </div>
        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 hover:text-emerald-500 transition-all active:scale-90 group">
          <PieChart size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest text-zinc-500 group-hover:text-emerald-500">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;