import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../lib/api';

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const fetchReportData = async () => {
    try {
      const res = await api.get('/transactions');
      const transactions = res.data;

      // Grouping transaksi berdasarkan kategori [cite: 2026-01-14]
      const categoryTotals = transactions.reduce((acc: any, curr: any) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {});

      const formattedData = Object.keys(categoryTotals).map(cat => ({
        name: cat,
        value: categoryTotals[cat]
      }));

      setChartData(formattedData);
      setTotalExpense(transactions.reduce((acc: number, curr: any) => acc + curr.amount, 0));
    } catch (err) {
      console.error("Gagal ambil data laporan", err);
    }
  };

  useEffect(() => { fetchReportData(); }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-28">
      {/* Header navigasi balik [cite: 2026-01-14] */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Laporan Keuangan</h1>
      </div>

      {/* Ringkasan Total [cite: 2026-01-14] */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[2.5rem] mb-8 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2 text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
          <TrendingDown size={14} className="text-rose-500" />
          <span>Total Pengeluaran</span>
        </div>
        <h2 className="text-3xl font-black text-white">
          Rp {totalExpense.toLocaleString('id-ID')}
        </h2>
      </div>

      {/* Container Chart [cite: 2026-01-14] */}
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-[2.5rem] h-[450px] relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-zinc-400">Distribusi Kategori</h3>
          <PieIcon size={18} className="text-emerald-500 opacity-50" />
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={85}
                outerRadius={125}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '16px' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any) => {
                  if (value === undefined || value === null) return 'Rp 0';
                  return `Rp ${Number(value).toLocaleString('id-ID')}`;
                }}
              />
              <Legend
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-600 italic text-sm">
            Belum ada transaksi bulan ini
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;