import React, { useState } from 'react';
import {
  Home, LayoutDashboard, ShoppingBag, HeartPulse, Boxes,
  Truck, PackageCheck, Percent, Wallet, Calculator,
  Cloud, ShieldAlert, ChevronDown, ChevronRight, FileText,
  RotateCcw, XCircle, Clock
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { activeMenu, setActiveMenu } = usePharmacy();
  const [isPenjualanExpanded, setIsPenjualanExpanded] = useState(true);

  const handleSelectMenu = (menuId: string) => {
    setActiveMenu(menuId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-[#0954b0] text-white flex flex-col shrink-0 min-h-[calc(100vh-53px)] select-none border-r border-blue-900/40">
      <div className="p-3 space-y-1 text-sm overflow-y-auto max-h-[calc(100vh-60px)]">
        {/* Home */}
        <button
          onClick={() => handleSelectMenu('home')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'home' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <Home className="w-4 h-4 text-sky-300" />
          <span>Home</span>
        </button>

        {/* Dashboard */}
        <button
          onClick={() => handleSelectMenu('dashboard')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'dashboard' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-4 h-4 text-sky-300" />
            <span>Dashboard</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Penjualan (Accordion with Submenu matching screenshot) */}
        <div className="pt-1">
          <button
            onClick={() => setIsPenjualanExpanded(!isPenjualanExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-white hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 flex items-center justify-center text-emerald-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-semibold">Penjualan</span>
            </div>
            {isPenjualanExpanded ? (
              <ChevronDown className="w-4 h-4 text-blue-200" />
            ) : (
              <ChevronRight className="w-4 h-4 text-blue-200" />
            )}
          </button>

          {isPenjualanExpanded && (
            <div className="ml-2 pl-3 border-l border-blue-400/30 space-y-1 mt-1 text-xs">
              {/* Kasir Button (Active highlight as white card matching screenshot) */}
              <button
                onClick={() => handleSelectMenu('kasir')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  activeMenu === 'kasir'
                    ? 'bg-white text-slate-800 font-bold shadow-md'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeMenu === 'kasir' ? 'bg-emerald-500' : 'bg-transparent'}`} />
                <span>Kasir</span>
              </button>

              {/* Pesanan Penjualan [BETA] */}
              <button
                onClick={() => handleSelectMenu('pesanan')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
                  activeMenu === 'pesanan' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <span>Pesanan Penjualan</span>
                <span className="text-[9px] bg-emerald-500/80 text-white font-extrabold px-1.5 py-0.5 rounded">BETA</span>
              </button>

              {/* Daftar Penjualan */}
              <button
                onClick={() => handleSelectMenu('daftar-penjualan')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  activeMenu === 'daftar-penjualan' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span>Daftar Penjualan</span>
              </button>

              {/* Retur Penjualan */}
              <button
                onClick={() => handleSelectMenu('retur')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  activeMenu === 'retur' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-200" />
                <span>Retur Penjualan</span>
              </button>

              {/* Penjualan Tertolak */}
              <button
                onClick={() => handleSelectMenu('tertolak')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                  activeMenu === 'tertolak' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-blue-200" />
                <span>Penjualan Tertolak</span>
              </button>
            </div>
          )}
        </div>

        {/* Pelayanan / Rekam Medis */}
        <button
          onClick={() => handleSelectMenu('rekam-medis')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'rekam-medis' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <HeartPulse className="w-4 h-4 text-rose-300" />
            <span>Pelayanan & Rekam Medis</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Persediaan (Stok Obat, Expiry & Batas Minimum) */}
        <button
          onClick={() => handleSelectMenu('persediaan')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'persediaan' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Boxes className="w-4 h-4 text-amber-300" />
            <span>Persediaan Obat</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Pembelian */}
        <button
          onClick={() => handleSelectMenu('pembelian')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'pembelian' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Truck className="w-4 h-4 text-cyan-300" />
            <span>Pembelian / PO</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Konsinyasi */}
        <button
          onClick={() => handleSelectMenu('konsinyasi')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'konsinyasi' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <PackageCheck className="w-4 h-4 text-emerald-300" />
            <span>Konsinyasi</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Program Promo */}
        <button
          onClick={() => handleSelectMenu('promo')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'promo' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Percent className="w-4 h-4 text-yellow-300" />
            <span>Program Promo</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Keuangan & Laporan Otomatis */}
        <button
          onClick={() => handleSelectMenu('keuangan')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'keuangan' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-4 h-4 text-green-300" />
            <span>Laporan Keuangan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>

        {/* Akuntansi PRO */}
        <button
          onClick={() => handleSelectMenu('akuntansi')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'akuntansi' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-4 h-4 text-teal-300" />
            <span>Akuntansi</span>
          </div>
          <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-1.5 py-0.5 rounded">PRO</span>
        </button>

        <div className="pt-2 border-t border-blue-400/20 text-[11px] font-bold text-blue-200 uppercase tracking-wider px-2">
          Integrasi & Keamanan
        </div>

        {/* Cloud Sync & 3rd Party API */}
        <button
          onClick={() => handleSelectMenu('cloud-sync')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'cloud-sync' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <Cloud className="w-4 h-4 text-sky-200" />
            <span>Cloud & API Pihak Ke-3</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Keamanan, 2FA & Log Aktivitas */}
        <button
          onClick={() => handleSelectMenu('keamanan')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
            activeMenu === 'keamanan' ? 'bg-white/20 text-white font-bold' : 'text-blue-100 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-indigo-300" />
            <span>2FA & Audit Log</span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-300" />
        </button>
      </div>
    </aside>
  );
};
