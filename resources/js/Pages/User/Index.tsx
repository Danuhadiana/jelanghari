import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    Plus, Edit2, X, Shield, UserCheck, UserX, Phone, Mail,
    Settings, Check, Lock, Info, Users, User, Search, Award,
    Briefcase, Sparkles, KeyRound, Coffee, Utensils, ChevronRight,
    AlertTriangle, Trash2, Loader2
} from 'lucide-react';

interface UserItem {
    id: number;
    name?: string;
    nama?: string;
    username?: string;
    email: string;
    telepon?: string;
    role: string | { id?: number; nama?: string; slug?: string };
    is_aktif?: boolean;
    is_active?: boolean;
    pin?: string;
    created_at?: string;
    customer_poin?: number;
    customer_kunjungan?: number;
    customer_total_transaksi?: number;
}

interface Props {
    users: any;
    tab: 'staf' | 'pelanggan' | 'all';
    selectedRole: string;
    counts: {
        total_staf: number;
        total_pelanggan: number;
        total_all: number;
        staf_aktif: number;
        by_role: Record<string, number>;
    };
    roles?: Array<{ id: number; nama: string; slug: string }>;
    filters?: { search?: string; tab?: string; role?: string };
}

const DEFAULT_STAFF_ROLES = [
    { slug: 'owner', nama: 'Owner (Pemilik Cafe)', desc: 'Akses penuh ke seluruh menu finansial, laporan, staf, stok, dan pengaturan toko.' },
    { slug: 'manager', nama: 'Manager Operasional', desc: 'Akses manajemen operasional, laporan keuangan, stok bahan, promo, dan persetujuan absensi.' },
    { slug: 'kasir', nama: 'Kasir POS', desc: 'Akses Point of Sale, pembayaran, buka/tutup shift kasir, dan pencatatan transaksi.' },
    { slug: 'barista', nama: 'Barista Bar', desc: 'Akses tampilan Kitchen KDS untuk pesanan racikan kopi dan minuman, serta presensi mandiri.' },
    { slug: 'kitchen', nama: 'Dapur / Kitchen', desc: 'Akses tampilan Kitchen KDS untuk pesanan makanan dapur dan presensi mandiri.' },
];

