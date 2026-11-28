// Service worker minimal agar aplikasi bisa dipasang (installable). Tidak menyimpan cache apa pun.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
