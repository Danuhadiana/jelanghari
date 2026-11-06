import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    CalendarRange,
    Clock,
    Users,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Search,
    Filter,
    Plus,
    Edit3,
    Trash2,
    Settings,
    Phone,
    MessageSquare,
    Save,
    X,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    Sparkles,
    ShieldAlert,
    Eye,
    Printer,
    ExternalLink
} from 'lucide-react';

interface ReservasiItem {
    id: number;
    user_id: number | null;
    nama_pemesan: string;
    telepon: string;
    tanggal: string;
    jam: string;
    durasi_jam: number;
    jumlah_orang: number;
    meja_id: number | null;
    status: 'menunggu' | 'dikonfirmasi' | 'selesai' | 'dibatalkan';
    dp_nominal: number;
    catatan: string | null;
    catatan_admin: string | null;
    created_at: string;
    meja?: {
        id: number;
        nomor: string;
        area: string;
        kapasitas: number;
    } | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface MejaItem {
    id: number;
    nomor: string;
    area: string;
    kapasitas: number;
    status: string;
}

interface Props {
    reservasis: {
        data: ReservasiItem[];
        current_page: number;
        last_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats: {
        total: number;
        menunggu: number;
        dikonfirmasi: number;
        selesai: number;
        dibatalkan: number;
        hari_ini: number;
    };
    mejas: MejaItem[];
    settings: {
        reservasi_aktif: string;
        reservasi_jam_buka: string;
        reservasi_jam_tutup: string;
        reservasi_min_dp: number;
        reservasi_maks_durasi: number;
        reservasi_syarat: string;
        reservasi_wa_admin: string;
    };
    filters: {
        status: string;
        tanggal: string;
        search: string;
    };
}

export default function Index({ reservasis, stats, mejas, settings, filters }: Props) {
    // Filter State
    const [statusFilter, setStatusFilter] = useState(filters.status || 'semua');
    const [tanggalFilter, setTanggalFilter] = useState(filters.tanggal || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Modals
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReservasi, setSelectedReservasi] = useState<ReservasiItem | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDetailReservasi, setSelectedDetailReservasi] = useState<ReservasiItem | null>(null);

    const handleOpenDetail = (res: ReservasiItem) => {
        setSelectedDetailReservasi(res);
        setIsDetailModalOpen(true);
    };

    const getWhatsAppChatUrl = (res: ReservasiItem) => {
        const cleanPhone = res.telepon.replace(/\D/g, '');
        const targetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
        const dateFormatted = res.tanggal ? res.tanggal.split('T')[0] : '';
        const text = encodeURIComponent(
            `Halo Kak ${res.nama_pemesan},\n` +
            `Kami dari manajemen Jelang Hari Coffee & Workspace ingin mengonfirmasi reservasi meja Anda:\n` +
            `- ID Booking: #RSV-${res.id}\n` +
            `- Tanggal: ${dateFormatted}\n` +
            `- Jam: ${res.jam} WIB (${res.durasi_jam} Jam)\n` +
            `- Meja: ${res.meja ? `Meja ${res.meja.nomor} (${res.meja.area})` : 'Akan ditentukan saat hadir'}\n` +
            `- Tamu: ${res.jumlah_orang} Orang\n` +
            `- Status: ${res.status.toUpperCase()}\n\n` +
            `Apakah ada catatan tambahan yang perlu kami persiapkan? Terima kasih!`
        );
        return `https://wa.me/${targetPhone}?text=${text}`;
    };

    // Form Pengaturan Reservasi
    const {
        data: settingsForm,
        setData: setSettingsForm,
        post: postSettings,
        processing: settingsProcessing
    } = useForm({
        reservasi_aktif: settings.reservasi_aktif || '1',
        reservasi_jam_buka: settings.reservasi_jam_buka || '09:00',
        reservasi_jam_tutup: settings.reservasi_jam_tutup || '22:00',
        reservasi_min_dp: settings.reservasi_min_dp || 0,
        reservasi_maks_durasi: settings.reservasi_maks_durasi || 2,
        reservasi_syarat: settings.reservasi_syarat || '',
        reservasi_wa_admin: settings.reservasi_wa_admin || '',
    });

