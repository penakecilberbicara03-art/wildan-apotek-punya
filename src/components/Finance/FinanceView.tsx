import React, { useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Download,
  Calendar, ArrowRight, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah } from '../../utils/formatters';
import { exportSalesToCSV } from '../../utils/exportHelpers';

export const FinanceView: React.FC = () => {
  const { transactions } = usePharmacy();
  const [period, setPeriod] = useState<'today' | 'this_month' | 'this_year'>('this_month');

  // Completed sales
  const lunasSales = transactions.filter(t => t.status === 'Lunas');
  const tempoSales = transactions.filter(t => t.status === 'Tempo');

  const grossSales = lunasSales.reduce((acc, t) => acc + t.subtotal, 0);
  const totalDiscounts = lunasSales.reduce((acc, t) => acc + t.discountTotal, 0);
  const netSales = grossSales - totalDiscounts;

  // Extra fees collected (Embalase + Tuslah/Servis + Ongkir)
  const totalServiceFees = lunasSales.reduce((acc, t) => acc + t.serviceFee, 0);
  const totalEmbalaseFees = lunasSales.reduce((acc, t) => acc + t.embalaseFee, 0);
  const totalExtraIncome = totalServiceFees + totalEmbalaseFees;

  // HPP (Cost of Goods Sold) estimated at 72%
  const hpp = netSales * 0.72;
  const grossProfit = netSales - hpp + totalExtraIncome;

  // Operational expenses simulation (Gaji karyawan, listrik, sewa, internet)
  const operationalExpenses = [
    { name: 'Gaji Karyawan & Kasir', amount: 8500000 },
    { name: 'Sewa Tempat & Listrik PLN', amount: 2200000 },
    { name: 'Internet & Cloud Hosting Apotek', amount: 450000 },
    { name: 'Peralatan Habis Pakai (Plastik/Kertas Struk)', amount: 350000 },
  ];
  const totalOpEx = operationalExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - (period === 'today' ? totalOpEx / 30 : totalOpEx);

  const totalPiutang = tempoSales.reduce((s, t) => s + t.grandTotal, 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto h-[calc(100vh-53px)] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>Laporan Keuangan Otomatis & Laba Rugi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Perhitungan otomatis laba kotor, HPP, arus kas masuk, dan piutang penjualan tempo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportSalesToCSV(transactions)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Unduh Laporan Finansial (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Income Statement Table (Laporan Laba Rugi) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Laporan Laba Rugi Komprehensif (Otomatis)</h3>
            <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              Periode: Oktober 2026
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Revenue */}
            <div className="space-y-1">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">1. Pendapatan Operasional</div>
              <div className="flex justify-between py-1 pl-3 text-slate-600">
                <span>Penjualan Kotor (Gross Sales)</span>
                <span className="font-mono font-medium">{formatRupiah(grossSales)}</span>
              </div>
              <div className="flex justify-between py-1 pl-3 text-rose-600">
                <span>Potongan / Diskon Faktur</span>
                <span className="font-mono font-medium">-{formatRupiah(totalDiscounts)}</span>
              </div>
              <div className="flex justify-between py-1 pl-3 font-bold text-slate-900 border-t border-slate-100">
                <span>Penjualan Bersih (Net Sales)</span>
                <span className="font-mono">{formatRupiah(netSales)}</span>
              </div>
            </div>

            {/* HPP */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">2. Beban Pokok Penjualan (HPP)</div>
              <div className="flex justify-between py-1 pl-3 text-slate-600">
                <span>Harga Pokok Penjualan Obat (HPP Farmasi)</span>
                <span className="font-mono text-rose-700">-{formatRupiah(hpp)}</span>
              </div>
              <div className="flex justify-between py-1 pl-3 text-emerald-700 font-semibold">
                <span>Pendapatan Servis & Embalase Racikan (Tuslah)</span>
                <span className="font-mono">+{formatRupiah(totalExtraIncome)}</span>
              </div>
              <div className="flex justify-between py-1.5 pl-3 font-bold text-emerald-700 bg-emerald-50 rounded-lg px-2">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono font-black">{formatRupiah(grossProfit)}</span>
              </div>
            </div>

            {/* Operational Expenses */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">3. Beban Operasional Apotek</div>
              {operationalExpenses.map((exp, idx) => (
                <div key={idx} className="flex justify-between py-1 pl-3 text-slate-600">
                  <span>{exp.name}</span>
                  <span className="font-mono">-{formatRupiah(exp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 pl-3 font-semibold text-rose-700 border-t border-slate-100">
                <span>Total Beban Operasional</span>
                <span className="font-mono">-{formatRupiah(totalOpEx)}</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="pt-3 border-t-2 border-slate-300">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 text-white">
                <div>
                  <div className="font-black text-sm">LABA BERSIH (NET PROFIT)</div>
                  <div className="text-[10px] text-slate-400">Setelah dikurangi HPP dan seluruh biaya operasional</div>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono-numbers">
                  {formatRupiah(netProfit)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Column: Piutang & Cash Flow */}
        <div className="space-y-4">
          {/* Piutang Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <span>Piutang Dagang (Penjualan Tempo)</span>
            </h4>
            <div className="text-2xl font-black text-amber-700 font-mono-numbers">
              {formatRupiah(totalPiutang)}
            </div>
            <p className="text-xs text-slate-500">
              Total {tempoSales.length} faktur tempo belum lunas. Notifikasi penagihan dikirim otomatis menjelang jatuh tempo.
            </p>
          </div>

          {/* Tax Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">Status Perpajakan:</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Non-PKP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Apotek berstatus Non-Pengusaha Kena Pajak (PPN 0% pada transaksi kasir langsung sesuai regulasi PMK).
            </p>
          </div>

          {/* Quick Cash Flow Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Arus Kas Masuk Riil</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Kas di Tangan (Fisik Laci):</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatRupiah(lunasSales.filter(t => t.paymentMethod === 'tunai').reduce((s, t) => s + t.grandTotal, 0))}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Kas Bank & QRIS (Settlement):</span>
                <span className="font-bold font-mono text-slate-900">
                  {formatRupiah(lunasSales.filter(t => t.paymentMethod !== 'tunai' && t.paymentMethod !== 'tempo').reduce((s, t) => s + t.grandTotal, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
