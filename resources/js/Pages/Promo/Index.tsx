import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import { 
    Plus, Clock, Tag, X, Calendar, Sparkles, CheckCircle2, 
    ToggleLeft, ToggleRight, Edit2, Trash2, Search, AlertCircle,
    Check, Percent, Flame, Layers
} from 'lucide-react';

interface PromoItem {
    id: number;
    nama: string;
    deskripsi?: string | null;
    tipe: string;
    nilai: number;
    jam_mulai?: string | null;
    jam_selesai?: string | null;
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    is_aktif?: boolean;
    is_active?: boolean;
}

interface Props {
    promos: {
        data: PromoItem[];
        links: any[];
        total?: number;
    } | PromoItem[];
    filters?: { search?: string };
}

export default function Index({ promos, filters = {} }: Props) {
    const promoList: PromoItem[] = Array.isArray(promos) ? promos : (promos?.data || []);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'aktif' | 'happy_hour' | 'nonaktif'>('all');

    // Create & Edit Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<PromoItem | null>(null);

    // Delete Modal State
    const [deleteTarget, setDeleteTarget] = useState<PromoItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const todayStr = new Date().toISOString().split('T')[0];
    const nextMonthStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const { data, setData, post, put, reset, processing, errors } = useForm({
        nama: '',
        deskripsi: '',
        tipe: 'diskon_persen',
        nilai: 10,
        tanggal_mulai: todayStr,
        tanggal_selesai: nextMonthStr,
        jam_mulai: '15:00',
        jam_selesai: '18:00',
        is_aktif: true,
    });

    // Keyboard Shortcuts (Esc to close, Enter to confirm/submit)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (deleteTarget) setDeleteTarget(null);
                else if (isFormModalOpen) {
                    setIsFormModalOpen(false);
                    setEditingPromo(null);
                }
            } else if (e.key === 'Enter') {
                if (deleteTarget && !isDeleting) {
                    executeDelete();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteTarget, isFormModalOpen, isDeleting]);

    const openCreateModal = () => {
        reset();
        setData({
            nama: '',
            deskripsi: '',
            tipe: 'diskon_persen',
            nilai: 10,
            tanggal_mulai: todayStr,
            tanggal_selesai: nextMonthStr,
            jam_mulai: '15:00',
            jam_selesai: '18:00',
            is_aktif: true,
        });
        setEditingPromo(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (pr: PromoItem) => {
        setEditingPromo(pr);
        const isActive = pr.is_aktif !== undefined ? pr.is_aktif : (pr.is_active !== undefined ? pr.is_active : true);
        setData({
            nama: pr.nama || '',
            deskripsi: pr.deskripsi || '',
            tipe: pr.tipe || 'diskon_persen',
            nilai: pr.nilai || 0,
            tanggal_mulai: pr.tanggal_mulai ? pr.tanggal_mulai.substring(0, 10) : todayStr,
            tanggal_selesai: pr.tanggal_selesai ? pr.tanggal_selesai.substring(0, 10) : nextMonthStr,
            jam_mulai: pr.jam_mulai ? pr.jam_mulai.substring(0, 5) : '15:00',
            jam_selesai: pr.jam_selesai ? pr.jam_selesai.substring(0, 5) : '18:00',
            is_aktif: Boolean(isActive),
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPromo) {
            put(`/promo/${editingPromo.id}`, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingPromo(null);
                    reset();
                },
            });
        } else {
            post('/promo', {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    reset();
                },
            });
        }
    };

    const toggleStatus = (id: number) => {
        router.patch(`/promo/${id}/toggle`, {}, { preserveState: true, preserveScroll: true });
    };

    const executeDelete = () => {
        if (!deleteTarget || isDeleting) return;
        setIsDeleting(true);
        router.delete(`/promo/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setDeleteTarget(null);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    // Filter Logic
    const filteredPromos = promoList.filter((p) => {
        const isActive = p.is_aktif !== undefined ? p.is_aktif : (p.is_active !== undefined ? p.is_active : true);
        
        // 1. Tab filter
        if (activeFilterTab === 'aktif' && !isActive) return false;
        if (activeFilterTab === 'nonaktif' && isActive) return false;
        if (activeFilterTab === 'happy_hour' && (!p.jam_mulai || !p.jam_selesai)) return false;

        // 2. Search query
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = p.nama.toLowerCase().includes(q);
            const matchDesc = p.deskripsi?.toLowerCase().includes(q);
            if (!matchName && !matchDesc) return false;
        }

        return true;
    });

    // KPI Metrics
    const totalPromo = promoList.length;
    const totalAktif = promoList.filter(p => (p.is_aktif !== undefined ? p.is_aktif : p.is_active)).length;
    const totalHappyHour = promoList.filter(p => p.jam_mulai && p.jam_selesai).length;

    return (
        <AppLayout>
            <Head title="Promo Otomatis & Happy Hour - Jelang Hari" />

            {/* ── Top Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                        Promo Otomatis &amp; Happy Hour
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Diskon otomatis berdasarkan jam aktif, happy hour sore, dan periode promo cafe.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 transition text-xs font-bold shadow-xs active:scale-95"
                >
                    <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Buat Promo Baru</span>
                </button>
            </div>

            {/* ── KPI Summary Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Total Promo</span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 block">{totalPromo} Program</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Promo Berjalan</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{totalAktif} Aktif</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Happy Hour Sore</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{totalHappyHour} Jadwal</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Otomasi Kasir</span>
                        <span className="text-xs font-black text-zinc-900 dark:text-white mt-1 block">Auto-Sync POS</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Percent className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* ── Search & Filter Tabs ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari promo berdasarkan nama atau deskripsi..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-600 shadow-xs transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                    {[
                        { key: 'all', label: 'Semua Promo' },
                        { key: 'aktif', label: 'Sedang Aktif' },
                        { key: 'happy_hour', label: 'Happy Hour' },
                        { key: 'nonaktif', label: 'Nonaktif' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveFilterTab(tab.key as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                                activeFilterTab === tab.key
                                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Grid Promo Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromos.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-zinc-400 dark:text-zinc-500 text-xs bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800">
                        Tidak ada promo otomatis yang ditemukan.
                    </div>
                ) : (
                    filteredPromos.map((pr) => {
                        const isPersen = pr.tipe === 'diskon_persen' || pr.tipe === 'persen';
                        const displayVal = isPersen ? `${pr.nilai}%` : rupiah(pr.nilai);
                        const isActive = pr.is_aktif !== undefined ? pr.is_aktif : (pr.is_active !== undefined ? pr.is_active : true);

                        return (
                            <div 
                                key={pr.id} 
                                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base text-zinc-950 dark:text-white leading-tight">
                                                    {pr.nama}
                                                </h3>
                                                <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                                                    {isPersen ? 'Diskon Persen' : 'Diskon Nominal'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="font-mono font-black text-xs bg-zinc-950 text-emerald-400 dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1 rounded-full shadow-xs">
                                            {displayVal}
                                        </span>
                                    </div>

                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                                        {pr.deskripsi || 'Promo spesial Jelang Hari Coffee'}
                                    </p>

                                    {/* Happy Hour Timeslot */}
                                    {pr.jam_mulai && pr.jam_selesai && (
                                        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-mono font-bold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-xl w-fit border border-amber-200/60 dark:border-amber-800/60 mb-2">
                                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                            <span>{pr.jam_mulai.substring(0, 5)} - {pr.jam_selesai.substring(0, 5)} WIB</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                                        <Calendar className="w-3 h-3 text-zinc-400" />
                                        <span>
                                            {pr.tanggal_mulai ? pr.tanggal_mulai.substring(0, 10) : 'Sekarang'} s/d {pr.tanggal_selesai ? pr.tanggal_selesai.substring(0, 10) : '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer & Action Buttons */}
                                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(pr.id)}
                                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] transition border ${
                                            isActive 
                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' 
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                                        }`}
                                    >
                                        {isActive ? 'Aktif' : 'Nonaktif'}
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(pr)}
                                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                                            title="Edit Promo"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(pr)}
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition"
                                            title="Hapus Promo"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── MODAL POP-UP BUAT & EDIT PROMO (ESC & ENTER ACTIVE) ── */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-extrabold text-base text-zinc-950 dark:text-white">
                                    {editingPromo ? 'Edit Promo Otomatis' : 'Buat Promo Baru'}
                                </h3>
                                <p className="text-[10px] text-zinc-400">
                                    Diskon langsung diterapkan di keranjang POS Kasir
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsFormModalOpen(false)} 
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Promo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Happy Hour Sore"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
                                {errors.nama && <span className="text-[10px] text-rose-500">{errors.nama}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Deskripsi Singkat
                                </label>
                                <input
                                    type="text"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Diskon khusus kopi jam 15:00 - 18:00"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Tipe Diskon
                                    </label>
                                    <select
                                        value={data.tipe}
                                        onChange={(e) => setData('tipe', e.target.value)}
                                        className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    >
                                        <option value="diskon_persen">Persentase (%)</option>
                                        <option value="diskon_nominal">Nominal (Rp)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Nilai Potongan
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={1}
                                        value={data.nilai}
                                        onChange={(e) => setData('nilai', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Jam Mulai (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        value={data.jam_mulai}
                                        onChange={(e) => setData('jam_mulai', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Jam Selesai (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        value={data.jam_selesai}
                                        onChange={(e) => setData('jam_selesai', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Tanggal Mulai
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={data.tanggal_mulai}
                                        onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Tanggal Berakhir
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={data.tanggal_selesai}
                                        onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                        className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_aktif"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                                />
                                <label htmlFor="is_aktif" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                    Aktifkan promo ini sekarang di POS Kasir
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-3.5 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                >
                                    Batal (Esc)
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition shadow-xs disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : (editingPromo ? 'Simpan Perubahan (Enter)' : 'Simpan Promo (Enter)')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL POP-UP KONFIRMASI HAPUS PROMO ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                        Hapus Promo
                                    </h3>
                                    <p className="text-[10px] text-zinc-400">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Apakah Anda yakin ingin menghapus promo <b>{deleteTarget.nama}</b>? Promo ini akan langsung dinonaktifkan dari keranjang checkout kasir.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Batal (Esc)
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={executeDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Promo (Enter)'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
