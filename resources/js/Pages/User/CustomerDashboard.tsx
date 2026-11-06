import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Coffee,
    Sparkles,
    CreditCard,
    ShoppingBag,
    Ticket,
    Calendar,
    Settings,
    LayoutDashboard,
    Wifi,
    LogOut,
    CheckCircle2,
    Clock,
    ChevronRight,
    Copy,
    Check,
    ArrowUpRight,
    QrCode,
    Utensils,
    ExternalLink,
    Lock,
    User as UserIcon,
    Phone,
    Mail,
    Sun,
    Moon,
    ChevronDown,
    X,
    AlertCircle,
    Info,
    Flame,
    Share2,
    SlidersHorizontal,
    FileText
} from 'lucide-react';
import { rupiah } from '@/lib/format';

interface Props {
    user: {
        id: number;
        name: string;
        email: string;
        telepon?: string | null;
        role?: string;
        member_since: string;
    };
    member: {
        id_card: string;
        poin: number;
        tier: string;
        tier_color: string;
        tier_discount: string;
        next_tier_name: string;
        next_tier_target: number;
        tier_progress: number;
        total_kunjungan: number;
        total_transaksi: number;
    };
    activeOrders: Array<{
        id: number;
        nomor_pesanan: string;
        total: number;
        status_pesanan: string;
        status_pembayaran: string;
        metode_pembayaran?: string;
        tipe_pesanan?: string;
        meja?: { nomor: string } | null;
        items_count: number;
        created_at: string;
    }>;
    recentOrders: Array<{
        id: number;
        nomor_pesanan: string;
        total: number;
        status_pesanan: string;
        status_pembayaran: string;
        metode_pembayaran?: string;
        tipe_pesanan?: string;
        meja?: { nomor: string } | null;
        items: Array<{
            nama_produk: string;
            nama_varian?: string | null;
            jumlah: number;
            subtotal: number;
        }>;
        created_at: string;
    }>;
    vouchers: Array<{
        id: number;
        kode: string;
        nama: string;
        tipe: string;
        nilai: number;
        min_transaksi: number;
        berlaku_sampai?: string | null;
    }>;
    facilities: {
        nama_cafe: string;
        alamat_cafe: string;
        telepon_cafe: string;
        wifi_ssid: string;
        wifi_password: string;
    };
    mejas: Array<{
        id: number;
        nomor: string;
        kapasitas: number;
        status: string;
    }>;
}

