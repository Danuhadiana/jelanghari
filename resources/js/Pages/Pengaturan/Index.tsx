import React, { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Store,
    Printer,
    Percent,
    Save,
    Loader2,
    Clock,
    Bot,
    CalendarRange,
    QrCode,
    Plus,
    Trash2,
    X,
    ExternalLink,
    CheckCircle2,
    Sliders,
    Layers,
    Users,
    Sparkles,
    Eye,
    Coffee,
    Banknote,
    CreditCard,
    Wallet,
    Edit2,
    AlertTriangle,
    Tag,
    Hash,
    Wifi,
    Phone,
    Mail,
    MapPin,
    Instagram,
    Globe,
    Check,
    RotateCcw,
    Building2,
    Smartphone,
    Ticket,
    Flame,
    ShieldCheck,
    Calendar,
    Upload,
    Image as ImageIcon,
    FileText
} from 'lucide-react';
import TableQrCustomizerModal, { MejaItem } from '@/Components/TableQrCustomizerModal';

export interface BannerItem {
    id: string;
    badge: string;
    title: string;
    tanggal_waktu: string;
    desc: string;
    konten_lengkap: string;
    image: string;
    action_text: string;
    action_type: 'reservasi' | 'menu' | 'link' | 'detail';
    action_url?: string;
    is_aktif: boolean;
}

export interface MetodePembayaranCustom {
    id: string;
    nama: string;
    tipe: 'cash' | 'non_cash';
    keterangan: string;
    is_aktif: boolean;
}

interface Props {
    settings: Record<string, string>;
    mejas?: MejaItem[];
}

type SettingsTab = 'identity' | 'operasional' | 'meja' | 'payment' | 'hardware' | 'banner';

