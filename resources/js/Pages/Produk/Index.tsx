import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import { 
    Plus, Search, Edit2, Trash2, Sparkles, LayoutGrid, 
    List, Coffee, CheckCircle, AlertCircle, X, Check,
    Utensils, Tag, Eye, ArrowUpDown, ChevronRight, Layers,
    UtensilsCrossed, Cookie
} from 'lucide-react';
import { getProductImage } from '@/lib/productImages';

interface ProdukItem {
    id: number;
    nama: string;
    harga: number;
    hpp: number;
    gambar?: string | null;
    is_active: boolean;
    is_favorit: boolean;
    kategori?: { id?: number; nama: string; slug?: string };
    varian?: Array<{ id: number; nama: string; harga?: number }>;
    modifier?: Array<{ id: number; nama: string }>;
    station?: string;
}

const DRINK_SLUGS = ['signature', 'coffee-based', 'manual-brew', 'non-coffee', 'tropical'];
const FOOD_SLUGS = ['traditional', 'noodles', 'western'];
const SNACK_SLUGS = ['snacks', 'pastry-dessert'];

type MenuType = 'all' | 'minuman' | 'makanan' | 'snack';

interface Props {
    produk: {
        data: ProdukItem[];
        links: any[];
        total?: number;
    };
    kategori: Array<{ id: number; nama: string; slug: string }>;
    filters: { search?: string; kategori?: string; type?: string };
}