export default function CustomerDashboard({
    user,
    member,
    activeOrders = [],
    recentOrders = [],
    vouchers = [],
    facilities,
    mejas = []
}: Props) {
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'vouchers' | 'reservations' | 'settings'>('overview');
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Dark mode state with multi-tab & system preference sync
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jh_theme');
            if (saved) return saved === 'dark';
            return document.documentElement.classList.contains('dark') ||
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Copied feedback
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Modal States
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [orderDetailModal, setOrderDetailModal] = useState<any | null>(null);
    const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
    const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);
    const [cashierModalOpen, setCashierModalOpen] = useState(false);
    const [activeVoucherModal, setActiveVoucherModal] = useState<any | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Profile Form
    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        telepon: user.telepon || '',
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Reservation Form
    const reservationForm = useForm({
        tanggal: new Date().toISOString().split('T')[0],
        jam: '14:00',
        jumlah_orang: 2,
        meja_id: '',
        catatan: '',
    });

    // Handle Click Outside for Dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dark mode HTML class & storage synchronization
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'jh_theme' && e.newValue) {
                setIsDarkMode(e.newValue === 'dark');
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('jh_theme')) {
                setIsDarkMode(e.matches);
            }
        };

        window.addEventListener('storage', handleStorage);
        mediaQuery.addEventListener('change', handleMediaChange);
        return () => {
            window.removeEventListener('storage', handleStorage);
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    }, [isDarkMode]);

    const toggleTheme = (target?: 'dark' | 'light') => {
        setIsDarkMode(prev => {
            const next = target ? target === 'dark' : !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('jh_theme', next ? 'dark' : 'light');
                if (next) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
            return next;
        });
    };

    // Keyboard Shortcuts (Esc to close, Enter to submit active confirm modals)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (cashierModalOpen) {
                    setCashierModalOpen(false);
                    return;
                }
                if (activeVoucherModal) {
                    setActiveVoucherModal(null);
                    return;
                }
                if (confirmLogoutOpen) {
                    setConfirmLogoutOpen(false);
                    return;
                }
                if (confirmProfileOpen) {
                    setConfirmProfileOpen(false);
                    return;
                }
                if (confirmPasswordOpen) {
                    setConfirmPasswordOpen(false);
                    return;
                }
                if (orderDetailModal) {
                    setOrderDetailModal(null);
                    return;
                }
                if (profileDropdownOpen) {
                    setProfileDropdownOpen(false);
                    return;
                }
            }

            if (e.key === 'Enter') {
                if (confirmLogoutOpen) {
                    e.preventDefault();
                    router.post('/logout');
                    return;
                }
                if (confirmProfileOpen) {
                    e.preventDefault();
                    handleSaveProfile();
                    return;
                }
                if (confirmPasswordOpen) {
                    e.preventDefault();
                    handleSavePassword();
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [confirmLogoutOpen, confirmProfileOpen, confirmPasswordOpen, orderDetailModal, profileDropdownOpen, cashierModalOpen, activeVoucherModal]);

    // Robust clipboard copy with fallback to document.execCommand
    // Works reliably on HTTPS, HTTP local network, mobile browsers, and webviews
    const handleCopy = async (text: string, fieldName: string) => {
        let success = false;
        try {
            if (navigator?.clipboard?.writeText && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                success = true;
            } else {
                throw new Error('Clipboard API fallback');
            }
        } catch {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                success = document.execCommand('copy');
                textArea.remove();
            } catch {
                success = false;
            }
        }

        setCopiedField(fieldName);
        setToastMessage(`"${text}" berhasil disalin!`);
        setTimeout(() => setCopiedField(null), 2500);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleSaveProfile = () => {
        setConfirmProfileOpen(false);
        profileForm.post('/user/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setToastMessage('Profil berhasil diperbarui!');
                setTimeout(() => setToastMessage(null), 3500);
            }
        });
    };

    const handleSavePassword = () => {
        setConfirmPasswordOpen(false);
        passwordForm.put('/user/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                setToastMessage('Kata sandi berhasil diperbarui!');
                setTimeout(() => setToastMessage(null), 3500);
            }
        });
    };

    const handleReservationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        reservationForm.post('/user/reserve', {
            preserveScroll: true,
            onSuccess: () => {
                reservationForm.reset();
                setToastMessage('Reservasi berhasil dikirim! Tim kami akan menghubungi via WhatsApp.');
                setTimeout(() => setToastMessage(null), 4000);
            }
        });
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#FAFAF9] text-zinc-900'} font-sans antialiased selection:bg-zinc-950 selection:text-white transition-colors duration-200 flex flex-col`}>
            <Head title="Member Dashboard - Jelang Hari Coffee & Workspace" />

            {/* ── TOAST NOTIFIKASI ── */}
            {toastMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4">
                    <div className="p-3.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl flex items-center justify-between gap-3 text-xs font-semibold border border-zinc-800 dark:border-zinc-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                            <span>{toastMessage}</span>
                        </div>
                        <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── NAVBAR UTAMA MEMBER ── */}
            <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    
                    {/* Brand Logo & Tagline */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <img
                                src="/images/logo.png"
                                alt="Jelang Hari"
                                className="w-9 h-9 object-contain rounded-full bg-white p-0.5 border border-zinc-200 dark:border-zinc-700 shadow-sm transition group-hover:scale-105"
                            />
                            <div>
                                <span className="font-sans font-bold text-base leading-tight text-zinc-950 dark:text-white tracking-tight block">
                                    Jelang Hari
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold block">
                                    Portal Member &amp; Customer
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigasi Cepat Halaman */}
                    <div className="hidden md:flex items-center gap-1 text-xs font-medium">
                        {(user.role === 'owner' || user.role === 'manager') && (
                            <Link
                                href="/dashboard"
                                className="px-3 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs transition flex items-center gap-1.5 mr-1 text-xs"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span>Dashboard POS Admin</span>
                            </Link>
                        )}
                        <Link
                            href="/"
                            className="px-3.5 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex items-center gap-1.5"
                        >
                            <Coffee className="w-3.5 h-3.5" />
                            <span>Pesan Menu Online</span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setActiveTab('reservations')}
                            className={`px-3.5 py-1.5 rounded-full transition flex items-center gap-1.5 ${
                                activeTab === 'reservations'
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white font-bold'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Reservasi Workspace</span>
                        </button>
                    </div>

                    {/* Sisi Kanan: Theme Toggle & Dropdown Profil Pengguna */}
                    <div className="flex items-center gap-2">
                        {/* Direct Navbar Theme Toggle */}
                        <button
                            type="button"
                            onClick={() => toggleTheme()}
                            className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all shadow-xs active:scale-95 group"
                            title={isDarkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                            aria-label="Ganti Tema Tampilan"
                        >
                            {isDarkMode ? (
                                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            ) : (
                                <Moon className="w-4 h-4 text-zinc-700 dark:text-zinc-300 group-hover:-rotate-12 transition-transform duration-300" />
                            )}
                        </button>

                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(v => !v)}
                                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 transition shadow-sm active:scale-95 text-xs"
                            >
                                <div className="w-7 h-7 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <span className="font-bold text-zinc-900 dark:text-white block leading-tight text-xs">
                                        {user.name}
                                    </span>
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                        <span>{member.tier}</span> • <span>{member.poin} Poin</span>
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu Modal */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2.5 w-[300px] sm:w-[340px] max-w-[95vw] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    
                                    {/* Header Info */}
                                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/70 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-xs text-zinc-900 dark:text-white truncate">{user.name}</p>
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                                {member.tier}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{user.email}</p>
                                        <div className="mt-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                                            <span className="text-zinc-500 dark:text-zinc-400">Saldo Poin:</span>
                                            <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{member.poin} Poin</span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="space-y-1">
                                        {(user.role === 'owner' || user.role === 'manager') && (
                                            <Link
                                                href="/dashboard"
                                                className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <LayoutDashboard className="w-4 h-4 text-zinc-500" />
                                                    <span>Kembali ke Dashboard Admin</span>
                                                </div>
                                                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveTab('settings');
                                                setProfileDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Settings className="w-4 h-4 text-zinc-500" />
                                                <span>Pengaturan Akun &amp; Profil</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                        </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('orders');
                                            setProfileDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <ShoppingBag className="w-4 h-4 text-zinc-500" />
                                            <span>Riwayat Pesanan &amp; Struk</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveTab('vouchers');
                                            setProfileDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Ticket className="w-4 h-4 text-zinc-500" />
                                            <span>Voucher Diskon Saya</span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                    </button>

                                    <Link
                                        href="/"
                                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Coffee className="w-4 h-4 text-zinc-500" />
                                            <span>Halaman Menu Utama</span>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                    </Link>
                                </div>

                                {/* Logout Button */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                    <div className="text-[10px] text-zinc-400">
                                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[9px]">ESC</kbd> tutup
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            setConfirmLogoutOpen(true);
                                        }}
                                        className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Keluar</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>

            {/* ── KONTEN UTAMA DASHBOARD ── */}
            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8">
                
                {/* 1. HERO SECTION: KARTU MEMBER DIGITAL & FAST ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Kartu Member Virtual Eksklusif (Lg: 7 cols) */}
                    <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#121212] to-black border border-zinc-800 p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col justify-between text-white">
                        {/* Aksen Kilau Emas */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#8B7355]/20 to-transparent blur-2xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500/10 to-transparent blur-xl pointer-events-none" />

                        {/* Header Kartu */}
                        <div className="flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo"
                                    className="w-10 h-10 object-contain rounded-full bg-white p-0.5 border border-amber-500/30"
                                />
                                <div>
                                    <span className="font-serif font-bold text-lg tracking-tight block">
                                        Jelang Hari
                                    </span>
                                    <span className="text-[10px] tracking-widest uppercase text-amber-400 font-mono font-bold block">
                                        {member.tier}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-mono">ID MEMBER</span>
                                <span className="font-mono font-bold text-sm tracking-wider text-amber-200">{member.id_card}</span>
                            </div>
                        </div>

                        {/* Poin & Saldo Rewards */}
                        <div className="my-6 z-10">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                                    {member.poin}
                                </span>
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
                                    Poin Loyalty
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">
                                Benefit: <span className="text-zinc-200 font-semibold">{member.tier_discount}</span>
                            </p>

                            {/* Progres Bar ke Tier Berikutnya */}
                            {member.next_tier_name !== 'Level Tertinggi' && (
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                                        <span>Menuju {member.next_tier_name}</span>
                                        <span className="font-mono font-bold text-amber-300">{member.poin} / {member.next_tier_target} Poin</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#8B7355] to-amber-400 transition-all duration-500"
                                            style={{ width: `${member.tier_progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Kartu & QR Scan */}
                        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 z-10 text-xs">
                            <div>
                                <p className="text-[10px] text-zinc-400 uppercase">Pemilik Kartu</p>
                                <p className="font-bold text-sm text-white tracking-wide">{user.name}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCopy(member.id_card, 'member_card')}
                                    className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 font-mono text-xs flex items-center gap-1.5 text-zinc-200 transition"
                                    title="Salin ID Kartu"
                                >
                                    {copiedField === 'member_card' ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Disalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                            <span>Salin ID</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setCashierModalOpen(true)}
                                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md active:scale-95"
                                    title="Tunjukkan QR & ID Kartu ke Kasir"
                                >
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>Tunjukkan ke Kasir</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Ringkasan Fasilitas & Fast Actions (Lg: 5 cols) */}
                    <div className="lg:col-span-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    <Wifi className="w-4 h-4 text-emerald-500" />
                                    <span>Fasilitas WiFi Workspace</span>
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                                    Member Aktif
                                </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/70 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 dark:text-zinc-400">Nama WiFi (SSID):</span>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{facilities.wifi_ssid}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 dark:text-zinc-400">Password WiFi:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{facilities.wifi_password}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(facilities.wifi_password, 'wifi_pw')}
                                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                                            title="Salin Password WiFi"
                                        >
                                            {copiedField === 'wifi_pw' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Cepat Aksi */}
                        <div className="space-y-2.5">
                            <Link
                                href="/"
                                className="w-full py-2.5 px-4 rounded-2xl bg-[#0A0A0A] hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                            >
                                <Coffee className="w-4 h-4 text-[#8B7355]" />
                                <span>Pesan Kopi / Makanan Sekarang</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                            </Link>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('reservations')}
                                    className="py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                >
                                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Booking Meja</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('vouchers')}
                                    className="py-2.5 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                                >
                                    <Ticket className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Voucher ({vouchers.length})</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TAB NAVIGASI KHUSUS FITUR MEMBER */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'overview'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700/80 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pesanan Aktif ({activeOrders.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'orders'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700/80 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Riwayat Transaksi &amp; Struk</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('vouchers')}
                        className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'vouchers'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700/80 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Kupon &amp; Voucher</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reservations')}
                        className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'reservations'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700/80 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Booking Meja Workspace</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'settings'
                                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700/80 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Pengaturan Akun (Settings)</span>
                    </button>
                </div>

                {/* 3. KONTEN TAB SPESIFIK */}

                {/* TAB 1: PESANAN AKTIF (LIVE TRACKING) */}
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <span>Pesanan Sedang Diproses Saat Ini</span>
                            </h3>
                            <Link href="/" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                                + Tambah Pesanan Baru
                            </Link>
                        </div>

                        {activeOrders.length === 0 ? (
                            <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                                <Coffee className="w-10 h-10 mx-auto text-zinc-400 stroke-[1.5]" />
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Tidak Ada Pesanan Aktif</h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                                    Anda sedang tidak memiliki pesanan yang menunggu atau diracik. Silakan pesan kopi atau makanan favorit Anda!
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm transition"
                                >
                                    <span>Buka Menu &amp; Pesan</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activeOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                                {order.nomor_pesanan}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                order.status_pesanan === 'siap'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse'
                                                    : order.status_pesanan === 'diproses'
                                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            }`}>
                                                {order.status_pesanan === 'siap' ? 'Siap Diambil' : order.status_pesanan === 'diproses' ? 'Sedang Diracik' : 'Menunggu Dapur'}
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center justify-between text-zinc-500">
                                                <span>Lokasi:</span>
                                                <span className="font-semibold text-zinc-900 dark:text-white">
                                                    {order.meja ? `Meja ${order.meja.nomor}` : 'Takeaway / Bungkus'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-zinc-500">
                                                <span>Total:</span>
                                                <span className="font-bold text-zinc-900 dark:text-white font-mono">
                                                    {rupiah(order.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-zinc-500">
                                                <span>Waktu Pesan:</span>
                                                <span>{order.created_at}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                            <a
                                                href={`/struk/${order.nomor_pesanan}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>Struk Digital</span>
                                            </a>
                                            <span className="text-[10px] text-zinc-400 font-mono">
                                                {order.items_count} item
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: RIWAYAT TRANSAKSI LENGKAP */}
                {activeTab === 'orders' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                Riwayat Transaksi &amp; Struk Pembelian Anda
                            </h3>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                                Total: {recentOrders.length} Transaksi
                            </span>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                                Belum ada riwayat pesanan. Mulai nikmati kopi pertama Anda hari ini!
                            </div>
                        ) : (
                            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {recentOrders.map(order => (
                                        <div
                                            key={order.id}
                                            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-xs text-zinc-900 dark:text-white">
                                                        {order.nomor_pesanan}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                        {order.meja ? `Meja ${order.meja.nomor}` : 'Takeaway'}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        {order.status_pembayaran}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-400">
                                                    {order.created_at} • {order.items.length} jenis item
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4">
                                                <div className="text-right">
                                                    <span className="text-[10px] text-zinc-400 uppercase block">Total Bayar</span>
                                                    <span className="font-mono font-bold text-sm text-zinc-950 dark:text-white">
                                                        {rupiah(order.total)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOrderDetailModal(order)}
                                                        className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition"
                                                    >
                                                        Rincian
                                                    </button>
                                                    <a
                                                        href={`/struk/${order.nomor_pesanan}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-3 py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1 transition"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>Struk</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: VOUCHER & KUPON DISKON */}
                {activeTab === 'vouchers' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                                    Voucher &amp; Kupon Promo Eksklusif
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Gunakan kode voucher ini saat melakukan pemesanan di kasir atau pesan online.
                                </p>
                            </div>
                        </div>

                        {vouchers.length === 0 ? (
                            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
                                Saat ini belum ada voucher aktif. Terus tingkatkan poin Anda untuk promo kejutan!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vouchers.map(v => (
                                    <div
                                        key={v.id}
                                        className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    {v.tipe === 'persen' ? `Diskon ${v.nilai}%` : `Potongan ${rupiah(v.nilai)}`}
                                                </span>
                                                {v.berlaku_sampai && (
                                                    <span className="text-[10px] text-zinc-400">
                                                        Exp: {v.berlaku_sampai}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{v.nama}</h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Min. belanja: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{rupiah(v.min_transaksi)}</span>
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                            <div className="font-mono font-bold text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-900 dark:text-white">
                                                {v.kode}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(v.kode, `voucher_${v.id}`)}
                                                    className="px-2.5 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold flex items-center gap-1 transition"
                                                    title="Salin Kode Voucher"
                                                >
                                                    {copiedField === `voucher_${v.id}` ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                            <span>Disalin!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                                            <span>Salin Kode</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveVoucherModal(v)}
                                                    className="px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                                    title="Tunjukkan ke Kasir"
                                                >
                                                    <QrCode className="w-3.5 h-3.5" />
                                                    <span>Tunjukkan</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: RESERVASI MEJA WORKSPACE */}
                {activeTab === 'reservations' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-500" />
                                    <span>Formulir Reservasi Meja &amp; Workspace</span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Dapatkan tempat duduk terjamin untuk kerja fokus, rapat kelompok, atau hangout santai.
                                </p>
                            </div>

                            <form onSubmit={handleReservationSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Tanggal Kunjungan</label>
                                        <input
                                            type="date"
                                            value={reservationForm.data.tanggal}
                                            onChange={e => reservationForm.setData('tanggal', e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Estimasi Jam Kedatangan</label>
                                        <input
                                            type="time"
                                            value={reservationForm.data.jam}
                                            onChange={e => reservationForm.setData('jam', e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Jumlah Tamu / Orang</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={reservationForm.data.jumlah_orang}
                                            onChange={e => reservationForm.setData('jumlah_orang', Number(e.target.value))}
                                            required
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300">Preferensi Meja (Opsional)</label>
                                        <select
                                            value={reservationForm.data.meja_id}
                                            onChange={e => reservationForm.setData('meja_id', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                        >
                                            <option value="">Pilihan Terbaik / Otomatis</option>
                                            {mejas.map(m => (
                                                <option key={m.id} value={m.id}>
                                                    Meja {m.nomor} ({m.kapasitas} Kursi)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Catatan Khusus / Permintaan Colokan / Ruang Tenang</label>
                                    <textarea
                                        rows={3}
                                        value={reservationForm.data.catatan}
                                        onChange={e => reservationForm.setData('catatan', e.target.value)}
                                        placeholder="Contoh: Butuh meja dekat colokan untuk kerja laptop 3 jam..."
                                        className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={reservationForm.processing}
                                    className="w-full py-3 rounded-2xl bg-[#0A0A0A] hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                                >
                                    <Calendar className="w-4 h-4 text-[#8B7355]" />
                                    <span>Ajukan Reservasi Sekarang</span>
                                </button>
                            </form>
                        </div>

                        <div className="lg:col-span-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 text-xs">
                            <h4 className="font-bold text-sm text-zinc-950 dark:text-white flex items-center gap-2">
                                <Info className="w-4 h-4 text-amber-500" />
                                <span>Ketentuan Reservasi &amp; Workspace</span>
                            </h4>
                            <ul className="space-y-2.5 text-zinc-600 dark:text-zinc-400">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>Reservasi meja bebas biaya deposit untuk member terdaftar.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>Meja akan ditahan maksimal 20 menit dari waktu jam reservasi yang dipilih.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>Akses colokan stopkontak &amp; koneksi internet cepat tersedia di setiap zona kerja.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                    <span>Konfirmasi instan akan dikirimkan ke nomor WhatsApp Anda: <strong>{user.telepon || 'Belum diisi'}</strong>.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* TAB 5: PENGATURAN AKUN LENGKAP (SETTINGS) */}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        
                        {/* Preferensi Mode Tampilan (Dark / Light) */}
                        <div className="lg:col-span-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                                    <span>Mode Tampilan Antarmuka</span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Sesuaikan kenyamanan visual Anda antara Mode Terang atau Mode Gelap.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                                <button
                                    type="button"
                                    onClick={() => toggleTheme('light')}
                                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                                        !isDarkMode
                                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-950 dark:text-white shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                                            <Sun className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs block text-zinc-900 dark:text-white">Mode Terang</span>
                                            <span className="text-[10px] text-zinc-500">Tampilan bersih cerah</span>
                                        </div>
                                    </div>
                                    {!isDarkMode && (
                                        <div className="w-5 h-5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
                                            <Check className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleTheme('dark')}
                                    className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 ${
                                        isDarkMode
                                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600 text-zinc-950 dark:text-white shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                            <Moon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-xs block text-zinc-900 dark:text-white">Mode Gelap</span>
                                            <span className="text-[10px] text-zinc-500">Rileks di mata</span>
                                        </div>
                                    </div>
                                    {isDarkMode && (
                                        <div className="w-5 h-5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
                                            <Check className="w-3 h-3" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Form Profil Pengguna */}
                        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    <UserIcon className="w-4 h-4 text-[#8B7355]" />
                                    <span>Profil &amp; Kontak Akun</span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Perbarui nama, nomor WhatsApp, dan alamat email Anda.
                                </p>
                            </div>

                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    setConfirmProfileOpen(true);
                                }}
                                className="space-y-4 text-xs"
                            >
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={profileForm.data.name}
                                        onChange={e => profileForm.setData('name', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Email Login</label>
                                    <input
                                        type="email"
                                        value={profileForm.data.email}
                                        onChange={e => profileForm.setData('email', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Nomor WhatsApp / HP</label>
                                    <input
                                        type="tel"
                                        value={profileForm.data.telepon}
                                        onChange={e => profileForm.setData('telepon', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                    <span className="text-[10px] text-zinc-400">Digunakan untuk konfirmasi pesanan &amp; reservasi.</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="w-full py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100 border border-zinc-700/60 font-semibold text-xs transition shadow-sm"
                                >
                                    Simpan Perubahan Profil
                                </button>
                            </form>
                        </div>

                        {/* Form Ganti Kata Sandi */}
                        <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
                            <div>
                                <h3 className="font-bold text-base text-zinc-950 dark:text-white flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-rose-500" />
                                    <span>Ganti Kata Sandi</span>
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Gunakan kombinasi kata sandi yang aman untuk melindungi akun Anda.
                                </p>
                            </div>

                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    setConfirmPasswordOpen(true);
                                }}
                                className="space-y-4 text-xs"
                            >
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Saat Ini</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.current_password}
                                        onChange={e => passwordForm.setData('current_password', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Kata Sandi Baru</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password}
                                        onChange={e => passwordForm.setData('password', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-zinc-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</label>
                                    <input
                                        type="password"
                                        value={passwordForm.data.password_confirmation}
                                        onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="w-full py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm"
                                >
                                    Perbarui Kata Sandi
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            {/* ── MODAL RINCIAN PESANAN ── */}
            {orderDetailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                            <div>
                                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                    {orderDetailModal.nomor_pesanan}
                                </span>
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Rincian Item Pesanan</h3>
                            </div>
                            <button
                                onClick={() => setOrderDetailModal(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[260px] overflow-y-auto space-y-2 pr-1 text-xs">
                            {orderDetailModal.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <p className="font-semibold text-zinc-900 dark:text-white">{item.nama_produk}</p>
                                        {item.nama_varian && (
                                            <p className="text-[10px] text-zinc-400">{item.nama_varian}</p>
                                        )}
                                        <p className="text-[10px] text-zinc-500 font-mono">x{item.jumlah}</p>
                                    </div>
                                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                        {rupiah(item.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                            <span className="font-semibold text-zinc-500">Total Transaksi:</span>
                            <span className="font-mono font-bold text-base text-zinc-950 dark:text-white">
                                {rupiah(orderDetailModal.total)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <a
                                href={`/struk/${orderDetailModal.nomor_pesanan}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2 rounded-xl bg-[#0A0A0A] hover:bg-zinc-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Buka Struk Digital</span>
                            </a>
                            <button
                                onClick={() => setOrderDetailModal(null)}
                                className="py-2 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI SIMPAN PROFIL ── */}
            {confirmProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Simpan Perubahan Profil?</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Data nama, email, dan WhatsApp Anda akan diperbarui pada sistem keanggotaan Jelang Hari.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={() => setConfirmProfileOpen(false)}
                                className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
                            >
                                Batal <kbd className="text-[9px] opacity-60">ESC</kbd>
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                            >
                                Ya, Simpan <kbd className="text-[9px] opacity-60">↵</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI GANTI PASSWORD ── */}
            {confirmPasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Ganti Kata Sandi?</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Pastikan Anda mengingat kata sandi baru untuk login selanjutnya.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={() => setConfirmPasswordOpen(false)}
                                className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
                            >
                                Batal <kbd className="text-[9px] opacity-60">ESC</kbd>
                            </button>
                            <button
                                onClick={handleSavePassword}
                                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                            >
                                Ya, Ganti <kbd className="text-[9px] opacity-60">↵</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI LOGOUT ── */}
            {confirmLogoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                            <LogOut className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Keluar dari Akun Member?</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Sesi Anda akan diakhiri. Poin dan voucher tetap tersimpan aman di akun Anda.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                onClick={() => setConfirmLogoutOpen(false)}
                                className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs"
                            >
                                Batal <kbd className="text-[9px] opacity-60">ESC</kbd>
                            </button>
                            <button
                                onClick={() => router.post('/logout')}
                                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
                            >
                                Ya, Keluar <kbd className="text-[9px] opacity-60">↵</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL TUNJUKKAN KARTU & QR KE KASIR ── */}
            {cashierModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade"
                    onClick={() => setCashierModalOpen(false)}
                >
                    <div 
                        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl text-center animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-left">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <QrCode className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-950 dark:text-white">Tunjukkan ke Kasir</h4>
                                    <p className="text-[10px] text-zinc-400">Member Jelang Hari Coffee</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCashierModalOpen(false)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Large Scannable QR Code */}
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200 dark:border-zinc-700 inline-block mx-auto shadow-inner">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(member.id_card + '|' + (user.telepon || user.email))}`}
                                alt={`QR Member ${member.id_card}`}
                                className="w-44 h-44 object-contain mx-auto"
                            />
                        </div>

                        {/* Member Details High Contrast Box */}
                        <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-left text-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                                <div>
                                    <span className="text-[10px] text-zinc-400 uppercase font-mono block">ID Member</span>
                                    <span className="font-mono font-extrabold text-base text-amber-600 dark:text-amber-400">
                                        {member.id_card}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(member.id_card, 'modal_id')}
                                    className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition"
                                >
                                    {copiedField === 'modal_id' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedField === 'modal_id' ? 'Disalin' : 'Salin'}</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div>
                                    <span className="text-[10px] text-zinc-400 block">Nama / No. WhatsApp:</span>
                                    <p className="font-bold text-zinc-900 dark:text-white">{user.name}</p>
                                    <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300">{user.telepon || 'Belum ada nomor HP'}</p>
                                </div>
                                {user.telepon && (
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(user.telepon || '', 'modal_phone')}
                                        className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition"
                                    >
                                        {copiedField === 'modal_phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        <span>{copiedField === 'modal_phone' ? 'Disalin' : 'Salin'}</span>
                                    </button>
                                )}
                            </div>

                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400">Saldo Poin:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{member.poin} Poin ({member.tier})</span>
                            </div>
                        </div>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            💡 <em>Kasir dapat langsung mencari Nama, No. WhatsApp, atau ID Member Anda di sistem POS kasir.</em>
                        </p>

                        <button
                            type="button"
                            onClick={() => setCashierModalOpen(false)}
                            className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 text-white font-bold text-xs transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* ── MODAL TUNJUKKAN VOUCHER KE KASIR ── */}
            {activeVoucherModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade"
                    onClick={() => setActiveVoucherModal(null)}
                >
                    <div 
                        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-left">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <Ticket className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-zinc-950 dark:text-white">Voucher Promo Kasir</h4>
                                    <p className="text-[10px] text-zinc-400">{activeVoucherModal.nama}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveVoucherModal(null)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Large Scannable QR Voucher */}
                        <div className="p-4 rounded-2xl bg-white border border-zinc-200 dark:border-zinc-700 inline-block mx-auto shadow-inner">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeVoucherModal.kode)}`}
                                alt={`QR Voucher ${activeVoucherModal.kode}`}
                                className="w-40 h-40 object-contain mx-auto"
                            />
                        </div>

                        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 space-y-2">
                            <span className="text-[10px] text-zinc-400 uppercase font-mono block">Kode Voucher</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="font-mono font-extrabold text-xl text-zinc-950 dark:text-white tracking-widest">
                                    {activeVoucherModal.kode}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(activeVoucherModal.kode, 'active_voucher')}
                                    className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200"
                                >
                                    {copiedField === 'active_voucher' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {activeVoucherModal.tipe === 'persen' ? `Diskon ${activeVoucherModal.nilai}%` : `Potongan ${rupiah(activeVoucherModal.nilai)}`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveVoucherModal(null)}
                            className="w-full py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 text-white font-bold text-xs transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* ── FLOATING TOAST NOTIFICATION ── */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-2xl border border-zinc-800 dark:border-zinc-200 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ── FOOTER MEMBER ── */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                <p>© {new Date().getFullYear()} Jelang Hari Coffee &amp; Workspace. All rights reserved.</p>
            </footer>
        </div>
    );
}
