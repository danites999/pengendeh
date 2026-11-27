// Data contoh realistis, tanggalnya relatif terhadap hari ini. Ditandai isSample agar bisa dihapus sekaligus.
import type { Goal } from "@/types";
import { addDays, addMonths, todayISO, uid } from "./calculator";

export function makeSampleGoals(): Goal[] {
  const t = todayISO();
  const mk = (p: Omit<Goal, "id" | "createdAt" | "isSample">): Goal => ({ ...p, id: uid(), createdAt: new Date().toISOString(), isSample: true });
  const ex = (label: string, amount: number) => ({ id: uid(), label, amount });
  const dep = (date: string, amount: number) => ({ id: uid(), date, amount });
  return [
    mk({
      title: "Nonton Konser Coldplay di Singapura", category: "konser", mainAmount: 5_000_000,
      extras: [ex("Penginapan", 2_500_000), ex("Tiket pesawat & transportasi", 3_000_000), ex("Makan", 1_000_000), ex("Merchandise", 500_000)],
      startDate: addDays(t, -60), targetDate: addMonths(t, 5), initialBalance: 1_000_000, frequency: "bulanan",
      deposits: [dep(addDays(t, -45), 700_000), dep(addDays(t, -12), 700_000)],
    }),
    mk({
      title: "Rakit PC RTX", category: "gadget", mainAmount: 12_000_000,
      extras: [ex("Monitor", 2_000_000), ex("Keyboard & mouse", 800_000)],
      startDate: addDays(t, -30), targetDate: addMonths(t, 4), initialBalance: 500_000, frequency: "mingguan",
      deposits: [dep(addDays(t, -23), 400_000), dep(addDays(t, -16), 400_000), dep(addDays(t, -9), 400_000)],
    }),
    mk({
      title: "Liburan ke Jepang", category: "traveling", mainAmount: 20_000_000,
      extras: [ex("Penginapan", 6_000_000), ex("Transportasi lokal", 2_000_000), ex("Makan", 4_000_000), ex("Asuransi", 500_000)],
      startDate: addDays(t, -20), targetDate: addMonths(t, 10), initialBalance: 2_000_000, frequency: "bulanan",
      deposits: [dep(addDays(t, -19), 1_500_000)],
    }),
  ];
}
