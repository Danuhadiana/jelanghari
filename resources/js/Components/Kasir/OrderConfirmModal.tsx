import React from 'react';
import { 
    AlertCircle, CheckCircle2, ChevronRight, UtensilsCrossed, 
    CreditCard, User, MapPin, Receipt, X 
} from 'lucide-react';
import { rupiah } from '@/lib/format';

interface CartItem {
    produkId: number;
    nama: string;
    varianId?: number | null;
    namaVarian?: string | null;
    harga: number;
    qty: number;
    subtotal: number;
    modifiers: Array<{ id: number; nama: string; harga: number }>;
    catatan?: string;
}

interface Props {
    isOpen: boolean;
    items: CartItem[];
    tipe: string;
    noMeja?: string | null;
    namaPelanggan: string;
    catatanPesanan?: string;
    metode: string;
    subtotal: number;
    diskon?: number;
    service: number;
    pajak: number;
    grandTotal: number;
    bayar: number;
    kembalian: number;
    poinDidapat?: number;
    isProcessing: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function OrderConfirmModal({
    isOpen,
    items,
    tipe,
    noMeja,
    namaPelanggan,
    catatanPesanan,
    metode,
    subtotal,
    diskon = 0,
    service,
    pajak,
    grandTotal,
    bayar,
    kembalian,
    poinDidapat = 0,
    isProcessing,
    onClose,
    onConfirm,
}: Props) {
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isProcessing) {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isProcessing, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-md md:max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh] transition-all">
                
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/70 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight">
                                Konfirmasi Pesanan Kasir
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                                Periksa pesanan &amp; rincian pembayaran sebelum diproses
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition touch-manipulation"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 text-xs flex-1">
                    
                    {/* Tipe & Lokasi Pesanan */}
                    <div className="p-2.5 sm:p-3 bg-zinc-100 dark:bg-zinc-800/70 rounded-xl sm:rounded-2xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-900 text-white dark:bg-zinc-700 shrink-0">
                                {tipe === 'dine_in' || tipe === 'dinein' ? 'Dine In' : tipe === 'takeaway' || tipe === 'take_away' ? 'Take Away' : 'Delivery'}
                            </span>
                            <span className="font-semibold text-zinc-900 dark:text-white truncate">
                                {namaPelanggan || 'Pelanggan Walk-In'}
                            </span>
                        </div>
                        {(tipe === 'dine_in' || tipe === 'dinein') && noMeja && (
                            <span className="px-2.5 py-1 rounded-lg font-mono font-black bg-amber-500 text-zinc-950 text-xs shadow-xs shrink-0">
                                Meja #{noMeja}
                            </span>
                        )}
                    </div>

                    {/* Ringkasan Item Pesanan */}
                    <div className="space-y-1.5 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 uppercase tracking-wider pb-1 border-b border-zinc-200 dark:border-zinc-800">
                            <span>Item ({items.length} jenis)</span>
                            <span>Subtotal</span>
                        </div>
                        <div className="max-h-[140px] sm:max-h-[180px] md:max-h-[220px] overflow-y-auto space-y-2 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800">
                            {items.map((it, idx) => (
                                <div key={idx} className="pt-1.5 first:pt-0 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 leading-tight">
                                            <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">{it.qty}x</span>
                                            <span className="truncate">{it.nama}</span>
                                        </div>
                                        {it.namaVarian && (
                                            <span className="text-[10px] text-zinc-500 block mt-0.5">
                                                {it.namaVarian}
                                            </span>
                                        )}
                                        {it.modifiers && it.modifiers.length > 0 && (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                                                +{it.modifiers.map(m => m.nama).join(', ')}
                                            </span>
                                        )}
                                        {it.catatan && (
                                            <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block mt-0.5">
                                                *{it.catatan}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 shrink-0 ml-1">
                                        {rupiah(it.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rincian Finansial & Pembayaran */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl sm:rounded-2xl space-y-1.5 font-mono">
                        <div className="flex justify-between text-zinc-500 text-[11px]">
                            <span className="font-sans">Subtotal:</span>
                            <span>{rupiah(subtotal)}</span>
                        </div>
                        {diskon > 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                <span className="font-sans">Diskon (Voucher/Poin):</span>
                                <span>-{rupiah(diskon)}</span>
                            </div>
                        )}
                        {service > 0 && (
                            <div className="flex justify-between text-zinc-500 text-[11px]">
                                <span className="font-sans">Service:</span>
                                <span>{rupiah(service)}</span>
                            </div>
                        )}
                        {pajak > 0 && (
                            <div className="flex justify-between text-zinc-500 text-[11px]">
                                <span className="font-sans">Pajak (PB1):</span>
                                <span>{rupiah(pajak)}</span>
                            </div>
                        )}
                        {poinDidapat > 0 && (
                            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold text-[10px] bg-amber-50/70 dark:bg-amber-950/30 px-2 py-0.5 rounded">
                                <span className="font-sans">⚡ Poin Member Didapat:</span>
                                <span>+{poinDidapat} Pts</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-sm text-zinc-950 dark:text-white pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
                            <span className="font-sans">Grand Total:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">{rupiah(grandTotal)}</span>
                        </div>
                        <div className="flex justify-between text-[11px] pt-1 border-t border-zinc-200/60 dark:border-zinc-700/60">
                            <span className="text-zinc-500 font-sans">Metode: <b className="uppercase text-zinc-800 dark:text-zinc-200">{metode}</b></span>
                            <span className="text-zinc-700 dark:text-zinc-300">Bayar: {rupiah(bayar)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs text-blue-600 dark:text-blue-400">
                            <span className="font-sans">Kembalian:</span>
                            <span className="font-black">{rupiah(kembalian)}</span>
                        </div>
                    </div>

                </div>

                {/* Footer Buttons (Touch-friendly & Responsive for Mobile, Tab & Desktop) */}
                <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 bg-zinc-50 dark:bg-zinc-800/70 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full sm:flex-1 py-3 sm:py-2.5 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 touch-manipulation min-h-[44px] flex items-center justify-center"
                    >
                        Periksa Kembali
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isProcessing}
                        className="w-full sm:flex-1 py-3 sm:py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 disabled:opacity-50 touch-manipulation min-h-[44px]"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isProcessing ? 'Memproses...' : 'Konfirmasi & Simpan'}</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
