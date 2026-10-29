import React, { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PosView } from './components/POS/PosView';
import { InventoryView } from './components/Inventory/InventoryView';
import { MedicalRecordsView } from './components/MedicalRecords/MedicalRecordsView';
import { DashboardView } from './components/Dashboard/DashboardView';
import { FinanceView } from './components/Finance/FinanceView';
import { CloudSyncView } from './components/CloudSync/CloudSyncView';
import { SecurityAndAuditView } from './components/Security/SecurityAndAuditView';
import { TransactionsListView } from './components/Transactions/TransactionsListView';

const MainContent: React.FC = () => {
  const { activeMenu } = usePharmacy();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const renderActiveView = () => {
    switch (activeMenu) {
      case 'kasir':
        return <PosView />;
      case 'home':
      case 'dashboard':
        return <DashboardView />;
      case 'rekam-medis':
        return <MedicalRecordsView />;
      case 'persediaan':
        return <InventoryView />;
      case 'daftar-penjualan':
        return <TransactionsListView viewMode="daftar" />;
      case 'pesanan':
        return <TransactionsListView viewMode="pesanan" />;
      case 'retur':
        return <TransactionsListView viewMode="retur" />;
      case 'tertolak':
        return <TransactionsListView viewMode="tertolak" />;
      case 'keuangan':
      case 'akuntansi':
        return <FinanceView />;
      case 'cloud-sync':
        return <CloudSyncView />;
      case 'keamanan':
        return <SecurityAndAuditView />;
      default:
        return <PosView />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f4f8] text-slate-800">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          onCloseMobile={() => {
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PharmacyProvider>
      <MainContent />
    </PharmacyProvider>
  );
}
