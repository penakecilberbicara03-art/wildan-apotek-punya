import React, { useState } from 'react';
import { ScanBarcode, Camera, X, Check, Search, AlertCircle } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Medicine } from '../../types/pharmacy';

interface BarcodeScannerModalProps {
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ onClose }) => {
  const { medicines, addToCart } = usePharmacy();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanMessage, setScanMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleScanCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const matchedMedicine = medicines.find(
      m => m.barcode === trimmed || m.code.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedMedicine) {
      addToCart(matchedMedicine, 1);
      setScanMessage({
        type: 'success',
        text: `Berhasil menambahkan: ${matchedMedicine.name} (Stok: ${matchedMedicine.stock} ${matchedMedicine.unit})`
      });
      setBarcodeInput('');
    } else {
      setScanMessage({
        type: 'error',
        text: `Barcode / Kode '${trimmed}' tidak ditemukan di katalog obat apotek!`
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanCode(barcodeInput);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-sky-200" />
            <h3 className="font-bold text-sm">Pemindai Barcode Obat (Scanner)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Simulated Scanner Viewport */}
          <div className="relative bg-slate-950 rounded-xl h-44 overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-sky-400">
            {/* Viewfinder laser line animation */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse" />
            <div className="absolute inset-10 border border-white/20 rounded-lg pointer-events-none flex items-center justify-center">
              <Camera className="w-8 h-8 text-white/40" />
            </div>
            <div className="absolute bottom-3 text-center text-[11px] text-white/80 font-mono">
              Arahkan barcode obat ke area laser merah atau ketik di bawah
            </div>
          </div>

          {/* Input field for manual or USB handheld barcode scanner */}
          <form onSubmit={handleFormSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Input Barcode Scanner (Mendukung Scanner USB/Bluetooth Fisik):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="Scan barcode atau ketik angka barcode..."
                  className="w-full text-xs font-mono p-2.5 pl-8 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent outline-none"
                />
                <ScanBarcode className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Input
              </button>
            </div>
          </form>

          {/* Scan result message */}
          {scanMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                scanMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {scanMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{scanMessage.text}</span>
            </div>
          )}

          {/* Quick test buttons for rapid demonstration */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Uji Cepat Barcode Obat (Klik untuk Scan):
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {medicines.slice(0, 6).map((med) => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleScanCode(med.barcode)}
                  className="p-2 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 rounded-xl text-left transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-900 group-hover:text-[#0066cc] truncate">
                    {med.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Barcode: {med.barcode}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              Selesai Memindai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
