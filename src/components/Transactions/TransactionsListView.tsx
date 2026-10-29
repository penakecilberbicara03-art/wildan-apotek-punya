import React, { useState } from 'react';
import {
  FileText, RotateCcw, XCircle, Printer, Download,
  Search, Eye, CheckCircle2, AlertCircle
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { exportSalesToCSV } from '../../utils/exportHelpers';
import { SaleTransaction } from '../../types/pharmacy';

interface TransactionsListViewProps {
  viewMode: 'daftar' | 'pesanan' | 'retur' | 'tertolak';
}

export const TransactionsListView: React.FC<TransactionsListViewProps> = ({ viewMode }) => {
  const {
    transactions,
    setIsReceiptModalOpen,
    setActiveMenu
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<SaleTransaction | null>(null);

  const titleMap = {
    daftar: 'Daftar Penjualan & Faktur Kasir',
    pesanan: 'Pesanan Penjualan Multi-Kanal [BETA]',
    retur: 'Retur Penjualan & Pengembalian Obat',
    tertolak: 'Daftar Penjualan Tertolak / Dibatalkan',
  };

  const filtered = transactions.filter(t => {
    const matchesSearch = t.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.cashierName.toLowerCase().includes(search.toLowerCase()) ||
      (t.patientName && t.patientName.toLowerCase().includes(search.toLowerCase()));

    if (viewMode === 'pesanan') return matchesSearch && t.channel !== 'Offline';
    if (viewMode === 'retur') return matchesSearch && t.status === 'Tertunda';
    if (viewMode === 'tertolak') return matchesSearch && t.status === 'Dibatalkan';
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-[calc(100vh-53px)]">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0066cc]" />
            <span>{titleMap[viewMode]}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring riwayat transaksi kasir, cetak ulang struk, dan status pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportSalesToCSV(transactions)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Faktur (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 text-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no faktur, kasir, atau nama pasien..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#0066cc]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="text-slate-500 font-medium">
          Ditemukan <strong>{filtered.length}</strong> transaksi
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">No. Faktur</th>
                <th className="py-3 px-3">Waktu Transaksi</th>
                <th className="py-3 px-3">Kasir</th>
                <th className="py-3 px-3">Pasien / Rekam Medis</th>
                <th className="py-3 px-3">Kanal & Etalase</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi pada filter ini.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 font-mono">{t.invoiceNumber}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDateTime(t.date)}</td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{t.cashierName}</td>
                    <td className="py-3 px-3 text-slate-800">{t.patientName || 'Pasien Umum'}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-semibold text-slate-800">{t.channel}</span> · {t.shelf}
                    </td>
                    <td className="py-3 px-3 uppercase font-bold text-slate-700">{t.paymentMethod}</td>
                    <td className="py-3 px-3 text-right font-black font-mono-numbers text-slate-900">
                      {formatRupiah(t.grandTotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'Tempo' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedTrx(t)}
                          className="p-1 text-slate-500 hover:text-[#0066cc] hover:bg-sky-50 rounded transition-colors"
                          title="Lihat Rincian Faktur"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Transaction Modal */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">Rincian Faktur: {selectedTrx.invoiceNumber}</h3>
              <button onClick={() => setSelectedTrx(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu:</span>
                  <span className="font-mono text-slate-800">{formatDateTime(selectedTrx.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kasir:</span>
                  <span className="font-semibold text-slate-800">{selectedTrx.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pasien:</span>
                  <span className="font-semibold text-slate-800">{selectedTrx.patientName || 'Pasien Umum'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Metode Bayar:</span>
                  <span className="font-bold uppercase text-[#0066cc]">{selectedTrx.paymentMethod}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700">Daftar Obat Dibeli:</div>
                <div className="divide-y divide-slate-100 p-2 space-y-1">
                  {selectedTrx.items.map((it, idx) => (
                    <div key={idx} className="p-1.5 flex justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{it.medicine.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {it.quantity} {it.unit} · {it.etiketNote ? `Signa: ${it.etiketNote}` : ''}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatRupiah(it.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center">
                <span className="font-bold">Total Pembayaran:</span>
                <span className="font-black text-emerald-400 font-mono text-sm">
                  {formatRupiah(selectedTrx.grandTotal, true)}
                </span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTrx(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
