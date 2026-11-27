"use client";

type Mode = "masuk" | "daftar";

const FEATURES = [
  { e: "🧾", t: "Rincian biaya lengkap", d: "Tiket, penginapan, ongkos, makan, sampai merchandise. Semua dijumlah otomatis jadi satu total target." },
  { e: "🧮", t: "Setoran dihitung otomatis", d: "Tentukan tanggal target, lalu lihat berapa yang perlu disisihkan per hari, minggu, atau bulan." },
  { e: "🔁", t: "Simulasi dua arah", d: "Ubah nominal setoran dan tanggal tercapai ikut bergeser. Geser tanggalnya, nominalnya menyesuaikan." },
  { e: "🗓", t: "Kalender nabung", d: "Lihat tanggal mana saja kamu harus menyisihkan uang, lalu centang kalau sudah." },
  { e: "📊", t: "Grafik progres", d: "Bandingkan rencana dengan tabungan aktual, plus alokasi target per kategori." },
  { e: "🙈", t: "Privasi & sinkron", d: "Sembunyikan nominal saat di tempat umum. Datamu tersimpan di akun, jadi bisa dibuka dari HP maupun laptop." },
];

const STEPS = [
  { t: "Tulis keinginanmu", d: "Pilih kategori, ketik yang spesifik, lalu isi harga dan biaya pendukungnya." },
  { t: "Tentukan tanggalnya", d: "Pilih kapan mau tercapai. Pengen Deh langsung menghitung setoran yang pas." },
  { t: "Catat sampai tercapai", d: "Tiap menabung, tekan “Catat Tabungan” dan lihat progres barmu naik." },
];

export default function Landing({ onStart }: { onStart: (m: Mode) => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <header className="flex items-center justify-between py-4">
        <div className="font-display text-2xl font-extrabold">Pengen Deh<span className="text-pink">.</span></div>
        <button className="btn" onClick={() => onStart("masuk")}>Masuk</button>
      </header>

      <section className="grid items-center gap-8 py-8 md:grid-cols-[1.2fr_1fr] md:py-14">
        <div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] sm:text-7xl">Pengen apa? Kita hitung nabungnya.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Rencanakan tabungan untuk konser, gadget, liburan, atau apa pun yang kamu incar. Tulis targetnya, pilih tanggalnya,
            dan lihat berapa yang perlu kamu sisihkan tiap hari atau tiap bulan.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button className="btn btn-primary !px-6 !py-3 !text-base" onClick={() => onStart("daftar")}>Mulai gratis</button>
            <button className="text-sm font-semibold underline" onClick={() => onStart("masuk")}>Sudah punya akun? Masuk</button>
          </div>
        </div>

        {/* Contoh tampilan kartu target (statis, hanya ilustrasi) */}
        <div className="card rotate-1 bg-surface p-4" aria-hidden>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-line bg-pink text-xl">🎤</span>
            <div className="flex-1">
              <div className="font-display text-lg font-extrabold leading-tight">Nonton Konser Coldplay di Singapura</div>
              <div className="text-sm text-muted">Konser · target 5 bulan lagi</div>
            </div>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full border-2 border-line bg-bg"><div className="h-full w-[42%] bg-mint" /></div>
          <div className="mt-1.5 flex justify-between text-sm"><span><b>Rp 4.620.000</b> <span className="text-muted">terkumpul</span></span><b>42%</b></div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full border-2 border-line px-2.5 py-1">Rp 72.000/hari</span>
            <span className="rounded-full border-2 border-line px-2.5 py-1">Rp 2.180.000/bulan</span>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Apa yang bisa kamu lakukan</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="card p-4">
              <div className="text-2xl" aria-hidden>{f.e}</div>
              <h3 className="mt-2 font-display text-lg font-extrabold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Caranya gampang</h2>
        <ol className="mt-5 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="card flex gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-line bg-mango font-display font-extrabold text-[#16132e]">{i + 1}</span>
              <div><h3 className="font-display text-lg font-extrabold">{s.t}</h3><p className="mt-1 text-sm text-muted">{s.d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-6 flex flex-col items-start gap-4 bg-mango p-6 text-[#16132e] sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-display text-3xl font-extrabold">Satu setoran hari ini bikin impianmu makin dekat.</h2>
          <p className="mt-1 font-medium">Buat akun dengan username dan password, lalu mulai dari yang paling kamu pengenin.</p>
        </div>
        <button className="btn bg-ink !px-6 !py-3 !text-bg" onClick={() => onStart("daftar")}>Mulai gratis</button>
      </section>

      <footer className="mt-10 space-y-1 text-center text-sm font-medium text-muted">
        <p>Sedikit demi sedikit, lama-lama jadi bukit. 💛</p>
        <p className="font-bold text-ink">Created by Dani</p>
      </footer>
    </div>
  );
}
