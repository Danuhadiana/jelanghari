import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { rupiah } from '@/lib/format';
import {
  Coffee, Leaf, Flame, Sun, Moon, Sparkles, Utensils, Cookie, Star,
  ShoppingCart, X, Plus, Minus, Search, MapPin, Clock, Phone,
  Instagram, Check, ArrowRight, User, Users, LogIn, UserPlus, Menu,
  ChevronDown, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, Wifi, Zap, Copy, ExternalLink, ShieldCheck, Tag,
  Globe, HelpCircle, Layers, SlidersHorizontal, Settings, LayoutDashboard, QrCode,
  CalendarRange, ShoppingBag, Tv, CalendarCheck, Receipt, UtensilsCrossed,
  Package, ChefHat, BookOpen, LogOut, Truck, Ticket, FileSpreadsheet,
  RefreshCw, MessageCircle, ChevronLeft, ChevronRight, Trophy,
  Calendar, CreditCard, Wallet, Banknote
} from 'lucide-react';
import CustomerReservationModal from '@/Components/CustomerReservationModal';
import HelpCenterModal from '@/Components/HelpCenterModal';

interface Modifier {
  id: number;
  nama: string;
  harga_tambahan: number;
}

interface ModifierGroup {
  id: number;
  nama: string;
  wajib_pilih: boolean;
  min_pilihan: number;
  maks_pilihan: number;
  modifiers: Modifier[];
}

interface Varian {
  id: number;
  nama: string;
  harga_tambahan: number;
  is_default: boolean;
}

interface Produk {
  id: number;
  kategori_id: number;
  kode: string;
  nama: string;
  deskripsi: string | null;
  harga: number;
  foto: string | null;
  is_tersedia: boolean;
  is_favorite: boolean;
  station: string;
  varians: Varian[];
  modifier_groups?: ModifierGroup[];
  modifierGroups?: ModifierGroup[];
}

interface Kategori {
  id: number;
  nama: string;
  slug: string;
  ikon: string | null;
  produks: Produk[];
}

interface Meja {
  id: number;
  nomor: string;
  nama: string | null;
  area: string;
  kapasitas: number;
  status: string;
}

interface CartModifier {
  modifier_id: number;
  nama: string;
  harga: number;
}

interface CartItem {
  uid: string;
  produk_id: number;
  nama_produk: string;
  varian_id: number | null;
  nama_varian: string | null;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  catatan: string;
  modifiers: CartModifier[];
}

interface Props {
  kategoris: Kategori[];
  mejas: Meja[];
  activeMeja?: Meja | null;
  activeTableOrder?: {
    id: number;
    nomor_pesanan: string;
    nama_pelanggan: string;
    total: number;
    status_pesanan: string;
    status_pembayaran: string;
    created_at: string;
    items: Array<{
      nama_produk: string;
      nama_varian: string | null;
      jumlah: number;
      subtotal: number;
    }>;
  } | null;
  settings: Record<string, any>;
  isLoggedIn?: boolean;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  userTelepon?: string;
  customerPoin?: number;
  customerOrders?: Array<{
    id: number;
    nomor_pesanan: string;
    total: number;
    status_pesanan: string;
    created_at: string;
  }>;
}

// ── ACCURATE PRODUCT IMAGE DICTIONARY ──
const PRODUCT_ACCURATE_IMAGES: Record<string, string> = {
  // Signature
  'Kopi Susu Jelang Hari': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80',
  'Brown Sugar': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=700&q=80',
  'Lemonito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80',
  'Suwarni': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80',
  'Suwarno': 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=700&q=80',
  'Rum Vampire': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=700&q=80',

  // Coffee Based
  'Americano': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
  'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&w=700&q=80',
  'Espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=700&q=80',
  'Cafe Latte': 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=700&q=80',

  // Manual Brew
  'Vietnam Drip': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',

  // Non Coffee
  'Matcha / Thaitea': 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=700&q=80',
  'Redvelvet / Taro': 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=700&q=80',
  'Chocolate': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=700&q=80',
  'Mango Milk': 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=700&q=80',
  'Apple Mint': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80',
  'Lemon Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=80',
  'Black Tea': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
  'Lychee Tea': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80',
  'Lemongrass Tea': 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=700&q=80',

  // Tropical
  'Mojito': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
  'Rainy Mango': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80',
  'Sunrise': 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=700&q=80',
  'Dose of Magic': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=700&q=80',
  'Jus Markisa': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=700&q=80',

  // Traditional Foods
  'Nasi Goreng Rempah': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80',
  'Nasi Sup Gurame': 'https://images.unsplash.com/photo-1547928576-a4a33237cbc3?auto=format&fit=crop&w=700&q=80',
  'Nasi Ayam Penyet': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80',
  'Nasi Ayam Bakar Madu': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=700&q=80',
  'Nasi Jeruk Kulit Krispi': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80',

  // Noodles
  'Mie Goreng': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80',
  'Kwetiau Goreng': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=700&q=80',
  'Mie Tektek': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80',
  'Spicy Noodle': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=700&q=80',

  // Western
  'Chicken Steak (barbeque sauce)': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80',
  'Chicken Rice Blackpeper': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=700&q=80',
  'Spicy Chicken Wings': 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=700&q=80',
  'Spaghetti Bolognese': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?auto=format&fit=crop&w=700&q=80',
  'Carbonara': 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=700&q=80',
  'Omelet': 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=700&q=80',

  // Snacks
  'Sosis Kentang': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80',
  'Mix Plater': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=700&q=80',
  'Tahu Cabe Garam': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
  'Cireng': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=700&q=80',
  'Cirawang': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Singgor': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=700&q=80',
  'Pisgor / Pisbak': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80',
  'Roti Bakar Skippy': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=700&q=80',

  // Pastry & Dessert
  'Croffle': 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=700&q=80',
  'Cinnamon Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
  'Choc Au Pain': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
  'Roti Macan': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80',
  'Singkong Thailand': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80',
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'signature': 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80',
  'coffee-based': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80',
  'manual-brew': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
  'non-coffee': 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=700&q=80',
  'tropical': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=700&q=80',
  'traditional': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=700&q=80',
  'noodles': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80',
  'western': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=700&q=80',
  'snacks': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=700&q=80',
  'pastry-dessert': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
};

