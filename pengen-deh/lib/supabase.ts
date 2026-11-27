// Klien Supabase + pemetaan username -> email palsu (Supabase Auth mewajibkan email).
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export const validUsername = (u: string) => /^[a-z0-9_.]{3,20}$/.test(u.trim().toLowerCase());
export const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}@pengendeh.app`;