    // Form Edit / Tambah Reservasi
    const {
        data: reservasiForm,
        setData: setReservasiForm,
        post: postReservasi,
        put: putReservasi,
        processing: reservasiProcessing,
        reset: resetReservasiForm,
        errors: reservasiErrors
    } = useForm({
        nama_pemesan: '',
        telepon: '',
        tanggal: new Date().toISOString().split('T')[0],
        jam: '14:00',
        durasi_jam: 2,
        jumlah_orang: 2,
        meja_id: '',
        status: 'menunggu',
        dp_nominal: 0,
        catatan: '',
        catatan_admin: '',
    });

    const handleFilterChange = (newStatus?: string, newTanggal?: string, newSearch?: string) => {
        router.get(
            '/reservasi',
            {
                status: newStatus !== undefined ? newStatus : statusFilter,
                tanggal: newTanggal !== undefined ? newTanggal : tanggalFilter,
                search: newSearch !== undefined ? newSearch : searchQuery,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleOpenEdit = (res: ReservasiItem) => {
        setSelectedReservasi(res);
        setReservasiForm({
            nama_pemesan: res.nama_pemesan,
            telepon: res.telepon,
            tanggal: res.tanggal ? res.tanggal.split('T')[0] : '',
            jam: res.jam,
            durasi_jam: res.durasi_jam,
            jumlah_orang: res.jumlah_orang,
            meja_id: res.meja_id ? String(res.meja_id) : '',
            status: res.status,
            dp_nominal: res.dp_nominal || 0,
            catatan: res.catatan || '',
            catatan_admin: res.catatan_admin || '',
        });
        setIsEditModalOpen(true);
    };

    const handleOpenCreate = () => {
        resetReservasiForm();
        setReservasiForm({
            nama_pemesan: '',
            telepon: '',
            tanggal: new Date().toISOString().split('T')[0],
            jam: '13:00',
            durasi_jam: 2,
            jumlah_orang: 2,
            meja_id: mejas[0] ? String(mejas[0].id) : '',
            status: 'dikonfirmasi',
            dp_nominal: 0,
            catatan: '',
            catatan_admin: '',
        });
        setIsCreateModalOpen(true);
    };

    const handleSubmitSettings = (e: React.FormEvent) => {
        e.preventDefault();
        postSettings('/reservasi/pengaturan', {
            onSuccess: () => setIsSettingsOpen(false)
        });
    };

    const handleSubmitReservasi = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedReservasi) {
            putReservasi(`/reservasi/${selectedReservasi.id}`, {
                onSuccess: () => setIsEditModalOpen(false)
            });
        } else {
            postReservasi('/reservasi', {
                onSuccess: () => setIsCreateModalOpen(false)
            });
        }
    };

    const handleQuickStatus = (id: number, status: string) => {
        router.patch(`/reservasi/${id}/status`, { status }, { preserveScroll: true });
    };

    const handleDelete = (id: number, nama: string) => {
        if (confirm(`Yakin ingin menghapus data reservasi atas nama ${nama}?`)) {
            router.delete(`/reservasi/${id}`, { preserveScroll: true });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'dikonfirmasi':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Dikonfirmasi</span>
                    </span>
                );
            case 'menunggu':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Menunggu</span>
                    </span>
                );
            case 'selesai':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                    </span>
                );
            case 'dibatalkan':
                return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Dibatalkan</span>
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Reservasi Meja & Ruang Workspace" />

