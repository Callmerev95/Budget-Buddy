import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // Mapping error message agar lebih manusiawi
        if (error.message.includes("Password should contain")) {
          toast.error("Security Policy Violation", {
            description: "Password wajib kombinasi: Huruf Besar, Angka, dan Simbol.",
            icon: <AlertCircle className="text-red-500" size={18} />,
            className: "bg-zinc-900 border-white/5 text-white"
          });
        } else if (error.message.includes("New password should be different")) {
          toast.error("Password Terlalu Identik", {
            description: "Gunakan password yang berbeda dari sebelumnya demi keamanan.",
          });
        } else {
          toast.error("Gagal Memperbarui", {
            description: error.message,
          });
        }
      } else {
        toast.success("Security Key Updated", {
          description: "Akses Anda telah berhasil diamankan kembali. Silakan login.",
        });
        navigate('/login');
      }
    } catch (err: unknown) {
      toast.error("System Error", {
        description: "Terjadi gangguan pada server, silakan coba lagi nanti."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center px-8 py-12 relative overflow-hidden font-sans">
      {/* Background Ambient Premium [cite: 2026-01-12] */}
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
            <ShieldCheck className="text-zinc-950" size={36} strokeWidth={2.5} />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter italic text-center">
            UPDATE<span className="text-emerald-500 not-italic">SECURITY</span>
          </h1>
          <div className="mt-3 flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Identity Verified</p>
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[3rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <form onSubmit={handleUpdatePassword} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 ml-2">New Secure Key</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kombinasi Huruf, Angka & Simbol"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
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
                    <span className="uppercase tracking-widest text-xs">Update Access Key</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10" />
        </div>

        <motion.div className="text-center mt-10">
          <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
            By updating your key, all existing sessions <br /> will be re-validated for security. [cite: 2026-01-12]
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;