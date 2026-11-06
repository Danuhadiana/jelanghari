import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Phone, Mail, X, MapPin, Building2, Package } from 'lucide-react';

interface SupplierItem {
    id: number;
    nama: string;
    kontak?: string | null;
    kontak_person?: string | null;
    telepon: string;
    email?: string | null;
    alamat?: string | null;
    catatan?: string | null;
    bahan_baku_count?: number;
}

interface Props {
    suppliers: any;
    filters?: { search?: string };
}

export default function Supplier({ suppliers }: Props) {
    const supplierList: SupplierItem[] = Array.isArray(suppliers) ? suppliers : (suppliers?.data || []);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, reset, processing } = useForm({
        nama: '',
        kontak: '',
        telepon: '',
        email: '',
        alamat: '',
        catatan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/stok/supplier', {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Supplier Bahan Baku - Jelang Hari" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Supplier Rekanan</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">Daftar kontak distributor biji kopi, susu, sirup, dan packaging cafe.</p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-zinc-950 text-white hover:bg-zinc-800 transition text-xs font-semibold shadow-sm"
                >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Tambah Supplier Baru</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supplierList.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-zinc-400 text-xs bg-white rounded-[16px] border border-zinc-200">
                        Belum ada data supplier rekanan yang terdaftar.
                    </div>
                ) : (
                    supplierList.map((s) => {
                        const pic = s.kontak || s.kontak_person || 'Distributor Resmi';
                        return (
                            <div key={s.id} className="bg-white p-5 rounded-[16px] border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-zinc-300 transition">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-base text-zinc-950">{s.nama}</span>
                                        </div>
                                        <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full font-mono font-semibold text-zinc-600">
                                            {s.bahan_baku_count || 0} Bahan
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-4">PIC: {pic}</p>

                                    <div className="space-y-1.5 text-xs text-zinc-700">
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                                            <span className="font-mono">{s.telepon}</span>
                                        </div>
                                        {s.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                                <span className="font-mono">{s.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {s.alamat && (
                                    <p className="text-[11px] text-zinc-500 mt-4 pt-3 border-t border-zinc-100 flex items-start gap-1.5">
                                        <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{s.alamat}</span>
                                    </p>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[20px] border border-zinc-200 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                            <h3 className="font-bold text-base text-zinc-950">Tambah Supplier Rekanan</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Nama Perusahaan / Supplier</label>
                                <input
                                    type="text"
                                    required
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: PT Kopi Nusantara"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Nama Kontak PIC</label>
                                <input
                                    type="text"
                                    value={data.kontak}
                                    onChange={(e) => setData('kontak', e.target.value)}
                                    placeholder="Contoh: Pak Anton"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">No. WhatsApp / HP</label>
                                <input
                                    type="text"
                                    required
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    placeholder="08123456789"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs font-mono text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="sales@kopinusantara.com"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs font-mono text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase mb-1">Alamat Gudang / Kantor</label>
                                <input
                                    type="text"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    placeholder="Jl. Pergudangan No. 5"
                                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[10px] text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-[10px]">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 rounded-[10px] bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition">
                                    {processing ? 'Menyimpan...' : 'Simpan Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
