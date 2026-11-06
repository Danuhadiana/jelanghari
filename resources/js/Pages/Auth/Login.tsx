import React, { useState, FormEventHandler } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: true,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/login', {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-emerald-600 selection:text-white">
      <Head title="Masuk ke Akun - Jelang Hari Coffee & Workspace" />

      {/* ── LEFT COLUMN: Full Height Aesthetic Image & Branding (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12 select-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85')",
          }}
        />
        {/* Soft Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src="/images/logo.png"
            alt="Jelang Hari Logo"
            className="w-12 h-12 rounded-full border border-zinc-700/80 object-cover shadow-xl"
          />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">
              JELANG HARI
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium tracking-widest uppercase">
              Coffee &amp; Workspace
            </p>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Secangkir Tenang
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
            Ruang berteduh untuk merayakan rasa dan menuntaskan target harimu.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Satu portal akun terintegrasi untuk pelanggan kafe, kasir POS, barista, kitchen KDS, hingga manajemen owner.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-xs text-zinc-500 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Jelang Hari Coffee. All rights reserved.</span>
          <span className="text-zinc-400">Jl. AH Nasution No 293, Mangkubumi</span>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Minimalist Login Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative">
        {/* Back Link */}
        <div className="w-full max-w-md mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2">
            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-zinc-800 object-cover" />
            <span className="text-xs font-bold text-white tracking-wider">JELANG HARI</span>
          </div>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Masuk ke Akun
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
              Silakan masukkan alamat email dan password akun Anda.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="nama@email.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Remember & Options */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                <input
                  type="checkbox"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-emerald-600 focus:ring-0"
                />
                <span>Ingat sesi saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.01] mt-3"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="text-center pt-2 border-t border-zinc-900 text-xs text-zinc-400">
            Belum memiliki akun pelanggan?{' '}
            <Link href="/register" className="text-emerald-400 hover:underline font-semibold ml-1">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
