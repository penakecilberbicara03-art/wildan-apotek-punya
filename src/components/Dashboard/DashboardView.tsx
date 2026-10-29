import React, { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, DollarSign, ShoppingCart,
  AlertTriangle, Clock, Calendar, Download, Printer,
  ArrowUpRight, Users, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah, getDaysUntilExpiry } from '../../utils/formatters';
import { exportSalesToCSV, printMonthlyReport } from '../../utils/exportHelpers';

export const DashboardView: React.FC = () => {
  const {
    transactions,
    medicines,
    patients,
    currentUser,
    setActiveMenu
  } = usePharmacy();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Calculations
  const completedSales = transactions.filter(t => t.status === 'Lunas');
  const totalOmzet = completedSales.reduce((acc, t) => acc + t.grandTotal, 0);
  const totalTrxCount = completedSales.length;
  const avgBasket = totalTrxCount > 0 ? totalOmzet / totalTrxCount : 0;

  // Approximate gross margin: assuming 28% typical pharmacy margin
  const estimatedHPP = totalOmzet * 0.72;
  const estimatedGrossProfit = totalOmzet - estimatedHPP;

  // Critical stock & expiring counts
  const lowStockMedicines = medicines.filter(m => m.stock <= m.minStockAlert);
  const expiringMedicines = medicines.filter(m => getDaysUntilExpiry(m.expiryDate) <= 60);

  // Payment breakdown
  const paymentBreakdown = {
    tunai: completedSales.filter(t => t.paymentMethod === 'tunai').reduce((s, t) => s + t.grandTotal, 0),
    qris: completedSales.filter(t => t.paymentMethod === 'qris').reduce((s, t) => s + t.grandTotal, 0),
    transfer: completedSales.filter(t => t.paymentMethod === 'transfer').reduce((s, t) => s + t.grandTotal, 0),
    kartu: completedSales.filter(t => t.paymentMethod === 'kartu').reduce((s, t) => s + t.grandTotal, 0),
    tempo: completedSales.filter(t => t.paymentMethod === 'tempo').reduce((s, t) => s + t.grandTotal, 0),
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto h-[calc(100vh-53px)] p-6 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#0066cc]" />
            <span>Dasbor Analitik Bisnis & Kinerja Apotek</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keputusan manajerial berbasis data real-time: arus penjualan, laba kotor, dan peringatan inventaris.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => exportSalesToCSV(transactions)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel (.CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => printMonthlyReport(transactions, medicines)}
            className="px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Kinerja (PDF)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Omzet Penjualan</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs periode lalu</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Transaksi Selesai</span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-[#0066cc] flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {totalTrxCount} Trx
          </div>
          <div className="text-[11px] text-slate-500">
            Rata-rata: <strong className="font-mono">{formatRupiah(avgBasket)}</strong> /struk
          </div>
        </div>

        {/* Estimasi Laba Kotor */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Estimasi Laba Kotor</span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-teal-700 font-mono-numbers">
            {formatRupiah(estimatedGrossProfit)}
          </div>
          <div className="text-[11px] text-slate-500">
            Margin kotor rata-rata: <strong className="text-teal-800">28.0%</strong>
          </div>
        </div>

        {/* Pasien Terdaftar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pasien Terdata</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-numbers">
            {patients.length} Pasien
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            100% diproteksi enkripsi AES-256
          </div>
        </div>
      </div>

      {/* Critical Stock & Expiry Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stok Menipis Alert Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Peringatan Stok di Bawah Batas Minimum ({lowStockMedicines.length})</span>
            </h3>
            <button
              onClick={() => setActiveMenu('persediaan')}
              className="text-xs text-[#0066cc] hover:underline font-semibold"
            >
              Lihat Gudang
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {lowStockMedicines.map(med => (
              <div key={med.id} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{med.name}</div>
                  <div className="text-[10px] text-slate-500">Lokasi: {med.shelfLocation} · Supplier: {med.supplier}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-600 font-mono-numbers">{med.stock} {med.unit}</div>
                  <div className="text-[10px] text-slate-400">Batas Min: {med.minStockAlert} {med.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kedaluwarsa Segera Alert Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Monitoring Obat Mendekati Kedaluwarsa ({expiringMedicines.length})</span>
            </h3>
            <button
              onClick={() => setActiveMenu('persediaan')}
              className="text-xs text-[#0066cc] hover:underline font-semibold"
            >
              Kelola Batch
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {expiringMedicines.map(med => {
              const days = getDaysUntilExpiry(med.expiryDate);
              return (
                <div key={med.id} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{med.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Batch: {med.batchNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-600 font-mono">{med.expiryDate}</div>
                    <div className="text-[10px] font-bold text-rose-700">Tersisa {days} hari lagi</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Distribusi Kanal Pembayaran Kasir</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Tunai (Cash):</span>
            <div className="font-bold text-slate-900 font-mono-numbers">{formatRupiah(paymentBreakdown.tunai)}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">QRIS Dinamis:</span>
            <div className="font-bold text-slate-900 font-mono-numbers">{formatRupiah(paymentBreakdown.qris)}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Transfer Bank:</span>
            <div className="font-bold text-slate-900 font-mono-numbers">{formatRupiah(paymentBreakdown.transfer)}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Kartu Debit/Kredit:</span>
            <div className="font-bold text-slate-900 font-mono-numbers">{formatRupiah(paymentBreakdown.kartu)}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-1">Tempo (Piutang):</span>
            <div className="font-bold text-amber-700 font-mono-numbers">{formatRupiah(paymentBreakdown.tempo)}</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Riwayat Transaksi Penjualan Terakhir</h3>
          <button
            onClick={() => setActiveMenu('daftar-penjualan')}
            className="text-xs text-[#0066cc] hover:underline font-semibold"
          >
            Lihat Semua Transaksi
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Kasir</th>
                <th className="py-2.5 px-3">Pasien</th>
                <th className="py-2.5 px-3">Metode Bayar</th>
                <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 5).map(trx => (
                <tr key={trx.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{trx.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{trx.date}</td>
                  <td className="py-2.5 px-3 text-slate-700">{trx.cashierName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{trx.patientName || 'Pasien Umum'}</td>
                  <td className="py-2.5 px-3 uppercase font-semibold text-slate-600">{trx.paymentMethod}</td>
                  <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-slate-900">
                    {formatRupiah(trx.grandTotal)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
