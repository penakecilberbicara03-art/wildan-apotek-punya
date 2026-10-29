import React, { useState } from 'react';
import {
  Search, Bell, HelpCircle, RefreshCw, MessageSquare,
  Shield, Check, User as UserIcon, Sparkles, AlertTriangle,
  Menu, X, Lock
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { UserProfileModal } from './UserProfileModal';
import { NotificationsModal } from './NotificationsModal';
import { LoginModal } from './LoginModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen = true }) => {
  const {
    posSettings,
    currentUser,
    users,
    switchUser,
    loginUser,
    openLoginModal,
    isLoginModalOpen,
    setIsLoginModalOpen,
    notifications,
    unreadNotificationsCount,
    isSyncingCloud,
    triggerSync,
    searchTermFeature,
    setSearchTermFeature,
    setActiveMenu
  } = usePharmacy();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);

  const roleBadgeColor = {
    kasir: 'bg-emerald-500 text-white',
    manajer: 'bg-amber-500 text-white',
    owner: 'bg-purple-600 text-white'
  }[currentUser.role];

  return (
    <>
      <header className="bg-[#0066cc] text-white flex items-center justify-between px-3 md:px-5 py-2 select-none shadow-sm z-30 sticky top-0">
        {/* Left Section: Brand & Quick Feature Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
            title="Sembunyikan/Tampilkan Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveMenu('kasir')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
              <div className="w-full h-full rounded-full border-2 border-[#0066cc] flex items-center justify-center text-[#0066cc] font-black text-sm">
                +
              </div>
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                <span>APOTEK TRIAL</span>
                <span className="text-[10px] bg-sky-400/30 text-sky-100 font-semibold px-1.5 py-0.2 rounded">id: jawara</span>
              </div>
              <div className="text-[11px] text-sky-200">Sistem Farmasi & Rekam Medis</div>
            </div>
          </div>

          {/* Search feature shortcut input as in screenshot */}
          <div className="relative ml-2 hidden md:block">
            <input
              type="text"
              placeholder="Cari fitur disini"
              value={searchTermFeature}
              onChange={(e) => setSearchTermFeature(e.target.value)}
              className="bg-white/95 text-slate-800 placeholder-slate-400 text-xs rounded-full pl-3 pr-7 py-1.5 w-44 lg:w-56 border border-sky-400 focus:outline-none focus:ring-2 focus:ring-white/80"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Center: Session Code & Active User */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-sky-200 text-[10px] font-medium uppercase tracking-wider">Kode Sesi</span>
            <span className="font-bold text-white tracking-wide font-mono-numbers">{posSettings.sessionCode}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1.5 rounded-lg border border-white/20"
            >
              <div className="flex flex-col text-left">
                <span className="text-sky-200 text-[10px] uppercase tracking-wider">Pengguna</span>
                <span className="font-bold text-white truncate max-w-[110px]">{currentUser.name}</span>
              </div>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${roleBadgeColor}`}>
                {currentUser.role}
              </span>
            </button>

            {/* Switch User Dropdown */}
            {isUserSwitcherOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-slate-800 z-50">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Ganti Pengguna</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Wajib Login
                  </span>
                </div>
                <div className="space-y-1 my-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        openLoginModal(u.id);
                        setIsUserSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        u.id === currentUser.id ? 'bg-sky-50 text-sky-800 font-semibold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.twoFactorEnabled && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">2FA</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 capitalize">{u.role} · @{u.username}</div>
                      </div>
                      {u.id === currentUser.id ? (
                        <Check className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      openLoginModal();
                      setIsUserSwitcherOpen(false);
                    }}
                    className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Login Akun / Sandi Baru</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: AI Assistant, Notifications, WhatsApp, Help, Cloud Sync, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tanya AI */}
          <button
            onClick={() => setIsAiHelperOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-400/30 to-indigo-400/30 hover:from-sky-400/50 hover:to-indigo-400/50 px-2.5 py-1.5 rounded-full text-xs font-semibold text-white transition-all border border-sky-300/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Tanya AI</span>
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
            title="Pemberitahuan Kedaluwarsa & Stok Minimum"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* WhatsApp Support Simulator */}
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Apotek"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
            title="Bantuan WhatsApp"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
          </a>

          {/* Shortcut Keys Help */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white"
            title="Petunjuk Tombol Shortcut Keyboard"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sync Cloud Button */}
          <button
            onClick={() => triggerSync()}
            disabled={isSyncingCloud}
            className={`p-1.5 hover:bg-white/10 rounded-full transition-colors text-white ${isSyncingCloud ? 'animate-spin text-amber-300' : ''}`}
            title="Sinkronisasi Cloud Real-Time"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Profile & 2FA */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-1 hover:ring-2 hover:ring-white/80 rounded-full transition-all flex items-center gap-1 ml-1"
            title="Profil Pengguna & Keamanan 2FA"
          >
            <div className="w-7 h-7 rounded-full bg-sky-200 text-[#0066cc] flex items-center justify-center font-bold text-xs overflow-hidden">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
            {currentUser.twoFactorEnabled && (
              <span title="2FA Aktif">
                <Shield className="w-3 h-3 text-emerald-300 hidden md:block" />
              </span>
            )}
          </button>
        </div>
      </header>

      {/* AI Assistant Quick Guide Modal */}
      {isAiHelperOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-[#0066cc] to-sky-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-base">Asisten Farmasi Pintar (AI Apoteker)</h3>
              </div>
              <button
                onClick={() => setIsAiHelperOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 space-y-3">
              <p className="font-medium text-slate-900">
                Pusat rekomendasi klinis & operasional apotek harian:
              </p>
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 text-xs space-y-2">
                <div className="font-semibold text-sky-900">⚡ Cek Kontraindikasi & Alergi:</div>
                <p className="text-sky-800">
                  Sistem otomatis mengecek obat di keranjang terhadap daftar alergi pasien di Rekam Medis (misal alergi Penisilin pada Amoxicillin).
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs space-y-2">
                <div className="font-semibold text-amber-900">🔔 Peringatan Kedaluwarsa & Restock:</div>
                <p className="text-amber-800">
                  Notifikasi berkala aktif otomatis menandai obat yang tersisa di bawah ambang batas minimum dan obat ED &lt; 30 hari.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs space-y-2">
                <div className="font-semibold text-emerald-900">🔒 Keamanan & 2FA:</div>
                <p className="text-emerald-800">
                  Data sensitif NIK & riwayat diagnosa diproteksi enkripsi AES-256. Akses manajer dan owner dapat dikunci autentikasi dua faktor.
                </p>
              </div>
              <button
                onClick={() => setIsAiHelperOpen(false)}
                className="w-full mt-2 py-2.5 bg-[#0066cc] text-white rounded-xl font-semibold hover:bg-sky-700 transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                Shortcut Keyboard Kasir Apotek
              </h3>
              <button onClick={() => setIsHelpOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 text-xs text-slate-700 space-y-3 font-mono-numbers">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-300">F2</span>
                  <div className="text-slate-600 mt-1 font-sans">Buka Modal Bayar / Selesaikan Transaksi</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="font-bold text-sky-700 bg-white px-2 py-0.5 rounded border border-slate-300">F4</span>
                  <div className="text-slate-600 mt-1 font-sans">Tunda / Parkir Transaksi Keranjang</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-slate-300">F6</span>
                  <div className="text-slate-600 mt-1 font-sans">Pilih Dokter Peresep / Rujukan</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                  <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-300">F7</span>
                  <div className="text-slate-600 mt-1 font-sans">Pilih / Tambah Pasien Rekam Medis</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 col-span-2">
                  <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-300">Shift + Enter</span>
                  <div className="text-slate-600 mt-1 font-sans">Fokus Cepat ke Kolom Pencarian Obat / Barcode Scanner</div>
                </div>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full py-2 bg-slate-800 text-white rounded-lg font-sans font-medium hover:bg-slate-700 transition-colors mt-2"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Profile & Notifications */}
      {isProfileModalOpen && (
        <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
      {isNotificationsOpen && (
        <NotificationsModal onClose={() => setIsNotificationsOpen(false)} />
      )}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </>
  );
};