export default function Index({ users, tab = 'staf', selectedRole = 'all', counts, roles = [], filters = {} }: Props) {
    const userList: UserItem[] = Array.isArray(users) ? users : (users?.data || []);
    const [activeTab, setActiveTab] = useState<'staf' | 'pelanggan' | 'all'>(tab || 'staf');
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [currentRoleFilter, setCurrentRoleFilter] = useState(selectedRole || 'all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [isRoleSettingsOpen, setIsRoleSettingsOpen] = useState(false);
    const [deleteTargetUser, setDeleteTargetUser] = useState<UserItem | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState(false);

    // Form Modal state
    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        telepon: '',
        role: 'kasir',
        pin: '123456',
        is_aktif: true,
        poin: 25,
    });

    // Handle tab change
    const handleSwitchTab = (newTab: 'staf' | 'pelanggan' | 'all') => {
        setActiveTab(newTab);
        setCurrentRoleFilter('all');
        router.get('/user', {
            tab: newTab,
            role: 'all',
            search: searchQuery,
        }, { preserveState: true, preserveScroll: true });
    };

    // Handle role pill change
    const handleRoleFilter = (roleSlug: string) => {
        setCurrentRoleFilter(roleSlug);
        router.get('/user', {
            tab: activeTab,
            role: roleSlug,
            search: searchQuery,
        }, { preserveState: true, preserveScroll: true });
    };

    // Handle search submit
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/user', {
            tab: activeTab,
            role: currentRoleFilter,
            search: searchQuery,
        }, { preserveState: true });
    };

    // Keyboard Shortcuts (Esc to close)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (deleteTargetUser) setDeleteTargetUser(null);
                else if (isModalOpen) setIsModalOpen(false);
                else if (isRoleSettingsOpen) setIsRoleSettingsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, isRoleSettingsOpen, deleteTargetUser]);

    const openCreate = (defaultRole: string = 'kasir') => {
        reset();
        const isPelanggan = activeTab === 'pelanggan' || defaultRole === 'pelanggan';
        setData({
            name: '',
            username: '',
            email: '',
            password: '',
            telepon: '',
            role: isPelanggan ? 'pelanggan' : defaultRole,
            pin: isPelanggan ? '' : '123456',
            is_aktif: true,
            poin: 25,
        });
        setEditingUserId(null);
        setIsModalOpen(true);
    };

    const openEdit = (u: UserItem) => {
        setEditingUserId(u.id);
        const roleSlug = typeof u.role === 'string' 
            ? u.role 
            : (u.role?.slug || 'kasir');

        setData({
            name: u.name || u.nama || '',
            username: u.username || '',
            email: u.email || '',
            password: '',
            telepon: u.telepon || '',
            role: roleSlug,
            pin: u.pin ? '******' : '',
            is_aktif: u.is_aktif !== undefined ? u.is_aktif : (u.is_active !== undefined ? u.is_active : true),
            poin: u.customer_poin || 0,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUserId) {
            put(`/user/${editingUserId}`, {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/user', {
                preserveScroll: true,
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleToggleStatus = (u: UserItem) => {
        router.patch(`/user/${u.id}/toggle`, {}, { preserveScroll: true });
    };

    const handleRequestDeleteUser = (u: UserItem) => {
        setDeleteTargetUser(u);
    };

    const handleConfirmDeleteUser = () => {
        if (!deleteTargetUser || isDeletingUser) return;
        setIsDeletingUser(true);
        router.delete(`/user/${deleteTargetUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTargetUser(null);
                setIsDeletingUser(false);
            },
            onError: () => {
                setIsDeletingUser(false);
            },
            onFinish: () => {
                setIsDeletingUser(false);
            }
        });
    };

    const getRoleBadge = (r: any) => {
        const slug = typeof r === 'string' ? r.toLowerCase() : (r?.slug || r?.nama || 'kasir').toLowerCase();
        switch (slug) {
            case 'owner':
                return { label: 'Owner Cafe', color: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-800' };
            case 'manager':
                return { label: 'Manager Operasional', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' };
            case 'kasir':
                return { label: 'Kasir POS', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' };
            case 'barista':
                return { label: 'Barista Bar', color: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800' };
            case 'kitchen':
            case 'dapur':
                return { label: 'Dapur / Kitchen', color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800' };
            case 'pelanggan':
                return { label: 'Member / Pelanggan', color: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800' };
            default:
                return { label: slug, color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700' };
        }
    };

    return (
        <AppLayout>
            <Head title="Kelola Pengguna & Akun Terpisah - Jelang Hari" />

            {/* ── 1. Header & Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
                        Kelola Akun &amp; Pengguna Sistem
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Pemisahan terstruktur dan rapi antara Akun Internal Kafe (Kasir, Barista, Kitchen, Manager, Owner) dan Akun Pelanggan / Member.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRoleSettingsOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition text-xs font-semibold border border-zinc-200 dark:border-zinc-800 shadow-xs"
                    >
                        <Settings className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Kebijakan Hak Akses</span>
                    </button>

                    <button
                        onClick={() => openCreate(activeTab === 'pelanggan' ? 'pelanggan' : 'kasir')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition text-xs font-bold shadow-md active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
                        <span>{activeTab === 'pelanggan' ? 'Tambah Member Baru' : 'Tambah Staf Baru'}</span>
                    </button>
                </div>
            </div>

            {/* ── 2. KPI Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Staf Kafe Aktif</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {counts?.staf_aktif || 0} <span className="text-xs font-normal text-zinc-400">/ {counts?.total_staf || 0} staf</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Total tim operasional internal</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Pelanggan &amp; Member</span>
                        <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {counts?.total_pelanggan || 0} <span className="text-xs font-normal text-zinc-400">akun</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Akun customer dengan poin reward</p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Kasir &amp; Barista</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Coffee className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {(counts?.by_role?.kasir || 0) + (counts?.by_role?.barista || 0)} <span className="text-xs font-normal text-zinc-400">staf</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                        Kasir: {counts?.by_role?.kasir || 0} &bull; Barista: {counts?.by_role?.barista || 0}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Semua Akun</span>
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold font-mono text-zinc-950 dark:text-white">
                        {counts?.total_all || 0} <span className="text-xs font-normal text-zinc-400">pengguna</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Seluruh akun terdaftar di database</p>
                </div>
            </div>

            {/* ── 3. Primary Segmented Tabs (Clean Separation) ── */}
            <div className="space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    {/* Main Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
                        <button
                            type="button"
                            onClick={() => handleSwitchTab('staf')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                activeTab === 'staf'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                            }`}
                        >
                            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Tim Internal &amp; Staf Kafe</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                {counts?.total_staf || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSwitchTab('pelanggan')}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                activeTab === 'pelanggan'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                            }`}
                        >
                            <Award className="w-3.5 h-3.5 text-cyan-500" />
                            <span>Akun Pelanggan &amp; Member Web</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300">
                                {counts?.total_pelanggan || 0}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSwitchTab('all')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                                activeTab === 'all'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Semua Pengguna</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono text-zinc-500 bg-zinc-200 dark:bg-zinc-700">
                                {counts?.total_all || 0}
                            </span>
                        </button>
                    </div>

                    {/* Quick Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="relative min-w-[240px] sm:max-w-xs">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Cari nama, email, WhatsApp..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    router.get('/user', { tab: activeTab, role: currentRoleFilter, search: '' }, { preserveState: true });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Role Filter Pills (Active on Staf tab) */}
                {activeTab === 'staf' && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mr-1 shrink-0">Filter Jabatan:</span>
                        {[
                            { slug: 'all', label: 'Semua Staf', count: counts?.total_staf || 0 },
                            { slug: 'owner', label: 'Owner', count: counts?.by_role?.owner || 0 },
                            { slug: 'manager', label: 'Manager', count: counts?.by_role?.manager || 0 },
                            { slug: 'kasir', label: 'Kasir POS', count: counts?.by_role?.kasir || 0 },
                            { slug: 'barista', label: 'Barista', count: counts?.by_role?.barista || 0 },
                            { slug: 'kitchen', label: 'Kitchen', count: counts?.by_role?.kitchen || 0 },
                        ].map((rf) => (
                            <button
                                key={rf.slug}
                                type="button"
                                onClick={() => handleRoleFilter(rf.slug)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                                    currentRoleFilter === rf.slug
                                        ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                            >
                                <span>{rf.label}</span>
                                <span className="ml-1.5 opacity-70 font-mono text-[10px]">({rf.count})</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── 4. Main Table View ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50/80 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 uppercase text-zinc-500 dark:text-zinc-400 font-bold tracking-wider text-[10px]">
                        <tr>
                            <th className="px-5 py-3.5">
                                {activeTab === 'pelanggan' ? 'Nama Pelanggan & WhatsApp' : 'Karyawan & Kontak'}
                            </th>
                            <th className="px-5 py-3.5">Email &amp; Username</th>
                            {activeTab === 'pelanggan' ? (
                                <>
                                    <th className="px-5 py-3.5">Poin Loyalitas</th>
                                    <th className="px-5 py-3.5">Aktivitas Belanja</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-5 py-3.5">Jabatan / Role</th>
                                    <th className="px-5 py-3.5">PIN Kasir / Absen</th>
                                </>
                            )}
                            <th className="px-5 py-3.5">Status Akun</th>
                            <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {userList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-14 text-center text-zinc-400">
                                    <Users className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                                    <p className="text-xs font-semibold">Tidak ada akun yang sesuai pada kategori ini.</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                        Gunakan tombol "Tambah" untuk mendaftarkan akun baru.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            userList.map((u) => {
                                const badge = getRoleBadge(u.role);
                                const isUserActive = u.is_aktif !== undefined ? u.is_aktif : (u.is_active !== undefined ? u.is_active : true);
                                const name = u.name || u.nama || 'Pengguna';
                                const isPelanggan = (typeof u.role === 'string' ? u.role : u.role?.slug) === 'pelanggan';

                                return (
                                    <tr key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                                        {/* Col 1: Nama & Kontak */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 border ${
                                                    isPelanggan
                                                        ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700'
                                                }`}>
                                                    {name.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-zinc-950 dark:text-white block">{name}</span>
                                                    {u.telepon ? (
                                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-3 h-3 text-zinc-400" /> {u.telepon}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-zinc-400 italic">Tanpa nomor telepon</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Col 2: Email & Username */}
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-zinc-700 dark:text-zinc-300 block">{u.email}</span>
                                            {u.username && (
                                                <span className="text-[10px] text-zinc-400 font-mono">@{u.username}</span>
                                            )}
                                        </td>

                                        {/* Col 3 & 4: Staf vs Customer specific */}
                                        {activeTab === 'pelanggan' || isPelanggan ? (
                                            <>
                                                <td className="px-5 py-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold font-mono text-xs">
                                                        <Award className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>{u.customer_poin || 0} Pts</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-bold font-mono text-zinc-950 dark:text-white block">
                                                        {rupiah(u.customer_total_transaksi || 0)}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        {u.customer_kunjungan || 0} kali transaksi
                                                    </span>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-5 py-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] inline-block ${badge.color}`}>
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                                                        <KeyRound className="w-3 h-3 text-emerald-500" />
                                                        <span>{u.pin ? 'Tersedia' : 'Default (123456)'}</span>
                                                    </span>
                                                </td>
                                            </>
                                        )}

                                        {/* Col 5: Status Akun */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleStatus(u)}
                                                title="Klik untuk mengubah status aktif/nonaktif"
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 transition ${
                                                    isUserActive 
                                                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:opacity-80' 
                                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:opacity-80'
                                                }`}
                                            >
                                                {isUserActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                                <span>{isUserActive ? 'Aktif' : 'Nonaktif'}</span>
                                            </button>
                                        </td>

                                        {/* Col 6: Aksi */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEdit(u)}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition inline-flex items-center gap-1 text-xs font-semibold"
                                                    title="Edit Akun"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleRequestDeleteUser(u)}
                                                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition inline-flex items-center text-xs font-semibold"
                                                    title="Hapus Akun Permanen"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── 5. Modal Tambah / Edit Pengguna Terstruktur ── */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                    {editingUserId ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Pilih jenis akun (Staf Internal Kafe atau Pelanggan Member).
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Account Type Selector (Only on Create) */}
                        {!editingUserId && (
                            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl mb-4">
                                <button
                                    type="button"
                                    onClick={() => setData('role', 'kasir')}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                        data.role !== 'pelanggan'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Staf / Karyawan</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('role', 'pelanggan')}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                        data.role === 'pelanggan'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Award className="w-3.5 h-3.5 text-cyan-500" />
                                    <span>Pelanggan / Member</span>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Lengkap <span className="text-emerald-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Nama pengguna..."
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        No. WhatsApp / HP
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        placeholder="08123456789"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Username (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="username_unik"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Alamat Email <span className="text-emerald-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        {editingUserId ? 'Sandi Baru (Opsional)' : 'Kata Sandi'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUserId}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>

                                {data.role !== 'pelanggan' ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                            PIN Kasir / Absen (6 Digit)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={data.pin}
                                            onChange={(e) => setData('pin', e.target.value)}
                                            placeholder="123456"
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                            Poin Loyalitas
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            value={data.poin}
                                            onChange={(e) => setData('poin', Number(e.target.value))}
                                            placeholder="25"
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                )}
                            </div>

                            {data.role !== 'pelanggan' && (
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Peran / Jabatan Staf
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        {DEFAULT_STAFF_ROLES.map((r) => (
                                            <option key={r.slug} value={r.slug}>{r.nama}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.is_aktif}
                                    onChange={(e) => setData('is_aktif', e.target.checked)}
                                    className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-semibold">
                                    Akun Aktif (Dapat Login ke Sistem)
                                </span>
                            </label>

                            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    <span>{processing ? 'Menyimpan...' : 'Simpan Akun'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 6. Modal Kebijakan & Panduan Peran ── */}
            {isRoleSettingsOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade"
                    onClick={() => setIsRoleSettingsOpen(false)}
                >
                    <div 
                        className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-600" />
                                    <span>Kebijakan Hak Akses &amp; Peran Sistem</span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Daftar hak akses dan kewenangan per jenis akun.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsRoleSettingsOpen(false)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-xs text-cyan-900 dark:text-cyan-300 uppercase font-mono">
                                        Pelanggan &bull; Member Web
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-200 font-semibold font-mono">
                                        role: pelanggan
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Akses katalog menu online, riwayat pesanan, profil pribadi, pengumpulan dan penukaran poin loyalty Jelang Hari. Terpisah dari modul staf.
                                </p>
                            </div>

                            {DEFAULT_STAFF_ROLES.map((role) => (
                                <div key={role.slug} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs text-zinc-900 dark:text-white uppercase font-mono">{role.nama}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold font-mono">
                                            role: {role.slug}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {role.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-2">
                            <Info className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span>
                                Setiap staf yang didaftarkan memiliki PIN 6 digit untuk otentikasi cepat saat shift kasir POS dan clock-in absensi mandiri.
                            </span>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setIsRoleSettingsOpen(false)}
                                className="px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 7. MODAL POP-UP PERINGATAN KERAS PENGHAPUSAN AKUN ── */}
            {deleteTargetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
                    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border-2 border-rose-500/80 dark:border-rose-600 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[85vh] overflow-y-auto">
                        {/* Header Warning */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                                <AlertTriangle className="w-7 h-7" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 mb-1">
                                    <span>⚠️ Peringatan Keras</span>
                                </div>
                                <h3 className="text-lg font-black text-zinc-950 dark:text-white leading-tight">
                                    Hapus Akun Pengguna Secara Permanen?
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Tindakan ini bersifat destruktif dan data akun yang dihapus <strong>tidak dapat dipulihkan</strong> kembali.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteTargetUser(null)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Akun yang Ditarget */}
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                                Rincian Akun yang Akan Dihapus:
                            </span>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                                    {(deleteTargetUser.name || deleteTargetUser.nama || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                            {deleteTargetUser.name || deleteTargetUser.nama || 'Pengguna'}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getRoleBadge(deleteTargetUser.role).color}`}>
                                            {getRoleBadge(deleteTargetUser.role).label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono truncate mt-0.5">
                                        {deleteTargetUser.email}
                                        {deleteTargetUser.username && ` (@${deleteTargetUser.username})`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Konsekuensi Penghapusan */}
                        <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 space-y-2">
                            <p className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>Konsekuensi Penghapusan:</span>
                            </p>
                            <ul className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed text-rose-800/90 dark:text-rose-300/90">
                                <li>
                                    Akses login akun ini akan <strong>seketika dicabut</strong> dari sistem Jelang Hari.
                                </li>
                                <li>
                                    Sesi otentikasi di aplikasi kasir, dapur KDS, dan perangkat mobile akan terputus.
                                </li>
                                <li>
                                    Riwayat audit finansial masa lalu tetap utuh, namun pengguna ini tidak dapat lagi masuk ke sistem.
                                </li>
                                {((typeof deleteTargetUser.role === 'string' ? deleteTargetUser.role : deleteTargetUser.role?.slug) === 'owner') && (
                                    <li className="font-black text-rose-700 dark:text-rose-300">
                                        PERINGATAN KHUSUS: Akun ini berstatus Owner (Pemilik). Pastikan kafe memiliki minimal satu akun owner aktif lain sebelum melanjutkan!
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Action Buttons Optimized for Human Fingers (Touch Targets >= 48px) */}
                        <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setDeleteTargetUser(null)}
                                className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition flex items-center justify-center active:scale-95"
                            >
                                Batalkan (Amankan Akun)
                            </button>
                            <button
                                type="button"
                                disabled={isDeletingUser}
                                onClick={handleConfirmDeleteUser}
                                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 disabled:opacity-50"
                            >
                                {isDeletingUser ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Menghapus Akun...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Ya, Hapus Akun Secara Permanen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
