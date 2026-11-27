// Klien Supabase + pemetaan username -> email palsu (Supabase Auth mewajibkan email).
import { createClient } from "@supabase/supabase-js";

// Ambil hanya origin (https://xxxx.supabase.co) supaya garis miring / path yang kelebihan di env tidak merusak request.
const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/^["']|["']$/g, "");
const url = (() => { try { return new URL(rawUrl).origin; } catch { return rawUrl; } })();

export const supabase = createClient(url, (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim());

export const validUsername = (u: string) => /^[a-z0-9_.]{3,20}$/.test(u.trim().toLowerCase());
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@pengendeh.app`;
