"use client";
import type { Goal } from "@/types";
import { diffDays, fmtDate, totalTarget } from "@/lib/calculator";
import { catOf } from "@/lib/categories";
import { Rp } from "./Privacy";

export default function HistoryView({ goals, onUndo, onDelete }: { goals: Goal[]; onUndo: (id: string) => void; onDelete: (g: Goal) => void }) {
  const list = [...goals].sort((a, b) => (b.purchasedAt ?? "").localeCompare(a.purchasedAt ?? ""));
  if (!list.length) return <div className="card p-6 text-center">Belum ada riwayat. Setelah targetmu tercapai dan kamu tandai “sudah dibeli”, impian itu pindah ke sini.</div>;
  const spent = list.reduce((s, g) => s + totalTarget(g), 0);
  return (
    <div className="space-y-4">
      <div className="card p-4"><span className="text-sm text-muted">Impian yang sudah terwujud</span>
        <div className="font-display text-2xl font-extrabold">{list.length} impian · <Rp value={spent} /></div></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((g) => {
          const c = catOf(g.category);
          return (
            <article key={g.id} className="card flex flex-col gap-3 p-4">
              <header className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-line text-xl" style={{ background: c.color }} aria-hidden>{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-extrabold leading-tight">{g.title}</h3>
                  <p className="text-sm text-muted">{c.label} · dibeli {fmtDate(g.purchasedAt!)}</p>
                </div>
                <span className="shrink-0 rounded-full border-2 border-line bg-mint px-2.5 py-0.5 text-xs font-bold text-[#16132e]">✅ Dibeli</span>
              </header>
              <div className="text-sm"><b><Rp value={totalTarget(g)} /></b> <span className="text-muted">· menabung selama {Math.max(0, diffDays(g.startDate, g.purchasedAt!))} hari{g.extras.length > 0 && `, termasuk ${g.extras.length} rincian tambahan`}</span></div>
              <footer className="mt-auto flex gap-2">
                <button className="btn flex-1" onClick={() => onUndo(g.id)}>Batalkan status dibeli</button>
                <button className="btn" onClick={() => onDelete(g)} aria-label="Hapus dari riwayat">🗑</button>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
