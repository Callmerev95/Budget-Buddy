import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PieChart, Plus, User, LogOut, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../lib/api';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUserName(res.data.name);
      } catch (err) {
        console.error("Gagal ambil data user");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28">
      {/* Header Section */}
      <div className="p-6 pt-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Selamat datang</p>
            <h1 className="text-2xl font-bold text-white mt-1">
              {userName || 'Buddy'} <span className="text-emerald-500">👋</span>
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Main Balance Card - Glassmorphism style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-7 rounded-[2rem] shadow-2xl shadow-emerald-900/20 mb-8">
          <div className="relative z-10">
            <p className="text-emerald-100/80 text-sm font-medium mb-1">Total Saldo Kamu</p>
            <h2 className="text-4xl font-extrabold tracking-tight">Rp 0</h2>
            <div className="mt-6 flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="bg-emerald-400 p-1 rounded-full text-zinc-900">
                  <TrendingUp size={12} />
                </div>
                <span className="text-xs font-bold text-emerald-50">Rp 0</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                <div className="bg-rose-400 p-1 rounded-full text-zinc-900">
                  <TrendingDown size={12} />
                </div>
                <span className="text-xs font-bold text-rose-50">Rp 0</span>
              </div>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Quick Stats Grid */}
        <h3 className="text-lg font-bold mb-4 px-1">Ringkasan Bulan Ini</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
              <TrendingUp size={20} />
            </div>
            <p className="text-zinc-500 text-xs mb-1">Pemasukan</p>
            <p className="text-lg font-bold text-emerald-400 leading-none">Rp 0</p>
          </div>
          <div className="bg-zinc-900/50 p-5 rounded-[1.5rem] border border-zinc-800/50 backdrop-blur-sm">
            <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 mb-3">
              <TrendingDown size={20} />
            </div>
            <p className="text-zinc-500 text-xs mb-1">Pengeluaran</p>
            <p className="text-lg font-bold text-rose-400 leading-none">Rp 0</p>
          </div>
        </div>

        {/* Recent Transactions Placeholder */}
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-lg font-bold">Transaksi Terakhir</h3>
          <button className="text-emerald-500 text-sm font-medium">Lihat Semua</button>
        </div>
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-zinc-600 text-sm">Belum ada catatan hari ini.</p>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900 px-8 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center text-emerald-500 transition-transform active:scale-90">
          <Home size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Home</span>
        </button>

        {/* Floating Action Button */}
        <div className="relative -mt-14">
          <button className="bg-emerald-500 text-zinc-950 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all">
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        <button className="flex flex-col items-center text-zinc-600 hover:text-zinc-300 transition-all">
          <PieChart size={24} />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Laporan</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;