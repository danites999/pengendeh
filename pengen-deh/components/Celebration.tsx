"use client";
import type { Goal } from "@/types";
import { diffDays, todayISO, totalTarget } from "@/lib/calculator";
import { Modal } from "./ui";
import { Rp } from "./Privacy";

const COLORS = ["#FFB627", "#FF5C8A", "#27C3A0", "#6C63FF"];

export default function Celebration({ goal, onPurchase, onClose }: { goal: Goal; onPurchase: () => void; onClose: () => void }) {
  const days = Math.max(0, diffDays(goal.startDate, todayISO()));
  return (
    <Modal title="Target tercapai!" onClose={onClose}>
      <div className="relative overflow-hidden py-2 text-center">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 28 }, (_, i) => (
            <span key={i} className="confetti" style={{ left: `${(i * 37) % 100}%`, background: COLORS[i % 4], animationDelay: `${(i % 7) * 0.15}s`, animationDuration: `${2.2 + (i % 5) * 0.4}s` }} />
          ))}
        </div>
        <div className="text-6xl" aria-hidden>🎉</div>
        <h3 className="mt-2 font-display text-3xl font-extrabold">Selamat! {goal.title} tercapai.</h3>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Kamu berhasil mengumpulkan <b className="text-ink"><Rp value={totalTarget(goal)} /></b> dalam {days} hari. Konsistensimu terbayar.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button className="btn btn-primary" onClick={onPurchase}>✅ Tandai sudah dibeli</button>
          <button className="btn" onClick={onClose}>Nanti dulu</button>
        </div>
      </div>
    </Modal>
  );
}
