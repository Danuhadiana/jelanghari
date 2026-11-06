import React, { useState } from 'react';
import KasirLayout from '@/Layouts/KasirLayout';
import CategoryFilter, { 
    MenuType, DRINK_SLUGS, FOOD_SLUGS, SNACK_SLUGS 
} from '@/Components/Kasir/CategoryFilter';
import ProdukCard, { ProdukItem } from '@/Components/Kasir/ProdukCard';
import VariantModifierModal from '@/Components/Kasir/VariantModifierModal';
import CartPanel from '@/Components/Kasir/CartPanel';
import TableModal from '@/Components/Kasir/TableModal';
import PaymentModal from '@/Components/Kasir/PaymentModal';
import StrukPreviewModal from '@/Components/Kasir/StrukPreviewModal';
import ShiftModal from '@/Components/Kasir/ShiftModal';
import OrderConfirmModal from '@/Components/Kasir/OrderConfirmModal';
import OrderSuccessModal from '@/Components/Kasir/OrderSuccessModal';
import OrderHistoryDrawer from '@/Components/Kasir/OrderHistoryDrawer';
import KasirCalculatorDrawer from '@/Components/Kasir/KasirCalculatorDrawer';
import { useCartStore } from '@/Stores/cartStore';
import { router, usePage } from '@inertiajs/react';
import { Search, ShoppingBag, Store, Clock, History, AlertCircle, ChefHat, X } from 'lucide-react';
import { rupiah } from '@/lib/format';
import { Link } from '@inertiajs/react';

interface Props {
    kategori: Array<{ id: number; nama: string; slug: string }>;
    produk: ProdukItem[];
    meja: Array<{ id: number; no_meja: string; kapasitas: number; lokasi: string; status: 'kosong' | 'terisi' | 'reserved' }>;
    customers?: Array<{ id: number; nama: string; telepon: string; email?: string; poin: number }>;
    pengaturan: {
        nama_cafe: string;
        pajak_persen: number;
        service_persen: number;
        footer_struk: string;
    };
    active_shift?: any;
    activeShift?: any;
}

