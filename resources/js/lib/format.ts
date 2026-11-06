export function rupiah(value?: number | string | null): string {
    const num = typeof value === 'number' && !isNaN(value) ? value : Number(value || 0) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

export function tanggal_id(dateStr?: string | Date | null): string {
    if (!dateStr) return '-';
    try {
        const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
        if (isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(d);
    } catch {
        return '-';
    }
}
