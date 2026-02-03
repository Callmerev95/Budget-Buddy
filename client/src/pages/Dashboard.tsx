import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';

// Static Components (Keep these static for instant FCP)
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { SummarySection } from '../components/dashboard/SummarySection';
import { ActivitySection } from '../components/dashboard/ActivitySection';

// 1. Lazy Loading Modals (Code Splitting) [cite: 2026-02-03]
const AddTransactionModal = lazy(() => import('../components/dashboard/AddTransactionModal').then(m => ({ default: m.AddTransactionModal })));
const AddFixedExpenseModal = lazy(() => import('../components/dashboard/AddFixedExpenseModal').then(m => ({ default: m.AddFixedExpenseModal })));
const FinancialPlanModal = lazy(() => import('../components/dashboard/FinancialPlanModal').then(m => ({ default: m.FinancialPlanModal })));
const FixedExpenseList = lazy(() => import('../components/dashboard/FixedExpenseList').then(m => ({ default: m.FixedExpenseList })));
const AboutModal = lazy(() => import('../components/modals/AboutModal'));

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data States
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [userData, setUserData] = useState({ monthlyIncome: 0, savingsTarget: 0, isPercentTarget: false });
  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Makan & Minum' });
  const [fixedData, setFixedData] = useState({ name: '', amount: '', dueDate: '1' });

  // 2. Stable Fetch Data [cite: 2026-01-10]
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
      setFixedExpenses(f.data);
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
    (async () => {
      if (!('serviceWorker' in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        let sub = await reg.pushManager.getSubscription();
        if (sub) await api.post('/auth/subscribe', sub);
      } catch (e) { /* ignore silent */ }
    })();
  }, [fetchData]);

  // 3. Optimized Stats Calculation
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const spentToday = transactions
      .filter((t: any) => (t.createdAt || t.date || "").startsWith(today))
      .reduce((a, c: any) => a + c.amount, 0);

    const totalFixed = fixedExpenses.reduce((a, c: any) => a + Number(c.amount), 0);
    const savings = userData.isPercentTarget
      ? (userData.monthlyIncome * userData.savingsTarget) / 100
      : userData.savingsTarget;

    const totalSpentAll = transactions.reduce((a, c: any) => a + c.amount, 0);

    return {
      spentToday,
      totalFixed,
      remainingLimit: dailyLimit - spentToday,
      monthlyBudgetFree: userData.monthlyIncome - savings - totalSpentAll - totalFixed,
      usagePercentage: dailyLimit > 0 ? (spentToday / dailyLimit) * 100 : 0
    };
  }, [transactions, fixedExpenses, dailyLimit, userData]);

  const filteredActivity = useMemo(() =>
    transactions.filter((t: any) => (t.createdAt || t.date || "").startsWith(selectedDate)),
    [transactions, selectedDate]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-44 font-sans overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/5 blur-[80px] pointer-events-none z-0 transform-gpu" />

      <DashboardHeader
        userName={userName}
        scrolled={scrolled}
        onAboutOpen={() => setActiveModal('about')}
        onLogout={() => { localStorage.removeItem('token'); navigate('/login'); }}
      />

      <div className="h-32" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-md mx-auto relative z-10 transform-gpu">
        <BalanceCard remainingLimit={stats.remainingLimit} usagePercentage={stats.usagePercentage} dailyLimit={dailyLimit} />

        <div className="mt-10 space-y-10">
          <SummarySection dailyLimit={dailyLimit} spentToday={stats.spentToday} onEdit={() => setActiveModal('plan')} />
          <QuickActions totalFixed={stats.totalFixed} monthlyBudgetFree={stats.monthlyBudgetFree} onListOpen={() => setActiveModal('fixedList')} />
          <ActivitySection
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            transactions={filteredActivity}
            onDelete={handleDelete}
          />
        </div>
      </motion.div>

      {/* Floating Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-900/80 backdrop-blur-3xl border-t border-white/5 rounded-t-[2.5rem] flex justify-between items-center px-12 z-50 pb-6 transform-gpu shadow-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-emerald-500 active:scale-90 transition-transform">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>
        <div className="relative -mt-16">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveModal('addTrans')} className="bg-emerald-500 text-zinc-950 p-5 rounded-[2.2rem] border-4 border-[#050505] shadow-lg">
            <Plus size={32} strokeWidth={3.5} />
          </motion.button>
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 -z-10" />
        </div>
        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-zinc-500 active:scale-90 transition-transform">
          <PieChart size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>

      {/* 4. Suspense for Lazy Components */}
      <Suspense fallback={null}>
        <AnimatePresence>
          {activeModal === 'about' && <AboutModal isOpen onClose={() => setActiveModal(null)} userEmail={userEmail} />}

          {activeModal === 'fixedList' && (
            <FixedExpenseList
              isOpen expenses={fixedExpenses} onClose={() => setActiveModal(null)}
              onDelete={async (id) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }}
              onPay={async (ex) => { await api.post('/transactions', { description: `Bayar: ${ex.name}`, amount: ex.amount, category: 'Tagihan' }); fetchData(); }}
              onAddClick={() => setActiveModal('addFixed')}
            />
          )}

          {activeModal === 'addTrans' && (
            <AddTransactionModal
              isOpen onClose={() => setActiveModal(null)}
              formData={formData} setFormData={setFormData}
              loading={loading}
              onSubmit={async (e) => { e.preventDefault(); await api.post('/transactions', formData); setActiveModal(null); fetchData(); }}
            />
          )}

          {activeModal === 'addFixed' && (
            <AddFixedExpenseModal
              isOpen onClose={() => setActiveModal(null)}
              fixedData={fixedData} setFixedData={setFixedData}
              loading={loading}
              onSubmit={async (e) => { e.preventDefault(); await api.post('/fixed-expenses', fixedData); setActiveModal(null); fetchData(); }}
            />
          )}

          {activeModal === 'plan' && (
            <FinancialPlanModal
              isOpen onClose={() => setActiveModal(null)}
              initialData={userData} totalFixed={stats.totalFixed}
              onSave={async (d) => { await api.patch('/auth/financial-plan', d); setActiveModal(null); fetchData(); }}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default Dashboard;