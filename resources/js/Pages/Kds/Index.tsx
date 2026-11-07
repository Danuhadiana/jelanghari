import React, { useEffect, useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { 
    Clock, Coffee, Utensils, CheckCircle, RefreshCw, ArrowLeft, 
    Check, Sparkles, MoveRight, Eye, X, AlertCircle, ChefHat, 
    Flame, BellRing, MapPin, Undo2, History, Layers, ChevronRight,
    Sun, Moon, BookOpen, Scale, Droplet, Zap, Plus, Trash2, Edit3, 
    Save, Search, CheckCircle2, Loader2, BookMarked, Settings
} from 'lucide-react';
import { rupiah } from '@/lib/format';

interface ResepBahan {
    id: number;
    jumlah_pemakaian: number;
    bahan_baku_id?: number;
    bahan_baku?: {
        id: number;
        nama: string;
        satuan: string;
        kategori?: string;
    };
    bahanBaku?: {
        id: number;
        nama: string;
        satuan: string;
        kategori?: string;
    };
}

interface BahanBakuItem {
    id: number;
    kode?: string;
    nama: string;
    kategori?: string;
    satuan: string;
    stok?: number;
    min_stok?: number;
}

interface ProdukItem {
    id: number;
    kode?: string;
    nama: string;
    station?: string;
    resep?: ResepBahan[];
    kategori?: { slug?: string; nama?: string };
}

interface OrderItem {
    id: number;
    nama_produk: string;
    nama_varian?: string | null;
    jumlah?: number;
    qty?: number;
    harga_satuan?: number;
    subtotal?: number;
    catatan?: string | null;
    catatan_khusus?: string | null;
    status_kds?: string;
    produk?: {
        id?: number;
        nama?: string;
        station?: string;
        kategori?: { slug?: string; nama?: string };
        resep?: ResepBahan[];
    };
    modifiers?: Array<{ nama_modifier: string }>;
}

interface Order {
    id: number;
    nomor_pesanan?: string;
    no_struk?: string;
    tipe_pesanan?: string;
    tipe?: string;
    created_at: string;
    updated_at?: string;
    waktu_selesai?: string | null;
    total?: number;
    meja?: { 
        id?: number;
        nomor?: string; 
        no_meja?: string; 
        nama?: string; 
        area?: string; 
        kapasitas?: number;
    } | null;
    details?: OrderItem[];
    items?: OrderItem[];
    nama_pelanggan?: string | null;
    telepon_pelanggan?: string | null;
    status_pesanan?: string;
    catatan?: string | null;
}

interface Props {
    orders: Order[];
    historyOrders?: Order[];
    currentStation?: string;
    bahanBakus?: BahanBakuItem[];
    allProduks?: ProdukItem[];
    customSops?: Record<string, string[]>;
}

// ── Smart Recipe & Proportion Resolver (Mendukung Custom SOP & BOM) ──
function getRecipeGuide(
    item: OrderItem,
    customSops?: Record<string, string[]>
): {
    bahanList: Array<{ bahan_baku_id?: number; nama: string; takaran: string; jumlah_pemakaian?: number; satuan?: string; catatan?: string }>;
    instruksiRacik: string[];
} {
    const prodId = item.produk?.id;
    const customStepKey = prodId ? `resep_sop_${prodId}` : undefined;
    const hasCustomSop = customStepKey && customSops && Array.isArray(customSops[customStepKey]) && customSops[customStepKey].length > 0;

    // 1. Cek resep dari database jika telah dikonfigurasi
    const dbResep = item.produk?.resep;
    if (dbResep && dbResep.length > 0) {
        const bahanList = dbResep.map(r => {
            const b = r.bahanBaku || r.bahan_baku;
            return {
                bahan_baku_id: b?.id || r.bahan_baku_id,
                nama: b?.nama || 'Bahan Baku',
                jumlah_pemakaian: Number(r.jumlah_pemakaian) || 1,
                satuan: b?.satuan || 'gr',
                takaran: `${r.jumlah_pemakaian} ${b?.satuan || 'gr'}`,
                catatan: b?.kategori ? `Kategori: ${b.kategori}` : undefined
            };
        });

        const isBarista = item.produk?.station === 'barista' || !item.produk?.station;
        const defaultInstruksi = isBarista ? [
            'Giling biji kopi dengan grind size sesuai metode penyeduhan.',
            'Ekstraksi espresso tepat 25-28 detik pada suhu 92-94°C.',
            'Campur takaran bahan dengan susu/sirup sesuai rasio standar.',
            'Aduk rata, tambahkan es batu hingga 3/4 cup dan sajikan segera.'
        ] : [
            'Siapkan dan timbang takaran bahan baku sesuai takaran porsi.',
            'Masak dengan tingkat kematangan optimal dan bumbu merata.',
            'Plating rapi pada piring/mangkuk saji dan cek kebersihan sebelum disajikan.'
        ];

        return {
            bahanList,
            instruksiRacik: hasCustomSop ? customSops[customStepKey!] : defaultInstruksi
        };
    }

    // 2. Panduan Racikan Cerdas Otomatis berdasarkan nama menu & kategori
    const name = item.nama_produk.toLowerCase();

    let guide: {
        bahanList: Array<{ bahan_baku_id?: number; nama: string; takaran: string; jumlah_pemakaian?: number; satuan?: string; catatan?: string }>;
        instruksiRacik: string[];
    };

    if (name.includes('aren') || name.includes('senja') || (name.includes('kopi') && name.includes('susu'))) {
        guide = {
            bahanList: [
                { nama: 'House Blend Espresso Beans', takaran: '18 gram', catatan: 'Yield 36ml Double Shot' },
                { nama: 'Fresh Milk UHT', takaran: '120 ml', catatan: 'Dingin / Steamed 65°C' },
                { nama: 'Sirup Gula Aren Cair', takaran: '25 ml', catatan: 'Tuang di dasar cup' },
                { nama: 'Es Batu Kristal', takaran: '120 gram', catatan: 'Hanya untuk pesanan dingin' }
            ],
            instruksiRacik: [
                'Tuang 25ml sirup gula aren di dasar cup saji.',
                'Masukkan es batu kristal 120 gram.',
                'Tuangkan fresh milk dingin 120ml perlahan (layering putih).',
                'Ekstraksi double espresso 36ml dan tuangkan di bagian atas (layer gradasi cantik).'
            ]
        };
    } else if (name.includes('americano') || name.includes('long black')) {
        guide = {
            bahanList: [
                { nama: 'House Blend Espresso Beans', takaran: '18 gram', catatan: 'Double espresso 36ml yield' },
                { nama: 'Air Mineral Panas / Dingin', takaran: '150 ml', catatan: 'Suhu 90°C untuk panas' },
                { nama: 'Es Batu Kristal', takaran: '100 gram', catatan: 'Khusus pesanan Iced' }
            ],
            instruksiRacik: [
                'Tuang air mineral 150ml ke dalam cup saji terlebih dahulu.',
                'Ekstraksi double shot espresso di atas air agar crema tetap tebal.',
                'Tambahkan es batu jika pelanggan memesan dingin.'
            ]
        };
    } else if (name.includes('latte') || name.includes('cappuccino') || name.includes('flat white')) {
        guide = {
            bahanList: [
                { nama: 'House Blend Espresso Beans', takaran: '18 gram', catatan: 'Double shot 36ml' },
                { nama: 'Fresh Milk Barista Edition', takaran: '180 ml', catatan: 'Steam microfoam 60-65°C' }
            ],
            instruksiRacik: [
                'Ekstraksi double shot espresso ke dalam cangkir/cup.',
                'Steam fresh milk hingga suhu 60-65°C sampai terbentuk microfoam lembut.',
                'Pouring susu perlahan sambil membentuk pola latte art.'
            ]
        };
    } else if (name.includes('manual') || name.includes('v60') || name.includes('filter') || name.includes('kalita')) {
        guide = {
            bahanList: [
                { nama: 'Single Origin Coffee Beans', takaran: '15 gram', catatan: 'Medium Coarse grind' },
                { nama: 'Air Mineral Seduh', takaran: '225 ml', catatan: 'Suhu 91-93°C (Rasio 1:15)' }
            ],
            instruksiRacik: [
                'Bilas paper filter dengan air panas untuk menghilangkan bau kertas.',
                'Bloom: Tuang 45ml air pertama selama 40 detik.',
                'Penuangan ke-2: Tuang hingga 135ml dengan gerakan melingkar stabil.',
                'Penuangan ke-3: Selesaikan hingga 225ml. Total brew time ~2 menit 30 detik.'
            ]
        };
    } else if (name.includes('matcha')) {
        guide = {
            bahanList: [
                { nama: 'Kyoto Pure Matcha Powder', takaran: '12 gram', catatan: 'Ayak halus' },
                { nama: 'Air Panas (80°C)', takaran: '30 ml', catatan: 'Untuk whisk matcha' },
                { nama: 'Fresh Milk', takaran: '150 ml', catatan: 'Dingin / Hot steamed' },
                { nama: 'Simple Syrup', takaran: '15 ml', catatan: 'Sesuaikan dengan catatan gula' }
            ],
            instruksiRacik: [
                'Whisk bubuk matcha 12 gram dengan 30ml air panas hingga larut sempurna dan berbusa.',
                'Siapkan cup dengan simple syrup, es batu, dan tuangkan fresh milk.',
                'Tuang matcha whisk di atas susu untuk menghasilkan gradasi hijau estetik.'
            ]
        };
    } else if (name.includes('tea') || name.includes('teh') || name.includes('earl grey')) {
        guide = {
            bahanList: [
                { nama: 'Artisan Tea Leaves / Bag', takaran: '4-5 gram', catatan: 'Loose leaf' },
                { nama: 'Air Panas (90°C)', takaran: '220 ml', catatan: 'Steep 3-4 menit' },
                { nama: 'Simple Syrup / Madu', takaran: '15 ml', catatan: 'Opsional' }
            ],
            instruksiRacik: [
                'Seduh daun teh dengan air panas 90°C selama 3-4 menit.',
                'Saring daun teh, tambahkan pemanis jika diminta, lalu sajikan panas atau dengan es batu.'
            ]
        };
    } else {
        guide = {
            bahanList: [
                { nama: 'Bahan Pokok Porsi Menu', takaran: '1 porsi standar', catatan: 'Sesuai SOP dapur Jelang Hari' },
                { nama: 'Bumbu & Pelengkap', takaran: 'Secukupnya', catatan: 'Garnish & kemasan saji' }
            ],
            instruksiRacik: [
                'Periksa catatan khusus pelanggan (less sugar / ekstra saus).',
                'Racik/masak dengan higienitas dan suhu penyajian optimal.',
                'Cek kesesuaian nomor meja sebelum diantar waiter.'
            ]
        };
    }

    if (hasCustomSop && customStepKey && customSops) {
        guide.instruksiRacik = customSops[customStepKey];
    }

    return guide;
}

export default function Index({ 
    orders: initialOrders = [], 
    historyOrders: initialHistoryOrders = [], 
    currentStation = 'all',
    bahanBakus = [],
    allProduks = [],
    customSops = {},
}: Props) {
    const { auth } = usePage<any>().props;
    const userRole = (typeof auth?.user?.role === 'string' ? auth.user.role : (auth?.user?.role_slug || auth?.user?.role?.slug || '')).toLowerCase();
    const isOwnerOrManager = ['owner', 'manager'].includes(userRole);
    const isKasir = userRole === 'kasir';

    const backUrl = isOwnerOrManager ? '/dashboard' : (isKasir ? '/kasir' : '/');
    const backLabel = isOwnerOrManager ? 'Dashboard' : (isKasir ? 'Kasir POS' : 'Beranda');
    const backTitle = isOwnerOrManager ? 'Kembali ke Dashboard' : (isKasir ? 'Kembali ke Kasir POS' : 'Kembali ke Beranda Kafe');

    const [orders, setOrders] = useState<Order[]>(initialOrders || []);
    const [historyOrders, setHistoryOrders] = useState<Order[]>(initialHistoryOrders || []);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [filterStation, setFilterStation] = useState<string>(currentStation || 'all');
    
    // Master data bahan baku & produk untuk resep
    const [bahanBakusList] = useState<BahanBakuItem[]>(bahanBakus || []);
    const [allProduksState, setAllProduksState] = useState<ProdukItem[]>(allProduks || []);
    const [customSopsState, setCustomSopsState] = useState<Record<string, string[]>>(customSops || {});

    // State Edit Resep di KDS
    const [isEditingRecipe, setIsEditingRecipe] = useState<boolean>(false);
    const [recipeFormBahan, setRecipeFormBahan] = useState<Array<{ bahan_baku_id: number; jumlah_pemakaian: number }>>([]);
    const [recipeFormInstruksi, setRecipeFormInstruksi] = useState<string[]>([]);
    const [isSavingRecipe, setIsSavingRecipe] = useState<boolean>(false);
    const [recipeSaveNotice, setRecipeSaveNotice] = useState<string>('');

    // State Katalog Resep & SOP Dapur
    const [isRecipeCatalogOpen, setIsRecipeCatalogOpen] = useState<boolean>(false);
    const [catalogSearch, setCatalogSearch] = useState<string>('');
    const [catalogStation, setCatalogStation] = useState<'all' | 'barista' | 'kitchen'>('all');

    // State Pengaturan Tampilan & KDS
    const [isKdsSettingsOpen, setIsKdsSettingsOpen] = useState<boolean>(false);

    // Rush Mode / Keramaian Pelanggan State
    const [isRushMode, setIsRushMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('jh_kds_rush_mode') === 'true';
        }
        return false;
    });

    const toggleRushMode = () => {
        setIsRushMode(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem('jh_kds_rush_mode', String(next));
            }
            return next;
        });
    };

    // Modal Details & Recipe Viewer
    const [detailOrder, setDetailOrder] = useState<Order | null>(null);
    const [modalActiveSection, setModalActiveSection] = useState<'details' | 'recipe'>('details');
    const [selectedRecipeItem, setSelectedRecipeItem] = useState<OrderItem | null>(null);

    // Buka mode edit untuk resep item terpilih
    const handleStartEditRecipe = (itemToEdit?: OrderItem | any | null) => {
        const it = itemToEdit || selectedRecipeItem;
        if (!it) return;

        setSelectedRecipeItem(it);
        setRecipeSaveNotice('');

        const guide = getRecipeGuide(it, customSopsState);

        // Ambil data bahan dari database produk jika ada, atau konversi dari guide
        const dbResep = it.produk?.resep;
        let initialBahan: Array<{ bahan_baku_id: number; jumlah_pemakaian: number }> = [];

        if (dbResep && dbResep.length > 0) {
            initialBahan = dbResep.map(r => ({
                bahan_baku_id: r.bahan_baku_id || r.bahanBaku?.id || r.bahan_baku?.id || (bahanBakusList[0]?.id || 1),
                jumlah_pemakaian: Number(r.jumlah_pemakaian) || 1,
            }));
        } else {
            initialBahan = guide.bahanList.map(b => {
                const matched = bahanBakusList.find(bb =>
                    bb.nama.toLowerCase().includes(b.nama.toLowerCase()) ||
                    b.nama.toLowerCase().includes(bb.nama.toLowerCase())
                );
                const num = parseFloat(b.takaran) || 10;
                return {
                    bahan_baku_id: matched ? matched.id : (bahanBakusList[0]?.id || 1),
                    jumlah_pemakaian: num,
                };
            });
        }

        if (initialBahan.length === 0 && bahanBakusList.length > 0) {
            initialBahan = [{ bahan_baku_id: bahanBakusList[0].id, jumlah_pemakaian: 10 }];
        }

        setRecipeFormBahan(initialBahan);
        setRecipeFormInstruksi([...guide.instruksiRacik]);
        setIsEditingRecipe(true);
    };

    const handleAddBahanRow = () => {
        if (bahanBakusList.length === 0) return;
        setRecipeFormBahan(prev => [...prev, { bahan_baku_id: bahanBakusList[0].id, jumlah_pemakaian: 10 }]);
    };

    const handleRemoveBahanRow = (idx: number) => {
        setRecipeFormBahan(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateBahanRow = (idx: number, field: 'bahan_baku_id' | 'jumlah_pemakaian', val: any) => {
        setRecipeFormBahan(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    const handleAddStepRow = () => {
        setRecipeFormInstruksi(prev => [...prev, '']);
    };

    const handleRemoveStepRow = (idx: number) => {
        setRecipeFormInstruksi(prev => prev.filter((_, i) => i !== idx));
    };

    const handleUpdateStepRow = (idx: number, text: string) => {
        setRecipeFormInstruksi(prev => prev.map((s, i) => i === idx ? text : s));
    };

    // Simpan resep & SOP ke server database
    const handleSaveRecipe = async () => {
        if (!selectedRecipeItem) return;

        let prodId = selectedRecipeItem.produk?.id;
        if (!prodId) {
            const found = allProduksState.find(p => p.nama.toLowerCase() === selectedRecipeItem.nama_produk.toLowerCase());
            if (found) prodId = found.id;
        }

        if (!prodId) {
            alert('Produk tidak ditemukan dalam basis data sistem.');
            return;
        }

        setIsSavingRecipe(true);
        setRecipeSaveNotice('');

        try {
            const getCsrf = (): string => {
                const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
                if (meta?.content) return meta.content;
                const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
                if (match) return decodeURIComponent(match[1]);
                return '';
            };
            const csrfToken = getCsrf();

            const validBahan = recipeFormBahan
                .filter(b => b.bahan_baku_id && Number(b.jumlah_pemakaian) > 0)
                .map(b => ({
                    bahan_baku_id: Number(b.bahan_baku_id),
                    jumlah_pemakaian: Number(b.jumlah_pemakaian),
                }));

            const validInstruksi = recipeFormInstruksi
                .map(s => (s || '').trim())
                .filter(s => s.length > 0);

            const res = await fetch(`/kds/resep/${prodId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    _token: csrfToken,
                    resep: validBahan,
                    instruksi_racik: validInstruksi,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setRecipeSaveNotice(`Resep ${selectedRecipeItem.nama_produk} berhasil disimpan!`);

                const newSops = data.instruksi_racik || recipeFormInstruksi;
                setCustomSopsState(prev => ({
                    ...prev,
                    [`resep_sop_${prodId}`]: newSops,
                }));

                const updatedResep = data.produk?.resep || [];
                setAllProduksState(prev => prev.map(p => p.id === prodId ? { ...p, resep: updatedResep } : p));

                const updateItemsInOrders = (orderList: Order[]) => {
                    return orderList.map(ord => ({
                        ...ord,
                        details: ord.details?.map(d => {
                            if (d.produk?.id === prodId || d.nama_produk.toLowerCase() === selectedRecipeItem.nama_produk.toLowerCase()) {
                                return {
                                    ...d,
                                    produk: {
                                        ...d.produk,
                                        id: prodId,
                                        resep: updatedResep,
                                    }
                                };
                            }
                            return d;
                        })
                    }));
                };

                setOrders(prev => updateItemsInOrders(prev));
                setHistoryOrders(prev => updateItemsInOrders(prev));

                setSelectedRecipeItem(prev => prev ? ({
                    ...prev,
                    produk: {
                        ...prev.produk,
                        id: prodId,
                        resep: updatedResep,
                    }
                }) : null);

                setTimeout(() => {
                    setIsEditingRecipe(false);
                    setRecipeSaveNotice('');
                }, 1200);
            } else {
                alert('Gagal menyimpan resep: ' + (data.message || 'Terjadi kesalahan'));
            }
        } catch (err) {
            console.error('Error saat menyimpan resep:', err);
            alert('Gagal menghubungi server untuk menyimpan resep.');
        } finally {
            setIsSavingRecipe(false);
        }
    };

    // Kebutuhan Batch Siap Racik (Aggregated Items across waiting/processing orders)
    const aggregatedItems = useMemo(() => {
        const map: Record<string, { nama: string; qty: number; varian?: string }> = {};
        orders.forEach(ord => {
            if (ord.status_pesanan === 'siap' || ord.status_pesanan === 'selesai') return;
            const items = ord.details || ord.items || [];
            items.forEach(it => {
                const key = `${it.nama_produk}__${it.nama_varian || ''}`;
                const qty = it.jumlah !== undefined ? it.jumlah : (it.qty || 1);
                if (!map[key]) {
                    map[key] = { nama: it.nama_produk, qty: 0, varian: it.nama_varian || undefined };
                }
                map[key].qty += qty;
            });
        });
        return Object.values(map).sort((a, b) => b.qty - a.qty);
    }, [orders]);

    // Filter produk untuk katalog resep & SOP
    const filteredCatalogProduks = useMemo(() => {
        return allProduksState.filter(p => {
            const q = catalogSearch.trim().toLowerCase();
            const matchSearch = !q || 
                p.nama.toLowerCase().includes(q) ||
                (p.kategori?.nama && p.kategori.nama.toLowerCase().includes(q));
            
            if (!matchSearch) return false;

            const isKitchen = p.station === 'kitchen' || 
                p.kategori?.nama?.toLowerCase().includes('makan') || 
                p.kategori?.nama?.toLowerCase().includes('snack') ||
                p.kategori?.nama?.toLowerCase().includes('food') ||
                p.kategori?.slug?.includes('makanan') ||
                p.kategori?.slug?.includes('snack');
            const pStation = isKitchen ? 'kitchen' : 'barista';

            if (catalogStation === 'all') return true;
            return pStation === catalogStation;
        });
    }, [allProduksState, catalogSearch, catalogStation]);

    // ── Dark Mode & Light Mode State (Maximized) ──
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') || localStorage.getItem('jh_theme') || localStorage.getItem('jh_kds_theme');
            if (saved) return saved === 'dark';
            return document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return true;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            localStorage.setItem('jh_theme', 'dark');
            localStorage.setItem('jh_kds_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            localStorage.setItem('jh_theme', 'light');
            localStorage.setItem('jh_kds_theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = (forceVal?: boolean) => {
        setIsDarkMode(prev => {
            const next = typeof forceVal === 'boolean' ? forceVal : !prev;
            if (next) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                localStorage.setItem('jh_theme', 'dark');
                localStorage.setItem('jh_kds_theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                localStorage.setItem('jh_theme', 'light');
                localStorage.setItem('jh_kds_theme', 'light');
            }
            return next;
        });
    };

    // Drag & Drop State (Desktop Mouse + Tablet Finger Touch)
    const [draggedOrderId, setDraggedOrderId] = useState<number | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [touchDraggingOrder, setTouchDraggingOrder] = useState<Order | null>(null);

    // Pembatalan Pesanan KDS State (Fitur Hapus / Batal Kitchen)
    const [cancelOrderTarget, setCancelOrderTarget] = useState<Order | null>(null);
    const [cancelReason, setCancelReason] = useState<string>('Salah input pesanan');
    const [isCancelling, setIsCancelling] = useState<boolean>(false);

    // Keyboard Shortcuts (Esc to close any modal, Enter to confirm cancellation)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (cancelOrderTarget) setCancelOrderTarget(null);
                else if (selectedRecipeItem) setSelectedRecipeItem(null);
                else if (detailOrder) setDetailOrder(null);
            } else if (e.key === 'Enter') {
                if (cancelOrderTarget && !isCancelling) {
                    const activeElem = document.activeElement;
                    if (activeElem && activeElem.tagName === 'INPUT') {
                        // Allow enter in input to submit
                        e.preventDefault();
                    }
                    handleConfirmCancelOrder();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cancelOrderTarget, selectedRecipeItem, detailOrder, cancelReason, isCancelling]);

    const handleConfirmCancelOrder = () => {
        if (!cancelOrderTarget || isCancelling) return;
        setIsCancelling(true);
        const targetId = cancelOrderTarget.id;

        // Optimistic UI update: hapus dari antrean
        setOrders(prev => prev.filter(o => o.id !== targetId));

        router.patch(`/kds/order/${targetId}/cancel`, {
            alasan: cancelReason || 'Dibatalkan oleh staf dapur/bar',
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsCancelling(false);
                setCancelOrderTarget(null);
                if (detailOrder?.id === targetId) {
                    setDetailOrder(null);
                }
            },
            onError: () => {
                setIsCancelling(false);
                fetchOrdersData();
            }
        });
    };

    // Auto-sync polling every 3.5s
    useEffect(() => {
        const interval = setInterval(() => {
            fetchOrdersData();
        }, 3500);
        return () => clearInterval(interval);
    }, [filterStation, activeTab]);

    const fetchOrdersData = (targetTab?: string) => {
        fetch(`/kds/fetch?station=${filterStation}&tab=all`, {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data && typeof data === 'object') {
                    if (Array.isArray(data.active)) {
                        setOrders(data.active);
                    }
                    if (Array.isArray(data.history)) {
                        setHistoryOrders(data.history);
                    }
                    if (Array.isArray(data)) {
                        const currentTab = targetTab || activeTab;
                        if (currentTab === 'history') {
                            setHistoryOrders(data);
                        } else {
                            setOrders(data);
                        }
                    }
                }
            })
            .catch(() => {});
    };

    const handleUpdateStatus = (orderId: number, targetStatus: string) => {
        // Optimistic UI update
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return { ...o, status_pesanan: targetStatus };
            }
            return o;
        }));

        if (targetStatus === 'selesai') {
            router.patch(`/kds/order/${orderId}/complete`, {}, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setOrders(prev => prev.filter(o => o.id !== orderId));
                    if (detailOrder?.id === orderId) setDetailOrder(null);
                    fetchOrdersData();
                }
            });
        } else {
            router.patch(`/kds/order/${orderId}/status`, { status: targetStatus }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (detailOrder?.id === orderId) {
                        setDetailOrder(prev => prev ? { ...prev, status_pesanan: targetStatus } : null);
                    }
                }
            });
        }
    };

    const handleReopenOrder = (orderId: number) => {
        router.patch(`/kds/order/${orderId}/reopen`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setHistoryOrders(prev => prev.filter(o => o.id !== orderId));
                fetchOrdersData();
            }
        });
    };

    // ── Desktop Drag Handlers ──
    const handleDragStart = (e: React.DragEvent, orderId: number) => {
        e.dataTransfer.setData('text/plain', String(orderId));
        setDraggedOrderId(orderId);
    };

    const handleDragOver = (e: React.DragEvent, colStatus: string) => {
        e.preventDefault();
        setDragOverColumn(colStatus);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, colStatus: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        const orderIdStr = e.dataTransfer.getData('text/plain');
        const orderId = Number(orderIdStr) || draggedOrderId;
        if (orderId) {
            handleUpdateStatus(orderId, colStatus);
        }
        setDraggedOrderId(null);
    };

    // ── Tablet Finger Touch Drag Handlers ──
    const handleTouchStart = (order: Order) => {
        setTouchDraggingOrder(order);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchDraggingOrder) return;
        const touch = e.touches[0];
        const elem = document.elementFromPoint(touch.clientX, touch.clientY);
        const colElem = elem?.closest('[data-column-status]');
        if (colElem) {
            const colStatus = colElem.getAttribute('data-column-status');
            setDragOverColumn(colStatus);
        } else {
            setDragOverColumn(null);
        }
    };

    const handleTouchEnd = () => {
        if (touchDraggingOrder && dragOverColumn) {
            if (touchDraggingOrder.status_pesanan !== dragOverColumn) {
                handleUpdateStatus(touchDraggingOrder.id, dragOverColumn);
            }
        }
        setTouchDraggingOrder(null);
        setDragOverColumn(null);
    };

    const getElapsedTime = (createdStr: string) => {
        const minutes = Math.floor((new Date().getTime() - new Date(createdStr).getTime()) / 60000);
        return Math.max(0, minutes);
    };

    // Columns grouping
    const menungguOrders = orders.filter(o => !o.status_pesanan || o.status_pesanan === 'menunggu');
    const diprosesOrders = orders.filter(o => o.status_pesanan === 'diproses');
    const siapOrders = orders.filter(o => o.status_pesanan === 'siap');

    // ── Render Individual Order Card ──
    const renderCard = (order: Order, currentCol: string) => {
        const elapsed = getElapsedTime(order.created_at);
        const isLate = elapsed >= 12;
        const items = order.details || order.items || [];
        const noOrder = order.nomor_pesanan || order.no_struk || `ORD-${order.id}`;
        const orderType = order.tipe_pesanan || order.tipe || 'dine_in';
        const isDineIn = orderType === 'dine_in' || orderType === 'dinein';
        const tableNo = order.meja?.nomor || order.meja?.no_meja;

        return (
            <div
                key={order.id}
                draggable
                onDragStart={(e) => handleDragStart(e, order.id)}
                onTouchStart={() => handleTouchStart(order)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-md transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] ${
                    isDarkMode
                        ? isLate
                            ? 'border-amber-500 bg-zinc-900/95 ring-2 ring-amber-500/40'
                            : 'border-zinc-800 bg-zinc-900/90 text-white'
                        : isLate
                            ? 'border-amber-500 bg-white ring-2 ring-amber-400/50 shadow-lg'
                            : 'border-zinc-200 bg-white text-zinc-900 shadow-sm'
                }`}
            >
                {/* 1. Card Header */}
                <div className={`p-3 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-100 bg-zinc-50'
                }`}>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400">{noOrder}</span>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            isDineIn ? 'bg-amber-400 text-zinc-950' : 'bg-blue-600 text-white'
                        }`}>
                            {isDineIn ? 'Dine In' : 'Take Away'}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setDetailOrder(order);
                                setModalActiveSection('details');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-95 ${
                                isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                            }`}
                            title="Lihat Detail & Resep"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCancelOrderTarget(order);
                                setCancelReason('Salah input pesanan');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-95 ${
                                isDarkMode ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 border border-rose-800/40' : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                            }`}
                            title="Batalkan / Hapus Pesanan KDS"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold flex items-center gap-1.5 border ${
                            elapsed >= 15
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/60 animate-pulse font-black'
                                : elapsed >= 8
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{elapsed}m</span>
                        </div>
                    </div>
                </div>

                {/* 2. PROMINENT TABLE BADGE (Akurat & Jelas) */}
                {isDineIn ? (
                    <div className={`mx-3 mt-2.5 p-2.5 rounded-xl shadow-sm border ${
                        isDarkMode
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 !text-zinc-950 dark:!text-zinc-950 border-amber-400/50'
                            : 'bg-gradient-to-r from-amber-400 to-amber-500 !text-zinc-950 dark:!text-zinc-950 border-amber-300'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-zinc-950 text-amber-400 flex items-center justify-center font-mono font-black text-sm shadow-xs shrink-0">
                                    {tableNo ? tableNo : <Utensils className="w-4 h-4 text-amber-400" />}
                                </div>
                                <div>
                                    <div className="font-black text-xs uppercase tracking-tight flex items-center gap-1 !text-zinc-950 dark:!text-zinc-950">
                                        <span>{tableNo ? `MEJA ${tableNo}` : 'MEJA TAMU (DINE-IN)'}</span>
                                    </div>
                                    <span className="text-[11px] font-bold !text-zinc-950 dark:!text-zinc-950 block truncate max-w-[150px] leading-tight opacity-90">
                                        {order.meja?.nama || (order.nama_pelanggan ? `Tamu: ${order.nama_pelanggan}` : 'Meja Pelanggan')}
                                    </span>
                                </div>
                            </div>
                            {order.meja?.area && (
                                <span className="px-2 py-1 rounded-lg bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
                                    {order.meja.area}
                                </span>
                            )}
                        </div>
                        {order.nama_pelanggan && (
                            <div className="mt-1 pt-1 border-t border-zinc-950/20 text-[10px] font-black !text-zinc-950 dark:!text-zinc-950 flex items-center justify-between">
                                <span>Tamu: {order.nama_pelanggan}</span>
                                {order.telepon_pelanggan && <span>{order.telepon_pelanggan}</span>}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`mx-3 mt-2.5 px-3 py-2 rounded-xl flex items-center justify-between ${
                        isDarkMode ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300' : 'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider block text-blue-600 dark:text-blue-400">
                                📦 TAKE AWAY / BUNGKUS
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                {order.nama_pelanggan ? `Tamu: ${order.nama_pelanggan}` : 'Bawa Pulang'}
                            </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">
                            Siapkan Tas/Cup
                        </span>
                    </div>
                )}

                {/* 3. Items List with Modifier Details & Tombol Resep */}
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[220px]">
                    {items.map((item, idx) => {
                        const qty = item.jumlah !== undefined ? item.jumlah : (item.qty || 1);
                        const modifiers = (item.modifiers || []).map(m => m.nama_modifier).join(', ');
                        const notes = item.catatan_khusus || item.catatan;

                        return (
                            <div key={item.id || idx} className={`border-b pb-2 last:border-none text-xs ${
                                isDarkMode ? 'border-zinc-800/80' : 'border-zinc-100'
                            }`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold flex items-center gap-1.5 leading-tight text-zinc-900 dark:text-white">
                                            <span>{item.nama_produk}</span>
                                        </div>
                                        {item.namaVarian && (
                                            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                                Size/Suhu: {item.namaVarian}
                                            </span>
                                        )}
                                        {modifiers && (
                                            <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                                + {modifiers}
                                            </span>
                                        )}
                                        {notes && (
                                            <div className="mt-1 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold italic">
                                                * {notes}
                                            </div>
                                        )}

                                        {/* Quick Resep Trigger Button */}
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRecipeItem(item)}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition mt-1.5 border ${
                                                isDarkMode 
                                                    ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-700/60' 
                                                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                                            }`}
                                            title="Lihat Takaran & SOP Resep"
                                        >
                                            <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                            <span>Lihat Resep Racik</span>
                                        </button>
                                    </div>

                                    <span className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 shadow ${
                                        isDarkMode ? 'bg-amber-400 !text-zinc-950 dark:!text-zinc-950 ring-1 ring-amber-300' : 'bg-zinc-900 !text-white dark:!text-white'
                                    }`}>
                                        {qty}x
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* 4. Touch-Friendly Card Actions (Ergonomis untuk Jari Manusia) */}
                <div className={`p-2.5 sm:p-3 border-t flex items-center gap-2 ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-zinc-100 bg-zinc-50'
                }`}>
                    {currentCol === 'menunggu' && (
                        <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'diproses')}
                            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 !text-zinc-950 dark:!text-zinc-950 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Flame className="w-4 h-4 fill-zinc-950" />
                            <span>Mulai Siapkan / Proses</span>
                        </button>
                    )}

                    {currentCol === 'diproses' && (
                        <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'siap')}
                            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 !text-zinc-950 dark:!text-zinc-950 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Tandai Siap Saji</span>
                        </button>
                    )}

                    {currentCol === 'siap' && (
                        <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'selesai')}
                            className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl active:scale-95 text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 shadow-sm ${
                                isDarkMode ? 'bg-emerald-400 hover:bg-emerald-300 !text-zinc-950 dark:!text-zinc-950' : 'bg-zinc-950 hover:bg-zinc-800 !text-white dark:!text-white'
                            }`}
                        >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Selesai Disajikan (Antar)</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#09090b] text-white' : 'bg-slate-100 text-zinc-900'} flex flex-col font-sans select-none antialiased transition-colors duration-200`}>
            <Head title="Kitchen Display System (KDS) - Jelang Hari" />

            {/* ── Topbar Header KDS ── */}
            <header className={`border-b px-3 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-30 transition-colors ${
                isDarkMode ? 'bg-[#0f0f12] border-zinc-800 text-white shadow-md' : 'bg-white border-zinc-200 text-zinc-900 shadow-xs'
            }`}>
                <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2.5 sm:gap-3">
                    {/* Top / Left Row: Back, Brand & Quick Tools */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <Link
                                href={backUrl}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border shrink-0 ${
                                    isDarkMode 
                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800' 
                                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                                }`}
                                title={backTitle}
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> 
                                <span className="hidden sm:inline">{backLabel}</span>
                            </Link>

                            <img
                                src="/images/logo.png"
                                alt="Jelang Hari"
                                className="w-8 h-8 rounded-full bg-white p-0.5 object-contain shadow-xs border border-zinc-200 dark:border-zinc-800 shrink-0"
                            />
                            
                            <div className="min-w-0">
                                <h1 className="font-extrabold text-xs sm:text-sm leading-tight flex items-center gap-1.5 truncate">
                                    <span className="truncate">Kitchen &amp; Barista KDS</span>
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shrink-0">
                                        Live
                                    </span>
                                </h1>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate hidden md:block">
                                    Geser tiket untuk update status • Klik 'Resep' untuk gramasi racikan
                                </p>
                            </div>
                        </div>

                        {/* Mobile Quick Action Buttons (Resep & Theme) */}
                        <div className="flex xl:hidden items-center gap-1.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsRecipeCatalogOpen(true)}
                                className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 border active:scale-95 shadow-xs ${
                                    isDarkMode
                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-zinc-800'
                                        : 'bg-white hover:bg-zinc-100 text-amber-600 border-zinc-200'
                                }`}
                                title="Buku Resep & SOP Dapur"
                            >
                                <BookMarked className="w-4 h-4 text-amber-500" />
                                <span className="hidden sm:inline">Resep &amp; SOP</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsKdsSettingsOpen(true)}
                                className={`p-2 rounded-xl border transition-all active:scale-95 ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950'
                                }`}
                                title="Pengaturan Tampilan & KDS"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Controls Row: Mode Switcher, Rush Mode & Station Filter */}
                    <div className="flex flex-wrap items-center justify-between xl:justify-end gap-2 shrink-0">
                        {/* Tabs Antrean Aktif / Riwayat Selesai */}
                        <div className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-200/80 border-zinc-300'
                        }`}>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('active');
                                    fetchOrdersData('active');
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                                    activeTab === 'active'
                                        ? isDarkMode ? 'bg-amber-400 !text-zinc-950 shadow-md' : 'bg-zinc-950 !text-white shadow-md'
                                        : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                            >
                                <Flame className={`w-3.5 h-3.5 ${activeTab === 'active' ? (isDarkMode ? '!text-zinc-950' : 'text-amber-400') : 'text-amber-500'}`} />
                                <span>Antrean ({orders.length})</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab('history');
                                    fetchOrdersData('history');
                                }}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                                    activeTab === 'history'
                                        ? 'bg-blue-600 !text-white shadow-md'
                                        : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                }`}
                            >
                                <History className="w-3.5 h-3.5" />
                                <span>Riwayat ({historyOrders.length})</span>
                            </button>
                        </div>

                        {/* Station Filter & Desktop Buttons */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            {/* Desktop Resep & SOP */}
                            <button
                                type="button"
                                onClick={() => setIsRecipeCatalogOpen(true)}
                                className={`hidden xl:flex min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all items-center gap-1.5 border active:scale-95 shadow-xs ${
                                    isDarkMode
                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border-zinc-800 hover:border-amber-500/40'
                                        : 'bg-white hover:bg-zinc-100 text-amber-600 border-zinc-200 hover:border-amber-400'
                                }`}
                                title="Buku Resep & SOP Dapur"
                            >
                                <BookMarked className="w-4 h-4 text-amber-500" />
                                <span>Resep &amp; SOP</span>
                            </button>

                            {/* Rush Mode */}
                            <button
                                type="button"
                                onClick={toggleRushMode}
                                className={`min-h-[38px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 border active:scale-95 shadow-xs ${
                                    isRushMode
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/50 shadow-rose-500/30'
                                        : isDarkMode
                                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
                                            : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                                }`}
                                title="Mode Jam Sibuk"
                            >
                                <Flame className={`w-3.5 h-3.5 ${isRushMode ? 'fill-white text-white animate-pulse' : 'text-amber-500'}`} />
                                <span className="hidden sm:inline">{isRushMode ? 'Jam Sibuk ON' : 'Mode Sibuk'}</span>
                            </button>

                            {/* Station Filter (Semua, Barista, Dapur) */}
                            <div className={`flex items-center gap-0.5 p-1 rounded-xl border shrink-0 ${
                                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'
                            }`}>
                                <button
                                    onClick={() => setFilterStation('all')}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                                        filterStation === 'all'
                                            ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-zinc-900 !text-white shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    onClick={() => setFilterStation('barista')}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                        filterStation === 'barista'
                                            ? 'bg-amber-500 !text-zinc-950 shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    <Coffee className="w-3 h-3" />
                                    <span className="hidden sm:inline">Barista</span>
                                </button>
                                <button
                                    onClick={() => setFilterStation('kitchen')}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                        filterStation === 'kitchen'
                                            ? 'bg-emerald-500 !text-zinc-950 shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    <Utensils className="w-3 h-3" />
                                    <span className="hidden sm:inline">Dapur</span>
                                </button>
                            </div>

                            {/* Desktop Settings Button */}
                            <button
                                type="button"
                                onClick={() => setIsKdsSettingsOpen(true)}
                                className={`hidden xl:flex p-2 rounded-xl border transition-all active:scale-95 ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:text-zinc-950'
                                }`}
                                title="Pengaturan Tampilan & KDS"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── BANNER MODE JAM SIBUK & AKSELERASI BATCH ANTRIAN RAMAI ── */}
            {(isRushMode || orders.length >= 6) && activeTab === 'active' && (
                <div className={`px-4 sm:px-6 py-3 border-b transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs ${
                    isRushMode
                        ? 'bg-gradient-to-r from-rose-950 via-zinc-950 to-amber-950 border-rose-500/50 text-white'
                        : isDarkMode
                            ? 'bg-zinc-900/95 border-zinc-800 text-white'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-zinc-900'
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                            isRushMode 
                                ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse' 
                                : 'bg-amber-400 text-zinc-950'
                        }`}>
                            <Flame className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-black text-xs sm:text-sm tracking-tight flex items-center gap-1.5">
                                    <span>{isRushMode ? 'MODE JAM SIBUK AKTIF' : 'LONJAKAN ANTRIAN TERDETEKSI'}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                        isRushMode ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40' : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                                    }`}>
                                        {orders.length} Pesanan Antre
                                    </span>
                                </h2>
                            </div>
                            <p className="text-[11px] opacity-80 mt-0.5">
                                Rekapitulasi serentak: siapkan racikan minuman &amp; masakan dalam batch bersamaan:
                            </p>
                        </div>
                    </div>

                    {/* Batch Items Chips Carousel/Bar */}
                    <div className="flex items-center gap-2 flex-wrap flex-1 lg:max-w-2xl justify-start lg:justify-end">
                        {aggregatedItems.length === 0 ? (
                            <span className="text-xs opacity-60 italic">Semua menu sudah selesai diproses.</span>
                        ) : (
                            aggregatedItems.slice(0, 6).map((agg, idx) => (
                                <div
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs ${
                                        isRushMode
                                            ? 'bg-black/40 border-rose-500/30 text-white'
                                            : isDarkMode
                                                ? 'bg-zinc-800/80 border-zinc-700 text-white'
                                                : 'bg-white border-amber-300 text-zinc-900'
                                    }`}
                                >
                                    <span className="w-6 h-6 rounded-lg bg-amber-400 text-zinc-950 font-mono font-black text-xs flex items-center justify-center shrink-0">
                                        {agg.qty}x
                                    </span>
                                    <span className="truncate max-w-[150px]">{agg.nama}</span>
                                    {agg.varian && (
                                        <span className="opacity-60 text-[10px] font-normal truncate">
                                            ({agg.varian})
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                        {aggregatedItems.length > 6 && (
                            <span className="text-[11px] font-bold px-2 py-1 opacity-75">
                                +{aggregatedItems.length - 6} item lain
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Active Kanban Board Mode ── */}
            {activeTab === 'active' && (
                <main className="flex-1 p-3 sm:p-5 overflow-x-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[900px] h-full items-start">
                        
                        {/* COLUMN 1: MENUNGGU */}
                        <div
                            data-column-status="menunggu"
                            onDragOver={(e) => handleDragOver(e, 'menunggu')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'menunggu')}
                            className={`rounded-2xl border p-3 flex flex-col min-h-[78vh] transition-colors ${
                                isDarkMode 
                                    ? dragOverColumn === 'menunggu' ? 'border-amber-500 bg-amber-500/10' : 'bg-zinc-900/60 border-zinc-800'
                                    : dragOverColumn === 'menunggu' ? 'border-amber-500 bg-amber-100/50' : 'bg-amber-50/50 border-amber-200/60'
                            }`}
                        >
                            <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${
                                isDarkMode ? 'border-zinc-800' : 'border-amber-200/60'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">1. Antrean Baru (Menunggu)</h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
                                    {menungguOrders.length}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {menungguOrders.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-zinc-400 italic">
                                        Tidak ada antrean pesanan baru.
                                    </div>
                                ) : (
                                    menungguOrders.map(o => renderCard(o, 'menunggu'))
                                )}
                            </div>
                        </div>

                        {/* COLUMN 2: SEDANG DIPROSES */}
                        <div
                            data-column-status="diproses"
                            onDragOver={(e) => handleDragOver(e, 'diproses')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'diproses')}
                            className={`rounded-2xl border p-3 flex flex-col min-h-[78vh] transition-colors ${
                                isDarkMode 
                                    ? dragOverColumn === 'diproses' ? 'border-blue-500 bg-blue-500/10' : 'bg-zinc-900/60 border-zinc-800'
                                    : dragOverColumn === 'diproses' ? 'border-blue-500 bg-blue-100/50' : 'bg-blue-50/50 border-blue-200/60'
                            }`}
                        >
                            <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${
                                isDarkMode ? 'border-zinc-800' : 'border-blue-200/60'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-amber-500" />
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">2. Sedang Diracik / Dimasak</h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                                    {diprosesOrders.length}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {diprosesOrders.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-zinc-400 italic">
                                        Geser jari kemari untuk mulai meracik/memasak.
                                    </div>
                                ) : (
                                    diprosesOrders.map(o => renderCard(o, 'diproses'))
                                )}
                            </div>
                        </div>

                        {/* COLUMN 3: SIAP SAJI */}
                        <div
                            data-column-status="siap"
                            onDragOver={(e) => handleDragOver(e, 'siap')}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, 'siap')}
                            className={`rounded-2xl border p-3 flex flex-col min-h-[78vh] transition-colors ${
                                isDarkMode 
                                    ? dragOverColumn === 'siap' ? 'border-emerald-500 bg-emerald-500/10' : 'bg-zinc-900/60 border-zinc-800'
                                    : dragOverColumn === 'siap' ? 'border-emerald-500 bg-emerald-100/50' : 'bg-emerald-50/50 border-emerald-200/60'
                            }`}
                        >
                            <div className={`flex items-center justify-between pb-2.5 mb-2.5 border-b ${
                                isDarkMode ? 'border-zinc-800' : 'border-emerald-200/60'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">3. Siap Disajikan / Antar</h3>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                                    {siapOrders.length}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto">
                                {siapOrders.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-zinc-400 italic">
                                        Geser kemari jika racikan siap diantar ke meja tamu.
                                    </div>
                                ) : (
                                    siapOrders.map(o => renderCard(o, 'siap'))
                                )}
                            </div>
                        </div>

                    </div>
                </main>
            )}

            {/* ── Riwayat Pesanan Selesai Hari Ini Mode ── */}
            {activeTab === 'history' && (
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    <span>Riwayat Pesanan Selesai Hari Ini</span>
                                </h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Daftar pesanan yang telah selesai disajikan oleh Barista &amp; Dapur
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200">
                                Total: {historyOrders.length} Pesanan
                            </span>
                        </div>

                        {historyOrders.length === 0 ? (
                            <div className="p-16 text-center text-xs text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/40">
                                Belum ada pesanan yang ditandai selesai hari ini.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {historyOrders.map((ord) => {
                                    const timeStr = ord.waktu_selesai 
                                        ? new Date(ord.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                        : (ord.updated_at ? new Date(ord.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-');
                                    const isDineIn = ord.tipe_pesanan === 'dine_in' || ord.tipe === 'dine_in';
                                    const items = ord.details || ord.items || [];

                                    return (
                                        <div
                                            key={ord.id}
                                            className={`p-3.5 border rounded-2xl space-y-3 shadow-xs ${
                                                isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                                                <div>
                                                    <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 block">
                                                        {ord.nomor_pesanan || `#ORD-${ord.id}`}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">
                                                        Selesai: {timeStr}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReopenOrder(ord.id)}
                                                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1 transition"
                                                    title="Kembalikan tiket ini ke antrean siap saji"
                                                >
                                                    <Undo2 className="w-3 h-3" />
                                                    <span>Kembalikan</span>
                                                </button>
                                            </div>

                                            {/* Table Badge */}
                                            {isDineIn ? (
                                                <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-between font-bold text-xs shadow-xs">
                                                    <span>MEJA {ord.meja?.nomor || '-'}</span>
                                                    <span className="text-[10px] truncate max-w-[150px]">
                                                        {ord.meja?.nama || ord.meja?.area || 'Dine-In'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-between">
                                                    <span>📦 TAKE AWAY</span>
                                                    <span className="text-[10px]">{ord.nama_pelanggan || 'Bawa Pulang'}</span>
                                                </div>
                                            )}

                                            {/* Item Summary */}
                                            <div className="space-y-1 text-xs">
                                                {items.map((it, idx) => (
                                                    <div key={idx} className="flex justify-between text-zinc-700 dark:text-zinc-300 text-[11px]">
                                                        <span className="truncate">{it.jumlah || it.qty || 1}x {it.nama_produk}</span>
                                                        {it.namaVarian && <span className="text-zinc-400 text-[10px]">({it.namaVarian})</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            )}

            {/* ── MODAL DETAIL PESANAN & RESEP RACIKAN LENGKAP ── */}
            {detailOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade">
                    <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}>
                        
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                                    {detailOrder.nomor_pesanan || detailOrder.no_struk || `#ORD-${detailOrder.id}`}
                                </span>
                                <h3 className="font-extrabold text-base mt-0.5">Detail Pesanan &amp; Resep Racikan</h3>
                            </div>
                            <button
                                onClick={() => setDetailOrder(null)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Prominent Table Banner */}
                        {detailOrder.tipe_pesanan === 'dine_in' || detailOrder.tipe === 'dine_in' ? (
                            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-black shadow-md flex items-center justify-between border-2 border-amber-300">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-950 text-amber-400 flex items-center justify-center font-mono text-base font-black">
                                        #{detailOrder.meja?.nomor || '-'}
                                    </div>
                                    <div>
                                        <span className="text-sm uppercase tracking-tight block font-black">
                                            MEJA {detailOrder.meja?.nomor || '-'}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-900 block">
                                            {detailOrder.meja?.nama || 'Meja Dine-in'}
                                        </span>
                                    </div>
                                </div>
                                {detailOrder.meja?.area && (
                                    <span className="px-2.5 py-1 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider">
                                        Area: {detailOrder.meja.area}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 flex items-center justify-between">
                                <span className="font-bold text-sm uppercase">📦 TAKE AWAY / BUNGKUS</span>
                                <span className="text-xs">Siapkan Cup &amp; Kantong Bawa Pulang</span>
                            </div>
                        )}

                        {/* Tab Switcher: Detail Items vs Resep Bahan */}
                        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <button
                                type="button"
                                onClick={() => setModalActiveSection('details')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                    modalActiveSection === 'details'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <Utensils className="w-3.5 h-3.5" />
                                <span>Rincian Menu Item</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalActiveSection('recipe')}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                    modalActiveSection === 'recipe'
                                        ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                                <span>Panduan Resep &amp; Takaran Racikan</span>
                            </button>
                        </div>

                        {/* Section 1: Standard Items List */}
                        {modalActiveSection === 'details' && (
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                                {(detailOrder.details || detailOrder.items || []).map((it, idx) => (
                                    <div key={idx} className={`p-3 rounded-2xl border flex justify-between items-start text-xs ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                    }`}>
                                        <div className="space-y-1 flex-1">
                                            <span className="font-extrabold block text-sm text-zinc-900 dark:text-white">{it.nama_produk}</span>
                                            {it.namaVarian && (
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                                                    Ukuran/Varian: <b>{it.namaVarian}</b>
                                                </span>
                                            )}
                                            {it.modifiers && it.modifiers.length > 0 && (
                                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold block">
                                                    + {it.modifiers.map(m => m.nama_modifier).join(', ')}
                                                </span>
                                            )}
                                            {(it.catatan_khusus || it.catatan) && (
                                                <div className="mt-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold italic">
                                                    Catatan Khusus: *{it.catatan_khusus || it.catatan}
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => setSelectedRecipeItem(it)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 transition mt-1"
                                            >
                                                <Scale className="w-3.5 h-3.5" />
                                                <span>Cek Takaran Bahan ({it.nama_produk})</span>
                                            </button>
                                        </div>

                                        <span className={`w-8 h-8 rounded-xl font-black font-mono text-sm flex items-center justify-center shrink-0 shadow ${
                                            isDarkMode ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                                        }`}>
                                            {it.jumlah || it.qty || 1}x
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Section 2: All Items Detailed Recipes */}
                        {modalActiveSection === 'recipe' && (
                            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                                {(detailOrder.details || detailOrder.items || []).map((it, idx) => {
                                    const recipe = getRecipeGuide(it);
                                    return (
                                        <div key={idx} className={`p-3.5 rounded-2xl border space-y-2.5 ${
                                            isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                        }`}>
                                            <div className="flex items-center justify-between border-b pb-2 border-zinc-200 dark:border-zinc-800">
                                                <div>
                                                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                                                        <span>{it.nama_produk}</span>
                                                        <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">({it.jumlah || it.qty || 1} porsi)</span>
                                                    </h4>
                                                    {it.namaVarian && (
                                                        <span className="text-[11px] text-zinc-500">Varian: {it.namaVarian}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEditRecipe(it)}
                                                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition active:scale-95"
                                                        title="Edit Resep & SOP Menu Ini"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                        <span>Edit Resep</span>
                                                    </button>
                                                    <BookOpen className="w-4 h-4 text-amber-500" />
                                                </div>
                                            </div>

                                            {/* Bahan Baku Table */}
                                            <div className="space-y-1.5">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">
                                                    Komposisi &amp; Takaran Bahan:
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {recipe.bahanList.map((b, bIdx) => (
                                                        <div key={bIdx} className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                                                            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                                                        }`}>
                                                            <div>
                                                                <span className="font-bold block text-zinc-900 dark:text-zinc-100">{b.nama}</span>
                                                                {b.catatan && <span className="text-[10px] text-zinc-400 block">{b.catatan}</span>}
                                                            </div>
                                                            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs shrink-0 ml-2">
                                                                {b.takaran}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* SOP Racik */}
                                            <div className="pt-1">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-1">
                                                    Langkah Penyajian Barista:
                                                </span>
                                                <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                                                    {recipe.instruksiRacik.map((step, sIdx) => (
                                                        <li key={sIdx} className="flex items-start gap-1.5">
                                                            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                                {sIdx + 1}
                                                            </span>
                                                            <span className="leading-tight">{step}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDetailOrder(null)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                >
                                    Tutup (Esc)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCancelOrderTarget(detailOrder);
                                        setCancelReason('Salah input pesanan');
                                    }}
                                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition flex items-center gap-1.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Batalkan Pesanan</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                {detailOrder.status_pesanan === 'menunggu' && (
                                    <button
                                        onClick={() => handleUpdateStatus(detailOrder.id, 'diproses')}
                                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow"
                                    >
                                        <Flame className="w-4 h-4" /> Mulai Racik
                                    </button>
                                )}
                                {detailOrder.status_pesanan === 'diproses' && (
                                    <button
                                        onClick={() => handleUpdateStatus(detailOrder.id, 'siap')}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Tandai Siap Saji
                                    </button>
                                )}
                                {detailOrder.status_pesanan === 'siap' && (
                                    <button
                                        onClick={() => handleUpdateStatus(detailOrder.id, 'selesai')}
                                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow ${
                                            isDarkMode ? 'bg-white hover:bg-zinc-200 text-zinc-950' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                        }`}
                                    >
                                        <Check className="w-4 h-4" /> Selesai (Antar)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── POPUP RESEP & SOP (DUAL-MODE: LIHAT & EDIT LANGSUNG DI KDS) ── */}
            {selectedRecipeItem && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade">
                    <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] flex flex-col ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}>
                        {/* Header Modal Resep */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                                    isEditingRecipe 
                                        ? 'bg-amber-500 text-zinc-950 shadow-xs' 
                                        : 'bg-amber-500/20 text-amber-500'
                                }`}>
                                    {isEditingRecipe ? <Edit3 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate">
                                        {selectedRecipeItem.nama_produk}
                                    </h3>
                                    <p className="text-[11px] text-zinc-400 truncate">
                                        {isEditingRecipe 
                                            ? 'Mode Edit Resep & SOP Penyajian' 
                                            : 'Resep Racikan & SOP Standar Dapur/Barista'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {!isEditingRecipe && (
                                    <button
                                        type="button"
                                        onClick={() => handleStartEditRecipe()}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-xs"
                                        title="Buka Formulir Edit Resep & SOP Menu Ini"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Edit Resep</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedRecipeItem(null);
                                        setIsEditingRecipe(false);
                                        setRecipeSaveNotice('');
                                    }}
                                    className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    title="Tutup"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Banner Notifikasi Berhasil Simpan */}
                        {recipeSaveNotice && (
                            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade shrink-0">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{recipeSaveNotice}</span>
                            </div>
                        )}

                        {/* ── MODE 1: FORMULIR EDIT RESEP & SOP ── */}
                        {isEditingRecipe ? (
                            <div className="flex flex-col flex-1 min-h-0">
                                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                                {/* Section A: Bahan Baku & Takaran */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 block">
                                            Komposisi Bahan Baku (Per 1 Porsi):
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddBahanRow}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 transition active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Bahan</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                                        {recipeFormBahan.map((row, idx) => {
                                            const selectedBB = bahanBakusList.find(b => b.id === Number(row.bahan_baku_id));
                                            return (
                                                <div key={idx} className={`p-2.5 rounded-2xl border flex items-center gap-2 text-xs ${
                                                    isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                                }`}>
                                                    <div className="flex-1 min-w-0">
                                                        <select
                                                            value={row.bahan_baku_id}
                                                            onChange={(e) => handleUpdateBahanRow(idx, 'bahan_baku_id', Number(e.target.value))}
                                                            className={`w-full px-2.5 py-1.5 rounded-xl text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                                                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                                                            }`}
                                                        >
                                                            {bahanBakusList.map(bb => (
                                                                <option key={bb.id} value={bb.id}>
                                                                    {bb.nama} ({bb.satuan})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="w-24 shrink-0 flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            min="0.1"
                                                            value={row.jumlah_pemakaian}
                                                            onChange={(e) => handleUpdateBahanRow(idx, 'jumlah_pemakaian', parseFloat(e.target.value) || 0)}
                                                            className={`w-full px-2 py-1.5 rounded-xl text-xs border font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                                                isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                                                            }`}
                                                        />
                                                        <span className="text-[11px] font-bold text-zinc-500 shrink-0 w-6">
                                                            {selectedBB?.satuan || 'gr'}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveBahanRow(idx)}
                                                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                                                        title="Hapus baris bahan"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {recipeFormBahan.length === 0 && (
                                            <div className="p-4 text-center text-xs text-zinc-500 italic border border-dashed rounded-2xl">
                                                Belum ada bahan baku dipilih. Klik '+ Tambah Bahan' untuk mulai meracik.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section B: Instruksi SOP Racik */}
                                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 block">
                                            Langkah SOP Racikan &amp; Penyajian:
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleAddStepRow}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 transition active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Langkah</span>
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {recipeFormInstruksi.map((step, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                                                    {sIdx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={step}
                                                    onChange={(e) => handleUpdateStepRow(sIdx, e.target.value)}
                                                    placeholder={`Langkah racik ke-${sIdx + 1}...`}
                                                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveStepRow(sIdx)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition shrink-0"
                                                    title="Hapus langkah"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        {recipeFormInstruksi.length === 0 && (
                                            <div className="p-4 text-center text-xs text-zinc-500 italic border border-dashed rounded-2xl">
                                                Belum ada instruksi langkah. Klik '+ Tambah Langkah' untuk mengisi SOP racikan.
                                            </div>
                                        )}
                                    </div>
                                    </div>
                                </div>

                                {/* Action Buttons Edit Mode */}
                                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingRecipe(false);
                                            setRecipeSaveNotice('');
                                        }}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                    >
                                        Batal Edit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSavingRecipe}
                                        onClick={handleSaveRecipe}
                                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-black transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                                    >
                                        {isSavingRecipe ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menyimpan ke Server...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Simpan Resep &amp; SOP</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── MODE 2: TAMPILAN RESEP & SOP STANDARD ── */
                            (() => {
                                const guide = getRecipeGuide(selectedRecipeItem, customSopsState);
                                return (
                                    <div className="flex flex-col flex-1 min-h-0">
                                        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                                            <div>
                                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-2">
                                                    Daftar Bahan &amp; Gramasi (Per 1 Porsi):
                                                </span>
                                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                                    {guide.bahanList.map((b, idx) => (
                                                        <div key={idx} className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs ${
                                                            isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                                        }`}>
                                                            <div>
                                                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{b.nama}</span>
                                                                {b.catatan && <span className="text-[10px] text-zinc-400 block">{b.catatan}</span>}
                                                            </div>
                                                            <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-xs shrink-0 ml-2">
                                                                {b.takaran}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 block mb-2">
                                                    Panduan Penyeduhan / Racikan SOP:
                                                </span>
                                                <div className={`p-3 rounded-2xl border space-y-2 text-xs text-zinc-600 dark:text-zinc-300 max-h-48 overflow-y-auto ${
                                                    isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                                                }`}>
                                                    {guide.instruksiRacik.map((inst, sIdx) => (
                                                        <div key={sIdx} className="flex items-start gap-2.5">
                                                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                                {sIdx + 1}
                                                            </span>
                                                            <span className="leading-relaxed">{inst}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleStartEditRecipe()}
                                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition active:scale-95"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Ubah Takaran &amp; SOP</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRecipeItem(null);
                                                    setIsEditingRecipe(false);
                                                    setRecipeSaveNotice('');
                                                }}
                                                className={`px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95 ${
                                                    isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                                }`}
                                            >
                                                {isRecipeCatalogOpen ? 'Kembali' : 'Tutup'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            )}

            {/* ── MODAL KATALOG RESEP & SOP DAPUR / BARISTA (SELURUH MENU) ── */}
            {isRecipeCatalogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade">
                    <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}>
                        {/* Header Katalog */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                                    <BookMarked className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base flex items-center gap-2">
                                        <span>Buku Resep &amp; SOP Dapur</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                            {allProduksState.length} Menu
                                        </span>
                                    </h3>
                                    <p className="text-xs text-zinc-400">
                                        Katalog lengkap takaran bahan baku (BOM) &amp; SOP racikan barista / kitchen
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRecipeCatalogOpen(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search & Filter Stasiun */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    value={catalogSearch}
                                    onChange={(e) => setCatalogSearch(e.target.value)}
                                    placeholder="Cari nama menu atau kategori..."
                                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                                    }`}
                                />
                            </div>

                            <div className={`flex items-center gap-1 p-1 rounded-xl border shrink-0 ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => setCatalogStation('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                        catalogStation === 'all'
                                            ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-white text-zinc-900 shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    Semua ({allProduksState.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCatalogStation('barista')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                        catalogStation === 'barista'
                                            ? 'bg-amber-500 text-zinc-950 shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-amber-400' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    <Coffee className="w-3.5 h-3.5" /> Barista
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCatalogStation('kitchen')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                        catalogStation === 'kitchen'
                                            ? 'bg-emerald-500 text-zinc-950 shadow-xs'
                                            : isDarkMode ? 'text-zinc-400 hover:text-emerald-400' : 'text-zinc-600 hover:text-zinc-950'
                                    }`}
                                >
                                    <Utensils className="w-3.5 h-3.5" /> Dapur
                                </button>
                            </div>
                        </div>

                        {/* Grid Menu Produk */}
                        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {filteredCatalogProduks.map((p) => {
                                const isKitchen = p.station === 'kitchen' || 
                                    p.kategori?.nama?.toLowerCase().includes('makan') || 
                                    p.kategori?.nama?.toLowerCase().includes('snack') ||
                                    p.kategori?.nama?.toLowerCase().includes('food') ||
                                    p.kategori?.slug?.includes('makanan') ||
                                    p.kategori?.slug?.includes('snack');
                                const bahanCount = p.resep?.length || 0;
                                const customKey = `resep_sop_${p.id}`;
                                const customStepCount = (customSopsState[customKey] || []).length;

                                return (
                                    <div
                                        key={p.id}
                                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                                            isDarkMode 
                                                ? 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700' 
                                                : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-2 mb-1.5">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                                    isKitchen 
                                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {isKitchen ? 'Kitchen' : 'Barista'}
                                                </span>
                                                {p.kategori?.nama && (
                                                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[100px]">
                                                        {p.kategori.nama}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                                                {p.nama}
                                            </h4>
                                            <div className="mt-2 text-[11px] text-zinc-500 space-y-0.5">
                                                <div>Bahan BOM: <span className="font-bold text-zinc-700 dark:text-zinc-300">{bahanCount > 0 ? `${bahanCount} bahan` : 'SOP Standar'}</span></div>
                                                {customStepCount > 0 && (
                                                    <div className="text-amber-600 dark:text-amber-400 font-semibold">
                                                        ✓ Custom SOP ({customStepCount} langkah)
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const itemLike: any = {
                                                        id: p.id,
                                                        nama_produk: p.nama,
                                                        station: isKitchen ? 'kitchen' : 'barista',
                                                        produk: p,
                                                    };
                                                    setSelectedRecipeItem(itemLike);
                                                    setIsEditingRecipe(false);
                                                }}
                                                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                                                    isDarkMode 
                                                        ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700' 
                                                        : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                                                }`}
                                            >
                                                <Eye className="w-3.5 h-3.5 text-zinc-400" />
                                                <span>Lihat</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const itemLike: any = {
                                                        id: p.id,
                                                        nama_produk: p.nama,
                                                        station: isKitchen ? 'kitchen' : 'barista',
                                                        produk: p,
                                                    };
                                                    handleStartEditRecipe(itemLike);
                                                }}
                                                className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 text-xs font-black transition flex items-center justify-center gap-1 shadow-xs"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Katalog */}
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
                            <span>Menampilkan {filteredCatalogProduks.length} menu</span>
                            <button
                                type="button"
                                onClick={() => setIsRecipeCatalogOpen(false)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
                                    isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                }`}
                            >
                                Tutup Katalog
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── POPUP KONFIRMASI PEMBATALAN / HAPUS PESANAN KDS ── */}
            {cancelOrderTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade">
                    <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-4 ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                    }`}>
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm">Konfirmasi Pembatalan Pesanan</h3>
                                    <p className="text-[10px] text-zinc-400">
                                        Tiket #{cancelOrderTarget.nomor_pesanan || cancelOrderTarget.no_struk || `ORD-${cancelOrderTarget.id}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setCancelOrderTarget(null)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                            isDarkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}>
                            <div className="flex justify-between items-center font-bold">
                                <span>Tujuan:</span>
                                <span className="text-amber-500">
                                    {cancelOrderTarget.meja ? `Meja ${cancelOrderTarget.meja.nomor || cancelOrderTarget.meja.no_meja}` : 'Take Away'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500">
                                <span>Pelanggan:</span>
                                <span>{cancelOrderTarget.nama_pelanggan || 'Walk-in Guest'}</span>
                            </div>
                            <div className="flex justify-between items-center text-zinc-500">
                                <span>Jumlah Item:</span>
                                <span>{(cancelOrderTarget.details || cancelOrderTarget.items || []).length} Menu</span>
                            </div>
                        </div>

                        {/* Reason Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold block text-zinc-700 dark:text-zinc-300">
                                Alasan Pembatalan / Void Kitchen:
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {[
                                    'Salah input pesanan',
                                    'Pelanggan membatalkan',
                                    'Bahan baku habis',
                                    'Duplikasi tiket',
                                    'Meja salah input'
                                ].map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => setCancelReason(reason)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                                            cancelReason === reason
                                                ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                                                : isDarkMode
                                                    ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                                                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                                        }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Tulis alasan pembatalan..."
                                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 ${
                                    isDarkMode 
                                        ? 'bg-zinc-950 border-zinc-800 text-white focus:ring-rose-500' 
                                        : 'bg-white border-zinc-300 text-zinc-900 focus:ring-rose-500'
                                }`}
                            />
                        </div>

                        {/* Action buttons with keyboard shortcut indicators */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setCancelOrderTarget(null)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Batal (Esc)
                            </button>
                            <button
                                type="button"
                                disabled={isCancelling}
                                onClick={handleConfirmCancelOrder}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <X className="w-3.5 h-3.5" />
                                <span>{isCancelling ? 'Membatalkan...' : 'Ya, Batalkan Pesanan (Enter)'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL PENGATURAN TAMPILAN & KDS ── */}
            {isKdsSettingsOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade"
                    onClick={() => setIsKdsSettingsOpen(false)}
                >
                    <div 
                        className={`w-full max-w-md rounded-3xl border shadow-2xl p-5 space-y-4 my-auto overflow-hidden animate-in zoom-in-95 duration-150 ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                        }`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                                    <Settings className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm sm:text-base leading-tight">Pengaturan Layar KDS</h3>
                                    <p className="text-[11px] text-zinc-400">Preferensi tampilan visual &amp; stasiun kerja dapur</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsKdsSettingsOpen(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Konten Pengaturan */}
                        <div className="space-y-4 text-xs">
                            {/* 1. Pengaturan Mode Gelap / Terang */}
                            <div className={`p-3.5 rounded-2xl border space-y-2.5 ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Tema Visual Layar KDS</h4>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Pilih mode tampilan sesuai pencahayaan stasiun dapur</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-zinc-200/80 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-300/80 dark:border-zinc-700">
                                        <button
                                            type="button"
                                            onClick={() => isDarkMode && toggleTheme()}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                                !isDarkMode ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-200'
                                            }`}
                                        >
                                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Terang</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => !isDarkMode && toggleTheme()}
                                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                                isDarkMode ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                                            }`}
                                        >
                                            <Moon className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Gelap</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Pengaturan Mode Jam Sibuk */}
                            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                                <div>
                                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Mode Jam Sibuk (Rush Mode)</span>
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Ringkasan total antrean item sekaligus</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleRushMode}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                        isRushMode ? 'bg-rose-500 text-white shadow-xs' : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
                                    }`}
                                >
                                    {isRushMode ? 'Aktif' : 'Mati'}
                                </button>
                            </div>

                            {/* 3. Filter Stasiun Kerja */}
                            <div className={`p-3.5 rounded-2xl border space-y-2 ${
                                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                            }`}>
                                <h4 className="font-bold text-xs text-zinc-900 dark:text-white">Filter Stasiun Kerja Aktif</h4>
                                <div className="grid grid-cols-3 gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setFilterStation('all')}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                                            filterStation === 'all'
                                                ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-zinc-900 text-white shadow-xs'
                                                : isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600 border border-zinc-200'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterStation('barista')}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                                            filterStation === 'barista'
                                                ? 'bg-amber-500 text-zinc-950 shadow-xs'
                                                : isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600 border border-zinc-200'
                                        }`}
                                    >
                                        <Coffee className="w-3.5 h-3.5" /> Barista
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFilterStation('kitchen')}
                                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition ${
                                            filterStation === 'kitchen'
                                                ? 'bg-emerald-500 text-zinc-950 shadow-xs'
                                                : isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600 border border-zinc-200'
                                        }`}
                                    >
                                        <Utensils className="w-3.5 h-3.5" /> Dapur
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal */}
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsKdsSettingsOpen(false)}
                                className={`px-4 py-2 rounded-xl font-bold text-xs transition active:scale-95 ${
                                    isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                                }`}
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
