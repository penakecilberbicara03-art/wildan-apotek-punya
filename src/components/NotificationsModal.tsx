import React, { useState } from 'react';
import {
  Bell, AlertTriangle, AlertCircle, CheckCircle2, Clock,
  X, CheckCheck, RefreshCw, ShoppingCart
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { getDaysUntilExpiry } from '../utils/formatters';

interface NotificationsModalProps {
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    restockMedicine,
    medicines
  } = usePharmacy();

  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterType === 'expiry') return n.type === 'EXPIRY_ALERT';
    if (filterType === 'stock') return n.type === 'MIN_STOCK_ALERT';
    if (filterType === 'sale') return n.type === 'SALE_COMPLETE';
    return true;
  });

  const handleQuickRestock = (medicineId?: string) => {
    if (!medicineId) return;
    const med = medicines.find(m => m.id === medicineId);
    if (med) {
      restockMedicine(medicineId, 20);
      alert(`Restock berhasil! Ditambahkan 20 ${med.unit} untuk ${med.name}.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0066cc] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-yellow-300" />
            <div>
              <h3 className="font-bold text-sm">Pusat Notifikasi & Peringatan Otomatis</h3>
              <p className="text-[11px] text-sky-200">Kedaluwarsa obat & ambang batas stok minimum</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'all' ? 'bg-[#0066cc] text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('expiry')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'expiry' ? 'bg-[#0066cc] text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kedaluwarsa
            </button>
            <button
              onClick={() => setFilterType('stock')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'stock' ? 'bg-[#0066cc] text-white' : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              Stok Minimum
            </button>
          </div>

          <button
            onClick={clearAllNotifications}
            className="text-[11px] text-[#0066cc] hover:underline font-bold flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Tandai Dibaca
          </button>
        </div>

        {/* Notification List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1 text-xs">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 stroke-1 mb-2" />
              <p className="font-semibold text-slate-700">Semua Terkendali!</p>
              <p className="text-[11px] text-slate-400">Tidak ada notifikasi aktif untuk kategori ini.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const isDanger = n.severity === 'danger';
              const isWarning = n.severity === 'warning';
              const isSuccess = n.severity === 'success';

              return (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    !n.isRead ? 'bg-sky-50/60 border-sky-300 shadow-xs' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isDanger && <AlertCircle className="w-4 h-4 text-red-600" />}
                      {isWarning && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{n.message}</p>

                      {/* Quick Action for Low Stock */}
                      {n.type === 'MIN_STOCK_ALERT' && n.relatedId && (
                        <div className="pt-1.5 flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickRestock(n.relatedId);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Pesan Tambah Stok (+20 Unit)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
