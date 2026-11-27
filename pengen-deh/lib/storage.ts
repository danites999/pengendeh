// Lapisan penyimpanan (pola repository/adapter).
// Aplikasi hanya bicara ke `WishlistRepository`. Untuk pindah ke Supabase, cukup buat
// kelas baru yang meng-implement interface ini lalu ganti baris `export const repository` di bawah.
import type { AppData, Category, Frequency, Goal } from "@/types";
import { CATEGORIES } from "./categories";
import { uid } from "./calculator";

export interface WishlistRepository {
  load(): Promise<AppData | null>; // null = belum ada data sama sekali
  save(data: AppData): Promise<void>;
  clear(): Promise<void>;
}

const KEY = "pengen-deh:v1";

export class LocalStorageRepository implements WishlistRepository {
  async load() {
    try { const raw = localStorage.getItem(KEY); return raw ? parseBackup(raw) : null; } catch { return null; }
  }
  async save(data: AppData) { localStorage.setItem(KEY, JSON.stringify(data)); }
  async clear() { localStorage.removeItem(KEY); }
}

/* ---------- Preferensi tampilan (tetap lokal per perangkat) ---------- */
export const prefs = {
  getHidden: () => { try { return localStorage.getItem("pengen-deh:hidden") === "1"; } catch { return false; } },
  setHidden: (v: boolean) => { try { localStorage.setItem("pengen-deh:hidden", v ? "1" : "0"); } catch {} },
  setTheme: (dark: boolean) => { try { localStorage.setItem("pengen-deh:theme", dark ? "dark" : "light"); } catch {} },
};

/* ---------- Ekspor / Impor ---------- */
export const serialize = (d: AppData) => JSON.stringify(d, null, 2);

export function parseBackup(text: string): AppData {
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Error("File bukan JSON yang valid."); }
  const goals = (raw as { goals?: unknown } | null)?.goals;
  if (!Array.isArray(goals)) throw new Error("Format backup tidak dikenali: daftar impian tidak ditemukan.");
  return { version: 1, goals: goals.map(normalizeGoal) };
}

function normalizeGoal(x: unknown, i: number): Goal {
  const g = x as Partial<Goal> | null;
  if (!g || typeof g.title !== "string" || typeof g.mainAmount !== "number" || typeof g.startDate !== "string" || typeof g.targetDate !== "string")
    throw new Error(`Impian nomor ${i + 1} rusak atau datanya tidak lengkap.`);
  const freqs: Frequency[] = ["harian", "mingguan", "bulanan"];
  return {
    id: typeof g.id === "string" ? g.id : uid(),
    title: g.title,
    category: CATEGORIES.some((c) => c.id === g.category) ? (g.category as Category) : "lainnya",
    mainAmount: g.mainAmount,
    extras: (Array.isArray(g.extras) ? g.extras : []).filter((e) => e && typeof e.label === "string" && typeof e.amount === "number"),
    startDate: g.startDate,
    targetDate: g.targetDate,
    initialBalance: Number(g.initialBalance) || 0,
    frequency: freqs.includes(g.frequency as Frequency) ? (g.frequency as Frequency) : "bulanan",
    deposits: (Array.isArray(g.deposits) ? g.deposits : []).filter((d) => d && typeof d.amount === "number" && typeof d.date === "string"),
    createdAt: typeof g.createdAt === "string" ? g.createdAt : new Date().toISOString(),
    isSample: g.isSample === true ? true : undefined,
  };
}
