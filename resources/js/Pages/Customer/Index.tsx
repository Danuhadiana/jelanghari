import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import { 
    Plus, X, Edit2, Trash2, Search, Award, Users, 
    Sparkles, Phone, Mail, AlertCircle, Check, Coins, 
    Clock, TrendingUp, ChevronRight
} from 'lucide-react';

interface CustomerItem {
    id: number;
    nama: string;
    telepon: string;
    email?: string | null;
    poin: number;
    tier: string;
    total_belanja: number;
    total_transaksi?: number;
    kunjungan_count?: number;
    catatan?: string | null;
    created_at?: string;
}

interface Counts {
    total: number;
    classic: number;
    silver: number;
    gold: number;
    total_poin: number;
    total_belanja: number;
}

interface Props {
    customers: {
        data: CustomerItem[];
        links: any[];
        total?: number;
    };
    counts?: Counts;
    kategori?: string;
    filters?: { search?: string; kategori?: string };
}

export default function Index({ customers, counts, kategori = 'all', filters = {} }: Props) {
    const customerList: CustomerItem[] = Array.isArray(customers?.data) ? customers.data : [];
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [currentCategory, setCurrentCategory] = useState<string>(kategori || 'all');

    // Create & Edit Modal State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

    // Delete Modal State
    const [deleteTarget, setDeleteTarget] = useState<CustomerItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { data, setData, post, put, reset, processing, errors } = useForm({
        nama: '',
        telepon: '',
        email: '',
        poin: 25,
        catatan: '',
    });

    // Keyboard Shortcuts (Esc to close, Enter to submit)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (deleteTarget) setDeleteTarget(null);
                else if (isFormModalOpen) {
                    setIsFormModalOpen(false);
                    setEditingCustomer(null);
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

    const handleSwitchCategory = (catKey: string) => {
        setCurrentCategory(catKey);
        router.get('/customer', {
            kategori: catKey,
            search: searchQuery,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/customer', {
            kategori: currentCategory,
            search: searchQuery,
        }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        setData({
            nama: '',
            telepon: '',
            email: '',
            poin: 25,
            catatan: '',
        });
        setEditingCustomer(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (c: CustomerItem) => {
        setEditingCustomer(c);
        setData({
            nama: c.nama || '',
            telepon: c.telepon || '',
            email: c.email || '',
            poin: c.poin || 0,
            catatan: c.catatan || '',
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCustomer) {
            put(`/customer/${editingCustomer.id}`, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingCustomer(null);
                    reset();
                },
            });
        } else {
            post('/customer', {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    reset();
                },
            });
        }
    };

    const executeDelete = () => {
        if (!deleteTarget || isDeleting) return;
        setIsDeleting(true);
        router.delete(`/customer/${deleteTarget.id}`, {
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

    return (
        <AppLayout>
            <Head title="Pelanggan & Poin Member - Jelang Hari" />

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-sans text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                        Pelanggan &amp; Poin Member
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Sistem loyalitas tamu kafe, akumulasi poin reward per nota, dan klasifikasi tingkatan member.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 transition text-xs font-bold shadow-xs active:scale-95"
                >
                    <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                    <span>Daftarkan Member Baru</span>
                </button>
            </div>

            {/* ── KPI Metric Summary Cards (Samakan Kelola Akun) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Total Member</span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 block">{counts?.total || 0} Tamu</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Total Poin</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{counts?.total_poin || 0} Pts</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Member Gold &amp; VIP</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{counts?.gold || 0} Tamu</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Total Belanja Member</span>
                        <span className="text-sm font-black font-mono text-zinc-900 dark:text-white mt-1 block">{rupiah(counts?.total_belanja || 0)}</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* ── Category Tabs (Klasifikasi Member seperti di Kelola Akun) ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-6">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari nama member, nomor WhatsApp/telepon..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-600 shadow-xs transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.get('/customer', { kategori: currentCategory }, { preserveState: true });
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </form>

                {/* Categorized Tier Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                    {[
                        { key: 'all', label: 'Semua Member', count: counts?.total },
                        { key: 'classic', label: 'Tier Classic', count: counts?.classic },
                        { key: 'silver', label: 'Tier Silver', count: counts?.silver },
                        { key: 'gold', label: 'Tier Gold', count: counts?.gold },
                        { key: 'top', label: 'Top Poin', count: null }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleSwitchCategory(tab.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                                currentCategory === tab.key
                                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <span>{tab.label}</span>
                            {tab.count !== null && tab.count !== undefined && (
                                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                                    currentCategory === tab.key 
                                        ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800' 
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table List Member ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/90 dark:border-zinc-800 uppercase text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">
                        <tr>
                            <th className="px-5 py-3.5">Nama Tamu</th>
                            <th className="px-5 py-3.5">Kontak / WhatsApp</th>
                            <th className="px-5 py-3.5">Kategori Tier</th>
                            <th className="px-5 py-3.5">Poin Reward</th>
                            <th className="px-5 py-3.5">Total Kunjungan</th>
                            <th className="px-5 py-3.5 text-right">Akumulasi Belanja</th>
                            <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                        {customerList.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                                    Belum ada data member yang sesuai dengan kategori ini.
                                </td>
                            </tr>
                        ) : (
                            customerList.map((c) => {
                                const isGold = c.tier === 'Gold' || c.poin >= 150;
                                const isSilver = c.tier === 'Silver' || (c.poin >= 50 && c.poin < 150);

                                return (
                                    <tr key={c.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0">
                                                    {(c.nama || 'P').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-zinc-950 dark:text-white block">
                                                        {c.nama}
                                                    </span>
                                                    {c.email && (
                                                        <span className="text-[10px] text-zinc-400 block truncate max-w-[150px]">
                                                            {c.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-zinc-600 dark:text-zinc-400 font-medium">
                                            {c.telepon || '-'}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                                                isGold
                                                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                                                    : isSilver
                                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                            }`}>
                                                {c.tier || 'Classic'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                                                {c.poin || 0} pts
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                                            {c.kunjungan_count || c.total_transaksi || 0} nota
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-mono font-bold text-zinc-950 dark:text-white">
                                            {rupiah(c.total_belanja || 0)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right space-x-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(c)}
                                                className="p-1.5 inline-flex rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                                title="Edit Member & Poin"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(c)}
                                                className="p-1.5 inline-flex rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                title="Hapus Member"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── MODAL POP-UP TAMBAH & EDIT MEMBER (KEYBINDING ESC & ENTER) ── */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-extrabold text-base text-zinc-950 dark:text-white">
                                    {editingCustomer ? 'Perbarui Data Member' : 'Daftarkan Member Baru'}
                                </h3>
                                <p className="text-[10px] text-zinc-400">
                                    {editingCustomer ? `ID: #${editingCustomer.id}` : 'Program loyalitas Jelang Hari Coffee'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsFormModalOpen(false)} 
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Tamu / Pelanggan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Rian Pratama"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
                                {errors.nama && <span className="text-[10px] text-rose-500">{errors.nama}</span>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    No. WhatsApp / Telepon
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    placeholder="0812xxxxxxxx"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono"
                                />
                                {errors.telepon && <span className="text-[10px] text-rose-500">{errors.telepon}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Poin Reward
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={data.poin}
                                        onChange={(e) => setData('poin', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400 font-mono font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Email (Opsional)
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Catatan Preferensi Tamu
                                </label>
                                <input
                                    type="text"
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    placeholder="Contoh: Suka kopi less sugar / meja no-smoking"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                />
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
                                    {processing ? 'Menyimpan...' : (editingCustomer ? 'Simpan Perubahan (Enter)' : 'Daftarkan Member (Enter)')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL POP-UP KONFIRMASI HAPUS MEMBER ── */}
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
                                        Hapus Data Member
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
                            Apakah Anda yakin ingin menghapus data member <b>{deleteTarget.nama}</b> ({deleteTarget.telepon}) beserta saldo {deleteTarget.poin} poin?
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
                                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Member (Enter)'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
