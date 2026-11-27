// Adapter Supabase: satu baris per pengguna di tabel `wishlists`, isinya seluruh AppData (JSON).
import type { AppData } from "@/types";
import { parseBackup, type WishlistRepository } from "./storage";
import { supabase } from "./supabase";

export class SupabaseRepository implements WishlistRepository {
  private async uid() { return (await supabase.auth.getUser()).data.user?.id ?? null; }

  async load() {
    const id = await this.uid(); if (!id) return null;
    const { data } = await supabase.from("wishlists").select("data").eq("user_id", id).maybeSingle();
    return data ? parseBackup(JSON.stringify(data.data)) : null;
  }
  async save(d: AppData) {
    const id = await this.uid(); if (!id) return;
    await supabase.from("wishlists").upsert({ user_id: id, data: d, updated_at: new Date().toISOString() });
  }
  async clear() {
    const id = await this.uid(); if (!id) return;
    await supabase.from("wishlists").delete().eq("user_id", id);
  }
}
