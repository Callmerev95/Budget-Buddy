import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Ambil data user (jika ada) atau sekadar cek token
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-500">Dashboard BudgetBuddy</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Keluar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total Saldo</p>
            <h2 className="text-2xl font-bold">Rp 0</h2>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">Pemasukan Bulan Ini</p>
            <h2 className="text-2xl font-bold text-emerald-400">Rp 0</h2>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm">Pengeluaran Bulan Ini</p>
            <h2 className="text-2xl font-bold text-red-400">Rp 0</h2>
          </div>
        </div>

        <div className="mt-8 bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-center text-zinc-500">
          Belum ada transaksi terbaru.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;