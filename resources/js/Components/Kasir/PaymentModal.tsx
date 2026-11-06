import React, { useState } from 'react';
import { rupiah } from '@/lib/format';
import { 
    X, Check, Loader2, CreditCard, Banknote, QrCode, 
    Building2, Smartphone, Ticket, Wallet, Calculator 
} from 'lucide-react';
import KasirCalculatorDrawer from './KasirCalculatorDrawer';

export interface PaymentMethodItem {
    id: string;
    nama?: string;
    label?: string;
    tipe: 'cash' | 'non_cash';
    keterangan?: string;
    desc?: string;
    is_aktif?: boolean;
}

interface Props {
    isOpen: boolean;
    total: number;
    isProcessing: boolean;
    onClose: () => void;
    onSubmit: (payload: { metode: string; bayar: number; metodeLabel?: string }) => void;
    paymentSettings?: {
        metode_pembayaran_list?: PaymentMethodItem[];
        metode_cash?: boolean;
        metode_qris?: boolean;
        metode_debit?: boolean;
        metode_transfer?: boolean;
        qris_nama?: string;
        transfer_bank?: string;
        debit_nama?: string;
        [key: string]: any;
    };
}

const getMethodIcon = (id: string, nama: string, tipe: string) => {
    const idLower = (id || '').toLowerCase();
    const namaLower = (nama || '').toLowerCase();

    if (tipe === 'cash' || idLower.includes('cash') || namaLower.includes('tunai') || namaLower.includes('cash')) {
        return Banknote;
    }
    if (idLower.includes('qris') || namaLower.includes('qris')) {
        return QrCode;
    }
    if (
        idLower.includes('transfer') || namaLower.includes('transfer') || 
        idLower.includes('bank') || namaLower.includes('bank') || 
        idLower.includes('bca') || namaLower.includes('bca') || 
        namaLower.includes('mandiri') || namaLower.includes('bni') || namaLower.includes('bri')
    ) {
        return Building2;
    }
    if (idLower.includes('voucher') || namaLower.includes('voucher') || idLower.includes('kupon')) {
        return Ticket;
    }
    if (
        idLower.includes('gopay') || idLower.includes('ovo') || idLower.includes('dana') || 
        idLower.includes('shopee') || namaLower.includes('wallet') || namaLower.includes('ewallet')
    ) {
        return Smartphone;
    }
    return CreditCard;
};

