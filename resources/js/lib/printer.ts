export async function printViaWebUSB(rawText: string): Promise<boolean> {
    try {
        if (!('usb' in navigator)) {
            console.warn('WebUSB tidak didukung pada browser ini. Beralih ke window.print() standar.');
            window.print();
            return false;
        }

        const device = await (navigator as any).usb.requestDevice({
            filters: []
        });

        await device.open();
        if (device.configuration === null) {
            await device.selectConfiguration(1);
        }
        await device.claimInterface(0);

        const encoder = new TextEncoder();
        const data = encoder.encode(rawText + '\n\n\n\x1B\x69');

        await device.transferOut(1, data);
        await device.close();
        return true;
    } catch (err) {
        console.warn('Cetak USB dibatalkan atau gagal, menggunakan print dialog standar.', err);
        window.print();
        return false;
    }
}

export function formatStrukRaw(order: any, cafe: any): string {
    const divider = '--------------------------------\n';
    let content = '';

    content += `\x1B\x61\x01`; // Center
    content += `${cafe.nama}\n`;
    content += `${cafe.alamat || ''}\n`;
    content += divider;

    content += `\x1B\x61\x00`; // Left
    content += `No   : ${order.no_struk}\n`;
    content += `Kasir: ${order.kasir?.nama || 'Kasir'}\n`;
    content += `Tipe : ${order.tipe?.toUpperCase()}\n`;
    content += divider;

    order.items?.forEach((item: any) => {
        content += `${item.nama_produk} (${item.qty}x)\n`;
        content += `  @Rp${item.harga.toLocaleString('id-ID')} = Rp${item.subtotal.toLocaleString('id-ID')}\n`;
        if (item.modifier_text) {
            content += `  + ${item.modifier_text}\n`;
        }
    });

    content += divider;
    content += `\x1B\x61\x02`; // Right
    content += `Subtotal : Rp${order.subtotal.toLocaleString('id-ID')}\n`;
    if (order.diskon > 0) content += `Diskon   :-Rp${order.diskon.toLocaleString('id-ID')}\n`;
    content += `TOTAL    : Rp${order.total.toLocaleString('id-ID')}\n`;
    content += `Bayar    : Rp${order.bayar.toLocaleString('id-ID')}\n`;
    content += `Kembalian: Rp${order.kembalian.toLocaleString('id-ID')}\n`;

    content += `\x1B\x61\x01`; // Center
    content += divider;
    content += `${cafe.footer || 'Terima kasih!'}\n\n\n`;

    return content;
}
