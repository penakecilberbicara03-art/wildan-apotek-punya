import { Medicine, SaleTransaction } from '../types/pharmacy';
import { formatRupiah, formatDateTime } from './formatters';

export function exportInventoryToCSV(medicines: Medicine[]) {
  const headers = ['Kode', 'Barcode', 'Nama Obat', 'Zat Aktif', 'Kategori', 'Stok', 'Satuan', 'Batas Min', 'Batch', 'Kedaluwarsa', 'Harga Beli', 'Harga Jual Umum', 'Lokasi Rak'];
  const rows = medicines.map(m => [
    `"${m.code}"`,
    `"${m.barcode}"`,
    `"${m.name.replace(/"/g, '""')}"`,
    `"${m.activeSubstance}"`,
    `"${m.category}"`,
    m.stock,
    m.unit,
    m.minStockAlert,
    `"${m.batchNumber}"`,
    m.expiryDate,
    m.buyPrice,
    m.sellPriceGeneral,
    `"${m.shelfLocation}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Stok_Apotek_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportSalesToCSV(transactions: SaleTransaction[]) {
  const headers = ['No Faktur', 'Tanggal', 'Kasir', 'Pelanggan', 'Kanal', 'Metode Bayar', 'Subtotal', 'Diskon', 'Biaya Lain', 'Grand Total', 'Status'];
  const rows = transactions.map(t => [
    `"${t.invoiceNumber}"`,
    `"${t.date}"`,
    `"${t.cashierName}"`,
    `"${t.patientName || 'Umum'}"`,
    `"${t.channel}"`,
    `"${t.paymentMethod}"`,
    t.subtotal,
    t.discountTotal,
    t.serviceFee + t.embalaseFee + t.shippingFee + t.otherFee,
    t.grandTotal,
    `"${t.status}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printMonthlyReport(transactions: SaleTransaction[], medicines: Medicine[]) {
  const totalOmzet = transactions.reduce((acc, t) => acc + (t.status === 'Lunas' ? t.grandTotal : 0), 0);
  const totalTrx = transactions.filter(t => t.status === 'Lunas').length;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Kinerja Bulanan Apotek</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
        h1 { margin: 0; color: #0369a1; font-size: 24px; }
        .sub { color: #64748b; font-size: 13px; margin-top: 4px; }
        .kpi-grid { display: flex; gap: 15px; margin-bottom: 25px; }
        .kpi-card { flex: 1; padding: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
        .kpi-val { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; color: #334155; }
        .text-right { text-align: right; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; }
        .signature-box { text-align: center; width: 200px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>APOTEK JAWARA FARMA</h1>
        <div class="sub">SIA: 442/089/SIA/DPMPTSP/2024 · SIPA: 19880415/SIPA_32.73/2022/2012</div>
        <div class="sub">Jl. Pajajaran No. 42, Telp: (022) 728-1900 · Bandung</div>
        <h3 style="margin-top: 15px; margin-bottom: 0;">LAPORAN KINERJA BULANAN & ANALITIK PENJUALAN</h3>
        <div class="sub">Periode: Oktober 2026 · Dicetak: ${new Date().toLocaleDateString('id-ID')}</div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div style="font-size: 12px; color: #64748b;">Total Omzet Penjualan</div>
          <div class="kpi-val">${formatRupiah(totalOmzet)}</div>
        </div>
        <div class="kpi-card">
          <div style="font-size: 12px; color: #64748b;">Total Transaksi Lunas</div>
          <div class="kpi-val">${totalTrx} Trx</div>
        </div>
        <div class="kpi-card">
          <div style="font-size: 12px; color: #64748b;">Rata-rata Keranjang (AOV)</div>
          <div class="kpi-val">${formatRupiah(totalTrx > 0 ? totalOmzet / totalTrx : 0)}</div>
        </div>
        <div class="kpi-card">
          <div style="font-size: 12px; color: #64748b;">Total Item Obat Terdaftar</div>
          <div class="kpi-val">${medicines.length} SKU</div>
        </div>
      </div>

      <h3>Ringkasan Transaksi Penjualan Terakhir</h3>
      <table>
        <thead>
          <tr>
            <th>No Faktur</th>
            <th>Waktu</th>
            <th>Kasir</th>
            <th>Pasien</th>
            <th>Kanal</th>
            <th>Metode</th>
            <th class="text-right">Grand Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.slice(0, 15).map(t => `
            <tr>
              <td><strong>${t.invoiceNumber}</strong></td>
              <td>${formatDateTime(t.date)}</td>
              <td>${t.cashierName}</td>
              <td>${t.patientName || 'Pasien Umum'}</td>
              <td>${t.channel}</td>
              <td>${t.paymentMethod.toUpperCase()}</td>
              <td class="text-right">${formatRupiah(t.grandTotal)}</td>
              <td>${t.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div class="signature-box">
          <p>Disiapkan Oleh,</p>
          <div style="height: 60px;"></div>
          <p><strong>Firmann</strong><br><small>Kasir & Administrasi</small></p>
        </div>
        <div class="signature-box">
          <p>Diverifikasi Oleh,</p>
          <div style="height: 60px;"></div>
          <p><strong>Siti Rahma, S.Farm., Apt.</strong><br><small>Manajer Apotek</small></p>
        </div>
        <div class="signature-box">
          <p>Disetujui Oleh,</p>
          <div style="height: 60px;"></div>
          <p><strong>dr. Hendra Wijaya, Sp.PD</strong><br><small>Pemilik / Owner</small></p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}
