import React, { useState } from 'react';
import {
  CreditCard, Banknote, QrCode, Building, Clock,
  X, Check, Calculator, AlertTriangle
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah } from '../../utils/formatters';
import { PaymentMethod } from '../../types/pharmacy';

interface PaymentModalProps {
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const {
    cartGrandTotal,
    completeSale,
    selectedPatient,
    selectedDoctor,
    posSettings,
    allergyWarnings
  } = usePharmacy();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [amountPaid, setAmountPaid] = useState<number>(cartGrandTotal);
  const [transactionNotes, setTransactionNotes] = useState<string>('');
  const [bankName, setBankName] = useState<string>('BCA');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [tempoDueDate, setTempoDueDate] = useState<string>('2026-11-29');

  const changeDue = Math.max(0, amountPaid - cartGrandTotal);
  const isUnderpaid = paymentMethod === 'tunai' && amountPaid < cartGrandTotal;

  const quickNominals = [
    { label: 'Uang Pas', value: cartGrandTotal },
    { label: 'Rp 20.000', value: 20000 },
    { label: 'Rp 50.000', value: 50000 },
    { label: 'Rp 100.000', value: 100000 },
    { label: 'Rp 200.000', value: 200000 },
    { label: 'Rp 500.000', value: 500000 },
  ];

  const handleSelectQuickNominal = (val: number) => {
    setAmountPaid(val);
  };

