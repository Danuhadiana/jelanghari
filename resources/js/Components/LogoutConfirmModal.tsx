import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
}

export default function LogoutConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Konfirmasi Keluar',
    description = 'Apakah Anda yakin ingin mengakhiri sesi dan keluar dari akun Jelang Hari?'
}: Props) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col space-y-4 my-auto max-h-[85vh] animate-in zoom-in-95 duration-150"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        title="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition active:scale-95 text-center"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                        className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Ya, Keluar</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
