import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, Save, ChefHat, Check, Utensils } from 'lucide-react';

interface Props {
    produks?: any[];
    produk?: any[];
    bahanBakus?: any[];
    bahan_baku?: any[];
}

export default function Resep({
    produks = [],
    produk = [],
    bahanBakus = [],
    bahan_baku = [],
}: Props) {
    const productList = (produks && produks.length > 0) ? produks : (produk || []);
    const bahanList = (bahanBakus && bahanBakus.length > 0) ? bahanBakus : (bahan_baku || []);

    const [selectedProdukId, setSelectedProdukId] = useState<number>(productList[0]?.id || 0);
    const activeProduk = productList.find((p) => p.id === selectedProdukId) || productList[0];

    const [recipeItems, setRecipeItems] = useState<Array<{ bahan_id: number; jumlah: number }>>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState(false);

    useEffect(() => {
        if (activeProduk) {
            const rawResep = activeProduk.resep || activeProduk.bahan || [];
            const mapped = rawResep.map((r: any) => ({
                bahan_id: r.bahan_baku_id || r.bahan_id || (bahanList[0]?.id || 1),
                jumlah: Number(r.jumlah_pemakaian || r.jumlah || 10),
            }));
            setRecipeItems(mapped);
        }
    }, [selectedProdukId, activeProduk]);

    const addRow = () => {
        if (bahanList.length === 0) return;
        setRecipeItems([
            ...recipeItems,
            { bahan_id: bahanList[0]?.id || 1, jumlah: 10 }
        ]);
    };

    const removeRow = (idx: number) => {
        setRecipeItems(recipeItems.filter((_, i) => i !== idx));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProduk) return;

        setIsSaving(true);
        const payload = {
            resep: recipeItems.map((r) => ({
                bahan_baku_id: r.bahan_id,
                jumlah_pemakaian: Number(r.jumlah),
            }))
        };

        router.post(`/stok/resep/${activeProduk.id}`, payload, {
            preserveState: true,
            onSuccess: () => {
                setIsSaving(false);
                setSavedNotice(true);
                setTimeout(() => setSavedNotice(false), 2000);
            },
            onError: () => setIsSaving(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Resep & BOM Menu - Jelang Hari" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Resep Menu (Bill of Materials)</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Tentukan gramatur takaran bahan baku yang terpotong otomatis saat menu terjual.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Kolom Daftar Menu Cafe */}
                <div className="bg-white p-4 rounded-[16px] border border-zinc-200 shadow-sm h-[600px] flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5 block px-2">
                        Pilih Menu Cafe ({productList.length} Menu)
                    </span>
                    <div className="space-y-1 overflow-y-auto flex-1 pr-1">
                        {productList.length === 0 ? (
                            <div className="p-8 text-center text-xs text-zinc-400">
                                Belum ada menu yang dibuat.
                            </div>
                        ) : (
                            productList.map((p) => {
                                const isSelected = selectedProdukId === p.id;
                                const resepCount = (p.resep || p.bahan || []).length;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedProdukId(p.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-[12px] text-xs font-semibold transition flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-zinc-950 text-white shadow-sm'
                                                : 'hover:bg-zinc-100 text-zinc-700'
                                        }`}
                                    >
                                        <div className="truncate pr-2">
                                            <span className="block truncate">{p.nama}</span>
                                            <span className={`text-[10px] block ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                                {p.kategori?.nama || 'Menu'}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex-shrink-0 ${
                                            isSelected ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-100 text-zinc-600'
                                        }`}>
                                            {resepCount} bahan
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Kolom Editor Resep Menu Terpilih */}
                <div className="md:col-span-2 bg-white p-6 rounded-[20px] border border-zinc-200 shadow-sm flex flex-col justify-between h-[600px]">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base text-zinc-950">
                                        Resep Takaran: {activeProduk?.nama || 'Pilih Menu'}
                                    </h3>
                                    {savedNotice && (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                                            <Check className="w-3 h-3" /> Tersimpan
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    Bahan yang akan terpotong dari gudang setiap 1 porsi transaksi menu ini.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={addRow}
                                className="px-3 py-1.5 rounded-[10px] bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-800 flex items-center gap-1.5 transition"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Takaran
                            </button>
                        </div>

                        {recipeItems.length === 0 ? (
                            <div className="py-24 text-center text-zinc-400 text-xs flex flex-col items-center justify-center">
                                <ChefHat className="w-10 h-10 stroke-1 text-zinc-300 mb-2" />
                                <span className="font-semibold text-zinc-600">Belum Ada Formula Resep</span>
                                <p className="text-zinc-400 mt-1 max-w-xs">
                                    Klik tombol "+ Tambah Takaran" di kanan atas untuk menyusun gramatur bahan baku.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
                                {recipeItems.map((row, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-zinc-50 rounded-[12px] border border-zinc-200">
                                        <select
                                            value={row.bahan_id}
                                            onChange={(e) => {
                                                const copy = [...recipeItems];
                                                copy[idx].bahan_id = Number(e.target.value);
                                                setRecipeItems(copy);
                                            }}
                                            className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-[8px] text-xs font-semibold text-zinc-900 focus:outline-none focus:border-emerald-500"
                                        >
                                            {bahanList.map((b) => (
                                                <option key={b.id} value={b.id}>
                                                    {b.nama} ({b.satuan})
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min={0.01}
                                                value={row.jumlah}
                                                onChange={(e) => {
                                                    const copy = [...recipeItems];
                                                    copy[idx].jumlah = Number(e.target.value);
                                                    setRecipeItems(copy);
                                                }}
                                                className="w-24 px-2 py-2 bg-white border border-zinc-200 rounded-[8px] text-xs font-mono font-bold text-center text-zinc-900 focus:outline-none focus:border-emerald-500"
                                            />
                                            <span className="text-[11px] text-zinc-500 font-medium w-10 truncate">
                                                {bahanList.find(b => b.id === row.bahan_id)?.satuan || 'unit'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(idx)}
                                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-zinc-200 rounded-lg transition"
                                            title="Hapus Takaran"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex justify-end">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || !activeProduk}
                            className="px-6 py-2.5 rounded-[12px] bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4 text-emerald-400" />
                            <span>{isSaving ? 'Menyimpan Formula...' : 'Simpan Formula Resep'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
