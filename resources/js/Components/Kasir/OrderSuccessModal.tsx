import React from 'react';
import { CheckCircle2, Printer, FileText, PlusCircle, Sparkles, X } from 'lucide-react';
import { rupiah } from '@/lib/format';

interface Props {
    isOpen: boolean;
    orderId: number | null;
    orderNumber?: string | null;
    total: number;
    kembalian: number;
    onClose: () => void;
    onPrintReceipt: () => void;
    onViewReceipt: () => void;
    onNewOrder: () => void;
}

export default function OrderSuccessModal({
    isOpen,
    orderId,
    orderNumber,
    total,
    kembalian,
    onClose,
    onPrintReceipt,
    onViewReceipt,
    onNewOrder,
}: Props) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-sm sm:max-w-md shadow-2xl p-5 sm:p-6 text-center space-y-3.5 sm:space-y-4 relative overflow-y-auto my-auto max-h-[85vh] transition-all">
                
                {/* Decorative background glow */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Close X */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition touch-manipulation"
                    aria-label="Tutup"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Celebration Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-inner relative">
                    <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
                    <Sparkles className="w-4 h-4 text-emerald-400 absolute top-2 right-2 animate-bounce" />
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white leading-tight">
                        Pesanan Selesai!
                    </h3>
                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                        Transaksi telah tersimpan dan terkirim otomatis ke KDS Dapur &amp; Barista.
                    </p>
                </div>

                {/* Order Summary Box */}
                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-750 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-700">
                        <span className="text-zinc-500 font-sans">Nomor Pesanan:</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {orderNumber || (orderId ? `#ORD-${orderId}` : 'Pesanan Sukses')}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-sans">Total Transaksi:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {rupiah(total)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-500 font-sans">Uang Kembalian:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                            {rupiah(kembalian)}
                        </span>
                    </div>
                </div>

                {/* Actions (Touch-friendly for tablet and mobile) */}
                <div className="space-y-2 pt-1">
                    <button
                        type="button"
                        onClick={onPrintReceipt}
                        className="w-full py-3 sm:py-2.5 px-4 rounded-xl bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 touch-manipulation min-h-[44px]"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak Struk Thermal</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={onViewReceipt}
                            className="py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation min-h-[44px]"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Lihat Struk</span>
                        </button>
                        <button
                            type="button"
                            onClick={onNewOrder}
                            className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation min-h-[44px]"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Transaksi Baru</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
