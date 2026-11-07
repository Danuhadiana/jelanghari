import React, { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    ShoppingBag,
    UtensilsCrossed,
    Layers,
    Receipt,
    FileSpreadsheet,
    Users,
    Settings,
    LogOut,
    X,
    Package,
    ChefHat,
    Truck,
    ShoppingCart,
    Tag,
    Ticket,
    CalendarCheck,
    CalendarRange,
    Tv,
    Search,
    Sparkles,
    ChevronRight,
    ExternalLink,
    Globe,
    User,
    Lock,
    Mail,
    Phone,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    Check,
    Sun,
    Moon,
    Bot,
    AlertTriangle,
    Command,
    Compass,
    BookOpen,
    HelpCircle
} from 'lucide-react';
import JelangAiModal from '@/Components/JelangAiModal';
import HelpCenterModal from '@/Components/HelpCenterModal';

interface PageProps {
    auth: {
        user: {
            id: number;
            name?: string;
            nama?: string;
            email: string;
            telepon?: string;
            role?: string | {
                nama?: string;
                slug?: string;
            };
            role_slug?: string;
        };
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    [key: string]: any;
}

export default function AppLayout({ children }: PropsWithChildren) {
    const { auth, flash } = usePage<PageProps>().props;
    const currentUrl = usePage().url;

    // Mega Profile Dropdown & Search Filter
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [menuSearch, setMenuSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const profileDropdownRef = useRef<HTMLDivElement>(null);

    // Settings Modal State (macOS Window)
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'preferences' | 'shortcuts'>('profile');
    const [lang, setLang] = useState<'id' | 'en'>('id');

    // Global Flash Toast Notification
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    // Dark Mode & AI Assistant
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') || localStorage.getItem('jh_theme');
            if (saved) return saved === 'dark';
            return document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    // Confirmation Popups State
    const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
    const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
    const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

    // Profile Edit Form State
    const [editName, setEditName] = useState(auth?.user?.name || auth?.user?.nama || '');
    const [editEmail, setEditEmail] = useState(auth?.user?.email || '');
    const [editTelepon, setEditTelepon] = useState(auth?.user?.telepon || '');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
    const [profileErrorMsg, setProfileErrorMsg] = useState('');

    // Password Edit Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
    const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

    // Notification listener for Flash messages
    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setToastType('success');
        } else if (flash?.error) {
            setToastMessage(flash.error);
            setToastType('error');
        } else if (flash?.warning) {
            setToastMessage(flash.warning);
            setToastType('warning');
        } else if (flash?.info) {
            setToastMessage(flash.info);
            setToastType('info');
        }
    }, [flash]);

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Click outside listener for Mega Dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dark mode class toggle on document & Multi-tab/System sync
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        const handleStorage = (e: StorageEvent) => {
            if ((e.key === 'jh_theme' || e.key === 'theme') && e.newValue) {
                setIsDarkMode(e.newValue === 'dark');
            }
        };

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleMediaChange = (e: MediaQueryListEvent) => {
            if (!localStorage.getItem('theme') && !localStorage.getItem('jh_theme')) {
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

    // Global Keyboard Shortcuts (Esc, Enter, Ctrl+K, Ctrl+J)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Escape key closes open modals / dropdown
            if (e.key === 'Escape') {
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
                if (settingsModalOpen) {
                    setSettingsModalOpen(false);
                    return;
                }
                if (helpModalOpen) {
                    setHelpModalOpen(false);
                    return;
                }
                if (aiModalOpen) {
                    setAiModalOpen(false);
                    return;
                }
                if (profileDropdownOpen) {
                    setProfileDropdownOpen(false);
                    return;
                }
            }

            // Enter key triggers confirmation action on active confirm modal
            if (e.key === 'Enter') {
                if (confirmLogoutOpen) {
                    e.preventDefault();
                    executeLogout();
                    return;
                }
                if (confirmProfileOpen) {
                    e.preventDefault();
                    executeSaveProfile();
                    return;
                }
                if (confirmPasswordOpen) {
                    e.preventDefault();
                    executeSavePassword();
                    return;
                }
            }

            // Ctrl/Cmd + K opens Menu Dropdown & focuses search
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setProfileDropdownOpen(prev => !prev);
                setTimeout(() => {
                    const searchInput = document.getElementById('jh-menu-search');
                    if (searchInput) searchInput.focus();
                }, 80);
            }

            // Ctrl/Cmd + J opens Jelang AI
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                setAiModalOpen(prev => !prev);
            }

            // Ctrl/Cmd + H opens Help & Glossary
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setHelpModalOpen(prev => !prev);
            }

            // Ctrl/Cmd + Shift + L toggles dark/light mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                toggleTheme();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [confirmLogoutOpen, confirmProfileOpen, confirmPasswordOpen, settingsModalOpen, aiModalOpen, helpModalOpen, profileDropdownOpen]);

    const toggleTheme = (target?: 'dark' | 'light') => {
        setIsDarkMode(prev => {
            const next = target ? target === 'dark' : !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('jh_theme', next ? 'dark' : 'light');
                localStorage.setItem('theme', next ? 'dark' : 'light');
                if (next) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
            return next;
        });
    };

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmProfileOpen(true);
    };

    const executeSaveProfile = () => {
        setConfirmProfileOpen(false);
        setSavingProfile(true);
        setProfileSuccessMsg('');
        setProfileErrorMsg('');

        router.patch('/profile', {
            name: editName,
            email: editEmail,
            telepon: editTelepon,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingProfile(false);
                setProfileSuccessMsg('Profil berhasil diperbarui!');
                setTimeout(() => setProfileSuccessMsg(''), 4000);
            },
            onError: (errs) => {
                setSavingProfile(false);
                const first = Object.values(errs)[0] as string;
                setProfileErrorMsg(first || 'Gagal menyimpan profil.');
            }
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== newPasswordConfirmation) {
            setPasswordErrorMsg('Konfirmasi kata sandi tidak cocok.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordErrorMsg('Kata sandi minimal 8 karakter.');
            return;
        }
        setPasswordErrorMsg('');
        setConfirmPasswordOpen(true);
    };

    const executeSavePassword = () => {
        setConfirmPasswordOpen(false);
        setSavingPassword(true);
        setPasswordSuccessMsg('');
        setPasswordErrorMsg('');

        router.put('/password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: newPasswordConfirmation,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSavingPassword(false);
                setPasswordSuccessMsg('Kata sandi berhasil diperbarui!');
                setCurrentPassword('');
                setNewPassword('');
                setNewPasswordConfirmation('');
                setTimeout(() => setPasswordSuccessMsg(''), 4000);
            },
            onError: (errs) => {
                setSavingPassword(false);
                const first = Object.values(errs)[0] as string;
                setPasswordErrorMsg(first || 'Gagal memperbarui kata sandi.');
            }
        });
    };

    const executeLogout = () => {
        setConfirmLogoutOpen(false);
        router.post('/logout');
    };

    const getRoleSlug = (): string => {
        const raw = auth?.user?.role_slug || auth?.user?.role;
        if (typeof raw === 'string' && raw.trim().length > 0) return raw.toLowerCase();
        if (raw && typeof raw === 'object') {
            const anyR = raw as any;
            return (anyR.slug || anyR.name || anyR.nama || '').toLowerCase();
        }
        return 'owner';
    };

    const userRole = getRoleSlug();
    const isOwnerOrManager = ['owner', 'manager'].includes(userRole);
    const brandHomeHref = isOwnerOrManager ? '/dashboard' : (userRole === 'kasir' ? '/kasir' : (['barista', 'kitchen', 'dapur'].includes(userRole) ? '/kds' : '/'));
    const displayName = auth?.user?.nama || auth?.user?.name || 'Owner Jelang Hari';
    const displayRole = typeof auth?.user?.role === 'string' 
        ? auth.user.role 
        : (auth?.user?.role?.nama || userRole || 'owner');

    // Resolusi Judul Halaman Breadcrumb Bersih (Bebas Kebocoran Query String)
    const getPageTitle = (rawUrl: string): string => {
        const path = (rawUrl || '').split('?')[0].split('#')[0];
        
        if (path === '/' || path === '') return 'Home & Katalog';
        if (path === '/dashboard') return 'Dashboard Analisis';
        if (path === '/kasir') return 'Kasir POS';
        if (path === '/kds') return 'Kitchen & Barista Display (KDS)';
        if (path === '/shift') return 'Shift Kasir';
        if (path.startsWith('/transaksi')) return 'Riwayat Transaksi';
        if (path.startsWith('/produk')) return 'Katalog Menu Produk';
        if (path.startsWith('/kategori')) return 'Kategori Menu';
        if (path === '/stok/bahan-baku') return 'Stok Bahan Baku';
        if (path === '/stok/resep') return 'Resep Menu (BOM)';
        if (path === '/stok/supplier') return 'Supplier Bahan';
        if (path === '/stok/pembelian') return 'Kulakan / Faktur Pembelian';
        if (path === '/customer') return 'Pelanggan & CRM';
        if (path === '/user/dashboard') return 'Portal Member';
        if (path.startsWith('/voucher')) return 'Voucher & Kupon Promo';
        if (path.startsWith('/promo')) return 'Promo Jam Aktif';
        if (path === '/laporan/harian') return 'Laporan Penjualan';
        if (path === '/laporan/produk') return 'Laporan Performa Menu';
        if (path === '/absensi/admin') return 'Rekap Absensi Admin';
        if (path.startsWith('/absensi')) return 'Presensi Karyawan';
        if (path.startsWith('/reservasi')) return 'Manajemen Reservasi Meja';
        if (path.startsWith('/user')) return 'Kelola Akun & Pengguna';
        if (path.startsWith('/pengaturan')) return 'Pengaturan Sistem';
        if (path.startsWith('/profile')) return 'Profil Akun';
        
        const cleanSegment = path.replace(/^\/+|\/+$/g, '').split('/').pop() || 'Dashboard';
        return cleanSegment.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const navGroups = [
        {
            title: 'POS & KASIR',
            items: [
                { label: 'Kasir POS', href: '/kasir', icon: ShoppingBag, desc: 'Pencatatan pesanan & pembayaran kasir', targetRole: ['owner', 'manager', 'kasir'] },
                { label: 'Kitchen KDS', href: '/kds', icon: Tv, desc: 'Tampilan antrean dapur & barista', targetRole: ['owner', 'manager', 'dapur', 'barista', 'kitchen'] },
                { label: 'Shift Kasir', href: '/shift', icon: CalendarCheck, desc: 'Buka & tutup sesi shift kasir', targetRole: ['owner', 'manager', 'kasir'] },
            ]
        },
        {
            title: 'OPERASIONAL & MENU',
            items: [
                { label: 'Dashboard Analisis', href: '/dashboard', icon: LayoutDashboard, desc: 'Ringkasan omzet, pesanan & grafik', targetRole: ['owner', 'manager'] },
                { label: 'Reservasi Meja', href: '/reservasi', icon: CalendarRange, badge: 'Booking Meja', desc: 'Booking meja, DP & status kedatangan tamu', targetRole: ['owner', 'manager'] },
                { label: 'Riwayat Transaksi', href: '/transaksi', icon: Receipt, desc: 'Daftar struk & status pembayaran', targetRole: ['owner', 'manager', 'kasir'] },
                { label: 'Katalog Menu Produk', href: '/produk', icon: UtensilsCrossed, desc: 'Kelola harga, foto, & ketersediaan', targetRole: ['owner', 'manager'] },
                { label: 'Kategori Menu', href: '/kategori', icon: Layers, desc: 'Pengelompokan jenis makanan & minuman', targetRole: ['owner', 'manager'] },
            ]
        },
        {
            title: 'INVENTORI & RESEP',
            items: [
                { label: 'Stok Bahan Baku', href: '/stok/bahan-baku', icon: Package, desc: 'Pantau sisa stok dan limit minimum', targetRole: ['owner', 'manager'] },
                { label: 'Resep Menu (BOM)', href: '/stok/resep', icon: ChefHat, desc: 'Formula bahan otomatis per porsi', targetRole: ['owner', 'manager'] },
                { label: 'Supplier Bahan', href: '/stok/supplier', icon: Truck, desc: 'Kontak pemasok & vendor kafe', targetRole: ['owner', 'manager'] },
                { label: 'Kulakan / Faktur', href: '/stok/pembelian', icon: ShoppingCart, desc: 'Pencatatan nota pembelian bahan', targetRole: ['owner', 'manager'] },
            ]
        },
        {
            title: 'CRM & SISTEM POIN',
            items: [
                { label: 'Pelanggan & CRM', href: '/customer', icon: Users, badge: 'Sistem Poin', desc: 'Database tamu & akumulasi poin loyalitas', targetRole: ['owner', 'manager'] },
                { label: 'Portal Member User', href: '/user/dashboard', icon: LayoutDashboard, badge: 'Poin Member', desc: 'Tampilan dashboard member & cek saldo poin', targetRole: ['owner', 'manager', 'pelanggan'] },
                { label: 'Voucher & Kupon', href: '/voucher', icon: Ticket, desc: 'Program diskon & penukaran kupon loyalitas', targetRole: ['owner', 'manager'] },
                { label: 'Promo Jam Aktif', href: '/promo', icon: Tag, desc: 'Diskon otomatis berdasarkan jam atau hari', targetRole: ['owner', 'manager'] },
            ]
        },
        {
            title: 'LAPORAN & SISTEM',
            items: [
                { label: 'Laporan Penjualan', href: '/laporan/harian', icon: FileSpreadsheet, desc: 'Rekapitulasi keuangan harian & ekspor', targetRole: ['owner', 'manager'] },
                { label: 'Laporan Performa Menu', href: '/laporan/produk', icon: UtensilsCrossed, desc: 'Analisis menu terlaris & margin laba', targetRole: ['owner', 'manager'] },
                { label: 'Presensi Karyawan', href: '/absensi', icon: CalendarCheck, desc: 'Self-service clock-in & clock-out', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur', 'staff', 'waiter'] },
                { label: 'Kelola Rekap Absensi', href: '/absensi/admin', icon: CalendarCheck, desc: 'Approval izin & laporan jam kerja', targetRole: ['owner', 'manager'] },
                { label: 'Kelola Pengguna', href: '/user', icon: Users, desc: 'Manajemen akun kasir, barista & hak akses', targetRole: ['owner'] },
                { label: 'Pengaturan Sistem', href: '/pengaturan', icon: Settings, desc: 'Profil kafe, pajak, service charge, meja', targetRole: ['owner'] },
                { label: 'Buku Panduan & Glosarium', href: '#panduan', icon: BookOpen, badge: 'Buku Panduan', desc: 'Tutorial lengkap aplikasi & kamus istilah finansial kafe', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur', 'staff', 'waiter'] },
            ]
        }
    ];

    // Filter items according to user role, selected category & search
    const filteredGroups = navGroups.map(group => {
        if (selectedCategory !== 'all' && group.title !== selectedCategory) {
            return null;
        }

        const allowed = group.items.filter(item => {
            if (userRole === 'owner') return true;
            return item.targetRole.includes(userRole);
        });

        const searched = menuSearch.trim() === ''
            ? allowed
            : allowed.filter(item => 
                item.label.toLowerCase().includes(menuSearch.toLowerCase()) || 
                item.desc.toLowerCase().includes(menuSearch.toLowerCase())
            );

        return { ...group, items: searched };
    }).filter((group): group is { title: string; items: typeof navGroups[0]['items'] } => group !== null && group.items.length > 0);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-zinc-950 text-white' : 'bg-[#FAFAF9] text-zinc-950'} selection:bg-zinc-950 selection:text-white font-sans antialiased transition-colors duration-200 flex flex-col w-full max-w-full overflow-x-hidden`}>
            
            {/* ── TOP NAVBAR UTAMA (Tanpa Sidebar Kiri) ── */}
            <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
                <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
                    
                    {/* Brand Logo & Breadcrumb Info */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Link href={brandHomeHref} className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink-0">
                            <img
                                src="/images/logo.png"
                                alt="Jelang Hari"
                                className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-full bg-white p-0.5 border border-zinc-200 dark:border-zinc-700 shadow-sm transition group-hover:scale-105 shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-sans font-bold text-sm sm:text-base leading-tight text-zinc-950 dark:text-white tracking-tight truncate">
                                    Jelang Hari
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold truncate hidden min-[380px]:block">
                                    Coffee &amp; Workspace POS
                                </span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
                            <span className="font-medium text-zinc-900 dark:text-zinc-200 truncate">
                                {getPageTitle(currentUrl)}
                            </span>
                        </div>
                    </div>

                    {/* Sisi Kanan: Quick Theme Toggle, Panduan, Jelang AI & Mega Profile Button */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {/* Tombol Pengaturan & Preferensi Tema Sistem */}
                        <button
                            type="button"
                            onClick={() => {
                                setSettingsTab('preferences');
                                setSettingsModalOpen(true);
                            }}
                            className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all shadow-xs active:scale-95 shrink-0"
                            title="Pengaturan Sistem & Tema (Dark / Light Mode)"
                            aria-label="Pengaturan Sistem"
                        >
                            <Settings className="w-3.5 h-3.5" />
                        </button>

                        {/* Akses Cepat Buku Panduan & Kamus Istilah (Ctrl+H) */}
                        <button
                            type="button"
                            onClick={() => setHelpModalOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all shadow-xs active:scale-95 text-xs font-semibold shrink-0"
                            title="Buka Buku Panduan & Kamus Istilah Kafe (Ctrl+H)"
                            aria-label="Buku Panduan & Glosarium"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="hidden md:inline">Buku Panduan</span>
                        </button>

                        {/* Direct Top Navbar Jelang Hari Copilot Button (Ctrl+J) */}
                        <button
                            type="button"
                            onClick={() => setAiModalOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-950 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white dark:text-zinc-100 border border-zinc-800 dark:border-zinc-700 transition-all shadow-xs active:scale-95 text-xs font-bold shrink-0"
                            title="Jelang Hari Copilot (Ctrl+J)"
                            aria-label="Buka Jelang Hari Copilot"
                        >
                            <Bot className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden md:inline">Jelang AI</span>
                            <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 dark:bg-zinc-700 font-mono">⌘J</kbd>
                        </button>

                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setProfileDropdownOpen(v => !v)}
                                className="flex items-center gap-2.5 p-1.5 pl-2.5 pr-3 rounded-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800 transition-all shadow-sm active:scale-95 text-xs"
                                title="Menu Navigasi & Profil Pengguna"
                            >
                                <div className="w-7 h-7 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs shadow-xs">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left hidden sm:block max-w-[120px]">
                                    <span className="font-bold text-zinc-900 dark:text-white block leading-tight truncate">
                                        {displayName}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium truncate block">
                                        {displayRole}
                                    </span>
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* ── PROFILE & NAV MENU DROPDOWN (Minimalist & Efficient) ── */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-[360px] sm:w-[430px] max-w-[94vw] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-xl p-3 space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    
                                    {/* 1. Header Profil Pengguna & Fast Actions */}
                                    <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate">{displayName}</p>
                                                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] uppercase font-semibold tracking-wider bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300">
                                                        {displayRole}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate leading-tight mt-0.5">{auth?.user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            <Link
                                                href="/"
                                                target="_blank"
                                                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition"
                                                title="Buka Web Menu"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProfileDropdownOpen(false);
                                                    setSettingsModalOpen(true);
                                                }}
                                                className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition"
                                                title="Pengaturan"
                                            >
                                                <Settings className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* 2. Quick Action Bar: Akses Cepat Sistem Poin, Buku Panduan & Toggle Tema */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {/* Shortcut ke Sistem Poin & CRM Pelanggan */}
                                        <Link
                                            href="/customer"
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/80 text-xs transition group"
                                            title="Akses cepat Database Tamu & Sistem Poin"
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Sparkles className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 flex-shrink-0" />
                                                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Poin</span>
                                            </div>
                                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                                                CRM
                                            </span>
                                        </Link>

                                        {/* Shortcut ke Buku Panduan & Kamus Istilah */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setHelpModalOpen(true);
                                            }}
                                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/80 text-xs transition group text-left"
                                            title="Buka Buku Panduan & Glosarium (Ctrl+H)"
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Panduan</span>
                                            </div>
                                            <kbd className="text-[9px] px-1 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-500 dark:text-zinc-400 font-mono">⌘H</kbd>
                                        </button>

                                        {/* Shortcut Pengaturan Tema & Preferensi */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setSettingsTab('preferences');
                                                setSettingsModalOpen(true);
                                            }}
                                            className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/80 text-xs transition group text-left"
                                            title="Buka Pengaturan Tema & Bahasa"
                                        >
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <Settings className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 flex-shrink-0" />
                                                <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Settings</span>
                                            </div>
                                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-300">
                                                Tema
                                            </span>
                                        </button>
                                    </div>

                                {/* 3. Search Bar Live Filter Menu */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                    <input
                                        id="jh-menu-search"
                                        type="text"
                                        value={menuSearch}
                                        onChange={e => setMenuSearch(e.target.value)}
                                        placeholder="Cari fitur: kasir, kds, stok, poin, voucher..."
                                        className="w-full pl-8 pr-12 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                                    />
                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        {menuSearch ? (
                                            <button
                                                onClick={() => setMenuSearch('')}
                                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs p-0.5"
                                            >
                                                ✕
                                            </button>
                                        ) : (
                                            <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.5 bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-500 dark:text-zinc-400 rounded font-mono">⌘K</kbd>
                                        )}
                                    </div>
                                </div>

                                {/* 4. Daftar Fitur / Menu (Minimalist, Efisien, Scannable) */}
                                <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                                    {filteredGroups.length === 0 ? (
                                        <div className="py-6 text-center text-zinc-400 text-xs">
                                            Tidak ada menu yang cocok dengan "{menuSearch}".
                                        </div>
                                    ) : (
                                        filteredGroups.map((group, gIdx) => (
                                            <div key={gIdx} className="space-y-1">
                                                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 block">
                                                    {group.title}
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                                    {group.items.map((item) => {
                                                        const cleanUrl = currentUrl.split('?')[0];
                                                        const isExact = cleanUrl === item.href;
                                                        const isPrefix = item.href !== '/' && item.href !== '/dashboard' && cleanUrl.startsWith(item.href + '/');
                                                        const isSuppressed = (item.href === '/absensi' && cleanUrl.startsWith('/absensi/admin'));
                                                        const isActive = (isExact || isPrefix) && !isSuppressed;
                                                        const Icon = item.icon;

                                                        if (item.href === '#panduan') {
                                                            return (
                                                                <button
                                                                    key={item.href}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setProfileDropdownOpen(false);
                                                                        setHelpModalOpen(true);
                                                                    }}
                                                                    className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 text-left w-full"
                                                                    title={item.desc}
                                                                >
                                                                    <div className="flex items-center gap-2 min-w-0">
                                                                        <Icon className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                                                                        <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                                                    </div>
                                                                    <span className="text-[8px] px-1 py-0.2 rounded font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex-shrink-0">
                                                                        Buku
                                                                    </span>
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                onClick={() => setProfileDropdownOpen(false)}
                                                                className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 ${
                                                                    isActive
                                                                        ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white dark:border dark:border-zinc-700 font-semibold shadow-xs'
                                                                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300'
                                                                }`}
                                                                title={item.desc}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                                                                        isActive
                                                                            ? 'text-white'
                                                                            : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                                                                    }`} />
                                                                    <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                                                </div>
                                                                {(item as any).badge && (
                                                                    <span className={`text-[8px] px-1 py-0.2 rounded font-medium tracking-tight flex-shrink-0 ${
                                                                        isActive
                                                                            ? 'bg-white/20 text-white'
                                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60'
                                                                    }`}>
                                                                        {(item as any).badge}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* 6. Footer: Shortcuts & Keluar */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                                    <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                                        <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[9px] border border-zinc-200/80 dark:border-zinc-700">ESC</kbd>
                                        <span>tutup</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setProfileDropdownOpen(false);
                                            setConfirmLogoutOpen(true);
                                        }}
                                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition"
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

            {/* ── GLOBAL TOAST NOTIFICATION ── */}
            {toastMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-bounce-short">
                    <div className={`p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs font-medium ${
                        toastType === 'success'
                            ? 'bg-zinc-950 text-white border-zinc-800'
                            : toastType === 'error'
                            ? 'bg-rose-950 text-rose-100 border-rose-800'
                            : toastType === 'warning'
                            ? 'bg-amber-950 text-amber-100 border-amber-800'
                            : 'bg-zinc-900 text-zinc-100 border-zinc-700'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            {toastType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                            {toastType === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                            {toastType === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                            {toastType === 'info' && <Bot className="w-4 h-4 text-[#8B7355] flex-shrink-0" />}
                            <span className="font-semibold text-xs leading-tight">{toastMessage}</span>
                        </div>
                        <button
                            onClick={() => setToastMessage(null)}
                            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── KONTEN UTAMA HALAMAN (Full Width Layout) ── */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
                {children}
            </main>

            {/* ── GLOBAL JELANG AI MODAL ── */}
            <JelangAiModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

            {/* ── GLOBAL HELP CENTER & GLOSARIUM MODAL ── */}
            <HelpCenterModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />

            {/* ── DETAILED SETTINGS MODAL (macOS Window Styled) ── */}
            {settingsModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade"
                    onClick={() => setSettingsModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* macOS Window Titlebar */}
                        <div className="h-12 px-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60 select-none shrink-0">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSettingsModalOpen(false)}
                                    className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]"
                                    title="Tutup"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSettingsModalOpen(false)}
                                    className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]"
                                />
                                <button
                                    type="button"
                                    className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                <Settings className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Pengaturan Akun &bull; Jelang Hari</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSettingsModalOpen(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Segmented Tabs */}
                        <div className="p-3 bg-zinc-50/50 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-1">
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('profile')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition ${
                                        settingsTab === 'profile'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                                    }`}
                                >
                                    Profil Staff
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('preferences')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition ${
                                        settingsTab === 'preferences'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                                    }`}
                                >
                                    Sistem &amp; Bahasa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('security')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition ${
                                        settingsTab === 'security'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                                    }`}
                                >
                                    Keamanan Sandi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSettingsTab('shortcuts')}
                                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-xl transition ${
                                        settingsTab === 'shortcuts'
                                            ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                                    }`}
                                >
                                    Tombol Pintas Key
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 overflow-y-auto space-y-4 text-xs">
                            {settingsTab === 'profile' && (
                                <div className="space-y-4">
                                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-sm">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-950 dark:text-white text-xs">{displayName}</p>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{auth?.user?.email}</p>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold">
                                            {displayRole}
                                        </span>
                                    </div>

                                    {profileSuccessMsg && (
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{profileSuccessMsg}</span>
                                        </div>
                                    )}

                                    {profileErrorMsg && (
                                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                            <span>{profileErrorMsg}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleUpdateProfile} className="space-y-3.5">
                                        <div>
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={e => setEditName(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                            />
                                        </div>

                                        <div>
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Alamat Email</label>
                                            <input
                                                type="email"
                                                value={editEmail}
                                                onChange={e => setEditEmail(e.target.value)}
                                                required
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                            />
                                        </div>

                                        <div>
                                            <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">No. WhatsApp / Telepon</label>
                                            <input
                                                type="tel"
                                                value={editTelepon}
                                                onChange={e => setEditTelepon(e.target.value)}
                                                placeholder="08123456789"
                                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={savingProfile}
                                                className="w-full py-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                                            >
                                                {savingProfile ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Menyimpan...</span>
                                                    </>
                                                ) : (
                                                    <span>Simpan Perubahan Profil</span>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {settingsTab === 'preferences' && (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-950 dark:text-white block">Mode Tampilan Antarmuka</span>
                                                <span className="text-[11px] text-zinc-500">Pilih tema visual sistem POS (Dark / Light)</span>
                                            </div>
                                            <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-700 p-0.5 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => isDarkMode && toggleTheme()}
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${!isDarkMode ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 dark:text-zinc-300'}`}
                                                >
                                                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                                                    <span>Terang</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => !isDarkMode && toggleTheme()}
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${isDarkMode ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'}`}
                                                >
                                                    <Moon className="w-3.5 h-3.5 text-zinc-300" />
                                                    <span>Gelap</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-950 dark:text-white block">Bahasa Antarmuka</span>
                                                <span className="text-[11px] text-zinc-500">Pilih bahasa aplikasi Jelang Hari</span>
                                            </div>
                                            <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-700 p-0.5 rounded-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => setLang('id')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${lang === 'id' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'}`}
                                                >
                                                    Indonesia
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setLang('en')}
                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${lang === 'en' ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'}`}
                                                >
                                                    English
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-2">
                                        <span className="font-bold text-zinc-950 dark:text-white block">Informasi POS &amp; Server</span>
                                        <div className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                                            <p>Platform: Laravel 11 + Inertia + React</p>
                                            <p>Status: Lokal Laragon (Port 8000)</p>
                                            <p>Zona Waktu: Asia/Jakarta (WIB)</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {settingsTab === 'security' && (
                                <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                                    {passwordSuccessMsg && (
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>{passwordSuccessMsg}</span>
                                        </div>
                                    )}

                                    {passwordErrorMsg && (
                                        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                            <span>{passwordErrorMsg}</span>
                                        </div>
                                    )}

                                    <div>
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Kata Sandi Saat Ini</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={e => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Konfirmasi Kata Sandi Baru</label>
                                        <input
                                            type="password"
                                            value={newPasswordConfirmation}
                                            onChange={e => setNewPasswordConfirmation(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-zinc-950"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={savingPassword}
                                            className="w-full py-2.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 text-white dark:text-zinc-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                                        >
                                            {savingPassword ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Memperbarui...</span>
                                                </>
                                            ) : (
                                                <span>Perbarui Kata Sandi</span>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {settingsTab === 'shortcuts' && (
                                <div className="space-y-3">
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Gunakan tombol pintasan keyboard pada komputer/laptop untuk mempercepat operasional kasir dan manajemen:
                                    </p>

                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-800/40">
                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-900 dark:text-white block">Tutup Dialog / Modal / Dropdown</span>
                                                <span className="text-[10px] text-zinc-500">Membatalkan pop-up konfirmasi atau menutup jendela</span>
                                            </div>
                                            <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shadow-xs">
                                                ESC
                                            </kbd>
                                        </div>

                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-900 dark:text-white block">Konfirmasi / Setujui Pop-up</span>
                                                <span className="text-[10px] text-zinc-500">Menjalankan tombol aksi utama saat modal aktif</span>
                                            </div>
                                            <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shadow-xs">
                                                ↵ Enter
                                            </kbd>
                                        </div>

                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-900 dark:text-white block">Buka Menu Sistem &amp; Cari Fitur</span>
                                                <span className="text-[10px] text-zinc-500">Membuka menu dropdown dan fokus ke kolom pencarian</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shadow-xs">
                                                    Ctrl + K
                                                </kbd>
                                            </div>
                                        </div>

                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-900 dark:text-white block">Buka Jelang Hari Copilot</span>
                                                <span className="text-[10px] text-zinc-500">Konsultasi resep, kalkulasi, dan SOP kafe</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shadow-xs">
                                                    Ctrl + J
                                                </kbd>
                                            </div>
                                        </div>

                                        <div className="p-3 flex items-center justify-between">
                                            <div>
                                                <span className="font-bold text-zinc-900 dark:text-white block">Ganti Mode Gelap / Terang</span>
                                                <span className="text-[10px] text-zinc-500">Beralih antara tema Dark Mode &amp; Light Mode</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 shadow-xs">
                                                    Ctrl + Shift + L
                                                </kbd>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI LOGOUT ── */}
            {confirmLogoutOpen && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade"
                    onClick={() => setConfirmLogoutOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-rose-950/40 text-red-600 flex items-center justify-center">
                            <LogOut className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">Keluar dari Sesi?</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Apakah Anda yakin ingin mengakhiri sesi kasir/admin Jelang Hari saat ini?
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmLogoutOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-200 transition flex items-center justify-center gap-1.5"
                            >
                                <span>Batal</span>
                                <kbd className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-1 py-0.2 rounded font-mono">ESC</kbd>
                            </button>
                            <button
                                type="button"
                                onClick={executeLogout}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-red-600/20"
                            >
                                <span>Ya, Keluar</span>
                                <kbd className="text-[9px] bg-red-700 px-1 py-0.2 rounded font-mono">↵ Enter</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI SIMPAN PROFIL ── */}
            {confirmProfileOpen && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade"
                    onClick={() => setConfirmProfileOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">Simpan Perubahan Profil?</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Data akun akan diperbarui untuk seluruh sistem Jelang Hari.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmProfileOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5"
                            >
                                <span>Batal</span>
                                <kbd className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-1 py-0.2 rounded font-mono">ESC</kbd>
                            </button>
                            <button
                                type="button"
                                onClick={executeSaveProfile}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                                <span>Ya, Simpan</span>
                                <kbd className="text-[9px] bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900 px-1 py-0.2 rounded font-mono">↵ Enter</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL KONFIRMASI GANTI PASSWORD ── */}
            {confirmPasswordOpen && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade"
                    onClick={() => setConfirmPasswordOpen(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-zinc-950 dark:text-white">Ganti Kata Sandi Akun?</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Pastikan Anda mengingat kata sandi baru untuk login sesi berikutnya.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmPasswordOpen(false)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center gap-1.5"
                            >
                                <span>Batal</span>
                                <kbd className="text-[9px] bg-zinc-200 dark:bg-zinc-700 px-1 py-0.2 rounded font-mono">ESC</kbd>
                            </button>
                            <button
                                type="button"
                                onClick={executeSavePassword}
                                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                                <span>Ya, Perbarui</span>
                                <kbd className="text-[9px] bg-amber-700 text-white px-1 py-0.2 rounded font-mono">↵ Enter</kbd>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
