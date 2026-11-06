import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import {
    CheckCircle2,
    Share2,
    Download,
    Wifi,
    Coffee,
    ArrowLeft,
    Sparkles,
    Printer,
    Leaf,
    Clock,
    User,
    MapPin,
    CreditCard
} from 'lucide-react';

interface Props {
    pesanan: {
        id: number;
        nomor_pesanan: string;
        created_at: string;
        nama_pelanggan?: string;
        telepon_pelanggan?: string;
        tipe_pesanan: string;
        meja?: {
            nomor: string;
            kapasitas: number;
            lokasi: string;
        };
        user?: {
            nama?: string;
            name?: string;
        };
        details: Array<{
            id: number;
            nama_produk: string;
            nama_varian?: string;
            harga_satuan: number;
            jumlah: number;
            subtotal: number;
            catatan_khusus?: string;
            modifiers?: Array<{
                nama_modifier: string;
                harga_tambahan: number;
            }>;
        }>;
        subtotal: number;
        diskon: number;
        voucher_kode?: string;
        pajak_nominal: number;
        service_nominal: number;
        pembulatan: number;
        total: number;
        bayar: number;
        kembalian: number;
        metode_pembayaran: string;
        status_pembayaran: string;
        status_pesanan: string;
        catatan?: string;
        waktu_bayar?: string;
    };
    cafe: {
        nama: string;
        alamat: string;
        telepon: string;
        footer: string;
        wifi_ssid?: string;
        wifi_password?: string;
    };
}

