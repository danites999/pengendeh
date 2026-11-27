"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import AppShell from "./AppShell";
import LoginScreen from "./LoginScreen";

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="grid min-h-dvh place-items-center font-display text-xl font-bold">Sebentar ya…</div>;
  if (!session) return <LoginScreen />;
  return (
    <>
      <AppShell key={session.user.id} />
      <div className="pb-24 text-center text-xs text-muted md:pb-8">
        Masuk sebagai <b>{session.user.email?.split("@")[0]}</b> · <button className="underline" onClick={() => supabase.auth.signOut()}>Keluar</button>
      </div>
    </>
  );
}
