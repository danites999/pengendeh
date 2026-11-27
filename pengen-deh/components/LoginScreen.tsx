"use client";
import { useState, type FormEvent } from "react";
import { supabase, usernameToEmail, validUsername } from "@/lib/supabase";

const translate = (m: string) =>
  /invalid login/i.test(m) ? "Username atau password salah." :
  /already registered/i.test(m) ? "Username sudah dipakai. Coba yang lain, atau pilih Masuk." :
  `Gagal: ${m}`;

export default function LoginScreen() {
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setError("");
    if (!validUsername(username)) return setError("Username 3–20 karakter: huruf, angka, titik, atau underscore.");
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    setBusy(true);
    const creds = { email: usernameToEmail(username), password };
    if (mode === "daftar") {
      const { data, error: err } = await supabase.auth.signUp(creds);
      if (err) setError(translate(err.message));
      else if (!data.session) setError("Akun dibuat, tapi Supabase masih meminta konfirmasi email. Matikan “Confirm email” di pengaturan Supabase.");
    } else {
      const { error: err } = await supabase.auth.signInWithPassword(creds);
      if (err) setError(translate(err.message));
    }
    setBusy(false);
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="font-display text-4xl font-extrabold">Pengen Deh<span className="text-pink">.</span></h1>
          <p className="mt-1 text-sm text-muted">{mode === "masuk" ? "Masuk biar impianmu muncul di semua perangkat." : "Buat akun baru, cukup username dan password."}</p>
        </div>
        <label className="block"><span className="mb-1 block text-sm font-bold">Username</span>
          <input className="input" autoCapitalize="none" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="mis. budi_nabung" /></label>
        <label className="block"><span className="mb-1 block text-sm font-bold">Password</span>
          <input className="input" type="password" autoComplete={mode === "masuk" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p role="alert" className="text-sm font-semibold text-pink">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sebentar…" : mode === "masuk" ? "Masuk" : "Daftar"}</button>
        <button type="button" className="w-full text-sm font-semibold underline" onClick={() => { setMode(mode === "masuk" ? "daftar" : "masuk"); setError(""); }}>
          {mode === "masuk" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </form>
    </main>
  );
}