export default function DigitalReceipt({ pesanan, cafe }: Props) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrintOrPdf = () => {
        window.print();
    };

    const handleShareWA = () => {
        const url = window.location.href;
        const text = `Halo, berikut struk digital resmi dari ${cafe.nama}:\nNo. Struk: #${pesanan.nomor_pesanan}\nTotal: ${rupiah(pesanan.total)} (LUNAS)\n\nLihat rincian struk lengkap di link ini:\n${url}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    const kasirName = pesanan.user?.nama || pesanan.user?.name || 'Staff Kasir';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
        typeof window !== 'undefined' ? window.location.href : `http://localhost:8000/struk/${pesanan.nomor_pesanan}`
    )}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-stone-100 to-zinc-200 text-zinc-900 py-8 px-4 flex flex-col items-center justify-center font-sans antialiased print:bg-white print:p-0">
            <Head title={`Struk Digital #${pesanan.nomor_pesanan} - ${cafe.nama}`} />

            {/* Back button & Eco badge */}
            <div className="w-full max-w-md flex items-center justify-between mb-4 print:hidden">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Halaman Utama</span>
                </Link>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 text-[11px] font-semibold border border-emerald-200/80 shadow-sm">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Eco Paperless Receipt</span>
                </div>
            </div>

            {/* Receipt Card */}
            <div
                ref={receiptRef}
                className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-zinc-200 overflow-hidden relative print:border-none print:shadow-none"
            >
                {/* Header Decoration */}
                <div className="h-3 bg-gradient-to-r from-emerald-600 via-zinc-900 to-emerald-600" />

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Brand & Verified Badge */}
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-md p-1 border border-zinc-800">
                            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain rounded-xl" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-zinc-950 uppercase">{cafe.nama}</h1>
                            <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-0.5 leading-relaxed">{cafe.alamat}</p>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">Telp: {cafe.telepon}</p>
                        </div>

                        {/* Paid Stamp */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs uppercase tracking-wider shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Pembayaran Lunas</span>
                        </div>
                    </div>

                    {/* Receipt Meta info box */}
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/70 text-xs space-y-2">
                        <div className="flex justify-between items-center text-zinc-600">
                            <span>No. Transaksi</span>
                            <span className="font-mono font-bold text-zinc-950">#{pesanan.nomor_pesanan}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-600">
                            <span>Waktu</span>
                            <span className="font-medium text-zinc-800">{tanggal_id(pesanan.created_at)}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-600">
                            <span>Kasir</span>
                            <span className="font-medium text-zinc-800">{kasirName}</span>
                        </div>
                        <div className="flex justify-between items-center text-zinc-600">
                            <span>Tipe Layanan</span>
                            <span className="font-bold text-zinc-900 uppercase">
                                {pesanan.tipe_pesanan === 'take_away' ? 'Takeaway' : pesanan.tipe_pesanan}
                                {pesanan.meja ? ` (Meja ${pesanan.meja.nomor})` : ''}
                            </span>
                        </div>
                        {pesanan.nama_pelanggan && (
                            <div className="flex justify-between items-center text-zinc-600">
                                <span>Pelanggan</span>
                                <span className="font-semibold text-zinc-950">{pesanan.nama_pelanggan}</span>
                            </div>
                        )}
                    </div>

                    {/* Order Items Table */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-200">
                            <span>Rincian Menu</span>
                            <span>Subtotal</span>
                        </div>

                        <div className="space-y-3.5">
                            {pesanan.details?.map((item) => (
                                <div key={item.id} className="text-xs space-y-1">
                                    <div className="flex justify-between font-semibold text-zinc-900">
                                        <div className="pr-4">
                                            <span>{item.nama_produk}</span>
                                            {item.nama_varian && (
                                                <span className="text-[11px] text-zinc-500 font-normal ml-1">
                                                    ({item.nama_varian})
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-mono font-bold shrink-0">{rupiah(item.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-[11px] text-zinc-500">
                                        <span>
                                            {item.jumlah} × {rupiah(item.harga_satuan)}
                                        </span>
                                    </div>

                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-[10px] text-zinc-500 italic space-y-0.5 pl-2 border-l border-zinc-200">
                                            {item.modifiers.map((m, mIdx) => (
                                                <div key={mIdx}>
                                                    + {m.nama_modifier} ({rupiah(m.harga_tambahan)})
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {item.catatan_khusus && (
                                        <div className="text-[10px] text-amber-700 italic bg-amber-50/80 px-2 py-0.5 rounded">
                                            Catatan: {item.catatan_khusus}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="border-t border-dashed border-zinc-300 pt-4 space-y-1.5 text-xs text-zinc-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-mono text-zinc-900">{rupiah(pesanan.subtotal)}</span>
                        </div>

                        {pesanan.diskon > 0 && (
                            <div className="flex justify-between text-emerald-700 font-semibold">
                                <span>Diskon Voucher ({pesanan.voucher_kode || 'Promo'})</span>
                                <span className="font-mono">-{rupiah(pesanan.diskon)}</span>
                            </div>
                        )}

                        {pesanan.service_nominal > 0 && (
                            <div className="flex justify-between">
                                <span>Service Charge</span>
                                <span className="font-mono text-zinc-900">{rupiah(pesanan.service_nominal)}</span>
                            </div>
                        )}

                        {pesanan.pajak_nominal > 0 && (
                            <div className="flex justify-between">
                                <span>Pajak Resto (PB1)</span>
                                <span className="font-mono text-zinc-900">{rupiah(pesanan.pajak_nominal)}</span>
                            </div>
                        )}

                        {pesanan.pembulatan !== 0 && (
                            <div className="flex justify-between">
                                <span>Pembulatan</span>
                                <span className="font-mono text-zinc-900">{rupiah(pesanan.pembulatan)}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-2.5 mt-2 border-t border-zinc-950 font-black text-sm text-zinc-950">
                            <span>TOTAL BAYAR</span>
                            <span className="text-base font-mono font-black text-emerald-800">{rupiah(pesanan.total)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-1 text-xs">
                            <span className="capitalize">Metode Bayar ({pesanan.metode_pembayaran})</span>
                            <span className="font-mono font-bold text-zinc-900">{rupiah(pesanan.bayar)}</span>
                        </div>

                        {pesanan.kembalian > 0 && (
                            <div className="flex justify-between items-center text-xs text-zinc-500">
                                <span>Kembalian</span>
                                <span className="font-mono font-semibold text-zinc-800">{rupiah(pesanan.kembalian)}</span>
                            </div>
                        )}
                    </div>

                    {/* Store WiFi Box (Convenience bonus for cafe visitors) */}
                    {(cafe.wifi_ssid || cafe.wifi_password) && (
                        <div className="rounded-2xl p-3.5 bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                    <Wifi className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="font-bold text-emerald-950 block text-[11px]">Free Customer WiFi</span>
                                    <span className="text-[10px] text-emerald-800 font-mono">
                                        SSID: {cafe.wifi_ssid} &bull; Pass: {cafe.wifi_password}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QR Code Verification */}
                    <div className="text-center pt-2 space-y-2 border-t border-dashed border-zinc-300">
                        <div className="w-28 h-28 mx-auto p-1.5 bg-white rounded-xl border border-zinc-200 shadow-sm flex items-center justify-center">
                            <img src={qrUrl} alt="QR Struk Digital" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium">
                            Scan QR untuk verifikasi struk digital resmi Jelang Hari POS
                        </p>
                    </div>

                    {/* Footer text */}
                    <div className="text-center pt-1 text-xs text-zinc-500 space-y-1">
                        <p className="font-medium text-zinc-700 italic">{cafe.footer}</p>
                        <p className="text-[10px] text-zinc-400">
                            Simpan tautan ini sebagai bukti transaksi Anda.
                        </p>
                    </div>
                </div>

                {/* Jagged / Tear Receipt Footer Decoration */}
                <div className="h-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-center">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">
                        *** JELANG HARI CAFE ***
                    </span>
                </div>
            </div>

            {/* Action Bar (Print / PDF & Share WA) */}
            <div className="w-full max-w-md mt-5 grid grid-cols-2 gap-3 print:hidden">
                <button
                    type="button"
                    onClick={handleShareWA}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
                >
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan ke WA</span>
                </button>

                <button
                    type="button"
                    onClick={handlePrintOrPdf}
                    className="py-3 px-4 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    <span>Unduh / Cetak PDF</span>
                </button>
            </div>
        </div>
    );
}
