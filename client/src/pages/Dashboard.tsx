import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';

// 1. Import Tipe Data Langsung
import type { FixedExpense } from '../components/dashboard/FixedExpenseList';

import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { SummarySection } from '../components/dashboard/SummarySection';
import { ActivitySection } from '../components/dashboard/ActivitySection';

const AddTransactionModal = lazy(() => import('../components/dashboard/AddTransactionModal').then(m => ({ default: m.AddTransactionModal })));
const AddFixedExpenseModal = lazy(() => import('../components/dashboard/AddFixedExpenseModal').then(m => ({ default: m.AddFixedExpenseModal })));
const FinancialPlanModal = lazy(() => import('../components/dashboard/FinancialPlanModal').then(m => ({ default: m.FinancialPlanModal })));
const FixedExpenseList = lazy(() => import('../components/dashboard/FixedExpenseList').then(m => ({ default: m.FixedExpenseList })));
const AboutModal = lazy(() => import('../components/modals/AboutModal'));

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date?: string;
  createdAt?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 2. State Tema (Light/Dark Mode)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Data States
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [userData, setUserData] = useState({ monthlyIncome: 0, savingsTarget: 0, isPercentTarget: false });
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Makan & Minum' });
  const [fixedData, setFixedData] = useState({ name: '', amount: '', dueDate: '1' });

  const fetchData = useCallback(async () => {
    try {
      const [u, t, f] = await Promise.all([
        api.get('/auth/me'),
        api.get('/transactions'),
        api.get('/fixed-expenses')
      ]);
      setUserName(u.data.name);
      setUserEmail(u.data.email);
      setDailyLimit(Number(u.data.dailyLimit) || 0);
      setTransactions(t.data);

      const syncFixed = f.data.map((item: any) => ({
        ...item,
        dueDate: Number(item.dueDate) || 1
      }));
      setFixedExpenses(syncFixed);

      setUserData({
        monthlyIncome: u.data.monthlyIncome || 0,
        savingsTarget: u.data.savingsTarget || 0,
        isPercentTarget: u.data.isPercentTarget || false
      });
    } catch (err) {
      toast.error("Gagal sinkronisasi data");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      toast.error("Gagal menghapus transaksi");
    }
  }, [fetchData]);

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame(() => setScrolled(window.scrollY > 15));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let spentToday = 0;
    let totalSpentAll = 0;

    transactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      totalSpentAll += amt;
      if ((t.createdAt || t.date || "").startsWith(today)) {
        spentToday += amt;
      }
    });

    const totalFixed = fixedExpenses.reduce((a, c) => a + Number(c.amount || 0), 0);
    const savings = userData.isPercentTarget
      ? (userData.monthlyIncome * userData.savingsTarget) / 100
      : userData.savingsTarget;

    return {
      spentToday,
      totalFixed,
      remainingLimit: dailyLimit - spentToday,
      monthlyBudgetFree: userData.monthlyIncome - savings - totalSpentAll - totalFixed,
      usagePercentage: dailyLimit > 0 ? (spentToday / dailyLimit) * 100 : 0
    };
  }, [transactions, fixedExpenses, dailyLimit, userData]);

  const filteredActivity = useMemo(() =>
    transactions.filter((t) => (t.createdAt || t.date || "").startsWith(selectedDate)),
    [transactions, selectedDate]
  );

  return (
    <div className={`min-h-screen pb-44 font-sans overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-white text-zinc-900'
      }`}>
      {/* Dynamic Glow Effect - Dibuat sangat halus di light mode agar tidak membuat card abu-abu */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 blur-[120px] pointer-events-none z-0 transform-gpu transition-all duration-700 ${isDarkMode ? 'bg-emerald-500/5 opacity-100' : 'bg-emerald-500/5 opacity-20'
        }`} />

      <DashboardHeader
        userName={userName}
        scrolled={scrolled}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onAboutOpen={() => setActiveModal('about')}
        onLogout={() => { localStorage.removeItem('token'); navigate('/login'); }}
      />

      <div className="h-32" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-md mx-auto relative z-10 transform-gpu">
        <BalanceCard
          remainingLimit={stats.remainingLimit}
          usagePercentage={stats.usagePercentage}
          dailyLimit={dailyLimit}
          isDarkMode={isDarkMode}
        />

        <div className="mt-10 space-y-10">
          <SummarySection
            dailyLimit={dailyLimit}
            spentToday={stats.spentToday}
            onEdit={() => setActiveModal('plan')}
            isDarkMode={isDarkMode}
          />
          <QuickActions
            totalFixed={stats.totalFixed}
            monthlyBudgetFree={stats.monthlyBudgetFree}
            onListOpen={() => setActiveModal('fixedList')}
            isDarkMode={isDarkMode}
          />
          <ActivitySection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            transactions={filteredActivity}
            onDelete={handleDelete}
            isDarkMode={isDarkMode}
          />
        </div>
      </motion.div>

      {/* Floating Navigation - Shadow ditingkatkan untuk mode terang agar "pop" */}
      <nav className={`fixed bottom-0 left-0 right-0 h-24 backdrop-blur-3xl border-t rounded-t-[2.5rem] flex justify-between items-center px-12 z-50 pb-6 transform-gpu transition-all duration-500 ${isDarkMode
          ? 'bg-zinc-900/80 border-white/5 shadow-2xl'
          : 'bg-white/95 border-zinc-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]'
        }`}>
        <button onClick={() => navigate('/dashboard')} className={`flex flex-col items-center active:scale-90 transition-transform ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`}>
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>

        <div className="relative -mt-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('addTrans')}
            className={`p-5 rounded-[2.2rem] border-4 shadow-lg transition-colors ${isDarkMode ? 'bg-emerald-500 text-zinc-950 border-[#050505]' : 'bg-emerald-600 text-white border-white'
              }`}
          >
            <Plus size={32} strokeWidth={3.5} />
          </motion.button>
          <div className={`absolute inset-0 bg-emerald-500 blur-2xl -z-10 transition-opacity ${isDarkMode ? 'opacity-20' : 'opacity-10'}`} />
        </div>

        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 active:scale-90 transition-transform">
          <PieChart size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>

      <Suspense fallback={null}>
        <AnimatePresence>
          {activeModal === 'about' && (
            <AboutModal isOpen onClose={() => setActiveModal(null)} userEmail={userEmail} isDarkMode={isDarkMode} />
          )}

          {activeModal === 'fixedList' && (
            <FixedExpenseList
              isOpen expenses={fixedExpenses} onClose={() => setActiveModal(null)}
              onDelete={async (id) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }}
              onPay={async (ex) => { await api.post('/transactions', { description: `Bayar: ${ex.name}`, amount: ex.amount, category: 'Tagihan' }); fetchData(); }}
              onAddClick={() => setActiveModal('addFixed')}
              isDarkMode={isDarkMode}
            />
          )}

          {activeModal === 'addTrans' && (
            <AddTransactionModal
              isOpen onClose={() => setActiveModal(null)}
              formData={formData} setFormData={setFormData}
              loading={loading}
              isDarkMode={isDarkMode}
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await api.post('/transactions', formData);
                  setActiveModal(null);
                  fetchData();
                } finally { setLoading(false); }
              }}
            />
          )}

          {activeModal === 'addFixed' && (
            <AddFixedExpenseModal
              isOpen onClose={() => setActiveModal(null)}
              fixedData={fixedData} setFixedData={setFixedData}
              loading={loading}
              isDarkMode={isDarkMode}
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                try {
                  await api.post('/fixed-expenses', fixedData);
                  setActiveModal(null);
                  fetchData();
                } finally { setLoading(false); }
              }}
            />
          )}

          {activeModal === 'plan' && (
            <FinancialPlanModal
              isOpen onClose={() => setActiveModal(null)}
              initialData={userData} totalFixed={stats.totalFixed}
              isDarkMode={isDarkMode}
              onSave={async (d) => { await api.patch('/auth/financial-plan', d); setActiveModal(null); fetchData(); }}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default Dashboard;