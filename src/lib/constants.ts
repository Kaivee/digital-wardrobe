import type { OutfitOccasion } from "@/generated/prisma/client"

export const DEMO_USER_EMAIL = "demo@atelier.local"
export const DEMO_USER_NAME = "Avery Stone"

export type CategorySeed = {
  name: string
  slug: string
  wearLimit: number
  sortOrder: number
}

export const CATEGORIES: CategorySeed[] = [
  { name: "Topwear", slug: "topwear", wearLimit: 2, sortOrder: 1 },
  { name: "Bottomwear", slug: "bottomwear", wearLimit: 3, sortOrder: 2 },
  { name: "Outerwear", slug: "outerwear", wearLimit: 4, sortOrder: 3 },
  { name: "Footwear", slug: "footwear", wearLimit: 5, sortOrder: 4 },
  { name: "Accessories", slug: "accessories", wearLimit: 4, sortOrder: 5 },
]

export type ColorSpec = {
  hex: string
  hue: number
  saturation: number
  lightness: number
}

export const COLORS: Record<string, ColorSpec> = {
  black: { hex: "#1f1e1c", hue: 40, saturation: 0.04, lightness: 0.12 },
  charcoal: { hex: "#41403c", hue: 40, saturation: 0.04, lightness: 0.27 },
  gray: { hex: "#8d8b87", hue: 40, saturation: 0.04, lightness: 0.54 },
  silver: { hex: "#c3c1bc", hue: 40, saturation: 0.05, lightness: 0.75 },
  white: { hex: "#f4f2ee", hue: 45, saturation: 0.06, lightness: 0.94 },
  cream: { hex: "#efe7d6", hue: 43, saturation: 0.38, lightness: 0.89 },
  beige: { hex: "#d5c5a5", hue: 38, saturation: 0.35, lightness: 0.74 },
  camel: { hex: "#bd9668", hue: 32, saturation: 0.39, lightness: 0.57 },
  brown: { hex: "#6d4f3a", hue: 26, saturation: 0.31, lightness: 0.33 },
  olive: { hex: "#6c7035", hue: 63, saturation: 0.36, lightness: 0.32 },
  sage: { hex: "#8f9a7c", hue: 86, saturation: 0.13, lightness: 0.55 },
  forest: { hex: "#3e5540", hue: 126, saturation: 0.15, lightness: 0.29 },
  navy: { hex: "#26314f", hue: 228, saturation: 0.35, lightness: 0.23 },
  royal: { hex: "#3d5a9e", hue: 222, saturation: 0.44, lightness: 0.43 },
  lightblue: { hex: "#a9c6dd", hue: 207, saturation: 0.42, lightness: 0.76 },
  teal: { hex: "#3f7d78", hue: 176, saturation: 0.33, lightness: 0.37 },
  mustard: { hex: "#b5943e", hue: 45, saturation: 0.49, lightness: 0.47 },
  rust: { hex: "#b05f38", hue: 20, saturation: 0.51, lightness: 0.45 },
  terracotta: { hex: "#c17763", hue: 12, saturation: 0.43, lightness: 0.57 },
  maroon: { hex: "#6f2f2f", hue: 0, saturation: 0.4, lightness: 0.31 },
  burgundy: { hex: "#7c2230", hue: 350, saturation: 0.57, lightness: 0.31 },
  blush: { hex: "#e9c5bd", hue: 10, saturation: 0.5, lightness: 0.82 },
  lavender: { hex: "#b3a9c7", hue: 262, saturation: 0.22, lightness: 0.72 },
  purple: { hex: "#6c5a8e", hue: 260, saturation: 0.22, lightness: 0.45 },
}

export const OCCASION_LABELS: Record<OutfitOccasion, string> = {
  CASUAL: "Casual",
  SMART_CASUAL: "Smart casual",
  WORK: "Work",
  FORMAL: "Formal",
  DATE_NIGHT: "Date night",
  ACTIVE: "Active",
}

export const OCCASION_FORMALITY: Record<OutfitOccasion, [number, number]> = {
  CASUAL: [1, 2],
  SMART_CASUAL: [2, 3],
  WORK: [3, 4],
  FORMAL: [4, 5],
  DATE_NIGHT: [3, 4],
  ACTIVE: [1, 2],
}

export const PATTERN_LABELS: Record<string, string> = {
  SOLID: "Solid",
  STRIPED: "Striped",
  CHECKED: "Checked",
  FLORAL: "Floral",
  GRAPHIC: "Graphic",
  TEXTURED: "Textured",
  OTHER: "Other",
}

export const FORMALITY_LABELS: Record<number, string> = {
  1: "Laid back",
  2: "Relaxed",
  3: "Neutral",
  4: "Sharp",
  5: "Formal",
}
