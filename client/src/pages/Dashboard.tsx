import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Tambahkan ini
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

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    monthlyIncome: 0,
    savingsTarget: 0,
    isPercentTarget: false
  });

  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [fixedData, setFixedData] = useState({ name: '', amount: '', dueDate: '1' });
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Makan & Minum' });

  const fetchData = async () => {
    try {
      const [userRes, transRes] = await Promise.all([api.get('/auth/me'), api.get('/transactions')]);
      setUserName(userRes.data.name);
      setDailyLimit(Number(userRes.data.dailyLimit) || 0);
      setTransactions(transRes.data);
      setUserData({
        monthlyIncome: userRes.data.monthlyIncome || 0,
        savingsTarget: userRes.data.savingsTarget || 0,
        isPercentTarget: userRes.data.isPercentTarget || false,
      });
      const fixedRes = await api.get('/fixed-expenses');
      setFixedExpenses(fixedRes.data);
    } catch (err) { toast.error("Gagal fetch data"); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSavePlan = async (data: any) => {
    setLoading(true);
    try {
      await api.patch('/auth/financial-plan', data);
      toast.success('Rencana keuangan diterapkan! 💰');
      setIsPlanModalOpen(false);
      await fetchData();
    } catch (err) { toast.error('Gagal menyimpan rencana'); } finally { setLoading(false); }
  };

  const handlePayFixedExpense = async (expense: any) => {
    setLoading(true);
    try {
      await api.post('/transactions', { description: `Bayar: ${expense.name}`, amount: Number(expense.amount), category: 'Lainnya' });
      toast.success(`${expense.name} dibayar!`);
      await fetchData();
    } catch (err) { toast.error('Gagal bayar'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transactions', formData);
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: 'Makan & Minum' });
      await fetchData();
      toast.success('Disimpan!');
    } catch (err) { toast.error('Gagal'); } finally { setLoading(false); }
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
      toast.success('Tagihan disimpan!');
    } catch (err) { toast.error('Gagal'); } finally { setLoading(false); }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const savingsAmount = userData.isPercentTarget ? (userData.monthlyIncome * userData.savingsTarget) / 100 : userData.savingsTarget;
  const monthlyBudgetFree = userData.monthlyIncome - savingsAmount - totalSpent - totalFixed;
  const remainingLimit = dailyLimit - totalSpent;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32">
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

        <AnimatePresence>
          {totalFixed > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-[2rem] flex items-center gap-4 border backdrop-blur-md transition-all duration-500 ${monthlyBudgetFree < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
            >
              <div className={`p-2 rounded-xl ${monthlyBudgetFree < 0 ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                <AlertCircle size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">Estimasi Sisa Saldo</p>
                <p className="text-base font-bold">Rp {monthlyBudgetFree.toLocaleString('id-ID')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 space-y-8">
          <section>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-xl font-black tracking-tight">Ringkasan</h3>
              <button onClick={() => setIsPlanModalOpen(true)} className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                Edit Limit
              </button>
            </div>
            <SummaryGrid dailyLimit={dailyLimit} totalSpent={totalSpent} onEditLimit={() => setIsPlanModalOpen(true)} />
          </section>

          <FixedExpenseWidget totalFixed={totalFixed} onOpen={() => setIsListModalOpen(true)} />

          <section>
            <h3 className="text-xl font-black tracking-tight mb-4 px-1">Aktivitas</h3>
            <TransactionList transactions={transactions} />
          </section>
        </div>
      </motion.div>

      {/* Modals & Lists - No changes needed in logic */}
      <FixedExpenseList isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} expenses={fixedExpenses} onDelete={async (id) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }} onPay={handlePayFixedExpense} onAddClick={() => { setIsListModalOpen(false); setIsFixedModalOpen(true); }} />
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} loading={loading} />
      <AddFixedExpenseModal isOpen={isFixedModalOpen} onClose={() => setIsFixedModalOpen(false)} onSubmit={handleSubmitFixed} fixedData={fixedData} setFixedData={setFixedData} loading={loading} />
      <FinancialPlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} onSave={handleSavePlan} initialData={userData} totalFixed={totalFixed} />

      {/* Modern Floating Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-emerald-500">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Home</span>
        </button>

        <div className="relative -mt-20">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2rem] shadow-[0_15px_30px_rgba(16,185,129,0.4)] active:scale-90 transition-all border-4 border-zinc-950"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 hover:text-emerald-500 transition-colors">
          <PieChart size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;