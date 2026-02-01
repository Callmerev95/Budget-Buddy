import React, { useState } from 'react';
import api from '../lib/api'; // Menggunakan ../ karena file ini di folder pages
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Inisialisasi navigate

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      // Ganti alert dengan navigasi otomatis
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-lg border border-zinc-800">
        <h1 className="text-2xl mb-4">Login BudgetBuddy</h1>
        <input
          type="email"
          placeholder="Email"
          className="block w-full mb-2 p-2 bg-zinc-800 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="block w-full mb-4 p-2 bg-zinc-800 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-indigo-600 p-2 rounded">Masuk</button>
      </form>
    </div>
  );
};

export default LoginPage;