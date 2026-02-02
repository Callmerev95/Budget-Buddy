import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';
import { registerSchema } from '../../../shared/src/schemas/auth.schema';
import type { RegisterInput } from '../../../shared/src/schemas/auth.schema';

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Zod
    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Data tidak valid");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast.success('Akun berhasil dibuat! Silakan login 👋');
      navigate('/login');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal mendaftar';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center px-8 py-12 relative overflow-hidden font-sans">
      <div className="fixed top-[-10%] right-[-10%] w-[120%] h-[40%] bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <h1 className="text-3xl font-black text-white tracking-tighter italic">
            JOIN <span className="text-emerald-500 not-italic">BUDDY</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Mulai kelola jatah jajanmu sekarang</p>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
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
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
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
              className="w-full bg-emerald-500 text-zinc-950 font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <div className="flex items-center gap-2 uppercase tracking-widest text-xs">
                  Create Account <ArrowRight size={18} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-10">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            Already a member? <Link to="/login" className="text-emerald-500 ml-1 underline underline-offset-4 decoration-2">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;