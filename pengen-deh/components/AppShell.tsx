"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppData, Category, Deposit, Goal } from "@/types";
import { ScheduleItem, isDone, remaining, savedAmount, todayISO, totalTarget, uid } from "@/lib/calculator";
import { CATEGORIES } from "@/lib/categories";
import { makeSampleGoals } from "@/lib/sample";
import { parseBackup, prefs, serialize } from "@/lib/storage";
import { repository } from "@/lib/repository";
import { PrivacyContext, Rp } from "./Privacy";
import GoalForm from "./GoalForm";
import GoalCard from "./GoalCard";
import DepositModal from "./DepositModal";
import ScheduleView from "./ScheduleView";
import Charts from "./Charts";
import SettingsView from "./SettingsView";

type Tab = "impian" | "kalender" | "statistik" | "pengaturan";
const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "impian", label: "Semua Impian", emoji: "🌟" }, { id: "kalender", label: "Kalender Nabung", emoji: "🗓" },
  { id: "statistik", label: "Statistik", emoji: "📊" }, { id: "pengaturan", label: "Pengaturan", emoji: "⚙️" },
];

export default function AppShell() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("impian");
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState<{ goal?: Goal; preset?: { category: Category; title: string } } | null>(null);
  const [depositFor, setDepositFor] = useState<Goal | null>(null);
  const [cat, setCat] = useState<Category | null>(null);
  const [wish, setWish] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    (async () => {
      let data = await repository.load();
      if (!data) { data = { version: 1, goals: makeSampleGoals() }; await repository.save(data); } // pertama kali: isi data contoh
      setGoals(data.goals); setHidden(prefs.getHidden()); setDark(document.documentElement.classList.contains("dark")); setLoaded(true);
    })();
  }, []);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const commit = useCallback((next: Goal[]) => { setGoals(next); const d: AppData = { version: 1, goals: next }; void repository.save(d); }, []);
  const patch = (id: string, fn: (g: Goal) => Goal) => commit(goals.map((g) => (g.id === id ? fn(g) : g)));

  const saveGoal = (g: Goal) => { commit(goals.some((x) => x.id === g.id) ? goals.map((x) => (x.id === g.id ? g : x)) : [g, ...goals]); setForm(null); flash("Impian tersimpan 🎉"); };
  const addDeposit = (id: string, d: Deposit) => { patch(id, (g) => ({ ...g, deposits: [...g.deposits, d] })); setDepositFor(null); flash("Tabungan tercatat. Mantap!"); };
  const toggleSchedule = (id: string, item: ScheduleItem) => patch(id, (g) => ({
    ...g,
    deposits: item.done ? g.deposits.filter((d) => d.scheduleDate !== item.date)
      : [...g.deposits, { id: uid(), date: todayISO(), amount: item.amount, scheduleDate: item.date }],
  }));
  const del = (g: Goal) => { if (confirm(`Hapus impian "${g.title}"? Riwayat setorannya ikut terhapus.`)) commit(goals.filter((x) => x.id !== g.id)); };

  const toggleDark = () => { const v = !dark; document.documentElement.classList.toggle("dark", v); prefs.setTheme(v); setDark(v); };
  const toggleHidden = () => { prefs.setHidden(!hidden); setHidden(!hidden); };

  function exportJSON() {
    const url = URL.createObjectURL(new Blob([serialize({ version: 1, goals })], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `pengen-deh-backup-${todayISO()}.json`; a.click(); URL.revokeObjectURL(url);
  }
  async function importJSON(file: File) {
    try {
      const data = parseBackup(await file.text());
      if (!confirm(`Impor ${data.goals.length} impian? Data di perangkat ini akan diganti.`)) return;
      commit(data.goals); flash("Backup berhasil diimpor.");
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal membaca file backup."); }
  }

  const active = useMemo(() => goals.filter((g) => !isDone(g)), [goals]);
  const finished = useMemo(() => goals.filter(isDone), [goals]);
  const sum = useMemo(() => ({
    target: goals.reduce((s, g) => s + totalTarget(g), 0), saved: goals.reduce((s, g) => s + savedAmount(g), 0),
    left: goals.reduce((s, g) => s + remaining(g), 0),
  }), [goals]);

  if (!loaded) return <div className="grid min-h-dvh place-items-center font-display text-xl font-bold">Sebentar ya…</div>;

  const nav = (cls: string) => (
    <nav aria-label="Navigasi utama" className={cls}>
      {TABS.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-xs font-bold md:flex-none md:flex-row md:gap-2 md:px-4 md:text-sm ${tab === t.id ? "bg-ink text-bg" : "hover:bg-mango/30"}`}>
          <span aria-hidden>{t.emoji}</span>{t.label}
        </button>
      ))}
    </nav>
  );

  return (
    <PrivacyContext.Provider value={hidden}>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-10">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="font-display text-2xl font-extrabold">Pengen Deh<span className="text-pink">.</span></div>
          {nav("hidden gap-1 md:flex")}
          <div className="flex gap-2">
            <button className="btn" onClick={toggleHidden} aria-pressed={hidden}>{hidden ? "🙈" : "👁️"}<span className="hidden sm:inline">{hidden ? "Tampilkan nominal" : "Sembunyikan nominal"}</span></button>
            <button className="btn" onClick={toggleDark} aria-label="Ganti mode terang/gelap">{dark ? "☀️" : "🌙"}</button>
          </div>
        </header>

        {tab === "impian" && (
          <div className="space-y-6">
            <section className="card bg-mango p-5 text-[#16132e] sm:p-8">
              <h1 className="font-display text-4xl font-extrabold sm:text-6xl">Mau Apa ya?</h1>
              <p className="mt-1 max-w-xl font-medium">Pilih jenisnya, ketik yang spesifik, lalu kita hitung nabungnya bareng.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button key={c.id} className="pill" aria-pressed={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}><span aria-hidden>{c.emoji}</span>{c.label}</button>
                ))}
              </div>
              <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); setForm({ preset: { category: cat ?? "lainnya", title: wish.trim() } }); setWish(""); }}>
                <input className="input !bg-white !text-[#16132e]" value={wish} onChange={(e) => setWish(e.target.value)} aria-label="Keinginanmu" placeholder="Mis. Liburan ke Jepang, Rakit PC RTX…" />
                <button className="btn bg-ink !text-bg sm:shrink-0">Rencanakan!</button>
              </form>
            </section>

            {goals.some((g) => g.isSample) && (
              <div className="card flex flex-wrap items-center justify-between gap-2 bg-mint/20 p-3 text-sm font-medium">
                Ini data contoh biar kamu kebayang. Bebas diutak-atik.
                <button className="btn" onClick={() => { commit(goals.filter((g) => !g.isSample)); flash("Data contoh dihapus."); }}>Hapus Data Contoh</button>
              </div>
            )}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Ringkasan">
              {[
                { l: "Total semua target", v: <Rp value={sum.target} /> }, { l: "Uang terkumpul", v: <Rp value={sum.saved} /> },
                { l: "Sisa yang harus dikumpulkan", v: <Rp value={sum.left} /> }, { l: "Target aktif / tercapai", v: `${active.length} / ${finished.length}` },
              ].map((c) => (
                <div key={c.l} className="card p-3 sm:p-4"><div className="text-xs font-semibold text-muted sm:text-sm">{c.l}</div><div className="mt-1 break-words font-display text-lg font-extrabold sm:text-2xl">{c.v}</div></div>
              ))}
            </section>

            <section>
              <h2 className="mb-3 font-display text-2xl font-extrabold">Wishlist Aktif</h2>
              {active.length === 0 ? <div className="card p-6 text-center">Belum ada impian aktif. Ketik keinginanmu di atas untuk mulai.</div> : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {active.map((g) => <GoalCard key={g.id} goal={g} onDeposit={() => setDepositFor(g)} onEdit={() => setForm({ goal: g })} onDelete={() => del(g)}
                    onRemoveDeposit={(id) => patch(g.id, (x) => ({ ...x, deposits: x.deposits.filter((d) => d.id !== id) }))} />)}
                </div>
              )}
            </section>

            {finished.length > 0 && (
              <section>
                <h2 className="mb-3 font-display text-2xl font-extrabold">Sudah Tercapai 🎉</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {finished.map((g) => <GoalCard key={g.id} goal={g} onDeposit={() => setDepositFor(g)} onEdit={() => setForm({ goal: g })} onDelete={() => del(g)}
                    onRemoveDeposit={(id) => patch(g.id, (x) => ({ ...x, deposits: x.deposits.filter((d) => d.id !== id) }))} />)}
                </div>
              </section>
            )}
          </div>
        )}

        {tab === "kalender" && <ScheduleView goals={active} onToggle={toggleSchedule} />}
        {tab === "statistik" && <Charts goals={goals} />}
        {tab === "pengaturan" && (
          <SettingsView dark={dark} hasSample={goals.some((g) => g.isSample)} onToggleDark={toggleDark} onExport={exportJSON} onImport={importJSON}
            onClearSample={() => { commit(goals.filter((g) => !g.isSample)); flash("Data contoh dihapus."); }}
            onReset={() => { if (confirm("Hapus SEMUA data di perangkat ini? Ini tidak bisa dibatalkan.")) { commit([]); flash("Semua data dihapus."); } }} />
        )}

        <footer className="mt-10 text-center text-sm font-medium text-muted">Sedikit demi sedikit, lama-lama jadi bukit. Satu setoran hari ini bikin impianmu makin dekat. 💛</footer>
      </div>

      {nav("fixed inset-x-0 bottom-0 z-40 flex gap-1 border-t-2 border-line bg-surface p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden")}

      {toast && <div role="status" className="card fixed bottom-24 left-1/2 z-50 -translate-x-1/2 bg-mint px-4 py-2 text-sm font-bold text-[#16132e] md:bottom-6">{toast}</div>}
      {form && <GoalForm key={form.goal?.id ?? "baru"} goal={form.goal} preset={form.preset} onSave={saveGoal} onClose={() => setForm(null)} />}
      {depositFor && <DepositModal goal={depositFor} onSave={(d) => addDeposit(depositFor.id, d)} onClose={() => setDepositFor(null)} />}
    </PrivacyContext.Provider>
  );
}