export default function PaymentModal({ isOpen, total, isProcessing, onClose, onSubmit, paymentSettings }: Props) {
    if (!isOpen) return null;

    const availableMethods = React.useMemo(() => {
        if (Array.isArray(paymentSettings?.metode_pembayaran_list) && paymentSettings.metode_pembayaran_list.length > 0) {
            const list = paymentSettings.metode_pembayaran_list
                .filter((m) => m.is_aktif !== false)
                .map((m) => {
                    const idStr = String(m.id || '');
                    const labelStr = String(m.nama || m.label || idStr);
                    const tipeVal = (m.tipe === 'cash' ? 'cash' : 'non_cash') as 'cash' | 'non_cash';
                    return {
                        id: idStr,
                        label: labelStr,
                        tipe: tipeVal,
                        desc: String(m.keterangan || m.desc || ''),
                        icon: getMethodIcon(idStr, labelStr, tipeVal),
                    };
                });
            if (list.length > 0) return list;
        }

        // Fallback backward compatibility
        const legacyList = [
            (paymentSettings?.metode_cash ?? true) && { 
                id: 'cash', 
                label: 'Cash / Tunai', 
                tipe: 'cash' as const, 
                icon: Banknote, 
                desc: 'Uang tunai kasir' 
            },
            (paymentSettings?.metode_qris ?? true) && { 
                id: 'qris', 
                label: 'QRIS', 
                tipe: 'non_cash' as const, 
                icon: QrCode, 
                desc: paymentSettings?.qris_nama || 'QRIS Jelang Hari (All E-Wallet / Bank)' 
            },
            (paymentSettings?.metode_debit ?? true) && { 
                id: 'debit', 
                label: 'Kartu Debit', 
                tipe: 'non_cash' as const, 
                icon: CreditCard, 
                desc: paymentSettings?.debit_nama || 'Mesin EDC' 
            },
            (paymentSettings?.metode_transfer ?? true) && { 
                id: 'transfer', 
                label: 'Transfer Bank', 
                tipe: 'non_cash' as const, 
                icon: Building2, 
                desc: paymentSettings?.transfer_bank || 'BCA 1234567890 a.n Jelang Hari' 
            },
        ].filter(Boolean) as { id: string; label: string; tipe: 'cash' | 'non_cash'; icon: any; desc: string }[];

        return legacyList.length > 0 ? legacyList : [{ id: 'cash', label: 'Cash / Tunai', tipe: 'cash' as const, icon: Banknote, desc: 'Uang tunai' }];
    }, [paymentSettings]);

    const [metode, setMetode] = useState<string>(() => availableMethods[0]?.id || 'cash');
    const [nominalBayar, setNominalBayar] = useState<number>(total);
    const [isPaymentCalcOpen, setIsPaymentCalcOpen] = useState(false);

    // Selected method object
    const currentMethod = availableMethods.find(m => m.id === metode) || availableMethods[0];
    const isCash = currentMethod?.tipe === 'cash';

    // Ensure valid active method
    React.useEffect(() => {
        if (!availableMethods.some(m => m.id === metode)) {
            setMetode(availableMethods[0]?.id || 'cash');
        }
    }, [availableMethods, metode]);

    // Reset nominal bayar whenever total changes or method changes
    React.useEffect(() => {
        setNominalBayar(total);
    }, [total, metode]);

    const kembalian = Math.max(0, nominalBayar - total);
    const isKurang = isCash && nominalBayar < total;

    const fastCashOptions = [
        total,
        Math.ceil(total / 10000) * 10000,
        Math.ceil(total / 50000) * 50000,
        100000,
    ].filter((v, i, a) => a.indexOf(v) === i && v >= total);

    const handleConfirm = () => {
        onSubmit({
            metode: currentMethod?.id || 'cash',
            bayar: isCash ? nominalBayar : total,
            metodeLabel: currentMethod?.label,
        });
    };

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

    const CurrentIcon = currentMethod?.icon || CreditCard;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[85vh] transition-all">
                {/* Header */}
                <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/70 shrink-0">
                    <div>
                        <h3 className="font-bold text-sm sm:text-base text-zinc-950 dark:text-white leading-tight">Selesaikan Pembayaran</h3>
                        <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Pilih metode bayar aktif dan konfirmasi transaksi</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        disabled={isProcessing} 
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition touch-manipulation"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-3.5 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
                    {/* Total Tagihan Box */}
                    <div className="bg-zinc-950 text-white rounded-2xl p-4 text-center border border-zinc-800 shadow-md">
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-bold">Total Tagihan</span>
                        <div className="text-2xl sm:text-3xl font-mono font-black mt-0.5 text-white">
                            {rupiah(total)}
                        </div>
                    </div>

                    {/* Metode Pembayaran Aktif */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Metode Pembayaran
                            </label>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                {availableMethods.length} Channel Aktif
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {availableMethods.map((m) => {
                                const Icon = m.icon;
                                const active = metode === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => {
                                            setMetode(m.id);
                                            if (m.tipe !== 'cash') setNominalBayar(total);
                                        }}
                                        className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition active:scale-95 touch-manipulation min-h-[62px] text-center ${
                                            active
                                                ? 'bg-zinc-950 dark:bg-emerald-600 text-white border-zinc-950 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                                                : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-750'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <Icon className={`w-4 h-4 ${active ? 'text-amber-400 dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}`} />
                                            {m.tipe === 'cash' && (
                                                <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                                                    active ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                }`}>
                                                    Cash
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-bold leading-tight truncate max-w-full">
                                            {m.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Keterangan Akun / Rekening Khusus Metode Terpilih */}
                    {currentMethod?.desc && (
                        <div className="p-3 bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                                <CurrentIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Informasi {currentMethod.label}</span>
                            </div>
                            <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-mono font-medium whitespace-pre-line">
                                {currentMethod.desc}
                            </p>
                        </div>
                    )}

                    {/* Jika Non-Cash: Tampilkan keterangan nominal pas */}
                    {!isCash && (
                        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-zinc-600 dark:text-zinc-300 font-medium">Nominal Transaksi (Pas):</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                {rupiah(total)}
                            </span>
                        </div>
                    )}

                    {/* Jika Cash: Input Nominal Uang Diterima & Kembalian */}
                    {isCash && (
                        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                        Nominal Uang Diterima
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentCalcOpen(true)}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
                                    >
                                        <Calculator className="w-3.5 h-3.5" />
                                        <span>Kalkulator</span>
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    min={total}
                                    step="any"
                                    value={nominalBayar || ''}
                                    onChange={(e) => setNominalBayar(parseFloat(e.target.value) || 0)}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl font-mono text-lg font-bold text-zinc-950 dark:text-white focus:outline-none focus:border-zinc-950 dark:focus:border-emerald-500"
                                    placeholder={`Min. ${total}`}
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {fastCashOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setNominalBayar(opt)}
                                        className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition active:scale-95 touch-manipulation"
                                    >
                                        {opt === total ? 'Uang Pas' : rupiah(opt)}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/70 rounded-xl p-3 flex items-center justify-between border border-zinc-200 dark:border-zinc-700">
                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Uang Kembalian:</span>
                                <span className={`font-mono text-base sm:text-lg font-black ${isKurang ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {isKurang ? 'Kurang nominal' : rupiah(kembalian)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls: Responsive Buttons */}
                <div className="p-3.5 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 bg-zinc-50 dark:bg-zinc-800/70 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition active:scale-95 touch-manipulation min-h-[44px] flex items-center justify-center"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={isProcessing || isKurang}
                        onClick={handleConfirm}
                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 touch-manipulation min-h-[44px]"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Menyimpan Transaksi...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Konfirmasi &amp; Cetak Struk</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Slide-over Drawer Kalkulator Pembayaran Kasir */}
            <KasirCalculatorDrawer
                isOpen={isPaymentCalcOpen}
                onClose={() => setIsPaymentCalcOpen(false)}
                onApplyAmount={(amount) => setNominalBayar(amount)}
                initialAmount={nominalBayar || total}
                title="Kalkulator"
            />
        </div>
    );
}
