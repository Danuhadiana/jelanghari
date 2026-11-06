import React, { useState, useEffect } from 'react';
import { ProdukItem } from './ProdukCard';
import { CartModifier } from '@/Stores/cartStore';
import { rupiah } from '@/lib/format';
import { X, Check } from 'lucide-react';

interface Props {
    produk: ProdukItem | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        produkId: number;
        nama: string;
        varianId: number | null;
        namaVarian: string | null;
        harga: number;
        hpp: number;
        modifiers: CartModifier[];
        qty: number;
        catatan: string;
    }) => void;
}

export default function VariantModifierModal({ produk, isOpen, onClose, onConfirm }: Props) {
    if (!isOpen || !produk) return null;

    const [selectedVarianId, setSelectedVarianId] = useState<number | null>(null);
    const [selectedModifiers, setSelectedModifiers] = useState<CartModifier[]>([]);
    const [qty, setQty] = useState(1);
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        if (produk.varian && produk.varian.length > 0) {
            const def = produk.varian.find(v => v.is_default) || produk.varian[0];
            setSelectedVarianId(def.id);
        } else {
            setSelectedVarianId(null);
        }
        setSelectedModifiers([]);
        setQty(1);
        setCatatan('');
    }, [produk]);

    const activeVarian = produk.varian?.find(v => v.id === selectedVarianId);
    const basePrice = produk.harga + (activeVarian?.harga_tambahan || 0);
    const modifierPriceTotal = selectedModifiers.reduce((acc, m) => acc + m.harga, 0);
    const unitPrice = basePrice + modifierPriceTotal;
    const finalTotalPrice = unitPrice * qty;

    const toggleModifier = (mod: { id: number; nama: string; harga: number }) => {
        if (selectedModifiers.some(m => m.id === mod.id)) {
            setSelectedModifiers(selectedModifiers.filter(m => m.id !== mod.id));
        } else {
            setSelectedModifiers([...selectedModifiers, { id: mod.id, nama: mod.nama, harga: mod.harga }]);
        }
    };

    const handleAdd = () => {
        onConfirm({
            produkId: produk.id,
            nama: produk.nama,
            varianId: selectedVarianId,
            namaVarian: activeVarian?.nama || null,
            harga: unitPrice,
            hpp: produk.hpp,
            modifiers: selectedModifiers,
            qty,
            catatan,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[85vh] transition-all">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 shrink-0">
                    <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-white leading-tight">{produk.nama}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-bold mt-0.5">{rupiah(produk.harga)}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs">
                    {produk.varian && produk.varian.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                                Pilihan Ukuran / Varian
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {produk.varian.map((v) => {
                                    const active = selectedVarianId === v.id;
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => setSelectedVarianId(v.id)}
                                            className={`p-2.5 rounded-xl text-left border text-xs font-semibold flex items-center justify-between transition active:scale-95 ${
                                                active
                                                    ? 'bg-zinc-950 dark:bg-emerald-600 text-white border-zinc-950 dark:border-emerald-500 shadow-xs'
                                                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                            }`}
                                        >
                                            <span className="truncate">{v.nama}</span>
                                            <span className="font-mono text-[11px] shrink-0 ml-1">
                                                {v.harga_tambahan > 0 ? `+${rupiah(v.harga_tambahan)}` : 'Normal'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {produk.modifier && produk.modifier.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                                Tambahan / Modifiers
                            </label>
                            <div className="space-y-1.5">
                                {produk.modifier.map((m) => {
                                    const checked = selectedModifiers.some(mod => mod.id === m.id);
                                    return (
                                        <div
                                            key={m.id}
                                            onClick={() => toggleModifier(m)}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition active:scale-98 ${
                                                checked
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                                                    : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                                    checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900'
                                                }`}>
                                                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span>{m.nama}</span>
                                            </div>
                                            <span className="font-mono text-xs">
                                                {m.harga > 0 ? `+${rupiah(m.harga)}` : 'Gratis'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                            Catatan Khusus Barista / Dapur
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Less ice, jangan terlalu manis, pisah saus..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                        <button
                            type="button"
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold flex items-center justify-center text-xs active:scale-95 transition"
                        >
                            -
                        </button>
                        <span className="font-mono font-bold text-xs px-2 text-zinc-900 dark:text-white">{qty}</span>
                        <button
                            type="button"
                            onClick={() => setQty(qty + 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold flex items-center justify-center text-xs active:scale-95 transition"
                        >
                            +
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex-1 ml-3 py-2.5 px-4 rounded-xl bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center justify-between active:scale-95"
                    >
                        <span>Tambah ke Pesanan</span>
                        <span className="font-mono font-bold">{rupiah(finalTotalPrice)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
