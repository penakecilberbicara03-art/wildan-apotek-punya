import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Medicine, CartItem, SaleTransaction, Patient, Doctor, User, Role,
  ActivityLog, AppNotification, ThirdPartyIntegration, UnitType
} from '../types/pharmacy';
import {
  INITIAL_MEDICINES, INITIAL_USERS, INITIAL_PATIENTS, INITIAL_DOCTORS,
  INITIAL_INTEGRATIONS, INITIAL_ACTIVITY_LOGS, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS
} from '../data/initialData';
import { getDaysUntilExpiry } from '../utils/formatters';
import { verifyTOTPCode } from '../utils/crypto';

interface PosSettings {
  sessionCode: string;
  shelf: string;
  salesPerson: string;
  channel: 'Offline' | 'Halodoc' | 'GrabHealth' | 'Tokopedia' | 'WhatsApp';
  discountType: 'percent' | 'nominal';
  discountValue: number;
  serviceFee: number;
  embalaseFee: number;
  shippingFee: number;
  otherFee: number;
  selectedPatientId?: string;
  selectedDoctorId?: string;
}

interface PharmacyContextType {
  // Navigation & View
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  searchTermFeature: string;
  setSearchTermFeature: (term: string) => void;

  // Medicines & Inventory
  medicines: Medicine[];
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  restockMedicine: (id: string, additionalStock: number, newBatch?: string, newExpiry?: string) => void;

  // POS State
  cart: CartItem[];
  addToCart: (medicine: Medicine, qty?: number) => void;
  updateCartQuantity: (medicineId: string, qty: number) => void;
  updateCartUnit: (medicineId: string, unit: UnitType) => void;
  updateCartPriceOption: (medicineId: string, option: 'general' | 'prescription' | 'wholesale') => void;
  updateCartEtiket: (medicineId: string, note: string) => void;
  removeFromCart: (medicineId: string) => void;
  clearCart: () => void;
  
  // Checkout & Calculations
  posSettings: PosSettings;
  updatePosSettings: (updates: Partial<PosSettings>) => void;
  cartSubtotal: number;
  cartDiscountTotal: number;
  cartGrandTotal: number;
  completeSale: (paymentMethod: any, amountPaid: number, notes?: string) => SaleTransaction;
  
  // Hold Transactions
  heldTransactions: { id: string; timestamp: string; cart: CartItem[]; settings: PosSettings }[];
  holdCurrentTransaction: () => void;
  resumeHeldTransaction: (id: string) => void;
  deleteHeldTransaction: (id: string) => void;

  // Transactions list
  transactions: SaleTransaction[];

