import React, { useEffect, useState } from 'react';
import { rupiah, tanggal_id } from '@/lib/format';
import { printViaWebUSB, formatStrukRaw } from '@/lib/printer';
import {
    X,
    Printer,
    Share2,
    QrCode,
    Smartphone,
    ExternalLink,
    Copy,
    Check,
    Leaf,
    Send,
    FileText,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

interface Props {
    orderId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function StrukPreviewModal({ orderId, isOpen, onClose }: Props) {
    if (!isOpen || !orderId) return null;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'digital' | 'thermal'>('digital');
    const [customWa, setCustomWa] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/kasir/struk/${orderId}`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(res => res.json())
            .then(res => {
                setData(res);
                if (res?.order?.telepon_pelanggan) {
                    setCustomWa(res.order.telepon_pelanggan);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [orderId]);

    const digitalReceiptUrl = typeof window !== 'undefined' && data?.order
        ? `${window.location.origin}/struk/${data.order.no_struk || data.order.id}`
        : `/struk/${orderId}`;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(digitalReceiptUrl)}`;

    const handlePrint = async () => {
        if (!data) return;
        try {
            const raw = formatStrukRaw(data.order, data.cafe);
            await printViaWebUSB(raw);
        } catch {
            window.print();
        }
    };

    const handleShareWA = () => {
        if (!data?.order) return;
        const targetPhone = customWa || data.order.telepon_pelanggan;
        if (!targetPhone) {
            alert('Silakan masukkan nomor WhatsApp pelanggan terlebih dahulu.');
            return;
        }

        const itemsList = (data.order.items || [])
            .map((it: any) => `• ${it.qty}x ${it.nama_produk} - ${rupiah(it.subtotal)}`)
            .join('\n');

        const text = `☕ *STRUK DIGITAL - ${data.cafe.nama}*\n` +
            `------------------------------------------\n` +
            `No. Struk : #${data.order.no_struk}\n` +
            `Tanggal   : ${tanggal_id(data.order.created_at)}\n` +
            `Pelanggan : ${data.order.nama_pelanggan || 'Pelanggan'}\n\n` +
            `*Rincian Pesanan:*\n${itemsList}\n\n` +
            `Subtotal  : ${rupiah(data.order.subtotal)}\n` +
            (data.order.diskon > 0 ? `Diskon    : -${rupiah(data.order.diskon)}\n` : '') +
            (data.order.pajak > 0 ? `Pajak     : ${rupiah(data.order.pajak)}\n` : '') +
            `*TOTAL*     : *${rupiah(data.order.total)}* (LUNAS - ${String(data.order.metode_bayar || 'CASH').toUpperCase()})\n` +
            `------------------------------------------\n` +
            `🌿 *Lihat Struk Digital Resmi:* \n${digitalReceiptUrl}\n\n` +
            `Terima kasih telah berkunjung ke ${data.cafe.nama}! ✨`;

        const cleanPhone = targetPhone.replace(/^0/, '62').replace(/[^0-9]/g, '');
        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(digitalReceiptUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    useEffect(() => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-lg md:max-w-xl rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[85vh] animate-in zoom-in-95 duration-200 transition-colors">
                {/* Header */}
                <div className="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                            <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-sm text-zinc-950 dark:text-white leading-tight">Struk Transaksi Kasir</h3>
                                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                    Berhasil
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">Kirim struk digital atau cetak thermal fisik</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition touch-manipulation"
                        aria-label="Tutup"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab Pill Switcher (Responsive for all screens) */}
                <div className="px-3.5 sm:px-5 pt-3 shrink-0">
                    <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('digital')}
                            className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation min-h-[40px] ${
                                activeTab === 'digital'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Struk Digital</span>
                            <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-extrabold uppercase shrink-0">
                                Paperless
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('thermal')}
                            className={`flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation min-h-[40px] ${
                                activeTab === 'thermal'
                                    ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700 font-bold'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <Printer className="w-4 h-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                            <span>Kertas Thermal</span>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-3.5 sm:p-5 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="py-16 text-center text-zinc-400 text-xs">
                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Menyiapkan struk transaksi...
                        </div>
                    ) : !data ? (
                        <div className="py-16 text-center text-red-500 text-xs">
                            Gagal memuat struk pesanan.
                        </div>
                    ) : activeTab === 'digital' ? (
                        /* ── TAB STRUK DIGITAL ── */
                        <div className="space-y-4">
                            {/* Eco Paperless Alert */}
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-start gap-2.5">
                                <Leaf className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <span className="font-bold text-emerald-950 dark:text-emerald-200 block">Fitur Struk Digital Anti-Habis</span>
                                    <span className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                                        Pelanggan dapat langsung scan QR di bawah menggunakan kamera HP atau dikirim via WhatsApp tanpa perlu kertas kasir!
                                    </span>
                                </div>
                            </div>

                            {/* QR Code Scan Area */}
                            <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-center space-y-2.5 sm:space-y-3">
                                <div className="inline-block p-2.5 sm:p-3 bg-white rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-md">
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR Struk Digital"
                                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain mx-auto"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-extrabold text-xs sm:text-sm text-zinc-950 dark:text-white">Scan QR Code dengan Kamera HP</h4>
                                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Struk digital otomatis terbuka di smartphone pelanggan
                                    </p>
                                </div>

                                {/* Order Pill */}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
                                    <span className="text-zinc-500 dark:text-zinc-400">No:</span>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">#{data.order.no_struk}</span>
                                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                                    <span className="font-black text-emerald-600 dark:text-emerald-400">{rupiah(data.order.total)}</span>
                                </div>

                                {data.order.member && (
                                    <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-left">
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200 text-amber-900 uppercase">MEMBER</span>
                                                <span className="font-bold text-zinc-900 dark:text-white text-xs">{data.order.member.nama}</span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">{data.order.member.telepon}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-500 block">Saldo Poin</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-xs">⚡ {data.order.member.poin} pts (+{data.order.member.poin_didapat} baru)</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Send to WhatsApp Input Box */}
                            <div className="p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                    Kirim Struk ke WhatsApp Pelanggan:
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="tel"
                                        placeholder="Nomor WhatsApp (misal: 08123456789)"
                                        value={customWa}
                                        onChange={e => setCustomWa(e.target.value)}
                                        className="flex-1 px-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono font-medium outline-none focus:border-emerald-500 text-zinc-900 dark:text-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleShareWA}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 touch-manipulation min-h-[42px] shrink-0"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Kirim WA</span>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons: Copy link & Open Web */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleCopyLink}
                                    className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation min-h-[44px]"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
                                    <span>{copied ? 'Link Tersalin!' : 'Salin Link Struk'}</span>
                                </button>

                                <a
                                    href={digitalReceiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-2.5 sm:py-3 px-3 rounded-xl bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 touch-manipulation min-h-[44px]"
                                >
                                    <ExternalLink className="w-4 h-4 text-emerald-400 dark:text-white" />
                                    <span>Buka Struk Digital</span>
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* ── TAB KERTAS THERMAL ── */
                        <div className="space-y-4">
                            <div className="p-5 font-mono text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700" id="struk-print-area">
                                <div className="text-center space-y-1">
                                    <h2 className="font-bold text-sm uppercase">{data.cafe.nama}</h2>
                                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400">{data.cafe.alamat}</p>
                                    <p className="text-[10px] text-zinc-600 dark:text-zinc-400">Telp: {data.cafe.telepon}</p>
                                </div>

                                <div className="border-t border-dashed border-zinc-400 dark:border-zinc-600 my-2.5" />

                                <div className="space-y-0.5 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>No: {data.order.no_struk}</span>
                                        <span>{tanggal_id(data.order.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kasir: {data.order.kasir?.nama}</span>
                                        <span>Tipe: {data.order.tipe?.toUpperCase()} {data.order.meja ? `(${data.order.meja.no_meja})` : ''}</span>
                                    </div>
                                    {data.order.nama_pelanggan && (
                                        <div className="flex justify-between">
                                            <span>Pelanggan: {data.order.nama_pelanggan}</span>
                                        </div>
                                    )}
                                    {data.order.member && (
                                        <div className="pt-1 mt-1 border-t border-dashed border-zinc-300 dark:border-zinc-700 space-y-0.5 text-[10px] text-emerald-800 dark:text-emerald-400">
                                            <div className="flex justify-between font-bold">
                                                <span>Member: {data.order.member.nama}</span>
                                                <span>⚡ {data.order.member.poin} Pts</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                                                <span>Poin Transaksi Baru:</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{data.order.member.poin_didapat} Pts</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-zinc-400 dark:border-zinc-600 my-2.5" />

                                <div className="space-y-2 text-[11px]">
                                    {data.order.items?.map((item: any) => (
                                        <div key={item.id}>
                                            <div className="flex justify-between font-semibold">
                                                <span>{item.nama_produk} {item.nama_varian ? `(${item.nama_varian})` : ''}</span>
                                                <span>{rupiah(item.subtotal)}</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex justify-between">
                                                <span>{item.qty} x {rupiah(item.harga)}</span>
                                            </div>
                                            {item.modifier_text && (
                                                <div className="text-[9px] text-zinc-500 dark:text-zinc-400 italic">+ {item.modifier_text}</div>
                                            )}
                                            {item.catatan && (
                                                <div className="text-[9px] text-zinc-500 dark:text-zinc-400 italic">* {item.catatan}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-dashed border-zinc-400 dark:border-zinc-600 my-2.5" />

                                <div className="space-y-1 text-[11px]">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{rupiah(data.order.subtotal)}</span>
                                    </div>
                                    {data.order.diskon > 0 && (
                                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                                            <span>Diskon:</span>
                                            <span>-{rupiah(data.order.diskon)}</span>
                                        </div>
                                    )}
                                    {data.order.service > 0 && (
                                        <div className="flex justify-between">
                                            <span>Service:</span>
                                            <span>{rupiah(data.order.service)}</span>
                                        </div>
                                    )}
                                    {data.order.pajak > 0 && (
                                        <div className="flex justify-between">
                                            <span>Pajak (PB1):</span>
                                            <span>{rupiah(data.order.pajak)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-xs pt-1 border-t border-zinc-300 dark:border-zinc-600">
                                        <span>TOTAL:</span>
                                        <span>{rupiah(data.order.total)}</span>
                                    </div>
                                    <div className="flex justify-between pt-1 text-[11px]">
                                        <span>Bayar ({String(data.order.metode_bayar || 'CASH').toUpperCase()}):</span>
                                        <span>{rupiah(data.order.bayar)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>Kembalian:</span>
                                        <span>{rupiah(data.order.kembalian)}</span>
                                    </div>
                                </div>

                                <div className="border-t border-dashed border-zinc-400 dark:border-zinc-600 my-2.5" />

                                <div className="text-center text-[10px] text-zinc-500 dark:text-zinc-400 space-y-1">
                                    <p>{data.cafe.footer}</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="w-full py-3.5 sm:py-3 rounded-2xl bg-zinc-950 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-95 touch-manipulation min-h-[46px]"
                            >
                                <Printer className="w-4 h-4 text-emerald-400 dark:text-white" />
                                <span>Cetak Kertas Thermal (WebUSB / Print)</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-3.5 sm:p-4 bg-zinc-50 dark:bg-zinc-900/90 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-bold text-xs sm:text-sm transition active:scale-95 touch-manipulation min-h-[44px] flex items-center justify-center text-center"
                    >
                        Selesai Transaksi (Pesanan Baru)
                    </button>
                </div>
            </div>
        </div>
    );
}
