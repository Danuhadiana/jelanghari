import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import { Plus, Trash2, X, ShoppingCart, Calendar, Building2, PackageCheck } from 'lucide-react';

interface Props {
    pembelians?: any;
    pembelian?: any;
    suppliers?: Array<{ id: number; nama: string }>;
    bahanBakus?: Array<{ id: number; nama: string; satuan: string; harga_beli_terakhir?: number; harga_beli?: number }>;
    bahan_baku?: Array<{ id: number; nama: string; satuan: string; harga_beli?: number }>;
    filters?: { search?: string };
}

export default function Pembelian({
    pembelians,
    pembelian,
    suppliers = [],
    bahanBakus = [],
    bahan_baku = [],
}: Props) {
    const rawData = pembelians || pembelian;
    const list: any[] = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    const supplierList = suppliers || [];
    const rawBahan = (bahanBakus && bahanBakus.length > 0) ? bahanBakus : (bahan_baku || []);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const todayDate = () => new Date().toISOString().split('T')[0];

    const { data, setData, post, reset, processing } = useForm({
        supplier_id: supplierList[0]?.id || 1,
        tanggal: todayDate(),
        catatan: '',
        items: [
            {
                bahan_baku_id: rawBahan[0]?.id || 1,
                jumlah: 10,
                harga_satuan: rawBahan[0]?.harga_beli_terakhir || rawBahan[0]?.harga_beli || 25000,
            }
        ],
    });

    const addItemRow = () => {
        setData('items', [
            ...data.items,
            {
                bahan_baku_id: rawBahan[0]?.id || 1,
                jumlah: 1,
                harga_satuan: 10000,
            }
        ]);
    };

    const removeItemRow = (idx: number) => {
        if (data.items.length <= 1) return;
        setData('items', data.items.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stok/pembelian', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Pembelian Bahan Baku (Kulakan) - Jelang Hari" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Faktur Pembelian / Kulakan</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Catat restock bahan baku masuk ke gudang untuk menambah stok fisik secara otomatis.</p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-zinc-950 text-white hover:bg-zinc-800 transition text-xs font-semibold shadow-sm"
                >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Catat Pembelian Baru</span>
                </button>
            </div>

            <div className="bg-white rounded-[16px] border border-zinc-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 uppercase text-zinc-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-5 py-3.5">No. Faktur</th>
                            <th className="px-5 py-3.5">Tanggal</th>
                            <th className="px-5 py-3.5">Supplier</th>
                            <th className="px-5 py-3.5">Item Bahan Masuk</th>
                            <th className="px-5 py-3.5">Dicatat Oleh</th>
                            <th className="px-5 py-3.5 text-right">Total Biaya Kulakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {list.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center text-zinc-400">
                                    Belum ada faktur pembelian bahan baku yang tercatat.
                                </td>
                            </tr>
                        ) : (
                            list.map((p) => {
                                const noFaktur = p.nomor_pembelian || p.no_faktur || `PO-${p.id}`;
                                const items = p.details || p.items || [];
                                const creator = p.user?.name || p.user?.nama || 'Admin Gudang';

                                return (
                                    <tr key={p.id} className="hover:bg-zinc-50/80 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-zinc-950">
                                            {noFaktur}
                                        </td>
                                        <td className="px-5 py-4 text-zinc-600">
                                            {tanggal_id(p.tanggal || p.created_at)}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-zinc-950">
                                            {p.supplier?.nama || 'Supplier Umum'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                {items.length === 0 ? (
                                                    <span className="text-zinc-400 text-[11px]">-</span>
                                                ) : (
                                                    items.map((it: any, i: number) => {
                                                        const bNama = it.bahan_baku?.nama || it.bahanBaku?.nama || it.bahan?.nama || 'Bahan';
                                                        const bSatuan = it.bahan_baku?.satuan || it.bahanBaku?.satuan || it.bahan?.satuan || 'unit';
                                                        const bQty = it.jumlah !== undefined ? it.jumlah : (it.qty || 1);
                                                        return (
                                                            <span key={i} className="block text-[11px] text-zinc-700">
                                                                &bull; {bNama} ({bQty} {bSatuan})
                                                            </span>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-zinc-600">{creator}</td>
                                        <td className="px-5 py-4 text-right font-mono font-bold text-zinc-950">
                                            {rupiah(p.total || 0)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[20px] border border-zinc-200 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950">Catat Faktur Belanja Bahan (PO)</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">Stok bahan baku terpilih akan bertambah otomatis ke inventori.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Supplier Rekanan</label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs font-semibold text-zinc-900 focus:outline-none focus:border-emerald-500"
                                    >
                                        {supplierList.map((s) => (
                                            <option key={s.id} value={s.id}>{s.nama}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Tanggal Terima</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs font-mono text-zinc-900 focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold uppercase text-zinc-700">Daftar Bahan Yang Masuk</label>
                                    <button
                                        type="button"
                                        onClick={addItemRow}
                                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Tambah Baris
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    {data.items.map((it, idx) => (
                                        <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-50 rounded-[12px] border border-zinc-200">
                                            <select
                                                value={it.bahan_baku_id}
                                                onChange={(e) => {
                                                    const copy = [...data.items];
                                                    copy[idx].bahan_baku_id = Number(e.target.value);
                                                    setData('items', copy);
                                                }}
                                                className="flex-1 px-2.5 py-1.5 bg-white border border-zinc-200 rounded-[8px] text-xs font-medium text-zinc-900 focus:outline-none focus:border-emerald-500"
                                            >
                                                {rawBahan.map((b) => (
                                                    <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min={0.1}
                                                step={0.1}
                                                placeholder="Jumlah"
                                                value={it.jumlah}
                                                onChange={(e) => {
                                                    const copy = [...data.items];
                                                    copy[idx].jumlah = Number(e.target.value);
                                                    setData('items', copy);
                                                }}
                                                className="w-20 px-2 py-1.5 bg-white border border-zinc-200 rounded-[8px] text-xs font-mono font-bold text-center text-zinc-900 focus:outline-none focus:border-emerald-500"
                                            />
                                            <input
                                                type="number"
                                                min={0}
                                                placeholder="Harga Satuan"
                                                value={it.harga_satuan}
                                                onChange={(e) => {
                                                    const copy = [...data.items];
                                                    copy[idx].harga_satuan = Number(e.target.value);
                                                    setData('items', copy);
                                                }}
                                                className="w-28 px-2 py-1.5 bg-white border border-zinc-200 rounded-[8px] text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeItemRow(idx)}
                                                className="p-1.5 text-zinc-400 hover:text-red-600 transition rounded-lg hover:bg-zinc-200"
                                                title="Hapus Baris"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Catatan Faktur (Opsional)</label>
                                <input
                                    type="text"
                                    value={data.catatan}
                                    onChange={(e) => setData('catatan', e.target.value)}
                                    placeholder="Contoh: Pengiriman batch sore, kemasan aman"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>

                            {/* Total Biaya Kalkulasi */}
                            <div className="p-3 rounded-[12px] bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-zinc-600 uppercase">Estimasi Total Biaya Faktur</span>
                                <span className="text-sm font-mono font-bold text-zinc-950">
                                    {rupiah(data.items.reduce((acc, it) => acc + (Number(it.jumlah) * Number(it.harga_satuan)), 0))}
                                </span>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-[10px] transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-[10px] bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan & Tambah Stok'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