  // Patients & Doctors
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'medicalRecordNo' | 'registeredDate'>) => Patient;
  doctors: Doctor[];
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  selectedPatient?: Patient;
  selectedDoctor?: Doctor;
  allergyWarnings: string[];

  // Users & RBAC
  users: User[];
  currentUser: User;
  switchUser: (userId: string) => void;
  loginUser: (username: string, password: string, otpCode?: string) => { success: boolean; message: string; requires2FA?: boolean; targetUser?: User };
  canEditUser: (targetUserId: string) => { allowed: boolean; reason?: string };
  updateUserProfile: (userId: string, updates: Partial<User>) => { success: boolean; message: string };
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  openLoginModal: (targetUserId?: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotificationsCount: number;

  // Activity Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, target: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'FAILED') => void;

  // Cloud Integrations
  integrations: ThirdPartyIntegration[];
  isSyncingCloud: boolean;
  triggerSync: (integrationId?: string) => Promise<void>;

  // Modals & Triggers
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (open: boolean) => void;
  lastCompletedSale: SaleTransaction | null;
  isBarcodeModalOpen: boolean;
  setIsBarcodeModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string>('kasir');
  const [searchTermFeature, setSearchTermFeature] = useState<string>('');

  // Initial data loaded into state
  const [medicines, setMedicines] = useState<Medicine[]>(INITIAL_MEDICINES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default: Firmann (Kasir)
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [transactions, setTransactions] = useState<SaleTransaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(INITIAL_INTEGRATIONS);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Cart & POS settings
  // Preload initial item as in screenshot: BEDAK SALICYL BULAT MENTHOL 100 G
  const [cart, setCart] = useState<CartItem[]>([
    {
      medicineId: 'med-1',
      medicine: INITIAL_MEDICINES[0],
      quantity: 1,
      unit: 'Pot',
      priceOption: 'general',
      subtotal: INITIAL_MEDICINES[0].sellPriceGeneral,
      etiketNote: 'misal "Sehari 3 kali ..."'
    }
  ]);

  const [posSettings, setPosSettings] = useState<PosSettings>({
    sessionCode: 'B250519-3',
    shelf: 'Etalase A',
    salesPerson: 'Firmann',
    channel: 'Offline',
    discountType: 'nominal',
    discountValue: 0,
    serviceFee: 0,
    embalaseFee: 0,
    shippingFee: 0,
    otherFee: 0,
  });

  const [heldTransactions, setHeldTransactions] = useState<{ id: string; timestamp: string; cart: CartItem[]; settings: PosSettings }[]>([]);
  const [lastCompletedSale, setLastCompletedSale] = useState<SaleTransaction | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [loginPresetTargetId, setLoginPresetTargetId] = useState<string | undefined>(undefined);

  const openLoginModal = (targetUserId?: string) => {
    setLoginPresetTargetId(targetUserId);
    setIsLoginModalOpen(true);
  };

  // Helper to log user activities
  const logActivity = (action: string, target: string, details: string, status: 'SUCCESS' | 'WARNING' | 'FAILED' = 'SUCCESS') => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      targetEntity: target,
      details,
      ipAddress: '192.168.1.' + (currentUser.role === 'kasir' ? '101' : currentUser.role === 'manajer' ? '105' : '1'),
      status,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Check Expiry & Min Stock alerts periodically
  useEffect(() => {
    medicines.forEach(med => {
      const days = getDaysUntilExpiry(med.expiryDate);
      if (days <= 30 && days > 0) {
        // Expiry alert
        const exists = notifications.some(n => n.type === 'EXPIRY_ALERT' && n.relatedId === med.id);
        if (!exists) {
          const newNotif: AppNotification = {
            id: `notif-exp-${med.id}-${Date.now()}`,
            type: 'EXPIRY_ALERT',
            title: 'Peringatan Kedaluwarsa Obat',
            message: `${med.name} (Batch: ${med.batchNumber}) akan kedaluwarsa dlm ${days} hari!`,
            timestamp: 'Baru saja',
            isRead: false,
            severity: 'danger',
            relatedId: med.id,
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      }

      if (med.stock <= med.minStockAlert) {
        // Low stock alert
        const exists = notifications.some(n => n.type === 'MIN_STOCK_ALERT' && n.relatedId === med.id);
        if (!exists) {
          const newNotif: AppNotification = {
            id: `notif-stk-${med.id}-${Date.now()}`,
            type: 'MIN_STOCK_ALERT',
            title: 'Stok Obat Menipis',
            message: `${med.name} sisa ${med.stock} ${med.unit} (Di bawah ambang minimum ${med.minStockAlert} ${med.unit})`,
            timestamp: 'Baru saja',
            isRead: false,
            severity: 'warning',
            relatedId: med.id,
          };
          setNotifications(prev => [newNotif, ...prev]);
        }
      }
    });
  }, [medicines]);

  // Selected patient & allergy checks
  const selectedPatient = patients.find(p => p.id === posSettings.selectedPatientId);
  const selectedDoctor = doctors.find(d => d.id === posSettings.selectedDoctorId);

  const allergyWarnings: string[] = [];
  if (selectedPatient && selectedPatient.allergies.length > 0) {
    cart.forEach(item => {
      const medNameLower = item.medicine.name.toLowerCase();
      const medActiveLower = item.medicine.activeSubstance.toLowerCase();
      selectedPatient.allergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase();
        if (medNameLower.includes(allergyLower) || medActiveLower.includes(allergyLower) || (item.medicine.contraindications && item.medicine.contraindications.some(c => c.toLowerCase().includes(allergyLower)))) {
          allergyWarnings.push(`PERINGATAN ALERGI: Pasien ${selectedPatient.name} memiliki riwayat alergi terhadap '${allergy}'. Obat '${item.medicine.name}' berisiko memicu kontraindikasi.`);
        }
      });
    });
  }

  // Cart operations
  const addToCart = (medicine: Medicine, qty: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.medicineId === medicine.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + qty;
        const price = updated[existingIndex].priceOption === 'general'
          ? medicine.sellPriceGeneral
          : updated[existingIndex].priceOption === 'prescription'
          ? medicine.sellPricePrescription
          : medicine.sellPriceWholesale;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * price,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            medicineId: medicine.id,
            medicine,
            quantity: qty,
            unit: medicine.unit,
            priceOption: 'general',
            subtotal: qty * medicine.sellPriceGeneral,
            etiketNote: medicine.requiresPrescription ? 'Sehari 3 kali 1 sendok/tablet sesudah makan' : 'Sesuai petunjuk kemasan',
          }
        ];
      }
    });
    logActivity('TAMBAH_KERANJANG', medicine.name, `Menambahkan ${qty} ${medicine.unit} ke keranjang`);
  };

  const updateCartQuantity = (medicineId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        const unitPrice = item.priceOption === 'general'
          ? item.medicine.sellPriceGeneral
          : item.priceOption === 'prescription'
          ? item.medicine.sellPricePrescription
          : item.medicine.sellPriceWholesale;
        return {
          ...item,
          quantity: qty,
          subtotal: qty * unitPrice,
        };
      }
      return item;
    }));
  };

  const updateCartUnit = (medicineId: string, unit: UnitType) => {
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        return { ...item, unit };
      }
      return item;
    }));
  };

  const updateCartPriceOption = (medicineId: string, option: 'general' | 'prescription' | 'wholesale') => {
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        const unitPrice = option === 'general'
          ? item.medicine.sellPriceGeneral
          : option === 'prescription'
          ? item.medicine.sellPricePrescription
          : item.medicine.sellPriceWholesale;
        return {
          ...item,
          priceOption: option,
          subtotal: item.quantity * unitPrice,
        };
      }
      return item;
    }));
  };

  const updateCartEtiket = (medicineId: string, note: string) => {
    setCart(prev => prev.map(item => {
      if (item.medicineId === medicineId) {
        return { ...item, etiketNote: note };
      }
      return item;
    }));
  };

  const removeFromCart = (medicineId: string) => {
    const item = cart.find(i => i.medicineId === medicineId);
    setCart(prev => prev.filter(i => i.medicineId !== medicineId));
    if (item) {
      logActivity('HAPUS_ITEM_KERANJANG', item.medicine.name, 'Menghapus item dari keranjang');
    }
  };

  const clearCart = () => {
    setCart([]);
    logActivity('KOSONGKAN_KERANJANG', 'POS Kasir', 'Mengosongkan semua item di keranjang');
  };

  const updatePosSettings = (updates: Partial<PosSettings>) => {
    setPosSettings(prev => ({ ...prev, ...updates }));
  };

  // Totals calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartDiscountTotal = posSettings.discountType === 'percent'
    ? (cartSubtotal * (posSettings.discountValue / 100))
    : posSettings.discountValue;
  const extraFees = posSettings.serviceFee + posSettings.embalaseFee + posSettings.shippingFee + posSettings.otherFee;
  const cartGrandTotal = Math.max(0, cartSubtotal - cartDiscountTotal + extraFees);

  // Hold current transaction (Tunda F4)
  const holdCurrentTransaction = () => {
    if (cart.length === 0) return;
    const holdId = `HOLD-${Date.now().toString().slice(-4)}`;
    setHeldTransactions(prev => [
      ...prev,
      {
        id: holdId,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        cart: [...cart],
        settings: { ...posSettings },
      }
    ]);
    clearCart();
    logActivity('TUNDA_TRANSAKSI', holdId, `Menunda transaksi dengan ${cart.length} item`);
  };

  const resumeHeldTransaction = (id: string) => {
    const found = heldTransactions.find(h => h.id === id);
    if (found) {
      setCart(found.cart);
      setPosSettings(found.settings);
      setHeldTransactions(prev => prev.filter(h => h.id !== id));
      logActivity('LANJUTKAN_TRANSAKSI_TUNDA', id, 'Melanjutkan transaksi tertunda ke meja kasir');
    }
  };

  const deleteHeldTransaction = (id: string) => {
    setHeldTransactions(prev => prev.filter(h => h.id !== id));
    logActivity('HAPUS_TRANSAKSI_TUNDA', id, 'Menghapus transaksi tertunda');
  };

  // Complete Sale
  const completeSale = (paymentMethod: any, amountPaid: number, notes?: string): SaleTransaction => {
    const invoiceNumber = `INV/${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${new Date().getDate().toString().padStart(2,'0')}/${(transactions.length + 1).toString().padStart(4, '0')}`;
    const changeDue = Math.max(0, amountPaid - cartGrandTotal);

    const newSale: SaleTransaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      patientId: posSettings.selectedPatientId,
      patientName: selectedPatient?.name,
      doctorId: posSettings.selectedDoctorId,
      doctorName: selectedDoctor?.name,
      salesPerson: posSettings.salesPerson,
      channel: posSettings.channel,
      items: [...cart],
      subtotal: cartSubtotal,
      discountType: posSettings.discountType,
      discountValue: posSettings.discountValue,
      discountTotal: cartDiscountTotal,
      serviceFee: posSettings.serviceFee,
      embalaseFee: posSettings.embalaseFee,
      shippingFee: posSettings.shippingFee,
      otherFee: posSettings.otherFee,
      grandTotal: cartGrandTotal,
      paymentMethod,
      amountPaid,
      changeDue,
      status: paymentMethod === 'tempo' ? 'Tempo' : 'Lunas',
      sessionCode: posSettings.sessionCode,
      shelf: posSettings.shelf,
      notes,
    };

    // Deduct stock from inventory
    setMedicines(prev => prev.map(med => {
      const inCart = cart.find(c => c.medicineId === med.id);
      if (inCart) {
        return {
          ...med,
          stock: Math.max(0, med.stock - inCart.quantity),
        };
      }
      return med;
    }));

    setTransactions(prev => [newSale, ...prev]);
    setLastCompletedSale(newSale);
    clearCart();
    setIsReceiptModalOpen(true);

    logActivity('TRANSAKSI_SELESAI', invoiceNumber, `Penjualan ${paymentMethod.toUpperCase()} senilai Rp ${cartGrandTotal.toLocaleString('id-ID')}`);

    // Add notification
    setNotifications(prev => [
      {
        id: `notif-sale-${Date.now()}`,
        type: 'SALE_COMPLETE',
        title: 'Transaksi Kasir Berhasil',
        message: `${invoiceNumber} senilai Rp ${cartGrandTotal.toLocaleString('id-ID')} telah dibukukan`,
        timestamp: 'Baru saja',
        isRead: false,
        severity: 'success',
      },
      ...prev
    ]);

    return newSale;
  };

  // Medicine Inventory CRUD
  const addMedicine = (medData: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      ...medData,
      id: `med-${Date.now()}`,
    };
    setMedicines(prev => [newMed, ...prev]);
    logActivity('TAMBAH_OBAT', newMed.name, `Menambahkan obat baru: ${newMed.name} (Stok: ${newMed.stock})`);
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    logActivity('UPDATE_OBAT', id, `Memperbarui data obat`);
  };

  const restockMedicine = (id: string, additionalStock: number, newBatch?: string, newExpiry?: string) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          stock: m.stock + additionalStock,
          batchNumber: newBatch || m.batchNumber,
          expiryDate: newExpiry || m.expiryDate,
        };
      }
      return m;
    }));
    logActivity('RESTOCK_OBAT', id, `Menambah stok sebanyak ${additionalStock} unit`);
  };

  // Patient & Doctor Management
  const addPatient = (patientData: Omit<Patient, 'id' | 'medicalRecordNo' | 'registeredDate'>): Patient => {
    const newPat: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      medicalRecordNo: `RM-2026-${(patients.length + 101).toString()}`,
      registeredDate: new Date().toISOString().slice(0, 10),
    };
    setPatients(prev => [newPat, ...prev]);
    logActivity('TAMBAH_PASIEN', newPat.name, `Pendaftaran pasien baru No. RM ${newPat.medicalRecordNo}`);
    return newPat;
  };

  const addDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
    };
    setDoctors(prev => [newDoc, ...prev]);
    logActivity('TAMBAH_DOKTER', newDoc.name, `Menambahkan dokter perujuk: ${newDoc.name}`);
  };

  // RBAC & Profile Management Rules:
  // "sedikan fitur untuk edit profil kasih manajer dan owner tapi yang bisa ngubah manajer dan owner si kasir harus diubah oleh menejer dan owner"
  const canEditUser = (targetUserId: string): { allowed: boolean; reason?: string } => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) return { allowed: false, reason: 'Pengguna tidak ditemukan' };

    // Kasir cannot edit anyone else, AND cannot edit manager or owner!
    if (currentUser.role === 'kasir') {
      if (targetUser.role === 'manajer' || targetUser.role === 'owner') {
        return {
          allowed: false,
          reason: 'Kasir TIDAK diizinkan mengedit profil Manajer atau Owner. Hak akses dibatasi oleh kebijakan keamanan Apotek.'
        };
      }
      if (targetUser.id === currentUser.id) {
        // Can only edit minor personal fields like phone/email, cannot change their own role!
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Kasir tidak memiliki izin mengedit profil staf lain.'
      };
    }

    // Manager can edit Cashiers and themselves, but NOT Owner
    if (currentUser.role === 'manajer') {
      if (targetUser.role === 'owner' && targetUser.id !== currentUser.id) {
        return {
          allowed: false,
          reason: 'Manajer tidak dapat mengubah profil Pemilik / Owner Apotek.'
        };
      }
      return { allowed: true };
    }

    // Owner has full control over all profiles
    if (currentUser.role === 'owner') {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Hak akses tidak memadai' };
  };

  const updateUserProfile = (userId: string, updates: Partial<User>): { success: boolean; message: string } => {
    const check = canEditUser(userId);
    if (!check.allowed) {
      logActivity('PERCOBAAN_EDIT_PROFIL_DITOLAK', userId, check.reason || 'Izin ditolak', 'WARNING');
      return { success: false, message: check.reason || 'Akses ditolak' };
    }

    // Ensure Kasir cannot promote themselves to Manajer or Owner
    if (currentUser.role === 'kasir' && updates.role && updates.role !== 'kasir') {
      logActivity('PERCOBAAN_ESKALASI_ROLE', userId, 'Kasir mencoba mengubah role menjadi manajer/owner', 'FAILED');
      return { success: false, message: 'Kasir tidak memiliki hak mengubah hak akses (Role). Hanya Manajer dan Owner yang berwenang.' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updates };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    logActivity('UPDATE_PROFIL_PENGGUNA', userId, `Profil ${updates.name || userId} berhasil diperbarui oleh ${currentUser.name}`);
    return { success: true, message: 'Profil pengguna berhasil diperbarui!' };
  };

  const loginUser = (username: string, password: string, otpCode?: string): { success: boolean; message: string; requires2FA?: boolean; targetUser?: User } => {
    const trimmedUsername = username.trim().toLowerCase();
    const target = users.find(u => u.username.toLowerCase() === trimmedUsername || u.name.toLowerCase() === trimmedUsername);

    if (!target) {
      logActivity('LOGIN_GAGAL', username, `Percobaan login gagal: Username '${username}' tidak terdaftar`, 'WARNING');
      return { success: false, message: 'Username tidak ditemukan di sistem apotek.' };
    }

    // Default password fallback: "kasir123", "manajer123", "owner123"
    const expectedPassword = target.password || (target.role === 'kasir' ? 'kasir123' : target.role === 'manajer' ? 'manajer123' : 'owner123');

    if (password !== expectedPassword) {
      logActivity('LOGIN_GAGAL', target.name, `Percobaan login akun ${target.name} gagal (Kata sandi salah)`, 'WARNING');
      return { success: false, message: 'Kata sandi tidak sesuai! Silakan periksa kembali.' };
    }

    // 2FA Verification check
    if (target.twoFactorEnabled) {
      if (!otpCode || otpCode.trim() === '') {
        return {
          success: false,
          requires2FA: true,
          targetUser: target,
          message: 'Akun ini dilindungi 2FA. Masukkan kode 6-digit Authenticator.'
        };
      }

      const isValidOtp = verifyTOTPCode(otpCode.trim(), target.twoFactorSecret);
      if (!isValidOtp) {
        logActivity('LOGIN_GAGAL_2FA', target.name, `Kode 2FA salah untuk akun ${target.name}`, 'WARNING');
        return {
          success: false,
          requires2FA: true,
          targetUser: target,
          message: 'Kode 2FA tidak valid atau kedaluwarsa. Masukkan kode terkini.'
        };
      }
    }

    // Login successful
    const updatedUser = {
      ...target,
      lastLogin: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setPosSettings(prev => ({
      ...prev,
      salesPerson: updatedUser.name,
    }));

    setIsLoginModalOpen(false);
    logActivity('LOGIN_BERHASIL', updatedUser.name, `Login akun ${updatedUser.name} (${updatedUser.role.toUpperCase()}) berhasil diverifikasi`);

    return {
      success: true,
      message: `Login berhasil! Selamat bertugas, ${updatedUser.name}`,
      targetUser: updatedUser
    };
  };

  const switchUser = (userId: string) => {
    // When changing user, require authentication via login modal
    openLoginModal(userId);
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Cloud Sync Simulator
  const triggerSync = async (integrationId?: string) => {
    setIsSyncingCloud(true);
    await new Promise(r => setTimeout(r, 1200));

    const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    setIntegrations(prev => prev.map(item => {
      if (!integrationId || item.id === integrationId) {
        return {
          ...item,
          status: 'Connected',
          lastSync: nowStr,
          syncedItemsCount: item.syncedItemsCount + Math.floor(Math.random() * 5 + 1),
        };
      }
      return item;
    }));

    setIsSyncingCloud(false);
    logActivity('SINKRONISASI_CLOUD', integrationId || 'Semua Layanan', 'Sinkronisasi inventori real-time & backup berhasil');
    
    setNotifications(prev => [
      {
        id: `notif-sync-${Date.now()}`,
        type: 'SYNC_STATUS',
        title: 'Sinkronisasi Cloud Berhasil',
        message: 'Data inventaris, rekam medis, dan transaksi telah sinkron dengan server pusat.',
        timestamp: 'Baru saja',
        isRead: false,
        severity: 'success',
      },
      ...prev
    ]);
  };

  return (
    <PharmacyContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        searchTermFeature,
        setSearchTermFeature,
        medicines,
        addMedicine,
        updateMedicine,
        restockMedicine,
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
        completeSale,
        heldTransactions,
        holdCurrentTransaction,
        resumeHeldTransaction,
        deleteHeldTransaction,
        transactions,
        patients,
        addPatient,
        doctors,
        addDoctor,
        selectedPatient,
        selectedDoctor,
        allergyWarnings,
        users,
        currentUser,
        switchUser,
        loginUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        openLoginModal,
        canEditUser,
        updateUserProfile,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotificationsCount,
        activityLogs,
        logActivity,
        integrations,
        isSyncingCloud,
        triggerSync,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        lastCompletedSale,
        isBarcodeModalOpen,
        setIsBarcodeModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
