import React, { useState, useEffect } from 'react';
import {
  Lock, KeyRound, User as UserIcon, X, Eye, EyeOff,
  Shield, CheckCircle2, AlertCircle, Sparkles, Smartphone
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext';
import { User } from '../types/pharmacy';
import { generateTOTPCode } from '../utils/crypto';

interface LoginModalProps {
  initialUserId?: string;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ initialUserId, onClose }) => {
  const { users, currentUser, loginUser } = usePharmacy();

  const [selectedUser, setSelectedUser] = useState<User>(() => {
    if (initialUserId) {
      const found = users.find(u => u.id === initialUserId);
      if (found) return found;
    }
    // Default to the next user or first user
    const other = users.find(u => u.id !== currentUser.id);
    return other || users[0];
  });

  const [username, setUsername] = useState(selectedUser.username);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [step2FA, setStep2FA] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync username when clicking account presets
  const handleSelectPreset = (u: User) => {
    setSelectedUser(u);
    setUsername(u.username);
    setPassword('');
    setOtpCode('');
    setStep2FA(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Live TOTP generator for simulation display
  const totpData = generateTOTPCode(selectedUser.twoFactorSecret || 'APOTEKJAWARA2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = loginUser(username, password, step2FA ? otpCode : undefined);

    if (result.requires2FA) {
      setStep2FA(true);
      setErrorMessage(result.message);
      return;
    }

    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickFillPassword = (pass: string) => {
    setPassword(pass);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#0066cc] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Autentikasi & Ganti Pengguna</h3>
              <p className="text-[11px] text-sky-200">Wajib login dengan username & kata sandi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Preset User Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pilih Akun yang Ingin Digunakan:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {users.map((u) => {
                const isSelected = selectedUser.id === u.id;
                const roleBadge = u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                  u.role === 'manajer' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectPreset(u)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#0066cc] bg-sky-50/70 ring-2 ring-[#0066cc]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 truncate">{u.name}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase mt-0.5 inline-block ${roleBadge}`}>
                      {u.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Credentials Info Tooltip */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Kredensial Demo:</span>
              <button
                type="button"
                onClick={() => handleQuickFillPassword(selectedUser.password || `${selectedUser.role}123`)}
                className="text-[10px] text-[#0066cc] hover:underline font-bold"
              >
                Isi Sandi Otomatis
              </button>
            </div>
            <div className="flex justify-between font-mono text-[10px] text-slate-500">
              <span>Username: <strong className="text-slate-800">{selectedUser.username}</strong></span>
              <span>Sandi: <strong className="text-slate-800">{selectedUser.password || `${selectedUser.role}123`}</strong></span>
            </div>
          </div>

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Username Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ketik username akun..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc] font-medium"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ketik kata sandi..."
                  className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0066cc] font-mono text-sm"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 2FA OTP Step if required */}
            {(step2FA || selectedUser.twoFactorEnabled) && (
              <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-sky-950 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#0066cc]" />
                    Kode Verifikasi 2FA (Authenticator):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono font-bold">
                    OTP: {totpData.code} ({totpData.secondsLeft}s)
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Masukkan 6-digit OTP (contoh: 123456)"
                  className="w-full p-2 border border-sky-300 rounded-lg text-center font-mono font-bold text-sm tracking-widest bg-white"
                />
                <p className="text-[10px] text-sky-800">
                  * Masukkan kode yang muncul di aplikasi authenticator atau gunakan bypass code <strong>123456</strong>.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0066cc] hover:bg-sky-700 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Masuk Sistem</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
