import React, { useState } from 'react';
import { X, Users } from 'lucide-react';

interface Meja {
    id: number;
    no_meja: string;
    kapasitas: number;
    lokasi: string;
    status: 'kosong' | 'terisi' | 'reserved';
}

interface Props {
    isOpen: boolean;
    mejaList: Meja[];
    selectedMejaId: number | null;
    onClose: () => void;
    onSelect: (mejaId: number, noMeja: string) => void;
}

export default function TableModal({ isOpen, mejaList, selectedMejaId, onClose, onSelect }: Props) {
    if (!isOpen) return null;

    const [filterLokasi, setFilterLokasi] = useState<'Semua' | 'Indoor' | 'Outdoor'>('Semua');

    const filtered = (mejaList || []).filter(m => {
        if (filterLokasi === 'Semua') return true;
        return m.lokasi?.toLowerCase() === filterLokasi.toLowerCase();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[85vh] transition-all">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60 shrink-0">
                    <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-white leading-tight">Pilih Meja Tamu</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Pilih meja yang tersedia untuk pesanan Dine-In</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3 bg-zinc-50/80 dark:bg-zinc-850/60 border-b border-zinc-200 dark:border-zinc-800 flex gap-1.5 shrink-0">
                    {(['Semua', 'Indoor', 'Outdoor'] as const).map(lok => (
                        <button
                            key={lok}
                            type="button"
                            onClick={() => setFilterLokasi(lok)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${
                                filterLokasi === lok
                                    ? 'bg-zinc-950 dark:bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                            }`}
                        >
                            {lok}
                        </button>
                    ))}
                </div>

                <div className="p-4 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-1">
                    {filtered.map((m) => {
                        const isSelected = selectedMejaId === m.id;
                        const isKosong = m.status === 'kosong';

                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                    onSelect(m.id, m.no_meja);
                                    onClose();
                                }}
                                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition active:scale-95 relative ${
                                    isSelected
                                        ? 'bg-zinc-950 dark:bg-emerald-600 text-white border-zinc-950 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                        : isKosong
                                        ? 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-white dark:hover:bg-zinc-800 shadow-xs'
                                        : 'bg-zinc-100/60 dark:bg-zinc-800/40 border-zinc-200/60 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 opacity-60'
                                }`}
                            >
                                <span className="font-mono font-black text-sm sm:text-base">Meja {m.no_meja}</span>
                                <div className="flex items-center gap-1 text-[10px] mt-1 opacity-75 font-medium">
                                    <Users className="w-3 h-3" />
                                    <span>{m.kapasitas} kursi</span>
                                </div>
                                <span className={`text-[9px] uppercase font-bold mt-1.5 px-1.5 py-0.5 rounded-full ${
                                    isSelected
                                        ? 'bg-white/20 text-white'
                                        : isKosong
                                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                                }`}>
                                    {m.status}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