export default function Welcome({
  kategoris = [],
  mejas = [],
  activeMeja = null,
  activeTableOrder = null,
  settings = {},
  isLoggedIn = false,
  userName = '',
  userRole = '',
  userEmail = '',
  userTelepon = '',
  customerPoin = 0,
  customerOrders = [],
}: Props) {
  // Dark / Light Mode state for Homepage
  const [isDarkMode, setIsDarkMode] = useState(true);

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
  }, []);

  const toggleTheme = (target?: 'dark' | 'light') => {
    const next = target !== undefined ? target === 'dark' : !isDarkMode;
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode]);

  // Bilingual state (ID / EN) with persistence
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jh_lang');
      if (saved === 'en' || saved === 'id') return saved;
    }
    return 'id';
  });

  const changeLanguage = (newLang: 'id' | 'en') => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('jh_lang', newLang);
    }
  };

  const dict = {
    id: {
      searchPlaceholder: 'Cari menu kopi, makanan, minuman...',
      menuKafe: 'Katalog Menu',
      workspace: 'Workspace',
      tentang: 'Tentang Kami',
      cekPesanan: 'Cek Pesanan',
      pesananTitle: 'Pesanan',
      semuaMenu: 'Semua Menu',
      heroTitle1: 'Secangkir Tenang,',
      heroTitle2: 'Fokus Tanpa Batas.',
      heroDesc: 'Nikmati kopi spesial pilihan, hidangan lezat, dan ruang kerja berkecepatan tinggi di Jelang Hari Coffee & Workspace.',
      heroCtaMenu: 'Lihat Katalog Menu',
      heroCtaWorkspace: 'Fasilitas Workspace',
      profileMenu: 'Menu Profil',
      masukAkun: 'Masuk ke Akun',
      daftarAkun: 'Daftar Pelanggan',
      keluarAkun: 'Keluar Akun',
      halo: 'Halo,',
      mulaiDari: 'Mulai dari',
      pesan: 'Pesan',
      tambahPesanan: 'Tambah ke Pesanan',
      keranjang: 'Keranjang Pesanan',
      kosong: 'Keranjang masih kosong',
      dineIn: 'Dine-In (Makan di Tempat)',
      takeaway: 'Takeaway (Bungkus)',
      pilihMeja: 'Pilih Nomor Meja',
      namaPemesan: 'Nama Pemesan',
      noHp: 'No. WhatsApp / HP',
      metodeBayar: 'Metode Pembayaran',
      tunaiKasir: 'Tunai di Kasir',
      qris: 'QRIS (All E-Wallet / Bank)',
      transfer: 'Transfer Bank',
      voucher: 'Kode Promo / Voucher',
      catatanPesanan: 'Catatan Pesanan',
      kirimPesanan: 'Kirim Pesanan Sekarang',
      lacakPesanan: 'Lacak Status Pesanan',
      pilihanSeduhan: 'Pilihan Seduhan & Santapan',
      subPilihanSeduhan: 'Sentuh menu untuk memilih varian suhu, tingkat manis, dan modifier tambahan.',
      infoPemesanan: 'Informasi Pemesanan',
      tokoTutup: 'Toko Sedang Tutup',
      tokoTutupDesc: 'Pemesanan online sedang ditutup sementara.',
      katalogMode: 'Mode Katalog',
      mejaTerdeteksi: 'Meja Terdeteksi',
      detailBannerTitle: 'Detail Acara & Promosi',
      bacaDetail: 'Lihat Detail Lengkap',
      tutup: 'Tutup',
      salin: 'Salin',
      tersalin: 'Tersalin',
      instruksiBayar: 'Petunjuk Pembayaran:',
      pilihMetodeBayar: 'Pilih Metode Pembayaran',
      reservasiMejaRuang: 'Reservasi Meja & Ruang',
      panduanFaq: 'Buku Panduan & FAQ',
      setelanTema: 'Pengaturan & Tema',
      modeTerang: 'Mode Terang',
      modeGelap: 'Mode Gelap',
      totalTagihan: 'Total Tagihan',
      pajakPb1: 'Pajak (PB1)',
      diskonPromo: 'Potongan Diskon',
      gunakanVoucher: 'Gunakan',
      hapusVoucher: 'Hapus',
      tempatTerbatas: '⚡ Kuota & tempat duduk terbatas',
    },
    en: {
      searchPlaceholder: 'Search coffee, food, snacks, drinks...',
      menuKafe: 'Menu Catalog',
      workspace: 'Workspace',
      tentang: 'About Us',
      cekPesanan: 'Track Orders',
      pesananTitle: 'Orders',
      semuaMenu: 'All Items',
      heroTitle1: 'A Calm Brew,',
      heroTitle2: 'Limitless Focus.',
      heroDesc: 'Enjoy artisanal coffee, comfort food, and productive high-speed workspace at Jelang Hari Coffee & Workspace.',
      heroCtaMenu: 'Explore Menu',
      heroCtaWorkspace: 'Workspace Perks',
      profileMenu: 'Profile Menu',
      masukAkun: 'Sign In',
      daftarAkun: 'Sign Up',
      keluarAkun: 'Sign Out',
      halo: 'Hello,',
      mulaiDari: 'From',
      pesan: 'Order',
      tambahPesanan: 'Add to Order',
      keranjang: 'Order Cart',
      kosong: 'Your cart is empty',
      dineIn: 'Dine-In',
      takeaway: 'Takeaway',
      pilihMeja: 'Select Table Number',
      namaPemesan: 'Customer Name',
      noHp: 'WhatsApp / Phone No',
      metodeBayar: 'Payment Method',
      tunaiKasir: 'Cash at Cashier',
      qris: 'QRIS (All E-Wallet / Bank)',
      transfer: 'Bank Transfer',
      voucher: 'Promo / Voucher Code',
      catatanPesanan: 'Special Order Notes',
      kirimPesanan: 'Place Order Now',
      lacakPesanan: 'Track Order Status',
      pilihanSeduhan: 'Handcrafted Brews & Food',
      subPilihanSeduhan: 'Tap any menu item to customize temperature, sweetness, and toppings.',
      infoPemesanan: 'Order Information',
      tokoTutup: 'Store Closed',
      tokoTutupDesc: 'Online ordering is currently closed.',
      katalogMode: 'Catalog Only',
      mejaTerdeteksi: 'Table Detected',
      detailBannerTitle: 'Event & Promotion Details',
      bacaDetail: 'Read Full Story',
      tutup: 'Close',
      salin: 'Copy',
      tersalin: 'Copied',
      instruksiBayar: 'Payment Instructions:',
      pilihMetodeBayar: 'Select Payment Method',
      reservasiMejaRuang: 'Reserve Table & Room',
      panduanFaq: 'User Guide & FAQ',
      setelanTema: 'Settings & Theme',
      modeTerang: 'Light Mode',
      modeGelap: 'Dark Mode',
      totalTagihan: 'Grand Total',
      pajakPb1: 'Tax (PB1)',
      diskonPromo: 'Discount Promo',
      gunakanVoucher: 'Apply',
      hapusVoucher: 'Remove',
      tempatTerbatas: '⚡ Limited seating available',
    },
  }[lang];

  // Nama toko bersih (tidak menduplikasi Coffee & Workspace di samping nama karena sudah ada di bawah judulnya)
  const cleanStoreName = useMemo(() => {
    const raw = settings?.nama_cafe || 'Jelang Hari';
    return raw.replace(/\s*(?:coffee\s*&?\s*workspace|kopi\s*&?\s*ruang\s*kerja).*$/i, '').trim() || 'Jelang Hari';
  }, [settings?.nama_cafe]);

  // Sub-judul / tagline rapi (mengganti pipe kaku dengan bullet dot elegan & mencegah terpotong)
  const formattedTagline = useMemo(() => {
    const raw = settings?.tagline || 'Coffee • Workspace • Community';
    return raw
      .replace(/\s*\|\s*/g, ' • ')
      .trim();
  }, [settings?.tagline]);

  // WiFi Copy & WhatsApp helpers for Footer & Hero
  const [wifiCopied, setWifiCopied] = useState(false);
  const copyWifiPassword = () => {
    const pwd = settings?.wifi_password || 'ngopidulu123';
    navigator.clipboard.writeText(pwd);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  const getWhatsAppUrl = (phone?: string, text?: string) => {
    let clean = (phone || '0821-1594-1156').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    const query = text ? `?text=${encodeURIComponent(text)}` : '';
    return `https://wa.me/${clean}${query}`;
  };

  // Sticky Navbar & Profile Dropdown
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const menuSectionRef = useRef<HTMLElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── REALTIME STORE STATUS STATE & POLLING ──
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(settings.is_toko_buka !== false);
  const [jamBuka, setJamBuka] = useState<string>(settings.jam_buka || '07:30');
  const [jamTutup, setJamTutup] = useState<string>(settings.jam_tutup || '22:00');
  const [pesanTokoTutup, setPesanTokoTutup] = useState<string>(settings.pesan_toko_tutup || '');

  // Poll store operational status every 10 seconds and on tab visibility/focus
  // This guarantees customers staying on the site automatically see the store open at 07:30
  // without needing to refresh their browser.
  useEffect(() => {
    let isMounted = true;

    const syncStoreStatus = async () => {
      try {
        const res = await fetch('/api/store-status', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        setIsStoreOpen(Boolean(data.is_open));
        if (data.jam_buka) setJamBuka(data.jam_buka);
        if (data.jam_tutup) setJamTutup(data.jam_tutup);
        if (data.pesan !== undefined) setPesanTokoTutup(data.pesan);
      } catch {
        // silent network error
      }
    };

    syncStoreStatus();
    const intervalId = setInterval(syncStoreStatus, 10000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        syncStoreStatus();
      }
    };

    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('focus', handleFocusOrVisible);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('focus', handleFocusOrVisible);
    };
  }, []);

  // ── CUSTOMER SETTINGS & PROFILE STATE ──
  const [customerSettingsOpen, setCustomerSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'orders' | 'preferences'>('profile');

  // Confirmation Popups State
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [confirmProfileOpen, setConfirmProfileOpen] = useState(false);
  const [confirmPasswordOpen, setConfirmPasswordOpen] = useState(false);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userName || '');
  const [editEmail, setEditEmail] = useState(userEmail || '');
  const [editTelepon, setEditTelepon] = useState(userTelepon || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sync state if props change
  useEffect(() => {
    if (userName) setEditName(userName);
    if (userEmail) setEditEmail(userEmail);
    if (userTelepon) setEditTelepon(userTelepon);
  }, [userName, userEmail, userTelepon]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmProfileOpen(true);
  };

  const executeSaveProfile = () => {
    setConfirmProfileOpen(false);
    setSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    router.patch(
      '/profile',
      {
        name: editName,
        email: editEmail,
        telepon: editTelepon,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSavingProfile(false);
          setProfileSuccessMsg(lang === 'id' ? 'Profil Anda berhasil diperbarui!' : 'Your profile has been updated!');
          setTimeout(() => setProfileSuccessMsg(''), 4000);
        },
        onError: (errors: any) => {
          setSavingProfile(false);
          const firstErr = Object.values(errors)[0] as string;
          setProfileErrorMsg(firstErr || 'Gagal memperbarui profil.');
        },
      }
    );
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirmation) {
      setPasswordErrorMsg(lang === 'id' ? 'Konfirmasi kata sandi tidak cocok.' : 'Password confirmation does not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordErrorMsg(lang === 'id' ? 'Kata sandi minimal 8 karakter.' : 'Password must be at least 8 characters.');
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

    router.put(
      '/password',
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSavingPassword(false);
          setPasswordSuccessMsg(lang === 'id' ? 'Kata sandi berhasil diperbarui!' : 'Password successfully updated!');
          setCurrentPassword('');
          setNewPassword('');
          setNewPasswordConfirmation('');
          setTimeout(() => setPasswordSuccessMsg(''), 4000);
        },
        onError: (errors: any) => {
          setSavingPassword(false);
          const firstErr = Object.values(errors)[0] as string;
          setPasswordErrorMsg(firstErr || 'Gagal memperbarui kata sandi.');
        },
      }
    );
  };

  const executeLogout = () => {
    setConfirmLogoutOpen(false);
    router.post('/logout');
  };

  // Category Filtering & Search
  const [activeKat, setActiveKat] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const allProducts = kategoris.flatMap(k =>
    (k.produks || []).map(p => ({
      ...p,
      _kategori: k,
      _modGroups: p.modifier_groups || p.modifierGroups || [],
    }))
  );

  const filteredProducts = allProducts.filter(p => {
    const matchCat = activeKat === 'all' || p.kategori_id === activeKat;
    const matchSearch =
      !search ||
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase()) ||
      (p.deskripsi && p.deskripsi.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch && p.is_tersedia;
  });

  // Cart State (Persisted in localStorage so items survive guest login/registration)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('jh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('jh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync cart to localStorage', e);
    }
  }, [cart]);

  const [cartOpen, setCartOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ── HEADLINE & EVENT AUTO SLIDER STATE (DYNAMIC FROM SETTINGS) ──
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);

  const bannerSlides = useMemo(() => {
    let rawBanners: any[] = [];
    if (settings?.homepage_banners) {
      try {
        const parsed = typeof settings.homepage_banners === 'string'
          ? JSON.parse(settings.homepage_banners)
          : settings.homepage_banners;
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawBanners = parsed;
        }
      } catch (e) {
        console.error('Failed to parse homepage_banners in Welcome.tsx', e);
      }
    }

    if (rawBanners.length === 0) {
      rawBanners = [
        {
          id: 'banner_nobar',
          badge: settings?.banner_1_badge || '🔴 EVENT NOBAR AKBAR',
          title: settings?.banner_1_title || 'Nobar Persib vs Persija — Rasakan Atmosfer Serunya di Jelang Hari!',
          tanggal_waktu: 'Minggu, 18 Okt 2026 • 19:30 WIB',
          desc: settings?.banner_1_desc || 'Layar lebar projector HD, audio menggelegar, dan paket cemilan nobar hemat. Amankan meja bareng temanmu sekarang!',
          konten_lengkap: 'Saksikan duel bergengsi El Clasico Indonesia antara Persib Bandung vs Persija Jakarta di Jelang Hari Coffee & Workspace. Nikmati suasana nobar seru dengan fasilitas layar proyektor lebar 150 inci beresolusi HD, sound system menggelegar, ruangan ber-AC nyaman, serta paket hemat cemilan dan kopi khas Jelang Hari. Tempat duduk terbatas, disarankan melakukan reservasi meja lebih awal bersama teman-teman komunitasmu!',
          image: settings?.banner_1_image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          action_text: settings?.banner_1_action_text || 'Reservasi Meja Nobar',
          action_type: 'reservasi',
          action_url: '',
          is_aktif: true,
        },
        {
          id: 'banner_homemade',
          badge: settings?.banner_2_badge || '✨ FRESH DARI DAPUR',
          title: settings?.banner_2_title || 'Homemade Kitchen Pastry & Cookies Hangat Setiap Hari',
          tanggal_waktu: 'Fresh Setiap Hari • Pukul 08:00 WIB',
          desc: settings?.banner_2_desc || 'Dibuat fresh dari bahan premium pilihan tanpa bahan pengawet. Teman terbaik secangkir Kopi Susu Jelang Hari.',
          konten_lengkap: 'Dapur Jelang Hari memproduksi sajian pastry, roti bakar autentik, croissant lembut, dan cookies buatan tangan setiap pagi. Diracik khusus oleh baker internal kami dengan mentega kualitas premium tanpa bahan pengawet sintetik. Sangat cocok dinikmati sembari produktif bekerja di ruang workspace kami ataupun santai sore bersama teman.',
          image: settings?.banner_2_image || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
          action_text: settings?.banner_2_action_text || 'Lihat Menu Homemade',
          action_type: 'menu',
          action_url: '',
          is_aktif: true,
        },
        {
          id: 'banner_story',
          badge: settings?.banner_3_badge || '📸 KOMUNITAS & STORY',
          title: settings?.banner_3_title || 'Bagikan Momen Santaimu & Tag @Jelanghari_newchapter',
          tanggal_waktu: 'Edisi Minggu Ini • Tag & Menangkan',
          desc: settings?.banner_3_desc || 'Tag story kami di Instagram untuk kesempatan memenangkan voucher ngopi mingguan & di-repost ke feed Jelang Hari.',
          konten_lengkap: 'Setiap pekan, Jelang Hari mengapresiasi foto dan cerita terbaik dari pengunjung setia kami! Cukup abadikan momen ngopi, kerja, atau diskusi santaimu di Jelang Hari Coffee & Workspace, upload ke Instagram Story atau Reels, lalu tag akun resmi kami @Jelanghari_newchapter. Setiap hari Senin, tim kami akan memilih 3 cerita paling inspiratif untuk mendapatkan Voucher Ngopi Gratis!',
          image: settings?.banner_3_image || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
          action_text: settings?.banner_3_action_text || 'Kunjungi Instagram',
          action_type: 'link',
          action_url: settings?.banner_3_link || 'https://instagram.com/Jelanghari_newchapter',
          is_aktif: true,
        },
      ];
    }

    const colorPresets = [
      { accent: 'from-blue-600/90 to-indigo-950/90', badge: 'bg-blue-500 text-white border-blue-400/40' },
      { accent: 'from-amber-600/90 to-stone-950/90', badge: 'bg-amber-500 text-white border-amber-400/40' },
      { accent: 'from-pink-600/90 to-purple-950/90', badge: 'bg-pink-500 text-white border-pink-400/40' },
      { accent: 'from-emerald-600/90 to-teal-950/90', badge: 'bg-emerald-500 text-white border-emerald-400/40' },
    ];

    return rawBanners
      .filter((b: any) => b.is_aktif !== false)
      .map((b: any, index: number) => {
        const color = colorPresets[index % colorPresets.length];
        return {
          id: b.id || index + 1,
          badge: b.badge || 'PROMO',
          title: b.title || 'Promo Jelang Hari',
          tanggal_waktu: b.tanggal_waktu || '',
          desc: b.desc || '',
          konten_lengkap: b.konten_lengkap || b.desc || '',
          image: b.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
          actionText: b.action_text || 'Lihat Detail',
          actionType: b.action_type || 'menu',
          actionUrl: b.action_url || '',
          accentColor: color.accent,
          badgeColor: color.badge,
          rawItem: b,
          onAction: (e?: React.MouseEvent) => {
            if (e) e.stopPropagation();
            if (b.action_type === 'reservasi') {
              setReservationOpen(true);
            } else if (b.action_type === 'link' && b.action_url) {
              window.open(b.action_url, '_blank');
            } else if (b.action_type === 'menu') {
              menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else if (b.action_url) {
              window.location.href = b.action_url;
            } else {
              menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
          },
        };
      });
  }, [settings]);

  useEffect(() => {
    if (sliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderPaused, bannerSlides.length]);

  const cartCount = cart.reduce((sum, item) => sum + item.jumlah, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // ── BRAND NEW SPOTLIGHT SEARCH SYSTEM (FROM SCRATCH) ──
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [spotlightCat, setSpotlightCat] = useState<number | 'all'>('all');
  const spotlightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => {
        spotlightInputRef.current?.focus();
      }, 60);
    }
  }, [searchModalOpen]);

  const spotlightResults = allProducts.filter(p => {
    const matchCat = spotlightCat === 'all' || p.kategori_id === spotlightCat;
    const q = spotlightQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      p.nama.toLowerCase().includes(q) ||
      p.kode.toLowerCase().includes(q) ||
      (p.deskripsi && p.deskripsi.toLowerCase().includes(q)) ||
      ((p as any)._kategori?.nama && (p as any)._kategori.nama.toLowerCase().includes(q));
    return matchCat && matchQuery && p.is_tersedia;
  });

  // Profile Mega Dropdown Search & Help Modal State
  const [menuSearch, setMenuSearch] = useState('');
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Keyboard Shortcuts (Esc to close, Ctrl/Cmd+K to open Spotlight Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchModalOpen) { setSearchModalOpen(false); return; }
        if (confirmLogoutOpen) { setConfirmLogoutOpen(false); return; }
        if (confirmProfileOpen) { setConfirmProfileOpen(false); return; }
        if (confirmPasswordOpen) { setConfirmPasswordOpen(false); return; }
        if (customerSettingsOpen) { setCustomerSettingsOpen(false); return; }
        if (helpModalOpen) { setHelpModalOpen(false); return; }
        if (reservationOpen) { setReservationOpen(false); return; }
        if (cartOpen) { setCartOpen(false); return; }
        if (profileDropdownOpen) { setProfileDropdownOpen(false); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          if (target.id === 'spotlight-search-input') return;
        }
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
        setSpotlightQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, confirmLogoutOpen, confirmProfileOpen, confirmPasswordOpen, customerSettingsOpen, helpModalOpen, reservationOpen, cartOpen, profileDropdownOpen]);

  // Operational & Customer Navigation Groups for Profile Dropdown (SaaS Standard)
  const navGroups = [
    {
      title: 'POS & KASIR',
      items: [
        { label: 'Kasir POS', href: '/kasir', icon: ShoppingBag, desc: 'Pencatatan pesanan & kasir', targetRole: ['owner', 'manager', 'kasir'] },
        { label: 'Kitchen KDS', href: '/kds', icon: Tv, desc: 'Display pesanan dapur & bar', targetRole: ['owner', 'manager', 'dapur', 'barista', 'kitchen'] },
        { label: 'Shift Kasir', href: '/shift', icon: CalendarCheck, desc: 'Buka & tutup shift kasir', targetRole: ['owner', 'manager', 'kasir'] },
      ]
    },
    {
      title: 'OPERASIONAL & MENU',
      items: [
        { label: 'Dashboard Analisis', href: '/dashboard', icon: LayoutDashboard, desc: 'Analitik & ringkasan omzet', targetRole: ['owner', 'manager'] },
        { label: 'Reservasi Meja', href: '/reservasi', icon: CalendarRange, badge: 'Booking Meja', desc: 'Jadwal & reservasi meja', targetRole: ['owner', 'manager'] },
        { label: 'Riwayat Transaksi', href: '/transaksi', icon: Receipt, desc: 'Daftar struk & transaksi', targetRole: ['owner', 'manager', 'kasir'] },
        { label: 'Katalog Menu Produk', href: '/produk', icon: UtensilsCrossed, desc: 'Katalog & stok menu kafe', targetRole: ['owner', 'manager'] },
        { label: 'Kategori Menu', href: '/kategori', icon: Layers, desc: 'Pengelompokan menu kafe', targetRole: ['owner', 'manager'] },
      ]
    },
    {
      title: 'INVENTORI & RESEP',
      items: [
        { label: 'Stok Bahan Baku', href: '/stok/bahan-baku', icon: Package, desc: 'Pantau sisa stok bahan', targetRole: ['owner', 'manager'] },
        { label: 'Resep Menu (BOM)', href: '/stok/resep', icon: ChefHat, desc: 'Formula bahan per porsi', targetRole: ['owner', 'manager'] },
        { label: 'Supplier Bahan', href: '/stok/supplier', icon: Truck, desc: 'Kontak supplier & vendor', targetRole: ['owner', 'manager'] },
        { label: 'Kulakan / Faktur', href: '/stok/pembelian', icon: ShoppingCart, desc: 'Catat belanja bahan baku', targetRole: ['owner', 'manager'] },
      ]
    },
    {
      title: 'CRM & SISTEM POIN',
      items: [
        { label: 'Pelanggan & CRM', href: '/customer', icon: Users, badge: 'Sistem Poin', desc: 'Database pelanggan & poin', targetRole: ['owner', 'manager'] },
        { label: 'Portal Member User', href: '/user/dashboard', icon: LayoutDashboard, badge: 'Poin Member', desc: 'Dashboard khusus member', targetRole: ['owner', 'manager', 'pelanggan'] },
        { label: 'Voucher & Kupon', href: '/voucher', icon: Ticket, desc: 'Kupon promo & diskon', targetRole: ['owner', 'manager'] },
      ]
    },
    {
      title: 'LAPORAN & SISTEM',
      items: [
        { label: 'Laporan Penjualan', href: '/laporan/harian', icon: FileSpreadsheet, desc: 'Rekapitulasi keuangan', targetRole: ['owner', 'manager'] },
        { label: 'Presensi Karyawan', href: '/absensi', icon: CalendarCheck, desc: 'Clock-in & presensi mandiri', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'dapur', 'staff', 'waiter'] },
        { label: 'Kelola Rekap Absensi', href: '/absensi/admin', icon: CalendarCheck, desc: 'Rekap kerja & izin karyawan', targetRole: ['owner', 'manager'] },
        { label: 'Kelola Pengguna', href: '/user', icon: Users, desc: 'Akses akun kasir & barista', targetRole: ['owner'] },
        { label: 'Pengaturan Sistem', href: '/pengaturan', icon: Settings, desc: 'Profil kafe & konfigurasi POS', targetRole: ['owner'] },
      ]
    },
    {
      title: 'LAYANAN & TAMU',
      items: [
        { label: 'Cek Status Pesanan', href: '#cek-pesanan', icon: Search, desc: 'Lacak proses sajian pesanan', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'pelanggan'] },
        { label: 'Reservasi Workspace', href: '#reservasi-meja', icon: CalendarRange, desc: 'Booking meja & ruang fokus', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'pelanggan'] },
        { label: 'Pengaturan Akun', href: '#pengaturan-akun', icon: Settings, desc: 'Profil, bahasa & preferensi', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'pelanggan'] },
        { label: 'Buku Panduan & SOP', href: '#panduan', icon: BookOpen, badge: 'Panduan', desc: 'Tutorial & glosarium istilah', targetRole: ['owner', 'manager', 'kasir', 'barista', 'kitchen', 'pelanggan'] },
      ]
    }
  ];

  const filteredNavGroups = navGroups.map(group => {
    const allowed = (group.items || []).filter(item => {
      if (userRole === 'owner') return true;
      if (!item.targetRole) return true;
      return item.targetRole.includes(userRole || 'pelanggan');
    });

    const searched = menuSearch.trim() === ''
      ? allowed
      : allowed.filter(item => 
          (item.label || '').toLowerCase().includes(menuSearch.toLowerCase()) || 
          (item.desc || '').toLowerCase().includes(menuSearch.toLowerCase())
        );

    return { ...group, items: searched };
  }).filter(group => group.items.length > 0);

  // Customization Modal State
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [selectedVarianId, setSelectedVarianId] = useState<number | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [orderQty, setOrderQty] = useState(1);
  const [itemNote, setItemNote] = useState('');

  const openCustomizeModal = (product: Produk) => {
    setSelectedProduct(product);
    const defaultVarian = product.varians?.find(v => v.is_default) ?? product.varians?.[0];
    setSelectedVarianId(defaultVarian?.id ?? null);
    setSelectedModifiers({});
    setOrderQty(1);
    setItemNote('');
  };

  const getActiveModGroups = (product: Produk | null): ModifierGroup[] => {
    if (!product) return [];
    return product.modifier_groups || product.modifierGroups || [];
  };

  const calculateItemPrice = (): number => {
    if (!selectedProduct) return 0;
    const base = selectedProduct.harga;
    const varian = selectedProduct.varians?.find(v => v.id === selectedVarianId);
    const varExtra = varian ? varian.harga_tambahan : 0;

    let modExtra = 0;
    const groups = getActiveModGroups(selectedProduct);
    for (const group of groups) {
      const chosenIds = selectedModifiers[group.id] || [];
      for (const mId of chosenIds) {
        const mod = group.modifiers.find(m => m.id === mId);
        if (mod) modExtra += mod.harga_tambahan;
      }
    }
    return base + varExtra + modExtra;
  };

  const handleModifierToggle = (group: ModifierGroup, modId: number) => {
    setSelectedModifiers(prev => {
      const current = prev[group.id] || [];
      const isSelected = current.includes(modId);

      if (group.maks_pilihan === 1) {
        return { ...prev, [group.id]: isSelected ? [] : [modId] };
      }

      if (isSelected) {
        return { ...prev, [group.id]: current.filter(id => id !== modId) };
      } else {
        if (group.maks_pilihan > 0 && current.length >= group.maks_pilihan) return prev;
        return { ...prev, [group.id]: [...current, modId] };
      }
    });
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const unitPrice = calculateItemPrice();
    const varian = selectedProduct.varians?.find(v => v.id === selectedVarianId);
    const groups = getActiveModGroups(selectedProduct);

    const mods: CartModifier[] = [];
    for (const group of groups) {
      const chosenIds = selectedModifiers[group.id] || [];
      for (const mId of chosenIds) {
        const mod = group.modifiers.find(m => m.id === mId);
        if (mod) {
          mods.push({ modifier_id: mod.id, nama: mod.nama, harga: mod.harga_tambahan });
        }
      }
    }

    const modKey = mods.map(m => m.modifier_id).sort().join('-');
    const uid = `${selectedProduct.id}_${selectedVarianId || 'novar'}_${modKey}_${itemNote.trim()}`;

    setCart(prev => {
      const existing = prev.find(i => i.uid === uid);
      if (existing) {
        const newQty = existing.jumlah + orderQty;
        return prev.map(i =>
          i.uid === uid ? { ...i, jumlah: newQty, subtotal: newQty * unitPrice } : i
        );
      }
      return [
        ...prev,
        {
          uid,
          produk_id: selectedProduct.id,
          nama_produk: selectedProduct.nama,
          varian_id: selectedVarianId,
          nama_varian: varian ? varian.nama : null,
          harga_satuan: unitPrice,
          jumlah: orderQty,
          subtotal: unitPrice * orderQty,
          catatan: itemNote,
          modifiers: mods,
        },
      ];
    });

    setSelectedProduct(null);
    setCartOpen(true);
  };

  const updateCartQty = (uid: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.uid !== uid) return item;
          const nextQty = item.jumlah + delta;
          if (nextQty <= 0) return null;
          return { ...item, jumlah: nextQty, subtotal: nextQty * item.harga_satuan };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Checkout State
  const [tipePesanan, setTipePesanan] = useState<'dine_in' | 'take_away'>('dine_in');
  const [selectedMejaId, setSelectedMejaId] = useState<string>(activeMeja ? String(activeMeja.id) : '');
  const [namaPelanggan, setNamaPelanggan] = useState(userName || '');
  const [teleponPelanggan, setTeleponPelanggan] = useState('');

  // Dynamic payment methods from admin settings (linked to settings.kasir_metode_pembayaran_custom)
  const availablePaymentMethods = useMemo(() => {
    let customList: any[] = [];
    if (settings?.kasir_metode_pembayaran_custom) {
      try {
        const parsed = typeof settings.kasir_metode_pembayaran_custom === 'string'
          ? JSON.parse(settings.kasir_metode_pembayaran_custom)
          : settings.kasir_metode_pembayaran_custom;
        if (Array.isArray(parsed) && parsed.length > 0) {
          customList = parsed.filter((m: any) => m.is_aktif !== false);
        }
      } catch (e) {
        console.error('Error parsing payment methods in customer front-end', e);
      }
    }

    if (customList.length === 0) {
      customList = [
        { id: 'qris', nama: 'QRIS', tipe: 'non_cash', keterangan: 'Scan semua bank / e-wallet (BCA, GoPay, OVO, ShopeePay, DANA)', is_aktif: true },
        { id: 'bca', nama: 'Debit / Transfer BCA', tipe: 'non_cash', keterangan: 'BCA 1234567890 a.n Jelang Hari', is_aktif: true },
        { id: 'mandiri', nama: 'Debit / Transfer Mandiri', tipe: 'non_cash', keterangan: 'Mandiri 1310012345678 a.n Jelang Hari', is_aktif: true },
        { id: 'bri', nama: 'Transfer BRI', tipe: 'non_cash', keterangan: 'BRI 012301000123456 a.n Jelang Hari', is_aktif: true },
        { id: 'bni', nama: 'Transfer BNI', tipe: 'non_cash', keterangan: 'BNI 0987654321 a.n Jelang Hari', is_aktif: true },
        { id: 'jago', nama: 'Bank Jago', tipe: 'non_cash', keterangan: 'Kantong Jago: 1029384756 a.n Jelang Hari', is_aktif: true },
        { id: 'gopay', nama: 'GoPay', tipe: 'non_cash', keterangan: 'No. GoPay: 0821-1594-1156 a.n Jelang Hari', is_aktif: true },
        { id: 'shopeepay', nama: 'ShopeePay', tipe: 'non_cash', keterangan: 'No. ShopeePay: 0821-1594-1156 a.n Jelang Hari', is_aktif: true },
        { id: 'ovo', nama: 'OVO', tipe: 'non_cash', keterangan: 'No. OVO: 0821-1594-1156 a.n Jelang Hari', is_aktif: true },
        { id: 'dana', nama: 'DANA', tipe: 'non_cash', keterangan: 'No. DANA: 0821-1594-1156 a.n Jelang Hari', is_aktif: true },
        { id: 'cash', nama: 'Tunai di Kasir', tipe: 'cash', keterangan: 'Bayar langsung uang tunai di kasir', is_aktif: true },
      ];
    }
    return customList;
  }, [settings?.kasir_metode_pembayaran_custom]);

  const [metodeBayar, setMetodeBayar] = useState<string>('qris');
  const [copiedAccountNo, setCopiedAccountNo] = useState(false);
  const [catatanPesanan, setCatatanPesanan] = useState('');

  // Auto-set meja jika pelanggan scan barcode meja
  useEffect(() => {
    if (activeMeja) {
      setSelectedMejaId(String(activeMeja.id));
      setTipePesanan('dine_in');
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('meja') || urlParams.get('table');
      if (tableParam) {
        const found = mejas.find(m => String(m.nomor) === String(tableParam) || String(m.id) === String(tableParam));
        if (found) {
          setSelectedMejaId(String(found.id));
          setTipePesanan('dine_in');
        }
      }
    }
  }, [activeMeja, mejas]);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState<{
    kode: string;
    tipe: 'persen' | 'nominal';
    nilai: number;
    diskonNominal: number;
  } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const getCsrfToken = (): string => {
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (meta?.content) return meta.content;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return '';
  };

  // ── MIDTRANS SNAP CLIENT HELPER (QRIS OTOMATIS) ──
  const loadSnapScript = (clientKey: string, isProduction: boolean): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).snap) {
        return resolve((window as any).snap);
      }
      const existingScript = document.getElementById('midtrans-snap-script');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement('script');
      script.id = 'midtrans-snap-script';
      script.src = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
      script.setAttribute('data-client-key', clientKey);
      script.onload = () => resolve((window as any).snap);
      script.onerror = () => reject(new Error('Gagal memuat Snap Midtrans'));
      document.body.appendChild(script);
    });
  };

  const triggerMidtransSnap = async (snapToken: string, clientKey?: string, isProd?: boolean, pesananObj?: any) => {
    try {
      const snapClientKey = clientKey || settings?.midtrans_client_key || '';
      const snapIsProd = isProd !== undefined ? isProd : settings?.midtrans_is_production;

      const snap = await loadSnapScript(snapClientKey, !!snapIsProd);
      if (snap && snap.pay) {
        snap.pay(snapToken, {
          onSuccess: function (result: any) {
            console.log('Midtrans Snap Success:', result);
            refreshMyOrders();
          },
          onPending: function (result: any) {
            console.log('Midtrans Snap Pending:', result);
            refreshMyOrders();
          },
          onError: function (result: any) {
            console.error('Midtrans Snap Error:', result);
          },
          onClose: function () {
            console.log('Midtrans Snap Closed');
            refreshMyOrders();
          },
        });
      }
    } catch (e: any) {
      console.error('Failed to trigger Midtrans Snap:', e);
    }
  };

  const handlePayWithMidtrans = async (nomorPesanan: string) => {
    try {
      const res = await fetch(`/api/pesanan/${encodeURIComponent(nomorPesanan)}/snap-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
      });
      const data = await res.json();
      if (data.snap_token) {
        triggerMidtransSnap(data.snap_token, data.client_key, data.is_production);
      } else {
        alert(data.message || 'Gagal memuat barcode pembayaran QRIS.');
      }
    } catch (err: any) {
      alert(err.message || 'Koneksi ke server terputus.');
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    setVoucherMsg(null);
    try {
      const csrf = getCsrfToken();
      const res = await fetch('/api/voucher/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf,
          'X-XSRF-TOKEN': csrf,
          Accept: 'application/json',
        },
        body: JSON.stringify({ kode: voucherCode.trim(), _token: csrf }),
      });
      const data = await res.json();
      if (res.ok && data.valid && data.voucher) {
        const v = data.voucher;
        let disc = 0;
        if (v.tipe === 'persen') {
          disc = Math.round((cartSubtotal * v.nilai) / 100);
          if (v.maksimal_diskon && disc > v.maksimal_diskon) disc = v.maksimal_diskon;
        } else {
          disc = v.nilai;
        }
        setVoucherApplied({
          kode: v.kode,
          tipe: v.tipe,
          nilai: v.nilai,
          diskonNominal: Math.min(disc, cartSubtotal),
        });
        setVoucherMsg({ text: `Voucher ${v.kode} aktif!`, isError: false });
      } else {
        setVoucherMsg({ text: data.message || 'Voucher tidak valid.', isError: true });
        setVoucherApplied(null);
      }
    } catch {
      setVoucherMsg({ text: 'Gagal mengecek voucher.', isError: true });
    } finally {
      setVoucherLoading(false);
    }
  };

  const removeVoucher = () => {
    setVoucherApplied(null);
    setVoucherCode('');
    setVoucherMsg(null);
  };

  // Calculations
  const pajakPersen = Number(settings.pajak_persen ?? 10);
  const diskonTotal = voucherApplied ? voucherApplied.diskonNominal : 0;
  const taxableSubtotal = Math.max(0, cartSubtotal - diskonTotal);
  const pajakNominal = Math.round((taxableSubtotal * pajakPersen) / 100);
  const grandTotal = taxableSubtotal + pajakNominal;

  // Submit Order
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    if (!isLoggedIn && settings?.guest_checkout_enabled !== '1') {
      setAuthModalOpen(true);
      return;
    }
    if (!isStoreOpen) {
      alert(pesanTokoTutup || `Maaf, pemesanan online saat ini sedang ditutup. Toko buka pukul ${jamBuka} – ${jamTutup} WIB.`);
      return;
    }
    if (tipePesanan === 'dine_in' && !selectedMejaId) {
      alert('Silakan pilih nomor meja untuk pesanan makan di tempat (Dine-In).');
      return;
    }
    if (!namaPelanggan.trim()) {
      alert('Silakan isi nama pemesan.');
      return;
    }
    if (!teleponPelanggan.trim()) {
      alert('Silakan isi nomor WhatsApp / Telepon untuk konfirmasi pesanan.');
      return;
    }

    setSubmittingOrder(true);
    try {
      const csrf = getCsrfToken();
      const payload = {
        _token: csrf,
        tipe_pesanan: tipePesanan,
        meja_id: tipePesanan === 'dine_in' ? Number(selectedMejaId) : null,
        nama_pelanggan: namaPelanggan.trim(),
        telepon_pelanggan: teleponPelanggan.trim(),
        subtotal: cartSubtotal,
        diskon: diskonTotal,
        voucher_kode: voucherApplied?.kode || null,
        pajak_persen: pajakPersen,
        pajak_nominal: pajakNominal,
        total: grandTotal,
        metode_pembayaran: metodeBayar,
        catatan: catatanPesanan.trim() || null,
        items: cart.map(i => ({
          produk_id: i.produk_id,
          nama_produk: i.nama_produk,
          varian_id: i.varian_id,
          nama_varian: i.nama_varian,
          harga_satuan: i.harga_satuan,
          jumlah: i.jumlah,
          subtotal: i.subtotal,
          catatan_khusus: i.catatan || null,
          modifiers: i.modifiers,
        })),
      };

      const res = await fetch('/api/pesan-online', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf,
          'X-XSRF-TOKEN': csrf,
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.require_login) {
          setAuthModalOpen(true);
          return;
        }
        throw new Error(data.message || 'Gagal membuat pesanan');
      }

      setOrderSuccess(data.pesanan);
      setCart([]);
      setCartOpen(false);
      removeVoucher();

      // Buka popup Midtrans Snap otomatis jika menggunakan QRIS dinamis
      if (data.snap_token) {
        setTimeout(() => {
          triggerMidtransSnap(data.snap_token, data.client_key, data.is_production, data.pesanan);
        }, 300);
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // ── PERSONAL ORDER HUB (AUTOMATIC LOGGED-IN ORDER TRACKER - ZERO SEARCH) ──
  const [trackOpen, setTrackOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>(customerOrders || []);
  const [orderHubTab, setOrderHubTab] = useState<'active' | 'history'>('active');
  const [selectedOrderIdx, setSelectedOrderIdx] = useState<number>(0);
  const [orderHubLoading, setOrderHubLoading] = useState(false);
  const [copiedTrackNo, setCopiedTrackNo] = useState(false);

  useEffect(() => {
    if (customerOrders && Array.isArray(customerOrders)) {
      setUserOrders(customerOrders);
    }
  }, [customerOrders]);

  const refreshMyOrders = async () => {
    setOrderHubLoading(true);
    try {
      const res = await fetch('/api/my-orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setUserOrders(data.orders);
        }
      }
    } catch {
      // ignore
    } finally {
      setOrderHubLoading(false);
    }
  };

  useEffect(() => {
    if (trackOpen && isLoggedIn) {
      refreshMyOrders();
    }
  }, [trackOpen, isLoggedIn]);

  const activeOrders = userOrders.filter(o => ['menunggu', 'proses', 'siap'].includes(o.status_pesanan));
  const historyOrders = userOrders.filter(o => ['selesai', 'dibatalkan'].includes(o.status_pesanan));
  const currentOrders = orderHubTab === 'active' ? activeOrders : historyOrders;
  const currentOrder = currentOrders[selectedOrderIdx] || currentOrders[0] || null;

  const getProductImage = (p: Produk): string => {
    if (p.foto) return `/storage/${p.foto}`;
    if (PRODUCT_ACCURATE_IMAGES[p.nama]) return PRODUCT_ACCURATE_IMAGES[p.nama];
    return CATEGORY_FALLBACK_IMAGES[(p as any)._kategori?.slug] || CATEGORY_FALLBACK_IMAGES['coffee-based'];
  };

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden font-sans selection:bg-emerald-600 selection:text-white pb-20 md:pb-0 transition-colors duration-200 ${
        isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#FAF9F6] text-zinc-900'
      }`}
      style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
    >
      <Head title={`${cleanStoreName} • ${formattedTagline}`} />

      {/* ── 1. NAVBAR (Clean Responsive Theme + Artisanal Accent) ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? (isDarkMode ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 py-2.5 sm:py-3 shadow-lg shadow-black/40' : 'bg-white/90 backdrop-blur-md border-b border-zinc-200/80 py-2.5 sm:py-3 shadow-md')
            : (isDarkMode ? 'bg-zinc-950/70 backdrop-blur-sm py-3 sm:py-4' : 'bg-[#FAF9F6]/80 backdrop-blur-sm py-3 sm:py-4')
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <img
              src="/images/logo.png"
              alt={`Logo ${cleanStoreName}`}
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform shadow-sm"
            />
            <div className="flex flex-col min-w-0">
              <span className={`font-bold text-xs sm:text-sm md:text-base tracking-tight leading-tight group-hover:text-emerald-500 transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-950'} truncate`}>
                {cleanStoreName.toUpperCase()}
              </span>
              <span className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-400 tracking-wider uppercase font-medium truncate hidden min-[360px]:block">
                {formattedTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation (Modern Floating Pill) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-900/75 border border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-xs">
            <button
              onClick={() => menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-all text-xs font-medium whitespace-nowrap"
            >
              {dict.menuKafe}
            </button>
            <button
              onClick={() => workspaceRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-all text-xs font-medium whitespace-nowrap"
            >
              {dict.workspace}
            </button>
            <Link
              href="/tentang"
              className="px-3 py-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-950 dark:hover:text-white transition-all text-xs font-medium whitespace-nowrap"
            >
              {dict.tentang}
            </Link>
            <button
              onClick={() => setReservationOpen(true)}
              className="px-3 py-1.5 rounded-full hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-all text-xs font-semibold whitespace-nowrap flex items-center gap-1.5"
            >
              <CalendarRange size={13} />
              <span>Reservasi Meja</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Spotlight Search Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setSearchModalOpen(true);
                setSpotlightQuery('');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all text-xs active:scale-95 shadow-xs group"
              title="Cari Menu (Ctrl+K)"
            >
              <Search size={15} className="group-hover:text-emerald-500 transition-colors" />
              <span className="hidden sm:inline text-xs font-normal">Cari menu</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded font-mono border border-zinc-200 dark:border-zinc-700">⌘K</kbd>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-all text-xs font-semibold shadow-xs active:scale-95"
            >
              <ShoppingCart size={15} className="text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline font-medium">{dict.pesananTitle}</span>
              {cartCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* ── PROFILE TRIGGER BUTTON (SaaS Pill) ── */}
            <div className="relative shrink-0" ref={profileDropdownRef}>
              <button
                id="jh-profile-trigger"
                type="button"
                onClick={() => setProfileDropdownOpen(v => !v)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 sm:pr-3 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs active:scale-95 text-xs text-zinc-900 dark:text-zinc-100 group"
                aria-label="Profile Menu"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                  {isLoggedIn && userName ? userName.charAt(0).toUpperCase() : <User size={13} />}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-semibold text-xs max-w-[85px] lg:max-w-[110px] truncate">
                      {isLoggedIn && userName ? userName.split(' ')[0] : 'Akun'}
                    </span>
                    {isLoggedIn && userRole && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ── PROFILE & NAV MENU MEGA DROPDOWN (SaaS Clean Monochromatic) ── */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-[330px] sm:w-[370px] max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 space-y-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100">
                  {isLoggedIn ? (
                    <>
                      {/* 1. Header Profil Pengguna & Fast Actions */}
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate max-w-[120px]">{userName}</p>
                              <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] uppercase font-semibold tracking-wider bg-zinc-200 dark:bg-zinc-700/80 text-zinc-700 dark:text-zinc-300">
                                {userRole}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate leading-tight mt-0.5 max-w-[150px]">
                              {userEmail || userTelepon || 'member@jelanghari.com'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={userRole === 'owner' || userRole === 'manager' ? '/dashboard' : '/user/dashboard'}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title={userRole === 'owner' || userRole === 'manager' ? 'Buka Dashboard Admin' : 'Buka Dashboard Member'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setSettingsTab('preferences');
                              setCustomerSettingsOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Pengaturan & Tema"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Featured: Cek Status Pesanan (Eksklusif Pengguna Login) */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setTrackOpen(true);
                          refreshMyOrders();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs transition group text-left shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-zinc-200 border border-emerald-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                            <Clock size={14} />
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-white block text-xs">Cek Status Pesanan</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Pantau proses sajian pesananmu</span>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-0.5 group-hover:text-zinc-900 dark:group-hover:text-white transition-all" />
                      </button>

                      {/* 2. Quick Action Bar (Poin, Panduan, Settings Tema) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {/* Poin CRM */}
                        <Link
                          href={userRole === 'owner' || userRole === 'manager' ? '/customer' : '/user/dashboard'}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs transition group min-w-0"
                          title="Akses Sistem Poin & Member"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <Sparkles className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0" />
                            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Poin</span>
                          </div>
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300 shrink-0">
                            {userRole === 'owner' || userRole === 'manager' ? 'CRM' : `${customerPoin || 0}`}
                          </span>
                        </Link>

                        {/* Panduan SOP */}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setHelpModalOpen(true);
                          }}
                          className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs transition group text-left min-w-0"
                          title="Buka Buku Panduan & Glosarium"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0" />
                            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Panduan</span>
                          </div>
                          <kbd className="text-[9px] px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-400 font-mono shrink-0">⌘H</kbd>
                        </button>

                        {/* Pengaturan Tema & Preferensi */}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setSettingsTab('preferences');
                            setCustomerSettingsOpen(true);
                          }}
                          className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs transition group text-left min-w-0"
                          title="Pengaturan Mode Gelap/Terang & Bahasa"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <Settings className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 shrink-0" />
                            <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300 truncate">Setelan</span>
                          </div>
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700/70 text-zinc-700 dark:text-zinc-300 shrink-0">
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
                          className="w-full pl-8 pr-12 py-1.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {menuSearch ? (
                            <button
                              onClick={() => setMenuSearch('')}
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs p-0.5"
                            >
                              ✕
                            </button>
                          ) : (
                            <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700/70 text-zinc-600 dark:text-zinc-400 rounded font-mono">⌘K</kbd>
                          )}
                        </div>
                      </div>

                      {/* 4. Daftar Fitur / Menu (Minimalist & Scannable) */}
                      <div className="max-h-[260px] overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                        {filteredNavGroups.length === 0 ? (
                          <div className="py-6 text-center text-zinc-400 text-xs">
                            Tidak ada menu yang cocok dengan "{menuSearch}".
                          </div>
                        ) : (
                          filteredNavGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 block">
                                {group.title}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                                {group.items.map((item) => {
                                  const Icon = item.icon;

                                  if (item.href === '#panduan') {
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                          setProfileDropdownOpen(false);
                                          setHelpModalOpen(true);
                                        }}
                                        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-left w-full min-w-0"
                                        title={item.desc}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                                          <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                        </div>
                                        <span className="text-[8px] px-1 py-0.2 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
                                          Panduan
                                        </span>
                                      </button>
                                    );
                                  }

                                  if (item.href === '#cek-pesanan') {
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                          setProfileDropdownOpen(false);
                                          setTrackOpen(true);
                                        }}
                                        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-left w-full min-w-0"
                                        title={item.desc}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                                          <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                        </div>
                                      </button>
                                    );
                                  }

                                  if (item.href === '#reservasi-meja') {
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                          setProfileDropdownOpen(false);
                                          setReservationOpen(true);
                                        }}
                                        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-left w-full min-w-0"
                                        title={item.desc}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                                          <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                        </div>
                                      </button>
                                    );
                                  }

                                  if (item.href === '#pengaturan-akun') {
                                    return (
                                      <button
                                        key={item.label}
                                        type="button"
                                        onClick={() => {
                                          setProfileDropdownOpen(false);
                                          setSettingsTab('preferences');
                                          setCustomerSettingsOpen(true);
                                        }}
                                        className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-left w-full min-w-0"
                                        title={item.desc}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                                          <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                        </div>
                                      </button>
                                    );
                                  }

                                  return (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      onClick={() => setProfileDropdownOpen(false)}
                                      className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white min-w-0"
                                      title={item.desc}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <Icon className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors" />
                                        <span className="truncate text-[11px] leading-normal">{item.label}</span>
                                      </div>
                                      {(item as any).badge && (
                                        <span className="text-[8px] px-1 py-0.2 rounded font-medium tracking-tight bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
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

                      {/* 5. Footer: Shortcuts & Keluar */}
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2 px-0.5">
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[9px] border border-zinc-200 dark:border-zinc-700">ESC</kbd>
                          <span>tutup</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setConfirmLogoutOpen(true);
                          }}
                          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition shrink-0"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Guest Header Card */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold flex items-center justify-center text-xs shadow-xs shrink-0">
                            <User size={15} />
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">Akun &amp; Sesi Pelanggan</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Masuk untuk akses member &amp; poin</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                          <Link
                            href="/login"
                            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <LogIn size={13} />
                            <span>{dict.masukAkun}</span>
                          </Link>
                          <Link
                            href="/register"
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs text-center transition flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
                          >
                            <UserPlus size={13} />
                            <span>{dict.daftarAkun}</span>
                          </Link>
                        </div>
                      </div>

                      {/* Guest Utilities (Muted 2-column) */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-1 block">
                          Layanan &amp; Informasi
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setReservationOpen(true);
                            }}
                            className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CalendarRange className="w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                              <span className="truncate text-[11px] leading-normal">Reservasi Meja</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setHelpModalOpen(true);
                            }}
                            className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <BookOpen className="w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                              <span className="truncate text-[11px] leading-normal">Buku Panduan &amp; FAQ</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              setSettingsTab('preferences');
                              setCustomerSettingsOpen(true);
                            }}
                            className="group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs transition duration-150 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 text-left"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Settings className="w-3.5 h-3.5 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200" />
                              <span className="truncate text-[11px] leading-normal">Tema &amp; Preferensi</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[9px] border border-zinc-200/80 dark:border-zinc-700">ESC</kbd>
                          <span>tutup</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">Jelang Hari POS</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile & Small Tablet Quick Menu Toggle */}
            <button
              onClick={() => setMobileNavOpen(v => !v)}
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-95 shadow-2xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* Mobile & Small Tablet Quick Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-1 animate-fade">
            <div className="p-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/90 rounded-2xl shadow-2xl space-y-1 text-xs">
              <button
                onClick={() => {
                  setSearchModalOpen(true);
                  setSpotlightQuery('');
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-zinc-800/80 hover:bg-emerald-100 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 transition font-semibold text-left"
              >
                <Search size={15} />
                <span>Cari Menu (Spotlight)</span>
              </button>
              <button
                onClick={() => {
                  menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition font-medium text-left"
              >
                <Coffee size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>{dict.menuKafe}</span>
              </button>
              <button
                onClick={() => {
                  workspaceRef.current?.scrollIntoView({ behavior: 'smooth' });
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition font-medium text-left"
              >
                <Wifi size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>{dict.workspace}</span>
              </button>
              <Link
                href="/tentang"
                onClick={() => setMobileNavOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition font-medium text-left"
              >
                <HelpCircle size={15} className="text-emerald-600 dark:text-emerald-400" />
                <span>{dict.tentang}</span>
              </Link>
              <button
                onClick={() => {
                  setReservationOpen(true);
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-emerald-700 dark:text-emerald-400 transition font-medium text-left"
              >
                <CalendarRange size={15} />
                <span>Reservasi Meja &amp; Ruang</span>
              </button>
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setTrackOpen(true);
                    setMobileNavOpen(false);
                    refreshMyOrders();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition font-medium text-left"
                >
                  <Clock size={15} className="text-zinc-500 dark:text-zinc-400" />
                  <span>{dict.cekPesanan}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSettingsTab('preferences');
                  setCustomerSettingsOpen(true);
                  setMobileNavOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition font-medium text-left"
              >
                <Settings size={15} className="text-zinc-500 dark:text-zinc-400" />
                <span>Pengaturan &amp; Tema (Dark / Light)</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── BANNER PEMBERITAHUAN TOKO TUTUP (REALTIME SYNC) ── */}
      {!isStoreOpen && (
        <div className={`fixed top-[58px] sm:top-[68px] left-0 right-0 z-40 border-b px-4 py-2 sm:py-2.5 text-xs shadow-md backdrop-blur-md animate-fade transition-colors ${
          isDarkMode
            ? 'bg-zinc-950/95 border-red-900/50 text-red-200 shadow-xl shadow-black/40'
            : 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] tracking-wider shrink-0 border ${
                isDarkMode
                  ? 'bg-red-950/80 border-red-800/60 text-red-300'
                  : 'bg-rose-100 border-rose-300 text-rose-800'
              }`}>
                Toko Tutup
              </span>
              <p className={`text-[11px] sm:text-xs font-medium truncate ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {pesanTokoTutup || `Pemesanan online sedang ditutup. Buka kembali pukul ${jamBuka} – ${jamTutup} WIB.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER MEJA TERDETEKSI (SCAN BARCODE MEJA) ── */}
      {activeMeja && (
        <div className={`fixed ${!isStoreOpen ? 'top-[96px] sm:top-[106px]' : 'top-[58px] sm:top-[68px]'} left-0 right-0 z-40 border-b px-4 py-2 sm:py-2.5 text-xs shadow-md backdrop-blur-md animate-fade transition-colors ${
          isDarkMode
            ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-xl'
            : 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-sm'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                isDarkMode ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}>
                <QrCode size={14} />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`font-extrabold text-xs ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                  Meja {activeMeja.nomor}
                </span>
                <span className={`px-2 py-0.2 rounded-full border text-[10px] font-bold uppercase ${
                  isDarkMode ? 'bg-emerald-900 border-emerald-500/40 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}>
                  {activeMeja.area || 'Dine-In'}
                </span>
                <span className={`${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'} hidden sm:inline`}>•</span>
                <span className={`text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Pesanan otomatis diantar ke meja ini setelah checkout.
                </span>
              </div>
            </div>

            {activeTableOrder && (
              <button
                type="button"
                onClick={() => {
                  setTrackOpen(true);
                  refreshMyOrders();
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] border transition shrink-0 self-start sm:self-auto ${
                  isDarkMode
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                    : 'bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-300 shadow-xs'
                }`}
              >
                <span>Lihat Pesanan Meja (#{activeTableOrder.nomor_pesanan})</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 2. MINIMALIST HERO SECTION (Full Background Image) ── */}
      <section className={`relative min-h-[85vh] sm:min-h-[92vh] pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-10 border-b overflow-hidden flex flex-col items-center justify-center text-center transition-colors duration-200 ${
        isDarkMode ? 'border-zinc-900' : 'border-zinc-200'
      }`}>
        {/* Hero Background Image with Multi-layer Adaptive Gradient Overlays */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/hero.jpg"
            alt="Suasana Jelang Hari Coffee & Workspace"
            className={`w-full h-full object-cover object-center scale-105 transition-opacity duration-300 ${
              isDarkMode ? 'opacity-100' : 'opacity-25'
            }`}
          />
          {isDarkMode ? (
            <>
              <div className="absolute inset-0 bg-zinc-950/80" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/85" />
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/90 via-transparent to-zinc-950" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6]/90 via-[#FAF9F6]/75 to-[#FAF9F6]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] via-transparent to-transparent" />
            </>
          )}
        </div>

        {/* Soft Ambient Green Glow */}
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[320px] rounded-full blur-[140px] pointer-events-none z-0 ${
          isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-500/10'
        }`} />

        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-7 relative z-10 flex flex-col items-center">

          {/* Main Title (Clean Modern Sans Font) */}
          <h1 className={`text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.12] ${
            isDarkMode ? 'text-white drop-shadow-lg' : 'text-zinc-900 drop-shadow-2xs'
          }`}>
            {dict.heroTitle1}{' '}
            <span className="text-emerald-600 dark:text-emerald-400 block sm:inline">{dict.heroTitle2}</span>
          </h1>

          <p className={`text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-normal ${
            isDarkMode ? 'text-zinc-200 drop-shadow' : 'text-zinc-600'
          }`}>
            {dict.heroDesc}
          </p>

          {/* Quick Stat Bar (Frosted Glass Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto pt-6 sm:pt-10 w-full">
            <div className={`p-3 sm:p-3.5 rounded-2xl text-left border backdrop-blur-md ${
              isDarkMode
                ? 'bg-zinc-950/70 border-white/10 text-white shadow-lg'
                : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
            }`}>
              <Sparkles size={15} className="text-emerald-600 dark:text-emerald-400 mb-1" />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Ambiens Tenang</h4>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Nyaman &amp; Produktif
              </p>
            </div>
            <div className={`p-3 sm:p-3.5 rounded-2xl text-left border backdrop-blur-md ${
              isDarkMode
                ? 'bg-zinc-950/70 border-white/10 text-white shadow-lg'
                : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
            }`}>
              <Zap size={15} className="text-emerald-600 dark:text-emerald-400 mb-1" />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Power Outlet</h4>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Tersedia di tiap meja</p>
            </div>
            <div className={`p-3 sm:p-3.5 rounded-2xl text-left border backdrop-blur-md ${
              isDarkMode
                ? 'bg-zinc-950/70 border-white/10 text-white shadow-lg'
                : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
            }`}>
              <Coffee size={15} className="text-emerald-600 dark:text-emerald-400 mb-1" />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>50+ Menu</h4>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Signature &amp; Meals</p>
            </div>
            <div className={`p-3 sm:p-3.5 rounded-2xl text-left border backdrop-blur-md ${
              isDarkMode
                ? 'bg-zinc-950/70 border-white/10 text-white shadow-lg'
                : 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
            }`}>
              <Clock size={15} className="text-emerald-600 dark:text-emerald-400 mb-1" />
              <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{jamBuka} – {jamTutup}</h4>
              <p className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Buka Setiap Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2.5. HEADLINE & EVENT AUTO-SLIDER (NOBAR, HOMEMADE, INSTAGRAM) ── */}
      <section className="px-4 sm:px-10 max-w-7xl mx-auto -mt-2 sm:-mt-4 mb-6 sm:mb-10 relative z-20">
        <div
          onMouseEnter={() => setSliderPaused(true)}
          onMouseLeave={() => setSliderPaused(false)}
          onTouchStart={() => setSliderPaused(true)}
          onTouchEnd={() => setSliderPaused(false)}
          className="relative overflow-hidden rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-xl dark:shadow-2xl bg-zinc-950 min-h-[220px] sm:min-h-[260px] flex items-center transition-all"
        >
          {bannerSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                onClick={slide.onAction}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${
                  isActive ? 'opacity-100 pointer-events-auto z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                {/* Background Image with Dark Gradient Vignette */}
                <div
                  className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-1000 ease-out"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor} mix-blend-multiply opacity-90`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent" />

                {/* Tanggal & Waktu in Top-Right Corner */}
                {slide.tanggal_waktu && (
                  <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-20">
                    <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{slide.tanggal_waktu}</span>
                    </span>
                  </div>
                )}

                {/* Slide Content */}
                <div className="relative h-full flex flex-col justify-between p-5 sm:p-8 max-w-3xl">
                  <div>
                    <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white leading-snug drop-shadow-md">
                      {slide.title}
                    </h3>
                    <p className="text-zinc-200 text-xs sm:text-sm mt-2 line-clamp-2 sm:line-clamp-none max-w-xl leading-relaxed drop-shadow">
                      {slide.desc}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={slide.onAction}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <span>{slide.actionText}</span>
                      <ArrowRight size={14} />
                    </button>
                    {idx === 0 && (
                      <span className="text-[11px] text-zinc-300 hidden sm:inline-flex items-center gap-1 font-medium bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/10">
                        {dict.tempatTerbatas}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentSlide(prev => (prev + 1) % bannerSlides.length)}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-80 hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {bannerSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Ke slide ${dotIdx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  dotIdx === currentSlide
                    ? 'w-6 h-2 bg-emerald-400'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. MENU CATALOG SECTION ── */}
      <section ref={menuSectionRef} id="menu" className="py-10 sm:py-16 px-4 sm:px-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-5">
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] sm:text-xs font-bold tracking-widest uppercase">
              {dict.menuKafe}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">
              Pilihan Seduhan &amp; Santapan
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mt-1">
              Sentuh menu untuk memilih varian suhu, tingkat manis, dan modifier tambahan.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 shadow-2xs outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills (Edge-to-edge on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveKat('all')}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              activeKat === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
            }`}
          >
            {dict.semuaMenu}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeKat === 'all' ? 'bg-emerald-700 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {allProducts.length}
            </span>
          </button>

          {kategoris.map(kat => {
            const count = kat.produks ? kat.produks.length : 0;
            const isActive = activeKat === kat.id;
            return (
              <button
                key={kat.id}
                onClick={() => setActiveKat(kat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs'
                }`}
              >
                {kat.nama}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-emerald-700 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid (2 columns on mobile, up to 4 on desktop) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-100/60 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl">
            <Coffee size={36} className="mx-auto text-zinc-400 dark:text-zinc-600 mb-3" />
            <h3 className="text-zinc-800 dark:text-zinc-300 font-bold text-sm">Menu tidak ditemukan</h3>
            <p className="text-zinc-500 text-xs mt-1">Gunakan kata kunci pencarian lain atau pilih kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {filteredProducts.map(p => {
              const photo = getProductImage(p);
              return (
                <div
                  key={p.id}
                  className="group bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/60 shadow-xs"
                >
                  {/* Image & Badges */}
                  <div className="relative aspect-square sm:aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    <img
                      src={photo}
                      alt={p.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent dark:from-zinc-900 dark:via-transparent dark:to-black/30" />

                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md text-[9px] sm:text-[10px] font-mono font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                      {p.kode}
                    </span>

                    {p.is_favorite && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-600/90 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-white flex items-center gap-0.5 sm:gap-1 shadow-sm">
                        <Sparkles size={10} /> <span className="hidden xs:inline">Favorit</span>
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                    <div>
                      <h3 className="font-bold text-xs sm:text-base text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                        {p.nama}
                      </h3>
                      <p className="hidden sm:block text-zinc-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {p.deskripsi || 'Racikan istimewa pilihan Jelang Hari.'}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        <span className="hidden sm:block text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
                          {dict.mulaiDari}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm truncate block">
                          {rupiah(p.harga)}
                        </span>
                      </div>

                      <button
                        onClick={() => openCustomizeModal(p)}
                        className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-emerald-600 sm:bg-emerald-50 dark:sm:bg-zinc-800 sm:border sm:border-emerald-200 dark:sm:border-zinc-700/60 sm:hover:bg-emerald-600 text-white sm:text-emerald-700 dark:sm:text-zinc-200 sm:hover:text-white text-[11px] sm:text-xs font-semibold transition-all shadow-2xs shrink-0"
                      >
                        <Plus size={13} />
                        <span className="inline sm:inline">{dict.pesan}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. WORKSPACE SECTION ── */}
      <section ref={workspaceRef} id="workspace" className="py-20 px-6 sm:px-10 bg-zinc-100/60 dark:bg-zinc-900/30 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Workspace &amp; Productivity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Ruang Tenang untuk Karya Terbaikmu
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm">
              Koneksi stabil, stopkontak melimpah, dan alunan lo-fi yang menyejukkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-emerald-500/40 transition-colors shadow-xs dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Sparkles size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Ambiens Tenang &amp; Sejuk</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Ruang ber-AC yang nyaman dengan pencahayaan hangat dan alunan musik santai untuk mendukung produktivitas kerja maupun obrolan berharga.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-emerald-500/40 transition-colors shadow-xs dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Stopkontak di Tiap Meja</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Tidak perlu berebut colokan. Setiap meja komunal, sofa santai, dan area outdoor telah disediakan soket listrik yang aman.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-3 hover:border-emerald-500/40 transition-colors shadow-xs dark:shadow-none">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Leaf size={24} />
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Zonasi Indoor &amp; Garden</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                Ruang AC hening bebas asap rokok untuk fokus intensif, serta taman tropis outdoor untuk santai dan diskusi hangat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. DETAILED PREMIUM FOOTER (Monochrome + Soft Green & Live POS Sync) ── */}
      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 pt-16 pb-12 px-6 sm:px-10 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-zinc-200 dark:border-zinc-900/80">
          {/* Col 1: Brand Info & Live Realtime Badge (Col span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="Logo" className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shadow-sm" />
              <div>
                <span className="font-extrabold text-zinc-900 dark:text-white text-base tracking-tight block">
                  {cleanStoreName.toUpperCase()}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase">
                  {formattedTagline}
                </span>
              </div>
            </div>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
              {settings?.deskripsi_footer || 'Secangkir tenang, fokus tanpa batas. Menemani langkah produktif dan momen berhargamu di Tasikmalaya sejak pagi hingga larut malam.'}
            </p>

            {/* Realtime Live Status Card in Footer */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status Operasional</span>
                {isStoreOpen ? (
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] leading-tight">
                    Buka Sekarang
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-[11px] leading-tight">
                    Sedang Tutup
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-xs">
                <Clock size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Setiap Hari: <strong className="text-zinc-900 dark:text-white font-mono">{jamBuka} – {jamTutup} WIB</strong></span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Sinkronisasi realtime terhubung langsung dengan sistem kasir POS kafe.
              </p>
            </div>
          </div>

          {/* Col 2: Alamat Lengkap & Kontak Terinci (Col span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <MapPin size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Lokasi &amp; Kontak</span>
            </h4>
            
            <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Alamat Resmi:</span>
                <p className="text-zinc-900 dark:text-white text-xs leading-relaxed font-medium">
                  {settings?.alamat || 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya, Jawa Barat 46181'}
                </p>
                <a
                  href={settings?.maps_url || `https://maps.google.com/?q=${encodeURIComponent(settings?.alamat || 'Jl. AH Nasution No 293, Mangkubumi, Tasikmalaya')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold pt-0.5 transition"
                >
                  <span>Petunjuk Arah Google Maps</span>
                  <ExternalLink size={11} />
                </a>
              </div>

              <div className="space-y-1 pt-1 border-t border-zinc-200 dark:border-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">Hubungi Kami:</span>
                <a
                  href={getWhatsAppUrl(settings?.telepon, `Halo ${cleanStoreName}, saya ingin bertanya informasi seputar kafe.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  <Phone size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{settings?.telepon || '0821-1594-1156'} (WhatsApp)</span>
                </a>
                <a
                  href={`mailto:${settings?.email || 'jelangharikopi@gmail.com'}`}
                  className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                >
                  <Mail size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{settings?.email || 'jelangharikopi@gmail.com'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Fasilitas Workspace & Pembayaran (Col span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Fasilitas &amp; Metode Bayar</span>
            </h4>

            <div className="space-y-2.5">
              <div className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Zap size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Stopkontak di setiap meja komunal &amp; sofa</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>AC Indoor Focus Area &amp; Tropical Garden Outdoor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Musholla &amp; Toilet Bersih Terawat</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold mb-1">
                  Pembayaran Didukung:
                </span>
                <p className="text-[11px] text-zinc-700 dark:text-zinc-300">
                  QRIS (GoPay, OVO, Dana, ShopeePay), Tunai Kasir, &amp; Debit / Transfer Bank.
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Tautan & Portal Sistem (Col span 2) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">Portal &amp; Sosial</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={settings?.instagram_url || `https://instagram.com/${(settings?.instagram || 'Jelanghari_newchapter').replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
                >
                  <Instagram size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{settings?.instagram?.startsWith('@') ? settings?.instagram : `@${settings?.instagram || 'Jelanghari_newchapter'}`}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://tiktok.com/@${(settings?.tiktok || 'Jelangharicoffee').replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="text-[10px] font-bold text-zinc-400">TT</span>
                  <span>{settings?.tiktok?.startsWith('@') ? settings?.tiktok : `@${settings?.tiktok || 'Jelangharicoffee'}`}</span>
                  <ExternalLink size={10} className="opacity-60 ml-auto" />
                </a>
              </li>
              <li className="pt-1">
                <button
                  onClick={() => {
                    setTrackOpen(true);
                    refreshMyOrders();
                  }}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5"
                >
                  <Clock size={13} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span>Cek Status Pesanan</span>
                </button>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-zinc-700 dark:text-zinc-300">
                  Tentang {cleanStoreName}
                </Link>
              </li>
            </ul>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900">
              {!isLoggedIn ? (
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors font-semibold text-[11px]"
                >
                  <LogIn size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Masuk Akun</span>
                </Link>
              ) : (
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                    Akun: <strong className="text-zinc-900 dark:text-white">{userName}</strong>
                  </span>
                  {userRole !== 'pelanggan' && (
                    <a
                      href="/dashboard"
                      className="block text-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] transition"
                    >
                      Dashboard Manajemen
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
          <p>&copy; {new Date().getFullYear()} {cleanStoreName}. {settings?.alamat || 'Jl. AH Nasution No 293, Mangkubumi, Kota Tasikmalaya'}. All rights reserved.</p>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Minimalist Theme</span>
            <span>&bull;</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Real-time POS Sync</span>
            <span>&bull;</span>
            <span>{settings?.alamat ? settings.alamat.split(',')[1]?.trim() || 'Kota Tasikmalaya' : 'Kota Tasikmalaya'}</span>
          </div>
        </div>
      </footer>

      {/* ── 6. FLOATING DOCK FOR MOBILE (macOS / iPhone Island Style) ── */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/90 dark:bg-zinc-950/80 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800/90 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between">
          <button
            onClick={() => menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Coffee size={18} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          <button
            onClick={() => {
              setSearchModalOpen(true);
              setSpotlightQuery('');
            }}
            className="flex flex-col items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <Search size={18} />
            <span className="text-[10px] font-medium">Cari</span>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <ShoppingCart size={18} />
            <span className="text-[10px] font-medium">Keranjang</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setProfileDropdownOpen(v => !v)}
            className="flex flex-col items-center gap-0.5 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <User size={18} />
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </div>
      </div>

      {/* ── 7. PRODUCT CUSTOMIZE MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade" onClick={() => setSelectedProduct(null)}>
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl w-full max-w-lg overflow-hidden flex flex-col my-auto max-h-[85vh] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative aspect-[16/9] bg-zinc-950 overflow-hidden shrink-0">
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.nama}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/50" />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-zinc-950/70 text-zinc-400 hover:text-white"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold">
                  {selectedProduct.kode}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedProduct.nama}
                </h3>
              </div>
            </div>

            {/* Customization Options */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {selectedProduct.deskripsi || 'Racikan istimewa pilihan Jelang Hari.'}
              </p>

              {/* Varian Selection */}
              {selectedProduct.varians && selectedProduct.varians.length > 0 && (
                <div className="space-y-2">
                  <label className="font-bold text-zinc-800 dark:text-zinc-300 block uppercase tracking-wider text-[11px]">
                    Pilihan Varian
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.varians.map(v => {
                      const isSel = selectedVarianId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVarianId(v.id)}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSel
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-white shadow-2xs'
                              : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }`}
                        >
                          <span className="font-semibold text-xs">{v.nama}</span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {v.harga_tambahan > 0 ? `+${rupiah(v.harga_tambahan)}` : 'Standar'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modifier Groups */}
              {getActiveModGroups(selectedProduct).map(group => {
                const chosen = selectedModifiers[group.id] || [];
                return (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                        {group.nama}
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        {group.maks_pilihan === 1 ? 'Pilih 1' : `Maks ${group.maks_pilihan || 'bebas'}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.modifiers.map(mod => {
                        const isChosen = chosen.includes(mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => handleModifierToggle(group, mod.id)}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                              isChosen
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-white shadow-2xs'
                                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <span className="text-xs font-semibold">{mod.nama}</span>
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                              {mod.harga_tambahan > 0 ? `+${rupiah(mod.harga_tambahan)}` : 'Gratis'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Catatan Khusus */}
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-800 dark:text-zinc-300 block uppercase tracking-wider text-[11px]">
                  Catatan Khusus
                </label>
                <textarea
                  rows={2}
                  value={itemNote}
                  onChange={e => setItemNote(e.target.value)}
                  placeholder="Contoh: Less ice, gula dipisah, tidak pakai daun bawang..."
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none resize-none"
                />
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider text-[11px]">
                  Jumlah
                </span>
                <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setOrderQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-2xs"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-zinc-900 dark:text-white text-sm">{orderQty}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQty(q => q + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white shadow-2xs"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">Total</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {rupiah(calculateItemPrice() * orderQty)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <ShoppingCart size={15} />
                {dict.tambahPesanan}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. CART & CHECKOUT DRAWER ── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade">
          <div
            className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full flex flex-col justify-between shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">{dict.keranjang}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {cartCount} item
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* List & Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 space-y-3">
                  <ShoppingCart size={40} className="mx-auto text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold">{dict.kosong}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div
                      key={item.uid}
                      className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-zinc-900 dark:text-white text-xs font-bold">{item.nama_produk}</h4>
                          {item.nama_varian && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
                              Varian: {item.nama_varian}
                            </span>
                          )}
                          {item.modifiers.length > 0 && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                              + {item.modifiers.map(m => m.nama).join(', ')}
                            </span>
                          )}
                          {item.catatan && (
                            <span className="text-[10px] text-zinc-500 italic block mt-0.5">
                              "{item.catatan}"
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {rupiah(item.subtotal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[10px] text-zinc-500">{rupiah(item.harga_satuan)} / pcs</span>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.uid, -1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-zinc-900 dark:text-white">{item.jumlah}</span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.uid, 1)}
                            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 uppercase tracking-wider">
                    Informasi Pemesanan
                  </h4>

                  {/* Tipe Pesanan */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipePesanan('dine_in')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        tipePesanan === 'dine_in'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-white shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {dict.dineIn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipePesanan('take_away')}
                      className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                        tipePesanan === 'take_away'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-white shadow-2xs'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {dict.takeaway}
                    </button>
                  </div>

                  {tipePesanan === 'dine_in' && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                        {dict.pilihMeja} <span className="text-emerald-500">*</span>
                      </label>
                      {activeMeja ? (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/50 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <QrCode size={14} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="font-bold text-zinc-900 dark:text-white">Meja {activeMeja.nomor} ({activeMeja.area || 'Dine-In'})</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                            Terkunci via QR
                          </span>
                        </div>
                      ) : (
                        <select
                          value={selectedMejaId}
                          onChange={e => setSelectedMejaId(e.target.value)}
                          required
                          className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white outline-none"
                        >
                          <option value="">-- Pilih Meja Anda --</option>
                          {mejas.map(m => (
                            <option key={m.id} value={m.id}>
                              Meja {m.nomor} ({m.area} - {m.kapasitas} Org)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                      {dict.namaPemesan} <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaPelanggan}
                      onChange={e => setNamaPelanggan(e.target.value)}
                      placeholder="Nama Anda"
                      required
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                      {dict.noHp} <span className="text-emerald-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={teleponPelanggan}
                      onChange={e => setTeleponPelanggan(e.target.value)}
                      placeholder="08123456789"
                      required
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
                    />
                  </div>

                  {/* Dynamic Customer Payment Method Selection */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block uppercase tracking-wider">
                        {dict.metodeBayar}
                      </label>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {availablePaymentMethods.length} pilihan
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availablePaymentMethods.map((m: any) => {
                        const isSelected = metodeBayar === m.nama || metodeBayar === m.id;
                        const isQris = m.id?.includes('qris') || m.nama?.toLowerCase().includes('qris');
                        const isCash = m.tipe === 'cash' || m.id?.includes('cash') || m.nama?.toLowerCase().includes('tunai');
                        const isWallet = m.id?.includes('gopay') || m.id?.includes('shopee') || m.id?.includes('ovo') || m.id?.includes('dana');

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodeBayar(m.nama)}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-white shadow-xs ring-1 ring-emerald-500/50'
                                : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className="text-[11px] font-bold truncate leading-tight">
                                {m.nama}
                              </span>
                              {isQris ? (
                                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              ) : isCash ? (
                                <Banknote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : isWallet ? (
                                <Wallet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                            </div>
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate block">
                              {isQris ? 'Scan All Pay' : isCash ? 'Kasir' : isWallet ? 'E-Wallet' : 'Transfer'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Instruction Card for the selected payment method */}
                    {(() => {
                      const selectedObj = availablePaymentMethods.find(
                        (m: any) => m.nama === metodeBayar || m.id === metodeBayar
                      ) || availablePaymentMethods[0];

                      if (!selectedObj) return null;
                      const keterangan = selectedObj.keterangan || '';
                      // Extract account/phone number if present
                      const accountMatch = keterangan.match(/\b\d[\d\s-]{5,}\b/);
                      const accountNo = accountMatch ? accountMatch[0].trim() : '';

                      return (
                        <div className="p-3 rounded-xl bg-zinc-100/90 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs animate-in fade-in duration-150">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              <span>{dict.instruksiBayar}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                              {selectedObj.nama}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                            {keterangan || (selectedObj.tipe === 'cash' ? 'Silakan bayar pesanan ke kasir saat pesanan dikonfirmasi.' : 'Lakukan pembayaran sesuai petunjuk kasir saat konfirmasi.')}
                          </p>

                          {accountNo && (
                            <div className="pt-1 flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                {accountNo}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(accountNo.replace(/[\s-]/g, ''));
                                  setCopiedAccountNo(true);
                                  setTimeout(() => setCopiedAccountNo(false), 2000);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-2xs"
                              >
                                {copiedAccountNo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedAccountNo ? dict.tersalin : dict.salin}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Promo Voucher */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                      {dict.voucher}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="KODE PROMO"
                        disabled={!!voucherApplied}
                        className="flex-1 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none uppercase font-mono"
                      />
                      {voucherApplied ? (
                        <button
                          type="button"
                          onClick={removeVoucher}
                          className="px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs text-red-600 dark:text-red-400 rounded-xl font-medium"
                        >
                          Hapus
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={applyVoucher}
                          disabled={voucherLoading || !voucherCode.trim()}
                          className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-600 hover:text-white disabled:opacity-50 text-xs text-zinc-700 dark:text-white rounded-xl font-semibold transition"
                        >
                          {voucherLoading ? <Loader2 size={14} className="animate-spin" /> : 'Gunakan'}
                        </button>
                      )}
                    </div>
                    {voucherMsg && (
                      <p className={`text-[11px] ${voucherMsg.isError ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {voucherMsg.text}
                      </p>
                    )}
                  </div>

                  {/* Catatan */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block">
                      {dict.catatanPesanan}
                    </label>
                    <input
                      type="text"
                      value={catatanPesanan}
                      onChange={e => setCatatanPesanan(e.target.value)}
                      placeholder="Pesan tambahan untuk kasir / dapur..."
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
                    />
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Total & Button */}
            {cart.length > 0 && (
              <div className="p-5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">{rupiah(cartSubtotal)}</span>
                  </div>
                  {diskonTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Diskon ({voucherApplied?.kode})</span>
                      <span>-{rupiah(diskonTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Pajak Resto ({pajakPersen}%)</span>
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium">{rupiah(pajakNominal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-600 dark:text-emerald-400 text-base">{rupiah(grandTotal)}</span>
                  </div>
                </div>

                {!isStoreOpen ? (
                  <div className="space-y-2 pt-1">
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/40 text-red-800 dark:text-red-200 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-red-700 dark:text-red-300">Pemesanan Online Belum Dibuka</p>
                        <p className="text-[11px] text-red-600 dark:text-red-200/80 leading-relaxed">
                          {pesanTokoTutup || `Kafe buka setiap hari pukul ${jamBuka} – ${jamTutup} WIB. Anda tetap dapat memilih menu; saat jam buka tiba, tombol ini akan otomatis terbuka.`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700/50"
                    >
                      <Lock size={15} />
                      <span>Toko Sedang Tutup • Buka {jamBuka} WIB</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {!isLoggedIn && settings?.guest_checkout_enabled !== '1' && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300">
                        <ShieldCheck size={16} className="text-amber-500 shrink-0" />
                        <span>Wajib masuk / buat akun sebelum checkout (poin reward otomatis)</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={submittingOrder}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submittingOrder ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Memproses Pesanan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          {dict.kirimPesanan} ({rupiah(grandTotal)})
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 11. ORDER SUCCESS MODAL ── */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Pesanan Terkirim!</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
                Pesanan telah masuk ke kasir &amp; barista Jelang Hari.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Nomor Pesanan</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {orderSuccess.nomor_pesanan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Tipe</span>
                <span className="text-zinc-900 dark:text-white font-medium">
                  {orderSuccess.tipe_pesanan === 'dine_in'
                    ? `Dine-In (${orderSuccess.meja?.nomor ? `Meja ${orderSuccess.meja.nomor}` : 'Di Tempat'})`
                    : 'Takeaway'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Metode Bayar</span>
                <span className="text-zinc-900 dark:text-white font-medium uppercase">{orderSuccess.metode_pembayaran}</span>
              </div>
              <div className="flex items-center justify-between font-bold pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-800 dark:text-zinc-200">Total Tagihan</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">{rupiah(orderSuccess.total)}</span>
              </div>
            </div>

            {orderSuccess.status_pembayaran === 'unpaid' && orderSuccess.metode_pembayaran !== 'cash' && orderSuccess.metode_pembayaran !== 'tunai' && (
              <button
                type="button"
                onClick={() => handlePayWithMidtrans(orderSuccess.nomor_pesanan)}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 mb-2"
              >
                <CreditCard size={14} />
                <span>Bayar Sekarang via {orderSuccess.metode_pembayaran?.toUpperCase()} (Midtrans)</span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setTrackOpen(true);
                  refreshMyOrders();
                }}
                className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-transparent text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock size={14} /> Lacak Status
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-transparent text-xs font-semibold rounded-xl transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 11. SPOTLIGHT MENU SEARCH SYSTEM (BUILT FROM SCRATCH) ── */}
      {searchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade"
          onClick={() => setSearchModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/60 flex items-center gap-3">
              <Search size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                ref={spotlightInputRef}
                id="spotlight-search-input"
                type="text"
                value={spotlightQuery}
                onChange={e => setSpotlightQuery(e.target.value)}
                placeholder="Cari kopi, makanan, minuman, mocktail, cemilan..."
                className="w-full bg-transparent text-sm sm:text-base text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none"
              />
              <div className="flex items-center gap-2 shrink-0">
                {spotlightQuery && (
                  <button
                    type="button"
                    onClick={() => setSpotlightQuery('')}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors"
                    title="Bersihkan Pencarian"
                  >
                    <X size={15} />
                  </button>
                )}
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono border border-zinc-200 dark:border-zinc-700">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={() => setSearchModalOpen(false)}
                  className="sm:hidden p-1 text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Category Quick Filter Chips */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              <button
                type="button"
                onClick={() => setSpotlightCat('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  spotlightCat === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs'
                }`}
              >
                Semua ({allProducts.length})
              </button>
              {kategoris.map(kat => {
                const count = (kat.produks || []).filter(p => p.is_tersedia).length;
                return (
                  <button
                    key={kat.id}
                    type="button"
                    onClick={() => setSpotlightCat(kat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                      spotlightCat === kat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs'
                    }`}
                  >
                    {kat.nama} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Results / Content Area */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
              {spotlightResults.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Search size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Menu Tidak Ditemukan</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                      Tidak ada hasil yang sesuai dengan "{spotlightQuery}". Coba kata kunci lain atau pilih kategori di atas.
                    </p>
                  </div>
                  {spotlightQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSpotlightQuery('');
                        setSpotlightCat('all');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 font-semibold transition"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 pt-1 pb-1">
                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      {spotlightQuery ? `Hasil Pencarian (${spotlightResults.length})` : 'Daftar Menu Pilihan'}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Klik untuk memesan</span>
                  </div>

                  {spotlightResults.map(p => {
                    const imgSrc = getProductImage(p);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSearchModalOpen(false);
                          openCustomizeModal(p);
                        }}
                        className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={imgSrc}
                            alt={p.nama}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {p.nama}
                              </h5>
                              {(p as any)._kategori?.nama && (
                                <span className="hidden sm:inline-block px-2 py-0.2 rounded-md text-[9px] font-semibold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                  {(p as any)._kategori.nama}
                                </span>
                              )}
                              {p.station && (
                                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                                  {p.station}
                                </span>
                              )}
                            </div>
                            {p.deskripsi && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs sm:max-w-md">
                                {p.deskripsi}
                              </p>
                            )}
                            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm pt-0.5">
                              {rupiah(p.harga)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchModalOpen(false);
                            openCustomizeModal(p);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 group-hover:bg-emerald-600 text-zinc-800 dark:text-zinc-200 group-hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-2xs border border-zinc-200 dark:border-transparent"
                        >
                          <Plus size={13} />
                          <span>Pesan</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search Footer Tips */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-4">
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">&bull; Tekan menu untuk memilih varian suhu / topping</span>
                <span className="sm:hidden">&bull; Sentuh menu untuk pesan</span>
              </div>
              <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">ESC untuk tutup</span>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. PERSONAL ORDER HUB (AUTOMATIC LOGGED-IN ORDER TRACKER - ZERO SEARCH) ── */}
      {trackOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade"
          onClick={() => setTrackOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-700 dark:text-zinc-200 shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-base leading-tight">Status Pesanan Saya</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Pantau progres sajian pesanan Anda secara otomatis
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={orderHubLoading}
                  onClick={refreshMyOrders}
                  className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                  title="Perbarui Data"
                >
                  <RefreshCw size={15} className={orderHubLoading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setTrackOpen(false)}
                  className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab Navigation: Pesanan Aktif vs Riwayat (Hanya tampil jika login) */}
            {isLoggedIn && (
              <div className="px-4 sm:px-5 pt-3 pb-2 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200 dark:border-zinc-800/60">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderHubTab('active');
                      setSelectedOrderIdx(0);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      orderHubTab === 'active'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700/60'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Clock size={13} />
                    <span>Pesanan Berjalan</span>
                    {activeOrders.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold border border-zinc-300 dark:border-zinc-600">
                        {activeOrders.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrderHubTab('history');
                      setSelectedOrderIdx(0);
                    }}
                    className={`py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      orderHubTab === 'history'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700/60'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Riwayat Pesanan</span>
                    {historyOrders.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-bold border border-zinc-300 dark:border-zinc-700">
                        {historyOrders.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {!isLoggedIn ? (
                <div className="text-center py-12 px-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <User size={22} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Masuk untuk Memantau Pesanan</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                      Fitur pelacakan pesanan otomatis disinkronkan langsung dengan akun Jelang Hari Anda tanpa perlu repot mencari kode transaksi.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTrackOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold transition shadow-sm"
                    >
                      Masuk / Daftar Akun
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* ── TAB 1: PESANAN AKTIF ── */}
                  {orderHubTab === 'active' && (
                    <>
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        <ShoppingBag size={22} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">Tidak Ada Pesanan yang Sedang Diproses</h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                          Semua pesanan Anda saat ini telah selesai atau belum ada pesanan baru yang sedang disiapkan barista &amp; dapur.
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTrackOpen(false);
                            menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold transition shadow-sm"
                        >
                          Pesan Menu Sekarang
                        </button>
                        {historyOrders.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setOrderHubTab('history')}
                            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition border border-zinc-200 dark:border-transparent"
                          >
                            Lihat Riwayat ({historyOrders.length})
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Active Order Switcher (if multiple orders active) */}
                      {activeOrders.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                          {activeOrders.map((ord, idx) => (
                            <button
                              key={ord.id}
                              type="button"
                              onClick={() => setSelectedOrderIdx(idx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                                selectedOrderIdx === idx
                                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-600 shadow-xs'
                                  : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                              }`}
                            >
                              <span>#{ord.nomor_pesanan?.slice(-5) || ord.nomor_pesanan}</span>
                              {ord.meja_nomor && <span className="ml-1 text-[10px] text-zinc-400">&bull; Meja {ord.meja_nomor}</span>}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Selected Active Order Card */}
                      {currentOrder && (
                        <div className="space-y-4 animate-fade">
                          {/* Order Overview Header Card */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800/70">
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                                  Nomor Pesanan
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm sm:text-base">
                                    {currentOrder.nomor_pesanan}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(currentOrder.nomor_pesanan);
                                      setCopiedTrackNo(true);
                                      setTimeout(() => setCopiedTrackNo(false), 2000);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                                    title="Salin No. Pesanan"
                                  >
                                    {copiedTrackNo ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                  </button>
                                  {copiedTrackNo && (
                                    <span className="text-[10px] text-emerald-600 dark:text-zinc-300 font-medium">Tersalin</span>
                                  )}
                                </div>
                              </div>

                              {/* Status Badges */}
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                                  {currentOrder.status_pesanan === 'menunggu' && 'Menunggu Konfirmasi'}
                                  {currentOrder.status_pesanan === 'proses' && 'Sedang Diracik'}
                                  {currentOrder.status_pesanan === 'siap' && 'Siap Disajikan'}
                                  {currentOrder.status_pesanan === 'selesai' && 'Selesai'}
                                </span>
                                
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase ${
                                  currentOrder.status_pembayaran === 'paid'
                                    ? 'bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-zinc-300 border border-emerald-200 dark:border-zinc-700'
                                    : 'bg-amber-50 dark:bg-zinc-900 text-amber-700 dark:text-zinc-400 border border-amber-200 dark:border-zinc-800'
                                }`}>
                                  {currentOrder.status_pembayaran === 'paid' ? 'Lunas' : 'Menunggu Bayar di Kasir'}
                                </span>
                              </div>
                            </div>

                            {/* Metadata Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                                <span className="text-[10px] text-zinc-500 block">Layanan / Meja</span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {currentOrder.meja_nomor ? `Meja ${currentOrder.meja_nomor}` : currentOrder.tipe_pesanan === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
                                <span className="text-[10px] text-zinc-500 block">Status Kasir</span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                                  {currentOrder.status_pesanan}
                                </span>
                              </div>
                              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-zinc-500 block">Waktu Pesan</span>
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                  {currentOrder.created_at || '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* 4-Stage Visual Progress Stepper */}
                          <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-zinc-900 dark:text-white text-xs">Tahapan Pemrosesan</h4>
                              <span className="text-[10px] text-zinc-500">Dapur &amp; Barista</span>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5">
                              {/* Step 1: Diterima */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                                ['menunggu', 'proses', 'siap', 'selesai'].includes(currentOrder.status_pesanan)
                                  ? 'bg-white dark:bg-zinc-800/90 border-emerald-500/50 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-2xs'
                                  : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                              }`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  ['menunggu', 'proses', 'siap', 'selesai'].includes(currentOrder.status_pesanan)
                                    ? 'bg-emerald-600 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                  <Clock size={13} />
                                </div>
                                <span className="text-[10px] font-bold leading-tight">1. Diterima</span>
                              </div>

                              {/* Step 2: Diracik */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                                ['proses', 'siap', 'selesai'].includes(currentOrder.status_pesanan)
                                  ? 'bg-white dark:bg-zinc-800/90 border-emerald-500/50 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-2xs'
                                  : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                              }`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  ['proses', 'siap', 'selesai'].includes(currentOrder.status_pesanan)
                                    ? 'bg-emerald-600 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                  <ChefHat size={13} />
                                </div>
                                <span className="text-[10px] font-bold leading-tight">2. Diracik</span>
                              </div>

                              {/* Step 3: Siap */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                                ['siap', 'selesai'].includes(currentOrder.status_pesanan)
                                  ? 'bg-white dark:bg-zinc-800/90 border-emerald-500/50 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-2xs'
                                  : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                              }`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  ['siap', 'selesai'].includes(currentOrder.status_pesanan)
                                    ? 'bg-emerald-600 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                  <Coffee size={13} />
                                </div>
                                <span className="text-[10px] font-bold leading-tight">3. Siap</span>
                              </div>

                              {/* Step 4: Selesai */}
                              <div className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                                currentOrder.status_pesanan === 'selesai'
                                  ? 'bg-white dark:bg-zinc-800/90 border-emerald-500/50 dark:border-zinc-600 text-zinc-900 dark:text-white shadow-2xs'
                                  : 'bg-zinc-100/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                              }`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                  currentOrder.status_pesanan === 'selesai'
                                    ? 'bg-emerald-600 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                                }`}>
                                  <CheckCircle2 size={13} />
                                </div>
                                <span className="text-[10px] font-bold leading-tight">4. Selesai</span>
                              </div>
                            </div>
                          </div>

                          {/* Order Details & Items List */}
                          {currentOrder.details && currentOrder.details.length > 0 && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
                              <span className="font-bold text-zinc-900 dark:text-white text-xs block">Rincian Menu Pesanan</span>
                              <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60 max-h-48 overflow-y-auto pr-1">
                                {currentOrder.details.map((d: any) => (
                                  <div key={d.id} className="py-2 flex items-start justify-between gap-3 text-zinc-700 dark:text-zinc-300">
                                    <div className="space-y-0.5">
                                      <div className="font-semibold text-zinc-900 dark:text-white">
                                        <span className="text-zinc-400 mr-1.5">{d.jumlah}x</span>
                                        {d.nama_produk}
                                      </div>
                                      {d.nama_varian && (
                                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400">Varian: {d.nama_varian}</div>
                                      )}
                                      {d.catatan_khusus && (
                                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">"{d.catatan_khusus}"</div>
                                      )}
                                    </div>
                                    <span className="text-zinc-900 dark:text-zinc-200 font-mono font-medium shrink-0 pt-0.5">
                                      {rupiah(d.subtotal)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Bill Summary */}
                              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                                {currentOrder.diskon > 0 && (
                                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400 text-[11px]">
                                    <span>Diskon</span>
                                    <span className="text-emerald-600 dark:text-zinc-300 font-mono">-{rupiah(currentOrder.diskon)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-zinc-900 dark:text-white text-sm pt-1">
                                  <span>Total Tagihan</span>
                                  <span className="text-emerald-600 dark:text-white font-mono">{rupiah(currentOrder.total)}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bayar QRIS Midtrans (Jika belum bayar) */}
                          {currentOrder.status_pembayaran === 'unpaid' && (
                            <button
                              type="button"
                              onClick={() => handlePayWithMidtrans(currentOrder.nomor_pesanan)}
                              className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                            >
                              <QrCode size={14} />
                              <span>Bayar QRIS Sekarang (Midtrans)</span>
                            </button>
                          )}

                          {/* Actions: Refresh & WhatsApp CS */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              disabled={orderHubLoading}
                              onClick={refreshMyOrders}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-transparent text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw size={13} className={orderHubLoading ? 'animate-spin' : ''} />
                              <span>Refresh Status</span>
                            </button>

                            <a
                              href={getWhatsAppUrl(settings?.telepon, `Halo ${cleanStoreName}, saya ingin menanyakan status pesanan ${currentOrder.nomor_pesanan}`)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle size={14} />
                              <span>Bantuan Kasir</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ── TAB 2: RIWAYAT PESANAN SELESAI ── */}
              {orderHubTab === 'history' && (
                <div className="space-y-3">
                  {historyOrders.length === 0 ? (
                    <div className="text-center py-10 px-4 space-y-2 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/60">
                      <p className="font-bold text-zinc-900 dark:text-white text-xs">Belum Ada Riwayat Pesanan</p>
                      <p className="text-[11px] text-zinc-500">
                        Pesanan yang telah selesai disajikan akan tersimpan rapi di sini.
                      </p>
                    </div>
                  ) : (
                    historyOrders.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2.5 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/60">
                          <div>
                            <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs block">
                              {ord.nomor_pesanan}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {ord.created_at} &bull; {ord.meja_nomor ? `Meja ${ord.meja_nomor}` : ord.tipe_pesanan === 'dine_in' ? 'Dine-In' : 'Takeaway'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            ord.status_pesanan === 'selesai'
                              ? 'bg-emerald-50 dark:bg-zinc-800 text-emerald-700 dark:text-zinc-300 border border-emerald-200 dark:border-zinc-700'
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                          }`}>
                            {ord.status_pesanan}
                          </span>
                        </div>

                        {ord.details && ord.details.length > 0 && (
                          <div className="space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
                            {ord.details.map((d: any, idx: number) => (
                              <div key={idx} className="flex justify-between">
                                <span>{d.jumlah}x {d.nama_produk}</span>
                                <span className="font-mono text-zinc-700 dark:text-zinc-500">{rupiah(d.subtotal)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800/60 font-semibold">
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Total Pembayaran</span>
                          <span className="text-zinc-900 dark:text-white font-mono text-xs">{rupiah(ord.total)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 13. CUSTOMER SETTINGS & PROFILE MODAL (macOS Style Window) ── */}
      {customerSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs transition-all animate-fade"
          onClick={() => setCustomerSettingsOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col my-auto max-h-[85vh] text-zinc-900 dark:text-zinc-100"
            onClick={e => e.stopPropagation()}
          >
            {/* macOS Window Titlebar */}
            <div className="h-12 px-4 sm:px-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/70 select-none shrink-0">
              {/* macOS Traffic Lights */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerSettingsOpen(false)}
                  className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] hover:opacity-85 transition-opacity flex items-center justify-center group"
                  title="Tutup"
                >
                  <X size={8} className="opacity-0 group-hover:opacity-100 text-zinc-950 stroke-[3] transition-opacity" />
                </button>
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>

              {/* Centered Window Title */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
                <Settings size={13} className="text-emerald-500" />
                <span>{isLoggedIn ? 'Pengaturan Akun • Jelang Hari' : 'Preferensi Tampilan • Jelang Hari'}</span>
              </div>

              {/* Right Close Button */}
              <button
                type="button"
                onClick={() => setCustomerSettingsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                title="Tutup Pengaturan"
              >
                <X size={16} />
              </button>
            </div>

            {!isLoggedIn ? (
              /* GUEST VIEW: Clean, Focused Appearance & Language Settings with Login/Register CTA */
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* 1. Theme Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      {isDarkMode ? <Moon size={15} className="text-zinc-400" /> : <Sun size={15} className="text-amber-500" />}
                      <span>{lang === 'id' ? 'Mode Tampilan Antarmuka' : 'Appearance Theme'}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {lang === 'id'
                      ? 'Pilih tema visual yang nyaman untuk tampilan beranda dan katalog menu.'
                      : 'Choose your preferred visual theme for viewing menu and store items.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {/* Light Mode Button */}
                    <button
                      type="button"
                      onClick={() => toggleTheme('light')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        !isDarkMode
                          ? 'bg-amber-500/10 border-amber-500/60 text-zinc-900 dark:text-white shadow-xs font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-xl ${!isDarkMode ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                          <Sun size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs block font-bold leading-tight">Terang</span>
                          <span className="text-[9px] text-zinc-500 block leading-tight">Light Mode</span>
                        </div>
                      </div>
                      {!isDarkMode && (
                        <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>

                    {/* Dark Mode Button */}
                    <button
                      type="button"
                      onClick={() => toggleTheme('dark')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        isDarkMode
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-zinc-900 dark:text-white shadow-xs font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`p-1.5 rounded-xl ${isDarkMode ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'}`}>
                          <Moon size={14} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs block font-bold leading-tight">Gelap</span>
                          <span className="text-[9px] text-zinc-500 block leading-tight">Dark Mode</span>
                        </div>
                      </div>
                      {isDarkMode && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Language Selection */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                      <Globe size={15} className="text-emerald-500" />
                      <span>{lang === 'id' ? 'Pilihan Bahasa' : 'Language Selection'}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{lang}</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    {lang === 'id'
                      ? 'Bahasa navigasi, instruksi pesanan, dan tombol menu.'
                      : 'Language for navigation, ordering prompts, and menu labels.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {/* Indonesian */}
                    <button
                      type="button"
                      onClick={() => changeLanguage('id')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        lang === 'id'
                          ? 'bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-white shadow-xs font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          ID
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs block font-bold leading-tight">Indonesia</span>
                          <span className="text-[9px] text-zinc-500 block leading-tight">Bahasa resmi</span>
                        </div>
                      </div>
                      {lang === 'id' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>

                    {/* English */}
                    <button
                      type="button"
                      onClick={() => changeLanguage('en')}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2.5 ${
                        lang === 'en'
                          ? 'bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-white shadow-xs font-bold'
                          : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          EN
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs block font-bold leading-tight">English</span>
                          <span className="text-[9px] text-zinc-500 block leading-tight">Global labels</span>
                        </div>
                      </div>
                      {lang === 'en' && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. Guest Account Call to Action */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">
                      {lang === 'id' ? 'Member Club & Poin Loyalitas' : 'Member Club & Loyalty Points'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {lang === 'id'
                      ? 'Daftar atau masuk ke akun Anda untuk mendapatkan poin setiap transaksi dan melihat riwayat pesanan otomatis.'
                      : 'Sign in or register to collect points on every order and track your orders automatically.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/login"
                      onClick={() => setCustomerSettingsOpen(false)}
                      className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <LogIn size={13} />
                      <span>{dict.masukAkun}</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setCustomerSettingsOpen(false)}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs text-center transition flex items-center justify-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
                    >
                      <UserPlus size={13} />
                      <span>{dict.daftarAkun}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* macOS Segmented Tab Navigation for Logged-In User */}
                <div className="p-3 bg-zinc-50/60 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                  <div className="flex p-1 bg-zinc-100 dark:bg-zinc-950/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 gap-1 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSettingsTab('profile')}
                      className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        settingsTab === 'profile'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <User size={13} className={settingsTab === 'profile' ? 'text-emerald-500' : ''} />
                      <span>Profil &amp; Kontak</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsTab('preferences')}
                      className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        settingsTab === 'preferences'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {isDarkMode ? (
                        <Moon size={13} className={settingsTab === 'preferences' ? 'text-emerald-500' : ''} />
                      ) : (
                        <Sun size={13} className={settingsTab === 'preferences' ? 'text-amber-500' : ''} />
                      )}
                      <span>Tema &amp; Bahasa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsTab('security')}
                      className={`flex-1 min-w-[90px] py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        settingsTab === 'security'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Lock size={13} className={settingsTab === 'security' ? 'text-emerald-500' : ''} />
                      <span>Kata Sandi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsTab('orders')}
                      className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                        settingsTab === 'orders'
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs border border-zinc-200 dark:border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      <Clock size={13} className={settingsTab === 'orders' ? 'text-emerald-500' : ''} />
                      <span>Pesanan</span>
                      {customerOrders && customerOrders.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-500 text-[9px] font-bold">
                          {customerOrders.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Modal Body for Logged-In User */}
                <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* ── TAB 1: PROFIL & KONTAK ── */}
              {settingsTab === 'profile' && (
                <div className="space-y-5">
                  {/* Member Perks Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-zinc-900 border border-emerald-600/30 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                          Jelang Hari Member Club
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs font-semibold">{userName || 'Pelanggan Setia'}</p>
                      <p className="text-[11px] text-zinc-400">Dapatkan promo khusus dan diskon setiap transaksi.</p>
                    </div>
                    <div className="text-right shrink-0 bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800">
                      <span className="text-[10px] text-zinc-500 uppercase block font-medium">Saldo Poin</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        {customerPoin}
                      </span>
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-400 rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="p-3 bg-red-950/60 border border-red-500 text-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Nama Lengkap</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          required
                          placeholder="Nama Anda"
                          className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Alamat Email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          required
                          placeholder="email@contoh.com"
                          className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">No. WhatsApp / HP</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="tel"
                          value={editTelepon}
                          onChange={e => setEditTelepon(e.target.value)}
                          placeholder="08123456789"
                          className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500">Nomor ini digunakan untuk pelacakan otomatis saat memesan menu.</p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
                      >
                        {savingProfile ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Menyimpan Perubahan...</span>
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            <span>Simpan Perubahan Profil</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── TAB 2: PREFERENSI & BAHASA ── */}
              {settingsTab === 'preferences' && (
                <div className="space-y-5">
                  {/* Theme Mode Toggle (Dark / Light) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                        {isDarkMode ? <Moon size={16} className="text-emerald-500" /> : <Sun size={16} className="text-amber-500" />}
                        <span>Mode Tampilan Antarmuka</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                      </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                      Pilih tema visual yang nyaman untuk tampilan beranda, katalog menu, dan sistem Jelang Hari.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Light Mode */}
                      <button
                        type="button"
                        onClick={() => toggleTheme('light')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                          !isDarkMode
                            ? 'bg-amber-500/10 border-2 border-amber-500 text-zinc-900 dark:text-white shadow-md shadow-amber-500/10'
                            : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${
                            !isDarkMode 
                              ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' 
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                          }`}>
                            <Sun size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs block text-zinc-900 dark:text-white leading-tight">Mode Terang</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">Tampilan bersih cerah</span>
                          </div>
                        </div>
                        {!isDarkMode ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0 group-hover:border-zinc-400" />
                        )}
                      </button>

                      {/* Dark Mode */}
                      <button
                        type="button"
                        onClick={() => toggleTheme('dark')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 group ${
                          isDarkMode
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500 text-zinc-900 dark:text-white shadow-md shadow-emerald-500/10'
                            : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${
                            isDarkMode 
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30' 
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                          }`}>
                            <Moon size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs block text-zinc-900 dark:text-white leading-tight">Mode Gelap</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">Rileks di mata &amp; hemat daya</span>
                          </div>
                        </div>
                        {isDarkMode ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 shrink-0 group-hover:border-zinc-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-1 pt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                      <span>Pintasan keyboard cepat:</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[9px] border border-zinc-200 dark:border-zinc-700">
                        Ctrl + Shift + L
                      </kbd>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-sm flex items-center gap-2">
                        <Globe size={16} className="text-emerald-500" />
                        <span>Pilihan Bahasa / Language Selection</span>
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">{lang}</span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                      Tentukan bahasa pengantar untuk navigasi, katalog menu, dan instruksi pesanan.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Indonesian */}
                      <button
                        type="button"
                        onClick={() => changeLanguage('id')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                          lang === 'id'
                            ? 'bg-emerald-500/10 border-2 border-emerald-500 text-zinc-900 dark:text-white shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            lang === 'id'
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                          }`}>
                            ID
                          </span>
                          {lang === 'id' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-zinc-900 dark:text-white leading-tight">Bahasa Indonesia</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">Tampilan standar kafe dalam Bahasa Indonesia.</span>
                        </div>
                      </button>

                      {/* English */}
                      <button
                        type="button"
                        onClick={() => changeLanguage('en')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                          lang === 'en'
                            ? 'bg-emerald-500/10 border-2 border-emerald-500 text-zinc-900 dark:text-white shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                            lang === 'en'
                              ? 'bg-emerald-500 text-white border-emerald-400'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                          }`}>
                            EN
                          </span>
                          {lang === 'en' ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs block text-zinc-900 dark:text-white leading-tight">English</span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">International menu view &amp; English labels.</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1.5 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                        <Sparkles size={14} className="text-emerald-500" />
                        <span className="font-semibold text-xs">Pelacakan Pesanan Otomatis</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                        Aktif
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Status sajian pesanan dan antrean barista akan terupdate secara real-time tanpa perlu refresh browser.
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 3: GANTI KATA SANDI ── */}
              {settingsTab === 'security' && (
                <div className="space-y-4">
                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500 text-emerald-400 rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-red-950/60 border border-red-500 text-red-400 rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Kata Sandi Saat Ini</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          required
                          placeholder="Masukkan password saat ini"
                          className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Kata Sandi Baru</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          required
                          placeholder="Minimal 8 karakter"
                          className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        >
                          {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-zinc-700 dark:text-zinc-300 block">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                        <input
                          type="password"
                          value={newPasswordConfirmation}
                          onChange={e => setNewPasswordConfirmation(e.target.value)}
                          required
                          placeholder="Ulangi kata sandi baru"
                          className="w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:border-emerald-500 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2"
                      >
                        {savingPassword ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            <span>Memperbarui Kata Sandi...</span>
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            <span>Simpan Kata Sandi Baru</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── TAB 4: RIWAYAT PESANAN ── */}
              {settingsTab === 'orders' && (
                <div className="space-y-3">
                  {!customerOrders || customerOrders.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 space-y-2">
                      <Clock size={36} className="mx-auto text-zinc-400 dark:text-zinc-700" />
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Belum ada riwayat pesanan.</p>
                      <p className="text-[11px] text-zinc-500">Pesanan yang Anda buat akan muncul otomatis di sini.</p>
                    </div>
                  ) : (
                    customerOrders.map(order => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white text-xs">{order.nomor_pesanan}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                order.status_pesanan === 'selesai'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : order.status_pesanan === 'proses'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {order.status_pesanan}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500">{order.created_at}</p>
                          <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{rupiah(order.total)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSettingsOpen(false);
                            setTrackQuery(order.nomor_pesanan);
                            setTrackOpen(true);
                            handleTrackOrder(undefined, order.nomor_pesanan);
                          }}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-emerald-600 dark:bg-zinc-800 text-zinc-700 hover:text-white dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1 border border-zinc-200 dark:border-zinc-700"
                        >
                          <Search size={13} />
                          <span>Lacak</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI KELUAR AKUN (macOS Alert Style) ── */}
      {confirmLogoutOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade"
          onClick={() => setConfirmLogoutOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl p-6 text-center space-y-4 my-auto max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <LogIn size={26} className="rotate-180" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Konfirmasi Keluar Akun</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Apakah Anda yakin ingin keluar dari akun Jelang Hari? Anda harus masuk kembali untuk menggunakan poin loyalitas dan riwayat pesanan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmLogoutOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI SIMPAN PROFIL (macOS Alert Style) ── */}
      {confirmProfileOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade"
          onClick={() => setConfirmProfileOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl p-6 text-center space-y-4 my-auto max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={26} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Simpan Perubahan Profil?</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Data profil Anda (nama, email, no. telepon) akan disimpan dan disinkronkan ke akun member Jelang Hari.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmProfileOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSaveProfile}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition"
              >
                Ya, Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI GANTI KATA SANDI (macOS Alert Style) ── */}
      {confirmPasswordOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade"
          onClick={() => setConfirmPasswordOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl p-6 text-center space-y-4 my-auto max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Lock size={26} />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white">Ubah Kata Sandi Akun?</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Kata sandi akan diganti. Pastikan Anda mengingat atau mencatat kata sandi baru untuk login berikutnya.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmPasswordOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSavePassword}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-950/40 transition"
              >
                Ya, Perbarui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 14. MOBILE STICKY FLOATING CART BAR ── */}
      {cartCount > 0 && !cartOpen && (
        <div className="fixed bottom-4 left-3 right-3 sm:hidden z-40 animate-fade">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white p-3.5 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between font-semibold text-xs transition-all border border-emerald-400/30 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center font-bold text-xs text-white border border-emerald-400/20">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Keranjang ({cartCount} Menu)
                </span>
                <span className="text-sm font-extrabold text-white">
                  {rupiah(grandTotal || cartSubtotal)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-emerald-950 px-3.5 py-2 rounded-xl shadow-sm">
              <span>Buka</span>
              <ArrowRight size={14} />
            </div>
          </button>
        </div>
      )}

      {/* ── 15. MODAL POP-UP RESERVASI MEJA & WORKSPACE ── */}
      <CustomerReservationModal
        isOpen={reservationOpen}
        onClose={() => setReservationOpen(false)}
        mejas={mejas}
        settings={settings}
        userName={userName}
        userTelepon={userTelepon}
      />

      {/* ── 16. BUKU PANDUAN & GLOSARIUM KAFE MODAL (HelpCenterModal) ── */}
      <HelpCenterModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* ── 17. GUEST CHECKOUT / REQUIRE LOGIN MODAL ── */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Proteksi Pemesanan Online
                </span>
                <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Masuk atau Buat Akun Dulu
                </h3>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Untuk kenyamanan pelacakan status pesanan secara real-time dan pencatatan poin member Jelang Hari, silakan masuk ke akun Anda. Menu di keranjang Anda <strong>tetap tersimpan aman</strong>.
            </p>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Keranjang Tersimpan:</span>
              <span className="font-bold text-zinc-900 dark:text-white">
                {cartCount} Menu • {rupiah(grandTotal || cartSubtotal)}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <a
                href="/login"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition hover:scale-[1.01]"
              >
                <LogIn size={16} />
                <span>Masuk ke Akun Saya</span>
              </a>

              <a
                href="/register"
                className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 transition"
              >
                <UserPlus size={16} />
                <span>Daftar Akun Baru (Dapat Poin Member)</span>
              </a>

              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="w-full py-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-medium transition cursor-pointer"
              >
                Lanjut Lihat-Lihat Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
