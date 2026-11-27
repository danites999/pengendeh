"use client";
import { useRef } from "react";

interface Props {
  dark: boolean; hasSample: boolean;
  onToggleDark: () => void; onExport: () => void; onImport: (file: File) => void;
  onClearSample: () => void; onReset: () => void;
}

export default function SettingsView({ dark, hasSample, onToggleDark, onExport, onImport, onClearSample, onReset }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const Row = ({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) => (
    <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 className="font-display text-lg font-extrabold">{title}</h3><p className="text-sm text-muted">{desc}</p></div>
      <div className="shrink-0">{children}</div>
    </div>
  );
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Row title="Tampilan" desc="Ganti antara mode terang dan gelap."><button className="btn" onClick={onToggleDark}>{dark ? "☀️ Mode terang" : "🌙 Mode gelap"}</button></Row>
      <Row title="Backup data" desc="Unduh semua impian dan setoran sebagai file JSON, atau pulihkan dari backup.">
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={onExport}>Ekspor JSON</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Impor JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ""; }} />
        </div>
      </Row>
      {hasSample && <Row title="Data contoh" desc="Hapus semua impian contoh sekaligus. Impianmu sendiri aman."><button className="btn" onClick={onClearSample}>Hapus Data Contoh</button></Row>}
      <Row title="Reset semua" desc="Hapus seluruh data di perangkat ini. Sebaiknya ekspor dulu."><button className="btn btn-danger" onClick={onReset}>Reset data</button></Row>
    </div>
  );
}
