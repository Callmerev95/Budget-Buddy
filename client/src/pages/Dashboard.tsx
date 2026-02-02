import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';
import { Header } from '../components/dashboard/Header';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { TransactionList } from '../components/dashboard/TransactionList';
import { FixedExpenseWidget } from '../components/dashboard/FixedExpenseWidget';
import { FixedExpenseList } from '../components/dashboard/FixedExpenseList';
import { AddTransactionModal } from '../components/dashboard/AddTransactionModal';
import { AddFixedExpenseModal } from '../components/dashboard/AddFixedExpenseModal';
import { FinancialPlanModal } from '../components/dashboard/FinancialPlanModal';

// --- Interfaces [cite: 2026-01-10] ---
interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
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

  useEffect(() => { fetchData(); }, []);

  const handleSavePlan = async (data: { monthlyIncome: number; savingsTarget: number; isPercentTarget: boolean }) => {
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

  const handlePayFixedExpense = (expense: FixedExpense) => {
    const processPayment = async () => {
      setLoading(true);
      try {
        await api.post('/transactions', {
          description: `Bayar: ${expense.name}`,
          amount: Number(expense.amount),
          category: 'Lainnya'
        });
        toast.success(`${expense.name} berhasil dibayar!`);
        await fetchData();
      } catch (err) {
        toast.error('Gagal memproses pembayaran');
      } finally {
        setLoading(false);
      }
    };
    processPayment();
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

  const handleSubmitFixed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/fixed-expenses', fixedData);
      setIsFixedModalOpen(false);
      setIsListModalOpen(true);
      setFixedData({ name: '', amount: '', dueDate: '1' });
      await fetchData();
      toast.success('Tagihan rutin disimpan!');
    } catch (err) {
      toast.error('Gagal menyimpan tagihan');
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const savingsAmount = userData.isPercentTarget
    ? (userData.monthlyIncome * userData.savingsTarget) / 100
    : userData.savingsTarget;
  const monthlyBudgetFree = userData.monthlyIncome - savingsAmount - totalSpent - totalFixed;
  const remainingLimit = dailyLimit - totalSpent;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-40">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 pt-8 max-w-md mx-auto"
      >
        <Header userName={userName} onLogout={() => { localStorage.removeItem('token'); navigate('/login'); }} />

        <div className="mt-6">
          <BalanceCard
            remainingLimit={remainingLimit}
            usagePercentage={dailyLimit > 0 ? (totalSpent / dailyLimit) * 100 : 0}
            dailyLimit={dailyLimit}
          />
        </div>

        <div className="mt-10 space-y-10">
          {/* Ringkasan Section */}
          <section>
            <div className="flex justify-between items-center mb-5 px-1">
              <h3 className="text-xl font-black tracking-tight uppercase text-zinc-200">Ringkasan</h3>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/10 active:scale-95 transition-all"
              >
                Atur Limit
              </button>
            </div>
            <SummaryGrid dailyLimit={dailyLimit} totalSpent={totalSpent} onEditLimit={() => setIsPlanModalOpen(true)} />
          </section>

          {/* Kesehatan Finansial Section (Hierarchy Baru) [cite: 2026-01-14] */}
          <div className="space-y-5">
            <FixedExpenseWidget totalFixed={totalFixed} onOpen={() => setIsListModalOpen(true)} />

            <AnimatePresence>
              {totalFixed > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-5 rounded-[2.25rem] flex items-center gap-4 border backdrop-blur-xl transition-all duration-500 ${monthlyBudgetFree < 0
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                >
                  <div className={`p-3 rounded-2xl ${monthlyBudgetFree < 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                    <AlertCircle size={22} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-0.5">Sisa Saldo Aman Bulanan</p>
                    <p className="text-xl font-black tracking-tight">
                      Rp {monthlyBudgetFree.toLocaleString('id-ID')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Aktivitas Section [cite: 2026-01-14] */}
          <section>
            <h3 className="text-xl font-black tracking-tight mb-5 px-1 uppercase text-zinc-200">Aktivitas</h3>
            <TransactionList transactions={transactions} limit={4} />
          </section>
        </div>
      </motion.div>

      {/* Overlays */}
      <FixedExpenseList
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        expenses={fixedExpenses}
        onDelete={async (id: string) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }}
        onPay={handlePayFixedExpense}
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
        onSubmit={handleSubmitFixed}
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

      {/* Floating Navigation */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-emerald-500 group">
          <Home size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>

        <div className="relative -mt-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2rem] shadow-[0_15px_30px_rgba(16,185,129,0.4)] border-4 border-zinc-950"
          >
            <Plus size={32} strokeWidth={3} />
          </motion.button>
        </div>

        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 hover:text-emerald-500 transition-colors group">
          <PieChart size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;