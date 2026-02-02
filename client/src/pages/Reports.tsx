import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, PieChart as PieIcon, Activity, Home, Plus, PieChart } from 'lucide-react'; // Tambahkan Home, Plus, PieChart
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import api from '../lib/api';
import { TransactionList } from '../components/dashboard/TransactionList';

const COLORS = ['#10b981', '#f43f5e', '#fbbf24', '#3b82f6', '#a855f7', '#ec4899'];

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface ChartItem {
  name: string;
  value: number;
}

const Reports = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      const res = await api.get('/transactions');
      const rawData: Transaction[] = res.data;
      setTransactions(rawData);

      const categoryTotals = rawData.reduce((acc: Record<string, number>, curr: Transaction) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {});

      const formattedData = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
      }));

      setChartData(formattedData);
      setTotalExpense(rawData.reduce((acc: number, curr: Transaction) => acc + curr.amount, 0));
    } catch (err) {
      console.error("Gagal ambil data laporan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-44"> {/* Tambah padding bottom untuk nav [cite: 2026-01-14] */}

      {/* Header Premium - Back Button Removed [cite: 2026-01-14] */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10"
      >
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Analytics</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">Ringkasan Pengeluaran</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5">
          <Activity size={22} strokeWidth={2.5} />
        </div>
      </motion.div>

      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] mb-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <TrendingDown size={16} className="text-rose-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Outflow</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-rose-500/50 italic">Rp</span>
          <h2 className="text-4xl font-black tracking-tighter text-white">
            {totalExpense.toLocaleString('id-ID')}
          </h2>
        </div>
        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Chart Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] h-[500px] relative backdrop-blur-md shadow-2xl mb-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Distribusi Dana</h3>
            <p className="text-[9px] font-bold text-zinc-600 mt-1 uppercase italic">Berdasarkan Kategori</p>
          </div>
          <PieIcon size={20} className="text-emerald-500 opacity-50" strokeWidth={2.5} />
        </div>

        {!loading && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="85%">
            <RechartsPie>
              <Pie
                data={chartData}
                innerRadius={90}
                outerRadius={135}
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(24, 24, 27, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '24px',
                  backdropFilter: 'blur(10px)',
                  padding: '12px 20px',
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                formatter={(value: number | string | undefined) => {
                  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
                  return [`Rp ${(numericValue || 0).toLocaleString('id-ID')}`, 'Jumlah'];
                }}
              />
              <Legend
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              />
            </RechartsPie>
          </ResponsiveContainer>
        ) : !loading && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
            <PieIcon size={28} className="mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Data Kosong</p>
          </div>
        )}

        <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stats</p>
          <p className="text-xs font-black text-white">{chartData.length} Cat</p>
        </div>
      </motion.div>

      {/* Detail Riwayat Transaksi (Full List) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TransactionList transactions={transactions} />
      </motion.div>

      {/* Premium Floating Bottom Navigation [cite: 2026-01-14] */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-zinc-900/90 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex justify-between items-center px-10 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-zinc-500 hover:text-emerald-500 transition-colors group">
          <Home size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>

        <div className="relative -mt-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')} // Arahkan ke dashboard untuk input
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2rem] shadow-[0_15px_30px_rgba(16,185,129,0.4)] border-4 border-zinc-950"
          >
            <Plus size={32} strokeWidth={3} />
          </motion.button>
        </div>

        <button onClick={() => navigate('/reports')} className="flex flex-col items-center text-emerald-500 group">
          <PieChart size={24} strokeWidth={2.5} className="group-active:scale-90 transition-transform" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Reports;