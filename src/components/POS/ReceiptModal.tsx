import React from 'react';
import { Printer, Download, X, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah, formatDateTime, generateBarcodeSvg } from '../../utils/formatters';

interface ReceiptModalProps {
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ onClose }) => {
  const { lastCompletedSale, setIsReceiptModalOpen } = usePharmacy();

  if (!lastCompletedSale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTxt = () => {
    const lines = [
      '========================================',
      '         APOTEK JAWARA FARMA            ',
      ' SIA: 442/089/SIA/2024 · SIPA: 1988/2022',
      ' Jl. Pajajaran No. 42, Telp: (022) 728-1900',
      '========================================',
      `No Faktur : ${lastCompletedSale.invoiceNumber}`,
      `Waktu     : ${formatDateTime(lastCompletedSale.date)}`,
      `Kasir     : ${lastCompletedSale.cashierName}`,
      `Pasien    : ${lastCompletedSale.patientName || 'Pasien Umum'}`,
      `Dokter    : ${lastCompletedSale.doctorName || '-'}`,
      '----------------------------------------',
      ...lastCompletedSale.items.map(item =>
        `${item.medicine.name}\n  ${item.quantity} ${item.unit} x ${formatRupiah(item.subtotal / item.quantity)} = ${formatRupiah(item.subtotal)}\n  * Etiket: ${item.etiketNote || '-'}`
      ),
      '----------------------------------------',
      `Subtotal        : ${formatRupiah(lastCompletedSale.subtotal)}`,
      `Diskon          : -${formatRupiah(lastCompletedSale.discountTotal)}`,
      `Biaya Servis    : ${formatRupiah(lastCompletedSale.serviceFee)}`,
      `Biaya Embalase  : ${formatRupiah(lastCompletedSale.embalaseFee)}`,
      `GRAND TOTAL     : ${formatRupiah(lastCompletedSale.grandTotal)}`,
      `Metode Bayar    : ${lastCompletedSale.paymentMethod.toUpperCase()}`,
      `Jumlah Bayar    : ${formatRupiah(lastCompletedSale.amountPaid)}`,
      `Kembalian       : ${formatRupiah(lastCompletedSale.changeDue)}`,
      '========================================',
      '         SEMOGA LEKAS SEMBUH            ',
      '  Simpan struk ini sebagai bukti resmi  ',
      '========================================'
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Struk_${lastCompletedSale.invoiceNumber.replace(/\//g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm">Transaksi Berhasil · Struk Kasir</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="overflow-y-auto p-4 flex justify-center bg-slate-100 flex-1">
          <div
            id="printable-receipt"
            className="w-72 bg-white p-4 shadow-sm border border-slate-200 text-slate-800 text-xs font-mono select-none"
          >
            {/* Pharmacy Branding */}
            <div className="text-center pb-2 border-b border-dashed border-slate-300">
              <div className="font-black text-sm text-slate-950 font-sans tracking-wide">
                APOTEK JAWARA FARMA
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5 leading-tight">
                SIA: 442/089/SIA/DPMPTSP/2024
              </div>
              <div className="text-[10px] text-slate-600 leading-tight">
                SIPA: 19880415/SIPA_32.73/2022/2012
              </div>
              <div className="text-[10px] text-slate-600 leading-tight">
                Jl. Pajajaran No. 42, Telp: (022) 728-1900
              </div>
            </div>

            {/* Transaction Metadata */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>No Faktur:</span>
                <span className="font-bold">{lastCompletedSale.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{formatDateTime(lastCompletedSale.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{lastCompletedSale.cashierName}</span>
              </div>
              {lastCompletedSale.patientName && (
                <div className="flex justify-between">
                  <span>Pasien:</span>
                  <span className="font-semibold">{lastCompletedSale.patientName}</span>
                </div>
              )}
              {lastCompletedSale.doctorName && (
                <div className="flex justify-between">
                  <span>Dokter:</span>
                  <span>{lastCompletedSale.doctorName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Kanal/Etalase:</span>
                <span>{lastCompletedSale.channel} / {lastCompletedSale.shelf}</span>
              </div>
            </div>

            {/* Items with Etiket / Signa */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-2">
              {lastCompletedSale.items.map((item, idx) => (
                <div key={idx} className="text-[11px]">
                  <div className="font-bold text-slate-950">{item.medicine.name}</div>
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.subtotal / item.quantity)}
                    </span>
                    <span className="font-bold text-slate-900 font-mono-numbers">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                  {item.etiketNote && (
                    <div className="text-[10px] text-sky-800 bg-sky-50 px-1 py-0.5 rounded mt-0.5 italic">
                      Signa: {item.etiketNote}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals & Fees */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Sub-Total:</span>
                <span className="font-mono-numbers">{formatRupiah(lastCompletedSale.subtotal)}</span>
              </div>
              {lastCompletedSale.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon Faktur:</span>
                  <span className="font-mono-numbers">-{formatRupiah(lastCompletedSale.discountTotal)}</span>
                </div>
              )}
              {lastCompletedSale.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Servis/Racik:</span>
                  <span className="font-mono-numbers">{formatRupiah(lastCompletedSale.serviceFee)}</span>
                </div>
              )}
              {lastCompletedSale.embalaseFee > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Embalase:</span>
                  <span className="font-mono-numbers">{formatRupiah(lastCompletedSale.embalaseFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                <span>TOTAL AKHIR:</span>
                <span className="font-mono-numbers font-black text-slate-950">
                  {formatRupiah(lastCompletedSale.grandTotal, true)}
                </span>
              </div>
            </div>

            {/* Payment & Change */}
            <div className="py-2 border-b border-dashed border-slate-300 space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span>Pembayaran:</span>
                <span className="font-bold uppercase">{lastCompletedSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Jumlah Bayar:</span>
                <span className="font-mono-numbers">{formatRupiah(lastCompletedSale.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian:</span>
                <span className="font-mono-numbers">{formatRupiah(lastCompletedSale.changeDue, true)}</span>
              </div>
            </div>

            {/* Barcode & Footer Note */}
            <div className="pt-2 text-center space-y-1">
              <div
                className="w-full flex justify-center py-1"
                dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(lastCompletedSale.invoiceNumber) }}
              />
              <div className="text-[10px] font-bold text-slate-700">
                SEMOGA LEKAS SEMBUH
              </div>
              <div className="text-[9px] text-slate-500 leading-tight">
                Barang yang sudah dibeli tidak dapat ditukar/dikembalikan tanpa resep & struk resmi.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex-1 py-2 px-3 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Unduh TXT
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk [Print]
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
