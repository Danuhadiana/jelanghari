import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import { ArrowLeft, Printer, QrCode } from 'lucide-react';

interface Props {
    pesanan: any;
}

export default function Detail({ pesanan }: Props) {
    const noStruk = pesanan?.no_struk || pesanan?.nomor_pesanan || pesanan?.id;

    return (
        <AppLayout>
            <Head title={`Detail Transaksi ${pesanan?.no_struk || ''}`} />

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/transaksi" className="p-2 rounded-[8px] bg-jh-marble border border-jh-gray-100 text-jh-black">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-jh-black">Nota: {pesanan?.no_struk}</h1>
                            <p className="text-xs text-jh-gray-500">{pesanan ? tanggal_id(pesanan.created_at) : ''} &bull; Kasir: {pesanan?.kasir?.nama}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/struk/${noStruk}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition"
                        >
                            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Struk Digital</span>
                        </a>
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] bg-jh-black text-jh-white text-xs font-semibold shadow-soft"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                        </button>
                    </div>
                </div>

                <div className="bg-jh-marble p-6 rounded-[16px] border border-jh-gray-100 shadow-soft space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-jh-gray-100 text-xs">
                        <div>
                            <span className="text-jh-gray-500">Tipe Pesanan:</span>
                            <span className="font-bold text-jh-black ml-1 uppercase">{pesanan?.tipe} {pesanan?.meja ? `(${pesanan.meja.no_meja})` : ''}</span>
                        </div>
                        <div>
                            <span className="text-jh-gray-500">Metode Bayar:</span>
                            <span className="font-bold text-jh-black ml-1 uppercase">{pesanan?.metode_bayar}</span>
                        </div>
                    </div>

                    <div className="divide-y divide-jh-gray-100">
                        {pesanan?.items?.map((item: any) => (
                            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                    <p className="font-semibold text-jh-black">{item.nama_produk} {item.nama_varian ? `(${item.nama_varian})` : ''}</p>
                                    <p className="text-[11px] text-jh-gray-500">{item.qty} x {rupiah(item.harga)}</p>
                                    {item.modifier_text && <p className="text-[10px] text-jh-gray-500 italic">+ {item.modifier_text}</p>}
                                </div>
                                <span className="font-mono font-bold text-jh-black">{rupiah(item.subtotal)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-jh-gray-100 space-y-1.5 text-xs">
                        <div className="flex justify-between text-jh-gray-500">
                            <span>Subtotal:</span>
                            <span className="font-mono">{rupiah(pesanan?.subtotal || 0)}</span>
                        </div>
                        {pesanan?.diskon > 0 && (
                            <div className="flex justify-between text-jh-accent font-semibold">
                                <span>Diskon:</span>
                                <span className="font-mono">-{rupiah(pesanan.diskon)}</span>
                            </div>
                        )}
                        {pesanan?.pajak > 0 && (
                            <div className="flex justify-between text-jh-gray-500">
                                <span>Pajak PB1:</span>
                                <span className="font-mono">{rupiah(pesanan.pajak)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold text-jh-black pt-2 border-t border-jh-gray-100">
                            <span>TOTAL:</span>
                            <span className="font-mono">{rupiah(pesanan?.total || 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-jh-gray-500 pt-1">
                            <span>Bayar ({pesanan?.metode_bayar?.toUpperCase()}):</span>
                            <span className="font-mono">{rupiah(pesanan?.bayar || 0)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-jh-gray-500">
                            <span>Kembalian:</span>
                            <span className="font-mono">{rupiah(pesanan?.kembalian || 0)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
