"use client";
import { useState } from "react";
import type { Goal } from "@/types";
import { estimateDate, fmtDate, monthlyNeed, remaining, todayISO } from "@/lib/calculator";
import { Rp } from "./Privacy";
import { NumInput } from "./ui";

interface Props { goals: Goal[]; capacity: number; onSaveCapacity: (n: number) => void; onMove: (id: string, dir: -1 | 1) => void }

export default function CapacityPanel({ goals, capacity, onSaveCapacity, onMove }: Props) {
  const [value, setValue] = useState(capacity);
  const today = todayISO();
  const needs = goals.map((g) => ({ g, m: monthlyNeed(g) }));
  const totalNeed = needs.reduce((s, x) => s + x.m, 0);
  let left = capacity;
  const rows = needs.map(({ g, m }) => { const alloc = Math.min(m, left); left -= alloc; return { g, m, alloc }; });
  const gap = totalNeed - capacity;

  return (
    <section className="card space-y-4 p-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Kapasitas Nabung</h2>
        <p className="text-sm text-muted">Berapa maksimal yang bisa kamu sisihkan per bulan untuk semua impian? Target paling atas didahulukan.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block"><span className="mb-1 block text-sm font-bold">Kemampuan nabung per bulan</span>
          <NumInput value={value} onChange={setValue} onBlur={() => value !== capacity && onSaveCapacity(value)} /></label>
        <div className="text-sm"><span className="text-muted">Total kebutuhan semua target:</span> <b><Rp value={totalNeed} />/bulan</b></div>
      </div>

      {capacity > 0 && (
        <p className={`rounded-xl border-2 border-line px-3 py-2 text-sm font-semibold ${gap <= 0 ? "bg-mint/20" : "bg-pink/20"}`}>
          {gap <= 0 ? <>✅ Aman. Kebutuhanmu masih di bawah kapasitas, sisa <Rp value={-gap} />/bulan.</>
            : <>⚠️ Kurang <Rp value={gap} />/bulan. Atur urutan prioritas, naikkan kapasitas, atau geser tanggal target.</>}
        </p>
      )}

      <ul className="divide-y-2 divide-dashed divide-line/40">
        {rows.map(({ g, m, alloc }, i) => (
          <li key={g.id} className="flex items-center gap-3 py-2.5">
            <div className="flex flex-col">
              <button className="btn !px-2 !py-0 text-xs" disabled={i === 0} onClick={() => onMove(g.id, -1)} aria-label={`Naikkan prioritas ${g.title}`}>▲</button>
              <button className="btn mt-1 !px-2 !py-0 text-xs" disabled={i === rows.length - 1} onClick={() => onMove(g.id, 1)} aria-label={`Turunkan prioritas ${g.title}`}>▼</button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{i + 1}. {g.title}</div>
              <div className="text-sm text-muted">
                Butuh <Rp value={m} />/bulan
                {capacity > 0 && (alloc >= m ? <span className="font-semibold text-mint"> · aman</span>
                  : alloc > 0 ? <span className="font-semibold text-pink"> · hanya <Rp value={alloc} />/bulan kebagian, tercapai sekitar {fmtDate(estimateDate(remaining(g), alloc, "bulanan", today) ?? today)}</span>
                  : <span className="font-semibold text-pink"> · belum kebagian dana</span>)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
