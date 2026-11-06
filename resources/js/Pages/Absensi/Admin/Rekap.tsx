import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    ArrowLeft,
    FileSpreadsheet,
    Download,
    Calendar,
    Users,
    Filter,
    DollarSign,
    Clock,
    CheckCircle2
} from 'lucide-react';

interface Props {
    rekapData: Array<{
        user_id: number;
        nama: string;
        role: string;
        hadir: number;
        terlambat: number;
        izin: number;
        sakit: number;
        cuti: number;
        alpha: number;
        total_hari_masuk: number;
        total_jam_kerja: number;
        total_lembur_jam: number;
        gaji_harian: number;
        estimasi_gaji: number;
    }>;
    karyawans: Array<{ id: number; nama: string }>;
    filter: {
        bulan: number;
        tahun: number;
        user_id?: string | number;
    };
}

export default function Rekap({ rekapData, karyawans, filter }: Props) {
    const [bulan, setBulan] = useState(filter.bulan);
    const [tahun, setTahun] = useState(filter.tahun);
    const [userId, setUserId] = useState(filter.user_id || '');

    const namaBulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/absensi/admin/rekap', {
            bulan,
            tahun,
            user_id: userId || undefined,
        }, { preserveState: true });
    };

    const handleExport = () => {
        window.location.href = `/absensi/admin/export?bulan=${bulan}&tahun=${tahun}`;
    };

    const totalPengeluaranGaji = rekapData.reduce((sum, it) => sum + it.estimasi_gaji, 0);
    const totalSemuaJamKerja = rekapData.reduce((sum, it) => sum + it.total_jam_kerja, 0);

    return (
        <AppLayout>
            <Head title="Rekapitulasi Presensi & Gaji Staff - Jelang Hari" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/absensi/admin"
                            className="p-2 rounded-[10px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#0A0A0A] dark:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-sans font-bold text-2xl text-[#0A0A0A] dark:text-white">Rekap Presensi &amp; Payroll</h1>
                            <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                Agregasi kehadiran dan perhitungan estimasi gaji staff periode {namaBulan[bulan - 1]} {tahun}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export CSV / Excel</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <form onSubmit={handleFilter} className="bg-white dark:bg-zinc-900 p-4 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <select
                            value={bulan}
                            onChange={e => setBulan(Number(e.target.value))}
                            className="px-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs font-medium text-[#0A0A0A] dark:text-white outline-none"
                        >
                            {namaBulan.map((n, idx) => (
                                <option key={idx + 1} value={idx + 1}>{n}</option>
                            ))}
                        </select>

                        <select
                            value={tahun}
                            onChange={e => setTahun(Number(e.target.value))}
                            className="px-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs font-medium text-[#0A0A0A] dark:text-white outline-none"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[180px]">
                        <select
                            value={userId}
                            onChange={e => setUserId(e.target.value)}
                            className="w-full px-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs font-medium text-[#0A0A0A] dark:text-white outline-none"
                        >
                            <option value="">Semua Karyawan</option>
                            {karyawans.map(k => (
                                <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-1.5 rounded-[10px] bg-[#0A0A0A] hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border dark:border-zinc-700 text-white text-xs font-semibold shadow-sm transition"
                    >
                        Terapkan Filter
                    </button>
                </form>

                {/* Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Total Karyawan Terdata</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white">{rekapData.length}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">orang staff</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Total Jam Kerja Terakumulasi</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white">{totalSemuaJamKerja.toFixed(1)}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">jam</span>
                        </div>
                    </div>

                    <div className="p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Estimasi Beban Gaji Bulanan</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-black text-emerald-800 dark:text-emerald-400">{rupiah(totalPengeluaranGaji)}</span>
                        </div>
                    </div>
                </div>

                {/* Rekapitulasi Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAFAF9] dark:bg-zinc-800/60 border-b border-[#E7E5E4] dark:border-zinc-800 text-[#78716C] dark:text-zinc-400 font-semibold uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">Nama Karyawan</th>
                                    <th className="px-5 py-3.5">Jabatan</th>
                                    <th className="px-5 py-3.5">Hadir</th>
                                    <th className="px-5 py-3.5">Terlambat</th>
                                    <th className="px-5 py-3.5">Izin/Sakit/Cuti</th>
                                    <th className="px-5 py-3.5">Total Jam</th>
                                    <th className="px-5 py-3.5">Lembur</th>
                                    <th className="px-5 py-3.5 text-right">Estimasi Gaji</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5E4] dark:divide-zinc-800">
                                {rekapData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-[#78716C] dark:text-zinc-500">
                                            Tidak ada data rekap presensi.
                                        </td>
                                    </tr>
                                ) : (
                                    rekapData.map((row) => (
                                        <tr key={row.user_id} className="hover:bg-[#FAFAF9] dark:hover:bg-zinc-800/40 transition">
                                            <td className="px-5 py-3.5 font-bold text-[#0A0A0A] dark:text-white">
                                                <Link href={`/absensi/admin/detail/${row.user_id}`} className="hover:underline">
                                                    {row.nama}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5 uppercase text-[10px] text-[#8B7355] dark:text-amber-400 font-semibold">
                                                {row.role}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                                {row.hadir} hari
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-amber-700 dark:text-amber-400 font-medium">
                                                {row.terlambat} hari
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-[#78716C] dark:text-zinc-400">
                                                {row.izin + row.sakit + row.cuti} hari
                                            </td>
                                            <td className="px-5 py-3.5 font-mono font-medium text-zinc-900 dark:text-zinc-200">
                                                {row.total_jam_kerja} jam
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-amber-700 dark:text-amber-400">
                                                +{row.total_lembur_jam} jam
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-mono font-bold text-[#0A0A0A] dark:text-white">
                                                {rupiah(row.estimasi_gaji)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
