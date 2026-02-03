import React, { useEffect, useState, useMemo, useCallback } from 'react'; // 1. Tambah useCallback
import { useNavigate } from 'react-router-dom';
import { Home, Plus, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { toast } from 'sonner';
import { TransactionList } from '../components/dashboard/TransactionList';
import { ReportHeader } from '../components/reports/ReportHeader';
import { ReportStats } from '../components/reports/ReportStats';
import { ReportChart } from '../components/reports/ReportChart';

const Reports = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 2. Stabilkan fetch data dengan useCallback
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      toast.error("Gagal sinkronisasi laporan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // 3. Stabilkan fungsi delete agar TransactionList (memo) tidak re-render sia-sia
  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaksi dihapus");
      fetchReportData();
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  }, [fetchReportData]);

  // 4. Perhitungan Data tetap di useMemo (sudah benar)
  const reportStats = useMemo(() => {
    const filtered = transactions.filter((t: any) => (t.createdAt || t.date || "").startsWith(selectedDate));
    const totals = filtered.reduce((acc: any, curr: any) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    const chartData = Object.keys(totals).map(cat => ({
      name: cat,
      value: totals[cat]
    }));

    const totalExpense = filtered.reduce((acc, curr: any) => acc + curr.amount, 0);

    return { filtered, chartData, totalExpense };
  }, [transactions, selectedDate]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-44 font-sans overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-emerald-500/10 blur-[120px] pointer-events-none transform-gpu" />

      <ReportHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="relative z-10 transform-gpu">
        <ReportStats
          totalExpense={reportStats.totalExpense}
          count={reportStats.filtered.length}
          selectedDate={selectedDate}
        />

        {/* ReportChart sekarang lebih stabil karena chartData di-memoize */}
        <ReportChart chartData={reportStats.chartData} loading={loading} />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <TransactionList
              transactions={reportStats.filtered}
              onDelete={handleDelete}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 h-24 bg-zinc-900/80 backdrop-blur-3xl border-t border-white/5 rounded-t-[2.5rem] flex justify-between items-center px-12 z-50 pb-6 transform-gpu shadow-2xl">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-zinc-500 active:scale-90 transition-transform">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-widest">Home</span>
        </button>

        <div className="relative -mt-16">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="bg-emerald-500 text-zinc-950 p-5 rounded-[2.2rem] border-4 border-[#050505] shadow-lg"
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