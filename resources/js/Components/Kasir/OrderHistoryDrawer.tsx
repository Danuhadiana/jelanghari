import React, { useState, useEffect } from 'react';
import { 
    Clock, Search, Receipt, Printer, X, RefreshCw, 
    CheckCircle2, AlertCircle, Eye, User, MapPin 
} from 'lucide-react';
import { rupiah } from '@/lib/format';

interface OrderItem {
    id: number;
    nomor_pesanan: string;
    nama_pelanggan: string;
    tipe_pesanan: string;
    total: number;
    metode_pembayaran: string;
    status_pembayaran: string;
    status_pesanan: string;
    created_at: string;
    meja?: { nomor?: string; nama?: string } | null;
    details?: Array<{
        id: number;
        nama_produk: string;
        jumlah: number;
        subtotal: number;
    }>;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onViewStruk: (orderId: number) => void;
}

export default function OrderHistoryDrawer({
    isOpen,
    onClose,
    onViewStruk,
}: Props) {
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen]);

    const fetchOrders = () => {
        setIsLoading(true);
        fetch('/kasir/riwayat', {
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.orders) {
                    setOrders(data.orders);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    };

    if (!isOpen) return null;

    const filteredOrders = orders.filter(o => {
        const query = searchQuery.toLowerCase();
        const matchNomor = o.nomor_pesanan?.toLowerCase().includes(query);
        const matchName = o.nama_pelanggan?.toLowerCase().includes(query);
        const matchMeja = o.meja?.nomor?.toLowerCase().includes(query);
        return matchNomor || matchName || matchMeja;
    });

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/60">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
                            <Clock className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                Riwayat Pesanan Kasir
                            </h3>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Transaksi hari ini ({orders.length} pesanan)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={fetchOrders}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            title="Segarkan data"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Cari no struk, nama pelanggan, atau no meja..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-800 dark:focus:ring-zinc-600"
                        />
                    </div>
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {isLoading && orders.length === 0 ? (
                        <div className="py-12 text-center text-xs text-zinc-400">
                            Memuat riwayat transaksi...
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="py-12 text-center text-xs text-zinc-400">
                            Tidak ada pesanan yang sesuai pencarian.
                        </div>
                    ) : (
                        filteredOrders.map((ord) => {
                            const timeStr = new Date(ord.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={ord.id}
                                    className="p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-800 rounded-xl transition space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                                {ord.nomor_pesanan}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-mono">
                                                • {timeStr}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            ord.status_pesanan === 'selesai'
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                : ord.status_pesanan === 'dibatalkan'
                                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                        }`}>
                                            {ord.status_pesanan}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                                            <span className="font-medium truncate max-w-[150px]">
                                                {ord.nama_pelanggan || 'Pelanggan'}
                                            </span>
                                            {ord.meja?.nomor && (
                                                <span className="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-[10px] font-bold">
                                                    Meja #{ord.meja.nomor}
                                                </span>
                                            )}
                                        </div>
                                        <span className="font-mono font-bold text-zinc-950 dark:text-white">
                                            {rupiah(ord.total)}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px]">
                                        <span className="text-zinc-400 uppercase text-[10px] font-medium">
                                            Bayar: <b className="text-zinc-700 dark:text-zinc-300">{ord.metode_pembayaran}</b>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onViewStruk(ord.id)}
                                            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-semibold flex items-center gap-1 transition"
                                        >
                                            <Receipt className="w-3 h-3" />
                                            <span>Lihat / Cetak Struk</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
}
