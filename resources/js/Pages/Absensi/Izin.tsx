import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { tanggal_id } from '@/lib/format';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Upload,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Send,
    Loader2
} from 'lucide-react';

interface Props {
    daftarIzin: {
        data: Array<{
            id: number;
            tipe: 'izin' | 'sakit' | 'cuti';
            tanggal_mulai: string;
            tanggal_selesai: string;
            total_hari: number;
            alasan: string;
            lampiran: string | null;
            status: 'pending' | 'approved' | 'rejected';
            catatan_admin?: string | null;
            created_at: string;
        }>;
        links: any[];
    };
}

export default function Izin({ daftarIzin }: Props) {
    const todayStr = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        tipe: 'izin',
        tanggal_mulai: todayStr,
        tanggal_selesai: todayStr,
        alasan: '',
        lampiran: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/absensi/izin', {
            onSuccess: () => {
                reset('alasan', 'lampiran');
            }
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-[#16A34A] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-[#DC2626] border border-red-200">
                        <XCircle className="w-3 h-3" /> Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-[#F59E0B] border border-amber-200">
                        <Clock className="w-3 h-3" /> Menunggu Review
                    </span>
                );
        }
    };

    return (
        <AppLayout>
            <Head title="Pengajuan Izin & Cuti - Jelang Hari" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/absensi"
                            className="p-2 rounded-[10px] bg-white border border-[#E7E5E4] hover:bg-zinc-100 text-[#0A0A0A] transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-[#0A0A0A]">Pengajuan Izin, Sakit &amp; Cuti</h1>
                            <p className="text-xs text-[#78716C]">
                                Formulir permohonan dispensasi resmi karyawan cafe
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Form Input Pengajuan */}
                    <div className="md:col-span-1 bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-sm space-y-4">
                        <h2 className="font-bold text-sm text-[#0A0A0A] pb-2 border-b border-[#E7E5E4]">
                            Formulir Pengajuan
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-semibold text-[#0A0A0A] mb-1">Jenis Permohonan</label>
                                <select
                                    value={data.tipe}
                                    onChange={e => setData('tipe', e.target.value as any)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none font-medium"
                                >
                                    <option value="izin">Izin Tidak Masuk</option>
                                    <option value="sakit">Sakit (Dengan / Tanpa Surat)</option>
                                    <option value="cuti">Cuti Tahunan / Khusus</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={data.tanggal_mulai}
                                    onChange={e => setData('tanggal_mulai', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none font-medium"
                                />
                                {errors.tanggal_mulai && <p className="text-red-600 text-[11px] mt-1">{errors.tanggal_mulai}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] mb-1">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    min={data.tanggal_mulai}
                                    value={data.tanggal_selesai}
                                    onChange={e => setData('tanggal_selesai', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none font-medium"
                                />
                                {errors.tanggal_selesai && <p className="text-red-600 text-[11px] mt-1">{errors.tanggal_selesai}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] mb-1">Alasan Lengkap</label>
                                <textarea
                                    rows={3}
                                    placeholder="Jelaskan keperluan atau keterangan sakit secara detail (min. 10 karakter)..."
                                    value={data.alasan}
                                    onChange={e => setData('alasan', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] border border-[#E7E5E4] rounded-[10px] outline-none"
                                />
                                {errors.alasan && <p className="text-red-600 text-[11px] mt-1">{errors.alasan}</p>}
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] mb-1">Lampiran Bukti (Opsional)</label>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={e => setData('lampiran', e.target.files ? e.target.files[0] : null)}
                                    className="w-full text-[11px] text-[#78716C] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-200 file:text-xs file:font-semibold"
                                />
                                <span className="text-[10px] text-[#78716C] block mt-1">Surat dokter / bukti izin (Max 5MB)</span>
                                {errors.lampiran && <p className="text-red-600 text-[11px] mt-1">{errors.lampiran}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-2.5 rounded-[10px] bg-[#0A0A0A] hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 mt-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Mengirim...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5 text-[#8B7355]" />
                                        <span>Kirim Pengajuan</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Riwayat Pengajuan Izin */}
                    <div className="md:col-span-2 bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
                            <h2 className="font-bold text-sm text-[#0A0A0A]">Riwayat Pengajuan Anda</h2>
                            <span className="text-xs text-[#78716C]">{daftarIzin.data?.length || 0} pengajuan</span>
                        </div>

                        <div className="space-y-3">
                            {(!daftarIzin.data || daftarIzin.data.length === 0) ? (
                                <div className="py-12 text-center text-xs text-[#78716C]">
                                    Belum ada pengajuan izin yang dibuat.
                                </div>
                            ) : (
                                daftarIzin.data.map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-[12px] border border-[#E7E5E4] bg-[#FAFAF9] space-y-2 text-xs hover:border-[#0A0A0A] transition"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-white border border-[#E7E5E4]">
                                                    {item.tipe}
                                                </span>
                                                <span className="font-semibold text-[#0A0A0A]">
                                                    {tanggal_id(item.tanggal_mulai)}
                                                    {item.tanggal_mulai !== item.tanggal_selesai && ` s/d ${tanggal_id(item.tanggal_selesai)}`}
                                                </span>
                                                <span className="text-[11px] text-[#78716C]">
                                                    ({item.total_hari} hari)
                                                </span>
                                            </div>
                                            {getStatusBadge(item.status)}
                                        </div>

                                        <p className="text-[#0A0A0A] leading-relaxed bg-white p-2.5 rounded-lg border border-[#E7E5E4]">
                                            {item.alasan}
                                        </p>

                                        {item.catatan_admin && (
                                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                                                <strong>Catatan Admin/Owner:</strong> {item.catatan_admin}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-1 text-[11px] text-[#78716C]">
                                            <span>Diajukan pada: {tanggal_id(item.created_at)}</span>
                                            {item.lampiran && (
                                                <a
                                                    href={`/storage/${item.lampiran}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="font-medium text-[#8B7355] hover:underline"
                                                >
                                                    Lihat Dokumen Lampiran
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
