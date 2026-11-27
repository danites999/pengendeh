// Satu-satunya tempat memilih penyimpanan. Ganti baris di bawah untuk pindah backend.
import type { WishlistRepository } from "./storage";
import { SupabaseRepository } from "./supabaseRepository";

export const repository: WishlistRepository = new SupabaseRepository();
