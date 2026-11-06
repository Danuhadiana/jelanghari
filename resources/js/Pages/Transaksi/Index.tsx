import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import { Eye, Ban, X, QrCode } from 'lucide-react';

interface Props {
    transaksi: {
        data: Array<{
            id: number;
            no_struk: string;
            tipe: string;
            total: number;
            metode_bayar: string;
            status: 'lunas' | 'void' | 'pending';
            nama_pelanggan?: string;
            created_at: string;
            kasir?: { nama: string };
            meja?: { no_meja: string };
        }>;
        links: any[];
    };
    filters: {
        search?: string;
        status?: string;
        metode_bayar?: string;
        tipe?: string;
        tanggal?: string;
    };
}

export default function Index({ transaksi, filters = {} }: Props) {
    const [voidOrderId, setVoidOrderId] = useState<number | null>(null);
    const [voidReason, setVoidReason] = useState('');
    const [isVoiding, setIsVoiding] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        router.get('/transaksi', {
            ...filters,
            [key]: value || undefined,
        }, { preserveState: true });
    };

    const submitVoid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!voidOrderId || !voidReason) return;
        setIsVoiding(true);

        router.post(`/transaksi/${voidOrderId}/void`, {
            void_reason: voidReason,
        }, {
            onSuccess: () => {
                setVoidOrderId(null);
                setVoidReason('');
                setIsVoiding(false);
            },
            onError: () => setIsVoiding(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Riwayat Transaksi" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-jh-black">Riwayat Transaksi</h1>
                    <p className="text-xs text-jh-gray-500 mt-0.5">Pantau seluruh order, cetak ulang struk, dan pembatalan transaksi.</p>
                </div>
            </div>

            <div className="bg-jh-marble p-4 rounded-[16px] border border-jh-gray-100 shadow-soft mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                    <label className="block text-[10px] font-bold text-jh-gray-500 uppercase mb-1">Cari Struk / Tamu</label>
                    <input
                        type="text"
                        placeholder="Contoh: JH-2024..."
                        defaultValue={filters.search}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', (e.target as HTMLInputElement).value)}
                        className="w-full px-3 py-1.5 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs"
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-jh-gray-500 uppercase mb-1">Status</label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-1.5 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs"
                    >
                        <option value="">Semua Status</option>
                        <option value="lunas">Lunas</option>
                        <option value="void">Void (Dibatalkan)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-jh-gray-500 uppercase mb-1">Metode Bayar</label>
                    <select
                        value={filters.metode_bayar || ''}
                        onChange={(e) => handleFilterChange('metode_bayar', e.target.value)}
                        className="w-full px-3 py-1.5 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs"
                    >
                        <option value="">Semua Metode</option>
                        <option value="cash">Cash</option>
                        <option value="qris">QRIS</option>
                        <option value="debit">Debit</option>
                        <option value="transfer">Transfer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-jh-gray-500 uppercase mb-1">Tanggal</label>
                    <input
                        type="date"
                        value={filters.tanggal || ''}
                        onChange={(e) => handleFilterChange('tanggal', e.target.value)}
                        className="w-full px-3 py-1.5 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs"
                    />
                </div>
            </div>

            <div className="bg-jh-marble rounded-[16px] border border-jh-gray-100 shadow-soft overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-jh-stone border-b border-jh-gray-100 uppercase text-jh-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-5 py-3.5">No. Struk</th>
                            <th className="px-5 py-3.5">Waktu</th>
                            <th className="px-5 py-3.5">Kasir / Meja</th>
                            <th className="px-5 py-3.5">Pelanggan</th>
                            <th className="px-5 py-3.5">Metode</th>
                            <th className="px-5 py-3.5">Total Tagihan</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-jh-gray-100">
                        {(!transaksi || (Array.isArray(transaksi) ? transaksi.length === 0 : !transaksi.data || transaksi.data.length === 0)) ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-jh-gray-500">
                                    Belum ada data transaksi yang tercatat.
                                </td>
                            </tr>
                        ) : (
                            (Array.isArray(transaksi) ? transaksi : (transaksi.data || [])).map((item: any) => {
                                const noStruk = item.no_struk || item.nomor_pesanan || `JH-${item.id}`;
                                const kasirNama = item.kasir?.nama || item.user?.name || item.user?.nama || 'Kasir';
                                const mejaNo = item.meja?.no_meja || item.meja?.nomor;
                                const metode = item.metode_bayar || item.metode_pembayaran || 'cash';
                                const rawStatus = item.status || item.status_pembayaran || item.status_pesanan || 'lunas';
                                const isLunas = rawStatus === 'lunas' || rawStatus === 'paid';

                                return (
                                <tr key={item.id} className="hover:bg-jh-stone/50 transition">
                                    <td className="px-5 py-4 font-mono font-bold text-jh-black">{noStruk}</td>
                                    <td className="px-5 py-4 text-jh-gray-500">{tanggal_id(item.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-jh-black">{kasirNama}</span>
                                        {mejaNo && <span className="block text-[10px] text-jh-gray-500">Meja: {mejaNo}</span>}
                                    </td>
                                    <td className="px-5 py-4 text-jh-gray-700">{item.nama_pelanggan || '-'}</td>
                                    <td className="px-5 py-4 font-semibold uppercase">{metode}</td>
                                    <td className="px-5 py-4 font-mono font-bold text-jh-black">{rupiah(item.total)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            isLunas
                                                ? 'bg-emerald-50 text-jh-success'
                                                : 'bg-rose-50 text-jh-danger line-through'
                                        }`}>
                                            {isLunas ? 'Lunas' : rawStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right space-x-1.5">
                                        <a
                                            href={`/struk/${noStruk}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Buka Struk Digital"
                                            className="p-1.5 inline-flex rounded-lg text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition"
                                        >
                                            <QrCode className="w-3.5 h-3.5" />
                                        </a>
                                        <Link
                                            href={`/transaksi/${item.id}`}
                                            title="Lihat Detail"
                                            className="p-1.5 inline-flex rounded-lg text-jh-gray-500 hover:text-jh-black hover:bg-jh-stone transition"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </Link>
                                        {isLunas && (
                                            <button
                                                onClick={() => setVoidOrderId(item.id)}
                                                title="Batalkan Pesanan (Void)"
                                                className="p-1.5 inline-flex rounded-lg text-jh-gray-500 hover:text-jh-danger hover:bg-rose-50"
                                            >
                                                <Ban className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {voidOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-jh-black/70 backdrop-blur-sm">
                    <div className="bg-jh-marble w-full max-w-sm rounded-[16px] border border-jh-gray-100 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-serif font-bold text-base text-jh-danger">Batalkan Transaksi (Void)</h3>
                            <button onClick={() => setVoidOrderId(null)} className="text-jh-gray-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-jh-gray-600 mb-4">
                            Tindakan ini akan membatalkan nota transaksi dan mengembalikan status meja menjadi kosong.
                        </p>

                        <form onSubmit={submitVoid} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-jh-gray-700 uppercase mb-1">
                                    Alasan Pembatalan (Wajib Diisi)
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Contoh: Tamu salah pesan / salah input nominal kasir"
                                    value={voidReason}
                                    onChange={(e) => setVoidReason(e.target.value)}
                                    className="w-full px-3 py-2 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs text-jh-black focus:outline-none focus:border-jh-black"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setVoidOrderId(null)}
                                    className="px-3 py-2 rounded-[8px] text-xs font-semibold text-jh-gray-500 hover:bg-jh-stone"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isVoiding || !voidReason}
                                    className="px-4 py-2 rounded-[8px] bg-jh-danger text-jh-white text-xs font-bold hover:bg-rose-700 transition"
                                >
                                    {isVoiding ? 'Memproses...' : 'Konfirmasi Void'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
