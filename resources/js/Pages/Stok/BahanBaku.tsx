import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
    Plus,
    AlertTriangle,
    CheckCircle2,
    X,
    Package,
    Layers,
    History,
    ArrowDownRight,
    ArrowUpRight,
    Search,
    Filter,
    Edit3,
    Trash2,
    RefreshCw,
    Printer,
    ChefHat,
    Coins,
    TrendingUp,
    Info,
    Calendar,
    ArrowRight
} from 'lucide-react';

interface BahanBakuItem {
    id: number;
    kode: string;
    nama: string;
    kategori: string;
    satuan: string;
    stok: number;
    min_stok?: number;
    stok_minimal?: number;
    harga_beli_terakhir?: number;
    harga_beli?: number;
    lokasi_rak?: string | null;
}

interface LogItem {
    id: number;
    tipe: string;
    jumlah: number;
    stok_sebelum: number;
    stok_sesudah: number;
    keterangan: string;
    created_at: string;
    bahan_baku?: { nama: string; satuan: string };
    user?: { name: string; nama?: string };
}

interface Props {
    bahanBakus?: any;
    bahan_baku?: any;
    suppliers?: Array<{ id: number; nama: string }>;
    recentLogs?: LogItem[];
    filters?: { search?: string; kategori?: string };
}

