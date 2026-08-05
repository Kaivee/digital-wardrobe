import { COLORS, type ColorSpec } from "@/lib/constants"

/**
 * Colour-wheel harmony scoring.
 *
 * Every pair of colours is collapsed to two scalars that drive the score:
 *  - hue distance around the wheel (0 = identical hue, 1 = opposite / complementary)
 *  - lightness contrast (how strongly the two surfaces separate)
 *
 * Classic harmony archetypes map onto hue distance bands:
 *  - analogous (≈0.06–0.25 of the wheel)      → strong harmony
 *  - triadic   (≈0.33)                        → balanced
 *  - split-complementary (≈0.65–0.8)          → lively but refined
 *  - complementary (≈0.95–1)                  → maximal contrast
 *  - arbitrary mid (≈0.45–0.6)                → weakest
 *
 * Achromatic neutrals (black, charcoal, gray, silver, white) read with
 * everything, so they default to a high score before the hue rules run.
 */

const NEUTRAL_COLORS = new Set(["black", "charcoal", "gray", "silver", "white"])

function clampScore(value: number): number {
  return Math.max(1, Math.min(10, Math.round(value)))
}

export function scoreColorPair(colorA: string, colorB: string): number {
  if (colorA === colorB) {
    return 7 // monochrome pairing reads as intentional
  }

  const a: ColorSpec | undefined = COLORS[colorA]
  const b: ColorSpec | undefined = COLORS[colorB]

  // Unknown colours fall back to a permissive neutral.
  if (!a || !b) return 7

  const aNeutral = NEUTRAL_COLORS.has(colorA)
  const bNeutral = NEUTRAL_COLORS.has(colorB)

  if (aNeutral || bNeutral) {
    // Two neutrals together are flat; a neutral beside a colour is safe.
    if (aNeutral && bNeutral) return 7
    return 9
  }

  let hueDistance = Math.abs(a.hue - b.hue)
  hueDistance = Math.min(hueDistance, 360 - hueDistance) / 180

  let score: number
  if (hueDistance <= 0.25) {
    score = 8.5 // analogous
  } else if (hueDistance <= 0.4) {
    score = 7.5
  } else if (hueDistance <= 0.55) {
    score = 5.5 // arbitrary mid-wheel
  } else if (hueDistance <= 0.75) {
    score = 6.5 // split-complementary
  } else {
    score = 8.5 // complementary
  }

  // Lightness contrast elevates or drags a pairing.
  const contrast = Math.abs(a.lightness - b.lightness)
  if (contrast >= 0.35) {
    score += 0.75
  } else if (contrast < 0.15 && a.lightness > 0.25 && a.lightness < 0.75) {
    score -= 0.75
  }

  // Two loud, high-chroma colours compete unless the wheel already pairs them.
  if (a.saturation > 0.4 && b.saturation > 0.4 && hueDistance > 0.3 && hueDistance < 0.75) {
    score -= 0.5
  }

  return clampScore(score)
}

export function normalizeColorPair(colorA: string, colorB: string): [string, string] {
  return colorA < colorB ? [colorA, colorB] : [colorB, colorA]
}
