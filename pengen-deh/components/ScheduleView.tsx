"use client";
import { useContext, useMemo, useState } from "react";
import type { Goal } from "@/types";
import { ScheduleItem, addMonths, buildSchedule, fmtDate, monthStart, parseISO, shortRp, todayISO } from "@/lib/calculator";
import { PrivacyContext, Rp } from "./Privacy";

const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function ScheduleView({ goals, onToggle }: { goals: Goal[]; onToggle: (goalId: string, item: ScheduleItem) => void }) {
  const hide = useContext(PrivacyContext);
  const clamp = (g?: Goal) => { const t = todayISO(); return !g ? t : t < g.startDate ? g.startDate : t > g.targetDate ? g.targetDate : t; };
  const [id, setId] = useState(goals[0]?.id ?? "");
  const goal = goals.find((g) => g.id === id) ?? goals[0];
  const [month, setMonth] = useState(() => monthStart(clamp(goals[0])));
  const items = useMemo(() => (goal ? buildSchedule(goal) : []), [goal]);

  if (!goal) return <div className="card p-6 text-center">Belum ada impian aktif. Tambahkan dulu di tab Semua Impian, nanti jadwal nabungnya muncul di sini.</div>;

  const byDate = new Map(items.map((i) => [i.date, i]));
  const first = parseISO(month);
  const offset = (first.getDay() + 6) % 7;
  const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => `${month.slice(0, 8)}${String(i + 1).padStart(2, "0")}`)] as (string | null)[];
  const monthItems = items.filter((i) => i.date.startsWith(month.slice(0, 7)));
  const doneCount = items.filter((i) => i.done).length;
  const today = todayISO();

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3 p-4">
        <select className="input !w-auto min-w-0 flex-1 font-bold" value={goal.id} aria-label="Pilih impian"
          onChange={(e) => { setId(e.target.value); setMonth(monthStart(clamp(goals.find((g) => g.id === e.target.value)))); }}>
          {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
        <span className="text-sm font-semibold">{doneCount}/{items.length} setoran tercatat</span>
      </div>

      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <button className="btn !px-3" onClick={() => setMonth(addMonths(month, -1))} aria-label="Bulan sebelumnya">‹</button>
          <h3 className="font-display text-xl font-extrabold capitalize">{fmtDate(month, { month: "long", year: "numeric" })}</h3>
          <button className="btn !px-3" onClick={() => setMonth(addMonths(month, 1))} aria-label="Bulan berikutnya">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted">{DOW.map((d) => <div key={d}>{d}</div>)}</div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const item = byDate.get(iso);
            const base = "flex aspect-square flex-col items-center justify-center rounded-lg border-2 text-xs sm:text-sm";
            if (!item) return <div key={i} className={`${base} border-transparent ${iso === today ? "!border-pink" : ""}`}>{Number(iso.slice(8))}</div>;
            return (
              <button key={i} onClick={() => onToggle(goal.id, item)} aria-pressed={item.done}
                aria-label={`${fmtDate(iso)}: ${item.done ? "sudah" : "belum"} disetor`}
                className={`${base} border-line font-bold ${item.done ? "bg-mint text-[#16132e]" : "bg-mango/40"} ${iso === today ? "ring-2 ring-pink" : ""}`}>
                <span>{Number(iso.slice(8))}</span>
                <span className="text-[10px] font-semibold leading-none">{item.done ? "✓" : hide ? "•••" : shortRp(item.amount)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="mb-2 font-display text-lg font-extrabold">Jadwal bulan ini</h3>
        {monthItems.length === 0 ? <p className="text-sm text-muted">Tidak ada jadwal setoran di bulan ini.</p> : (
          <ul className="divide-y-2 divide-dashed divide-line/40">
            {monthItems.map((it) => (
              <li key={it.date}>
                <label className="flex cursor-pointer items-center gap-3 py-2.5">
                  <input type="checkbox" className="h-5 w-5 accent-[#27c3a0]" checked={it.done} onChange={() => onToggle(goal.id, it)} />
                  <span className={`flex-1 ${it.done ? "text-muted line-through" : ""}`}>{fmtDate(it.date, { weekday: "short", day: "numeric", month: "short" })}</span>
                  <b><Rp value={it.amount} /></b>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