export default function BahanBaku({
    bahanBakus,
    bahan_baku,
    suppliers = [],
    recentLogs = [],
    filters = {}
}: Props) {
    const rawBahan = bahanBakus || bahan_baku;
    const bahanList: BahanBakuItem[] = Array.isArray(rawBahan) ? rawBahan : (rawBahan?.data || []);

    // Filter & Search Local State
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedKategori, setSelectedKategori] = useState(filters.kategori || 'Semua');
    const [selectedStatus, setSelectedStatus] = useState<'semua' | 'kritis' | 'aman'>('semua');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isOpnameOpen, setIsOpnameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected Items for Actions
    const [selectedBahan, setSelectedBahan] = useState<BahanBakuItem | null>(null);

    // Form Tambah Bahan Baru
    const addForm = useForm({
        kode: '',
        nama: '',
        kategori: 'Kopi',
        satuan: 'gram',
        stok: 1000,
        min_stok: 250,
        harga_beli_terakhir: 120000,
    });

    // Form Edit Bahan
    const editForm = useForm({
        kode: '',
        nama: '',
        kategori: 'Kopi',
        satuan: 'gram',
        min_stok: 250,
        harga_beli_terakhir: 0,
    });

    // Form Stock Opname
    const opnameForm = useForm({
        stok_fisik: 0,
        alasan: 'Stock opname fisik gudang mingguan',
    });

    // Categories list dynamically calculated
    const categories = useMemo(() => {
        const unique = Array.from(new Set(bahanList.map(b => b.kategori).filter(Boolean)));
        return ['Semua', ...unique];
    }, [bahanList]);

    // KPI Summary Calculations
    const stats = useMemo(() => {
        const totalItems = bahanList.length;
        let kritisCount = 0;
        let totalAssetValue = 0;

        bahanList.forEach((b) => {
            const minStok = Number(b.min_stok !== undefined ? b.min_stok : (b.stok_minimal || 0));
            const harga = Number(b.harga_beli_terakhir !== undefined ? b.harga_beli_terakhir : (b.harga_beli || 0));
            const currentStok = Number(b.stok || 0);

            if (currentStok <= minStok) {
                kritisCount++;
            }
            totalAssetValue += currentStok * harga;
        });

        return {
            totalItems,
            kritisCount,
            amanCount: totalItems - kritisCount,
            totalAssetValue,
        };
    }, [bahanList]);

    // Filtered Bahan Baku List
    const filteredList = useMemo(() => {
        return bahanList.filter((b) => {
            const minStok = Number(b.min_stok !== undefined ? b.min_stok : (b.stok_minimal || 0));
            const currentStok = Number(b.stok || 0);
            const isKritis = currentStok <= minStok;

            // Search filter (name or code)
            const matchSearch =
                !searchQuery ||
                b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.kode.toLowerCase().includes(searchQuery.toLowerCase());

            // Category filter
            const matchKategori =
                selectedKategori === 'Semua' || b.kategori === selectedKategori;

            // Status filter
            const matchStatus =
                selectedStatus === 'semua' ||
                (selectedStatus === 'kritis' && isKritis) ||
                (selectedStatus === 'aman' && !isKritis);

            return matchSearch && matchKategori && matchStatus;
        });
    }, [bahanList, searchQuery, selectedKategori, selectedStatus]);

    // Handler Tambah
    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/stok/bahan-baku', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                addForm.reset();
            },
        });
    };

    // Handler Edit
    const openEditModal = (b: BahanBakuItem) => {
        setSelectedBahan(b);
        editForm.setData({
            kode: b.kode,
            nama: b.nama,
            kategori: b.kategori,
            satuan: b.satuan,
            min_stok: Number(b.min_stok !== undefined ? b.min_stok : (b.stok_minimal || 0)),
            harga_beli_terakhir: Number(b.harga_beli_terakhir !== undefined ? b.harga_beli_terakhir : (b.harga_beli || 0)),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBahan) return;
        editForm.put(`/stok/bahan-baku/${selectedBahan.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedBahan(null);
            },
        });
    };

    // Handler Opname
    const openOpnameModal = (b: BahanBakuItem) => {
        setSelectedBahan(b);
        opnameForm.setData({
            stok_fisik: Number(b.stok),
            alasan: 'Stock opname rutin gudang',
        });
        setIsOpnameOpen(true);
    };

    const handleOpnameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBahan) return;
        opnameForm.post(`/stok/bahan-baku/${selectedBahan.id}/penyesuaian`, {
            onSuccess: () => {
                setIsOpnameOpen(false);
                setSelectedBahan(null);
            },
        });
    };

    // Handler Hapus
    const openDeleteModal = (b: BahanBakuItem) => {
        setSelectedBahan(b);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!selectedBahan) return;
        router.delete(`/stok/bahan-baku/${selectedBahan.id}`, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedBahan(null);
            },
        });
    };

    // Format relative / standard datetime
    const formatDateTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    // Quick Print Lembar Opname
    const handlePrintOpname = () => {
        window.print();
    };

    return (
        <AppLayout>
            <Head title="Inventori Stok Bahan Baku - Jelang Hari" />

            {/* ── HEADER HALAMAN ── */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Inventori &amp; Gudang
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                            {stats.totalItems} Material Terdaftar
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
                        Stok Bahan Baku &amp; Gudang
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Monitoring sisa gramatur kopi, susu, sirup, dan kemasan cafe secara real-time &amp; akurat.
                    </p>
                </div>

                {/* Tombol Aksi Cepat */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={handlePrintOpname}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-xs font-semibold shadow-xs"
                        title="Cetak Lembar Stock Opname Fisik Gudang"
                    >
                        <Printer className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="hidden sm:inline">Cetak Lembar Opname</span>
                    </button>

                    <Link
                        href="/stok/resep"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-xs font-semibold shadow-xs"
                        title="Kelola Gramatur & Resep Menu"
                    >
                        <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                        <span>Pusat Resep Menu</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => {
                            addForm.reset();
                            setIsAddModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition text-xs font-bold shadow-sm"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                        <span>Tambah Bahan Baku</span>
                    </button>
                </div>
            </div>

            {/* ── KPI METRIC CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {/* 1. Total Bahan Baku */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Total Item Bahan
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono">
                            {stats.totalItems}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">Bahan Terdaftar</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                        {categories.length - 1} Kategori Operasional
                    </p>
                </div>

                {/* 2. Status Persediaan */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Status Stok
                        </span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            stats.kritisCount > 0
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                            {stats.kritisCount > 0 ? (
                                <AlertTriangle className="w-4 h-4" />
                            ) : (
                                <CheckCircle2 className="w-4 h-4" />
                            )}
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-2xl font-black font-mono ${
                            stats.kritisCount > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                            {stats.kritisCount > 0 ? stats.kritisCount : '0'}
                        </span>
                        <span className="text-xs font-medium text-zinc-500">
                            {stats.kritisCount > 0 ? 'Perlu Restock Segera' : 'Semua Stok Aman'}
                        </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                        {stats.amanCount} item di atas batas minimal
                    </p>
                </div>

                {/* 3. Estimasi Nilai Inventori */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Estimasi Nilai Inventori
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Coins className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white font-mono block truncate">
                            {rupiah(stats.totalAssetValue)}
                        </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                        Total nilai aset fisik di gudang
                    </p>
                </div>

                {/* 4. Aktivitas Mutasi Terakhir */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Log Mutasi Terkini
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <History className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-zinc-950 dark:text-white font-mono">
                            {recentLogs.length}
                        </span>
                        <span className="text-xs text-zinc-500 font-medium">Transaksi Terakhir</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                        Resep kasir &amp; penyesuaian opname
                    </p>
                </div>
            </div>

            {/* ── FILTER & PENCARIAN ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 sm:p-4 mb-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari kode atau nama bahan (misal: RAW-001, Espresso, Matcha)..."
                            className="w-full pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Quick Status Filter Buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('semua')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                                selectedStatus === 'semua'
                                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                        >
                            Semua ({bahanList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('kritis')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                                selectedStatus === 'kritis'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                            }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Menipis ({stats.kritisCount})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedStatus('aman')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                                selectedStatus === 'aman'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100'
                            }`}
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aman ({stats.amanCount})</span>
                        </button>
                    </div>
                </div>

                {/* Category Pills Slider */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/80 mt-3 scrollbar-none">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1 shrink-0">
                        Kategori:
                    </span>
                    {categories.map((kat) => {
                        const count = kat === 'Semua'
                            ? bahanList.length
                            : bahanList.filter(b => b.kategori === kat).length;
                        const isSelected = selectedKategori === kat;

                        return (
                            <button
                                key={kat}
                                type="button"
                                onClick={() => setSelectedKategori(kat)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${
                                    isSelected
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-zinc-50 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            >
                                <span>{kat}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                    isSelected
                                        ? 'bg-white/20 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── TABEL UTAMA STOK BAHAN BAKU ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-950/70 border-b border-zinc-200 dark:border-zinc-800 text-[11px] uppercase text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Kode &amp; Bahan Baku</th>
                                <th className="px-5 py-3.5">Kategori</th>
                                <th className="px-5 py-3.5 min-w-[180px]">Sisa Stok Fisik</th>
                                <th className="px-5 py-3.5">Batas Minimal</th>
                                <th className="px-5 py-3.5">Harga / Satuan</th>
                                <th className="px-5 py-3.5">Estimasi Aset</th>
                                <th className="px-5 py-3.5">Status Persediaan</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-zinc-400 dark:text-zinc-500">
                                        <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-400 mb-3">
                                            <Package className="w-6 h-6" />
                                        </div>
                                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                            Tidak ada bahan baku yang sesuai
                                        </p>
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            Coba ubah kata kunci pencarian atau bersihkan filter kategori.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((b) => {
                                    const minStok = Number(b.min_stok !== undefined ? b.min_stok : (b.stok_minimal || 0));
                                    const hargaBeli = Number(b.harga_beli_terakhir !== undefined ? b.harga_beli_terakhir : (b.harga_beli || 0));
                                    const currentStok = Number(b.stok || 0);
                                    const isKritis = currentStok <= minStok;
                                    const assetValue = currentStok * hargaBeli;

                                    // Ratio calculation for progress bar (cap at 100%)
                                    // Target safe capacity is 3x minStok
                                    const safeMax = Math.max(minStok * 3, currentStok, 100);
                                    const percentage = Math.min(Math.round((currentStok / safeMax) * 100), 100);

                                    return (
                                        <tr
                                            key={b.id}
                                            className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition group"
                                        >
                                            {/* 1. Kode & Nama */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700">
                                                        {b.kode}
                                                    </span>
                                                </div>
                                                <span className="font-bold text-zinc-950 dark:text-white text-sm block mt-1">
                                                    {b.nama}
                                                </span>
                                            </td>

                                            {/* 2. Kategori */}
                                            <td className="px-5 py-3.5">
                                                <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] inline-flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                                                    {b.kategori}
                                                </span>
                                            </td>

                                            {/* 3. Sisa Stok Fisik + Visual Level */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-baseline gap-1.5 font-mono">
                                                    <span className="font-black text-zinc-950 dark:text-white text-sm">
                                                        {currentStok.toLocaleString('id-ID')}
                                                    </span>
                                                    <span className="text-xs font-medium text-zinc-500">
                                                        {b.satuan}
                                                    </span>
                                                </div>
                                                {/* Mini Visual Bar */}
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                            isKritis
                                                                ? 'bg-rose-500'
                                                                : currentStok <= minStok * 1.5
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.max(percentage, 5)}%` }}
                                                    />
                                                </div>
                                            </td>

                                            {/* 4. Batas Minimal */}
                                            <td className="px-5 py-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                                                <span>{minStok.toLocaleString('id-ID')}</span>{' '}
                                                <span className="text-[11px]">{b.satuan}</span>
                                            </td>

                                            {/* 5. Harga Satuan */}
                                            <td className="px-5 py-3.5">
                                                <div className="font-mono text-zinc-900 dark:text-zinc-200 font-semibold">
                                                    {rupiah(hargaBeli)}
                                                </div>
                                                <span className="text-[10px] text-zinc-400 font-mono">
                                                    per {b.satuan}
                                                </span>
                                            </td>

                                            {/* 6. Estimasi Aset */}
                                            <td className="px-5 py-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                {rupiah(assetValue)}
                                            </td>

                                            {/* 7. Status Persediaan */}
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1.5 border shadow-2xs ${
                                                        isKritis
                                                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900 animate-pulse'
                                                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                                                    }`}
                                                >
                                                    {isKritis ? (
                                                        <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                                                    ) : (
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                    )}
                                                    <span>{isKritis ? 'Stok Kritis' : 'Stok Aman'}</span>
                                                </span>
                                            </td>

                                            {/* 8. Aksi Cepat */}
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-1">
                                                    {/* Opname Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openOpnameModal(b)}
                                                        className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition shadow-2xs flex items-center gap-1"
                                                        title="Sesuaikan Fisik (Stock Opname)"
                                                    >
                                                        <RefreshCw className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                                                        <span>Opname</span>
                                                    </button>

                                                    {/* Edit Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(b)}
                                                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
                                                        title="Edit Informasi Bahan Baku"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openDeleteModal(b)}
                                                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                                                        title="Hapus Bahan Baku"
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

                {/* Footer Rekap Sederhana */}
                <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-2">
                    <div>
                        Menampilkan <strong className="text-zinc-900 dark:text-white font-mono">{filteredList.length}</strong> dari{' '}
                        <span className="font-mono">{bahanList.length}</span> total item bahan baku
                    </div>
                    <div className="flex items-center gap-3">
                        <span>Total Nilai Aset:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {rupiah(stats.totalAssetValue)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── LOG MUTASI INVENTORI TERAKHIR (DIPERBAIKI SECARA DETAIL) ── */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2 mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <History className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-zinc-950 dark:text-white">
                                Log Mutasi Inventori Terakhir
                            </h2>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Riwayat pemotongan resep otomatis POS kasir dan penyesuaian fisik opname
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
                        {recentLogs.length} Entri Terakhir
                    </span>
                </div>

                {recentLogs.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 text-xs">
                        Belum ada aktivitas mutasi stok tercatat.
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {recentLogs.slice(0, 10).map((log) => {
                            const isMasuk = log.tipe === 'masuk';
                            const isPenyesuaian = log.tipe === 'penyesuaian';
                            const satuan = log.bahan_baku?.satuan || 'unit';

                            return (
                                <div
                                    key={log.id}
                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 px-2 rounded-xl transition"
                                >
                                    {/* Kiri: Ikon, Info Bahan, & Keterangan Transaksi */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                            isMasuk
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : isPenyesuaian
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {isMasuk ? (
                                                <ArrowUpRight className="w-4 h-4" />
                                            ) : isPenyesuaian ? (
                                                <RefreshCw className="w-4 h-4" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-xs text-zinc-950 dark:text-white">
                                                    {log.bahan_baku?.nama || 'Bahan Baku'}
                                                </span>
                                                <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                                    isMasuk
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                        : isPenyesuaian
                                                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                }`}>
                                                    {isMasuk ? 'Stok Masuk' : isPenyesuaian ? 'Opname' : 'Keluar POS'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                                {log.keterangan || (isMasuk ? 'Pengadaan bahan baku' : 'Pengurangan stok resep pesanan kasir')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kanan: Selisih Jumlah, Perubahan Stok, & Tanggal */}
                                    <div className="flex items-center sm:items-end justify-between sm:justify-end gap-3 sm:gap-6 text-right pl-11 sm:pl-0 shrink-0">
                                        <div>
                                            <span className={`font-mono font-bold text-xs block ${
                                                isMasuk
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-600 dark:text-rose-400'
                                            }`}>
                                                {isMasuk ? '+' : '-'}{Math.abs(Number(log.jumlah)).toLocaleString('id-ID')} {satuan}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-mono block">
                                                {Number(log.stok_sebelum).toLocaleString('id-ID')} → {Number(log.stok_sesudah).toLocaleString('id-ID')} {satuan}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono block">
                                                {formatDateTime(log.created_at)}
                                            </span>
                                            {log.user && (
                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate max-w-[100px]">
                                                    Oleh: {log.user.name || log.user.nama || 'Sistem'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── MODAL 1: TAMBAH BAHAN BAKU ── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                    Tambah Bahan Baku Baru
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Daftarkan bahan baku atau kemasan untuk resep menu cafe.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Kode Bahan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={addForm.data.kode}
                                        onChange={(e) => addForm.setData('kode', e.target.value.toUpperCase())}
                                        placeholder="RAW-005"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Satuan Ukur
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={addForm.data.satuan}
                                        onChange={(e) => addForm.setData('satuan', e.target.value)}
                                        placeholder="gram / ml / pcs"
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Bahan Baku
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={addForm.data.nama}
                                    onChange={(e) => addForm.setData('nama', e.target.value)}
                                    placeholder="Contoh: Biji Kopi House Blend Arabica"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Kategori
                                </label>
                                <select
                                    value={addForm.data.kategori}
                                    onChange={(e) => addForm.setData('kategori', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="Kopi">Biji Kopi</option>
                                    <option value="Susu & Dairy">Susu &amp; Dairy</option>
                                    <option value="Sirup & Flavour">Sirup &amp; Flavour</option>
                                    <option value="Tea & Powder">Teh &amp; Bubuk</option>
                                    <option value="Packaging">Cup &amp; Packaging</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Stok Awal ({addForm.data.satuan || 'unit'})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={addForm.data.stok}
                                        onChange={(e) => addForm.setData('stok', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Batas Minimal ({addForm.data.satuan || 'unit'})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={addForm.data.min_stok}
                                        onChange={(e) => addForm.setData('min_stok', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Harga Beli Terakhir (Rp per {addForm.data.satuan || 'unit'})
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    value={addForm.data.harga_beli_terakhir}
                                    onChange={(e) => addForm.setData('harga_beli_terakhir', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                                <span className="text-[10px] text-zinc-400 mt-1 block">
                                    Contoh: Beli susu 1 Liter Rp 26.000, maka isi 26 (karena satuan ml).
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={addForm.processing}
                                    className="px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {addForm.processing ? 'Menyimpan...' : 'Simpan Bahan Baku'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2: EDIT BAHAN BAKU ── */}
            {isEditModalOpen && selectedBahan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                    Edit Bahan Baku
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {selectedBahan.nama} ({selectedBahan.kode})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Kode Bahan
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.kode}
                                        onChange={(e) => editForm.setData('kode', e.target.value.toUpperCase())}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Satuan Ukur
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.satuan}
                                        onChange={(e) => editForm.setData('satuan', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Bahan Baku
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.nama}
                                    onChange={(e) => editForm.setData('nama', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Kategori
                                </label>
                                <select
                                    value={editForm.data.kategori}
                                    onChange={(e) => editForm.setData('kategori', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                >
                                    <option value="Kopi">Biji Kopi</option>
                                    <option value="Susu & Dairy">Susu &amp; Dairy</option>
                                    <option value="Sirup & Flavour">Sirup &amp; Flavour</option>
                                    <option value="Tea & Powder">Teh &amp; Bubuk</option>
                                    <option value="Packaging">Cup &amp; Packaging</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Batas Minimal ({editForm.data.satuan})
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={editForm.data.min_stok}
                                        onChange={(e) => editForm.setData('min_stok', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                        Harga Beli / Satuan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={editForm.data.harga_beli_terakhir}
                                        onChange={(e) => editForm.setData('harga_beli_terakhir', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Bahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 3: STOCK OPNAME FISIK ── */}
            {isOpnameOpen && selectedBahan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                    Stock Opname Fisik
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    {selectedBahan.nama}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsOpnameOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleOpnameSubmit} className="space-y-3.5">
                            {/* Perbandingan Stok Sistem */}
                            <div className="bg-zinc-50 dark:bg-zinc-950/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Stok saat ini di sistem:
                                </span>
                                <span className="font-mono font-bold text-sm text-zinc-950 dark:text-white">
                                    {Number(selectedBahan.stok).toLocaleString('id-ID')} {selectedBahan.satuan}
                                </span>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Hasil Hitung Fisik Gudang ({selectedBahan.satuan})
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step="any"
                                    value={opnameForm.data.stok_fisik}
                                    onChange={(e) => opnameForm.setData('stok_fisik', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Selisih Live Calculation */}
                            {(() => {
                                const selisih = opnameForm.data.stok_fisik - Number(selectedBahan.stok);
                                return (
                                    <div className={`p-2.5 rounded-xl text-xs font-mono flex items-center justify-between ${
                                        selisih === 0
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                            : selisih > 0
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    }`}>
                                        <span className="font-sans font-semibold">Selisih Penyesuaian:</span>
                                        <span className="font-bold">
                                            {selisih > 0 ? `+${selisih.toLocaleString('id-ID')}` : selisih.toLocaleString('id-ID')} {selectedBahan.satuan}
                                            {selisih !== 0 && (selisih > 0 ? ' (Surplus)' : ' (Defisit)')}
                                        </span>
                                    </div>
                                );
                            })()}

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Alasan / Keterangan Selisih
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={opnameForm.data.alasan}
                                    onChange={(e) => opnameForm.setData('alasan', e.target.value)}
                                    placeholder="Contoh: Kalibrasi grinder tumpah, susut kemasan"
                                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpnameOpen(false)}
                                    className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={opnameForm.processing}
                                    className="px-4 py-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-bold transition disabled:opacity-50"
                                >
                                    {opnameForm.processing ? 'Menyimpan...' : 'Perbarui Stok Fisik'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 4: KONFIRMASI HAPUS BAHAN ── */}
            {isDeleteOpen && selectedBahan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">
                                Hapus Bahan Baku?
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Anda akan menghapus bahan baku <strong className="text-zinc-900 dark:text-white">{selectedBahan.nama}</strong> ({selectedBahan.kode}). Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsDeleteOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
