import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    Trophy, TrendingUp, Filter, BarChart3, Coffee,
    ArrowUpRight, Award, DollarSign, Package
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    Tooltip, CartesianGrid, Legend
} from 'recharts';

interface ProdukItem {
    nama_produk: string;
    total_qty: number;
    total_omset: number;
    total_hpp: number;
    total_margin: number;
}

interface Props {
    produk_terlaris: ProdukItem[];
    filters: { tanggal_mulai: string; tanggal_selesai: string };
}

export default function Produk({ produk_terlaris = [], filters }: Props) {
    const [mulai, setMulai] = useState(filters?.tanggal_mulai || '');
    const [selesai, setSelesai] = useState(filters?.tanggal_selesai || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/laporan/produk', { tanggal_mulai: mulai, tanggal_selesai: selesai });
    };

    const totalQtySemua = produk_terlaris.reduce((sum, p) => sum + Number(p.total_qty || 0), 0);
    const totalOmsetSemua = produk_terlaris.reduce((sum, p) => sum + Number(p.total_omset || 0), 0);
    const totalMarginSemua = produk_terlaris.reduce((sum, p) => sum + Number(p.total_margin || 0), 0);

    const topChartData = produk_terlaris.slice(0, 7).map((p) => ({
        name: p.nama_produk.length > 16 ? p.nama_produk.substring(0, 14) + '...' : p.nama_produk,
        fullName: p.nama_produk,
        omset: Number(p.total_omset),
        margin: Number(p.total_margin),
        qty: Number(p.total_qty),
    }));

    return (
        <AppLayout>
            <Head title="Laporan Performa Menu & Profit Margin - Jelang Hari" />

            {/* ── 1. Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                        Performa Penjualan &amp; Margin Menu
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Analisis menu best-seller terlaris, kontribusi omset kotor, dan laba margin profit per varian item.
                    </p>
                </div>
            </div>

            {/* ── 2. Filter Bar ── */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Periode Laporan:</span>
                    <input
                        type="date"
                        value={mulai}
                        onChange={(e) => setMulai(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-400">s/d</span>
                    <input
                        type="date"
                        value={selesai}
                        onChange={(e) => setSelesai(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter Periode</span>
                    </button>
                </form>
            </div>

            {/* ── 3. KPI Summary ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                        Total Porsi Terjual
                    </span>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {totalQtySemua.toLocaleString('id-ID')} <span className="text-xs font-normal text-zinc-400">porsi</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Akumulasi seluruh item menu</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                        Total Omset Menu
                    </span>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {rupiah(totalOmsetSemua)}
                    </div>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Pendapatan kotor menu</p>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
                        Total Margin Profit Bersih
                    </span>
                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {rupiah(totalMarginSemua)}
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Laba kotor setelah HPP bahan</p>
                </div>
            </div>

            {/* ── 4. Visual BarChart: Top 7 Menu Terlaris ── */}
            {topChartData.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-base text-zinc-950 dark:text-white">
                                Top Menu Best-Seller &amp; Margin Profit
                            </h2>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-xs text-zinc-400 font-mono">Peringkat 1 - 7</span>
                    </div>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3F3F46" strokeOpacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#A1A1AA', fontSize: 11 }} tickFormatter={(val) => `Rp${(val / 1000)}k`} />
                                <Tooltip
                                    formatter={(val: any, name: any) => {
                                        const label = name === 'omset' ? 'Total Omset' : 'Margin Laba';
                                        return [rupiah(Number(val)), label];
                                    }}
                                    labelFormatter={(_, arr) => arr?.[0]?.payload?.fullName || ''}
                                    contentStyle={{
                                        backgroundColor: '#09090B',
                                        borderRadius: '16px',
                                        border: '1px solid #27272A',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Bar dataKey="omset" name="Total Omset" fill="#10B981" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="margin" name="Margin Laba" fill="#6366F1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── 5. Detailed Ranking Table ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 uppercase text-zinc-500 dark:text-zinc-400 font-bold tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3.5 w-16 text-center">Rank</th>
                            <th className="px-5 py-3.5">Nama Menu</th>
                            <th className="px-5 py-3.5">Qty Terjual</th>
                            <th className="px-5 py-3.5">Total Omset</th>
                            <th className="px-5 py-3.5">Total HPP Bahan</th>
                            <th className="px-5 py-3.5 text-right">Profit Margin Bersih</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {(!produk_terlaris || produk_terlaris.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-zinc-400">
                                    Belum ada data penjualan menu pada rentang periode ini.
                                </td>
                            </tr>
                        ) : (
                            produk_terlaris.map((p, idx) => (
                                <tr key={p.nama_produk} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                                    <td className="px-5 py-4 text-center font-mono font-bold">
                                        {idx === 0 ? (
                                            <span className="w-7 h-7 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-extrabold text-xs">
                                                <Trophy className="w-3.5 h-3.5" />
                                            </span>
                                        ) : (
                                            <span className="text-zinc-500 font-mono">#{idx + 1}</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 font-bold text-zinc-950 dark:text-white">
                                        {p.nama_produk}
                                    </td>
                                    <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-white">
                                        {Number(p.total_qty).toLocaleString('id-ID')} porsi
                                    </td>
                                    <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300">
                                        {rupiah(p.total_omset)}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-zinc-500 dark:text-zinc-400">
                                        {rupiah(p.total_hpp)}
                                    </td>
                                    <td className="px-5 py-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                        {rupiah(p.total_margin)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
