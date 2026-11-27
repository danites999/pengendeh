"use client";
import type { Goal } from "@/types";
import { calcNeeds, daysLeft, fmtDate, isDone, progressPct, remaining, savedAmount, todayISO, totalTarget } from "@/lib/calculator";
import { catOf } from "@/lib/categories";
import { Rp } from "./Privacy";

interface Props { goal: Goal; onDeposit: () => void; onEdit: () => void; onDelete: () => void; onRemoveDeposit: (id: string) => void }

export default function GoalCard({ goal, onDeposit, onEdit, onDelete, onRemoveDeposit }: Props) {
  const cat = catOf(goal.category);
  const done = isDone(goal);
  const pct = progressPct(goal);
  const left = daysLeft(goal);
  const today = todayISO();
  const n = calcNeeds(remaining(goal), goal.startDate > today ? goal.startDate : today, goal.targetDate);
  const countdown = done ? "🎉 Tercapai!" : left < 0 ? `Lewat ${-left} hari` : left === 0 ? "Hari ini batasnya!" : `${left} hari lagi`;

  return (
    <article className="card flex flex-col gap-3 p-4">
      <header className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-line text-xl" style={{ background: cat.color }} aria-hidden>{cat.emoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-extrabold leading-tight">{goal.title}</h3>
          <p className="text-sm text-muted">{cat.label} · target {fmtDate(goal.targetDate, { day: "numeric", month: "short", year: "numeric" })}</p>
        </div>
        <span className={`shrink-0 rounded-full border-2 border-line px-2.5 py-0.5 text-xs font-bold ${done ? "bg-mint text-[#16132e]" : left < 0 ? "bg-pink text-white" : "bg-mango text-[#16132e]"}`}>{countdown}</span>
      </header>

      <div>
        <div className="h-4 overflow-hidden rounded-full border-2 border-line bg-bg" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progres ${pct}%`}>
          <div className="h-full bg-mint transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-sm">
          <span><b><Rp value={savedAmount(goal)} /></b> <span className="text-muted">terkumpul</span></span>
          <span className="font-bold">{pct}%</span>
        </div>
        <div className="text-sm text-muted">dari <Rp value={totalTarget(goal)} />{goal.extras.length > 0 && ` (termasuk ${goal.extras.length} rincian tambahan)`}</div>
      </div>

      {!done && (
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full border-2 border-line px-2.5 py-1"><Rp value={n.perDay} />/hari</span>
          <span className="rounded-full border-2 border-line px-2.5 py-1"><Rp value={n.perMonth} />/bulan</span>
        </div>
      )}

      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">Rincian & riwayat setoran</summary>
        <ul className="mt-2 space-y-1">
          <li className="flex justify-between"><span>Nominal utama</span><Rp value={goal.mainAmount} /></li>
          {goal.extras.map((x) => <li key={x.id} className="flex justify-between"><span>{x.label}</span><Rp value={x.amount} /></li>)}
          {goal.initialBalance > 0 && <li className="flex justify-between text-muted"><span>Saldo awal</span><Rp value={goal.initialBalance} /></li>}
        </ul>
        <ul className="mt-3 space-y-1 border-t-2 border-dashed border-line pt-2">
          {goal.deposits.length === 0 && <li className="text-muted">Belum ada setoran. Yuk mulai!</li>}
          {[...goal.deposits].sort((a, b) => b.date.localeCompare(a.date)).map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2">
              <span>{fmtDate(d.date, { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="flex items-center gap-2"><b><Rp value={d.amount} /></b>
                <button className="text-muted hover:text-pink" aria-label="Hapus setoran" onClick={() => onRemoveDeposit(d.id)}>✕</button></span>
            </li>
          ))}
        </ul>
      </details>

      <footer className="mt-auto flex gap-2">
        <button className="btn btn-primary flex-1" onClick={onDeposit}>+ Catat Tabungan</button>
        <button className="btn" onClick={onEdit} aria-label="Edit impian">✏️</button>
        <button className="btn" onClick={onDelete} aria-label="Hapus impian">🗑</button>
      </footer>
    </article>
  );
}
