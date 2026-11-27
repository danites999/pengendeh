"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AppShell from "./AppShell";
import Landing from "./Landing";
import LoginScreen from "./LoginScreen";

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<"landing" | "masuk" | "daftar">("landing");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="grid min-h-dvh place-items-center font-display text-xl font-bold">Sebentar ya…</div>;
  if (!session) {
    return view === "landing"
      ? <Landing onStart={setView} />
      : <LoginScreen key={view} initialMode={view} onBack={() => setView("landing")} />;
  }
  return (
    <AppShell
      key={session.user.id}
      username={session.user.email?.split("@")[0]}
      onLogout={() => { void supabase.auth.signOut(); setView("landing"); }}
    />
  );
}
