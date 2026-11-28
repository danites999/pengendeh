// Semua perhitungan murni (tanpa efek samping): tanggal, target, setoran, jadwal, data grafik.
import type { Category, Frequency, Goal } from "@/types";

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- Tanggal (format ISO lokal YYYY-MM-DD, aman dari bug zona waktu) ---------- */
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const todayISO = () => toISO(new Date());
export const monthStart = (iso: string) => iso.slice(0, 7) + "-01";
export const diffDays = (a: string, b: string) => Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / DAY);
export const addDays = (iso: string, n: number) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
export function addMonths(iso: string, n: number) {
  const d = parseISO(iso); const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return toISO(d);
}
export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) =>
  parseISO(iso).toLocaleDateString("id-ID", opts);

export const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));

/** 1.250.000 -> "1,3jt", 250.000 -> "250rb" (untuk label sempit). */
export function shortRp(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(".0", "") + "M";
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(".0", "").replace(".", ",") + "jt";
  if (n >= 1e3) return Math.round(n / 1e3) + "rb";
  return String(Math.round(n));
}

/* ---------- Ringkasan target ---------- */
export const totalTarget = (g: Goal) => g.mainAmount + g.extras.reduce((s, e) => s + e.amount, 0);
export const savedAmount = (g: Goal) => g.initialBalance + g.deposits.reduce((s, d) => s + d.amount, 0);
export const remaining = (g: Goal) => Math.max(0, totalTarget(g) - savedAmount(g));
export const isDone = (g: Goal) => totalTarget(g) > 0 && savedAmount(g) >= totalTarget(g);
export const progressPct = (g: Goal) => { const t = totalTarget(g); return t > 0 ? Math.min(100, Math.round((savedAmount(g) / t) * 100)) : 0; };
export const daysLeft = (g: Goal) => diffDays(todayISO(), g.targetDate);

/* ---------- Kalkulator setoran ---------- */
export interface Needs { days: number; weeks: number; months: number; perDay: number; perWeek: number; perMonth: number }

/** Berapa yang harus disisihkan per hari/minggu/bulan untuk menutup `need` dari `from` sampai `to`. */
export function calcNeeds(need: number, from: string, to: string): Needs {
  const days = Math.max(1, diffDays(from, to));
  const weeks = Math.max(1, Math.ceil(days / 7));
  const months = Math.max(1, Math.ceil(days / 30.4375));
  const n = Math.max(0, need);
  return { days, weeks, months, perDay: Math.ceil(n / days), perWeek: Math.ceil(n / weeks), perMonth: Math.ceil(n / months) };
}

/** Kebalikannya: dengan setoran `amount` per periode, kapan target tercapai? */
export function estimateDate(need: number, amount: number, freq: Frequency, from: string): string | null {
  if (amount <= 0) return null;
  if (need <= 0) return from;
  const n = Math.ceil(need / amount);
  return freq === "harian" ? addDays(from, n) : freq === "mingguan" ? addDays(from, n * 7) : addMonths(from, n);
}

/* ---------- Jadwal sisihkan dana ---------- */
export interface ScheduleItem { date: string; amount: number; done: boolean }

export function buildSchedule(g: Goal): ScheduleItem[] {
  const need = Math.max(0, totalTarget(g) - g.initialBalance);
  const nd = calcNeeds(need, g.startDate, g.targetDate);
  const n = g.frequency === "harian" ? nd.days : g.frequency === "mingguan" ? nd.weeks : nd.months;
  const per = Math.ceil(need / n);
  const paid = new Set(g.deposits.filter((d) => d.scheduleDate).map((d) => d.scheduleDate));
  return Array.from({ length: n }, (_, i) => {
    const date = g.frequency === "harian" ? addDays(g.startDate, i) : g.frequency === "mingguan" ? addDays(g.startDate, i * 7) : addMonths(g.startDate, i);
    return { date, amount: i === n - 1 ? Math.max(0, need - per * (n - 1)) : per, done: paid.has(date) };
  });
}

/* ---------- Data grafik ---------- */
const plannedAt = (g: Goal, date: string) => {
  const span = Math.max(1, diffDays(g.startDate, g.targetDate));
  const t = Math.min(1, Math.max(0, diffDays(g.startDate, date) / span));
  return g.initialBalance + (totalTarget(g) - g.initialBalance) * t;
};
const actualAt = (g: Goal, date: string) => g.initialBalance + g.deposits.filter((d) => d.date <= date).reduce((s, d) => s + d.amount, 0);

/** Proyeksi (garis lurus mulai→target) vs aktual, per bulan, gabungan semua target aktif. */
export function monthlySeries(goals: Goal[]) {
  const gs = goals.filter((g) => totalTarget(g) > 0);
  if (!gs.length) return [];
  const first = gs.map((g) => g.startDate).sort()[0];
  const last = gs.map((g) => g.targetDate).sort().reverse()[0];
  const today = todayISO();
  const dates: string[] = [];
  for (let i = 0; i < 60; i++) { const d = addMonths(first, i); if (d >= last) break; dates.push(d); }
  dates.push(last);
  return dates.map((d) => ({
    label: fmtDate(d, { month: "short", year: "2-digit" }),
    planned: Math.round(gs.reduce((s, g) => s + plannedAt(g, d), 0)),
    actual: d <= today ? gs.reduce((s, g) => s + actualAt(g, d), 0) : null,
  }));
}

export function categoryTotals(goals: Goal[]) {
  const map = new Map<Category, number>();
  goals.forEach((g) => map.set(g.category, (map.get(g.category) ?? 0) + totalTarget(g)));
  return [...map.entries()].map(([category, value]) => ({ category, value }));
}

/* ---------- Status "on track" ---------- */
export interface Pace {
  status: "notstarted" | "ahead" | "ontrack" | "behind" | "overdue";
  diff: number; // aktual - seharusnya hari ini (negatif = tertinggal)
  planned: number; // setoran per periode menurut rencana awal
  catchUp: number; // setoran per periode yang dibutuhkan sekarang agar tetap tepat waktu
}

export function paceStatus(g: Goal): Pace {
  const today = todayISO();
  const pick = (n: Needs) => (g.frequency === "harian" ? n.perDay : g.frequency === "mingguan" ? n.perWeek : n.perMonth);
  const planned = pick(calcNeeds(Math.max(0, totalTarget(g) - g.initialBalance), g.startDate, g.targetDate));
  const diff = savedAmount(g) - Math.round(plannedAt(g, today));
  const catchUp = pick(calcNeeds(remaining(g), g.startDate > today ? g.startDate : today, g.targetDate));
  let status: Pace["status"];
  if (today < g.startDate) status = "notstarted";
  else if (today >= g.targetDate && !isDone(g)) status = "overdue";
  else status = diff < -planned * 0.5 ? "behind" : diff > planned ? "ahead" : "ontrack";
  return { status, diff, planned, catchUp };
}

/* ---------- Kapasitas & streak ---------- */
export const monthlyNeed = (g: Goal) => calcNeeds(remaining(g), g.startDate > todayISO() ? g.startDate : todayISO(), g.targetDate).perMonth;

/** Hari berturut-turut ada setoran (dari semua target). Streak tetap hidup selama kemarin ada setoran. */
export function streakInfo(goals: Goal[]) {
  const dates = new Set(goals.flatMap((g) => g.deposits.map((d) => d.date)));
  const today = todayISO();
  const doneToday = dates.has(today);
  let cur = doneToday ? today : addDays(today, -1);
  let streak = 0;
  while (dates.has(cur)) { streak++; cur = addDays(cur, -1); }
  return { streak, doneToday };
}
