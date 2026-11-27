// Tipe data utama aplikasi.
export type Category = "traveling" | "gadget" | "konser" | "kendaraan" | "darurat" | "hobi" | "lainnya";
export type Frequency = "harian" | "mingguan" | "bulanan";

/** Biaya pendukung (penginapan, ongkos, dll). */
export interface CostItem { id: string; label: string; amount: number }

/** Satu catatan setoran. scheduleDate terisi jika dicentang dari kalender jadwal. */
export interface Deposit { id: string; date: string; amount: number; scheduleDate?: string }

export interface Goal {
  id: string;
  title: string;
  category: Category;
  mainAmount: number;
  extras: CostItem[];
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  initialBalance: number;
  frequency: Frequency;
  deposits: Deposit[];
  createdAt: string;
  isSample?: boolean;
}

export interface AppData { version: 1; goals: Goal[] }
