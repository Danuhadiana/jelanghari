import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface KategoriItem {
    id: number;
    nama: string;
    slug: string;
    urutan: number;
    is_aktif?: boolean;
    is_active?: boolean;
    produks_count?: number;
    produk_count?: number;
}

interface Props {
    kategoris?: KategoriItem[];
    kategori?: KategoriItem[];
}

export default function Index({ kategoris, kategori }: Props) {
    const kategoriList = kategoris || kategori || [];
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        nama: '',
        urutan: 0,
        is_active: true,
    });

    const openCreate = () => {
        reset();
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (item: KategoriItem) => {
        setEditingId(item.id);
        setData({
            nama: item.nama,
            urutan: item.urutan,
            is_active: item.is_aktif !== undefined ? item.is_aktif : (item.is_active !== undefined ? item.is_active : true),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            put(`/kategori/${editingId}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/kategori', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (id: number, nama: string) => {
        if (confirm(`Yakin ingin menghapus kategori "${nama}"?`)) {
            router.delete(`/kategori/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Kelola Kategori Menu" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-jh-black">Kategori Menu</h1>
                    <p className="text-xs text-jh-gray-500 mt-0.5">Kelola grup kategori produk cafe dan urutan tampilan POS.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-jh-black text-jh-white hover:bg-jh-charcoal transition text-xs font-semibold shadow-soft"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Kategori</span>
                </button>
            </div>

            <div className="bg-jh-marble rounded-[16px] border border-jh-gray-100 shadow-soft overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-jh-stone border-b border-jh-gray-100 uppercase text-jh-gray-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-5 py-3.5 w-16">Urutan</th>
                            <th className="px-5 py-3.5">Nama Kategori</th>
                            <th className="px-5 py-3.5">Slug</th>
                            <th className="px-5 py-3.5">Total Menu</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-jh-gray-100">
                        {(!kategoriList || kategoriList.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-jh-gray-500">
                                    Belum ada kategori yang dibuat.
                                </td>
                            </tr>
                        ) : (
                            kategoriList.map((item) => {
                                const totalMenu = item.produks_count !== undefined ? item.produks_count : (item.produk_count || 0);
                                const isAktif = item.is_aktif !== undefined ? item.is_aktif : (item.is_active !== undefined ? item.is_active : true);
                                return (
                                <tr key={item.id} className="hover:bg-jh-stone/50 transition">
                                    <td className="px-5 py-4 font-mono font-semibold">{item.urutan}</td>
                                    <td className="px-5 py-4 font-medium text-jh-black">{item.nama}</td>
                                    <td className="px-5 py-4 font-mono text-jh-gray-500">{item.slug}</td>
                                    <td className="px-5 py-4">
                                        <span className="px-2 py-0.5 rounded-full bg-jh-stone text-jh-black font-semibold font-mono">
                                            {totalMenu} menu
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            isAktif ? 'bg-emerald-50 text-jh-success' : 'bg-rose-50 text-jh-danger'
                                        }`}>
                                            {isAktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => openEdit(item)}
                                            className="p-1.5 rounded-lg text-jh-gray-500 hover:text-jh-black hover:bg-jh-stone"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id, item.nama)}
                                            className="p-1.5 rounded-lg text-jh-gray-500 hover:text-jh-danger hover:bg-rose-50"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-jh-black/60 backdrop-blur-sm">
                    <div className="bg-jh-marble w-full max-w-sm rounded-[16px] border border-jh-gray-100 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-serif font-bold text-base text-jh-black">
                                {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-jh-gray-500 hover:text-jh-black">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-jh-gray-700 uppercase mb-1">Nama</label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Mocktails, Pastry"
                                    className="w-full px-3 py-2 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs text-jh-black focus:outline-none focus:border-jh-black"
                                />
                                {errors.nama && <p className="text-[11px] text-jh-danger mt-1">{errors.nama}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-jh-gray-700 uppercase mb-1">Nomor Urut</label>
                                <input
                                    type="number"
                                    value={data.urutan}
                                    onChange={(e) => setData('urutan', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-jh-white border border-jh-gray-100 rounded-[8px] text-xs text-jh-black font-mono focus:outline-none focus:border-jh-black"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-jh-gray-300 text-jh-black"
                                />
                                <span className="text-xs text-jh-gray-700 font-medium">Tampilkan di POS (Aktif)</span>
                            </label>

                            <div className="flex justify-end gap-2 pt-3 border-t border-jh-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-3 py-2 rounded-[8px] text-xs font-semibold text-jh-gray-500 hover:bg-jh-stone"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-[8px] bg-jh-black hover:bg-jh-charcoal text-jh-white text-xs font-bold transition flex items-center gap-1.5"
                                >
                                    {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