  const handleCompletePayment = () => {
    if (isUnderpaid) return;

    let finalNotes = transactionNotes;
    if (paymentMethod === 'transfer' || paymentMethod === 'kartu') {
      finalNotes = `${bankName} Ref: ${referenceNumber || 'EDC-APPROVED'} | ${transactionNotes}`;
    } else if (paymentMethod === 'tempo') {
      finalNotes = `Tempo s.d ${tempoDueDate} | ${transactionNotes}`;
    }

    completeSale(
      paymentMethod,
      paymentMethod === 'tunai' ? amountPaid : cartGrandTotal,
      finalNotes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0066cc] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-300" />
              Pembayaran Transaksi [F2]
            </h3>
            <div className="text-xs text-sky-200">
              Terminal: {posSettings.sessionCode} · Etalase: {posSettings.shelf}
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Allergy Warning Banner if any */}
        {allergyWarnings.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Peringatan Klinis / Kontraindikasi Alergi:</div>
              {allergyWarnings.map((w, idx) => (
                <div key={idx}>{w}</div>
              ))}
            </div>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Total Bill Display */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-inner">
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Tagihan (Grand Total):</div>
              <div className="text-2xl font-black text-emerald-400 font-mono-numbers">
                {formatRupiah(cartGrandTotal, true)}
              </div>
            </div>
            {selectedPatient && (
              <div className="text-right text-xs">
                <div className="text-slate-400">Pasien:</div>
                <div className="font-semibold text-white">{selectedPatient.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{selectedPatient.medicalRecordNo}</div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Metode Pembayaran:
            </label>
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('tunai');
                  setAmountPaid(cartGrandTotal);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  paymentMethod === 'tunai'
                    ? 'border-[#0066cc] bg-sky-50 text-[#0066cc] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span>Tunai</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('qris');
                  setAmountPaid(cartGrandTotal);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  paymentMethod === 'qris'
                    ? 'border-[#0066cc] bg-sky-50 text-[#0066cc] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span>QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer');
                  setAmountPaid(cartGrandTotal);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  paymentMethod === 'transfer'
                    ? 'border-[#0066cc] bg-sky-50 text-[#0066cc] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building className="w-5 h-5 text-sky-600" />
                <span>Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('kartu');
                  setAmountPaid(cartGrandTotal);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  paymentMethod === 'kartu'
                    ? 'border-[#0066cc] bg-sky-50 text-[#0066cc] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <span>Kartu/EDC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('tempo');
                  setAmountPaid(0);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                  paymentMethod === 'tempo'
                    ? 'border-[#0066cc] bg-sky-50 text-[#0066cc] shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Clock className="w-5 h-5 text-purple-600" />
                <span>Tempo</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Details */}
          {paymentMethod === 'tunai' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uang Diterima dari Pelanggan:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={amountPaid || ''}
                    onChange={(e) => setAmountPaid(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-base font-bold font-mono-numbers focus:ring-2 focus:ring-[#0066cc] outline-none"
                  />
                </div>
              </div>

              {/* Quick Bill Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickNominals.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectQuickNominal(item.value)}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-sky-100 hover:border-sky-300 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Display */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Kembalian:</span>
                <span className={`text-lg font-black font-mono-numbers ${isUnderpaid ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {isUnderpaid ? `Kurang ${formatRupiah(cartGrandTotal - amountPaid)}` : formatRupiah(changeDue, true)}
                </span>
              </div>
            </div>
          )}

          {paymentMethod === 'qris' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-2">
              <div className="text-xs font-bold text-slate-700">QRIS Standar Bank Indonesia</div>
              <div className="p-3 bg-white rounded-lg border border-slate-300 shadow-sm">
                {/* SVG QR Code Simulation */}
                <svg width="130" height="130" viewBox="0 0 100 100" className="mx-auto">
                  <rect width="100" height="100" fill="white" />
                  {/* Position detection squares */}
                  <rect x="5" y="5" width="28" height="28" fill="black" />
                  <rect x="9" y="9" width="20" height="20" fill="white" />
                  <rect x="13" y="13" width="12" height="12" fill="black" />

                  <rect x="67" y="5" width="28" height="28" fill="black" />
                  <rect x="71" y="9" width="20" height="20" fill="white" />
                  <rect x="75" y="13" width="12" height="12" fill="black" />

                  <rect x="5" y="67" width="28" height="28" fill="black" />
                  <rect x="9" y="71" width="20" height="20" fill="white" />
                  <rect x="13" y="75" width="12" height="12" fill="black" />

                  {/* Simulated QR data matrix */}
                  <rect x="40" y="10" width="8" height="8" fill="black" />
                  <rect x="52" y="15" width="8" height="8" fill="black" />
                  <rect x="40" y="30" width="8" height="8" fill="black" />
                  <rect x="20" y="45" width="8" height="8" fill="black" />
                  <rect x="45" y="45" width="10" height="10" fill="#0066cc" />
                  <rect x="65" y="40" width="8" height="8" fill="black" />
                  <rect x="80" y="50" width="8" height="8" fill="black" />
                  <rect x="40" y="70" width="8" height="8" fill="black" />
                  <rect x="60" y="70" width="8" height="8" fill="black" />
                  <rect x="75" y="75" width="12" height="12" fill="black" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                NMID: ID1029283748201 · Apotek Jawara Farma
              </div>
              <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Terhubung otomatis dengan BCA / Mandiri / GoPay / OVO / ShopeePay
              </div>
            </div>
          )}

          {(paymentMethod === 'transfer' || paymentMethod === 'kartu') && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank / Penyedia EDC:</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="BCA">BCA (Bank Central Asia)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="BRI">Bank BRI</option>
                    <option value="BNI">Bank BNI</option>
                    <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Approval / Referensi:</label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Contoh: REF-881903"
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'tempo' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Transaksi ini akan dibukukan sebagai <strong>Piutang Usaha (Tempo)</strong>.
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Jatuh Tempo:</label>
                <input
                  type="date"
                  value={tempoDueDate}
                  onChange={(e) => setTempoDueDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Transaksi (Opsional):
            </label>
            <input
              type="text"
              value={transactionNotes}
              onChange={(e) => setTransactionNotes(e.target.value)}
              placeholder="misal: Pasien minta struk rangkap 2, dll."
              className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0066cc] outline-none"
            />
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-slate-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isUnderpaid}
              onClick={handleCompletePayment}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                isUnderpaid
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Check className="w-4 h-4" />
              Selesaikan & Cetak Struk [Enter]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
