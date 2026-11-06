import { create } from 'zustand';

export interface CartModifier {
    id: number;
    nama: string;
    harga: number;
}

export interface CartItem {
    cartItemId: string;
    produkId: number;
    nama: string;
    varianId?: number | null;
    namaVarian?: string | null;
    harga: number;
    hpp: number;
    modifiers: CartModifier[];
    qty: number;
    catatan: string;
    subtotal: number;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

interface CartState {
    items: CartItem[];
    tipe: OrderType;
    mejaId: number | null;
    noMeja: string | null;
    namaPelanggan: string;
    teleponPelanggan: string;
    catatanPesanan: string;
    voucherKode: string;
    voucherDiskon: number;
    customerId: number | null;
    customerPoin: number;
    poinTukar: number;
    poinDiskonNominal: number;

    addItem: (item: Omit<CartItem, 'cartItemId' | 'subtotal'>) => void;
    updateQty: (cartItemId: string, delta: number) => void;
    removeItem: (cartItemId: string) => void;
    updateCatatan: (cartItemId: string, catatan: string) => void;
    setOrderType: (tipe: OrderType) => void;
    setMeja: (mejaId: number | null, noMeja: string | null) => void;
    setCustomer: (nama: string, telepon: string) => void;
    setMember: (customer: { id: number; nama: string; telepon?: string; poin?: number } | null) => void;
    setPoinTukar: (poin: number) => void;
    setVoucher: (kode: string, diskon: number) => void;
    setCatatanPesanan: (catatan: string) => void;
    clearCart: () => void;

    getSubtotal: () => number;
    getTotalQty: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    tipe: 'dine_in',
    mejaId: null,
    noMeja: null,
    namaPelanggan: '',
    teleponPelanggan: '',
    catatanPesanan: '',
    voucherKode: '',
    voucherDiskon: 0,
    customerId: null,
    customerPoin: 0,
    poinTukar: 0,
    poinDiskonNominal: 0,

    addItem: (newItem) => {
        const modifierKey = newItem.modifiers.map(m => m.id).sort().join('-');
        const cartItemId = `${newItem.produkId}_${newItem.varianId || 0}_${modifierKey}_${newItem.catatan || ''}`;

        set((state) => {
            const existingIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
            if (existingIndex > -1) {
                const updatedItems = [...state.items];
                const item = updatedItems[existingIndex];
                const newQty = item.qty + newItem.qty;
                item.qty = newQty;
                item.subtotal = item.harga * newQty;
                return { items: updatedItems };
            }

            const itemToPush: CartItem = {
                ...newItem,
                cartItemId,
                subtotal: newItem.harga * newItem.qty,
            };
            return { items: [...state.items, itemToPush] };
        });
    },

    updateQty: (cartItemId, delta) => {
        set((state) => {
            const updatedItems = state.items
                .map((item) => {
                    if (item.cartItemId === cartItemId) {
                        const newQty = item.qty + delta;
                        return newQty > 0
                            ? { ...item, qty: newQty, subtotal: item.harga * newQty }
                            : null;
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];

            return { items: updatedItems };
        });
    },

    removeItem: (cartItemId) => {
        set((state) => ({
            items: state.items.filter(i => i.cartItemId !== cartItemId),
        }));
    },

    updateCatatan: (cartItemId, catatan) => {
        set((state) => ({
            items: state.items.map(i => i.cartItemId === cartItemId ? { ...i, catatan } : i),
        }));
    },

    setOrderType: (tipe) => set({ tipe, ...(tipe !== 'dine_in' ? { mejaId: null, noMeja: null } : {}) }),
    setMeja: (mejaId, noMeja) => set({ mejaId, noMeja }),
    setCustomer: (namaPelanggan, teleponPelanggan) => set({ namaPelanggan, teleponPelanggan }),
    setMember: (customer) => {
        if (customer) {
            set({
                customerId: customer.id,
                namaPelanggan: customer.nama,
                teleponPelanggan: customer.telepon || '',
                customerPoin: customer.poin || 0,
                poinTukar: 0,
                poinDiskonNominal: 0,
            });
        } else {
            set({
                customerId: null,
                customerPoin: 0,
                poinTukar: 0,
                poinDiskonNominal: 0,
            });
        }
    },
    setPoinTukar: (poin) => {
        const validPoin = Math.max(0, Math.min(poin, get().customerPoin));
        const diskon = validPoin * 1000; // 1 poin = Rp 1.000 diskon potongan
        set({ poinTukar: validPoin, poinDiskonNominal: diskon });
    },
    setVoucher: (voucherKode, voucherDiskon) => set({ voucherKode, voucherDiskon }),
    setCatatanPesanan: (catatanPesanan) => set({ catatanPesanan }),
    clearCart: () => set({
        items: [],
        tipe: 'dine_in',
        mejaId: null,
        noMeja: null,
        namaPelanggan: '',
        teleponPelanggan: '',
        catatanPesanan: '',
        voucherKode: '',
        voucherDiskon: 0,
        customerId: null,
        customerPoin: 0,
        poinTukar: 0,
        poinDiskonNominal: 0,
    }),

    getSubtotal: () => get().items.reduce((acc, curr) => acc + curr.subtotal, 0),
    getTotalQty: () => get().items.reduce((acc, curr) => acc + curr.qty, 0),
}));
