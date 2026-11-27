"use client";
import { createContext, useContext } from "react";

/** true = mode privasi aktif, nominal disamarkan. */
export const PrivacyContext = createContext(false);

export const formatRp = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
export const useRpText = () => { const hide = useContext(PrivacyContext); return (n: number) => (hide ? "Rp •••••••" : formatRp(n)); };

export function Rp({ value }: { value: number }) {
  const text = useRpText();
  return <>{text(value)}</>;
}
