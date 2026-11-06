import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Settings,
    ShieldCheck,
    Clock,
    MapPin,
    Camera,
    Save,
    Check,
    Loader2
} from 'lucide-react';

interface Props {
    settings: {
        aktif_swafoto: boolean;
        aktif_gps: boolean;
        radius_gps_meter: number;
        jam_masuk_normal: string;
        toleransi_terlambat_menit: number;
        jam_pulang_normal: string;
        wajib_approval_izin: boolean;
        maks_absen_per_hari: number;
        latitude_cafe: number;
        longitude_cafe: number;
    };
}

export default function Pengaturan({ settings }: Props) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        aktif_swafoto: settings.aktif_swafoto,
        aktif_gps: settings.aktif_gps,
        radius_gps_meter: settings.radius_gps_meter,
        jam_masuk_normal: settings.jam_masuk_normal,
        toleransi_terlambat_menit: settings.toleransi_terlambat_menit,
        jam_pulang_normal: settings.jam_pulang_normal,
        wajib_approval_izin: settings.wajib_approval_izin,
        maks_absen_per_hari: settings.maks_absen_per_hari,
        latitude_cafe: settings.latitude_cafe,
        longitude_cafe: settings.longitude_cafe,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/absensi/admin/pengaturan');
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem Presensi - Jelang Hari POS" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/absensi/admin"
                            className="p-2 rounded-[10px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[#0A0A0A] dark:text-zinc-100 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-serif text-2xl font-bold text-[#0A0A0A] dark:text-white">Pengaturan Presensi &amp; Jam Kerja</h1>
                            <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                Kebijakan swafoto anti-titip absen, radius GPS, dan batas toleransi jam kerja
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Section 1: Kebijakan Swafoto & GPS */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E7E5E4] dark:border-zinc-800">
                            <Camera className="w-4 h-4 text-[#8B7355] dark:text-amber-400" />
                            <h2 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Keamanan Swafoto &amp; GPS Radius</h2>
                        </div>

                        <div className="space-y-4 text-xs">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.aktif_swafoto}
                                    onChange={e => setData('aktif_swafoto', e.target.checked)}
                                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                <div>
                                    <span className="font-bold text-[#0A0A0A] dark:text-white block">Wajibkan Swafoto Kamera (Selfie)</span>
                                    <span className="text-[#78716C] dark:text-zinc-400">Karyawan wajib mengambil foto langsung saat clock-in dan clock-out untuk mencegah titip absen.</span>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.aktif_gps}
                                    onChange={e => setData('aktif_gps', e.target.checked)}
                                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                <div>
                                    <span className="font-bold text-[#0A0A0A] dark:text-white block">Wajibkan Sensor Lokasi GPS</span>
                                    <span className="text-[#78716C] dark:text-zinc-400">Hanya memperbolehkan absensi jika karyawan terdeteksi berada di dalam area cafe Jelang Hari.</span>
                                </div>
                            </label>

                            {data.aktif_gps && (
                                <div className="p-4 bg-[#FAFAF9] dark:bg-zinc-800/80 rounded-xl border border-[#E7E5E4] dark:border-zinc-700 space-y-3 mt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-200">Radius Cafe (Meter)</label>
                                            <input
                                                type="number"
                                                min="10"
                                                value={data.radius_gps_meter}
                                                onChange={e => setData('radius_gps_meter', Number(e.target.value))}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-700 rounded-lg font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-200">Latitude Cafe</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={data.latitude_cafe}
                                                onChange={e => setData('latitude_cafe', Number(e.target.value))}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-700 rounded-lg font-mono text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1 text-zinc-900 dark:text-zinc-200">Longitude Cafe</label>
                                            <input
                                                type="number"
                                                step="any"
                                                value={data.longitude_cafe}
                                                onChange={e => setData('longitude_cafe', Number(e.target.value))}
                                                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-700 rounded-lg font-mono text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Jadwal & Jam Kerja */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E7E5E4] dark:border-zinc-800">
                            <Clock className="w-4 h-4 text-[#8B7355] dark:text-amber-400" />
                            <h2 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Jadwal Shift &amp; Toleransi Keterlambatan</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">Jam Masuk Normal</label>
                                <input
                                    type="time"
                                    value={data.jam_masuk_normal}
                                    onChange={e => setData('jam_masuk_normal', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-xl font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                                <span className="text-[11px] text-[#78716C] dark:text-zinc-400 mt-1 block">Waktu mulai kerja operasional</span>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">Toleransi Terlambat (Menit)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.toleransi_terlambat_menit}
                                    onChange={e => setData('toleransi_terlambat_menit', Number(e.target.value))}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-xl font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                                <span className="text-[11px] text-[#78716C] dark:text-zinc-400 mt-1 block">Lewat menit ini ditandai terlambat</span>
                            </div>

                            <div>
                                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">Jam Pulang Normal</label>
                                <input
                                    type="time"
                                    value={data.jam_pulang_normal}
                                    onChange={e => setData('jam_pulang_normal', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 rounded-xl font-mono font-bold text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                                <span className="text-[11px] text-[#78716C] dark:text-zinc-400 mt-1 block">Batas minimal kepulangan shift</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Kebijakan Approval & Izin */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#E7E5E4] dark:border-zinc-800">
                            <ShieldCheck className="w-4 h-4 text-[#8B7355] dark:text-amber-400" />
                            <h2 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Kebijakan Persetujuan Dispensasi</h2>
                        </div>

                        <div className="space-y-3 text-xs">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.wajib_approval_izin}
                                    onChange={e => setData('wajib_approval_izin', e.target.checked)}
                                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                />
                                <div>
                                    <span className="font-bold text-[#0A0A0A] dark:text-white block">Wajibkan Persetujuan Owner/Manager untuk Izin &amp; Cuti</span>
                                    <span className="text-[#78716C] dark:text-zinc-400">Jika aktif, status izin tetap "pending" sampai disetujui admin sebelum dihitung sah dalam payroll.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-between pt-2">
                        {recentlySuccessful ? (
                            <span className="text-xs font-semibold text-[#16A34A] dark:text-emerald-400 flex items-center gap-1.5">
                                <Check className="w-4 h-4" />
                                Pengaturan berhasil disimpan!
                            </span>
                        ) : <div />}

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5 text-[#8B7355] dark:text-white" />
                                    <span>Simpan Pengaturan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
