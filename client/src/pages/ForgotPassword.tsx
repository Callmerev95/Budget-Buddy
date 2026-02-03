import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Memanggil endpoint backend yang kita buat tadi [cite: 2026-02-03]
      await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      toast.success('Instruksi pemulihan telah dikirim!');
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal memproses permintaan';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center px-8 py-12 relative overflow-hidden font-sans">
      {/* Background Ambient Premium */}
      <div className="fixed top-[-10%] left-[-10%] w-[120%] h-[40%] bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.25)] border-4 border-white/10">
            <Wallet className="text-zinc-950" size={36} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic">
            RESET<span className="text-emerald-500 not-italic">ACCESS</span>
          </h1>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 text-zinc-950 font-black py-5 rounded-[1.8rem] flex items-center justify-center gap-3 mt-4 shadow-[0_15px_30px_rgba(16,185,129,0.2)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <div className="flex items-center gap-2">
                      <span className="uppercase tracking-widest text-xs">Send Reset Link</span>
                      <ArrowRight size={18} strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="text-emerald-500" size={60} strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-bold text-lg">Cek Email Anda</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Kami telah mengirimkan instruksi pemulihan kata sandi ke <strong>{email}</strong>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div className="text-center mt-10">
          <Link to="/login" className="text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-emerald-500 transition-colors">
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;