export default function Index({ 
    kategori = [], 
    produk = [], 
    meja = [], 
    customers = [],
    pengaturan, 
    active_shift, 
    activeShift: propActiveShift 
}: Props) {
    const currentShift = active_shift || propActiveShift;

    // Filter Kategori (Disederhanakan & Efisien)
    const [selectedType, setSelectedType] = useState<MenuType>('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals POS
    const [selectedProdukForModal, setSelectedProdukForModal] = useState<ProdukItem | null>(null);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStrukModalOpen, setIsStrukModalOpen] = useState(false);
    const [lastCompletedOrderId, setLastCompletedOrderId] = useState<number | null>(null);

    // Modal Shift (Buka / Tutup Toko / Riwayat)
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [shiftModalMode, setShiftModalMode] = useState<'buka' | 'tutup' | 'history'>('buka');

    // Modal Konfirmasi & Berhasil Transaksi
    const [isOrderConfirmModalOpen, setIsOrderConfirmModalOpen] = useState(false);
    const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState(false);
    const [pendingPaymentData, setPendingPaymentData] = useState<{ metode: string; bayar: number; metodeLabel?: string } | null>(null);
    const [lastCompletedOrderData, setLastCompletedOrderData] = useState<{
        id: number | null;
        nomor: string | null;
        total: number;
        kembalian: number;
    } | null>(null);

    // Drawer Riwayat Pesanan Kasir
    const [isOrderHistoryDrawerOpen, setIsOrderHistoryDrawerOpen] = useState(false);

    // Kalkulator POS Global
    const [isGlobalCalculatorOpen, setIsGlobalCalculatorOpen] = useState(false);

    const [mobileCartOpen, setMobileCartOpen] = useState(false);
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

    const {
        items,
        tipe,
        mejaId,
        namaPelanggan,
        teleponPelanggan,
        catatanPesanan,
        voucherKode,
        voucherDiskon,
        customerId,
        customerPoin,
        poinTukar,
        poinDiskonNominal,
        addItem,
        setMeja,
        clearCart,
        getSubtotal
    } = useCartStore();

    // Logika Pemfilteran Produk yang Rapi & Cepat
    const filteredProduk = (produk || []).filter((p) => {
        // 1. Tipe Primer (Semua, Minuman, Makanan, Camilan)
        if (selectedType === 'minuman') {
            const isDrink = p.station === 'barista' || (p.kategori?.slug && DRINK_SLUGS.includes(p.kategori.slug));
            if (!isDrink) return false;
        } else if (selectedType === 'makanan') {
            const isFood = (p.kategori?.slug && FOOD_SLUGS.includes(p.kategori.slug)) || 
                           (p.station === 'kitchen' && (!p.kategori?.slug || !SNACK_SLUGS.includes(p.kategori.slug)));
            if (!isFood) return false;
        } else if (selectedType === 'snack') {
            const isSnack = p.kategori?.slug && SNACK_SLUGS.includes(p.kategori.slug);
            if (!isSnack) return false;
        }

        // 2. Subkategori Spesifik
        if (selectedCategory && p.kategori?.slug !== selectedCategory) {
            return false;
        }

        // 3. Pencarian Teks
        if (searchQuery) {
            const matchName = p.nama.toLowerCase().includes(searchQuery.toLowerCase());
            const matchDesc = p.deskripsi?.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchName && !matchDesc) return false;
        }

        return true;
    });

    const handleSelectProduk = (p: ProdukItem) => {
        const hasVariants = p.varian && p.varian.length > 0;
        const hasModifiers = p.modifier && p.modifier.length > 0;

        if (hasVariants || hasModifiers) {
            setSelectedProdukForModal(p);
            setIsVariantModalOpen(true);
        } else {
            addItem({
                produkId: p.id,
                nama: p.nama,
                varianId: null,
                namaVarian: null,
                harga: p.harga,
                hpp: p.hpp,
                modifiers: [],
                qty: 1,
                catatan: '',
            });
        }
    };

    const subtotal = getSubtotal();
    const diskonPoin = poinDiskonNominal || 0;
    const totalDiskon = diskonPoin + (voucherDiskon || 0);
    const netSubtotal = Math.max(0, subtotal - totalDiskon);
    const service = Math.round((netSubtotal * (pengaturan?.service_persen || 0)) / 100);
    const pajak = Math.round(((netSubtotal + service) * (pengaturan?.pajak_persen || 0)) / 100);
    const grandTotal = netSubtotal + service + pajak;

    const selectedMejaItem = meja.find(m => m.id === mejaId);
    const selectedMejaNomor = selectedMejaItem ? selectedMejaItem.no_meja : null;

    // 1. Kasir klik bayar di PaymentModal -> Munculkan Modal Konfirmasi
    const handleInitiateCheckout = ({ metode, bayar, metodeLabel }: { metode: string; bayar: number; metodeLabel?: string }) => {
        setPendingPaymentData({ metode, bayar, metodeLabel });
        setIsPaymentModalOpen(false);
        setIsOrderConfirmModalOpen(true);
    };

    // 2. Kasir konfirmasi di Modal Konfirmasi -> Kirim ke backend
    const handleExecuteConfirmedCheckout = () => {
        if (!pendingPaymentData) return;
        setIsProcessingCheckout(true);

        const normalizedTipe = tipe === 'takeaway' ? 'take_away' : tipe;

        const payload = {
            tipe: normalizedTipe,
            tipe_pesanan: normalizedTipe,
            meja_id: mejaId,
            nama_pelanggan: namaPelanggan || 'Pelanggan',
            telepon_pelanggan: teleponPelanggan || null,
            customer_id: customerId || null,
            poin_tukar: poinTukar || 0,
            catatan: catatanPesanan || null,
            voucher_kode: voucherKode || null,
            metode_pembayaran: pendingPaymentData.metode,
            metode_bayar: pendingPaymentData.metode,
            subtotal: subtotal,
            diskon: totalDiskon,
            pajak_persen: pengaturan?.pajak_persen || 0,
            pajak_nominal: pajak,
            service_persen: pengaturan?.service_persen || 0,
            service_nominal: service,
            pembulatan: 0,
            total: grandTotal,
            bayar: pendingPaymentData.bayar,
            kembalian: Math.max(0, pendingPaymentData.bayar - grandTotal),
            items: items.map(item => ({
                produk_id: item.produkId,
                nama_produk: item.nama,
                varian_id: item.varianId || null,
                nama_varian: item.namaVarian || null,
                harga_satuan: item.harga,
                jumlah: item.qty,
                qty: item.qty,
                subtotal: item.subtotal,
                catatan_khusus: item.catatan || null,
                modifiers: item.modifiers.map(m => ({
                    modifier_id: m.id,
                    id: m.id,
                    nama: m.nama,
                    harga: m.harga,
                })),
            })),
        };

        router.post('/kasir/checkout', payload, {
            preserveScroll: true,
            onSuccess: (page) => {
                setIsProcessingCheckout(false);
                setIsOrderConfirmModalOpen(false);

                const newOrderId = (page.props as any)?.flash?.last_order_id || (page.props as any)?.last_order_id;
                const newOrderNomor = (page.props as any)?.flash?.last_order_nomor || (page.props as any)?.last_order_nomor;
                
                const finalOrderId = newOrderId || Date.now();
                setLastCompletedOrderId(finalOrderId);
                setLastCompletedOrderData({
                    id: finalOrderId,
                    nomor: newOrderNomor || `#ORD-${finalOrderId}`,
                    total: grandTotal,
                    kembalian: Math.max(0, pendingPaymentData.bayar - grandTotal),
                });

                clearCart();
                setPendingPaymentData(null);
                
                // Munculkan Pop-up Pesanan Selesai
                setIsOrderSuccessModalOpen(true);
            },
            onError: (errors) => {
                setIsProcessingCheckout(false);
                const firstError = Object.values(errors)[0] as string;
                alert(firstError || 'Terjadi kesalahan saat memproses checkout.');
            }
        });
    };

    return (
        <KasirLayout
            title="Layar Kasir POS"
            currentShift={currentShift}
            onOpenShift={() => {
                setShiftModalMode('buka');
                setIsShiftModalOpen(true);
            }}
            onCloseShift={() => {
                setShiftModalMode('tutup');
                setIsShiftModalOpen(true);
            }}
            onHistoryShift={() => {
                setShiftModalMode('history');
                setIsShiftModalOpen(true);
            }}
            onOpenOrderHistory={() => setIsOrderHistoryDrawerOpen(true)}
            onOpenCalculator={() => setIsGlobalCalculatorOpen(true)}
        >
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-3.5 space-y-3">
                    {/* ── Search & Filter Kategori Efisien ── */}
                    <div className="space-y-2 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Cari nama kopi, makanan, snack..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-600 shadow-xs transition"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Pengelompokan Kategori yang Disederhanakan */}
                        <CategoryFilter
                            categories={kategori}
                            selectedType={selectedType}
                            selectedCategory={selectedCategory}
                            onSelectType={setSelectedType}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>

                    {/* ── Grid Katalog Menu Produk ── */}
                    <div className="flex-1 overflow-y-auto pr-1">
                        {filteredProduk.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-xs text-center p-4">
                                <p>Tidak ada produk yang sesuai dengan filter atau kata kunci "{searchQuery}".</p>
                                <button
                                    onClick={() => {
                                        setSelectedType('all');
                                        setSelectedCategory(null);
                                        setSearchQuery('');
                                    }}
                                    className="mt-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                                >
                                    Reset Semua Filter
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-2.5">
                                {filteredProduk.map((item) => (
                                    <ProdukCard
                                        key={item.id}
                                        produk={item}
                                        onSelect={handleSelectProduk}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tombol Keranjang Mobile */}
                    <div className="md:hidden pt-2 border-t border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setMobileCartOpen(true)}
                            className="w-full py-3 px-4 rounded-xl bg-zinc-950 dark:bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-md active:scale-98 transition"
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                <span>Lihat Keranjang ({items.length})</span>
                            </div>
                            <span className="font-mono">{rupiah(grandTotal)}</span>
                        </button>
                    </div>
                </div>

                {/* Desktop & Tablet Cart Panel - Proporsional untuk Tablet & Desktop */}
                <div className="hidden md:flex md:w-[320px] lg:w-[380px] xl:w-[440px] 2xl:w-[480px] flex-shrink-0 h-full">
                    <CartPanel
                        pajakPersen={pengaturan?.pajak_persen || 0}
                        servicePersen={pengaturan?.service_persen || 0}
                        customers={customers}
                        onOpenTableModal={() => setIsTableModalOpen(true)}
                        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
                    />
                </div>

                {/* Mobile Cart Sheet */}
                {mobileCartOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black/60 flex flex-col justify-end">
                        <div className="bg-white dark:bg-zinc-900 rounded-t-3xl max-h-[85vh] h-full flex flex-col overflow-hidden">
                            <div className="p-2 flex justify-center border-b border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={() => setMobileCartOpen(false)}
                                    className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700"
                                />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CartPanel
                                    pajakPersen={pengaturan?.pajak_persen || 0}
                                    servicePersen={pengaturan?.service_persen || 0}
                                    customers={customers}
                                    onOpenTableModal={() => setIsTableModalOpen(true)}
                                    onOpenPaymentModal={() => {
                                        setMobileCartOpen(false);
                                        setIsPaymentModalOpen(true);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Varian & Modifier */}
            <VariantModifierModal
                produk={selectedProdukForModal}
                isOpen={isVariantModalOpen}
                onClose={() => setIsVariantModalOpen(false)}
                onConfirm={(item) => addItem(item)}
            />

            {/* Modal Pilih Meja */}
            <TableModal
                isOpen={isTableModalOpen}
                mejaList={meja}
                selectedMejaId={mejaId}
                onClose={() => setIsTableModalOpen(false)}
                onSelect={(id, no) => setMeja(id, no)}
            />

            {/* Modal Pembayaran Awal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                total={grandTotal}
                isProcessing={isProcessingCheckout}
                onClose={() => setIsPaymentModalOpen(false)}
                onSubmit={handleInitiateCheckout}
                paymentSettings={pengaturan}
            />

            {/* ── Modal Konfirmasi Pesanan Sebelum Finalisasi ── */}
            <OrderConfirmModal
                isOpen={isOrderConfirmModalOpen}
                items={items}
                tipe={tipe}
                noMeja={selectedMejaNomor}
                namaPelanggan={namaPelanggan}
                catatanPesanan={catatanPesanan}
                metode={pendingPaymentData?.metodeLabel || pendingPaymentData?.metode || 'cash'}
                subtotal={subtotal}
                diskon={totalDiskon}
                service={service}
                pajak={pajak}
                grandTotal={grandTotal}
                bayar={pendingPaymentData?.bayar || grandTotal}
                kembalian={Math.max(0, (pendingPaymentData?.bayar || grandTotal) - grandTotal)}
                poinDidapat={customerId ? Math.floor(grandTotal / 10000) : 0}
                isProcessing={isProcessingCheckout}
                onClose={() => setIsOrderConfirmModalOpen(false)}
                onConfirm={handleExecuteConfirmedCheckout}
            />

            {/* ── Modal Pop-up Pesanan Selesai ── */}
            <OrderSuccessModal
                isOpen={isOrderSuccessModalOpen}
                orderId={lastCompletedOrderData?.id || null}
                orderNumber={lastCompletedOrderData?.nomor || null}
                total={lastCompletedOrderData?.total || 0}
                kembalian={lastCompletedOrderData?.kembalian || 0}
                onClose={() => setIsOrderSuccessModalOpen(false)}
                onPrintReceipt={() => {
                    setIsOrderSuccessModalOpen(false);
                    setIsStrukModalOpen(true);
                }}
                onViewReceipt={() => {
                    setIsOrderSuccessModalOpen(false);
                    setIsStrukModalOpen(true);
                }}
                onNewOrder={() => {
                    setIsOrderSuccessModalOpen(false);
                }}
            />

            {/* Modal Struk & Thermal Print */}
            <StrukPreviewModal
                orderId={lastCompletedOrderId}
                isOpen={isStrukModalOpen}
                onClose={() => setIsStrukModalOpen(false)}
            />

            {/* Modal Buka / Tutup Shift & Hitung Kas */}
            <ShiftModal
                isOpen={isShiftModalOpen}
                mode={shiftModalMode}
                activeShift={currentShift}
                onClose={() => setIsShiftModalOpen(false)}
            />

            {/* Drawer Riwayat Pesanan Kasir Hari Ini */}
            <OrderHistoryDrawer
                isOpen={isOrderHistoryDrawerOpen}
                onClose={() => setIsOrderHistoryDrawerOpen(false)}
                onViewStruk={(orderId) => {
                    setLastCompletedOrderId(orderId);
                    setIsStrukModalOpen(true);
                }}
            />

            {/* Side Drawer Kalkulator POS Global (Keluar dari Kanan) */}
            <KasirCalculatorDrawer
                isOpen={isGlobalCalculatorOpen}
                onClose={() => setIsGlobalCalculatorOpen(false)}
                title="Kalkulator"
            />
        </KasirLayout>
    );
}
