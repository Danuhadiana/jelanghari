import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { rupiah, tanggal_id } from '@/lib/format';
import { 
  Ticket, Plus, Search, CheckCircle2, XCircle, Trash2, 
  Edit3, Calendar, Users, Copy, Check, LayoutGrid, List, Sparkles, AlertTriangle
} from 'lucide-react';

interface Voucher {
  id: number;
  kode: string;
  nama: string;
  tipe: 'persen' | 'nominal';
  nilai: number;
  min_belanja: number;
  maks_potongan: number | null;
  kuota: number;
  terpakai: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  is_aktif: boolean;
}

interface Props {
  vouchers: {
    data: Voucher[];
    links: any[];
    total: number;
  };
  filters: {
    search?: string;
    status?: string;
  };
}

export default function VoucherIndex({ vouchers, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<Voucher | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const voucherList = vouchers?.data || [];

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    kode: '',
    nama: '',
    tipe: 'persen' as 'persen' | 'nominal',
    nilai: 10,
    min_belanja: 50000,
    maks_potongan: 20000,
    kuota: 100,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    is_aktif: true,
  });

  const totalAktif = voucherList.filter(v => v.is_aktif).length;
  const totalTerpakai = voucherList.reduce((acc, v) => acc + (v.terpakai || 0), 0);
  const totalKuota = voucherList.reduce((acc, v) => acc + (v.kuota || 0), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/voucher', { search }, { preserveState: true, replace: true });
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setData({
      kode: '',
      nama: '',
      tipe: 'persen',
      nilai: 15,
      min_belanja: 50000,
      maks_potongan: 25000,
      kuota: 100,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      tanggal_selesai: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      is_aktif: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setData({
      kode: v.kode,
      nama: v.nama,
      tipe: v.tipe,
      nilai: v.nilai,
      min_belanja: v.min_belanja,
      maks_potongan: v.maks_potongan || 0,
      kuota: v.kuota,
      tanggal_mulai: v.tanggal_mulai ? v.tanggal_mulai.split('T')[0] : '',
      tanggal_selesai: v.tanggal_selesai ? v.tanggal_selesai.split('T')[0] : '',
      is_aktif: v.is_aktif,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVoucher) {
      put(`/voucher/${editingVoucher.id}`, {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      });
    } else {
      post('/voucher', {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
      });
    }
  };

  const confirmDelete = (v: Voucher) => {
    setVoucherToDelete(v);
    setDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (voucherToDelete) {
      destroy(`/voucher/${voucherToDelete.id}`, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setVoucherToDelete(null);
        }
      });
    }
  };

  const handleToggle = (id: number) => {
    router.patch(`/voucher/${id}/toggle`, {}, { preserveScroll: true });
  };

  const copyToClipboard = (kode: string) => {
    navigator.clipboard.writeText(kode);
    setCopiedCode(kode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AppLayout>
      <Head title="Manajemen Voucher & Promosi - Jelang Hari" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-jh-accent"></span>
              <h1 className="text-2xl font-serif font-bold text-jh-black dark:text-white">
                Voucher & Diskon Promosi
              </h1>
            </div>
            <p className="text-xs text-jh-gray-500 dark:text-stone-400 mt-1">
              Kelola kupon promosi, diskon dine-in, dan reward loyalitas pelanggan Jelang Hari Coffee.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-jh-black dark:bg-white text-white dark:text-jh-black rounded-xl text-xs font-bold shadow-soft hover:bg-stone-800 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-jh-accent" />
            <span>Buat Voucher Baru</span>
          </button>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-jh-marble dark:bg-stone-900 p-4 rounded-2xl border border-jh-gray-100 dark:border-stone-800 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-jh-gray-500 dark:text-stone-400 block">
              Total Voucher Terdaftar
            </span>
            <div className="text-2xl font-serif font-bold text-jh-black dark:text-white mt-1">
              {vouchers?.total || voucherList.length}
            </div>
            <p className="text-[11px] text-jh-gray-500 dark:text-stone-400 mt-0.5">Program promosi kafe</p>
          </div>

          <div className="bg-jh-marble dark:bg-stone-900 p-4 rounded-2xl border border-jh-gray-100 dark:border-stone-800 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              Voucher Aktif
            </span>
            <div className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">
              {totalAktif}
            </div>
            <p className="text-[11px] text-jh-gray-500 dark:text-stone-400 mt-0.5">Dapat digunakan di Kasir & Web</p>
          </div>

          <div className="bg-jh-marble dark:bg-stone-900 p-4 rounded-2xl border border-jh-gray-100 dark:border-stone-800 shadow-soft">
            <span className="text-[10px] font-bold uppercase tracking-wider text-jh-accent block">
              Kupon Terpakai
            </span>
            <div className="text-2xl font-serif font-bold text-jh-accent mt-1">
              {totalTerpakai} <span className="text-xs font-mono font-normal text-jh-gray-500">/ {totalKuota} kuota</span>
            </div>
            <p className="text-[11px] text-jh-gray-500 dark:text-stone-400 mt-0.5">Telah diklaim oleh pelanggan</p>
          </div>
        </div>

        {/* Filter bar & Switch View */}
        <div className="bg-jh-marble dark:bg-stone-900 p-3.5 rounded-2xl border border-jh-gray-100 dark:border-stone-800 shadow-soft flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-jh-gray-400 dark:text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode atau nama voucher..."
              className="w-full pl-9 pr-4 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-jh-accent"
            />
          </form>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-jh-white dark:bg-stone-800 p-1 rounded-xl border border-jh-gray-100 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-jh-black dark:bg-white text-white dark:text-jh-black shadow-sm'
                    : 'text-jh-gray-500 hover:text-jh-black dark:text-stone-400'
                }`}
                title="Tampilan Kartu Tiket"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition ${
                  viewMode === 'table'
                    ? 'bg-jh-black dark:bg-white text-white dark:text-jh-black shadow-sm'
                    : 'text-jh-gray-500 hover:text-jh-black dark:text-stone-400'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content: Card Grid Mode */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {voucherList.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-jh-marble dark:bg-stone-900 rounded-2xl border border-jh-gray-100 dark:border-stone-800">
                <Ticket className="w-12 h-12 mx-auto text-jh-gray-300 dark:text-stone-600 mb-2" />
                <p className="text-sm font-semibold text-jh-gray-600 dark:text-stone-400">Belum ada voucher terdaftar.</p>
                <p className="text-xs text-jh-gray-400 mt-1">Buat voucher pertama Anda untuk promosi pelanggan.</p>
              </div>
            ) : (
              voucherList.map((v) => {
                const percentUsed = Math.min(100, Math.round(((v.terpakai || 0) / (v.kuota || 1)) * 100));
                return (
                  <div 
                    key={v.id}
                    className={`relative rounded-2xl border transition overflow-hidden shadow-soft ${
                      v.is_aktif 
                        ? 'bg-jh-marble dark:bg-stone-900 border-jh-gray-100 dark:border-stone-800 hover:border-jh-accent/40' 
                        : 'bg-stone-100/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-75'
                    }`}
                  >
                    {/* Top ticket strip */}
                    <div className="p-4 border-b border-dashed border-jh-gray-200 dark:border-stone-800 flex items-start justify-between relative">
                      {/* Left & right cutouts */}
                      <div className="absolute -left-3 bottom-0 translate-y-1/2 w-5 h-5 bg-stone-50 dark:bg-stone-950 rounded-full border-r border-jh-gray-200 dark:border-stone-800"></div>
                      <div className="absolute -right-3 bottom-0 translate-y-1/2 w-5 h-5 bg-stone-50 dark:bg-stone-950 rounded-full border-l border-jh-gray-200 dark:border-stone-800"></div>

                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(v.kode)}
                            className="font-mono text-base font-extrabold text-jh-black dark:text-white uppercase tracking-wider flex items-center gap-1.5 hover:text-jh-accent transition"
                            title="Salin Kode Voucher"
                          >
                            <span>{v.kode}</span>
                            {copiedCode === v.kode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-jh-gray-400 hover:text-jh-black" />
                            )}
                          </button>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.is_aktif
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}>
                            {v.is_aktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-jh-gray-600 dark:text-stone-300 mt-1 line-clamp-1">
                          {v.nama}
                        </h4>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-serif font-black text-jh-accent">
                          {v.tipe === 'persen' ? `${v.nilai}%` : rupiah(v.nilai)}
                        </div>
                        <span className="text-[10px] text-jh-gray-400 block uppercase font-mono">
                          {v.tipe === 'persen' ? 'Diskon %' : 'Potongan'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom ticket details */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-jh-gray-400 block text-[10px]">Min. Belanja:</span>
                          <span className="font-mono font-semibold text-jh-black dark:text-stone-200">
                            {v.min_belanja > 0 ? rupiah(v.min_belanja) : 'Tanpa Minimum'}
                          </span>
                        </div>
                        <div>
                          <span className="text-jh-gray-400 block text-[10px]">Maks. Diskon:</span>
                          <span className="font-mono font-semibold text-jh-black dark:text-stone-200">
                            {v.tipe === 'persen' && v.maks_potongan ? rupiah(v.maks_potongan) : 'Sesuai Nominal'}
                          </span>
                        </div>
                      </div>

                      {/* Quota Progress */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-jh-gray-500 dark:text-stone-400 mb-1">
                          <span>Pemakaian Kuota</span>
                          <span className="font-mono font-bold text-jh-black dark:text-stone-200">
                            {v.terpakai} / {v.kuota} ({percentUsed}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              percentUsed >= 90 ? 'bg-rose-500' : 'bg-jh-accent'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-jh-gray-100 dark:border-stone-800/80 text-[11px] text-jh-gray-500 dark:text-stone-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-jh-gray-400" />
                          <span>Exp: {tanggal_id(v.tanggal_selesai)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(v.id)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-jh-gray-600 dark:text-stone-300 hover:bg-jh-white dark:hover:bg-stone-800 border border-jh-gray-200 dark:border-stone-700 transition"
                            title="Ubah Status Aktif/Nonaktif"
                          >
                            {v.is_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1 text-jh-gray-500 hover:text-jh-black dark:hover:text-white rounded-lg hover:bg-jh-white dark:hover:bg-stone-800 transition"
                            title="Edit Voucher"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => confirmDelete(v)}
                            className="p-1 text-jh-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Hapus Voucher"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Content: Table Mode */
          <div className="bg-jh-marble dark:bg-stone-900 rounded-2xl border border-jh-gray-100 dark:border-stone-800 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-jh-white/60 dark:bg-stone-800/40 border-b border-jh-gray-100 dark:border-stone-800 uppercase text-[10px] font-semibold text-jh-gray-500 dark:text-stone-400 tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Kode & Voucher</th>
                    <th className="px-5 py-3.5">Nilai Potongan</th>
                    <th className="px-5 py-3.5">Min. Belanja</th>
                    <th className="px-5 py-3.5">Pemakaian</th>
                    <th className="px-5 py-3.5">Periode Berlaku</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-jh-gray-100 dark:divide-stone-800">
                  {voucherList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-jh-gray-400">
                        Belum ada voucher yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    voucherList.map((v) => (
                      <tr key={v.id} className="hover:bg-jh-white/50 dark:hover:bg-stone-800/40 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-jh-accent uppercase">
                            {v.kode}
                          </div>
                          <div className="text-[11px] text-jh-gray-500 dark:text-stone-400">
                            {v.nama}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-jh-black dark:text-white">
                          {v.tipe === 'persen' ? `${v.nilai}%` : rupiah(v.nilai)}
                          {v.tipe === 'persen' && v.maks_potongan ? (
                            <span className="block text-[10px] font-normal text-jh-gray-400">
                              Maks. {rupiah(v.maks_potongan)}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-jh-gray-700 dark:text-stone-300">
                          {v.min_belanja > 0 ? rupiah(v.min_belanja) : 'Tanpa Min.'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold">{v.terpakai}</span> / {v.kuota}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] text-jh-gray-500 dark:text-stone-400">
                          {tanggal_id(v.tanggal_mulai)} - {tanggal_id(v.tanggal_selesai)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => handleToggle(v.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                              v.is_aktif
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {v.is_aktif ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(v)}
                              className="p-1.5 text-jh-gray-500 hover:text-jh-black dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(v)}
                              className="p-1.5 text-jh-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Form: Tambah / Edit Voucher */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-jh-marble dark:bg-stone-900 rounded-3xl max-w-lg w-full border border-jh-gray-100 dark:border-stone-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-jh-gray-100 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-jh-black dark:text-white">
                    {editingVoucher ? 'Edit Data Voucher' : 'Buat Voucher Promosi Baru'}
                  </h3>
                  <p className="text-xs text-jh-gray-500 dark:text-stone-400">Atur parameter diskon, kuota pemakaian, dan masa aktif.</p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center justify-center hover:bg-stone-200 transition"
                >
                  ✕
                </button>
              </div>

              {/* Ticket Preview Mini Box */}
              <div className="p-4 bg-jh-white dark:bg-stone-950 border-b border-jh-gray-100 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase text-jh-gray-400 block mb-1">Pratinjau Tiket:</span>
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-jh-accent/30 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-jh-accent uppercase">{data.kode || 'KODE-VOUCHER'}</span>
                    <span className="block text-xs text-stone-600 dark:text-stone-300 font-medium">{data.nama || 'Nama Promosi'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-jh-black dark:text-white">
                      {data.tipe === 'persen' ? `${data.nilai}%` : rupiah(data.nilai)}
                    </span>
                    <span className="block text-[10px] text-jh-gray-400 font-mono">
                      Min: {data.min_belanja > 0 ? rupiah(data.min_belanja) : 'Rp 0'}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Kode Kupon / Voucher
                    </label>
                    <input
                      type="text"
                      value={data.kode}
                      onChange={(e) => setData('kode', e.target.value.toUpperCase())}
                      placeholder="CONTOH: NGOPIASIK15"
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                    {errors.kode && <p className="text-[11px] text-rose-500 mt-1">{errors.kode}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Nama Program Promo
                    </label>
                    <input
                      type="text"
                      value={data.nama}
                      onChange={(e) => setData('nama', e.target.value)}
                      placeholder="Diskon Happy Hour"
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Tipe Diskon
                    </label>
                    <select
                      value={data.tipe}
                      onChange={(e) => setData('tipe', e.target.value as any)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-jh-accent"
                    >
                      <option value="persen">Persentase (%)</option>
                      <option value="nominal">Nominal Rupiah (Rp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Besar Potongan {data.tipe === 'persen' ? '(%)' : '(Rp)'}
                    </label>
                    <input
                      type="number"
                      value={data.nilai}
                      onChange={(e) => setData('nilai', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Min. Belanja (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.min_belanja}
                      onChange={(e) => setData('min_belanja', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Maks. Potongan (Rp)
                    </label>
                    <input
                      type="number"
                      value={data.maks_potongan}
                      onChange={(e) => setData('maks_potongan', parseFloat(e.target.value) || 0)}
                      disabled={data.tipe === 'nominal'}
                      placeholder={data.tipe === 'nominal' ? 'Tanpa batas' : '0 = tanpa limit'}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Kuota Pemakaian
                    </label>
                    <input
                      type="number"
                      value={data.kuota}
                      onChange={(e) => setData('kuota', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Status Voucher
                    </label>
                    <div className="pt-2">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.is_aktif}
                          onChange={(e) => setData('is_aktif', e.target.checked)}
                          className="w-4 h-4 text-jh-black rounded focus:ring-jh-accent border-stone-300"
                        />
                        <span className="text-xs text-jh-black dark:text-stone-300 font-semibold">Aktifkan Voucher</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Tanggal Berlaku Mulai
                    </label>
                    <input
                      type="date"
                      value={data.tanggal_mulai}
                      onChange={(e) => setData('tanggal_mulai', e.target.value)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-jh-black dark:text-stone-300 uppercase mb-1">
                      Tanggal Berakhir
                    </label>
                    <input
                      type="date"
                      value={data.tanggal_selesai}
                      onChange={(e) => setData('tanggal_selesai', e.target.value)}
                      className="w-full px-3 py-2 bg-jh-white dark:bg-stone-800 border border-jh-gray-100 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-jh-accent"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-jh-gray-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-jh-gray-200 dark:border-stone-700 text-jh-gray-600 dark:text-stone-300 rounded-xl text-xs font-semibold hover:bg-jh-white dark:hover:bg-stone-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2 bg-jh-black dark:bg-white text-white dark:text-jh-black rounded-xl text-xs font-bold hover:bg-stone-800 transition disabled:opacity-50 active:scale-95 shadow-soft"
                  >
                    {processing ? 'Menyimpan...' : 'Simpan Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus Voucher */}
        {deleteModalOpen && voucherToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-jh-marble dark:bg-stone-900 rounded-3xl max-w-sm w-full border border-jh-gray-100 dark:border-stone-800 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-jh-black dark:text-white mb-1">
                Hapus Voucher?
              </h3>
              <p className="text-xs text-jh-gray-500 dark:text-stone-400 mb-6">
                Yakin ingin menghapus voucher <span className="font-mono font-bold text-jh-black dark:text-white">"{voucherToDelete.kode}"</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-jh-gray-200 dark:border-stone-700 text-xs font-semibold text-jh-gray-600 dark:text-stone-300 hover:bg-jh-white dark:hover:bg-stone-800 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft transition active:scale-95"
                >
                  Hapus Voucher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
