import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { tanggal_id } from '@/lib/format';
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Filter,
    Settings,
    FileSpreadsheet,
    FileText,
    Camera,
    Check,
    X,
    Search,
    ArrowRight,
    MapPin,
    Eye,
    Loader2
} from 'lucide-react';

interface Props {
    staffStatusList: Array<{
        user_id: number;
        name: string;
        email: string;
        role: string;
        telepon?: string;
        kondisi: 'belum_absen' | 'sedang_bekerja' | 'selesai' | string;
        status_absensi: string;
        jam_masuk: string | null;
        jam_keluar: string | null;
        durasi_kerja: string | null;
        lembur_menit: number;
        foto_masuk: string | null;
        foto_keluar: string | null;
        keterangan?: string | null;
    }>;
    stats: {
        hadir: number;
        terlambat: number;
        izin: number;
        alpha: number;
        total_karyawan: number;
    };
    pendingIzin: Array<{
        id: number;
        user?: { name: string; email: string };
        tipe: string;
        tanggal_mulai: string;
        tanggal_selesai: string;
        total_hari: number;
        alasan: string;
        lampiran: string | null;
        created_at: string;
    }>;
    filter: {
        tanggal: string;
        search?: string;
        status?: string;
    };
}

export default function Index({ staffStatusList, stats, pendingIzin, filter }: Props) {
    const [tanggal, setTanggal] = useState(filter.tanggal);
    const [search, setSearch] = useState(filter.search || '');
    const [statusFilter, setStatusFilter] = useState(filter.status || '');

    // Modal states for Izin Approval & Rejection
    const [approveModalItem, setApproveModalItem] = useState<Props['pendingIzin'][number] | null>(null);
    const [rejectModalItem, setRejectModalItem] = useState<Props['pendingIzin'][number] | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const handleApplyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/absensi/admin', {
            tanggal,
            search,
            status: statusFilter || undefined,
        }, { preserveState: true });
    };

    const handleConfirmApprove = () => {
        if (!approveModalItem || isSubmitting) return;
        setIsSubmitting(true);
        router.post(`/absensi/admin/approve/${approveModalItem.id}`, {}, {
            onFinish: () => {
                setIsSubmitting(false);
                setApproveModalItem(null);
            }
        });
    };

    const handleConfirmReject = () => {
        if (!rejectModalItem || !rejectReason.trim() || rejectReason.trim().length < 5 || isSubmitting) return;
        setIsSubmitting(true);
        router.post(`/absensi/admin/reject/${rejectModalItem.id}`, { catatan_admin: rejectReason.trim() }, {
            onSuccess: () => {
                setRejectModalItem(null);
                setRejectReason('');
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const getStatusPill = (kondisi: string, statusAbsen: string) => {
        if (kondisi === 'sedang_bekerja') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Sedang Bekerja
                </span>
            );
        }
        if (kondisi === 'selesai') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Selesai Shift
                </span>
            );
        }
        if (statusAbsen === 'terlambat') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    Terlambat
                </span>
            );
        }
        if (['izin', 'sakit', 'cuti'].includes(statusAbsen)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {statusAbsen}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase bg-zinc-100 text-zinc-500">
                Belum Hadir
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Panel Admin Presensi Karyawan - Jelang Hari POS" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-zinc-400">Manajemen SDM Cafe</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-mono text-[#78716C] dark:text-zinc-400">{tanggal_id(tanggal)}</span>
                        </div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] dark:text-white mt-0.5">
                            Monitoring Presensi Karyawan
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/absensi/admin/rekap"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#0A0A0A] dark:text-zinc-100 text-xs font-semibold shadow-sm transition"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-[#8B7355] dark:text-amber-400" />
                            <span>Rekap Bulanan &amp; Gaji</span>
                        </Link>
                        <Link
                            href="/absensi/admin/pengaturan"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <Settings className="w-3.5 h-3.5 text-[#8B7355] dark:text-white" />
                            <span>Pengaturan Absensi</span>
                        </Link>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Hadir Hari Ini</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white">{stats.hadir}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">/ {stats.total_karyawan} staff</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">Presensi masuk tercatat</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Terlambat</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#F59E0B] dark:text-amber-400">{stats.terlambat}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">karyawan</span>
                        </div>
                        <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">Lewat jam masuk normal</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Izin / Sakit / Cuti</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#8B7355] dark:text-amber-400">{stats.izin}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">orang</span>
                        </div>
                        <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">Dispensasi resmi</span>
                    </div>

                    <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                        <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Belum Hadir / Alpha</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="font-mono text-2xl font-bold text-[#DC2626] dark:text-rose-400">{stats.alpha}</span>
                            <span className="text-xs text-[#78716C] dark:text-zinc-400">orang</span>
                        </div>
                        <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">Belum ada catatan jam masuk</span>
                    </div>
                </div>

                {/* Section Pending Review Izin */}
                {pendingIzin && pendingIzin.length > 0 && (
                    <div className="bg-amber-50/70 dark:bg-amber-950/20 rounded-[16px] border border-amber-200 dark:border-amber-900/60 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-sm">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>Menunggu Persetujuan Izin ({pendingIzin.length})</span>
                            </div>
                            <span className="text-xs text-amber-700 dark:text-amber-400">Tinjau permohonan staff sebelum tercatat di payroll</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pendingIzin.map((req) => (
                                <div key={req.id} className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm text-xs space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-bold text-[#0A0A0A] dark:text-white block text-sm">{req.user?.name}</span>
                                            <span className="text-[#78716C] dark:text-zinc-400 text-[11px] uppercase font-semibold">
                                                Permohonan {req.tipe} ({req.total_hari} hari: {tanggal_id(req.tanggal_mulai)} s/d {tanggal_id(req.tanggal_selesai)})
                                            </span>
                                        </div>
                                    </div>
                                    <p className="bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded border border-zinc-200 dark:border-zinc-700 text-[#0A0A0A] dark:text-zinc-200">
                                        {req.alasan}
                                    </p>
                                    <div className="flex items-center justify-between pt-1">
                                        {req.lampiran ? (
                                            <a
                                                href={`/storage/${req.lampiran}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[#8B7355] hover:underline font-semibold text-[11px]"
                                            >
                                                Buka Lampiran Bukti
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-[#78716C]">Tanpa lampiran</span>
                                        )}

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRejectModalItem(req);
                                                    setRejectReason('');
                                                }}
                                                className="px-3 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition shadow-xs"
                                            >
                                                Tolak
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setApproveModalItem(req)}
                                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                                            >
                                                Setujui
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Form Bar */}
                <form onSubmit={handleApplyFilter} className="bg-white dark:bg-zinc-900 p-4 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Cari nama karyawan atau email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs text-[#0A0A0A] dark:text-white outline-none focus:border-[#0A0A0A] dark:focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={tanggal}
                            onChange={e => setTanggal(e.target.value)}
                            className="px-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs outline-none font-medium text-[#0A0A0A] dark:text-white"
                        />

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-1.5 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-[10px] text-xs outline-none font-medium text-[#0A0A0A] dark:text-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="hadir">Hadir / Sedang Bekerja</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="izin">Izin / Sakit / Cuti</option>
                            <option value="belum_absen">Belum Hadir</option>
                        </select>

                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* Tabel Realtime Status Karyawan */}
                <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAFAF9] dark:bg-zinc-800/80 border-b border-[#E7E5E4] dark:border-zinc-800 text-[#78716C] dark:text-zinc-400 font-semibold uppercase text-[11px]">
                                <tr>
                                    <th className="px-5 py-3.5">Karyawan</th>
                                    <th className="px-5 py-3.5">Role / Jabatan</th>
                                    <th className="px-5 py-3.5">Status Hari Ini</th>
                                    <th className="px-5 py-3.5">Jam Masuk</th>
                                    <th className="px-5 py-3.5">Jam Pulang</th>
                                    <th className="px-5 py-3.5">Durasi Kerja</th>
                                    <th className="px-5 py-3.5">Swafoto</th>
                                    <th className="px-5 py-3.5 text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7E5E4] dark:divide-zinc-800">
                                {staffStatusList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-[#78716C] dark:text-zinc-500">
                                            Tidak ada data karyawan yang cocok dengan kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    staffStatusList.map((st) => (
                                        <tr key={st.user_id} className="hover:bg-[#FAFAF9] dark:hover:bg-zinc-800/50 transition">
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-[#0A0A0A] dark:text-white block">{st.name}</span>
                                                <span className="text-[11px] text-[#78716C] dark:text-zinc-400">{st.email}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="uppercase text-[10px] font-semibold text-[#8B7355] dark:text-amber-400 px-2 py-0.5 rounded bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700">
                                                    {st.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {getStatusPill(st.kondisi, st.status_absensi)}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                                {st.jam_masuk ? `${st.jam_masuk} WIB` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                                {st.jam_keluar ? `${st.jam_keluar} WIB` : '-'}
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-zinc-900 dark:text-zinc-100">
                                                {st.durasi_kerja || '-'}
                                                {st.lembur_menit > 0 && (
                                                    <span className="block text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                                                        Lembur +{Math.round(st.lembur_menit / 60)}j
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    {st.foto_masuk && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPhoto(st.foto_masuk)}
                                                            title="Swafoto Masuk"
                                                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[#0A0A0A] dark:text-white"
                                                        >
                                                            <Camera className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                                                        </button>
                                                    )}
                                                    {st.foto_keluar && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedPhoto(st.foto_keluar)}
                                                            title="Swafoto Pulang"
                                                            className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[#0A0A0A] dark:text-white"
                                                        >
                                                            <Camera className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />
                                                        </button>
                                                    )}
                                                    {!st.foto_masuk && !st.foto_keluar && (
                                                        <span className="text-[#78716C] dark:text-zinc-500">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <Link
                                                    href={`/absensi/admin/detail/${st.user_id}`}
                                                    className="p-1.5 inline-flex rounded-lg text-[#78716C] dark:text-zinc-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                                    title="Lihat Log Detail Karyawan"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Persetujuan Izin */}
            {approveModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E7E5E4] dark:border-zinc-800">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-[#0A0A0A] dark:text-white">Setujui Permohonan Izin</h4>
                                    <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                        Konfirmasi persetujuan izin/cuti staf
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isSubmitting && setApproveModalItem(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Rincian Permohonan */}
                        <div className="bg-[#FAFAF9] dark:bg-zinc-800/80 rounded-xl p-3.5 border border-[#E7E5E4] dark:border-zinc-700/60 space-y-2.5 text-xs">
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                <span className="text-[#78716C] dark:text-zinc-400">Nama Staf</span>
                                <span className="font-bold text-[#0A0A0A] dark:text-white">{approveModalItem.user?.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                <span className="text-[#78716C] dark:text-zinc-400">Tipe Pengajuan</span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    {approveModalItem.tipe}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                                <span className="text-[#78716C] dark:text-zinc-400">Rentang Waktu</span>
                                <span className="font-medium text-[#0A0A0A] dark:text-white text-right">
                                    {tanggal_id(approveModalItem.tanggal_mulai)} s/d {tanggal_id(approveModalItem.tanggal_selesai)} ({approveModalItem.total_hari} hari)
                                </span>
                            </div>
                            <div>
                                <span className="text-[#78716C] dark:text-zinc-400 block mb-1">Alasan Staf:</span>
                                <p className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 text-[#0A0A0A] dark:text-zinc-200 text-xs">
                                    {approveModalItem.alasan}
                                </p>
                            </div>
                            {approveModalItem.lampiran && (
                                <div className="pt-1">
                                    <a
                                        href={`/storage/${approveModalItem.lampiran}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[#8B7355] dark:text-amber-400 hover:underline font-semibold text-xs inline-flex items-center gap-1"
                                    >
                                        Buka Lampiran Bukti
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                            Persetujuan ini akan otomatis mencatat status <strong>{approveModalItem.tipe}</strong> pada riwayat presensi harian staf dan dihitung sah pada rekap payroll.
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setApproveModalItem(null)}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmApprove}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyetujui...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ya, Setujui Permohonan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Alasan Penolakan Izin */}
            {rejectModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-[#E7E5E4] dark:border-zinc-800">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-[#0A0A0A] dark:text-white">Tolak Pengajuan Izin</h4>
                                    <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                        Permohonan dari <strong>{rejectModalItem.user?.name}</strong>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isSubmitting && setRejectModalItem(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Rincian Permohonan */}
                        <div className="bg-[#FAFAF9] dark:bg-zinc-800/80 rounded-xl p-3 border border-[#E7E5E4] dark:border-zinc-700/60 space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-[#78716C] dark:text-zinc-400">Tipe & Durasi:</span>
                                <span className="font-semibold text-[#0A0A0A] dark:text-white uppercase">
                                    {rejectModalItem.tipe} ({rejectModalItem.total_hari} hari)
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-[#78716C] dark:text-zinc-400">
                                <span>Periode:</span>
                                <span>{tanggal_id(rejectModalItem.tanggal_mulai)} s/d {tanggal_id(rejectModalItem.tanggal_selesai)}</span>
                            </div>
                            <div className="pt-1 text-[11px]">
                                <span className="text-[#78716C] dark:text-zinc-400">Alasan diajukan: </span>
                                <span className="italic text-[#0A0A0A] dark:text-zinc-300">"{rejectModalItem.alasan}"</span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[#0A0A0A] dark:text-white">
                                Alasan Penolakan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Tulis alasan penolakan (contoh: Kuota cuti habis / kebutuhan shift mendesak)..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                className="w-full p-3 text-xs bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 text-[#0A0A0A] dark:text-white rounded-xl outline-none focus:border-red-500 transition"
                            />
                            <div className="flex justify-between items-center text-[11px]">
                                <span className={rejectReason.trim().length >= 5 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-[#78716C] dark:text-zinc-400"}>
                                    Wajib minimal 5 karakter ({rejectReason.trim().length}/5)
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setRejectModalItem(null);
                                    setRejectReason('');
                                }}
                                disabled={isSubmitting}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#78716C] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmReject}
                                disabled={!rejectReason.trim() || rejectReason.trim().length < 5 || isSubmitting}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>Konfirmasi Tolak</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Foto Preview */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-2 max-w-md w-full overflow-hidden shadow-2xl relative border border-transparent dark:border-zinc-800" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <img src={selectedPhoto} alt="Swafoto Absensi" className="w-full h-auto rounded-xl object-contain max-h-[80vh]" />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
