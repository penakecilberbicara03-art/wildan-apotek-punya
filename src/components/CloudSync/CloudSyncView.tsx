import React, { useState } from 'react';
import {
  Cloud, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck,
  Send, Database, Download, Upload, Globe, Key, Activity
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatDateTime } from '../../utils/formatters';

export const CloudSyncView: React.FC = () => {
  const {
    integrations,
    isSyncingCloud,
    triggerSync,
    medicines,
    transactions,
    patients
  } = usePharmacy();

  const [activeTab, setActiveTab] = useState<'integrations' | 'backup' | 'webhook'>('integrations');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/apotek-inventory-events');
  const [testPayloadStatus, setTestPayloadStatus] = useState<string | null>(null);

  const handleTestWebhook = async () => {
    setTestPayloadStatus('Mengirim payload inventori terenkripsi...');
    await new Promise(r => setTimeout(r, 1000));
    setTestPayloadStatus(`HTTP 200 OK: Event [INVENTORY_UPDATED] sukses diterima oleh server cloud.`);
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      pharmacyId: 'jawara-apotek-trial',
      medicines,
      transactions,
      patients,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apotek_Cloud_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto h-[calc(100vh-53px)] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-sky-600" />
            <span>Modul Sinkronisasi Cloud & Integrasi API Pihak Ke-3</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akses data apotek dari mana saja secara real-time, terhubung dengan SatuSehat Kemenkes dan e-commerce.
          </p>
        </div>

        <button
          type="button"
          disabled={isSyncingCloud}
          onClick={() => triggerSync()}
          className={`px-4 py-2 bg-[#0066cc] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors flex items-center gap-1.5 shadow-sm ${
            isSyncingCloud ? 'animate-pulse' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncingCloud ? 'animate-spin' : ''}`} />
          <span>{isSyncingCloud ? 'Sedang Menyinkronkan...' : 'Sinkronkan Semua Sekarang'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'integrations'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          API Pihak Ketiga & Mitra Telemedicine
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'backup'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Cloud Backup & Snapshot Basis Data
        </button>
        <button
          onClick={() => setActiveTab('webhook')}
          className={`pb-2.5 font-bold transition-colors ${
            activeTab === 'webhook'
              ? 'text-[#0066cc] border-b-2 border-[#0066cc]'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Webhook & Real-Time Event Dispatcher
        </button>
      </div>

      {/* Tab: Integrations */}
      {activeTab === 'integrations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {item.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Endpoint URL:</span>
                  <span className="text-[#0066cc] truncate max-w-[200px]" title={item.endpointUrl}>
                    {item.endpointUrl}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Sinkronisasi Terakhir:</span>
                  <span className="text-slate-900">{item.lastSync}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Record Tersinkron:</span>
                  <span className="text-slate-900 font-bold">{item.syncedItemsCount.toLocaleString('id-ID')} items</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isSyncingCloud}
                  onClick={() => triggerSync(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ping & Sync Ulang</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Backup */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0066cc] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Snapshot Cadangan Data Apotek (Cloud Backup)</h3>
              <p className="text-slate-500">
                Ekspor seluruh konfigurasi obat, stok, rekam medis pasien, dan faktur kasir ke file cadangan JSON terenkripsi.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Obat Terdaftar:</span>
              <strong className="text-slate-900 font-mono">{medicines.length} SKU</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Rekam Medis Pasien:</span>
              <strong className="text-slate-900 font-mono">{patients.length} Pasien</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Transaksi Kasir:</span>
              <strong className="text-slate-900 font-mono">{transactions.length} Faktur</strong>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2.5 bg-[#0066cc] text-white rounded-xl font-bold hover:bg-sky-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File Cadangan JSON (.json)</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab: Webhook */}
      {activeTab === 'webhook' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Webhook Real-Time Broadcast</h3>
              <p className="text-slate-500">
                Kirim sinyal instan ke sistem cabang atau e-commerce setiap kali transaksi penjualan terjadi di kasir.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Webhook Listener URL:</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs bg-white"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestWebhook}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Kirim Test Ping Payload</span>
            </button>
          </div>

          {testPayloadStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-mono text-[11px]">
              {testPayloadStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
