import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Wallet } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner'; 

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Akun berhasil dibuat! Silakan login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal daftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-zinc-950 flex flex-col justify-center px-6 py-12"
    >
      {/* Brand Logo & Header */}
      <div className="flex flex-col items-center mb-10">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="w-16 h-16 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <Wallet className="text-zinc-950" size={32} />
        </motion.div>
        <h1 className="text-3xl font-black text-white tracking-tighter">
          JOIN<span className="text-emerald-500">BUDDY</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2 text-center px-4">
          Mulai langkah awal menuju keuangan yang lebih sehat
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-zinc-900/40 border border-zinc-800/60 p-8 rounded-[2.5rem] backdrop-blur-md shadow-xl">
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Siapa namamu?"
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input
                type="password"
                placeholder="Buat password unik"
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>

      {/* Footer Link */}
      <div className="text-center mt-8">
        <p className="text-zinc-500 text-sm">
          Sudah punya akun? {' '}
          <Link to="/login" className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors">Masuk Saja</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default RegisterPage;