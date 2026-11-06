import React, { useState } from 'react';
import { useCartStore } from '@/Stores/cartStore';
import { rupiah } from '@/lib/format';
import { 
    Trash2, Plus, Minus, Utensils, ShoppingBag, Truck, MapPin, 
    User, ChevronRight, Sparkles, Crown, Check, X, Search, 
    UserPlus, Loader2, Award, ChefHat, MessageSquare
} from 'lucide-react';

interface CustomerItem {
    id: number;
    nama: string;
    telepon: string;
    email?: string;
    poin: number;
}

interface Props {
    pajakPersen: number;
    servicePersen: number;
    customers?: CustomerItem[];
    onOpenTableModal: () => void;
    onOpenPaymentModal: () => void;
}

export default function CartPanel({ 
    pajakPersen, 
    servicePersen, 
    customers = [], 
    onOpenTableModal, 
    onOpenPaymentModal 
}: Props) {
    const {
        items,
        tipe,
        noMeja,
        namaPelanggan,
        teleponPelanggan,
        customerId,
        customerPoin,
        poinTukar,
        poinDiskonNominal,
        setOrderType,
        setCustomer,
        setMember,
        setPoinTukar,
        updateQty,
        updateCatatan,
        removeItem,
        clearCart,
        getSubtotal,
        getTotalQty
    } = useCartStore();

    // Catatan Kitchen per Produk
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState<string>('');

    // Member & Customer Mode Tabs
    const [mode, setMode] = useState<'walk_in' | 'member'>(customerId ? 'member' : 'walk_in');
    const [memberSearch, setMemberSearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Quick Register Member Modal
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');

    const subtotal = getSubtotal();
    const diskonPoin = poinDiskonNominal || 0;
    const netSubtotal = Math.max(0, subtotal - diskonPoin);
    const service = Math.round((netSubtotal * (servicePersen || 0)) / 100);
    const pajak = Math.round(((netSubtotal + service) * (pajakPersen || 0)) / 100);
    const total = netSubtotal + service + pajak;
    const totalQty = getTotalQty();
    const estimasiPoinDidapat = Math.floor(subtotal / 10000);

    // Filter member list
    const filteredCustomers = customers.filter(c => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.toLowerCase();
        return c.nama.toLowerCase().includes(q) || (c.telepon && c.telepon.includes(q));
    });

    const handleSelectMember = (c: CustomerItem) => {
        setMember(c);
        setMode('member');
        setIsDropdownOpen(false);
        setMemberSearch('');
    };

    const handleRemoveMember = () => {
        setMember(null);
        setCustomer('', '');
    };

    const handleQuickRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName.trim() || !regPhone.trim()) {
            setRegError('Nama dan Nomor WhatsApp wajib diisi.');
            return;
        }

        setRegLoading(true);
        setRegError('');

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch('/kasir/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    nama: regName.trim(),
                    telepon: regPhone.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setRegError(data.message || 'Gagal mendaftarkan member.');
                setRegLoading(false);
                return;
            }

            if (data.customer) {
                handleSelectMember(data.customer);
                setShowRegisterModal(false);
                setRegName('');
                setRegPhone('');
            }
        } catch (err: any) {
            setRegError('Koneksi bermasalah saat mendaftar member.');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 transition-colors">
            
            {/* ── HEADER TIPE PESANAN ── */}
            <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/60">
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-950 dark:text-white">Pesanan Kasir</span>
                        <span className="text-[11px] font-mono font-bold bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-700 dark:text-zinc-300">
                            {totalQty} item
                        </span>
                    </div>
                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={clearCart}
                            className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline"
                        >
                            Kosongkan
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setOrderType('dine_in')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                            tipe === 'dine_in' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                    >
                        <Utensils className="w-3 h-3" /> Dine In
                    </button>
                    <button
                        type="button"
                        onClick={() => setOrderType('takeaway')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                            tipe === 'takeaway' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                    >
                        <ShoppingBag className="w-3 h-3" /> Takeaway
                    </button>
                    <button
                        type="button"
                        onClick={() => setOrderType('delivery')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
                            tipe === 'delivery' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                        }`}
                    >
                        <Truck className="w-3 h-3" /> Delivery
                    </button>
                </div>

                {tipe === 'dine_in' && (
                    <button
                        type="button"
                        onClick={onOpenTableModal}
                        className="mt-2 w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs hover:border-zinc-400 dark:hover:border-zinc-500 transition shadow-xs"
                    >
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="font-semibold text-zinc-900 dark:text-white">
                                {noMeja ? `Meja: ${noMeja}` : 'Pilih Nomor Meja'}
                            </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>
                )}
            </div>

            {/* ── DAFTAR ITEM KERANJANG ── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                        <ShoppingBag className="w-10 h-10 stroke-1 mb-2 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Keranjang masih kosong</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Pilih menu di sisi kiri untuk menambahkan pesanan.</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.cartItemId} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-zinc-950 dark:text-white truncate">
                                        {item.nama}
                                    </h4>
                                    {item.namaVarian && (
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                                            {item.namaVarian}
                                        </span>
                                    )}
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5 space-y-0.5">
                                            {item.modifiers.map((m, idx) => (
                                                <span key={idx} className="block">+ {m.nama} ({rupiah(m.harga)})</span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Catatan Kitchen Khusus Item Ini */}
                                    {editingNoteId === item.cartItemId ? (
                                        <div className="mt-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-200 flex items-center gap-1">
                                                    <ChefHat className="w-3 h-3 text-amber-500" />
                                                    <span>Note Khusus Kitchen / Bar:</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingNoteId(null)}
                                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={tempNote}
                                                    onChange={(e) => setTempNote(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            updateCatatan(item.cartItemId, tempNote.trim());
                                                            setEditingNoteId(null);
                                                        }
                                                    }}
                                                    placeholder="Contoh: Less sugar, pisah sambal..."
                                                    className="flex-1 px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        updateCatatan(item.cartItemId, tempNote.trim());
                                                        setEditingNoteId(null);
                                                    }}
                                                    className="px-2.5 py-1 bg-zinc-950 dark:bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition"
                                                >
                                                    OK
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {['Less Sugar', 'Pedas', 'Tidak Pedas', 'Pisah Sambal', 'Tanpa Bawang', 'Dahului', 'Bungkus'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => {
                                                            const next = tempNote ? `${tempNote}, ${tag}` : tag;
                                                            setTempNote(next);
                                                            updateCatatan(item.cartItemId, next);
                                                        }}
                                                        className="px-1.5 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[9.5px] font-medium transition"
                                                    >
                                                        +{tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex items-center justify-between">
                                            {item.catatan ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingNoteId(item.cartItemId);
                                                        setTempNote(item.catatan);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/60 text-[10px] font-medium hover:bg-amber-100 dark:hover:bg-amber-900/60 transition text-left"
                                                >
                                                    <ChefHat className="w-3 h-3 text-amber-500 shrink-0" />
                                                    <span className="truncate max-w-[220px]">{item.catatan}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingNoteId(item.cartItemId);
                                                        setTempNote('');
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition font-medium"
                                                >
                                                    <ChefHat className="w-3 h-3 text-zinc-400" />
                                                    <span>+ Note Kitchen</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeItem(item.cartItemId)}
                                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60">
                                <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                                    {rupiah(item.subtotal)}
                                </span>
                                <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => updateQty(item.cartItemId, -1)}
                                        className="p-1 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono font-bold text-xs px-1 min-w-[20px] text-center text-zinc-900 dark:text-white">
                                        {item.qty}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateQty(item.cartItemId, 1)}
                                        className="p-1 rounded text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* ── BAGIAN INPUT PELANGGAN / MEMBER POIN & RINGKASAN TOTAL ── */}
            <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 flex-shrink-0 space-y-3">
                
                {/* 1. Selector Mode Pelanggan: Tamu Walk-in vs Member Poin */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('walk_in');
                                    handleRemoveMember();
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                    mode === 'walk_in' && !customerId
                                        ? 'bg-zinc-900 text-white dark:bg-zinc-700 dark:text-zinc-100 shadow-2xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/70 dark:bg-zinc-800'
                                }`}
                            >
                                Pelanggan Umum (Non-Member)
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('member')}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                                    mode === 'member' || customerId
                                        ? 'bg-emerald-600 text-white shadow-2xs'
                                        : 'text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-zinc-200/60 dark:bg-zinc-800'
                                }`}
                            >
                                <Crown className="w-3 h-3" />
                                <span>Member Jelang Poin</span>
                            </button>
                        </div>

                        {mode === 'member' && !customerId && (
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(true)}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
                            >
                                <UserPlus className="w-3 h-3" />
                                <span>+ Daftar</span>
                            </button>
                        )}
                    </div>

                    {/* Form Input Sesuai Mode */}
                    {mode === 'walk_in' && !customerId ? (
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Nama Pelanggan (Opsional)"
                                value={namaPelanggan}
                                onChange={(e) => setCustomer(e.target.value, teleponPelanggan)}
                                className="px-2.5 py-1.5 bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-500 dark:focus:border-zinc-400"
                            />
                            <input
                                type="text"
                                placeholder="No. WA (Opsional)"
                                value={teleponPelanggan}
                                onChange={(e) => setCustomer(namaPelanggan, e.target.value)}
                                className="px-2.5 py-1.5 bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-500 dark:focus:border-zinc-400"
                            />
                        </div>
                    ) : customerId ? (
                        /* KARTU MEMBER AKTIF TERPILIH */
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                                        <Crown className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-zinc-900 dark:text-white text-xs">{namaPelanggan}</span>
                                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                                                Member
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-mono">
                                            {teleponPelanggan || 'Tanpa no. WA'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRemoveMember}
                                    className="p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                                    title="Ganti / Lepas Member"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Info Saldo Poin & Estimasi Poin Baru */}
                            <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-emerald-200/80 dark:border-emerald-900/60">
                                <div className="bg-white/80 dark:bg-zinc-900/80 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                    <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block">Saldo Poin:</span>
                                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-xs">
                                        ⚡ {customerPoin} Poin
                                    </span>
                                </div>
                                <div className="bg-white/80 dark:bg-zinc-900/80 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                                    <span className="text-zinc-500 dark:text-zinc-400 text-[10px] block">Poin Belanja:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                                        +{estimasiPoinDidapat} Pts
                                    </span>
                                </div>
                            </div>

                            {/* Fitur Tukar Poin Menjadi Diskon (1 Poin = Rp 1.000) */}
                            {customerPoin > 0 && subtotal >= 10000 && (
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Tukar Poin Diskon (1 Poin = Rp 1.000):</span>
                                        {poinTukar > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setPoinTukar(0)}
                                                className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                                            >
                                                Batal Tukar
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => setPoinTukar(0)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                                poinTukar === 0 
                                                    ? 'bg-zinc-900 text-white dark:bg-zinc-700' 
                                                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                            }`}
                                        >
                                            0 Pts
                                        </button>
                                        {customerPoin >= 5 && (
                                            <button
                                                type="button"
                                                onClick={() => setPoinTukar(5)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                                    poinTukar === 5 
                                                        ? 'bg-emerald-600 text-white border-emerald-500' 
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                5 Pts (-5k)
                                            </button>
                                        )}
                                        {customerPoin >= 10 && (
                                            <button
                                                type="button"
                                                onClick={() => setPoinTukar(10)}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                                    poinTukar === 10 
                                                        ? 'bg-emerald-600 text-white border-emerald-500' 
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                10 Pts (-10k)
                                            </button>
                                        )}
                                        {customerPoin > 10 && (
                                            <button
                                                type="button"
                                                onClick={() => setPoinTukar(Math.min(customerPoin, Math.floor(subtotal / 1000)))}
                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                                                    poinTukar > 10 
                                                        ? 'bg-emerald-600 text-white border-emerald-500' 
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                            >
                                                Maks
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* PENCARIAN MEMBER */
                        <div className="relative">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Cari Member (Nama / No. WhatsApp)..."
                                    value={memberSearch}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onChange={(e) => {
                                        setMemberSearch(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                                {memberSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setMemberSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Dropdown Hasil Pencarian Member */}
                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 bottom-full mb-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-30 p-1 space-y-1">
                                    <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex justify-between items-center">
                                        <span>Daftar Member Jelang Hari</span>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {filteredCustomers.length === 0 ? (
                                        <div className="p-3 text-center text-xs text-zinc-500 space-y-1.5">
                                            <p>Member tidak ditemukan.</p>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    setShowRegisterModal(true);
                                                    setRegName(memberSearch);
                                                }}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1"
                                            >
                                                <UserPlus className="w-3 h-3" />
                                                <span>Daftarkan Sekarang</span>
                                            </button>
                                        </div>
                                    ) : (
                                        filteredCustomers.map(cust => (
                                            <button
                                                key={cust.id}
                                                type="button"
                                                onClick={() => handleSelectMember(cust)}
                                                className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between transition"
                                            >
                                                <div>
                                                    <span className="font-bold text-xs text-zinc-900 dark:text-white block">{cust.nama}</span>
                                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">{cust.telepon || 'Tanpa no. WA'}</span>
                                                </div>
                                                <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/60">
                                                    ⚡ {cust.poin} pts
                                                </span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. Rincian Biaya & Total */}
                <div className="space-y-1 text-xs border-t border-zinc-200 dark:border-zinc-800 pt-2.5">
                    <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                        <span>Subtotal Produk:</span>
                        <span className="font-mono">{rupiah(subtotal)}</span>
                    </div>

                    {diskonPoin > 0 && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Diskon Poin Member ({poinTukar} Pts):</span>
                            <span className="font-mono">-{rupiah(diskonPoin)}</span>
                        </div>
                    )}

                    {service > 0 && (
                        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                            <span>Service Charge ({servicePersen}%):</span>
                            <span className="font-mono">{rupiah(service)}</span>
                        </div>
                    )}

                    {pajak > 0 && (
                        <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                            <span>Pajak Resto PB1 ({pajakPersen}%):</span>
                            <span className="font-mono">{rupiah(pajak)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-sm font-bold text-zinc-950 dark:text-white pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                        <span>Total Tagihan:</span>
                        <span className="font-mono text-base font-black">{rupiah(total)}</span>
                    </div>
                </div>

                {/* 3. Tombol Eksekusi Bayar */}
                <button
                    type="button"
                    disabled={items.length === 0}
                    onClick={onOpenPaymentModal}
                    className="w-full py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md flex items-center justify-between disabled:opacity-50 active:scale-95"
                >
                    <span>BAYAR SEKARANG</span>
                    <span className="font-mono text-sm">{rupiah(total)}</span>
                </button>
            </div>

            {/* ── MODAL PENDAFTARAN MEMBER BARU INSTAN ── */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <Crown className="w-5 h-5" />
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">Daftar Member Baru</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowRegisterModal(false)}
                                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Member baru langsung mendapatkan bonus <strong>25 Poin Selamat Datang</strong>!
                        </p>

                        <form onSubmit={handleQuickRegister} className="space-y-3">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Rian Anggara"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                                    Nomor WhatsApp <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Contoh: 081234567890"
                                    value={regPhone}
                                    onChange={(e) => setRegPhone(e.target.value)}
                                    className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                                />
                            </div>

                            {regError && (
                                <p className="text-xs text-rose-500 font-medium">{regError}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    disabled={regLoading}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {regLoading ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Mendaftar...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Simpan & Pilih</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
