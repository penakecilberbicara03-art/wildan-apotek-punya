import React, { useState, useRef, useEffect } from 'react';
import {
  Search, ScanBarcode, Trash2, FileText, Plus,
  Archive, Users, Stethoscope, Settings,
  AlertTriangle, DollarSign, Clock, Check
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatRupiah } from '../../utils/formatters';
import { Medicine, UnitType, CartItem } from '../../types/pharmacy';
import { EtiketModal } from './EtiketModal';
import { PaymentModal } from './PaymentModal';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ReceiptModal } from './ReceiptModal';

export const PosView: React.FC = () => {
  const {
    medicines,
    cart,
    addToCart,
    updateCartQuantity,
    updateCartUnit,
    updateCartPriceOption,
    updateCartEtiket,
    removeFromCart,
    clearCart,
    posSettings,
    updatePosSettings,
    cartSubtotal,
    cartDiscountTotal,
    cartGrandTotal,
    heldTransactions,
    holdCurrentTransaction,
    resumeHeldTransaction,
    deleteHeldTransaction,
    patients,
    doctors,
    selectedPatient,
    selectedDoctor,
    allergyWarnings,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    users
  } = usePharmacy();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active Etiket editing
  const [editingEtiketItem, setEditingEtiketItem] = useState<CartItem | null>(null);

  // Patient / Doctor Selector Modals
  const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(false);
  const [isDoctorSelectOpen, setIsDoctorSelectOpen] = useState(false);
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Global keyboard shortcuts (F2 Bayar, F4 Tunda, F6 Dokter, F7 Pelanggan, Shift+Enter Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          holdCurrentTransaction();
        } else if (heldTransactions.length > 0) {
          setIsHeldModalOpen(true);
        }
      } else if (e.key === 'F6') {
        e.preventDefault();
        setIsDoctorSelectOpen(true);
      } else if (e.key === 'F7') {
        e.preventDefault();
        setIsPatientSelectOpen(true);
      } else if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldTransactions, holdCurrentTransaction, setIsPaymentModalOpen]);

  // Filtered medicines for instant autocomplete
  const filteredMedicines = searchQuery.trim() === '' ? [] : medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.activeSubstance.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.barcode.includes(searchQuery)
  ).slice(0, 8);

  const handleSelectMedicine = (med: Medicine) => {
    addToCart(med, 1);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f0f4f8] h-[calc(100vh-53px)] overflow-hidden">
      {/* Top POS Action Bar (Matching screenshot blue section header) */}
      <div className="bg-[#0066cc] px-4 py-3 flex items-center justify-between text-white shadow-sm shrink-0">
        {/* Search Bar matching screenshot: "Tulis nama, kode, atau zat aktif [Shift + ↵]" */}
        <div className="relative flex-1 max-w-2xl mr-4">
          <div className="relative flex items-center">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Tulis nama, kode, atau zat aktif [Shift + ↵]"
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs rounded-full pl-4 pr-20 py-2.5 shadow-inner focus:outline-none focus:ring-2 focus:ring-white border border-sky-300"
            />
            <div className="absolute right-3 flex items-center gap-1.5 text-slate-500">
              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                title="Buka Pemindai Barcode (Scanner)"
                className="p-1 hover:text-[#0066cc] rounded transition-colors"
              >
                <ScanBarcode className="w-4 h-4" />
              </button>
              <Search className="w-4 h-4" />
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && filteredMedicines.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-40 max-h-80 overflow-y-auto">
              {filteredMedicines.map(med => (
                <div
                  key={med.id}
                  onMouseDown={() => handleSelectMedicine(med)}
                  className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-slate-100 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900">{med.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Zat: <span className="text-slate-700">{med.activeSubstance}</span> · Kat: <span className="font-semibold text-[#0066cc]">{med.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono-numbers">
                      {formatRupiah(med.sellPriceGeneral)}
                    </div>
                    <div className={`text-[10px] font-semibold ${med.stock <= med.minStockAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Stok: {med.stock} {med.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Cart Icon & Large Top Right Grand Total Display matching screenshot */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={clearCart}
            disabled={cart.length === 0}
            className="p-2 hover:bg-white/10 rounded-lg text-white/90 hover:text-white transition-colors disabled:opacity-30"
            title="Kosongkan Keranjang"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="text-right pl-3 border-l border-white/20">
            <span className="text-2xl lg:text-3xl font-black text-white font-mono-numbers tracking-tight">
              {formatRupiah(cartGrandTotal, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Allergy Notification Banner if Patient has conflicts with cart items */}
      {allergyWarnings.length > 0 && (
        <div className="bg-rose-500 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs z-20 shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0 animate-bounce" />
            <div className="font-semibold">{allergyWarnings[0]}</div>
          </div>
          <span className="text-[11px] bg-rose-700 px-2 py-0.5 rounded font-mono">
            KONTRAINDIKASI MEDIS
          </span>
        </div>
      )}

      {/* Main Split Layout: Left Cart Table & Right Checkout Panel */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Area: Cart Table & Bottom Controls */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden border-r border-slate-200">
          {/* Table Container */}
          <div className="flex-1 overflow-y-auto p-3">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                  <th className="py-2.5 px-3 w-10 text-center">No.</th>
                  <th className="py-2.5 px-3">Produk</th>
                  <th className="py-2.5 px-3 w-28 text-center">Kuantitas</th>
                  <th className="py-2.5 px-3 w-24">Satuan</th>
                  <th className="py-2.5 px-3 w-32">Opsi Harga</th>
                  <th className="py-2.5 px-3 w-28 text-right">Harga Jual</th>
                  <th className="py-2.5 px-3 w-28 text-right">Sub Total</th>
                  <th className="py-2.5 px-2 w-12 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Archive className="w-10 h-10 text-slate-300 stroke-1" />
                        <p className="text-sm font-medium">Keranjang transaksi masih kosong</p>
                        <p className="text-xs text-slate-400">
                          Ketik nama obat di kolom pencarian atau gunakan barcode scanner [Shift + ↵]
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cart.map((item, index) => {
                    const isOutOfStock = item.medicine.stock <= 0;
                    const isLowStock = item.medicine.stock < item.quantity;
                    const unitPrice = item.priceOption === 'general'
                      ? item.medicine.sellPriceGeneral
                      : item.priceOption === 'prescription'
                      ? item.medicine.sellPricePrescription
                      : item.medicine.sellPriceWholesale;

                    return (
                      <tr key={item.medicineId} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-500 font-mono-numbers">
                          {index + 1}
                        </td>

                        {/* Product Name & Notes Popover trigger as in screenshot */}
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>{item.medicine.name}</span>
                              <button
                                type="button"
                                onClick={() => setEditingEtiketItem(item)}
                                className="p-1 text-slate-400 hover:text-[#0066cc] hover:bg-sky-100 rounded transition-colors"
                                title="Edit Catatan / Etiket Aturan Pakai"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Stock Indicator matching screenshot */}
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-slate-500">
                                Stok: {item.medicine.stock} {item.medicine.unit}
                              </span>
                              {isOutOfStock ? (
                                <span className="text-red-600 font-bold">tak tersedia</span>
                              ) : isLowStock ? (
                                <span className="text-amber-600 font-bold">stok kurang</span>
                              ) : null}
                              <span className="text-slate-400 font-mono">· Batch: {item.medicine.batchNumber}</span>
                            </div>

                            {/* Etiket Note Box as in screenshot */}
                            {item.etiketNote && (
                              <div
                                onClick={() => setEditingEtiketItem(item)}
                                className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors shadow-xs"
                              >
                                <span className="text-slate-400">Catatan/Etiket:</span>
                                <span>{item.etiketNote}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quantity with warning */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.medicineId, Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-12 text-center py-1 border border-slate-300 rounded font-bold font-mono-numbers text-xs focus:ring-1 focus:ring-[#0066cc] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Satuan select */}
                        <td className="py-3 px-3">
                          <select
                            value={item.unit}
                            onChange={(e) => updateCartUnit(item.medicineId, e.target.value as UnitType)}
                            className="w-full py-1 px-1.5 border border-slate-300 rounded bg-white text-xs text-slate-800 focus:ring-1 focus:ring-[#0066cc]"
                          >
                            {item.medicine.availableUnits.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </td>

                        {/* Opsi Harga */}
                        <td className="py-3 px-3">
                          <select
                            value={item.priceOption}
                            onChange={(e) => updateCartPriceOption(item.medicineId, e.target.value as any)}
                            className="w-full py-1 px-1.5 border border-slate-300 rounded bg-white text-xs text-slate-800 focus:ring-1 focus:ring-[#0066cc]"
                          >
                            <option value="general">#1 H. Umum</option>
                            <option value="prescription">#2 H. Resep</option>
                            <option value="wholesale">#3 H. Grosir</option>
                          </select>
                        </td>

                        {/* Harga Jual */}
                        <td className="py-3 px-3 text-right font-mono-numbers font-medium text-slate-800">
                          {formatRupiah(unitPrice)}
                        </td>

                        {/* Sub Total */}
                        <td className="py-3 px-3 text-right font-mono-numbers font-bold text-slate-900">
                          {formatRupiah(item.subtotal)}
                        </td>

                        {/* Delete Row */}
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.medicineId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Hapus baris obat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Quick Action Strip matching screenshot exactly */}
          <div className="bg-[#0066cc] text-white px-3 py-2 flex items-center justify-between text-xs shrink-0 select-none border-t border-sky-400/40">
            {/* Quick Icons: Drawer, Resep, Pasien, Dokter */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Buka Laci Uang Kasir (Cash Drawer)"
                onClick={() => alert('Sinyal buka laci kasir (Cash Drawer) berhasil dikirim.')}
              >
                <Archive className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Input Resep Dokter"
                onClick={() => setIsDoctorSelectOpen(true)}
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Rekam Medis Pasien"
                onClick={() => setIsPatientSelectOpen(true)}
              >
                <Users className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Pilih Dokter"
                onClick={() => setIsDoctorSelectOpen(true)}
              >
                <Stethoscope className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/30 mx-1" />

              {/* Status Badge: Non-PKP */}
              <span className="bg-[#facc15] text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded shadow-xs">
                Non-PKP
              </span>

              {/* Tgl Transaksi: Otomatis */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-sky-100">
                <span>Tgl. Transaksi:</span>
                <span className="bg-white/15 px-2 py-0.5 rounded text-white font-medium">Otomatis</span>
              </div>
            </div>

            {/* Right: Shelf / Etalase selector & settings gear */}
            <div className="flex items-center gap-2">
              <select
                value={posSettings.shelf}
                onChange={(e) => updatePosSettings({ shelf: e.target.value })}
                className="bg-white text-slate-800 text-xs py-1 px-2.5 rounded-lg font-semibold border-none focus:ring-2 focus:ring-sky-300 outline-none"
              >
                <option value="Etalase A">Etalase A</option>
                <option value="Etalase B">Etalase B</option>
                <option value="Gudang Utama">Gudang Utama</option>
                <option value="Rak Obat Keras">Rak Obat Keras</option>
              </select>

              <button
                type="button"
                onClick={() => setIsBarcodeModalOpen(true)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Pengaturan Kasir"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Checkout & Calculation Panel matching screenshot */}
        <div className="w-full lg:w-80 bg-white p-4 flex flex-col justify-between shrink-0 space-y-3 shadow-lg overflow-y-auto max-h-[calc(100vh-105px)]">
          <div className="space-y-2.5 text-xs">
            {/* Sub-total */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Sub-total</span>
              <div className="w-32 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-right font-bold text-slate-900 font-mono-numbers">
                {cartSubtotal.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Diskon Faktur with % / Rp toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Diskon Faktur</span>
                <div className="flex items-center gap-1">
                  <div className="inline-flex rounded-md border border-slate-300 p-0.5 bg-slate-100">
                    <button
                      type="button"
                      onClick={() => updatePosSettings({ discountType: 'percent', discountValue: 0 })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        posSettings.discountType === 'percent' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePosSettings({ discountType: 'nominal', discountValue: 0 })}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        posSettings.discountType === 'nominal' ? 'bg-[#0066cc] text-white shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Rp
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={posSettings.discountValue || 0}
                    onChange={(e) => updatePosSettings({ discountValue: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-16 bg-white border border-slate-300 rounded-lg p-1 text-right font-mono-numbers text-xs font-semibold focus:ring-1 focus:ring-[#0066cc] outline-none"
                  />
                  <span className="text-slate-500 font-mono">{posSettings.discountType === 'percent' ? '%' : ''}</span>
                </div>
              </div>
            </div>

            {/* Promo hari ini? */}
            <div className="flex items-center justify-between py-1 border-y border-slate-100">
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(true)}
                className="text-[#0066cc] hover:underline font-bold text-xs"
              >
                Promo hari ini?
              </button>
              <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </div>

            {/* Biaya Servis / Tuslah [Ctrl + ↵] */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700">Biaya Servis</span>
                <span className="text-[10px] bg-slate-100 px-1 py-0.5 rounded border border-slate-300 text-slate-500">
                  Ctrl + ↵
                </span>
              </div>
              <input
                type="number"
                min="0"
                value={posSettings.serviceFee}
                onChange={(e) => updatePosSettings({ serviceFee: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-28 bg-white border border-slate-300 rounded-lg p-1 text-right font-mono-numbers text-xs font-medium"
              />
            </div>

            {/* Biaya Embalase */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Biaya Embalase</span>
              <input
                type="number"
                min="0"
                value={posSettings.embalaseFee}
                onChange={(e) => updatePosSettings({ embalaseFee: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-28 bg-white border border-slate-300 rounded-lg p-1 text-right font-mono-numbers text-xs font-medium"
              />
            </div>

            {/* Ongkos Kirim */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Ongkos Kirim</span>
              <input
                type="number"
                min="0"
                value={posSettings.shippingFee}
                onChange={(e) => updatePosSettings({ shippingFee: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-28 bg-white border border-slate-300 rounded-lg p-1 text-right font-mono-numbers text-xs font-medium"
              />
            </div>

            {/* Biaya Lainnya */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Biaya Lainnya</span>
              <input
                type="number"
                min="0"
                value={posSettings.otherFee}
                onChange={(e) => updatePosSettings({ otherFee: Math.max(0, parseInt(e.target.value) || 0) })}
                className="w-28 bg-white border border-slate-300 rounded-lg p-1 text-right font-mono-numbers text-xs font-medium"
              />
            </div>

            {/* Primary Action Buttons: Bayar F2 & Tunda F4 */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={cart.length === 0}
                className="py-2.5 px-3 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs disabled:opacity-40"
              >
                <span>Bayar</span>
                <span className="bg-white/20 text-white text-[10px] px-1 py-0.2 rounded font-mono">F2</span>
              </button>

              <button
                type="button"
                onClick={holdCurrentTransaction}
                disabled={cart.length === 0 && heldTransactions.length === 0}
                className="py-2.5 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs disabled:opacity-40"
              >
                <span>Tunda</span>
                <span className="bg-white/20 text-white text-[10px] px-1 py-0.2 rounded font-mono">F4</span>
              </button>
            </div>

            {heldTransactions.length > 0 && (
              <button
                type="button"
                onClick={() => setIsHeldModalOpen(true)}
                className="w-full py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Ada {heldTransactions.length} Transaksi Tertunda (Buka)</span>
              </button>
            )}

            {/* Pelanggan [F7] Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                    P
                  </div>
                  <span className="font-bold text-slate-800">Pelanggan</span>
                  <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-500">F7</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPatientSelectOpen(true)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                onClick={() => setIsPatientSelectOpen(true)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer flex justify-between items-center"
              >
                <span className="truncate">{selectedPatient ? `${selectedPatient.name} (${selectedPatient.medicalRecordNo})` : 'Pilih Pasien / Umum'}</span>
                {selectedPatient?.allergies.length ? (
                  <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">Alergi!</span>
                ) : null}
              </div>
            </div>

            {/* Dokter [F6] Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-[#0066cc] flex items-center justify-center font-bold text-xs">
                    D
                  </div>
                  <span className="font-bold text-slate-800">Dokter</span>
                  <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-500">F6</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDoctorSelectOpen(true)}
                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div
                onClick={() => setIsDoctorSelectOpen(true)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer"
              >
                <span className="truncate">{selectedDoctor ? selectedDoctor.name : 'Pilih Dokter Spesialis / Umum'}</span>
              </div>
            </div>

            {/* Sales / Pelayan */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Sales/Pelayan</span>
              <select
                value={posSettings.salesPerson}
                onChange={(e) => updatePosSettings({ salesPerson: e.target.value })}
                className="w-36 p-1 border border-slate-300 rounded-lg text-xs bg-white"
              >
                {users.map(u => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>
            </div>

            {/* Kanal Penjualan */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Kanal Penjualan</span>
              <select
                value={posSettings.channel}
                onChange={(e) => updatePosSettings({ channel: e.target.value as any })}
                className="w-36 p-1 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="Offline">Offline / Toko</option>
                <option value="Halodoc">Halodoc</option>
                <option value="GrabHealth">GrabHealth</option>
                <option value="Tokopedia">Tokopedia</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      {editingEtiketItem && (
        <EtiketModal
          item={editingEtiketItem}
          onSave={(note) => {
            updateCartEtiket(editingEtiketItem.medicineId, note);
            setEditingEtiketItem(null);
          }}
          onClose={() => setEditingEtiketItem(null)}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentModal onClose={() => setIsPaymentModalOpen(false)} />
      )}

      {isBarcodeModalOpen && (
        <BarcodeScannerModal onClose={() => setIsBarcodeModalOpen(false)} />
      )}

      {isReceiptModalOpen && (
        <ReceiptModal onClose={() => setIsReceiptModalOpen(false)} />
      )}

      {/* Patient Picker Modal */}
      {isPatientSelectOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Pilih Pasien Rekam Medis [F7]</h3>
              <button onClick={() => setIsPatientSelectOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  updatePosSettings({ selectedPatientId: undefined });
                  setIsPatientSelectOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-600"
              >
                Umum (Tanpa Rekam Medis Khusus)
              </button>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {patients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      updatePosSettings({ selectedPatientId: p.id });
                      setIsPatientSelectOpen(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      posSettings.selectedPatientId === p.id
                        ? 'border-[#0066cc] bg-sky-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{p.name} ({p.gender})</div>
                        <div className="text-[11px] text-slate-500 font-mono">No. RM: {p.medicalRecordNo} · Telp: {p.phone}</div>
                      </div>
                      {posSettings.selectedPatientId === p.id && <Check className="w-4 h-4 text-[#0066cc]" />}
                    </div>
                    {p.allergies.length > 0 && (
                      <div className="mt-1 text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded inline-block">
                        Alergi: {p.allergies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Picker Modal */}
      {isDoctorSelectOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Pilih Dokter Peresep / Rujukan [F6]</h3>
              <button onClick={() => setIsDoctorSelectOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  updatePosSettings({ selectedDoctorId: undefined });
                  setIsDoctorSelectOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-600"
              >
                Tanpa Dokter (Obat Bebas Tanpa Resep)
              </button>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {doctors.map(d => (
                  <div
                    key={d.id}
                    onClick={() => {
                      updatePosSettings({ selectedDoctorId: d.id });
                      setIsDoctorSelectOpen(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                      posSettings.selectedDoctorId === d.id
                        ? 'border-[#0066cc] bg-sky-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{d.name}</div>
                    <div className="text-[11px] text-slate-500">{d.specialization} · {d.hospitalClinic}</div>
                    <div className="text-[10px] text-slate-400 font-mono">SIP: {d.sip}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Held Transactions Modal */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-150">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Daftar Transaksi Tertunda [F4]</h3>
              <button onClick={() => setIsHeldModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {heldTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Tidak ada transaksi tertunda saat ini.
                </div>
              ) : (
                heldTransactions.map(h => (
                  <div key={h.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-900">{h.id} ({h.timestamp} WIB)</div>
                      <div className="text-slate-500">
                        {h.cart.length} item obat · Total: {formatRupiah(h.cart.reduce((s, i) => s + i.subtotal, 0))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resumeHeldTransaction(h.id);
                          setIsHeldModalOpen(false);
                        }}
                        className="px-3 py-1.5 bg-[#0066cc] text-white rounded-lg text-xs font-bold hover:bg-sky-700"
                      >
                        Buka
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHeldTransaction(h.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Promo Info Modal */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-emerald-600 px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Program Promo & Diskon Hari Ini</h3>
              <button onClick={() => setIsPromoModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-4 text-xs space-y-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">Diskon Member Sehat 5%</div>
                <div className="text-slate-600 mt-1">Potongan 5% untuk pembelian vitamin dan suplemen diatas Rp 50.000.</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">Gratis Biaya Embalase Racikan</div>
                <div className="text-slate-600 mt-1">Bebas biaya cangkang kapsul dan pot plastik untuk resep dokter anak.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsPromoModalOpen(false)}
                className="w-full py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
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
