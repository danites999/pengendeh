import type { Category } from "@/types";

export const CATEGORIES: { id: Category; label: string; emoji: string; color: string }[] = [
  { id: "traveling", label: "Traveling", emoji: "✈️", color: "#27C3A0" },
  { id: "gadget", label: "Gadget", emoji: "📱", color: "#6C63FF" },
  { id: "konser", label: "Konser", emoji: "🎤", color: "#FF5C8A" },
  { id: "kendaraan", label: "Kendaraan", emoji: "🛵", color: "#FFB627" },
  { id: "darurat", label: "Dana Darurat", emoji: "🛟", color: "#2D9CDB" },
  { id: "hobi", label: "Hobi/Gaming", emoji: "🎮", color: "#9B51E0" },
  { id: "lainnya", label: "Lainnya", emoji: "✨", color: "#8E8BA8" },
];

export const catOf = (id: Category) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
