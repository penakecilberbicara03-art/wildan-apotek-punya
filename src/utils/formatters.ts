export function formatRupiah(amount: number, withDecimals: boolean = false): string {
  if (isNaN(amount)) return 'Rp 0';
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(amount);
  
  // Format as in screenshot: "Rp. 0,00" or "Rp 15.000"
  return formatted.replace('IDR', 'Rp.');
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getDaysUntilExpiry(expiryDateStr: string): number {
  const today = new Date('2026-10-29'); // Synchronized with metadata local time
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Generate lightweight SVG Barcode (Code128 visual simulation)
 */
export function generateBarcodeSvg(code: string): string {
  let bars = '';
  let x = 10;
  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w1 = (charCode % 3) + 1;
    const w2 = ((charCode * 2) % 3) + 1;
    const w3 = ((charCode * 3) % 2) + 1;
    bars += `<rect x="${x}" y="5" width="${w1}" height="40" fill="#111827" />`;
    x += w1 + 2;
    bars += `<rect x="${x}" y="5" width="${w2}" height="40" fill="#111827" />`;
    x += w2 + 3;
    bars += `<rect x="${x}" y="5" width="${w3}" height="40" fill="#111827" />`;
    x += w3 + 2;
  }
  return `<svg viewBox="0 0 ${Math.max(x + 10, 180)} 55" xmlns="http://www.w3.org/2000/svg" class="w-full h-12">
    ${bars}
    <text x="${x / 2}" y="52" font-family="JetBrains Mono, monospace" font-size="10" fill="#4b5563" text-anchor="middle">${code}</text>
  </svg>`;
}
