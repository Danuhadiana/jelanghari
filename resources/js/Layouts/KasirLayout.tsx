import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, Clock, Sun, Moon, ChevronDown, LogOut, ChefHat, 
    Coffee, Utensils, ExternalLink, Settings, X, Sparkles, Keyboard, 
    Bell, Store, AlertCircle, History, Bot, Maximize, Minimize, Calculator 
} from 'lucide-react';
import LogoutConfirmModal from '@/Components/LogoutConfirmModal';
import JelangAiModal from '@/Components/JelangAiModal';
import { rupiah } from '@/lib/format';

interface KasirLayoutProps {
    title?: string;
    shiftInfo?: {
        waktu_buka: string;
        kas_awal: number;
    } | null;
    currentShift?: any;
    onOpenShift?: () => void;
    onCloseShift?: () => void;
    onHistoryShift?: () => void;
    onOpenOrderHistory?: () => void;
    onOpenCalculator?: () => void;
    headerActions?: React.ReactNode;
}

export default function KasirLayout({ 
    title = 'Kasir POS', 
    shiftInfo, 
    currentShift,
    onOpenShift,
    onCloseShift,
    onHistoryShift,
    onOpenOrderHistory,
    onOpenCalculator,
    headerActions, 
    children 
}: PropsWithChildren<KasirLayoutProps>) {
    const { auth } = usePage<any>().props;
    const userRole = (typeof auth?.user?.role === 'string' ? auth.user.role : (auth?.user?.role_slug || auth?.user?.role?.slug || '')).toLowerCase();
    const isOwnerOrManager = ['owner', 'manager'].includes(userRole);
    const [currentTime, setCurrentTime] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('theme') || localStorage.getItem('jh_theme');
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved === 'dark' || (!saved && systemPrefersDark) || document.documentElement.classList.contains('dark');
        setIsDarkMode(shouldBeDark);
        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        const handleStorage = (e: StorageEvent) => {
            if ((e.key === 'jh_theme' || e.key === 'theme') && e.newValue) {
                const dark = e.newValue === 'dark';
                setIsDarkMode(dark);
                if (dark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                toggleTheme();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isDarkMode]);

    const toggleTheme = (target?: 'dark' | 'light') => {
        const next = target ? target === 'dark' : !isDarkMode;
        setIsDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('jh_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            localStorage.setItem('jh_theme', 'light');
        }
    };

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    };

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`h-screen w-screen overflow-hidden flex flex-col ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'} select-none selection:bg-zinc-900 selection:text-white transition-colors duration-200`}>
            <Head title={`${title} - Jelang Hari`} />

            <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-4 flex items-center justify-between flex-shrink-0 z-30 shadow-xs transition-colors">
                {/* ── Left: Back & Brand ── */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href={isOwnerOrManager ? '/dashboard' : '/'}
                        title={isOwnerOrManager ? 'Kembali ke Dashboard' : 'Kembali ke Beranda Kafe'}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition text-xs font-semibold"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{isOwnerOrManager ? 'Dashboard' : 'Beranda'}</span>
                    </Link>

                    <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700 mx-0.5 hidden sm:block" />

                    <div className="flex items-center gap-2">
                        <img
                            src="/images/logo.png"
                            alt="Jelang Hari"
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-contain bg-white p-0.5 border border-zinc-200 dark:border-zinc-700 shadow-xs"
                        />
                        <span className="font-bold text-sm tracking-tight text-zinc-950 dark:text-white hidden md:inline">
                            Jelang Hari POS
                        </span>
                    </div>
                </div>

                {/* ── Center: Header Actions Slot (Optional) ── */}
                {headerActions && (
                    <div className="flex-1 flex items-center justify-center px-2 min-w-0">
                        {headerActions}
                    </div>
                )}

                {/* ── Right Controls ── */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Tombol Pengaturan Kasir POS (Tema & Preferensi) */}
                    <button
                        type="button"
                        onClick={() => setIsSettingsModalOpen(true)}
                        title="Pengaturan Kasir POS (Pintasan & Info)"
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition active:scale-95 shrink-0"
                        aria-label="Pengaturan Kasir"
                    >
                        <Settings className="w-4 h-4" />
                    </button>

                    {/* Tombol Fullscreen Layar Tablet / POS */}
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Keluar Mode Layar Penuh' : 'Mode Layar Penuh (Tablet/POS)'}
                        className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition active:scale-95 shrink-0"
                    >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>

                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setProfileDropdownOpen(v => !v)}
                            className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 transition"
                        >
                            <div className="w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                                {(auth.user?.nama || auth.user?.name || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div className="text-left hidden sm:block">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block leading-tight">
                                    {auth.user?.nama || auth.user?.name || 'Kasir'}
                                </span>
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 uppercase font-bold tracking-wider block">
                                    {auth.user?.role?.slug || auth.user?.role_slug || (typeof auth.user?.role === 'string' ? auth.user.role : 'kasir')}
                                </span>
                            </div>
                            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Profile Dropdown Minimalis */}
                        {profileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                                {/* Header Ringkas */}
                                <div className="px-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                            {auth.user?.nama || auth.user?.name || 'Kasir'}
                                        </p>
                                        <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                            {auth.user?.role?.slug || auth.user?.role_slug || (typeof auth.user?.role === 'string' ? auth.user.role : 'kasir')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                                        {currentShift ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span>Shift Buka</span>
                                                <span className="text-zinc-400 font-mono text-[10px]">({rupiah((Number(currentShift.modal_awal) || 0) + (Number(currentShift.total_penjualan_cash) || 0))})</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                                <span>Toko Belum Buka</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="space-y-0.5 pt-0.5">
                                    {/* Buka / Tutup Shift */}
                                    {!currentShift ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                onOpenShift?.();
                                            }}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-semibold transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3.5 h-3.5" />
                                                <span>Buka Shift Baru</span>
                                            </div>
                                            <span className="text-[10px] font-bold">&rarr;</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                onCloseShift?.();
                                            }}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Store className="w-3.5 h-3.5" />
                                                <span>Tutup Shift Kasir</span>
                                            </div>
                                            <span className="text-[10px] font-bold">&rarr;</span>
                                        </button>
                                    )}

                                    {/* Kalkulator Cepat (Pindah ke Dropdown) */}
                                    {onOpenCalculator && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                onOpenCalculator();
                                            }}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Calculator className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                                <span>Kalkulator</span>
                                            </div>
                                        </button>
                                    )}

                                    {/* Toggle Dark / Light Mode (di Navbar Dropdown Profil) */}
                                    <div 
                                        onClick={() => toggleTheme()}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium cursor-pointer select-none"
                                    >
                                        <div className="flex items-center gap-2">
                                            {isDarkMode ? (
                                                <Moon className="w-3.5 h-3.5 text-amber-400" />
                                            ) : (
                                                <Sun className="w-3.5 h-3.5 text-amber-500" />
                                            )}
                                            <span className="text-xs">Tema POS</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-700/80 p-0.5 rounded-lg border border-zinc-300/60 dark:border-zinc-600/60">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTheme('light');
                                                }}
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                                    !isDarkMode
                                                        ? 'bg-white text-zinc-900 shadow-2xs'
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                                }`}
                                                title="Aktifkan Mode Terang (Light)"
                                            >
                                                <Sun className="w-2.5 h-2.5 text-amber-500" />
                                                <span>Light</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTheme('dark');
                                                }}
                                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                                                    isDarkMode
                                                        ? 'bg-zinc-900 text-white shadow-2xs'
                                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                                                }`}
                                                title="Aktifkan Mode Gelap (Dark)"
                                            >
                                                <Moon className="w-2.5 h-2.5 text-amber-400" />
                                                <span>Dark</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Riwayat Shift */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            onHistoryShift?.();
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                    >
                                        <History className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Riwayat Shift</span>
                                    </button>

                                    {/* Riwayat Pesanan Kasir */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            onOpenOrderHistory?.();
                                        }}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Riwayat Pesanan</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400">Hari Ini</span>
                                    </button>

                                    {/* Asisten AI */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            setIsAiModalOpen(true);
                                        }}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium transition"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Asisten AI Jelang Hari</span>
                                        </div>
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                            AI
                                        </span>
                                    </button>

                                    {/* Layar KDS */}
                                    <Link
                                        href="/kds"
                                        onClick={() => setProfileDropdownOpen(false)}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChefHat className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Layar KDS Dapur &amp; Bar</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400">&rarr;</span>
                                    </Link>
                                </div>

                                <div className="h-px bg-zinc-100 dark:bg-zinc-800/80 my-1" />

                                {/* Pengaturan, Dashboard, Logout */}
                                <div className="space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            setIsSettingsModalOpen(true);
                                        }}
                                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Settings className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Pengaturan Kasir</span>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 capitalize">{isDarkMode ? 'Gelap' : 'Terang'}</span>
                                    </button>

                                    {isOwnerOrManager ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Dashboard Toko</span>
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/"
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition font-medium"
                                        >
                                            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Beranda Kafe</span>
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            setIsLogoutModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-medium"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Keluar (Logout)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-[8px] border border-zinc-200/60 dark:border-zinc-700">
                        <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>{currentTime}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {children}
            </main>

            {/* Modal Konfirmasi Logout */}
            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => router.post('/logout')}
            />

            {/* Modal Asisten AI Jelang Hari */}
            <JelangAiModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
            />

            {/* ── MODAL PENGATURAN KASIR POS (Tema & Preferensi) ── */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
                    <div 
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh] animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Pengaturan Kasir POS</h3>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Preferensi tampilan & panduan operasional kasir</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSettingsModalOpen(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Konten Modal */}
                        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
                            {/* 1. Pengaturan Mode Gelap / Terang */}
                            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Tema Visual Layar POS</h4>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Pilih mode tampilan sesuai pencahayaan toko (Ctrl+Shift+L)</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-300/80 dark:border-zinc-700">
                                        <button
                                            type="button"
                                            onClick={() => toggleTheme('light')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                !isDarkMode 
                                                    ? 'bg-white text-zinc-900 shadow-xs' 
                                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Terang</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleTheme('dark')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                                isDarkMode 
                                                    ? 'bg-zinc-900 text-white shadow-xs' 
                                                    : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            <Moon className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Gelap</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Informasi Kasir & Toko */}
                            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Informasi Kasir</h4>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-[10px] text-zinc-400 block">Nama Kasir</span>
                                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">
                                            {auth.user?.nama || auth.user?.name || 'Kasir'}
                                        </span>
                                    </div>
                                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-[10px] text-zinc-400 block">Hak Akses</span>
                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[10px] block">
                                            {auth.user?.role?.slug || auth.user?.role_slug || 'kasir'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Pintasan Keyboard POS */}
                            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center gap-1.5">
                                    <Keyboard className="w-3.5 h-3.5 text-zinc-500" />
                                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Pintasan Cepat</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-600 dark:text-zinc-400">Pencarian Menu</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-500">Ctrl+K</kbd>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-zinc-600 dark:text-zinc-400">Tutup Dialog</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-zinc-500">ESC</kbd>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-800/40">
                            <button
                                type="button"
                                onClick={() => setIsSettingsModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs transition"
                            >
                                Selesai
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
