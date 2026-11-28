// Adapter Supabase: satu baris per pengguna di tabel `wishlists`, isinya seluruh AppData (JSON).
// Error dilempar (bukan ditelan) supaya UI bisa menampilkan penyebab kalau gagal simpan/muat.
import type { AppData } from "@/types";
import { parseBackup, type WishlistRepository } from "./storage";
import { supabase } from "./supabase";

export class SupabaseRepository implements WishlistRepository {
  private async uid() { return (await supabase.auth.getUser()).data.user?.id ?? null; }

  async load() {
    const id = await this.uid(); if (!id) return null;
    const { data, error } = await supabase.from("wishlists").select("data").eq("user_id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? parseBackup(JSON.stringify(data.data)) : null;
  }
  async save(d: AppData) {
    const id = await this.uid(); if (!id) throw new Error("Sesi login tidak ditemukan.");
    const { error } = await supabase.from("wishlists").upsert({ user_id: id, data: d, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
  }
  async clear() {
    const id = await this.uid(); if (!id) return;
    const { error } = await supabase.from("wishlists").delete().eq("user_id", id);
    if (error) throw new Error(error.message);
  }
}
