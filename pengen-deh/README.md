# Pengen Deh 🌟
Personal Wishlist & Budgeting Planner. Next.js (App Router) + TypeScript + Tailwind CSS + Recharts. Data tersimpan di `localStorage` browser, tanpa login.

## Jalankan lokal
```bash
npm install
npm run dev   # buka http://localhost:3000
```
Cek build produksi: `npm run build && npm start`.

## Deploy ke Vercel (gratis)
1. Buat repo kosong di GitHub, lalu dari folder proyek:
   ```bash
   git init && git add . && git commit -m "Pengen Deh"
   git branch -M main
   git remote add origin https://github.com/<username>/pengen-deh.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) → **Add New… → Project** → pilih repo `pengen-deh` (Import).
3. Framework terdeteksi otomatis sebagai Next.js. Biarkan pengaturan default, klik **Deploy**.
4. Selesai. Setiap `git push` ke `main` akan otomatis ter-deploy ulang.

## Struktur
- `app/` halaman & layout · `components/` UI · `types/` tipe data
- `lib/calculator.ts` semua rumus (setoran, estimasi tanggal, jadwal, data grafik)
- `lib/storage.ts` repository/adapter penyimpanan (satu-satunya tempat yang menyentuh `localStorage`)
- `lib/sample.ts` data contoh (bisa dihapus lewat tombol **Hapus Data Contoh**)

## Catatan
- Data hanya ada di browser & perangkat yang dipakai. Gunakan **Pengaturan → Ekspor JSON** untuk backup atau pindah perangkat.
