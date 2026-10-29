import React, { useState } from 'react';
import {
  User as UserIcon, Shield, KeyRound, Check, AlertTriangle,
  Lock, Smartphone, X, Save
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { User, Role } from '../types/pharmacy';
import { generateTOTPCode, verifyTOTPCode } from '../utils/crypto';

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const {
    users,
    currentUser,
    switchUser,
    canEditUser,
    updateUserProfile
  } = usePharmacy();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const targetUser = users.find(u => u.id === selectedUserId) || currentUser;

  // Form states for selected user
  const [name, setName] = useState(targetUser.name);
  const [email, setEmail] = useState(targetUser.email);
  const [phone, setPhone] = useState(targetUser.phone);
  const [role, setRole] = useState<Role>(targetUser.role);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(targetUser.twoFactorEnabled);
  const [twoFactorInputCode, setTwoFactorInputCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync form when selected user changes
  const handleSelectUser = (u: User) => {
    setSelectedUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setRole(u.role);
    setTwoFactorEnabled(u.twoFactorEnabled);
    setStatusMessage(null);
  };

  const permission = canEditUser(targetUser.id);
  const isSelf = targetUser.id === currentUser.id;

  // Live TOTP code generator for simulator demo
  const totpData = generateTOTPCode(targetUser.twoFactorSecret || 'APOTEKJAWARA2026');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const result = updateUserProfile(targetUser.id, {
      name,
      email,
      phone,
      role,
      twoFactorEnabled,
    });

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleConfirm2FA = () => {
    if (verifyTOTPCode(twoFactorInputCode, targetUser.twoFactorSecret)) {
      setTwoFactorEnabled(true);
      updateUserProfile(targetUser.id, { twoFactorEnabled: true });
      setIsVerifying2FA(false);
      setStatusMessage({ type: 'success', text: 'Autentikasi Dua Faktor (2FA) berhasil diaktifkan!' });
    } else {
      setStatusMessage({ type: 'error', text: 'Kode 2FA salah atau kedaluwarsa. Gunakan kode 6-digit terkini.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0066cc] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">Manajemen Profil & Hak Akses (RBAC)</h3>
              <p className="text-xs text-sky-200">
                Login saat ini: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Switcher Pill Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600">Pilih Akun Staf:</div>
          <div className="flex gap-2">
            {users.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelectUser(u)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedUserId === u.id
                    ? 'bg-[#0066cc] text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{u.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                  u.role === 'owner' ? 'bg-purple-200 text-purple-900' : u.role === 'manajer' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Permission Alert Banner */}
          {!permission.allowed ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Akses Terkunci (Aturan Keamanan Apotek):</div>
                <div className="mt-0.5">{permission.reason}</div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Anda memiliki izin untuk memodifikasi profil ini sebagai <strong>{currentUser.role.toUpperCase()}</strong>.
              </span>
            </div>
          )}

          {statusMessage && (
            <div className={`p-3 rounded-xl ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                <input
                  type="text"
                  disabled={!permission.allowed}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100 disabled:text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role / Hak Akses:</label>
                <select
                  disabled={currentUser.role === 'kasir' || (!permission.allowed && !isSelf)}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100 disabled:text-slate-500 font-bold"
                >
                  <option value="kasir">Kasir (Firmann)</option>
                  <option value="manajer">Manajer (Siti Rahma)</option>
                  <option value="owner">Owner / Pemilik (dr. Hendra)</option>
                </select>
                {currentUser.role === 'kasir' && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Kasir tidak dapat mengubah role akun (hanya Manajer & Owner).
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi Apotek:</label>
                <input
                  type="email"
                  disabled={!permission.allowed}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP:</label>
                <input
                  type="text"
                  disabled={!permission.allowed}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                />
              </div>
            </div>

            {/* 2FA (Two-Factor Authentication) Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${twoFactorEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Autentikasi Dua Faktor (2FA)</span>
                      {twoFactorEnabled ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">AKTIF</span>
                      ) : (
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">NONAKTIF</span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Melindungi transaksi keuangan dan akses data pasien dengan kode OTP TOTP berkala.
                    </div>
                  </div>
                </div>

                {permission.allowed && (
                  <button
                    type="button"
                    onClick={() => {
                      if (twoFactorEnabled) {
                        setTwoFactorEnabled(false);
                        updateUserProfile(targetUser.id, { twoFactorEnabled: false });
                        setStatusMessage({ type: 'success', text: '2FA dinonaktifkan untuk pengguna ini.' });
                      } else {
                        setIsVerifying2FA(true);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                      twoFactorEnabled
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                    }`}
                  >
                    {twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA'}
                  </button>
                )}
              </div>

              {/* 2FA Setup Drawer if enabling */}
              {isVerifying2FA && (
                <div className="mt-3 p-4 bg-sky-50 rounded-xl border border-sky-200 space-y-3">
                  <div className="font-bold text-sky-950 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[#0066cc]" />
                    <span>Verifikasi Google Authenticator / Microsoft Authenticator:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-sky-100 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Kode Rahasia (Secret Key):</div>
                      <div className="font-mono font-bold text-[#0066cc] text-xs tracking-wider">
                        {targetUser.twoFactorSecret || 'APOTEKJAWARA2026'}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold mt-2">
                        Kode Saat Ini: {totpData.code} (Sisa {totpData.secondsLeft}s)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Masukkan 6-Digit Kode OTP:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={twoFactorInputCode}
                        onChange={(e) => setTwoFactorInputCode(e.target.value)}
                        placeholder="Contoh: 123456"
                        className="w-full p-2 border border-slate-300 rounded-lg text-center font-mono font-bold text-sm tracking-widest bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsVerifying2FA(false)}
                          className="flex-1 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirm2FA}
                          className="flex-1 py-1.5 bg-[#0066cc] text-white rounded-lg font-bold"
                        >
                          Verifikasi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            {permission.allowed && (
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-sky-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan Profil
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
