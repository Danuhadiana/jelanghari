import React, { useState, FormEventHandler } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Lock, Mail, User, Phone, ArrowRight, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    telepon: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post('/register', {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex font-sans selection:bg-emerald-600 selection:text-white">
      <Head title="Daftar Akun Pelanggan - Jelang Hari Coffee & Workspace" />

      {/* ── LEFT COLUMN: Full Height Aesthetic Image & Branding (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12 select-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85')",
          }}
        />
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

        {/* Center Benefits */}
        <div className="relative z-10 space-y-5 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Gabung Komunitas Kami
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-snug">
            Pesan lebih cepat, nikmati promo member &amp; lacak pesananmu.
          </h1>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Pesan mandiri tanpa perlu antre di kasir.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Dapatkan diskon promo &amp; voucher spesial member.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Pantau status kopi &amp; makananmu secara realtime.</span>
            </li>
          </ul>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-xs text-zinc-500 flex items-center justify-between">
          <span>&copy; {new Date().getFullYear()} Jelang Hari Coffee. All rights reserved.</span>
          <span className="text-zinc-400">Jl. AH Nasution No 293, Mangkubumi</span>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Registration Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-12 py-12 relative overflow-y-auto">
        {/* Back Link */}
        <div className="w-full max-w-md mb-6 flex items-center justify-between">
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

        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Buat Akun Baru
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Daftarkan diri Anda untuk pengalaman pemesanan kafe yang praktis.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Nama Lengkap */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* WhatsApp / Telepon */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                No. WhatsApp / HP
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="tel"
                  placeholder="08123456789"
                  value={data.telepon}
                  onChange={(e) => setData('telepon', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.telepon && (
                <p className="text-xs text-red-400 font-medium">{errors.telepon}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimal 8 karakter"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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

            {/* Konfirmasi Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="Ulangi password"
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
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
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="text-center pt-2 border-t border-zinc-900 text-xs text-zinc-400">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline font-semibold ml-1">
              Masuk di Sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
