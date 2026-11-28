import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pengen Deh", short_name: "Pengen Deh", description: "Wishlist & planner tabungan.",
    start_url: "/", display: "standalone", lang: "id", background_color: "#F2F4FF", theme_color: "#FFB627",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
