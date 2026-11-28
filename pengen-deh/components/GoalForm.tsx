"use client";
import { useMemo, useState } from "react";
import type { Category, CostItem, Frequency, Goal } from "@/types";
import { CATEGORIES } from "@/lib/categories";
import { calcNeeds, estimateDate, fmtDate, todayISO, uid } from "@/lib/calculator";
import { Field, Modal, NumInput } from "./ui";
import { Rp } from "./Privacy";

interface Props {
  goal?: Goal; // ada = mode edit
  preset?: { category: Category; title: string };
  onSave: (g: Goal) => void;
  onClose: () => void;
}
const SUGGEST = ["Penginapan", "Transportasi", "Makan", "Merchandise", "Asuransi"];
const UNIT: Record<Frequency, string> = { harian: "hari", mingguan: "minggu", bulanan: "bulan" };

export default function GoalForm({ goal, preset, onSave, onClose }: Props) {
  const [title, setTitle] = useState(goal?.title ?? preset?.title ?? "");
  const [category, setCategory] = useState<Category>(goal?.category ?? preset?.category ?? "lainnya");
  const [main, setMain] = useState(goal?.mainAmount ?? 0);
  const [extras, setExtras] = useState<CostItem[]>(goal?.extras ?? []);
  const [start, setStart] = useState(goal?.startDate ?? todayISO());
  const [target, setTarget] = useState(goal?.targetDate ?? "");
  const [initialBal, setInitialBal] = useState(goal?.initialBalance ?? 0);
  const [freq, setFreq] = useState<Frequency>(goal?.frequency ?? "bulanan");
  const [custom, setCustom] = useState<number | null>(null); // nominal setoran yang diketik manual
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = main + extras.reduce((s, x) => s + x.amount, 0);
  const need = Math.max(0, total - initialBal);
  const valid = !!target && target > start;
  const needs = useMemo(() => (valid ? calcNeeds(need, start, target) : null), [valid, need, start, target]);
  const perFreq = needs ? (freq === "harian" ? needs.perDay : freq === "mingguan" ? needs.perWeek : needs.perMonth) : 0;
  const shown = custom ?? perFreq;

  // Simulasi dua arah: ubah nominal -> tanggal menyesuaikan; ubah tanggal -> nominal menyesuaikan.
  const changeAmount = (v: number) => { setCustom(v); const d = estimateDate(need, v, freq, start); if (d) setTarget(d); };
  const changeTarget = (v: string) => { setTarget(v); setCustom(null); };
  const changeFreq = (f: Frequency) => { setFreq(f); setCustom(null); };

  const setExtra = (id: string, patch: Partial<CostItem>) => setExtras((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  function submit() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Tulis dulu keinginanmu ya.";
    if (main <= 0) e.main = "Nominal utama harus lebih dari Rp 0.";
    extras.forEach((x) => {
      if (!x.label.trim()) e[`l${x.id}`] = "Beri nama biayanya.";
      if (x.amount <= 0) e[`a${x.id}`] = "Isi nominalnya.";
    });
    if (!start) e.start = "Pilih tanggal mulai menabung.";
    if (!target) e.target = "Pilih tanggal target tercapai.";
    else if (target <= start) e.target = "Tanggal target harus setelah tanggal mulai.";
    if (initialBal > total) e.init = "Saldo awal tidak boleh melebihi total target.";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: goal?.id ?? uid(), title: title.trim(), category, mainAmount: main, extras: extras.map((x) => ({ ...x, label: x.label.trim() })),
      startDate: start, targetDate: target, initialBalance: initialBal, frequency: freq,
      deposits: goal?.deposits ?? [], createdAt: goal?.createdAt ?? new Date().toISOString(), purchasedAt: goal?.purchasedAt,
    });
  }

  return (
    <Modal title={goal ? "Edit Impian" : "Impian Baru"} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" className="pill" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
              <span aria-hidden>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        <Field label="Kamu pengen apa?" error={errors.title}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mis. Nonton Konser Coldplay di Singapura" />
        </Field>
        <Field label="Nominal utama (mis. harga tiket)" error={errors.main}>
          <NumInput value={main} onChange={setMain} />
        </Field>

        <div>
          <div className="mb-2 text-sm font-bold">Estimasi kebutuhan lain</div>
          <div className="space-y-3">
            {extras.map((x) => (
              <div key={x.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <input className="input" aria-label="Nama biaya" placeholder="Nama biaya" value={x.label} onChange={(e) => setExtra(x.id, { label: e.target.value })} />
                  {errors[`l${x.id}`] && <span role="alert" className="text-sm font-semibold text-pink">{errors[`l${x.id}`]}</span>}
                </div>
                <button type="button" className="btn !px-3 sm:order-last" aria-label={`Hapus ${x.label || "biaya"}`} onClick={() => setExtras((xs) => xs.filter((y) => y.id !== x.id))}>🗑</button>
                <div className="col-span-2 sm:col-span-1">
                  <NumInput value={x.amount} onChange={(n) => setExtra(x.id, { amount: n })} />
                  {errors[`a${x.id}`] && <span role="alert" className="text-sm font-semibold text-pink">{errors[`a${x.id}`]}</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGEST.map((s) => (
              <button key={s} type="button" className="pill !py-1" onClick={() => setExtras((xs) => [...xs, { id: uid(), label: s, amount: 0 }])}>+ {s}</button>
            ))}
            <button type="button" className="pill !py-1" onClick={() => setExtras((xs) => [...xs, { id: uid(), label: "", amount: 0 }])}>+ Lainnya</button>
          </div>
          <div className="mt-4 rounded-xl border-2 border-line bg-mango p-3 text-[#16132e]">
            <div className="text-sm font-semibold">Total Target Anggaran</div>
            <div className="font-display text-2xl font-extrabold"><Rp value={total} /></div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Mulai menabung" error={errors.start}><input type="date" className="input" value={start} onChange={(e) => { setStart(e.target.value); setCustom(null); }} /></Field>
          <Field label="Target tercapai" error={errors.target}><input type="date" className="input" value={target} onChange={(e) => changeTarget(e.target.value)} /></Field>
          <Field label="Saldo awal" error={errors.init}><NumInput value={initialBal} onChange={setInitialBal} /></Field>
        </div>

        <div>
          <div className="mb-2 text-sm font-bold">Mau nabung seberapa sering?</div>
          <div className="flex gap-2">
            {(["harian", "mingguan", "bulanan"] as Frequency[]).map((f) => (
              <button key={f} type="button" className="pill capitalize" aria-pressed={freq === f} onClick={() => changeFreq(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="card space-y-3 p-4">
          {needs ? (
            <>
              <p className="text-sm">
                Sisihkan <b><Rp value={needs.perDay} /></b> per hari, atau <b><Rp value={needs.perMonth} /></b> per bulan
                <span className="text-muted"> ({needs.days} hari menuju target)</span>.
              </p>
              <Field label={`Atau atur sendiri setoran per ${UNIT[freq]}`}>
                <NumInput value={shown} onChange={changeAmount} />
              </Field>
              {custom !== null && valid && (
                <p className="text-sm font-semibold text-mint">Dengan ritme ini, target tercapai sekitar {fmtDate(target)}.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Pilih tanggal target untuk melihat hitungan setoranmu.</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn btn-primary" onClick={submit}>{goal ? "Simpan perubahan" : "Simpan impian"}</button>
        </div>
      </div>
    </Modal>
  );
}
