import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Header } from '../components/dashboard/Header';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { SummaryGrid } from '../components/dashboard/SummaryGrid';
import { TransactionList } from '../components/dashboard/TransactionList';
import { FixedExpenseWidget } from '../components/dashboard/FixedExpenseWidget';
import { FixedExpenseList } from '../components/dashboard/FixedExpenseList';
import { AddTransactionModal } from '../components/dashboard/AddTransactionModal';
import { AddFixedExpenseModal } from '../components/dashboard/AddFixedExpenseModal';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [dailyLimit, setDailyLimit] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newLimit, setNewLimit] = useState('');
  const navigate = useNavigate();

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
      setNewLimit((userRes.data.dailyLimit || 0).toString());
      setTransactions(transRes.data);
      try {
        const fixedRes = await api.get('/fixed-expenses');
        setFixedExpenses(fixedRes.data);
      } catch (e) { console.warn("Fixed expenses error"); }
    } catch (err) { toast.error("Gagal fetch data"); }
  };

  useEffect(() => { fetchData(); }, []);

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
  const remainingLimit = dailyLimit - totalSpent;
  const safeBalance = remainingLimit - totalFixed;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      <div className="p-6 pt-8">
        <Header userName={userName} onLogout={() => { localStorage.removeItem('token'); navigate('/login'); }} />
        <BalanceCard remainingLimit={remainingLimit} usagePercentage={dailyLimit > 0 ? (totalSpent / dailyLimit) * 100 : 0} dailyLimit={dailyLimit} />

        {totalFixed > 0 && (
          <div className={`mt-4 p-4 rounded-2xl flex items-center gap-3 border ${safeBalance < 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
            <AlertCircle size={20} />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider opacity-60">Sisa Saldo Bebas</p>
              <p className="text-sm font-bold mt-0.5">Rp {safeBalance.toLocaleString('id-ID')}</p>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold mb-4 mt-8 px-1">Ringkasan Bulan Ini</h3>
        <SummaryGrid dailyLimit={dailyLimit} totalSpent={totalSpent} onEditLimit={() => setIsLimitModalOpen(true)} />
        <FixedExpenseWidget totalFixed={totalFixed} onOpen={() => setIsListModalOpen(true)} />
        <TransactionList transactions={transactions} />
      </div>

      <FixedExpenseList isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} expenses={fixedExpenses} onDelete={async (id) => { await api.delete(`/fixed-expenses/${id}`); fetchData(); }} onPay={handlePayFixedExpense} onAddClick={() => { setIsListModalOpen(false); setIsFixedModalOpen(true); }} />
      <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} loading={loading} />
      <AddFixedExpenseModal isOpen={isFixedModalOpen} onClose={() => setIsFixedModalOpen(false)} onSubmit={handleSubmitFixed} fixedData={fixedData} setFixedData={setFixedData} loading={loading} />

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center text-emerald-500"><Home size={24} /><span className="text-[10px] font-bold mt-1 uppercase">Home</span></button>
        <div className="relative -mt-14"><button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-lg"><Plus size={28} /></button></div>
        <button className="flex flex-col items-center text-zinc-600"><PieChart size={24} /><span className="text-[10px] font-bold mt-1 uppercase">Laporan</span></button>
      </nav>
    </div>
  );
};

export default Dashboard;