export default function Index({ produk, kategori = [], filters = {} }: Props) {
    const produkList: ProdukItem[] = Array.isArray(produk?.data) ? produk.data : [];
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Modal Hapus State
    const [deleteTarget, setDeleteTarget] = useState<ProdukItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal Status Toggle State
    const [toggleTarget, setToggleTarget] = useState<ProdukItem | null>(null);

    // Keyboard Shortcuts (Esc to close modal, Enter to confirm)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (deleteTarget) setDeleteTarget(null);
                if (toggleTarget) setToggleTarget(null);
            } else if (e.key === 'Enter') {
                if (deleteTarget && !isDeleting) {
                    executeDelete();
                } else if (toggleTarget) {
                    executeToggle();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [deleteTarget, toggleTarget, isDeleting]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/produk', {
            search: searchQuery,
            type: filters.type,
            kategori: filters.kategori,
        }, { preserveState: true });
    };

    const executeDelete = () => {
        if (!deleteTarget || isDeleting) return;
        setIsDeleting(true);
        router.delete(`/produk/${deleteTarget.id}`, {
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

    const executeToggle = () => {
        if (!toggleTarget) return;
        const targetId = toggleTarget.id;
        setToggleTarget(null);
        router.patch(`/produk/${targetId}/toggle`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    // KPI Metrics
    const totalMenu = produk?.total !== undefined ? produk.total : produkList.length;
    const totalAktif = produkList.filter(p => p.is_active).length;
    const totalFavorit = produkList.filter(p => p.is_favorit).length;

    // Filter Kategori Disesuaikan Persis Sistem Kasir
    const activeType: MenuType = filters.type === 'minuman' || filters.type === 'makanan' || filters.type === 'snack'
        ? filters.type
        : filters.kategori
        ? DRINK_SLUGS.includes(filters.kategori)
            ? 'minuman'
            : FOOD_SLUGS.includes(filters.kategori)
            ? 'makanan'
            : SNACK_SLUGS.includes(filters.kategori)
            ? 'snack'
            : 'all'
        : 'all';

    const activeSubcategories = kategori.filter((c) => {
        if (activeType === 'minuman') return DRINK_SLUGS.includes(c.slug);
        if (activeType === 'makanan') return FOOD_SLUGS.includes(c.slug);
        if (activeType === 'snack') return SNACK_SLUGS.includes(c.slug);
        return true;
    });

    const primaryTypes = [
        { id: 'all' as MenuType, label: 'Semua Menu', icon: Sparkles },
        { id: 'minuman' as MenuType, label: 'Minuman (Barista)', icon: Coffee },
        { id: 'makanan' as MenuType, label: 'Makanan Utama', icon: UtensilsCrossed },
        { id: 'snack' as MenuType, label: 'Camilan & Pastry', icon: Cookie },
    ];

    return (
        <AppLayout>
            <Head title="Katalog Menu & Produk - Jelang Hari" />

            {/* ── Top Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                        Katalog Menu &amp; Produk
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Kelola harga jual, modal HPP, foto menu, varian rasa, dan ketersediaan stok kasir.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/produk/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 transition text-xs font-bold shadow-xs active:scale-95"
                    >
                        <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                        <span>Tambah Produk Baru</span>
                    </Link>
                </div>
            </div>

            {/* ── Quick KPI Metric Badges (Aesthetic Kasir) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Total Menu</span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 block">{totalMenu} Produk</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Layers className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Menu Tersedia</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{totalAktif} Aktif</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Menu Favorit</span>
                        <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{totalFavorit} Best-Seller</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Kategori</span>
                        <span className="text-lg font-black text-zinc-900 dark:text-white mt-0.5 block">{kategori.length} Bagian</span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center">
                        <Tag className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* ── Search & View Mode Switcher Row ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-3 w-full">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Cari nama menu, kode, varian rasa..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-600 shadow-xs transition"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.get('/produk', { 
                                    type: filters.type,
                                    kategori: filters.kategori 
                                }, { preserveState: true });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </form>

                <div className="flex items-center gap-2 justify-end shrink-0">
                    <div className="flex items-center p-1 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl shadow-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold' : 'text-zinc-400'}`}
                            title="Tampilan Grid Menu Kasir"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold' : 'text-zinc-400'}`}
                            title="Tampilan Tabel Detail"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Kategori Sistem Kasir (Disederhanakan & Efisien) ── */}
            <div className="w-full min-w-0 max-w-full space-y-2 mb-6">
                {/* 1. Primary Category Tabs (Persis seperti Kasir POS) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
                    {primaryTypes.map((type) => {
                        const Icon = type.icon;
                        const isActive = activeType === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => {
                                    router.get('/produk', {
                                        type: type.id === 'all' ? undefined : type.id,
                                        search: searchQuery || undefined,
                                    }, { preserveState: true });
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-zinc-950 dark:bg-emerald-600 text-white shadow-xs ring-1 ring-zinc-950/20 dark:ring-emerald-400/40'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400 dark:text-emerald-200' : 'text-zinc-400'}`} />
                                <span className="truncate">{type.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 2. Subcategory Filter Pills (Scrollable, never overflows) */}
                <div className="w-full min-w-0 max-w-full overflow-x-auto scrollbar-none py-1">
                    <div className="flex items-center gap-1.5 min-w-max">
                        <button
                            type="button"
                            onClick={() => {
                                router.get('/produk', {
                                    type: activeType === 'all' ? undefined : activeType,
                                    search: searchQuery || undefined,
                                }, { preserveState: true });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                !filters.kategori
                                    ? 'bg-zinc-950 text-white dark:bg-zinc-700 dark:text-white shadow-xs'
                                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Semua {activeType === 'minuman' ? 'Minuman' : activeType === 'makanan' ? 'Makanan' : activeType === 'snack' ? 'Camilan' : 'Kategori'}
                        </button>
                        {activeSubcategories.map((c) => {
                            const isSelected = filters.kategori === c.slug;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        router.get('/produk', {
                                            type: activeType === 'all' ? undefined : activeType,
                                            kategori: isSelected ? undefined : c.slug,
                                            search: searchQuery || undefined,
                                        }, { preserveState: true });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                        isSelected
                                            ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    {c.nama}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Content View ── */}
            {produkList.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs">
                    <Coffee className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Tidak ada menu yang ditemukan</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Coba gunakan kata kunci lain atau tambahkan produk baru.</p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── GRID CARD VIEW (Modern POS Aesthetic) ── */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {produkList.map((item) => {
                        const marginPercent = item.harga > 0 && item.hpp > 0
                            ? Math.round(((item.harga - item.hpp) / item.harga) * 100)
                            : 0;

                        return (
                            <div 
                                key={item.id}
                                className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 overflow-hidden flex flex-col justify-between transition-all group"
                            >
                                <div>
                                    {/* Card Image Thumbnail */}
                                    <div className="relative aspect-video sm:aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        <img
                                            src={getProductImage(item.nama, item.gambar)}
                                            alt={item.nama}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                        />
                                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                            {item.is_favorit && (
                                                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3 fill-zinc-950" /> Best
                                                </span>
                                            )}
                                            {item.kategori?.nama && (
                                                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[9px]">
                                                    {item.kategori.nama}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setToggleTarget(item)}
                                            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition backdrop-blur-md ${
                                                item.is_active 
                                                    ? 'bg-emerald-500/90 text-white ring-1 ring-emerald-400' 
                                                    : 'bg-rose-500/90 text-white ring-1 ring-rose-400'
                                            }`}
                                            title="Klik untuk mengubah ketersediaan"
                                        >
                                            {item.is_active ? 'Tersedia' : 'Habis'}
                                        </button>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-3.5 space-y-2">
                                        <div className="flex items-start justify-between gap-1">
                                            <h3 className="font-bold text-xs text-zinc-950 dark:text-white line-clamp-1 leading-snug">
                                                {item.nama}
                                            </h3>
                                        </div>

                                        <div className="flex items-baseline justify-between pt-1">
                                            <div>
                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block leading-none">Harga Jual</span>
                                                <span className="text-sm font-black font-mono text-zinc-950 dark:text-white mt-0.5 block">
                                                    {rupiah(item.harga)}
                                                </span>
                                            </div>
                                            {item.hpp > 0 && (
                                                <div className="text-right">
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block leading-none">HPP Modal</span>
                                                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                                                        {rupiah(item.hpp)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Varian & Modifiers Pills */}
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 pt-1">
                                            <span>{item.varian?.length || 0} varian</span>
                                            <span>•</span>
                                            <span>{item.modifier?.length || 0} modifier</span>
                                            {marginPercent > 0 && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Margin ~{marginPercent}%</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 bg-zinc-50/50 dark:bg-zinc-950/40">
                                    <button
                                        type="button"
                                        onClick={() => setToggleTarget(item)}
                                        className="text-[11px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition"
                                    >
                                        Ubah Status
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            href={`/produk/${item.id}/edit`}
                                            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition"
                                            title="Edit Menu"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(item)}
                                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition"
                                            title="Hapus Menu"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── TABLE VIEW ── */
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/90 dark:border-zinc-800 uppercase text-zinc-500 dark:text-zinc-400 font-bold tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Menu</th>
                                <th className="px-5 py-3.5">Kategori</th>
                                <th className="px-5 py-3.5">Harga Jual</th>
                                <th className="px-5 py-3.5">HPP (Modal)</th>
                                <th className="px-5 py-3.5">Varian &amp; Opsi</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
                            {produkList.map((item) => (
                                <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={getProductImage(item.nama, item.gambar)}
                                                alt={item.nama}
                                                className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 flex-shrink-0"
                                                loading="lazy"
                                            />
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-zinc-950 dark:text-white">{item.nama}</span>
                                                    {item.is_favorit && (
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400 font-medium">
                                        {item.kategori?.nama || '-'}
                                    </td>
                                    <td className="px-5 py-3.5 font-mono font-bold text-zinc-950 dark:text-white">
                                        {rupiah(item.harga)}
                                    </td>
                                    <td className="px-5 py-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                                        {rupiah(item.hpp)}
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400">
                                        {item.varian?.length || 0} varian, {item.modifier?.length || 0} modifier
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => setToggleTarget(item)}
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition ${
                                                item.is_active 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50' 
                                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
                                            }`}
                                        >
                                            {item.is_active ? 'Tersedia' : 'Habis'}
                                        </button>
                                    </td>
                                    <td className="px-5 py-3.5 text-right space-x-1.5">
                                        <Link
                                            href={`/produk/${item.id}/edit`}
                                            className="p-1.5 inline-flex rounded-lg text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                            title="Edit Menu"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget(item)}
                                            className="p-1.5 inline-flex rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                            title="Hapus Menu"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── MODAL POP-UP KONFIRMASI HAPUS PRODUK (DENGAN KEYBINDING ACTIVE) ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                        Hapus Menu Produk
                                    </h3>
                                    <p className="text-[10px] text-zinc-400">
                                        Tindakan ini tidak dapat dibatalkan.
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

                        {/* Product Preview Card */}
                        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center gap-3">
                            <img
                                src={getProductImage(deleteTarget.nama, deleteTarget.gambar)}
                                alt={deleteTarget.nama}
                                className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                            />
                            <div>
                                <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                                    {deleteTarget.nama}
                                </h4>
                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                                    {rupiah(deleteTarget.harga)}
                                </span>
                                <span className="text-[10px] text-zinc-400 block">
                                    Kategori: {deleteTarget.kategori?.nama || '-'}
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Apakah Anda yakin ingin menghapus menu <b>{deleteTarget.nama}</b> dari daftar katalog cafe? Menu ini tidak akan tampil lagi di sistem POS Kasir.
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
                                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Menu (Enter)'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL POP-UP TOGGLE KETERSEDIAAN MENU ── */}
            {toggleTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                                    toggleTarget.is_active ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                                }`}>
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-white">
                                        {toggleTarget.is_active ? 'Nonaktifkan Menu' : 'Aktifkan Menu'}
                                    </h3>
                                    <p className="text-[10px] text-zinc-400">
                                        Status ketersediaan di POS Kasir
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setToggleTarget(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Ubah status ketersediaan menu <b>{toggleTarget.nama}</b> menjadi{' '}
                            <span className={toggleTarget.is_active ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {toggleTarget.is_active ? 'Habis (Nonaktif)' : 'Tersedia (Aktif)'}
                            </span>?
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setToggleTarget(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Batal (Esc)
                            </button>
                            <button
                                type="button"
                                onClick={executeToggle}
                                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 ${
                                    toggleTarget.is_active ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Konfirmasi (Enter)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
