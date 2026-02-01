import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal registrasi');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
      <form onSubmit={handleRegister} className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 shadow-2xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Daftar BudgetBuddy</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              placeholder="Masukkan nama kamu"
              className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="nama@email.com"
              className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded transition-colors mt-2">
            Daftar Akun
          </button>

          <p className="text-center text-sm text-zinc-500 mt-4">
            Sudah punya akun? <Link to="/login" className="text-indigo-400 hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;