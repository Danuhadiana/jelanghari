import React from 'react';
import { Coffee, UtensilsCrossed, Cookie, Sparkles } from 'lucide-react';

export interface Category {
    id: number;
    nama: string;
    slug: string;
}

export type MenuType = 'all' | 'minuman' | 'makanan' | 'snack';

export const DRINK_SLUGS = [
    'signature-coffee', 'classic-espresso', 'manual-brew', 'non-coffee-tea',
    'signature', 'coffee-based', 'non-coffee', 'tropical'
];

export const FOOD_SLUGS = [
    'main-course', 'traditional', 'noodles', 'western'
];

export const SNACK_SLUGS = [
    'snack-pastry', 'snacks', 'pastry-dessert'
];

interface Props {
    categories: Category[];
    selectedType: MenuType;
    selectedCategory: string | null;
    onSelectType: (type: MenuType) => void;
    onSelectCategory: (slug: string | null) => void;
}

export default function CategoryFilter({
    categories,
    selectedType,
    selectedCategory,
    onSelectType,
    onSelectCategory,
}: Props) {
    // Filter relevant subcategories based on selected primary type
    const activeSubcategories = categories.filter((c) => {
        if (selectedType === 'minuman') return DRINK_SLUGS.includes(c.slug);
        if (selectedType === 'makanan') return FOOD_SLUGS.includes(c.slug);
        if (selectedType === 'snack') return SNACK_SLUGS.includes(c.slug);
        return false;
    });

    const primaryTypes = [
        { id: 'all' as MenuType, label: 'Semua Menu', icon: Sparkles },
        { id: 'minuman' as MenuType, label: 'Minuman (Barista)', icon: Coffee },
        { id: 'makanan' as MenuType, label: 'Makanan Utama', icon: UtensilsCrossed },
        { id: 'snack' as MenuType, label: 'Camilan & Pastry', icon: Cookie },
    ];

    return (
        <div className="space-y-2">
            {/* 1. Primary Category Tabs (Efektif, Bersih & Ramah Layar Sentuh) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                {primaryTypes.map((type) => {
                    const Icon = type.icon;
                    const isActive = selectedType === type.id;
                    return (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => {
                                onSelectType(type.id);
                                onSelectCategory(null);
                            }}
                            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[10px] text-xs font-bold transition-all ${
                                isActive
                                    ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-600/40'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-zinc-800/60'
                            }`}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                            <span className="truncate">{type.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* 2. Secondary Subcategory Filter Pills (Hanya muncul jika kategori primer aktif punya subkategori) */}
            {selectedType !== 'all' && activeSubcategories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-0.5">
                    <button
                        type="button"
                        onClick={() => onSelectCategory(null)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                            selectedCategory === null
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                        }`}
                    >
                        Semua {selectedType === 'minuman' ? 'Minuman' : selectedType === 'makanan' ? 'Makanan' : 'Camilan'}
                    </button>
                    {activeSubcategories.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => onSelectCategory(c.slug)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                                selectedCategory === c.slug
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            {c.nama}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