export default function Index({ settings = {}, mejas = [] }: Props) {
    // Tab Navigasi Ergonomis Jempol
    const [activeTab, setActiveTab] = useState<SettingsTab>('identity');

    // Customizer Modal State
    const [selectedMejaForQr, setSelectedMejaForQr] = useState<MejaItem | null>(null);
    const [isQrCustomizerOpen, setIsQrCustomizerOpen] = useState(false);

    // Filter Meja by Area
    const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');

    // Category / Area List State (Dapat Ditambah, Diedit, dan Dihapus)
    const initialCategories = useMemo(() => {
        const fromTables = mejas.map(m => m.area).filter(Boolean);
        const defaults = ['Indoor', 'Outdoor', 'Workspace', 'VIP'];
        return Array.from(new Set([...defaults, ...fromTables]));
    }, [mejas]);

    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [newCatInput, setNewCatInput] = useState('');
    const [isAddCatOpen, setIsAddCatOpen] = useState(false);
    const [editingCatTarget, setEditingCatTarget] = useState<{ oldName: string; newName: string } | null>(null);

    // Form Tambah / Edit Meja
    const [isAddMejaOpen, setIsAddMejaOpen] = useState(false);
    const [editingMejaId, setEditingMejaId] = useState<number | null>(null);
    const [deleteMejaTarget, setDeleteMejaTarget] = useState<{ id: number; nomor: string } | null>(null);
    const [mejaForm, setMejaForm] = useState({
        nomor: '',
        nama: '',
        area: 'Indoor',
        kapasitas: 4,
    });
    const [mejaProcessing, setMejaProcessing] = useState(false);

    // ==========================================
    // METODE PEMBAYARAN KASIR (OPSI B - KUSTOM)
    // ==========================================
    const defaultStandardMetodeList: MetodePembayaranCustom[] = useMemo(() => [
        {
            id: 'cash',
            nama: 'Tunai (Cash)',
            tipe: 'cash',
            keterangan: 'Uang fisik rupiah dengan input nominal diterima & hitung kembalian',
            is_aktif: true,
        },
        {
            id: 'qris',
            nama: 'QRIS',
            tipe: 'non_cash',
            keterangan: settings.kasir_qris_nama || 'QRIS Jelang Hari (All E-Wallet / Bank)',
            is_aktif: true,
        },
        {
            id: 'debit',
            nama: 'Mesin EDC / Debit Card',
            tipe: 'non_cash',
            keterangan: settings.kasir_debit_nama || 'EDC Mandiri / BCA',
            is_aktif: true,
        },
        {
            id: 'transfer',
            nama: 'Transfer Bank',
            tipe: 'non_cash',
            keterangan: settings.kasir_transfer_bank || 'BCA 1234567890 a.n Jelang Hari',
            is_aktif: true,
        },
    ], [settings]);

    const initialMetodeList: MetodePembayaranCustom[] = useMemo(() => {
        if (settings.kasir_metode_pembayaran_custom) {
            try {
                const parsed = JSON.parse(settings.kasir_metode_pembayaran_custom);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch (e) {
                console.error('Error parsing kasir_metode_pembayaran_custom', e);
            }
        }
        return [
            {
                id: 'cash',
                nama: 'Tunai (Cash)',
                tipe: 'cash',
                keterangan: 'Uang fisik rupiah dengan input nominal diterima & hitung kembalian',
                is_aktif: settings.kasir_metode_cash !== '0',
            },
            {
                id: 'qris',
                nama: 'QRIS',
                tipe: 'non_cash',
                keterangan: settings.kasir_qris_nama || 'QRIS Jelang Hari (All E-Wallet / Bank)',
                is_aktif: settings.kasir_metode_qris !== '0',
            },
            {
                id: 'debit',
                nama: 'Mesin EDC / Debit Card',
                tipe: 'non_cash',
                keterangan: settings.kasir_debit_nama || 'EDC Mandiri / BCA',
                is_aktif: settings.kasir_metode_debit !== '0',
            },
            {
                id: 'transfer',
                nama: 'Transfer Bank',
                tipe: 'non_cash',
                keterangan: settings.kasir_transfer_bank || 'BCA 1234567890 a.n Jelang Hari',
                is_aktif: settings.kasir_metode_transfer !== '0',
            },
        ];
    }, [settings]);

    const [metodeList, setMetodeList] = useState<MetodePembayaranCustom[]>(initialMetodeList);
    const [isAddMetodeModalOpen, setIsAddMetodeModalOpen] = useState(false);
    const [newMetodeForm, setNewMetodeForm] = useState<{ nama: string; tipe: 'cash' | 'non_cash'; keterangan: string; is_aktif: boolean }>({
        nama: '',
        tipe: 'non_cash',
        keterangan: '',
        is_aktif: true,
    });
    const [editingMetode, setEditingMetode] = useState<MetodePembayaranCustom | null>(null);
    const [deleteMetodeTarget, setDeleteMetodeTarget] = useState<MetodePembayaranCustom | null>(null);
    const [isResetMetodeModalOpen, setIsResetMetodeModalOpen] = useState(false);
    const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{ name: string; tableCount: number } | null>(null);

    // ==========================================
    // DYNAMIC BANNER & PROMOSI SYSTEM
    // ==========================================
    const defaultBanners: BannerItem[] = useMemo(() => [
        {
            id: 'banner_nobar',
            badge: '🔴 EVENT NOBAR AKBAR',
            title: 'Nobar Akbar Persib vs Persija di Jelang Hari',
            tanggal_waktu: 'Minggu, 18 Okt 2026 • 19:30 WIB',
            desc: 'Layar lebar projector HD jernih, audio menggelegar, dan paket hemat cemilan nobar bareng kawan!',
            konten_lengkap: 'Saksikan duel bergengsi El Clasico Indonesia antara Persib Bandung vs Persija Jakarta di Jelang Hari Coffee & Workspace. Nikmati suasana nobar seru dengan fasilitas layar proyektor lebar 150 inci beresolusi HD, sound system menggelegar, ruangan ber-AC nyaman, serta paket hemat cemilan dan kopi khas Jelang Hari. Tempat duduk terbatas, disarankan melakukan reservasi meja lebih awal bersama teman-teman komunitasmu!',
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
            action_text: 'Reservasi Meja Nobar',
            action_type: 'reservasi',
            action_url: '',
            is_aktif: true,
        },
        {
            id: 'banner_homemade',
            badge: '✨ FRESH DARI DAPUR',
            title: 'Homemade Kitchen Pastry & Cookies Hangat Setiap Hari',
            tanggal_waktu: 'Fresh Setiap Hari • Pukul 08:00 WIB',
            desc: 'Dibuat fresh dari bahan baku premium pilihan tanpa bahan pengawet. Teman terbaik secangkir kopi!',
            konten_lengkap: 'Dapur Jelang Hari memproduksi sajian pastry, roti bakar autentik, croissant lembut, dan cookies buatan tangan setiap pagi. Diracik khusus oleh baker internal kami dengan mentega kualitas premium tanpa bahan pengawet sintetik. Sangat cocok dinikmati sembari produktif bekerja di ruang workspace kami ataupun santai sore bersama teman.',
            image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
            action_text: 'Lihat Menu Homemade',
            action_type: 'menu',
            action_url: '',
            is_aktif: true,
        },
        {
            id: 'banner_story',
            badge: '📸 KOMUNITAS & STORY',
            title: 'Bagikan Momen Santaimu & Tag @Jelanghari_newchapter',
            tanggal_waktu: 'Edisi Minggu Ini • Tag & Menangkan',
            desc: 'Tag story kami di Instagram untuk kesempatan memenangkan voucher ngopi mingguan & di-repost ke feed Jelang Hari.',
            konten_lengkap: 'Setiap pekan, Jelang Hari mengapresiasi foto dan cerita terbaik dari pengunjung setia kami! Cukup abadikan momen ngopi, kerja, atau diskusi santaimu di Jelang Hari Coffee & Workspace, upload ke Instagram Story atau Reels, lalu tag akun resmi kami @Jelanghari_newchapter. Setiap hari Senin, tim kami akan memilih 3 cerita paling inspiratif untuk mendapatkan Voucher Ngopi Gratis!',
            image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
            action_text: 'Kunjungi Instagram',
            action_type: 'link',
            action_url: 'https://instagram.com/Jelanghari_newchapter',
            is_aktif: true,
        },
    ], []);

    const initialBanners: BannerItem[] = useMemo(() => {
        if (settings.homepage_banners) {
            try {
                const parsed = JSON.parse(settings.homepage_banners);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error('Error parsing homepage_banners', e);
            }
        }
        return defaultBanners;
    }, [settings.homepage_banners, defaultBanners]);

    const [bannerList, setBannerList] = useState<BannerItem[]>(initialBanners);
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
    const [deleteBannerTarget, setDeleteBannerTarget] = useState<BannerItem | null>(null);

    const [bannerForm, setBannerForm] = useState<BannerItem>({
        id: '',
        badge: '🔴 EVENT NOBAR AKBAR',
        title: '',
        tanggal_waktu: 'Minggu, 18 Okt 2026 • 19:30 WIB',
        desc: '',
        konten_lengkap: '',
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
        action_text: 'Reservasi Meja',
        action_type: 'reservasi',
        action_url: '',
        is_aktif: true,
    });

    // Form Pengaturan Lengkap
    const { data, setData, post, processing } = useForm({
        // 1. Identitas Kafe & Informasi Resmi
        nama_cafe: settings.nama_cafe || 'Jelang Hari',
        tagline: settings.tagline || 'Coffee & Workspace',
        alamat: settings.alamat || 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181',
        telepon: settings.telepon || '0821-1594-1156',
        email: settings.email || 'jelangharikopi@gmail.com',
        maps_url: settings.maps_url || 'https://maps.google.com/?q=Jl.+AH+Nasution+No+293,+Mangkubumi,+Tasikmalaya',
        instagram: settings.instagram || '@Jelanghari_newchapter',
        instagram_url: settings.instagram_url || 'https://instagram.com/Jelanghari_newchapter',
        tiktok: settings.tiktok || '@Jelangharicoffee',
        deskripsi_footer: settings.deskripsi_footer || 'Secangkir tenang, fokus tanpa batas. Menemani langkah produktif dan momen berhargamu di Tasikmalaya sejak pagi hingga larut malam.',
        wifi_ssid: settings.wifi_ssid || 'JelangHari_Workspace',
        wifi_password: settings.wifi_password || 'ngopidulu123',

        // 2. Operasional & Buka Tutup Kafe
        jam_buka: settings.jam_buka || '08:00',
        jam_tutup: settings.jam_tutup || '23:00',
        status_operasional_toko: settings.status_operasional_toko || 'otomatis',
        pesan_toko_tutup: settings.pesan_toko_tutup || 'Mohon maaf, Jelang Hari sedang tutup dan belum menerima pesanan online. Kami buka kembali pukul 08:00 – 23:00 WIB.',

        // 3. Pajak & Service Charge
        pajak_persen: Number(settings.pajak_persen || 0),
        service_persen: Number(settings.service_persen || 0),

        // 4. Struk & Hardware
        footer_struk: settings.footer_struk || 'Terima kasih atas kunjungan Anda!',
        printer_ip: settings.printer_ip || '192.168.1.200',
        printer_port: settings.printer_port || '9100',

        // 5. Integrasi AI Gemini
        gemini_api_key: settings.gemini_api_key || '',
        gemini_model: settings.gemini_model || 'gemini-1.5-flash',

        // 6. Sistem Reservasi
        reservasi_aktif: settings.reservasi_aktif || '1',
        reservasi_jam_buka: settings.reservasi_jam_buka || '09:00',
        reservasi_jam_tutup: settings.reservasi_jam_tutup || '22:00',
        reservasi_min_dp: Number(settings.reservasi_min_dp || 0),
        reservasi_maks_durasi: Number(settings.reservasi_maks_durasi || 2),
        reservasi_syarat: settings.reservasi_syarat || 'Harap hadir tepat waktu. Meja akan ditahan maksimal 20 menit setelah jam reservasi.',
        reservasi_wa_admin: settings.reservasi_wa_admin || '0821-1594-1156',

        // 7. Metode Pembayaran Kasir (Custom List + Legacy)
        kasir_metode_pembayaran_custom: settings.kasir_metode_pembayaran_custom || JSON.stringify(initialMetodeList),
        kasir_metode_cash: settings.kasir_metode_cash !== '0' ? '1' : '0',
        kasir_metode_qris: settings.kasir_metode_qris !== '0' ? '1' : '0',
        kasir_metode_debit: settings.kasir_metode_debit !== '0' ? '1' : '0',
        kasir_metode_transfer: settings.kasir_metode_transfer !== '0' ? '1' : '0',
        kasir_qris_nama: settings.kasir_qris_nama || 'QRIS Jelang Hari (All E-Wallet / Bank)',
        kasir_transfer_bank: settings.kasir_transfer_bank || 'BCA 1234567890 a.n Jelang Hari',
        kasir_debit_nama: settings.kasir_debit_nama || 'Mesin EDC BCA / Mandiri',

        // 8. Midtrans Gateway
        midtrans_enabled: settings.midtrans_enabled === '1' ? '1' : '0',
        midtrans_is_production: settings.midtrans_is_production === '1' ? '1' : '0',
        midtrans_server_key: settings.midtrans_server_key || '',
        midtrans_client_key: settings.midtrans_client_key || '',
        midtrans_merchant_id: settings.midtrans_merchant_id || '',

        // 9. Kebijakan Pemesanan Tamu (Guest Checkout)
        guest_checkout_enabled: settings.guest_checkout_enabled === '1' ? '1' : '0',

        // 10. Dynamic Banners JSON
        homepage_banners: settings.homepage_banners || JSON.stringify(initialBanners),
    });

    // Area Stats calculation
    const areaStats = useMemo(() => {
        const total = mejas.length;
        const indoor = mejas.filter((m) => m.area.toLowerCase().includes('indoor')).length;
        const outdoor = mejas.filter((m) => m.area.toLowerCase().includes('outdoor')).length;
        const workspace = mejas.filter((m) => m.area.toLowerCase().includes('work') || m.area.toLowerCase().includes('pod')).length;
        const vip = mejas.filter((m) => m.area.toLowerCase().includes('vip')).length;
        return { total, indoor, outdoor, workspace, vip };
    }, [mejas]);

    // Filtered Mejas
    const filteredMejas = useMemo(() => {
        if (selectedAreaFilter === 'all') return mejas;
        return mejas.filter((m) => m.area.toLowerCase() === selectedAreaFilter.toLowerCase());
    }, [mejas, selectedAreaFilter]);

    const [savedSuccess, setSavedSuccess] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }
        post('/pengaturan', {
            preserveScroll: true,
            onSuccess: () => {
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 3500);
            },
        });
    };

    // ==========================================
    // METODE PEMBAYARAN ACTIONS (OPSI B)
    // ==========================================
    const handleSyncMetodeList = (newList: MetodePembayaranCustom[]) => {
        setMetodeList(newList);
        setData('kasir_metode_pembayaran_custom', JSON.stringify(newList));
        const cash = newList.find(m => m.id === 'cash');
        if (cash) setData('kasir_metode_cash', cash.is_aktif ? '1' : '0');
        const qris = newList.find(m => m.id === 'qris');
        if (qris) {
            setData('kasir_metode_qris', qris.is_aktif ? '1' : '0');
            if (qris.keterangan) setData('kasir_qris_nama', qris.keterangan);
        }
        const debit = newList.find(m => m.id === 'debit');
        if (debit) {
            setData('kasir_metode_debit', debit.is_aktif ? '1' : '0');
            if (debit.keterangan) setData('kasir_debit_nama', debit.keterangan);
        }
        const transfer = newList.find(m => m.id === 'transfer');
        if (transfer) {
            setData('kasir_metode_transfer', transfer.is_aktif ? '1' : '0');
            if (transfer.keterangan) setData('kasir_transfer_bank', transfer.keterangan);
        }
    };

    const handleSaveNewMetode = (e: React.FormEvent) => {
        e.preventDefault();
        const nama = newMetodeForm.nama.trim();
        if (!nama) return;
        const cleanId = (nama.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 20) || 'custom') + '_' + Math.random().toString(36).substring(2, 6);
        const item: MetodePembayaranCustom = {
            id: cleanId,
            nama,
            tipe: newMetodeForm.tipe,
            keterangan: newMetodeForm.keterangan.trim(),
            is_aktif: newMetodeForm.is_aktif,
        };
        handleSyncMetodeList([...metodeList, item]);
        setIsAddMetodeModalOpen(false);
        setNewMetodeForm({ nama: '', tipe: 'non_cash', keterangan: '', is_aktif: true });
    };

    const handleSaveEditMetode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMetode) return;
        const nama = editingMetode.nama.trim();
        if (!nama) return;
        const updated = metodeList.map(m => m.id === editingMetode.id ? { ...editingMetode, nama } : m);
        handleSyncMetodeList(updated);
        setEditingMetode(null);
    };

    const handleToggleMetodeActive = (id: string) => {
        const updated = metodeList.map(m => m.id === id ? { ...m, is_aktif: !m.is_aktif } : m);
        handleSyncMetodeList(updated);
    };

    const handleConfirmDeleteMetode = () => {
        if (!deleteMetodeTarget) return;
        if (metodeList.length <= 1) {
            alert('Minimal harus menyisakan 1 metode pembayaran!');
            setDeleteMetodeTarget(null);
            return;
        }
        const updated = metodeList.filter(m => m.id !== deleteMetodeTarget.id);
        handleSyncMetodeList(updated);
        setDeleteMetodeTarget(null);
    };

    const handleResetMetodeDefault = () => {
        setIsResetMetodeModalOpen(true);
    };

    const handleConfirmResetMetode = () => {
        handleSyncMetodeList(defaultStandardMetodeList);
        setIsResetMetodeModalOpen(false);
    };

    // ==========================================
    // DYNAMIC BANNER & PROMOSI SYSTEM ACTIONS
    // ==========================================
    const handleSyncBannerList = (newList: BannerItem[]) => {
        setBannerList(newList);
        setData('homepage_banners', JSON.stringify(newList));
    };

    const handleOpenAddBanner = () => {
        setEditingBannerId(null);
        setBannerForm({
            id: '',
            badge: '🔥 PROMO SPESIAL',
            title: '',
            tanggal_waktu: 'Berlaku Setiap Hari • 08:00 - 23:00 WIB',
            desc: '',
            konten_lengkap: '',
            image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
            action_text: 'Lihat Detail',
            action_type: 'menu',
            action_url: '',
            is_aktif: true,
        });
        setIsBannerModalOpen(true);
    };

    const handleOpenEditBanner = (item: BannerItem) => {
        setEditingBannerId(item.id);
        setBannerForm({ ...item });
        setIsBannerModalOpen(true);
    };

    const handleSaveBannerForm = (e: React.FormEvent) => {
        e.preventDefault();
        const title = bannerForm.title.trim();
        if (!title) return;

        if (editingBannerId) {
            const updated = bannerList.map(b => b.id === editingBannerId ? { ...bannerForm } : b);
            handleSyncBannerList(updated);
        } else {
            const newId = 'banner_' + Date.now();
            const newItem: BannerItem = {
                ...bannerForm,
                id: newId,
            };
            handleSyncBannerList([...bannerList, newItem]);
        }
        setIsBannerModalOpen(false);
    };

    const handleToggleBannerActive = (id: string) => {
        const updated = bannerList.map(b => b.id === id ? { ...b, is_aktif: !b.is_aktif } : b);
        handleSyncBannerList(updated);
    };

    const handleDeleteBanner = (item: BannerItem) => {
        setDeleteBannerTarget(item);
    };

    const handleConfirmDeleteBanner = () => {
        if (!deleteBannerTarget) return;
        if (bannerList.length <= 1) {
            alert('Minimal harus menyisakan 1 banner di sistem!');
            setDeleteBannerTarget(null);
            return;
        }
        const updated = bannerList.filter(b => b.id !== deleteBannerTarget.id);
        handleSyncBannerList(updated);
        setDeleteBannerTarget(null);
    };

    const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 5MB!');
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setBannerForm(prev => ({ ...prev, image: event.target!.result as string }));
            }
        };
        reader.readAsDataURL(file);
    };

    // ==========================================
    // KATEGORI / AREA MANAGEMENT ACTIONS
    // ==========================================
    const handleAddCategory = () => {
        const trimmed = newCatInput.trim();
        if (!trimmed) return;
        if (!categories.includes(trimmed)) {
            setCategories(prev => [...prev, trimmed]);
        }
        setNewCatInput('');
        setIsAddCatOpen(false);
    };

    const handleSaveEditCategory = () => {
        if (!editingCatTarget || !editingCatTarget.newName.trim()) return;
        const oldName = editingCatTarget.oldName;
        const newName = editingCatTarget.newName.trim();

        // Update list
        setCategories(prev => prev.map(c => c === oldName ? newName : c));

        // Update all tables in memory or via prompt
        mejas.forEach(m => {
            if (m.area.toLowerCase() === oldName.toLowerCase()) {
                router.put(`/pengaturan/meja/${m.id}`, {
                    nomor: m.nomor,
                    nama: m.nama,
                    area: newName,
                    kapasitas: m.kapasitas,
                    status: m.status
                }, { preserveScroll: true });
            }
        });

        setEditingCatTarget(null);
    };

    const handleDeleteCategory = (catToDelete: string) => {
        const tablesInCat = mejas.filter(m => m.area.toLowerCase() === catToDelete.toLowerCase());
        setDeleteCategoryTarget({ name: catToDelete, tableCount: tablesInCat.length });
    };

    const handleConfirmDeleteCategory = () => {
        if (!deleteCategoryTarget) return;
        const catToDelete = deleteCategoryTarget.name;
        const tablesInCat = mejas.filter(m => m.area.toLowerCase() === catToDelete.toLowerCase());

        if (tablesInCat.length > 0) {
            // Move tables to Indoor
            tablesInCat.forEach(m => {
                router.put(`/pengaturan/meja/${m.id}`, {
                    nomor: m.nomor,
                    nama: m.nama,
                    area: 'Indoor',
                    kapasitas: m.kapasitas,
                    status: m.status
                }, { preserveScroll: true });
            });
        }

        setCategories(prev => prev.filter(c => c !== catToDelete));
        if (selectedAreaFilter.toLowerCase() === catToDelete.toLowerCase()) {
            setSelectedAreaFilter('all');
        }
        setDeleteCategoryTarget(null);
    };

    // ==========================================
    // MEJA MANAGEMENT ACTIONS
    // ==========================================
    const handleOpenAddMeja = () => {
        setEditingMejaId(null);
        setMejaForm({ nomor: '', nama: '', area: categories[0] || 'Indoor', kapasitas: 4 });
        setIsAddMejaOpen(true);
    };

    const handleOpenEditMeja = (m: MejaItem) => {
        setEditingMejaId(m.id);
        setMejaForm({
            nomor: m.nomor,
            nama: m.nama || '',
            area: m.area || 'Indoor',
            kapasitas: m.kapasitas !== undefined && m.kapasitas !== null ? m.kapasitas : 0,
        });
        setIsAddMejaOpen(true);
    };

    const handleSaveMeja = (e: React.FormEvent) => {
        e.preventDefault();
        setMejaProcessing(true);
        const payload = {
            ...mejaForm,
            kapasitas: mejaForm.kapasitas === '' ? 0 : Number(mejaForm.kapasitas) || 0,
        };
        if (editingMejaId) {
            router.put(`/pengaturan/meja/${editingMejaId}`, payload, {
                onSuccess: () => {
                    setIsAddMejaOpen(false);
                    setEditingMejaId(null);
                    setMejaForm({ nomor: '', nama: '', area: 'Indoor', kapasitas: 4 });
                },
                onFinish: () => setMejaProcessing(false)
            });
        } else {
            router.post('/pengaturan/meja', payload, {
                onSuccess: () => {
                    setIsAddMejaOpen(false);
                    setMejaForm({ nomor: '', nama: '', area: 'Indoor', kapasitas: 4 });
                },
                onFinish: () => setMejaProcessing(false)
            });
        }
    };

    const handleConfirmDeleteMeja = () => {
        if (!deleteMejaTarget) return;
        router.delete(`/pengaturan/meja/${deleteMejaTarget.id}`, {
            onSuccess: () => setDeleteMejaTarget(null),
        });
    };

    // Open QR Customizer for specific table or default
    const handleOpenQrCustomizer = (m?: MejaItem) => {
        if (m) {
            setSelectedMejaForQr(m);
        } else if (mejas.length > 0) {
            setSelectedMejaForQr(mejas[0]);
        }
        setIsQrCustomizerOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem & Identitas Kafe" />

            <div className="space-y-5 max-w-7xl mx-auto px-3 sm:px-6 py-4">
                {/* 1. TOP HEADER & STICKY ACTION BAR (RAMAH JEMPOL) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>Pengaturan Sistem &amp; Kafe</span>
                        </h1>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Kelola identitas kafe, jam buka, kategori meja, metode bayar, dan stand QR barcode.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Tombol Kustomisasi Stand QR Barcode */}
                        <button
                            type="button"
                            onClick={() => handleOpenQrCustomizer()}
                            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                        >
                            <QrCode className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                            <span>Stand QR Barcode</span>
                        </button>

                        {/* Tombol Simpan Form Utama */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{processing ? 'Menyimpan...' : 'Simpan Setelan'}</span>
                        </button>
                    </div>
                </div>

                {/* 2. SEGMENTED TAB BAR (MINIMALIS & EFISIEN UNTUK JEMPOL) */}
                <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('identity')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'identity'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Store className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Identitas &amp; Footer Kafe</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('operasional')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'operasional'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Jam &amp; Buka Tutup</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('meja')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'meja'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Meja &amp; Kategori ({mejas.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('payment')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'payment'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Pembayaran &amp; PB1</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('hardware')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'hardware'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Printer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Printer Struk &amp; AI</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('banner')}
                        className={`min-w-fit px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            activeTab === 'banner'
                                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs border border-zinc-200/80 dark:border-zinc-700'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>Banner &amp; Promosi ({bannerList.length})</span>
                    </button>
                </div>

                {/* 3. TAB CONTENT FORMS */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* ========================================================
                        TAB 1: IDENTITAS KAFE LENGKAP & FOOTER HALAMAN UTAMA
                        ======================================================== */}
                    {activeTab === 'identity' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                    <Store className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Identitas Kafe &amp; Footer Halaman Utama</h2>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Data ini langsung tampil di Navbar, Footer, Struk Belanja, dan link kontak pelanggan.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Nama Kafe / Usaha
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.nama_cafe}
                                        onChange={(e) => setData('nama_cafe', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Tagline / Slogan Kafe
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tagline}
                                        onChange={(e) => setData('tagline', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        No. WhatsApp / Telepon Resmi
                                    </label>
                                    <input
                                        type="text"
                                        value={data.telepon}
                                        onChange={(e) => setData('telepon', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Alamat Email Resmi
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Alamat Fisik Lengkap Kafe
                                    </label>
                                    <input
                                        type="text"
                                        value={data.alamat}
                                        onChange={(e) => setData('alamat', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Link Petunjuk Arah Google Maps
                                    </label>
                                    <input
                                        type="url"
                                        value={data.maps_url}
                                        onChange={(e) => setData('maps_url', e.target.value)}
                                        placeholder="https://maps.google.com/?q=..."
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Username Instagram Kafe
                                    </label>
                                    <input
                                        type="text"
                                        value={data.instagram}
                                        onChange={(e) => setData('instagram', e.target.value)}
                                        placeholder="@Jelanghari_newchapter"
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Username TikTok Kafe
                                    </label>
                                    <input
                                        type="text"
                                        value={data.tiktok}
                                        onChange={(e) => setData('tiktok', e.target.value)}
                                        placeholder="@Jelangharicoffee"
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Nama WiFi Pengunjung (SSID)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.wifi_ssid}
                                        onChange={(e) => setData('wifi_ssid', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Password WiFi Kafe
                                    </label>
                                    <input
                                        type="text"
                                        value={data.wifi_password}
                                        onChange={(e) => setData('wifi_password', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Deskripsi Singkat / Filosofi Kafe di Footer
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.deskripsi_footer}
                                        onChange={(e) => setData('deskripsi_footer', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition leading-relaxed"
                                    />
                                </div>

                                {/* Tombol Aksi Simpan Identitas & Tinjau Beranda */}
                                <div className="sm:col-span-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span>Perubahan identitas akan langsung otomatis tampil di Navbar &amp; Footer halaman utama.</span>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <a
                                            href="/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>Lihat Halaman Utama</span>
                                        </a>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                        >
                                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            <span>{processing ? 'Menyimpan...' : 'Simpan Identitas & Footer'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 2: JAM OPERASIONAL & BUKA TUTUP
                        ======================================================== */}
                    {activeTab === 'operasional' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Operasional &amp; Buka Tutup Kafe</h2>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Atur jam buka otomatis atau ubah status toko secara manual sewaktu-waktu.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                                        Status Toko Saat Ini
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold ${data.status_operasional_toko === 'otomatis' ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs' : 'bg-zinc-50/60 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}`}>
                                            <input
                                                type="radio"
                                                name="status_operasional_toko"
                                                value="otomatis"
                                                checked={data.status_operasional_toko === 'otomatis'}
                                                onChange={(e) => setData('status_operasional_toko', e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            <div>
                                                <p className="font-bold text-xs">Otomatis (Jadwal)</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Sesuai jam buka &amp; tutup</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold ${data.status_operasional_toko === 'buka' ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs' : 'bg-zinc-50/60 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}`}>
                                            <input
                                                type="radio"
                                                name="status_operasional_toko"
                                                value="buka"
                                                checked={data.status_operasional_toko === 'buka'}
                                                onChange={(e) => setData('status_operasional_toko', e.target.value)}
                                                className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            <div>
                                                <p className="font-bold text-xs text-emerald-700 dark:text-emerald-400">Paksa Buka</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Toko selalu menerima order</p>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold ${data.status_operasional_toko === 'tutup' ? 'bg-red-50/80 dark:bg-red-950/30 border-red-500 text-red-900 dark:text-red-200 shadow-xs' : 'bg-zinc-50/60 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'}`}>
                                            <input
                                                type="radio"
                                                name="status_operasional_toko"
                                                value="tutup"
                                                checked={data.status_operasional_toko === 'tutup'}
                                                onChange={(e) => setData('status_operasional_toko', e.target.value)}
                                                className="text-red-600 focus:ring-red-500 w-4 h-4"
                                            />
                                            <div>
                                                <p className="font-bold text-xs text-red-700 dark:text-red-400">Tutup Sementara</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">Kunci order pelanggan</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Jam Buka (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={data.jam_buka}
                                            onChange={(e) => setData('jam_buka', e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Jam Tutup (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={data.jam_tutup}
                                            onChange={(e) => setData('jam_tutup', e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Pesan Pemberitahuan Saat Toko Tutup
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.pesan_toko_tutup}
                                        onChange={(e) => setData('pesan_toko_tutup', e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed transition"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 3: MANAJEMEN MEJA, KATEGORI & CETAK STAND QR
                        ======================================================== */}
                    {activeTab === 'meja' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
                            
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                            Manajemen Meja &amp; Kategori Area
                                        </h2>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Kelola kategori area, tambah meja, edit, dan cetak stand QR akrilik.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenQrCustomizer()}
                                        className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <QrCode className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                                        <span>Kustom Stand QR</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleOpenAddMeja}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Meja</span>
                                    </button>
                                </div>
                            </div>

                            {/* MANAJEMEN KATEGORI / AREA MEJA (TAMBAH, EDIT, HAPUS) */}
                            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-emerald-600" />
                                            Kategori Area Meja
                                        </span>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                            Klik tombol edit/hapus pada chip untuk mengelola kategori.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddCatOpen(prev => !prev)}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>{isAddCatOpen ? 'Batal' : 'Tambah Kategori'}</span>
                                    </button>
                                </div>

                                {/* Form Tambah Kategori */}
                                {isAddCatOpen && (
                                    <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 animate-in fade-in">
                                        <input
                                            type="text"
                                            value={newCatInput}
                                            onChange={(e) => setNewCatInput(e.target.value)}
                                            placeholder="Nama kategori baru (contoh: Rooftop Lounge)..."
                                            className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCategory();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                                        >
                                            Simpan
                                        </button>
                                    </div>
                                )}

                                {/* Modal / Edit Box Nama Kategori */}
                                {editingCatTarget && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2 animate-in fade-in">
                                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                                            Ubah Nama Kategori: <u>{editingCatTarget.oldName}</u>
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editingCatTarget.newName}
                                                onChange={(e) => setEditingCatTarget({ ...editingCatTarget, newName: e.target.value })}
                                                className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveEditCategory}
                                                className="px-3.5 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700"
                                            >
                                                Update Kategori
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingCatTarget(null)}
                                                className="px-2.5 py-1.5 bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold rounded-lg"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Daftar Chip Kategori */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {categories.map((cat) => {
                                        const count = mejas.filter(m => m.area.toLowerCase() === cat.toLowerCase()).length;
                                        const isFilterActive = selectedAreaFilter.toLowerCase() === cat.toLowerCase();
                                        return (
                                            <div
                                                key={cat}
                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                                    isFilterActive
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                                        : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                                                }`}
                                            >
                                                <span
                                                    onClick={() => setSelectedAreaFilter(prev => prev === cat ? 'all' : cat)}
                                                    className="cursor-pointer"
                                                >
                                                    {cat} <span className="opacity-70 text-[10px]">({count} meja)</span>
                                                </span>
                                                <div className="flex items-center gap-1 border-l border-current/20 pl-1.5 ml-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCatTarget({ oldName: cat, newName: cat })}
                                                        className="p-1 rounded hover:bg-black/10"
                                                        title={`Edit kategori ${cat}`}
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCategory(cat)}
                                                        className="p-1 rounded hover:bg-red-500 hover:text-white"
                                                        title={`Hapus kategori ${cat}`}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Filter Bar & Meja List Grid */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                        Daftar Meja ({filteredMejas.length} Meja)
                                    </span>
                                    {selectedAreaFilter !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedAreaFilter('all')}
                                            className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                        >
                                            Tampilkan Semua Meja
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {filteredMejas.map((m) => (
                                        <div
                                            key={m.id}
                                            className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 shadow-2xs hover:border-emerald-500 transition space-y-2.5"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-mono font-bold">
                                                        MEJA {m.nomor}
                                                    </span>
                                                    <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mt-1">
                                                        {m.nama || 'Tanpa label'}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                                                    {m.area}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
                                                <span>{m.kapasitas && m.kapasitas > 0 ? `Kapasitas: ${m.kapasitas} orang` : 'Kapasitas Bebas'}</span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenQrCustomizer(m)}
                                                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                                                        title="Stand QR"
                                                    >
                                                        <QrCode className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditMeja(m)}
                                                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteMejaTarget({ id: m.id, nomor: m.nomor })}
                                                        className="p-1 rounded-lg text-zinc-400 hover:text-rose-600"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 4: METODE PEMBAYARAN KASIR & PAJAK RESTORAN PB1
                        ======================================================== */}
                    {activeTab === 'payment' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
                            {/* PB1 & Service Charge */}
                            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-emerald-600" />
                                    <span>Pajak Restoran PB1 &amp; Service Charge</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Pajak PB1 (%)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.pajak_persen}
                                            onChange={(e) => setData('pajak_persen', Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Service Charge (%)
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={data.service_persen}
                                            onChange={(e) => setData('service_persen', Number(e.target.value))}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Metode Pembayaran Kasir (POS) - Dinamis (Opsi B) */}
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                            <span>Metode Pembayaran Kasir (POS)</span>
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            Bebas tambah, edit keterangan/rekening, tentukan tipe kas (butuh kembalian) atau non-tunai (nominal pas).
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleResetMetodeDefault}
                                            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-750 transition flex items-center gap-1.5"
                                            title="Reset ke 4 metode standar"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Reset Standar</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewMetodeForm({ nama: '', tipe: 'non_cash', keterangan: '', is_aktif: true });
                                                setIsAddMetodeModalOpen(true);
                                            }}
                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>Tambah Metode</span>
                                        </button>
                                    </div>
                                </div>

                                {/* List of Custom Payment Methods Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {metodeList.map((m) => {
                                        const isCash = m.tipe === 'cash';
                                        return (
                                            <div
                                                key={m.id}
                                                className={`p-4 rounded-2xl border transition-all ${
                                                    m.is_aktif
                                                        ? 'bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800 shadow-xs'
                                                        : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-850 opacity-70'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                                            isCash
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                                        }`}>
                                                            {isCash ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                                    {m.nama}
                                                                </h4>
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                                                                    isCash
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                                        : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                }`}>
                                                                    {isCash ? 'CASH' : 'NON-TUNAI'}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                                                ID: {m.id}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Active Toggle Switch */}
                                                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={m.is_aktif}
                                                            onChange={() => handleToggleMetodeActive(m.id)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-600"></div>
                                                    </label>
                                                </div>

                                                {/* Keterangan / Rekening Kasir */}
                                                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-start justify-between gap-2">
                                                    <div className="text-xs text-zinc-600 dark:text-zinc-400 font-mono text-[11px] min-w-0 break-words flex-1">
                                                        <span className="text-zinc-400 dark:text-zinc-500 font-sans block text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                                                            Catatan / Rekening Kasir:
                                                        </span>
                                                        {m.keterangan || <i className="text-zinc-400 font-sans">Tanpa catatan khusus</i>}
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingMetode({ ...m })}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                                            title="Edit Metode"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeleteMetodeTarget(m)}
                                                            disabled={metodeList.length <= 1}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                            title={metodeList.length <= 1 ? 'Minimal 1 metode harus ada' : 'Hapus Metode'}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 5: PRINTER STRUK & AI GEMINI
                        ======================================================== */}
                    {activeTab === 'hardware' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
                            {/* Struk Thermal */}
                            <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Printer className="w-4 h-4 text-emerald-600" />
                                    <span>Printer Struk Kasir &amp; Thermal</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Catatan Kaki Struk (Footer)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.footer_struk}
                                            onChange={(e) => setData('footer_struk', e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            IP Printer Thermal LAN
                                        </label>
                                        <input
                                            type="text"
                                            value={data.printer_ip}
                                            onChange={(e) => setData('printer_ip', e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gemini AI */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-emerald-600" />
                                    <span>Google Gemini AI Analytics</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Gemini API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={data.gemini_api_key}
                                            onChange={(e) => setData('gemini_api_key', e.target.value)}
                                            placeholder="AIzaSy..."
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                            Model AI
                                        </label>
                                        <input
                                            type="text"
                                            value={data.gemini_model}
                                            onChange={(e) => setData('gemini_model', e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========================================================
                        TAB 6: EVENT NOBAR, HOMEMADE & KEBIJAKAN TAMU
                        ======================================================== */}
                    {activeTab === 'banner' && (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
                            {/* Section 1: Kebijakan Pemesanan Tamu (Guest Checkout) */}
                            <div className="pb-5 border-b border-zinc-100 dark:border-zinc-800 space-y-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                            Kebijakan Akun &amp; Pemesanan Tamu (Guest Checkout)
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Kendalikan apakah pelanggan wajib mendaftar/masuk akun sebelum melakukan pemesanan online
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                                            Status Pemesanan Tamu (Guest Checkout)
                                        </span>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xl">
                                            {data.guest_checkout_enabled === '1'
                                                ? 'Tamu BEBAS memesan tanpa login (Cukup isi Nama & No. WA).'
                                                : 'Tamu WAJIB login/register sebelum checkout (Mencegah pesanan fiktif & memastikan Poin CRM tercatat).'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setData('guest_checkout_enabled', data.guest_checkout_enabled === '1' ? '0' : '1')}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-xs ${
                                            data.guest_checkout_enabled === '1'
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                                : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:opacity-90'
                                        }`}
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{data.guest_checkout_enabled === '1' ? 'Tamu Bebas Pesan (Aktif)' : 'Wajib Login (Proteksi Aktif)'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section 2: Banner Headline & Auto-Slider Event Kafe (Dynamic CRUD) */}
                            <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                                                Daftar Banner &amp; Promosi Beranda ({bannerList.length})
                                            </h3>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                Banner bergeser otomatis di beranda. Klik banner di beranda untuk membuka pop-up konten detail lengkap.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleOpenAddBanner}
                                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Banner Baru</span>
                                    </button>
                                </div>

                                {/* Grid of Banner Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {bannerList.map((banner, index) => (
                                        <div
                                            key={banner.id || index}
                                            className={`group relative rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden bg-white dark:bg-zinc-950 ${
                                                banner.is_aktif
                                                    ? 'border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-500/50 hover:shadow-md'
                                                    : 'border-zinc-200/50 dark:border-zinc-800/40 opacity-60 bg-zinc-50 dark:bg-zinc-950/40'
                                            }`}
                                        >
                                            {/* Thumbnail & Badges */}
                                            <div className="relative h-44 w-full bg-zinc-900 overflow-hidden shrink-0">
                                                {banner.image ? (
                                                    <img
                                                        src={banner.image}
                                                        alt={banner.title}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                                                        <ImageIcon className="w-8 h-8 mb-1" />
                                                        <span className="text-[10px]">Tanpa Gambar</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

                                                {/* Category Badge on Top-Left */}
                                                <div className="absolute top-2.5 left-2.5">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                                                        {banner.badge || 'PROMO'}
                                                    </span>
                                                </div>

                                                {/* Tanggal & Waktu on Top-Right */}
                                                <div className="absolute top-2.5 right-2.5 max-w-[55%] truncate">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center gap-1 shadow-xs truncate">
                                                        <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                                                        <span className="truncate">{banner.tanggal_waktu || 'Setiap Hari'}</span>
                                                    </span>
                                                </div>

                                                {/* Slide Order & Title Overlay */}
                                                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                                                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                                                        Slide #{index + 1}
                                                    </span>
                                                    <h4 className="font-extrabold text-sm text-white line-clamp-1 leading-snug drop-shadow-xs">
                                                        {banner.title || 'Judul Banner'}
                                                    </h4>
                                                </div>
                                            </div>

                                            {/* Body Info */}
                                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3 text-xs">
                                                <div className="space-y-2">
                                                    <p className="text-zinc-600 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                                                        {banner.desc || 'Belum ada deskripsi singkat.'}
                                                    </p>

                                                    {banner.konten_lengkap && (
                                                        <div className="p-2 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60">
                                                            <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                                                                <FileText className="w-3 h-3 text-emerald-500" />
                                                                <span>Konten Detail Pop-Up:</span>
                                                            </div>
                                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 italic line-clamp-2">
                                                                "{banner.konten_lengkap}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Aksi Tombol:</span>
                                                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                                                            {banner.action_type || 'none'}
                                                        </span>
                                                        <span className="truncate">"{banner.action_text || 'Detail'}"</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBannerActive(banner.id)}
                                                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                                                            banner.is_aktif
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                        }`}
                                                    >
                                                        <Check className={`w-3.5 h-3.5 ${banner.is_aktif ? 'text-emerald-600' : 'text-zinc-400'}`} />
                                                        <span>{banner.is_aktif ? 'Aktif' : 'Nonaktif'}</span>
                                                    </button>

                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditBanner(banner)}
                                                            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                                            title="Edit Banner"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteBanner(banner)}
                                                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                                                            title="Hapus Banner"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* MODAL TAMBAH / EDIT MEJA */}
                {isAddMejaOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh]">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                    {editingMejaId ? 'Edit Data Meja' : 'Tambah Meja Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddMejaOpen(false);
                                        setEditingMejaId(null);
                                    }}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveMeja} className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Nomor Meja
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: 01"
                                            value={mejaForm.nomor}
                                            onChange={(e) => setMejaForm({ ...mejaForm, nomor: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Kategori Area
                                        </label>
                                        <select
                                            value={mejaForm.area}
                                            onChange={(e) => setMejaForm({ ...mejaForm, area: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            {categories.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Label (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: Dekat Jendela"
                                            value={mejaForm.nama}
                                            onChange={(e) => setMejaForm({ ...mejaForm, nama: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                            Kapasitas Tamu
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="0 (Kapasitas Bebas)"
                                            value={mejaForm.kapasitas}
                                            onChange={(e) => setMejaForm({ ...mejaForm, kapasitas: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0) })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100"
                                        />
                                        <span className="text-[10px] text-zinc-400 mt-1 block">
                                            Bisa diisi 0 jika kapasitas tamu bebas / fleksibel.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddMejaOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mejaProcessing}
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        {mejaProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        <span>{editingMejaId ? 'Perbarui Meja' : 'Simpan Meja'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS MEJA */}
                {deleteMejaTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus Meja {deleteMejaTarget.nomor}?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Meja ini dan barcode terkait akan dihapus dari daftar sistem.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteMejaTarget(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteMeja}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Meja</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL TAMBAH METODE PEMBAYARAN */}
                {isAddMetodeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                            Tambah Metode Pembayaran
                                        </h3>
                                        <p className="text-[11px] text-zinc-500">
                                            Metode baru akan muncul di pilihan kasir POS
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddMetodeModalOpen(false)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveNewMetode} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Nama Metode Bayar
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Voucher Staff / GoPay Kasir / Transfer BCA"
                                        value={newMetodeForm.nama}
                                        onChange={(e) => setNewMetodeForm({ ...newMetodeForm, nama: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Tipe Perhitungan
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewMetodeForm({ ...newMetodeForm, tipe: 'non_cash' })}
                                            className={`p-3 rounded-xl border text-left transition ${
                                                newMetodeForm.tipe === 'non_cash'
                                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                                                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Non-Tunai</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                Pembayaran pas (QRIS, EDC, Transfer, E-Wallet)
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewMetodeForm({ ...newMetodeForm, tipe: 'cash' })}
                                            className={`p-3 rounded-xl border text-left transition ${
                                                newMetodeForm.tipe === 'cash'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                                <Banknote className="w-3.5 h-3.5" />
                                                <span>Tunai (Cash)</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                Input uang diterima &amp; hitung kembalian otomatis
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Keterangan / Nomor Rekening / Catatan Kasir
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Contoh: BCA 1234567890 a.n Jelang Hari / Tunjukkan bukti transaksi"
                                        value={newMetodeForm.keterangan}
                                        onChange={(e) => setNewMetodeForm({ ...newMetodeForm, keterangan: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                        Status Langsung Aktif di Kasir
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={newMetodeForm.is_aktif}
                                        onChange={(e) => setNewMetodeForm({ ...newMetodeForm, is_aktif: e.target.checked })}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddMetodeModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Simpan Metode</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL EDIT METODE PEMBAYARAN */}
                {editingMetode && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                        <Edit2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                            Edit Metode Pembayaran
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 font-mono">
                                            ID: {editingMetode.id}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingMetode(null)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveEditMetode} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Nama Metode Bayar
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editingMetode.nama}
                                        onChange={(e) => setEditingMetode({ ...editingMetode, nama: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                                        Tipe Perhitungan
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditingMetode({ ...editingMetode, tipe: 'non_cash' })}
                                            className={`p-3 rounded-xl border text-left transition ${
                                                editingMetode.tipe === 'non_cash'
                                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                                                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                                <CreditCard className="w-3.5 h-3.5" />
                                                <span>Non-Tunai</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                Pembayaran pas (QRIS, EDC, Transfer)
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingMetode({ ...editingMetode, tipe: 'cash' })}
                                            className={`p-3 rounded-xl border text-left transition ${
                                                editingMetode.tipe === 'cash'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-xs'
                                                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 font-bold text-xs">
                                                <Banknote className="w-3.5 h-3.5" />
                                                <span>Tunai (Cash)</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                Input uang diterima &amp; hitung kembalian
                                            </p>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                                        Keterangan / Nomor Rekening / Catatan Kasir
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={editingMetode.keterangan || ''}
                                        onChange={(e) => setEditingMetode({ ...editingMetode, keterangan: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                                        Status Aktif di Kasir
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={editingMetode.is_aktif}
                                        onChange={(e) => setEditingMetode({ ...editingMetode, is_aktif: e.target.checked })}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setEditingMetode(null)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Simpan Perubahan</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS METODE */}
                {deleteMetodeTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus Metode {deleteMetodeTarget.nama}?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Metode ini akan dihilangkan dari daftar pilihan pembayaran kasir POS.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteMetodeTarget(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteMetode}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Metode</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI RESET METODE KE STANDAR */}
                {isResetMetodeModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Reset Metode Pembayaran?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Daftar metode pembayaran akan dikembalikan ke 4 metode standar bawaan (Tunai, QRIS, EDC, Transfer).
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsResetMetodeModalOpen(false)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmResetMetode}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Ya, Reset Standar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS KATEGORI / AREA */}
                {deleteCategoryTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus Kategori "{deleteCategoryTarget.name}"?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        {deleteCategoryTarget.tableCount > 0
                                            ? `Kategori ini memiliki ${deleteCategoryTarget.tableCount} meja. Seluruh meja di dalamnya akan otomatis dialihkan ke area "Indoor".`
                                            : 'Kategori area meja ini akan dihapus dari sistem.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteCategoryTarget(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteCategory}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Kategori</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL TAMBAH / EDIT BANNER & PROMOSI */}
                {isBannerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        {editingBannerId ? 'Edit Banner Promosi' : 'Tambah Banner Promosi Baru'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBannerModalOpen(false)}
                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveBannerForm} className="space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Badge / Tag Kategori
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={bannerForm.badge}
                                            onChange={e => setBannerForm({ ...bannerForm, badge: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                                            placeholder="Contoh: 🔴 NOBAR AKBAR"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Tanggal &amp; Waktu (Sudut Kanan Atas)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={bannerForm.tanggal_waktu}
                                            onChange={e => setBannerForm({ ...bannerForm, tanggal_waktu: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                                            placeholder="Contoh: Minggu, 18 Okt 2026 • 19:30 WIB"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Judul Headline Banner
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={bannerForm.title}
                                        onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                                        placeholder="Contoh: Nobar Akbar Persib vs Persija di Jelang Hari"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Deskripsi Singkat (Muncul di Slider Beranda)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={bannerForm.desc}
                                        onChange={e => setBannerForm({ ...bannerForm, desc: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                                        placeholder="Ringkasan singkat promosi / event..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center justify-between">
                                        <span>Konten Detail Lengkap (Pop-Up Modal Saat Diklik)</span>
                                        <span className="text-[10px] text-emerald-600 font-semibold">Tampil Full Modal</span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={bannerForm.konten_lengkap}
                                        onChange={e => setBannerForm({ ...bannerForm, konten_lengkap: e.target.value })}
                                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs leading-relaxed"
                                        placeholder="Cerita lengkap, fasilitas, ketentuan nobar, keunggulan bahan baku homemade, syarat dan ketentuan promo..."
                                    />
                                </div>

                                {/* Gambar Banner: Upload File / URL / Presets */}
                                <div className="space-y-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700">
                                    <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                        Gambar Banner (Upload / URL / Presets)
                                    </label>

                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 flex items-center gap-1.5 shadow-2xs">
                                            <Upload className="w-3.5 h-3.5 text-emerald-600" />
                                            <span>Upload Foto</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleBannerImageUpload}
                                            />
                                        </label>
                                        <input
                                            type="url"
                                            value={bannerForm.image}
                                            onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })}
                                            className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {/* Presets buttons */}
                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                        <span className="text-[10px] text-zinc-500 font-semibold">Preset Cepat:</span>
                                        {[
                                            { label: '⚽ Stadion / Nobar', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80' },
                                            { label: '🥐 Pastry Dapur', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80' },
                                            { label: '☕ Kopi Santai', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80' },
                                            { label: '💼 Workspace', url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80' },
                                        ].map(preset => (
                                            <button
                                                key={preset.label}
                                                type="button"
                                                onClick={() => setBannerForm({ ...bannerForm, image: preset.url })}
                                                className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 transition"
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Preview Thumbnail */}
                                    {bannerForm.image && (
                                        <div className="relative h-28 w-full rounded-xl overflow-hidden mt-2 border border-zinc-200 dark:border-zinc-700 bg-black">
                                            <img
                                                src={bannerForm.image}
                                                alt="Preview Banner"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white">
                                                {bannerForm.badge || 'PROMO'}
                                            </div>
                                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white flex items-center gap-1">
                                                <Calendar className="w-2.5 h-2.5 text-emerald-400" />
                                                <span>{bannerForm.tanggal_waktu || 'Setiap Hari'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Tipe Aksi Tombol
                                        </label>
                                        <select
                                            value={bannerForm.action_type}
                                            onChange={e => setBannerForm({ ...bannerForm, action_type: e.target.value as any })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold"
                                        >
                                            <option value="menu">Buka Menu Pesanan</option>
                                            <option value="reservasi">Buka Form Reservasi Meja</option>
                                            <option value="link">Buka URL Eksternal / Instagram</option>
                                            <option value="none">Hanya Baca Konten</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            Teks Tombol Aksi
                                        </label>
                                        <input
                                            type="text"
                                            value={bannerForm.action_text}
                                            onChange={e => setBannerForm({ ...bannerForm, action_text: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                                            placeholder="Contoh: Reservasi Meja Nobar"
                                        />
                                    </div>
                                </div>

                                {bannerForm.action_type === 'link' && (
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                            URL Link Tujuan
                                        </label>
                                        <input
                                            type="url"
                                            value={bannerForm.action_url || ''}
                                            onChange={e => setBannerForm({ ...bannerForm, action_url: e.target.value })}
                                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                                            placeholder="https://instagram.com/Jelanghari_newchapter"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="banner_is_aktif"
                                        checked={bannerForm.is_aktif}
                                        onChange={e => setBannerForm({ ...bannerForm, is_aktif: e.target.checked })}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                                    />
                                    <label htmlFor="banner_is_aktif" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                        Aktifkan dan tampilkan banner ini di beranda
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsBannerModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                    >
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Simpan Banner</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL KONFIRMASI HAPUS BANNER */}
                {deleteBannerTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 my-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <Trash2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                        Hapus Banner Ini?
                                    </h3>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Banner "{deleteBannerTarget.title}" akan dihapus dari beranda.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setDeleteBannerTarget(null)}
                                    className="px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmDeleteBanner}
                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Ya, Hapus</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL POP-UP CUSTOMIZER BARCODE / STAND MEJA (PREVIEW DI KIRI, CONTROLS DI KANAN) */}
                <TableQrCustomizerModal
                    isOpen={isQrCustomizerOpen}
                    onClose={() => setIsQrCustomizerOpen(false)}
                    meja={selectedMejaForQr}
                    allMejas={mejas}
                    onSelectMeja={(m) => setSelectedMejaForQr(m)}
                    defaultCafeName={data.nama_cafe}
                    defaultWifiSsid={data.wifi_ssid}
                    defaultWifiPassword={data.wifi_password}
                />

                {/* Floating Feedback Notification */}
                {savedSuccess && (
                    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-900/30 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Identitas kafe &amp; footer berhasil diperbarui!</span>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
