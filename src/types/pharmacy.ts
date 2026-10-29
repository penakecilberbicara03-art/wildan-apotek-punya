export type Role = 'kasir' | 'manajer' | 'owner';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastLogin?: string;
  sipApoteker?: string; // Surat Izin Praktik Apoteker if applicable
  password?: string;
}

export type DrugCategory = 'Bebas' | 'Bebas Terbatas' | 'Keras' | 'Narkotika' | 'Psikotropika' | 'Herbal / Jamu' | 'Alat Kesehatan';

export type UnitType = 'Tablet' | 'Strip' | 'Botol' | 'Pot' | 'Box' | 'Kapsul' | 'Sachet' | 'Ampul' | 'Tube';

export interface Medicine {
  id: string;
  code: string;
  barcode: string;
  name: string;
  activeSubstance: string; // Zat Aktif (e.g. Asam Salisilat, Parasetamol)
  category: DrugCategory;
  dosage: string;
  unit: UnitType;
  availableUnits: UnitType[];
  stock: number;
  minStockAlert: number;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  buyPrice: number;
  sellPriceGeneral: number; // #1 Harga Umum
  sellPricePrescription: number; // #2 Harga Resep
  sellPriceWholesale: number; // #3 Harga Grosir
  shelfLocation: string; // e.g. Etalase A, Etalase B, Rak Keras 1
  supplier: string;
  requiresPrescription: boolean;
  contraindications?: string[];
}

export interface CartItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number;
  unit: UnitType;
  priceOption: 'general' | 'prescription' | 'wholesale';
  customPrice?: number;
  etiketNote?: string; // e.g. "Sehari 3 kali 1 sendok takar sesudah makan"
  etiketTiming?: string; // Pagi, Siang, Malam
  subtotal: number;
}

export interface Patient {
  id: string;
  medicalRecordNo: string; // No. RM
  name: string;
  nik: string; // Encrypted or masked for privacy
  gender: 'L' | 'P';
  birthDate: string;
  phone: string;
  address: string;
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'Tidak Tahu';
  allergies: string[]; // Known drug allergies, e.g. ["Amoxicillin", "Sulfa", "Aspirin"]
  chronicDiseases: string[]; // e.g. ["Hipertensi", "Diabetes Melitus"]
  registeredDate: string;
}

export interface MedicalRecordEntry {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  doctorSip: string;
  diagnosis: string;
  symptoms: string;
  prescriptions: {
    medicineName: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }[];
  bloodPressure?: string;
  weightKg?: number;
  encryptedNotes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  sip: string;
  specialization: string;
  hospitalClinic: string;
  phone: string;
}

export type PaymentMethod = 'tunai' | 'qris' | 'transfer' | 'kartu' | 'tempo';

export interface SaleTransaction {
  id: string;
  invoiceNumber: string; // e.g. INV/20261029/001
  date: string;
  cashierId: string;
  cashierName: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  salesPerson?: string;
  channel: 'Offline' | 'Halodoc' | 'GrabHealth' | 'Tokopedia' | 'WhatsApp';
  items: CartItem[];
  subtotal: number;
  discountType: 'percent' | 'nominal';
  discountValue: number;
  discountTotal: number;
  serviceFee: number; // Biaya Servis / Tuslah
  embalaseFee: number; // Biaya Embalase / Kemasan
  shippingFee: number;
  otherFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number; // Kembalian
  status: 'Lunas' | 'Tertunda' | 'Dibatalkan' | 'Tempo';
  sessionCode: string;
  shelf: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export interface AppNotification {
  id: string;
  type: 'EXPIRY_ALERT' | 'MIN_STOCK_ALERT' | 'SALE_COMPLETE' | 'SECURITY_ALERT' | 'SYNC_STATUS';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'info' | 'warning' | 'danger' | 'success';
  relatedId?: string;
}

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'Connected' | 'Syncing' | 'Offline' | 'Error';
  lastSync: string;
  syncedItemsCount: number;
  endpointUrl: string;
}
