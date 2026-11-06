import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, Link } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    Filter, Download, FileSpreadsheet, FileText, TrendingUp,
    DollarSign, Receipt, ArrowUpRight, PieChart as PieIcon,
    BarChart3, Clock, Wallet, Percent, Tag, ChevronDown, Check,
    Calendar, ArrowRight, ShieldCheck, CreditCard, QrCode, Banknote
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

interface TransaksiItem {
    id: number;
    nomor_pesanan: string;
    waktu: string;
    tanggal: string;
    nama_pelanggan: string;
    meja: string;
    kasir: string;
    metode_pembayaran: string;
    subtotal: number;
    diskon: number;
    pajak: number;
    service: number;
    total: number;
    status: string;
}

interface Props {
    summary?: {
        total_penjualan: number;
        total_subtotal: number;
        total_diskon: number;
        total_pajak: number;
        total_service: number;
        total_transaksi: number;
        total_hpp: number;
        laba_kotor: number;
        avg_order?: number;
        margin_persen?: number;
    };
    ringkasan?: any;
    daily_trend?: Array<{
        tanggal: string;
        full_date: string;
        omset: number;
        hpp: number;
        laba_kotor: number;
        transaksi: number;
    }>;
    kategori_breakdown?: Array<{
        kategori: string;
        total: number;
        qty: number;
        persen: number;
    }>;
    metode_breakdown?: Array<{
        metode_bayar: string;
        total: number;
        count: number;
        persen?: number;
    }>;
    metodeBreakdown?: any[];
    hourly_sales?: Array<{
        jam: number;
        total: number;
        count?: number;
    }>;
    hourlyData?: any[];
    transaksi_list?: TransaksiItem[];
    filters?: {
        tanggal_mulai?: string;
        tanggal_selesai?: string;
        start_date?: string;
        end_date?: string;
    };
}

