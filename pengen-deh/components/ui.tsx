"use client";
import { ReactNode, useEffect } from "react";

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="card max-h-[92dvh] w-full overflow-y-auto rounded-b-none p-5 sm:max-w-2xl sm:rounded-b-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold">{title}</h2>
          <button className="btn !px-3 !py-1" onClick={onClose} aria-label="Tutup">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1 block text-sm font-semibold text-pink">{error}</span>}
    </label>
  );
}

/** Input angka dengan pemisah ribuan (1.500.000). Hanya menerima digit. */
export function NumInput({ value, onChange, placeholder = "0", prefix = "Rp" }: { value: number; onChange: (n: number) => void; placeholder?: string; prefix?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-muted">{prefix}</span>
      <input className="input" inputMode="numeric" placeholder={placeholder}
        value={value ? value.toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 12)) || 0)} />
    </div>
  );
}
