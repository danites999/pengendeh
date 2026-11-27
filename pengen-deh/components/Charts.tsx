"use client";
import { useContext, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Goal } from "@/types";
import { categoryTotals, isDone, monthlySeries, shortRp } from "@/lib/calculator";
import { catOf } from "@/lib/categories";
import { PrivacyContext, useRpText } from "./Privacy";

const tick = { fill: "rgb(var(--muted))", fontSize: 11 };

export default function Charts({ goals }: { goals: Goal[] }) {
  const hide = useContext(PrivacyContext);
  const rp = useRpText();
  const pie = useMemo(() => categoryTotals(goals).map((c) => ({ name: catOf(c.category).label, value: c.value, color: catOf(c.category).color })), [goals]);
  const series = useMemo(() => monthlySeries(goals.filter((g) => !isDone(g))), [goals]);

  if (!goals.length) return <div className="card p-6 text-center">Belum ada data buat dibikin grafik. Tambah impian dulu, ya!</div>;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card p-4">
        <h3 className="mb-1 font-display text-lg font-extrabold">Alokasi target per kategori</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" stroke="rgb(var(--line))" strokeWidth={2}>
                {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
              </Pie>
              <Tooltip formatter={(v) => rp(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-4">
        <h3 className="mb-1 font-display text-lg font-extrabold">Proyeksi vs tabungan aktual</h3>
        <p className="mb-2 text-xs text-muted">Gabungan semua target aktif, per bulan.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--muted))" strokeOpacity={0.3} />
              <XAxis dataKey="label" tick={tick} />
              <YAxis tick={tick} width={48} tickFormatter={(v) => (hide ? "•" : shortRp(Number(v)))} />
              <Tooltip formatter={(v) => rp(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="planned" name="Rencana" stroke="#FFB627" strokeWidth={2} strokeDasharray="6 4" fill="#FFB627" fillOpacity={0.2} />
              <Area type="monotone" dataKey="actual" name="Aktual" stroke="#27C3A0" strokeWidth={3} fill="#27C3A0" fillOpacity={0.35} connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