export default function Harian({
    summary,
    ringkasan,
    daily_trend = [],
    kategori_breakdown = [],
    metode_breakdown = [],
    metodeBreakdown = [],
    hourly_sales = [],
    hourlyData = [],
    transaksi_list = [],
    filters
}: Props) {
    const activeSummary = summary || ringkasan || {
        total_penjualan: 0,
        total_subtotal: 0,
        total_diskon: 0,
        total_pajak: 0,
        total_service: 0,
        total_transaksi: 0,
        total_hpp: 0,
        laba_kotor: 0,
        avg_order: 0,
        margin_persen: 0
    };
    const activeMetode = (metode_breakdown && metode_breakdown.length > 0) ? metode_breakdown : (metodeBreakdown || []);
    const activeHourly = (hourly_sales && hourly_sales.length > 0) ? hourly_sales : (hourlyData || []);
    const [mulai, setMulai] = useState(filters?.tanggal_mulai || filters?.start_date || '');
    const [selesai, setSelesai] = useState(filters?.tanggal_selesai || filters?.end_date || '');
    const [chartMode, setChartMode] = useState<'daily' | 'hourly'>('daily');

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/laporan/harian', {
            tanggal_mulai: mulai,
            tanggal_selesai: selesai,
        }, { preserveState: true });
    };

    const applyQuickPreset = (preset: 'today' | '7days' | 'this_month' | '30days') => {
        const today = new Date();
        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        let startDate = new Date();
        let endDate = new Date();

        if (preset === 'today') {
            // today
        } else if (preset === '7days') {
            startDate.setDate(today.getDate() - 6);
        } else if (preset === 'this_month') {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        } else if (preset === '30days') {
            startDate.setDate(today.getDate() - 29);
        }

        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);

        setMulai(startStr);
        setSelesai(endStr);

        router.get('/laporan/harian', {
            tanggal_mulai: startStr,
            tanggal_selesai: endStr,
        }, { preserveState: true });
    };

    const handleExportExcel = () => {
        window.open(`/laporan/export-excel?tanggal_mulai=${mulai}&tanggal_selesai=${selesai}`, '_blank');
    };

    const handleExportPdf = () => {
        window.open(`/laporan/export-pdf?tanggal_mulai=${mulai}&tanggal_selesai=${selesai}`, '_blank');
    };

    const getPaymentIcon = (method: string) => {
        const m = method.toLowerCase();
        if (m.includes('qris')) return <QrCode className="w-4 h-4 text-emerald-500" />;
        if (m.includes('cash') || m.includes('tunai')) return <Banknote className="w-4 h-4 text-amber-500" />;
        return <CreditCard className="w-4 h-4 text-cyan-500" />;
    };

    return (
        <AppLayout>
            <Head title="Laporan Analisis Penjualan & Keuangan - Jelang Hari" />

            {/* ── 1. Header & Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                        Laporan Penjualan &amp; Analitik Keuangan
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Grafik interaktif dinamika omzet, laba kotor, HPP bahan, jam ramai toko, serta rincian pembayaran.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Ekspor Excel (CSV)</span>
                    </button>
                    <button
                        onClick={handleExportPdf}
                        className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Cetak Struk / PDF</span>
                    </button>
                </div>
            </div>

            {/* ── 2. Filter Bar with Quick Presets ── */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                        <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mr-1">Preset:</span>
                        {[
                            { id: 'today', label: 'Hari Ini' },
                            { id: '7days', label: '7 Hari Terakhir' },
                            { id: 'this_month', label: 'Bulan Ini' },
                            { id: '30days', label: '30 Hari Terakhir' },
                        ].map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => applyQuickPreset(p.id as any)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Date Range Inputs */}
                    <form onSubmit={handleApply} className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs">
                            <input
                                type="date"
                                value={mulai}
                                onChange={(e) => setMulai(e.target.value)}
                                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-zinc-400 text-xs">s/d</span>
                            <input
                                type="date"
                                value={selesai}
                                onChange={(e) => setSelesai(e.target.value)}
                                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>Terapkan</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* ── 3. High-level Financial Summary KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Total Omset Penjualan</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(activeSummary.total_penjualan)}
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
                        <Receipt className="w-3 h-3" />
                        <span>{activeSummary.total_transaksi} nota transaksi lunas</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Laba Kotor Operasional</span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(activeSummary.laba_kotor)}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5">
                        Margin laba: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{activeSummary.margin_persen || 65}%</strong> omset
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Estimasi HPP Bahan Baku</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(activeSummary.total_hpp)}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5">
                        Biaya pokok modal bahan (~35%)
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Rata-rata Order (AOV)</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(activeSummary.avg_order)}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5">
                        Diskon voucher: <strong className="text-rose-500">-{rupiah(activeSummary.total_diskon)}</strong>
                    </p>
                </div>
            </div>

            {/* ── 4. Advanced Interactive Charts Section ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Main Dynamic Chart (AreaChart Tren Penjualan & Laba / BarChart Jam Ramai) */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-base md:text-lg text-zinc-950 dark:text-white">
                                    {chartMode === 'daily' ? 'Grafik Dinamika Tren Penjualan & Laba' : 'Grafik Jam Ramai Penjualan Kafe'}
                                </h2>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {chartMode === 'daily' 
                                    ? 'Perbandingan pendapatan kotor (Omset), laba kotor, dan estimasi modal HPP'
                                    : 'Frekuensi transaksi dan total omset berdasarkan jam operasional toko'}
                            </p>
                        </div>

                        {/* Chart Switcher */}
                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setChartMode('daily')}
                                className={`px-3 py-1.5 rounded-lg transition ${
                                    chartMode === 'daily'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                Tren Harian
                            </button>
                            <button
                                type="button"
                                onClick={() => setChartMode('hourly')}
                                className={`px-3 py-1.5 rounded-lg transition ${
                                    chartMode === 'hourly'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                Jam Sibuk
                            </button>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        {chartMode === 'daily' ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={daily_trend.length > 0 ? daily_trend : [{ tanggal: 'Hari Ini', omset: activeSummary.total_penjualan || 0, laba_kotor: activeSummary.laba_kotor || 0, hpp: activeSummary.total_hpp || 0 }]}>
                                    <defs>
                                        <linearGradient id="gradOmset" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                                        </linearGradient>
                                        <linearGradient id="gradLaba" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3F3F46" strokeOpacity={0.2} />
                                    <XAxis
                                        dataKey="tanggal"
                                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `Rp${(val / 1000)}k`}
                                    />
                                    <Tooltip
                                        formatter={(val: any, name: any) => {
                                            const label = name === 'omset' ? 'Total Omset' : (name === 'laba_kotor' ? 'Laba Kotor' : 'HPP Bahan');
                                            return [rupiah(Number(val)), label];
                                        }}
                                        contentStyle={{
                                            backgroundColor: '#09090B',
                                            borderRadius: '16px',
                                            border: '1px solid #27272A',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="omset"
                                        name="Total Omset"
                                        stroke="#10B981"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#gradOmset)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="laba_kotor"
                                        name="Laba Kotor"
                                        stroke="#6366F1"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#gradLaba)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={activeHourly}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3F3F46" strokeOpacity={0.2} />
                                    <XAxis
                                        dataKey="jam"
                                        tickFormatter={(v) => `${v}:00`}
                                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#A1A1AA', fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `Rp${(val / 1000)}k`}
                                    />
                                    <Tooltip
                                        formatter={(val: any) => [rupiah(Number(val)), 'Omset Penjualan']}
                                        labelFormatter={(v) => `Pukul ${v}:00 - ${v}:59 WIB`}
                                        contentStyle={{
                                            backgroundColor: '#09090B',
                                            borderRadius: '16px',
                                            border: '1px solid #27272A',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            fontFamily: 'monospace'
                                        }}
                                    />
                                    <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Breakdown Pembayaran & Kategori Share */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                                <span>Distribusi Metode Bayar</span>
                            </h2>
                            <span className="text-[11px] font-bold text-zinc-400 font-mono">
                                {activeMetode.reduce((sum, m) => sum + m.count, 0)} tx
                            </span>
                        </div>

                        <div className="space-y-3">
                            {activeMetode.length === 0 ? (
                                <p className="text-center text-xs text-zinc-400 py-8">Belum ada transaksi pada periode ini.</p>
                            ) : (
                                activeMetode.map((m) => {
                                    const percent = m.persen || (activeSummary.total_penjualan ? Math.round((m.total / activeSummary.total_penjualan) * 100) : 0);
                                    return (
                                        <div key={m.metode_bayar} className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    {getPaymentIcon(m.metode_bayar)}
                                                    <span className="font-bold text-xs uppercase text-zinc-900 dark:text-white">
                                                        {m.metode_bayar}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                                                    {rupiah(m.total)}
                                                </span>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                                                />
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                                                <span>{m.count} transaksi lunas</span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{percent}% share</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Top Category Snippet */}
                    {kategori_breakdown.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <h3 className="font-bold text-xs text-zinc-900 dark:text-white mb-2 flex items-center justify-between">
                                <span>Kontribusi Kategori Teratas</span>
                                <Link href="/laporan/produk" className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline">
                                    Detail Menu
                                </Link>
                            </h3>
                            <div className="space-y-1.5">
                                {kategori_breakdown.slice(0, 3).map((kat) => (
                                    <div key={kat.kategori} className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-600 dark:text-zinc-400">{kat.kategori}</span>
                                        <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                                            {rupiah(kat.total)} <span className="text-[10px] text-zinc-400">({kat.persen}%)</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 5. Rincian Struk & Riwayat Transaksi ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                            Rincian Transaksi Penjualan Lunas
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Daftar struk kasir lunas pada periode terpilih ({transaksi_list.length} transaksi ditampilkan).
                        </p>
                    </div>
                    <Link
                        href="/transaksi"
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                        <span>Lihat Semua Riwayat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">No. Struk</th>
                                <th className="px-5 py-3.5">Waktu Transaksi</th>
                                <th className="px-5 py-3.5">Pelanggan</th>
                                <th className="px-5 py-3.5">Meja</th>
                                <th className="px-5 py-3.5">Kasir</th>
                                <th className="px-5 py-3.5">Metode Bayar</th>
                                <th className="px-5 py-3.5 text-right">Subtotal</th>
                                <th className="px-5 py-3.5 text-right">Diskon</th>
                                <th className="px-5 py-3.5 text-right">Total Akhir</th>
                                <th className="px-5 py-3.5 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {transaksi_list.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center text-zinc-400">
                                        Tidak ada transaksi penjualan pada rentang tanggal ini.
                                    </td>
                                </tr>
                            ) : (
                                transaksi_list.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                                        <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 dark:text-white">
                                            {tx.nomor_pesanan}
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                            {tx.tanggal} {tx.waktu}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-zinc-950 dark:text-white">
                                            {tx.nama_pelanggan}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-zinc-700 dark:text-zinc-300">
                                            {tx.meja}
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                                            {tx.kasir}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                {tx.metode_pembayaran}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-mono text-zinc-600 dark:text-zinc-400">
                                            {rupiah(tx.subtotal)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-mono text-rose-500 font-semibold">
                                            {tx.diskon > 0 ? `-${rupiah(tx.diskon)}` : '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-mono font-bold text-zinc-950 dark:text-white">
                                            {rupiah(tx.total)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                Lunas
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