            <div className="space-y-6">
                {/* ── 1. HEADER & ACTION BUTTONS ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                                Sistem Reservasi Meja &amp; Workspace
                            </h1>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                settings.reservasi_aktif === '1'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                            }`}>
                                {settings.reservasi_aktif === '1' ? 'Sistem Aktif' : 'Sistem Ditutup'}
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Kelola jadwal booking meja pelanggan, konfirmasi status, atur uang muka (DP), dan edit aturan reservasi kafe.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-2 transition active:scale-95 border border-zinc-200 dark:border-zinc-700"
                        >
                            <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Edit Aturan Reservasi</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Reservasi</span>
                        </button>
                    </div>
                </div>

                {/* ── 2. STATS CARDS ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Menunggu</span>
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                            {stats.menunggu}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Perlu konfirmasi owner</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Dikonfirmasi</span>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                            {stats.dikonfirmasi}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Meja telah disiapkan</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Hari Ini</span>
                            <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                            {stats.hari_ini}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Jadwal kedatangan hari ini</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Selesai</span>
                            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
                            {stats.selesai}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Reservasi rampung</p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs col-span-2 sm:col-span-4 lg:col-span-1">
                        <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider">Total Reservasi</span>
                            <CalendarRange className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <div className="text-2xl font-black text-zinc-950 dark:text-white font-mono">
                            {stats.total}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1">Seluruh riwayat booking</p>
                    </div>
                </div>

                {/* ── 3. FILTER & SEARCH BAR ── */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                        {['semua', 'menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(st);
                                    handleFilterChange(st, undefined, undefined);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition capitalize ${
                                    statusFilter === st
                                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                        : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                                }`}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Tanggal Filter */}
                        <div className="relative">
                            <input
                                type="date"
                                value={tanggalFilter}
                                onChange={(e) => {
                                    setTanggalFilter(e.target.value);
                                    handleFilterChange(undefined, e.target.value, undefined);
                                }}
                                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-60">
                            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari nama atau no. WA..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleFilterChange(undefined, undefined, searchQuery);
                                }}
                                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        {(statusFilter !== 'semua' || tanggalFilter || searchQuery) && (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter('semua');
                                    setTanggalFilter('');
                                    setSearchQuery('');
                                    router.get('/reservasi', {}, { replace: true });
                                }}
                                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                                title="Reset Filter"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── 4. TABLE RESERVASI ── */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <tr>
                                    <th className="py-3 px-4">Jadwal &amp; Tamu</th>
                                    <th className="py-3 px-4">Nomor Meja</th>
                                    <th className="py-3 px-4">Durasi &amp; Orang</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">DP (Uang Muka)</th>
                                    <th className="py-3 px-4">Catatan</th>
                                    <th className="py-3 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {reservasis.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                                            Tidak ada data reservasi yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    reservasis.data.map((res) => (
                                        <tr key={res.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetail(res)}
                                                    className="font-bold text-zinc-950 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition flex items-center gap-1 group"
                                                    title="Lihat Detail Lengkap Reservasi"
                                                >
                                                    <span>{res.nama_pemesan}</span>
                                                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                                                </button>
                                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    <span className="font-mono">{res.jam} WIB</span>
                                                    <span>&bull;</span>
                                                    <span>{res.tanggal ? res.tanggal.split('T')[0] : '-'}</span>
                                                </div>
                                                <a
                                                    href={`https://wa.me/${res.telepon.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium hover:underline mt-0.5"
                                                >
                                                    <Phone className="w-3 h-3" />
                                                    <span>{res.telepon}</span>
                                                </a>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {res.meja ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white">
                                                        <span>Meja {res.meja.nomor}</span>
                                                        <span className="text-[10px] text-zinc-500 font-normal">({res.meja.area})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-zinc-400 italic">Belum ditentukan</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-200">
                                                    {res.jumlah_orang} Orang
                                                </div>
                                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                    Durasi: {res.durasi_jam} Jam
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {getStatusBadge(res.status)}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                                                {res.dp_nominal > 0 ? rupiah(res.dp_nominal) : <span className="text-zinc-400 font-normal">Rp 0 (Tanpa DP)</span>}
                                            </td>

                                            <td className="py-3.5 px-4 max-w-xs">
                                                {res.catatan && (
                                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate" title={res.catatan}>
                                                        Tamu: "{res.catatan}"
                                                    </p>
                                                )}
                                                {res.catatan_admin && (
                                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate mt-0.5" title={res.catatan_admin}>
                                                        Admin: {res.catatan_admin}
                                                    </p>
                                                )}
                                                {!res.catatan && !res.catatan_admin && (
                                                    <span className="text-zinc-400 italic">-</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Tombol Lihat Detail Pop-up */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetail(res)}
                                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 transition"
                                                        title="Lihat Detail Lengkap Reservasi"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {res.status === 'menunggu' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickStatus(res.id, 'dikonfirmasi')}
                                                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 transition"
                                                            title="Konfirmasi Reservasi"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {res.status === 'dikonfirmasi' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickStatus(res.id, 'selesai')}
                                                            className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-300 transition"
                                                            title="Tandai Selesai"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {res.status !== 'dibatalkan' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuickStatus(res.id, 'dibatalkan')}
                                                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-300 transition"
                                                            title="Batalkan Reservasi"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(res)}
                                                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition"
                                                        title="Edit Detail"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(res.id, res.nama_pemesan)}
                                                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                                                        title="Hapus Reservasi"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {reservasis.last_page > 1 && (
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">
                                Total {reservasis.total} reservasi &bull; Halaman {reservasis.current_page} dari {reservasis.last_page}
                            </span>
                            <div className="flex items-center gap-1">
                                {reservasis.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                            link.active
                                                ? 'bg-zinc-950 dark:bg-emerald-600 text-white'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ════ MODAL EDIT ATURAN SISTEM RESERVASI (OWNER) ════ */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                                        Konfigurasi Aturan Reservasi
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Pengaturan jam operasional, status booking, dan syarat uang muka (DP)
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSettingsOpen(false)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitSettings} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                            {/* Toggle Sistem Aktif / Tutup */}
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-zinc-900 dark:text-white block">Status Sistem Reservasi</span>
                                    <span className="text-[11px] text-zinc-500">Buka atau tutup sementara pengajuan reservasi dari web.</span>
                                </div>
                                <select
                                    value={settingsForm.reservasi_aktif}
                                    onChange={(e) => setSettingsForm('reservasi_aktif', e.target.value)}
                                    className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-xl font-bold text-xs"
                                >
                                    <option value="1">Buka (Aktif)</option>
                                    <option value="0">Tutup Sementara</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Jam Mulai Reservasi</label>
                                    <input
                                        type="time"
                                        value={settingsForm.reservasi_jam_buka}
                                        onChange={(e) => setSettingsForm('reservasi_jam_buka', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Jam Selesai Reservasi</label>
                                    <input
                                        type="time"
                                        value={settingsForm.reservasi_jam_tutup}
                                        onChange={(e) => setSettingsForm('reservasi_jam_tutup', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Minimal DP (Rp)</label>
                                    <input
                                        type="number"
                                        step="5000"
                                        value={settingsForm.reservasi_min_dp}
                                        onChange={(e) => setSettingsForm('reservasi_min_dp', Number(e.target.value))}
                                        placeholder="0 jika gratis"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Maksimal Durasi Sewa (Jam)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="12"
                                        value={settingsForm.reservasi_maks_durasi}
                                        onChange={(e) => setSettingsForm('reservasi_maks_durasi', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">No. WhatsApp Admin Konfirmasi</label>
                                <input
                                    type="text"
                                    value={settingsForm.reservasi_wa_admin}
                                    onChange={(e) => setSettingsForm('reservasi_wa_admin', e.target.value)}
                                    placeholder="0821-1594-1156"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div>
                                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Syarat &amp; Kebijakan Booking Meja</label>
                                <textarea
                                    rows={3}
                                    value={settingsForm.reservasi_syarat}
                                    onChange={(e) => setSettingsForm('reservasi_syarat', e.target.value)}
                                    placeholder="Contoh: Harap hadir tepat waktu. Toleransi keterlambatan maksimal 20 menit..."
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    required
                                />
                            </div>

                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSettingsOpen(false)}
                                    className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={settingsProcessing}
                                    className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Aturan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ MODAL TAMBAH / EDIT RESERVASI MEJA ════ */}
            {(isEditModalOpen || isCreateModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center">
                                    <CalendarRange className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                                        {selectedReservasi ? 'Edit Reservasi Meja' : 'Tambah Reservasi Baru'}
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {selectedReservasi ? `Ubah detail jadwal ${selectedReservasi.nama_pemesan}` : 'Catat booking meja manual dari WhatsApp / Tamu'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setIsCreateModalOpen(false);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReservasi} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nama Pemesan</label>
                                    <input
                                        type="text"
                                        value={reservasiForm.nama_pemesan}
                                        onChange={(e) => setReservasiForm('nama_pemesan', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                    {reservasiErrors.nama_pemesan && <p className="text-rose-500 text-[10px] mt-0.5">{reservasiErrors.nama_pemesan}</p>}
                                </div>
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">No. WhatsApp</label>
                                    <input
                                        type="text"
                                        value={reservasiForm.telepon}
                                        onChange={(e) => setReservasiForm('telepon', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Tanggal Kedatangan</label>
                                    <input
                                        type="date"
                                        value={reservasiForm.tanggal}
                                        onChange={(e) => setReservasiForm('tanggal', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Jam Kedatangan</label>
                                    <input
                                        type="time"
                                        value={reservasiForm.jam}
                                        onChange={(e) => setReservasiForm('jam', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Pilih Meja</label>
                                    <select
                                        value={reservasiForm.meja_id}
                                        onChange={(e) => setReservasiForm('meja_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    >
                                        <option value="">-- Bebas / Tentukan Nanti --</option>
                                        {mejas.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                Meja {m.nomor} ({m.area} - {m.kapasitas} Org)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Jumlah Orang</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={reservasiForm.jumlah_orang}
                                        onChange={(e) => setReservasiForm('jumlah_orang', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Durasi (Jam)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={reservasiForm.durasi_jam}
                                        onChange={(e) => setReservasiForm('durasi_jam', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Status Reservasi</label>
                                    <select
                                        value={reservasiForm.status}
                                        onChange={(e) => setReservasiForm('status', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                                    >
                                        <option value="menunggu">Menunggu Konfirmasi</option>
                                        <option value="dikonfirmasi">Dikonfirmasi (Aktif)</option>
                                        <option value="selesai">Selesai</option>
                                        <option value="dibatalkan">Dibatalkan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Nominal DP / Uang Muka (Rp)</label>
                                    <input
                                        type="number"
                                        step="5000"
                                        value={reservasiForm.dp_nominal}
                                        onChange={(e) => setReservasiForm('dp_nominal', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Catatan Tamu</label>
                                <textarea
                                    rows={2}
                                    value={reservasiForm.catatan}
                                    onChange={(e) => setReservasiForm('catatan', e.target.value)}
                                    placeholder="Permintaan khusus dari tamu (misal: colokan listrik banyak, area non-smoking)..."
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Catatan Admin / Kasir</label>
                                <textarea
                                    rows={2}
                                    value={reservasiForm.catatan_admin}
                                    onChange={(e) => setReservasiForm('catatan_admin', e.target.value)}
                                    placeholder="Catatan internal tim toko (misal: sudah bayar DP via transfer BCA)..."
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                            </div>

                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setIsCreateModalOpen(false);
                                    }}
                                    className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={reservasiProcessing}
                                    className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{selectedReservasi ? 'Simpan Perubahan' : 'Buat Reservasi'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════ MODAL POP-UP DETAIL RESERVASI MEJA ════ */}
            {isDetailModalOpen && selectedDetailReservasi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
                        {/* Header */}
                        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                    <CalendarRange className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                            Detail Reservasi #{selectedDetailReservasi.id}
                                        </h3>
                                        {getStatusBadge(selectedDetailReservasi.status)}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Dibuat pada {selectedDetailReservasi.created_at ? new Date(selectedDetailReservasi.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                            {/* Info Tamu */}
                            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                                    Informasi Pemesan
                                </span>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-950 dark:text-white">
                                            {selectedDetailReservasi.nama_pemesan}
                                        </p>
                                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                                            {selectedDetailReservasi.telepon}
                                        </p>
                                    </div>
                                    <a
                                        href={getWhatsAppChatUrl(selectedDetailReservasi)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Chat WhatsApp</span>
                                    </a>
                                </div>
                            </div>

                            {/* Grid Detail Reservasi */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Tanggal &amp; Jam</span>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-0.5">
                                        {selectedDetailReservasi.tanggal ? selectedDetailReservasi.tanggal.split('T')[0] : '-'}
                                    </p>
                                    <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                        Pukul {selectedDetailReservasi.jam} WIB ({selectedDetailReservasi.durasi_jam} Jam)
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Lokasi Meja</span>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-0.5">
                                        {selectedDetailReservasi.meja ? `Meja ${selectedDetailReservasi.meja.nomor}` : 'Belum Ditentukan'}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        {selectedDetailReservasi.meja ? `${selectedDetailReservasi.meja.area} · Kapasitas ${selectedDetailReservasi.meja.kapasitas} Tamu` : 'Bebas'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Jumlah Tamu</span>
                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-0.5">
                                        {selectedDetailReservasi.jumlah_orang} Orang
                                    </p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        Kebutuhan kursi disesuaikan
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Uang Muka (DP)</span>
                                    <p className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs mt-0.5">
                                        {selectedDetailReservasi.dp_nominal > 0 ? rupiah(selectedDetailReservasi.dp_nominal) : 'Rp 0 (Tanpa DP)'}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        {selectedDetailReservasi.dp_nominal > 0 ? 'Sudah disetor' : 'Gratis booking'}
                                    </p>
                                </div>
                            </div>

                            {/* Catatan Tamu */}
                            {selectedDetailReservasi.catatan && (
                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-1">
                                        Catatan &amp; Permintaan Khusus Tamu
                                    </span>
                                    <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed italic">
                                        "{selectedDetailReservasi.catatan}"
                                    </p>
                                </div>
                            )}

                            {/* Catatan Admin Internal */}
                            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-1">
                                    Catatan Internal Toko / Kasir
                                </span>
                                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                    {selectedDetailReservasi.catatan_admin || 'Belum ada catatan internal.'}
                                </p>
                            </div>

                            {/* Quick Status Control Bar */}
                            <div className="pt-2">
                                <span className="text-[10px] text-zinc-500 block uppercase font-semibold mb-2">
                                    Ubah Status Reservasi Cepat
                                </span>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleQuickStatus(selectedDetailReservasi.id, 'dikonfirmasi');
                                            setSelectedDetailReservasi({ ...selectedDetailReservasi, status: 'dikonfirmasi' });
                                        }}
                                        className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition border flex items-center justify-center gap-1.5 ${
                                            selectedDetailReservasi.status === 'dikonfirmasi'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Konfirmasi</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleQuickStatus(selectedDetailReservasi.id, 'selesai');
                                            setSelectedDetailReservasi({ ...selectedDetailReservasi, status: 'selesai' });
                                        }}
                                        className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition border flex items-center justify-center gap-1.5 ${
                                            selectedDetailReservasi.status === 'selesai'
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Selesai</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleQuickStatus(selectedDetailReservasi.id, 'dibatalkan');
                                            setSelectedDetailReservasi({ ...selectedDetailReservasi, status: 'dibatalkan' });
                                        }}
                                        className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition border flex items-center justify-center gap-1.5 ${
                                            selectedDetailReservasi.status === 'dibatalkan'
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                                        }`}
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Batalkan</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal Actions */}
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-900/50">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDetailModalOpen(false);
                                    handleOpenEdit(selectedDetailReservasi);
                                }}
                                className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition flex items-center gap-1.5"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Formulir</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold text-xs transition"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
