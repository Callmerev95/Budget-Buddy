import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, PieChart as PieIcon, Home, Plus, PieChart, Calendar } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';
import { TransactionList } from '../components/dashboard/TransactionList';

const COLORS = ['#10b981', '#f43f5e', '#fbbf24', '#3b82f6', '#a855f7', '#ec4899'];

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  createdAt?: string;
  date?: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      toast.error("Gagal sinkronisasi laporan");
      console.error("Gagal ambil data laporan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  const handleDeleteTransaction = async (id: string) => {
    const originalTransactions = [...transactions];
    try {
      setTransactions(prev => prev.filter(t => t.id !== id));
      await api.delete(`/transactions/${id}`);
      toast.success('Transaksi dihapus');
      fetchReportData();
    } catch (err) {
      setTransactions(originalTransactions);
      toast.error('Gagal menghapus transaksi');
    }
  };

  const filteredTransactions = transactions.filter((t: any) => {
    const txDate = t.createdAt || t.date || "";
    return txDate.startsWith(selectedDate);
  });

  const categoryTotals = filteredTransactions.reduce((acc: Record<string, number>, curr: Transaction) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).map(cat => ({
    name: cat,
    value: categoryTotals[cat]
  }));

  const totalExpense = filteredTransactions.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 font-sans selection:bg-emerald-500/30">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/10 blur-[120px] pointer-events-none" />

      {/* Header Premium Polished [cite: 2026-02-03] */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-end justify-between mb-10 px-1"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent leading-none">
            Analytics
          </h1>
          <div className="flex items-center gap-2 bg-zinc-900/50 w-fit px-2 py-1 rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Insights</p>
          </div>
        </div>

        {/* Date Selector - Mobile Optimized [cite: 2026-02-03] */}
        <motion.div
          whileTap={{ scale: 0.95, backgroundColor: "rgba(39, 39, 42, 0.9)" }}
          className="relative flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-2xl pl-3 pr-2 py-2 transition-colors cursor-pointer shadow-sm"
        >
          <Calendar size={14} className="text-emerald-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-emerald-500 text-[10px] font-black focus:outline-none uppercase cursor-pointer tracking-tighter"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 mb-12 relative z-10">
        <motion.div
          key={`total-${selectedDate}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="group relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <TrendingDown size={20} className="text-rose-500" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Status Pemakaian</p>
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-[9px] font-black uppercase text-zinc-300">
                  {filteredTransactions.length} Transaksi
                </span>
              </div>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Total Outflow</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-500/40 tracking-tighter">Rp</span>
              <h2 className="text-5xl font-black tracking-tighter text-white">
                {totalExpense.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/5 blur-[80px] group-hover:bg-rose-500/10 transition-colors duration-700" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/30 border border-white/5 p-8 rounded-[3rem] relative backdrop-blur-xl shadow-2xl mb-12 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">Distribusi Dana</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Berdasarkan Kategori Terdaftar</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <PieIcon size={20} className="text-emerald-500" strokeWidth={2.5} />
          </div>
        </div>

        <div className="h-[350px] w-full relative">
          {!loading && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={chartData}
                  innerRadius={85}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1200}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="focus:outline-none hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(9, 9, 11, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(20px)',
                    padding: '15px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                  formatter={(value: any) => [`Rp ${value.toLocaleString('id-ID')}`, 'Value']}
                />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="p-6 bg-zinc-800/30 rounded-full border border-white/5">
                <PieIcon size={32} className="opacity-20 text-white" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">No Data Detected</p>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Active</p>
              <p className="text-2xl font-black text-white">{chartData.length}</p>
              <p className="text-[8px] font-bold text-emerald-500 uppercase">Sectors</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-zinc-400 uppercase truncate">{item.name}</p>
                <p className="text-[11px] font-bold text-white">Rp {item.value.toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <TransactionList transactions={filteredTransactions} onDelete={handleDeleteTransaction} />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-zinc-500 active:scale-90 transition-transform">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>
        <div className="relative -mt-20">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2.2rem] shadow-[0_20px_40px_rgba(16,185,129,0.3)] border-4 border-zinc-950 relative z-20"
          >
            <Plus size={32} strokeWidth={3.5} />
          </motion.button>
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 -z-10" />
        </div>
        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-emerald-500 active:scale-90 transition-transform">
          <PieChart size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Reports;