import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { tanggal_id } from '@/lib/format';
import {
    Clock,
    Camera,
    MapPin,
    Calendar,
    AlertCircle,
    CheckCircle2,
    CalendarCheck,
    FileText,
    History,
    Settings,
    ArrowRight,
    RefreshCw,
    X,
    Check,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    Eye
} from 'lucide-react';

interface Props {
    todayAbsensi?: {
        id: number;
        tanggal: string;
        jam_masuk: string | null;
        jam_keluar: string | null;
        status: string;
        foto_masuk: string | null;
        foto_keluar: string | null;
        jam_kerja_menit: number;
        lembur_menit: number;
        keterangan?: string | null;
    } | null;
    stats: {
        total_hadir: number;
        total_terlambat: number;
        total_izin_cuti: number;
        total_jam_kerja: number;
        total_menit_kerja: number;
    };
    pengaturan: {
        aktif_swafoto: boolean;
        aktif_gps: boolean;
        radius_gps_meter: number;
        latitude_cafe: number;
        longitude_cafe: number;
        jam_masuk_normal: string;
        toleransi_terlambat_menit: number;
        jam_pulang_normal: string;
    };
}

export default function Index({ todayAbsensi, stats, pengaturan }: Props) {
    const { auth } = usePage<any>().props;
    const userRole = (typeof auth?.user?.role === 'string' ? auth.user.role : (auth?.user?.role_slug || auth?.user?.role?.slug || '')).toLowerCase();
    const isOwnerOrManager = ['owner', 'manager'].includes(userRole);

    // Live clock for current time
    const [currentTime, setCurrentTime] = useState<string>('');
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);

    // Live work timer when clocked in and not yet clocked out
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    useEffect(() => {
        if (!todayAbsensi?.jam_masuk || todayAbsensi.jam_keluar) {
            setElapsedSeconds(0);
            return;
        }

        const masukTime = new Date(todayAbsensi.jam_masuk).getTime();
        const updateElapsed = () => {
            const diff = Math.max(0, Math.floor((Date.now() - masukTime) / 1000));
            setElapsedSeconds(diff);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);
        return () => clearInterval(interval);
    }, [todayAbsensi]);

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Modal state for Clock In / Clock Out
    const [modalType, setModalType] = useState<'in' | 'out' | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [gpsErrorMsg, setGpsErrorMsg] = useState<string>('');
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [cameraError, setCameraError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Open Modal and start devices
    const handleOpenModal = async (type: 'in' | 'out') => {
        setModalType(type);
        setCapturedImage(null);
        setCameraError('');
        setIsSubmitting(false);

        // Start Geolocation if required
        if (pengaturan.aktif_gps) {
            setGpsStatus('loading');
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        setCoords({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        });
                        setGpsStatus('success');
                    },
                    (err) => {
                        setGpsStatus('error');
                        setGpsErrorMsg(err.message || 'Gagal mendeteksi lokasi GPS.');
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                );
            } else {
                setGpsStatus('error');
                setGpsErrorMsg('Peramban Anda tidak mendukung sensor GPS.');
            }
        }

        // Start Camera if swafoto required
        if (pengaturan.aktif_swafoto) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false
                });
                setCameraStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err: any) {
                setCameraError('Izin kamera ditolak atau kamera tidak ditemukan.');
            }
        }
    };

    // Attach stream to video element when available
    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream, modalType]);

    // Close modal and stop stream
    const handleCloseModal = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setModalType(null);
        setCapturedImage(null);
    };

    // Capture snapshot from video
    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(dataUrl);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    // Submit Clock In or Clock Out
    const handleSubmitAbsen = () => {
        if (!modalType) return;
        setIsSubmitting(true);

        const endpoint = modalType === 'in' ? '/absensi/clock-in' : '/absensi/clock-out';
        const payload: Record<string, any> = {
            foto_base64: capturedImage,
            latitude: coords?.lat ?? null,
            longitude: coords?.lng ?? null,
        };

        router.post(endpoint, payload, {
            preserveScroll: true,
            onSuccess: () => {
                handleCloseModal();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                const first = Object.values(errs)[0] as string;
                alert(first || 'Terjadi kesalahan saat memproses absensi.');
            }
        });
    };

    const todayDateFormatted = tanggal_id(new Date().toISOString());

    return (
        <AppLayout>
            <Head title="Sistem Absensi Karyawan - Jelang Hari POS" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Topbar Minimal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#78716C] dark:text-zinc-400">Modul Presensi Staff</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                            <span className="text-[11px] font-mono text-[#78716C] dark:text-zinc-400">{currentTime} WIB</span>
                        </div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#0A0A0A] dark:text-white mt-0.5">
                            Presensi Karyawan
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {isOwnerOrManager && (
                            <Link
                                href="/absensi/admin"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-sm"
                            >
                                <Settings className="w-3.5 h-3.5 text-[#8B7355] dark:text-white" />
                                <span>Panel Admin &amp; Rekap</span>
                            </Link>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[12px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-[#0A0A0A] dark:bg-zinc-800 text-[#8B7355] dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                                {(auth?.user?.nama || auth?.user?.name || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left text-xs">
                                <span className="font-bold text-[#0A0A0A] dark:text-white block leading-tight">{auth?.user?.nama || auth?.user?.name}</span>
                                <span className="text-[10px] text-[#78716C] dark:text-zinc-400 uppercase font-semibold">{userRole}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 1 — STATUS HARI INI (Card Besar) */}
                <div className="rounded-[16px] border border-[#E7E5E4] dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                    {!todayAbsensi ? (
                        /* Belum Absen Hari Ini */
                        <div className="p-6 sm:p-10 text-center space-y-4 bg-white dark:bg-zinc-900">
                            <div className="w-20 h-20 mx-auto rounded-full bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 flex items-center justify-center text-[#0A0A0A] dark:text-white">
                                <Clock className="w-10 h-10 stroke-[1.5]" />
                            </div>
                            <div>
                                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white">
                                    Belum Absen Hari Ini
                                </h2>
                                <p className="text-xs text-[#78716C] dark:text-zinc-400 mt-1">
                                    Hari ini, {todayDateFormatted} &bull; Batas masuk normal: {pengaturan.jam_masuk_normal} WIB
                                </p>
                            </div>

                            <div className="max-w-md mx-auto pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenModal('in')}
                                    className="w-full h-[60px] rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-5 h-5 text-[#8B7355] dark:text-white" />
                                    <span>ABSEN MASUK (CLOCK IN)</span>
                                </button>
                            </div>
                        </div>
                    ) : !todayAbsensi.jam_keluar ? (
                        /* Sedang Bekerja (Sudah Masuk, Belum Pulang) */
                        <div className="p-6 sm:p-8 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200/60 dark:border-emerald-800/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                        <Clock className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-600 text-white">
                                                Sedang Bekerja
                                            </span>
                                            {todayAbsensi.status === 'terlambat' && (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/20 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-[#F59E0B]/30 dark:border-amber-800/60">
                                                    Terlambat Masuk
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#78716C] dark:text-zinc-400 mt-1 font-medium">
                                            Masuk pada: <strong className="text-[#0A0A0A] dark:text-white">{new Date(todayAbsensi.jam_masuk!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</strong> ({todayDateFormatted})
                                        </p>
                                    </div>
                                </div>

                                {/* Live Timer */}
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] dark:text-zinc-400 block">Sudah Bekerja</span>
                                    <span className="font-mono text-2xl font-black text-emerald-800 dark:text-emerald-400 tracking-tight">
                                        {formatDuration(elapsedSeconds)}
                                    </span>
                                </div>
                            </div>

                            {/* Foto Thumbnail & Tombol Absen Pulang */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {todayAbsensi.foto_masuk && (
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <img
                                            src={`/storage/${todayAbsensi.foto_masuk}`}
                                            alt="Foto Masuk"
                                            className="w-14 h-14 rounded-xl object-cover border border-emerald-300 dark:border-emerald-700 shadow-sm"
                                        />
                                        <div className="text-xs">
                                            <span className="text-[#78716C] dark:text-zinc-400 block text-[11px]">Swafoto Masuk Terverifikasi</span>
                                            <span className="font-semibold text-emerald-900 dark:text-emerald-300">{todayAbsensi.keterangan || 'Tepat waktu'}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="w-full sm:w-auto sm:min-w-[280px]">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenModal('out')}
                                        className="w-full h-[52px] rounded-[10px] bg-[#DC2626] hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>ABSEN PULANG (CLOCK OUT)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Selesai Bekerja Hari Ini */
                        <div className="p-6 sm:p-8 bg-[#FAFAF9] dark:bg-zinc-900/90 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E4] dark:border-zinc-800">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                            Shift Selesai
                                        </span>
                                        {todayAbsensi.lembur_menit > 0 && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                                                Lembur +{Math.round(todayAbsensi.lembur_menit / 60)} Jam
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-serif text-lg font-bold text-[#0A0A0A] dark:text-white mt-1">
                                        Presensi Hari Ini Selesai
                                    </h3>
                                    <p className="text-xs text-[#78716C] dark:text-zinc-400">
                                        Masuk: <strong className="text-zinc-900 dark:text-zinc-100">{new Date(todayAbsensi.jam_masuk!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong> &bull; Pulang: <strong className="text-zinc-900 dark:text-zinc-100">{new Date(todayAbsensi.jam_keluar!).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong>
                                    </p>
                                </div>

                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] font-bold text-[#78716C] dark:text-zinc-400 uppercase block">Total Jam Kerja</span>
                                    <span className="font-mono text-xl font-bold text-[#0A0A0A] dark:text-white">
                                        {Math.floor(todayAbsensi.jam_kerja_menit / 60)} jam {todayAbsensi.jam_kerja_menit % 60} menit
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">
                                    Terima kasih atas kerja keras Anda hari ini!
                                </span>
                                <Link
                                    href="/absensi/riwayat"
                                    className="px-4 py-2 rounded-[10px] border border-[#E7E5E4] dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-[#0A0A0A] dark:text-zinc-100 transition"
                                >
                                    Lihat Riwayat Saya
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 2 — STATISTIK BULAN INI (Grid 2x2) */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-zinc-400 mb-3">
                        Statistik Kehadiran Anda (Bulan Ini)
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Total Hadir</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white">{stats.total_hadir}</span>
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">hari</span>
                            </div>
                            <span className="text-[10px] text-[#16A34A] dark:text-emerald-400 font-semibold mt-1 block">Presensi on-time &amp; shift</span>
                        </div>

                        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Terlambat</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-mono text-2xl font-bold text-[#F59E0B] dark:text-amber-400">{stats.total_terlambat}</span>
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">kali</span>
                            </div>
                            <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">&gt;{pengaturan.toleransi_terlambat_menit}m toleransi</span>
                        </div>

                        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Izin / Sakit / Cuti</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-mono text-2xl font-bold text-[#8B7355] dark:text-amber-400">{stats.total_izin_cuti}</span>
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">hari</span>
                            </div>
                            <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">Pengajuan disetujui</span>
                        </div>

                        <div className="p-4 sm:p-5 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 shadow-sm">
                            <span className="text-xs font-semibold text-[#78716C] dark:text-zinc-400 block">Total Jam Kerja</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white">{stats.total_jam_kerja}</span>
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">jam</span>
                            </div>
                            <span className="text-[10px] text-[#78716C] dark:text-zinc-400 mt-1 block">Akumulasi menit kerja</span>
                        </div>
                    </div>
                </div>

                {/* SECTION 3 — QUICK ACTIONS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <Link
                        href="/absensi/izin"
                        className="p-4 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:border-[#0A0A0A] dark:hover:border-zinc-600 transition shadow-sm flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 flex items-center justify-center text-[#0A0A0A] dark:text-white">
                                <CalendarCheck className="w-5 h-5 text-[#8B7355] dark:text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Ajukan Izin / Sakit / Cuti</h4>
                                <p className="text-xs text-[#78716C] dark:text-zinc-400">Pengajuan dispensasi langsung ke manager</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#78716C] dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                        href="/absensi/riwayat"
                        className="p-4 rounded-[16px] bg-white dark:bg-zinc-900 border border-[#E7E5E4] dark:border-zinc-800 hover:border-[#0A0A0A] dark:hover:border-zinc-600 transition shadow-sm flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FAFAF9] dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 flex items-center justify-center text-[#0A0A0A] dark:text-white">
                                <History className="w-5 h-5 text-[#8B7355] dark:text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Riwayat Presensi Lengkap</h4>
                                <p className="text-xs text-[#78716C] dark:text-zinc-400">Log bulanan &amp; rincian jam kerja</p>
                            </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#78716C] dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* MODAL CLOCK IN / CLOCK OUT (KAMERA + GPS) */}
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[20px] border border-[#E7E5E4] dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh] transition-colors">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-[#E7E5E4] dark:border-zinc-800 flex items-center justify-between bg-[#FAFAF9] dark:bg-zinc-900/90">
                            <div>
                                <h3 className="font-serif font-bold text-base text-[#0A0A0A] dark:text-white">
                                    {modalType === 'in' ? 'Absen Masuk (Clock In)' : 'Absen Pulang (Clock Out)'}
                                </h3>
                                <p className="text-[11px] text-[#78716C] dark:text-zinc-400">Verifikasi swafoto &amp; titik lokasi</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="p-1.5 rounded-lg text-[#78716C] dark:text-zinc-400 hover:bg-[#E7E5E4] dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto space-y-4">
                            {/* Waktu Sekarang */}
                            <div className="text-center py-1">
                                <span className="font-mono text-2xl font-bold text-[#0A0A0A] dark:text-white block">{currentTime}</span>
                                <span className="text-xs text-[#78716C] dark:text-zinc-400">{todayDateFormatted}</span>
                            </div>

                            {/* Kamera Preview / Snapshot */}
                            {pengaturan.aktif_swafoto && (
                                <div className="space-y-2">
                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-[#E7E5E4] dark:border-zinc-700">
                                        {!capturedImage ? (
                                            <>
                                                {cameraError ? (
                                                    <div className="p-4 text-center text-xs text-red-400 space-y-1">
                                                        <AlertCircle className="w-6 h-6 mx-auto text-red-400" />
                                                        <p>{cameraError}</p>
                                                    </div>
                                                ) : (
                                                    <video
                                                        ref={videoRef}
                                                        autoPlay
                                                        playsInline
                                                        muted
                                                        className="w-full h-full object-cover transform -scale-x-100"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <img
                                                src={capturedImage}
                                                alt="Hasil Swafoto"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <canvas ref={canvasRef} className="hidden" />
                                    </div>

                                    {/* Capture Action */}
                                    <div className="flex justify-center">
                                        {!capturedImage ? (
                                            <button
                                                type="button"
                                                onClick={handleCapture}
                                                disabled={Boolean(cameraError)}
                                                className="py-2.5 px-6 rounded-[10px] bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                                            >
                                                <Camera className="w-4 h-4 text-[#8B7355] dark:text-white" />
                                                <span>Ambil Foto</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleRetake}
                                                className="py-2 px-4 rounded-[10px] bg-white dark:bg-zinc-800 border border-[#E7E5E4] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-[#0A0A0A] dark:text-zinc-100 flex items-center gap-1.5 transition"
                                            >
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                <span>Ulangi Foto</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Status GPS Lokasi */}
                            {pengaturan.aktif_gps && (
                                <div className="p-3 rounded-xl border border-[#E7E5E4] dark:border-zinc-700 bg-[#FAFAF9] dark:bg-zinc-800/80 text-xs space-y-1">
                                    <div className="flex items-center justify-between font-semibold">
                                        <span className="flex items-center gap-1.5 text-[#0A0A0A] dark:text-zinc-200">
                                            <MapPin className="w-3.5 h-3.5 text-[#8B7355] dark:text-amber-400" />
                                            <span>Deteksi Lokasi GPS</span>
                                        </span>
                                        {gpsStatus === 'loading' && (
                                            <span className="text-[#78716C] dark:text-zinc-400 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Mengambil lokasi...
                                            </span>
                                        )}
                                        {gpsStatus === 'success' && (
                                            <span className="text-[#16A34A] dark:text-emerald-400 flex items-center gap-1">
                                                <Check className="w-3.5 h-3.5" />
                                                Lokasi Terdeteksi
                                            </span>
                                        )}
                                        {gpsStatus === 'error' && (
                                            <span className="text-[#DC2626] dark:text-rose-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                Gagal
                                            </span>
                                        )}
                                    </div>
                                    {gpsStatus === 'error' && (
                                        <p className="text-[11px] text-[#DC2626] dark:text-rose-400">{gpsErrorMsg}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#E7E5E4] dark:border-zinc-800 bg-[#FAFAF9] dark:bg-zinc-900/90 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 rounded-[10px] text-xs font-semibold text-[#78716C] dark:text-zinc-400 hover:bg-[#E7E5E4] dark:hover:bg-zinc-800 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitAbsen}
                                disabled={
                                    isSubmitting ||
                                    (pengaturan.aktif_swafoto && !capturedImage) ||
                                    (pengaturan.aktif_gps && gpsStatus !== 'success')
                                }
                                className={`px-5 py-2.5 rounded-[10px] text-xs font-bold text-white transition shadow-sm flex items-center gap-2 ${
                                    modalType === 'in'
                                        ? 'bg-[#0A0A0A] dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500'
                                        : 'bg-[#DC2626] hover:bg-red-700'
                                } disabled:opacity-50`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyimpan Presensi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Konfirmasi {modalType === 'in' ? 'Absen Masuk' : 'Absen Pulang'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
