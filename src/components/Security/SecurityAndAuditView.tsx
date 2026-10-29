import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Lock, Unlock, KeyRound,
  FileText, Users, Search, Smartphone, Check, AlertTriangle
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { encryptData, decryptData, generateTOTPCode } from '../../utils/crypto';
import { UserProfileModal } from '../UserProfileModal';

export const SecurityAndAuditView: React.FC = () => {
  const {
    activityLogs,
    users,
    currentUser,
    canEditUser,
    openLoginModal
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'audit' | 'crypto' | 'users'>('audit');
  const [logSearch, setLogSearch] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Live AES-256 test console
  const [plainTextInput, setPlainTextInput] = useState('Rekam Medis Pasien: Hipertensi, Alergi Penisilin, NIK: 3273011405820003');
  const [encryptedOutput, setEncryptedOutput] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [testPassword, setTestPassword] = useState('ApotekJawaraSecretMasterKey2026');

  const filteredLogs = activityLogs.filter(log =>
    log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.targetEntity.toLowerCase().includes(logSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  const handleRunEncrypt = async () => {
    const enc = await encryptData(plainTextInput, testPassword);
    setEncryptedOutput(enc);
    setDecryptedOutput('');
  };

  const handleRunDecrypt = async () => {
    if (!encryptedOutput) return;
    const dec = await decryptData(encryptedOutput, testPassword);
    setDecryptedOutput(dec);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto h-[calc(100vh-53px)] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Pusat Keamanan, 2FA, Enkripsi AES-256 & Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengawasan menyeluruh aktivitas pengguna, verifikasi dua faktor staf, dan enkripsi data medis pasien.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsProfileModalOpen(true)}
          className="px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Users className="w-4 h-4" />
          <span>Kelola Pengguna & Edit Profil</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'audit'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Log Aktivitas Pengguna (Audit Trail)
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'crypto'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Konsol Uji Enkripsi AES-256
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'users'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Daftar Hak Akses & Status 2FA Pengguna
        </button>
      </div>

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Log Aktivitas Sistem ({activityLogs.length} Entri Tercatat)</span>
            </h3>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Cari aksi, pengguna, atau entitas..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pengguna</th>
                  <th className="py-2.5 px-3">Aksi Sistem</th>
                  <th className="py-2.5 px-3">Entitas Sasaran</th>
                  <th className="py-2.5 px-3">Detail Perubahan</th>
                  <th className="py-2.5 px-3 text-center">IP Terminal</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{log.userName}</div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">{log.role}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0066cc]">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{log.targetEntity}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' :
                        log.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Crypto */}
      {activeTab === 'crypto' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Enkripsi Tingkat Lanjut AES-GCM 256-Bit (Web Crypto API)</h3>
              <p className="text-slate-500">
                Data sensitif seperti rekam medis pasien, NIK, dan catatan resep dienkripsi sebelum disimpan ke memori/cloud.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Teks Mentah (Plaintext):</label>
            <textarea
              rows={3}
              value={plainTextInput}
              onChange={(e) => setPlainTextInput(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kunci Rahasia Utama (Master Key):</label>
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl font-mono text-xs"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRunEncrypt}
              className="px-4 py-2 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Enkripsi ke AES-256</span>
            </button>
            <button
              type="button"
              onClick={handleRunDecrypt}
              disabled={!encryptedOutput}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Dekripsi Kembali</span>
            </button>
          </div>

          {encryptedOutput && (
            <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] break-all space-y-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Hasil Ciphertext Terenkripsi:</div>
              <div>{encryptedOutput}</div>
            </div>
          )}

          {decryptedOutput && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl font-mono text-xs border border-emerald-200">
              <div className="text-emerald-700 text-[10px] uppercase font-bold">Hasil Dekripsi Berhasil:</div>
              <div className="font-semibold">{decryptedOutput}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Kebijakan Hak Akses Staf Apotek (RBAC)</h3>
            <span className="text-slate-500">
              Aturan: Kasir hanya dapat diubah oleh Manajer atau Owner.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map(u => {
              const check = canEditUser(u.id);
              return (
                <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{u.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      u.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'manajer' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div>Email: {u.email}</div>
                    <div>WhatsApp: {u.phone}</div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                      <span>2FA: </span>
                      {u.twoFactorEnabled ? (
                        <strong className="text-emerald-600">AKTIF</strong>
                      ) : (
                        <span className="text-slate-400">NONAKTIF</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => openLoginModal(u.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
                        u.id === currentUser.id
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-yellow-400" />
                      <span>{u.id === currentUser.id ? 'Sesi Aktif' : 'Login Akun'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(true)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                        check.allowed
                          ? 'bg-[#0066cc] text-white hover:bg-sky-700'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Edit Profil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
};
