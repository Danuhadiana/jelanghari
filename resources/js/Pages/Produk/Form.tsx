import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
    kategori: Array<{ id: number; nama: string }>;
    produk?: any;
}

export default function Form({ kategori = [], produk }: Props) {
    const isEdit = Boolean(produk);

    const [previewImage, setPreviewImage] = React.useState<string | null>(produk?.foto || null);

    const { data, setData, post, processing, errors } = useForm({
        _method: isEdit ? 'PUT' : 'POST',
        kategori_id: produk?.kategori_id || (kategori[0]?.id ?? ''),
        kode: produk?.kode || '',
        nama: produk?.nama || '',
        deskripsi: produk?.deskripsi || '',
        harga: produk?.harga || 0,
        hpp: produk?.hpp || produk?.harga_modal || 0,
        station: produk?.station || 'barista',
        urutan: produk?.urutan || 0,
        is_active: produk?.is_active ?? produk?.is_tersedia ?? true,
        is_favorit: produk?.is_favorit ?? produk?.is_favorite ?? false,
        gambar: null as File | null,
        varian: produk?.varian?.map((v: any) => ({
            nama: v.nama,
            harga_tambahan: v.harga_tambahan,
            is_default: v.is_default,
        })) || [] as Array<{ nama: string; harga_tambahan: number; is_default: boolean }>,
        modifier: produk?.modifier?.map((m: any) => ({
            nama: m.nama,
            harga: m.harga,
            tipe: m.tipe,
            is_active: m.is_active,
        })) || [] as Array<{ nama: string; harga: number; tipe: string; is_active: boolean }>,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('gambar', file);
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addVarian = () => {
        setData('varian', [...data.varian, { nama: '', harga_tambahan: 0, is_default: false }]);
    };

    const removeVarian = (index: number) => {
        setData('varian', data.varian.filter((_, i) => i !== index));
    };

    const addModifier = () => {
        setData('modifier', [...data.modifier, { nama: '', harga: 0, tipe: 'addon', is_active: true }]);
    };

    const removeModifier = (index: number) => {
        setData('modifier', data.modifier.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/produk/${produk.id}` : '/produk';
        post(url, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title={isEdit ? `Edit ${produk?.nama}` : 'Tambah Produk Baru'} />

            <div className="max-w-4xl mx-auto pb-10">
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/produk" className="p-2 rounded-[8px] bg-white border border-[#E7E5E4] hover:bg-zinc-100 text-[#0A0A0A]">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-[#0A0A0A]">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
                        <p className="text-xs text-[#78716C]">Isi data produk, foto, stasiun kitchen/barista, serta status ketersediaan katalog.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Foto & Status Header Card */}
                    <div className="bg-white p-6 rounded-[16px] border border-[#E7E5E4] shadow-sm space-y-4">
                        <h2 className="font-serif font-bold text-sm text-[#0A0A0A]">Foto Produk &amp; Identitas Menu</h2>

                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Image Preview & Upload Input */}
                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                <div className="w-32 h-32 rounded-[16px] bg-[#FAFAF9] border-2 border-dashed border-[#E7E5E4] overflow-hidden flex items-center justify-center relative group">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-3 text-xs text-[#78716C]">
                                            <span>Belum Ada Foto</span>
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 rounded-[8px] bg-[#0A0A0A] text-white text-[11px] font-semibold hover:bg-zinc-800 transition">
                                    <span>{previewImage ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                                {previewImage && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewImage(null);
                                            setData('gambar', null);
                                        }}
                                        className="text-[10px] text-red-600 hover:underline"
                                    >
                                        Hapus Foto
                                    </button>
                                )}
                            </div>

                            {/* Info Dasar */}
                            <div className="flex-1 w-full space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Nama Produk *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.nama}
                                            onChange={(e) => setData('nama', e.target.value)}
                                            placeholder="Contoh: Kopi Susu Gula Aren"
                                            className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                        />
                                        {errors.nama && <p className="text-[11px] text-red-600 mt-1">{errors.nama}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Kode Menu / SKU</label>
                                        <input
                                            type="text"
                                            value={data.kode}
                                            onChange={(e) => setData('kode', e.target.value)}
                                            placeholder="Contoh: KOP-001 (Opsional)"
                                            className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Kategori Menu *</label>
                                        <select
                                            value={data.kategori_id}
                                            onChange={(e) => setData('kategori_id', Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                        >
                                            {kategori.map((c) => (
                                                <option key={c.id} value={c.id}>{c.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Stasiun Pesanan (KDS) *</label>
                                        <select
                                            value={data.station}
                                            onChange={(e) => setData('station', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                        >
                                            <option value="barista">Barista Bar (Minuman/Coffee)</option>
                                            <option value="kitchen">Kitchen Bar (Makanan/Snack)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Harga & Status Katalog */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E7E5E4]">
                            <div>
                                <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Harga Jual Dasar (Rp) *</label>
                                <input
                                    type="number"
                                    required
                                    value={data.harga}
                                    onChange={(e) => setData('harga', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-mono font-bold text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">HPP / Modal Bahan (Rp)</label>
                                <input
                                    type="number"
                                    value={data.hpp}
                                    onChange={(e) => setData('hpp', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-mono text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#0A0A0A] uppercase mb-1">Deskripsi Singkat</label>
                            <textarea
                                rows={2}
                                value={data.deskripsi}
                                onChange={(e) => setData('deskripsi', e.target.value)}
                                placeholder="Jelaskan aroma, cita rasa, atau komposisi menu..."
                                className="w-full px-3 py-2 bg-white border border-[#E7E5E4] rounded-[8px] text-xs text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]"
                            />
                        </div>

                        {/* Toggle Status Katalog */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-[#E7E5E4]">
                            <label className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-[#E7E5E4] text-[#0A0A0A] focus:ring-0"
                                />
                                <span className={`font-semibold ${data.is_active ? 'text-emerald-700' : 'text-zinc-500'}`}>
                                    Status Katalog: {data.is_active ? 'Aktif (Tersedia Dijual)' : 'Nonaktif (Disembunyikan / Habis)'}
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                    type="checkbox"
                                    checked={data.is_favorit}
                                    onChange={(e) => setData('is_favorit', e.target.checked)}
                                    className="rounded border-[#E7E5E4] text-[#0A0A0A] focus:ring-0"
                                />
                                <span className="font-semibold text-[#0A0A0A]">Tandai Rekomendasi (Best Seller)</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[16px] border border-[#E7E5E4] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-serif font-bold text-sm text-[#0A0A0A]">Varian (Ukuran / Suhu)</h2>
                                <p className="text-[11px] text-[#78716C]">Contoh: Regular, Large, Ice, Hot.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addVarian}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#FAFAF9] border border-[#E7E5E4] hover:bg-zinc-100 text-xs font-semibold text-[#0A0A0A] transition"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Varian
                            </button>
                        </div>

                        {data.varian.length === 0 ? (
                            <p className="text-xs text-[#78716C] italic">Belum ada varian (produk menggunakan harga standar tunggal).</p>
                        ) : (
                            <div className="space-y-2">
                                {data.varian.map((v, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAFAF9] rounded-[10px] border border-[#E7E5E4]">
                                        <input
                                            type="text"
                                            placeholder="Nama Varian"
                                            value={v.nama}
                                            onChange={(e) => {
                                                const copy = [...data.varian];
                                                copy[idx].nama = e.target.value;
                                                setData('varian', copy);
                                            }}
                                            className="flex-1 px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-medium text-[#0A0A0A]"
                                        />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[11px] text-[#78716C] font-mono">+Rp</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={v.harga_tambahan}
                                                onChange={(e) => {
                                                    const copy = [...data.varian];
                                                    copy[idx].harga_tambahan = Number(e.target.value);
                                                    setData('varian', copy);
                                                }}
                                                className="w-24 px-2 py-1.5 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-mono font-bold text-[#0A0A0A]"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVarian(idx)}
                                            className="p-1.5 text-[#78716C] hover:text-red-600 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-[16px] border border-[#E7E5E4] shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-serif font-bold text-sm text-[#0A0A0A]">Modifier / Addons</h2>
                                <p className="text-[11px] text-[#78716C]">Contoh: Extra Shot, Less Sugar, Oatmilk.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addModifier}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#FAFAF9] border border-[#E7E5E4] hover:bg-zinc-100 text-xs font-semibold text-[#0A0A0A] transition"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah Modifier
                            </button>
                        </div>

                        {data.modifier.length === 0 ? (
                            <p className="text-xs text-[#78716C] italic">Belum ada modifier untuk menu ini.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.modifier.map((m, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 bg-[#FAFAF9] rounded-[10px] border border-[#E7E5E4]">
                                        <input
                                            type="text"
                                            placeholder="Nama Modifier"
                                            value={m.nama}
                                            onChange={(e) => {
                                                const copy = [...data.modifier];
                                                copy[idx].nama = e.target.value;
                                                setData('modifier', copy);
                                            }}
                                            className="flex-1 px-2.5 py-1.5 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-medium text-[#0A0A0A]"
                                        />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[11px] text-[#78716C] font-mono">+Rp</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={m.harga}
                                                onChange={(e) => {
                                                    const copy = [...data.modifier];
                                                    copy[idx].harga = Number(e.target.value);
                                                    setData('modifier', copy);
                                                }}
                                                className="w-24 px-2 py-1.5 bg-white border border-[#E7E5E4] rounded-[8px] text-xs font-mono font-bold text-[#0A0A0A]"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeModifier(idx)}
                                            className="p-1.5 text-[#78716C] hover:text-red-600 transition"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href="/produk" className="px-5 py-2.5 rounded-[10px] text-xs font-semibold text-[#78716C] hover:bg-zinc-100 transition">
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-[10px] bg-[#0A0A0A] hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                        >
                            {processing && <Loader2 className="w-4 h-4 animate-spin text-[#8B7355]" />}
                            <span>Simpan Produk</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
