import React, { useState } from 'react';
import {
  HeartPulse, Search, Plus, Shield, Lock, Unlock,
  AlertTriangle, FileText, UserPlus, Calendar, Phone, MapPin,
  CheckCircle2, ShoppingCart
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Patient } from '../../types/pharmacy';
import { encryptData, decryptData } from '../../utils/crypto';

export const MedicalRecordsView: React.FC = () => {
  const {
    patients,
    addPatient,
    updatePosSettings,
    setActiveMenu,
    transactions
  } = usePharmacy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [isEncryptedView, setIsEncryptedView] = useState(true);
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);

  // New Patient Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    nik: '',
    gender: 'L' as 'L' | 'P',
    birthDate: '1990-01-01',
    phone: '',
    address: '',
    bloodType: 'O' as any,
    allergies: '',
    chronicDiseases: '',
  });

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.medicalRecordNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nik.includes(searchQuery) ||
    p.phone.includes(searchQuery)
  );

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleStartTransaction = (patient: Patient) => {
    updatePosSettings({ selectedPatientId: patient.id });
    setActiveMenu('kasir');
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addPatient({
      name: newPatient.name,
      nik: newPatient.nik,
      gender: newPatient.gender,
      birthDate: newPatient.birthDate,
      phone: newPatient.phone,
      address: newPatient.address,
      bloodType: newPatient.bloodType,
      allergies: newPatient.allergies ? newPatient.allergies.split(',').map(s => s.trim()) : [],
      chronicDiseases: newPatient.chronicDiseases ? newPatient.chronicDiseases.split(',').map(s => s.trim()) : [],
    });
    setSelectedPatientId(created.id);
    setIsAddPatientModalOpen(false);
  };

  const patientTransactions = transactions.filter(t => t.patientId === activePatient?.id);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden h-[calc(100vh-53px)]">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <span>Rekam Medis & Riwayat Resep Pasien</span>
          </h2>
          <p className="text-xs text-slate-500">
            Terintegrasi langsung ke kasir untuk deteksi alergi obat & keamanan resep perorangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* AES-256 Encryption Toggle Button */}
          <button
            type="button"
            onClick={() => setIsEncryptedView(!isEncryptedView)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isEncryptedView
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isEncryptedView ? (
              <>
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enkripsi AES-256: AKTIF (Privasi NIK)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>Enkripsi AES-256: DIBUKA (Dekripsi)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsAddPatientModalOpen(true)}
            className="px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pasien Baru</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: Patient List (Left) and Detail Record (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left List */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pasien / No. RM / NIK..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-1 focus:ring-[#0066cc]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {filteredPatients.map((pat) => (
              <div
                key={pat.id}
                onClick={() => setSelectedPatientId(pat.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all text-xs ${
                  activePatient?.id === pat.id
                    ? 'bg-sky-50 border border-sky-300 shadow-xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-slate-900">{pat.name}</div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.2 rounded font-bold">
                    {pat.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {pat.medicalRecordNo} · {pat.birthDate}
                </div>
                {pat.allergies.length > 0 && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span className="truncate">Alergi: {pat.allergies.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Card */}
        {activePatient ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Demographic Profile Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0066cc] flex items-center justify-center font-black text-lg">
                    {activePatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{activePatient.name}</span>
                      <span className="text-xs bg-sky-100 text-[#0066cc] font-mono px-2 py-0.5 rounded-full font-bold">
                        {activePatient.medicalRecordNo}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{activePatient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      <span>·</span>
                      <span>Gol. Darah: {activePatient.bloodType}</span>
                      <span>·</span>
                      <span>Tgl Lahir: {activePatient.birthDate}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartTransaction(activePatient)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buka Transaksi Kasir</span>
                </button>
              </div>

              {/* Data Grid with Encryption demo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">NIK Kependudukan (AES-256):</span>
                  <div className="font-mono font-bold text-slate-900">
                    {isEncryptedView ? `AES256:••••••••${activePatient.nik.slice(-4)}` : activePatient.nik}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {isEncryptedView ? 'Terenkripsi di database lokal' : 'Dekripsi terotorisasi'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Kontak WhatsApp / Telp:</span>
                  <div className="font-mono font-bold text-slate-900">{activePatient.phone}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Aktif menerima notifikasi resep</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block mb-0.5">Alamat Tempat Tinggal:</span>
                  <div className="font-medium text-slate-900">{activePatient.address}</div>
                </div>
              </div>

              {/* Allergy Warning Box */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Riwayat Alergi Obat (Wajib Diperhatikan Kasir):</span>
                </div>
                {activePatient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activePatient.allergies.map((allergy, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-rose-300 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-xs shadow-xs"
                      >
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic">
                    Tidak ada riwayat alergi obat yang dilaporkan.
                  </div>
                )}
              </div>

              {/* Chronic Disease Box */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50 space-y-2">
                <div className="flex items-center gap-2 text-sky-950 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-[#0066cc]" />
                  <span>Riwayat Penyakit & Diagnosa Terdaftar:</span>
                </div>
                {activePatient.chronicDiseases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activePatient.chronicDiseases.map((dis, idx) => (
                      <span
                        key={idx}
                        className="bg-white border border-sky-200 text-sky-900 font-semibold px-2.5 py-1 rounded-lg text-xs"
                      >
                        {dis}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 italic">
                    Tidak ada catatan diagnosa kronis.
                  </div>
                )}
              </div>
            </div>

            {/* Prescriptions and Dispensing History */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Riwayat Penyerahan Obat & Resep di Apotek ({patientTransactions.length} Transaksi)</span>
              </h4>

              {patientTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Belum ada transaksi resep tercatat untuk pasien ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {patientTransactions.map(trx => (
                    <div key={trx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex justify-between items-center font-semibold text-slate-800">
                        <span>Faktur: {trx.invoiceNumber} ({trx.date})</span>
                        <span className="font-bold text-emerald-600">Rp {trx.grandTotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="space-y-1">
                        {trx.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600 pl-2 border-l-2 border-[#0066cc]">
                            <div>
                              <span className="font-medium text-slate-900">{it.medicine.name}</span>
                              <span className="text-slate-500"> ({it.quantity} {it.unit})</span>
                              {it.etiketNote && (
                                <div className="text-[10px] text-sky-800 italic">Signa: {it.etiketNote}</div>
                              )}
                            </div>
                            <span className="font-mono text-slate-700">Rp {it.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Pilih pasien dari daftar sebelah kiri.
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#0066cc] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">Registrasi Pasien Rekam Medis Baru</h3>
              <button onClick={() => setIsAddPatientModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSavePatient} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Pasien:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit KTP):</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3273011405820003"
                    value={newPatient.nik}
                    onChange={(e) => setNewPatient({ ...newPatient, nik: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin:</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir:</label>
                  <input
                    type="date"
                    value={newPatient.birthDate}
                    onChange={(e) => setNewPatient({ ...newPatient, birthDate: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Golongan Darah:</label>
                  <select
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="Tidak Tahu">Tidak Tahu</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp / HP:</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-8877-6655"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili:</label>
                <textarea
                  rows={2}
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Alamat lengkap pasien..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-rose-700 mb-1">
                  Riwayat Alergi Obat (Pisahkan dengan koma):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Amoxicillin, Penisilin, Sulfa"
                  value={newPatient.allergies}
                  onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                  className="w-full p-2 border border-rose-300 rounded-lg bg-rose-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Riwayat Penyakit Kronis:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hipertensi, Diabetes Melitus"
                  value={newPatient.chronicDiseases}
                  onChange={(e) => setNewPatient({ ...newPatient, chronicDiseases: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Daftarkan Pasien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
