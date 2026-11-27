"use client";
import { useState } from "react";
import type { Deposit, Goal } from "@/types";
import { calcNeeds, fmtDate, remaining, todayISO, uid } from "@/lib/calculator";
import { Field, Modal, NumInput } from "./ui";
import { Rp } from "./Privacy";

export default function DepositModal({ goal, onSave, onClose }: { goal: Goal; onSave: (d: Deposit) => void; onClose: () => void }) {
  const today = todayISO();
  const from = goal.startDate > today ? goal.startDate : today;
  const n = calcNeeds(remaining(goal), from, goal.targetDate);
  const suggested = goal.frequency === "harian" ? n.perDay : goal.frequency === "mingguan" ? n.perWeek : n.perMonth;
  const [amount, setAmount] = useState(suggested);
  const [date, setDate] = useState(today);
  const [error, setError] = useState("");

  function submit() {
    if (amount <= 0) return setError("Nominal tabungan harus lebih dari Rp 0.");
    if (!date) return setError("Pilih tanggal setoran.");
    onSave({ id: uid(), date, amount });
  }
  return (
    <Modal title="Catat Tabungan" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{goal.title} · sisa <b className="text-ink"><Rp value={remaining(goal)} /></b></p>
        <Field label="Nominal yang disisihkan" error={error}><NumInput value={amount} onChange={(v) => { setAmount(v); setError(""); }} /></Field>
        <Field label="Tanggal"><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <p className="text-xs text-muted">Dicatat untuk {fmtDate(date || today)}.</p>
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={submit}>Simpan tabungan</button>
        </div>
      </div>
    </Modal>
  );
}
