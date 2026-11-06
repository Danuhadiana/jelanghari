import React from 'react';
import { rupiah } from '@/lib/format';
import { Sparkles, Plus } from 'lucide-react';
import { getProductImage } from '@/lib/productImages';

export interface ProdukItem {
    id: number;
    nama: string;
    slug: string;
    deskripsi?: string | null;
    harga: number;
    hpp: number;
    gambar?: string | null;
    is_favorit: boolean;
    kategori: { nama: string; slug: string };
    varian?: Array<{ id: number; nama: string; harga_tambahan: number; is_default: boolean }>;
    modifier?: Array<{ id: number; nama: string; harga: number; tipe: string }>;
}

interface Props {
    produk: ProdukItem;
    onSelect: (produk: ProdukItem) => void;
}

export default function ProdukCard({ produk, onSelect }: Props) {
    const hasOptions = (produk.varian && produk.varian.length > 0) || (produk.modifier && produk.modifier.length > 0);
    const imageUrl = getProductImage(produk.nama, produk.gambar);

    return (
        <div
            onClick={() => onSelect(produk)}
            className="group relative bg-white dark:bg-zinc-900 rounded-[16px] border border-zinc-200 dark:border-zinc-800 p-3 flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer overflow-hidden"
        >
            {/* Top Image + Badges */}
            <div className="relative w-full h-28 rounded-[12px] overflow-hidden mb-2.5 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={produk.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                {produk.kategori?.nama && (
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-900 dark:text-white bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-2xs border border-zinc-200/50 dark:border-white/10">
                            {produk.kategori.nama}
                        </span>
                    </div>
                )}

                {produk.is_favorit && (
                    <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-950 bg-emerald-400/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> Best
                        </span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="mb-2 flex-1 flex flex-col justify-start">
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition line-clamp-2 leading-snug">
                    {produk.nama}
                </h3>
                {produk.deskripsi && (
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {produk.deskripsi}
                    </p>
                )}
            </div>

            {/* Price & Add Button */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                <div>
                    <span className="text-xs font-mono font-bold text-zinc-950 dark:text-white">
                        {rupiah(produk.harga)}
                    </span>
                    {hasOptions && (
                        <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            + opsi varian
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    className="w-7 h-7 rounded-[8px] bg-zinc-100 dark:bg-zinc-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition text-zinc-700 dark:text-zinc-300"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
