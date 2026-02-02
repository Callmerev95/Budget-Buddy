import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Wallet, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { loginSchema } from '../../../shared/src/schemas/auth.schema';
import type { LoginInput } from '../../../shared/src/schemas/auth.schema';

const LoginPage = () => {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi data menggunakan Zod sebelum hit API
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      toast.success('Selamat datang kembali! 👋');
      navigate('/dashboard');
    } catch (err: unknown) {
      // Type-safe error handling tanpa 'any' [cite: 2026-01-10]
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal login';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center px-8 py-12 relative overflow-hidden font-sans">
      {/* Background Ambient Premium */}
      <div className="fixed top-[-10%] left-[-10%] w-[120%] h-[40%] bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[100%] h-[30%] bg-emerald-900/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.25)] border-4 border-white/10"
          >
            <Wallet className="text-zinc-950" size={36} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none italic">
            BUDGET<span className="text-emerald-500 not-italic">BUDDY</span>
          </h1>
          <div className="mt-3 flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Premium Personal Finance</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">Email Access</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">Secure Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 active:text-emerald-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-zinc-950 font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 mt-4 shadow-[0_15px_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest text-xs">Authorize Access</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
        </div>

        <motion.div className="text-center mt-10">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            New User? {' '}
            <Link to="/register" className="text-emerald-500 ml-1 underline underline-offset-4 decoration-2">Create Account</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;