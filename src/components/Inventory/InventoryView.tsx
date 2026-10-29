import React, { useState } from 'react';
import {
  Boxes, Search, Plus, Download, AlertTriangle, Clock,
  Edit2, Trash2, Check, ArrowUpDown, Filter, ShoppingCart, RefreshCw
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah, getDaysUntilExpiry } from '../../utils/formatters';
import { exportInventoryToCSV } from '../../utils/exportHelpers';
import { Medicine, DrugCategory, UnitType } from '../../types/pharmacy';

export const InventoryView: React.FC = () => {
  const {
    medicines,
    addMedicine,
    updateMedicine,
    restockMedicine,
    currentUser
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'expiring'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [restockMedicineTarget, setRestockMedicineTarget] = useState<Medicine | null>(null);
  const [restockQty, setRestockQty] = useState(20);
  const [newBatch, setNewBatch] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    name: '',
    activeSubstance: '',
    category: 'Bebas' as DrugCategory,
    dosage: '',
    unit: 'Strip' as UnitType,
    stock: 50,
    minStockAlert: 10,
    batchNumber: 'BATCH-2026',
    expiryDate: '2028-01-01',
    buyPrice: 5000,
    sellPriceGeneral: 7500,
    sellPricePrescription: 7000,
    sellPriceWholesale: 6500,
    shelfLocation: 'Etalase A',
    supplier: 'PT Anugerah Pharmindo',
    requiresPrescription: false,
  });

  // Filtered medicines
  const filtered = medicines.filter(m => {
    const matchesQuery = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.barcode.includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = m.stock <= m.minStockAlert;
    } else if (stockFilter === 'expiring') {
      matchesStock = getDaysUntilExpiry(m.expiryDate) <= 90;
    }

    return matchesQuery && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      code: `MED-${Date.now().toString().slice(-4)}`,
      barcode: `899${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: '',
      activeSubstance: '',
      category: 'Bebas',
      dosage: '',
      unit: 'Strip',
      stock: 50,
      minStockAlert: 10,
      batchNumber: `B${new Date().getFullYear()}${Math.floor(Math.random() * 900 + 100)}`,
      expiryDate: '2028-12-31',
      buyPrice: 5000,
      sellPriceGeneral: 8000,
      sellPricePrescription: 7500,
      sellPriceWholesale: 7000,
      shelfLocation: 'Etalase A',
      supplier: 'PT Kimia Farma Trading',
      requiresPrescription: false,
    });
    setEditingMedicine(null);
    setIsAddModalOpen(true);
  };

  const handleSaveMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMedicine) {
      updateMedicine(editingMedicine.id, formData);
    } else {
      addMedicine({
        ...formData,
        availableUnits: [formData.unit, 'Box'],
      });
    }
    setIsAddModalOpen(false);
  };

  const handleOpenRestock = (med: Medicine) => {
    setRestockMedicineTarget(med);
    setRestockQty(20);
    setNewBatch(med.batchNumber);
    setNewExpiry(med.expiryDate);
  };

  const handleConfirmRestock = () => {
    if (restockMedicineTarget) {
      restockMedicine(restockMedicineTarget.id, restockQty, newBatch, newExpiry);
      setRestockMedicineTarget(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-[calc(100vh-53px)]">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#0066cc]" />
            <span>Manajemen Persediaan Obat & Kedaluwarsa</span>
          </h2>
          <p className="text-xs text-slate-500">
            Katalog stok otomatis dengan peringatan ambang minimum dan monitoring masa aktif obat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportInventoryToCSV(medicines)}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor Excel/CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Obat Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama obat, kode, zat aktif, atau barcode..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Quick Filter Segments */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              stockFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({medicines.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              stockFilter === 'low' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Stok Minimum ({medicines.filter(m => m.stock <= m.minStockAlert).length})</span>
          </button>
          <button
            onClick={() => setStockFilter('expiring')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              stockFilter === 'expiring' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>Segera Kedaluwarsa ({medicines.filter(m => getDaysUntilExpiry(m.expiryDate) <= 90).length})</span>
          </button>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white font-medium"
          >
            <option value="all">Semua Golongan Obat</option>
            <option value="Bebas">Obat Bebas (Hijau)</option>
            <option value="Bebas Terbatas">Obat Bebas Terbatas (Biru)</option>
            <option value="Keras">Obat Keras (Merah K)</option>
            <option value="Narkotika">Narkotika</option>
            <option value="Psikotropika">Psikotropika</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">Kode & Barcode</th>
                <th className="py-3 px-3">Nama Obat & Zat Aktif</th>
                <th className="py-3 px-3">Golongan</th>
                <th className="py-3 px-3 text-center">Stok & Batas Min</th>
                <th className="py-3 px-3">No. Batch & ED</th>
                <th className="py-3 px-3 text-right">Harga Beli</th>
                <th className="py-3 px-3 text-right">Harga Jual (Umum)</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((med) => {
                const daysLeft = getDaysUntilExpiry(med.expiryDate);
                const isExpiredSoon = daysLeft <= 30;
                const isUnderMinStock = med.stock <= med.minStockAlert;

                return (
                  <tr key={med.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{med.code}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{med.barcode}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{med.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {med.activeSubstance} ({med.dosage})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Lokasi: <span className="font-medium text-slate-700">{med.shelfLocation}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        med.category === 'Bebas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : med.category === 'Bebas Terbatas'
                          ? 'bg-blue-100 text-blue-800'
                          : med.category === 'Keras'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {med.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className={`font-black font-mono-numbers text-sm ${
                        isUnderMinStock ? 'text-rose-600' : 'text-slate-800'
                      }`}>
                        {med.stock} {med.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Min: {med.minStockAlert} {med.unit}
                      </div>
                      {isUnderMinStock && (
                        <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200 mt-0.5 inline-block">
                          Segera Restock!
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-700 font-semibold">{med.batchNumber}</div>
                      <div className={`text-[11px] font-medium flex items-center gap-1 ${
                        isExpiredSoon ? 'text-rose-600 font-bold' : daysLeft <= 90 ? 'text-amber-600 font-semibold' : 'text-slate-500'
                      }`}>
                        <Clock className="w-3 h-3" />
                        <span>{med.expiryDate} ({daysLeft > 0 ? `${daysLeft} hari lagi` : 'Kedaluwarsa!'})</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono-numbers text-slate-600">
                      {formatRupiah(med.buyPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      {formatRupiah(med.sellPriceGeneral)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenRestock(med)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Restock Obat"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Restock</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              code: med.code,
                              barcode: med.barcode,
                              name: med.name,
                              activeSubstance: med.activeSubstance,
                              category: med.category,
                              dosage: med.dosage,
                              unit: med.unit,
                              stock: med.stock,
                              minStockAlert: med.minStockAlert,
                              batchNumber: med.batchNumber,
                              expiryDate: med.expiryDate,
                              buyPrice: med.buyPrice,
                              sellPriceGeneral: med.sellPriceGeneral,
                              sellPricePrescription: med.sellPricePrescription,
                              sellPriceWholesale: med.sellPriceWholesale,
                              shelfLocation: med.shelfLocation,
                              supplier: med.supplier,
                              requiresPrescription: med.requiresPrescription,
                            });
                            setEditingMedicine(med);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-[#0066cc] hover:bg-sky-50 rounded transition-colors"
                          title="Edit Obat"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockMedicineTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span>Restock Obat: {restockMedicineTarget.name}</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-slate-600">Stok Saat Ini: <strong>{restockMedicineTarget.stock} {restockMedicineTarget.unit}</strong></div>
              <div className="text-slate-600">Ambang Batas Minimum: <strong>{restockMedicineTarget.minStockAlert} {restockMedicineTarget.unit}</strong></div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jumlah Tambahan Stok ({restockMedicineTarget.unit}):</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border border-slate-300 rounded-xl font-bold font-mono-numbers text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Batch Baru:</label>
                <input
                  type="text"
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tgl. Kedaluwarsa Baru:</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockMedicineTarget(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
              >
                Konfirmasi Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">
                {editingMedicine ? 'Edit Data Obat' : 'Tambah Obat Baru ke Katalog'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveMedicine} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Obat:</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Barcode Scanner:</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Obat:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PARACETAMOL 500 MG"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zat Aktif:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Parasetamol 500 mg"
                    value={formData.activeSubstance}
                    onChange={(e) => setFormData({ ...formData, activeSubstance: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Golongan Obat:</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bebas">Bebas (Hijau)</option>
                    <option value="Bebas Terbatas">Bebas Terbatas (Biru)</option>
                    <option value="Keras">Keras (Merah K)</option>
                    <option value="Narkotika">Narkotika</option>
                    <option value="Psikotropika">Psikotropika</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Satuan Utama:</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Strip">Strip</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Pot">Pot</option>
                    <option value="Botol">Botol</option>
                    <option value="Box">Box</option>
                    <option value="Kapsul">Kapsul</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Awal:</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Min (Alert):</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Batch:</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tgl. Kedaluwarsa:</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Beli (HPP):</label>
                  <input
                    type="number"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-numbers"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga Jual Umum (#1):</label>
                  <input
                    type="number"
                    value={formData.sellPriceGeneral}
                    onChange={(e) => setFormData({ ...formData, sellPriceGeneral: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono-numbers font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Simpan Obat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
