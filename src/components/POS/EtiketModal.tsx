import React, { useState } from 'react';
import { FileText, X, Check } from 'lucide-react';
import { CartItem } from '../../types/pharmacy';

interface EtiketModalProps {
  item: CartItem;
  onSave: (note: string) => void;
  onClose: () => void;
}

export const EtiketModal: React.FC<EtiketModalProps> = ({ item, onSave, onClose }) => {
  const [note, setNote] = useState(item.etiketNote || 'Sehari 3 kali 1 tablet sesudah makan');

  const presetSignas = [
    'Sehari 3 kali 1 tablet sesudah makan',
    'Sehari 3 kali 1 sendok takar (5 ml) sesudah makan',
    'Sehari 2 kali 1 kapsul sesudah makan',
    'Sehari 1 kali 1 tablet malam hari sebelum tidur',
    'Kunyah 1 tablet 1 jam sebelum makan atau saat perih lambung',
    'Oleskan tipis pada bagian kulit yang gatal/sakit 2x sehari',
    'Sehari 3 kali 1 tablet bila demam/nyeri',
    'Habiskan (Antibiotik)'
  ];

  const handleApplyPreset = (preset: string) => {
    setNote(preset);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-200" />
            <h3 className="font-bold text-sm">Catatan / Etiket Obat Pasien</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Nama Obat:</div>
            <div className="font-bold text-slate-900 text-sm">{item.medicine.name}</div>
            <div className="text-xs text-slate-600">Zat Aktif: {item.medicine.activeSubstance}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aturan Pakai / Signa (Tercetak di Struk & Etiket):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='misal "Sehari 3 kali 1 tablet sesudah makan"'
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0066cc] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Preset Aturan Pakai Cepat:
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {presetSignas.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg text-left transition-colors border ${
                    note === preset
                      ? 'bg-sky-100 text-[#0066cc] border-sky-300 font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(note);
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-[#0066cc] text-white text-xs font-bold hover:bg-sky-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Simpan Etiket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
