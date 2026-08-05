import { Prisma } from "@/generated/prisma/client"
import { prisma, type ClothingItem, type Category, type OutfitOccasion } from "@/lib/prisma"
import { OCCASION_FORMALITY } from "@/lib/constants"

export type ItemWithCategory = ClothingItem & { category: Category }

export type Recommendation = {
  top: ItemWithCategory
  bottom: ItemWithCategory
  footwear: ItemWithCategory
  outerwear: ItemWithCategory | null
  accessories: ItemWithCategory[]
  score: number
  colorTotal: number
  formalityTotal: number
  freshnessTotal: number
}

export type RecommendInput = {
  userId: string
  occasion: OutfitOccasion
  preferColor?: string | null
  excludeItemIds?: string[]
  limit?: number
}

type SlotRow = {
  top_id: string
  bottom_id: string
  footwear_id: string
  outer_id: string | null
  tb_score: number
  bf_score: number
  to_score: number
  color_total: number
  formality_total: number
}

async function getCategoryId(slug: string): Promise<string> {
  const category = await prisma.category.findUniqueOrThrow({
    where: { slug },
    select: { id: true },
  })
  return category.id
}

/**
 * Deterministic Outfit Recommender.
 *
 * The heavy lifting happens in a single parameterised SQL statement: it filters
 * every CLEAN top / bottom / footwear into the requested occasion's formality
 * band, then cross-joins the slots and requires every colour pair to score
 * >= 7 / 10 in the COLOR_COMPATIBILITY matrix using MySQL/MariaDB LEAST and
 * GREATEST to hit the normalised pair key. No AI, no randomness — the same
 * wardrobe always yields the same outfits.
 */
export async function recommendOutfit({
  userId,
  occasion,
  preferColor = null,
  excludeItemIds = [],
  limit = 6,
}: RecommendInput): Promise<Recommendation[]> {
  const [topCatId, bottomCatId, footwearCatId, outerCatId] = await Promise.all([
    getCategoryId("topwear"),
    getCategoryId("bottomwear"),
    getCategoryId("footwear"),
    getCategoryId("outerwear"),
  ])

  const [bandMin, bandMax] = OCCASION_FORMALITY[occasion]

  const excludeClause =
    excludeItemIds.length > 0
      ? Prisma.sql`AND id NOT IN (${Prisma.join(excludeItemIds)})`
      : Prisma.sql``

  const slot = (categoryId: string) =>
    Prisma.sql`(
      SELECT id, color, formalityScore, wearCountSinceWash
      FROM ClothingItem
      WHERE userId = ${userId}
        AND status = 'CLEAN'
        AND categoryId = ${categoryId}
        AND formalityScore BETWEEN ${bandMin} AND ${bandMax}
        ${excludeClause}
    )`

  const rows = await prisma.$queryRaw<SlotRow[]>`
    WITH tops AS ${slot(topCatId)},
         bottoms AS ${slot(bottomCatId)},
         footwear AS ${slot(footwearCatId)},
         outerwear AS ${slot(outerCatId)}
    SELECT
      t.id   AS top_id,
      b.id   AS bottom_id,
      f.id   AS footwear_id,
      o.id   AS outer_id,
      cc_tb.score AS tb_score,
      cc_bf.score AS bf_score,
      COALESCE(cc_to.score, 0) AS to_score,
      cc_tb.score + cc_bf.score + COALESCE(cc_to.score, 0) AS color_total,
      t.formalityScore + b.formalityScore + f.formalityScore AS formality_total
    FROM tops t
    JOIN bottoms b ON 1=1
    JOIN footwear f ON 1=1
    LEFT JOIN outerwear o ON 1=1
    JOIN ColorCompatibility cc_tb
      ON cc_tb.color1 = LEAST(t.color, b.color)
     AND cc_tb.color2 = GREATEST(t.color, b.color)
     AND cc_tb.score >= 7
    JOIN ColorCompatibility cc_bf
      ON cc_bf.color1 = LEAST(b.color, f.color)
     AND cc_bf.color2 = GREATEST(b.color, f.color)
     AND cc_bf.score >= 7
    LEFT JOIN ColorCompatibility cc_to
      ON cc_to.color1 = LEAST(t.color, o.color)
     AND cc_to.color2 = GREATEST(t.color, o.color)
     AND cc_to.score >= 7
    WHERE o.id IS NULL OR cc_to.score >= 7
    ORDER BY color_total DESC, formality_total ASC
    LIMIT ${limit * 4}
  `

  if (rows.length === 0) return []

  const itemIds = Array.from(
    new Set(
      rows.flatMap((row) => [
        row.top_id,
        row.bottom_id,
        row.footwear_id,
        ...(row.outer_id ? [row.outer_id] : []),
      ])
    )
  )

  const [items, accessories] = await Promise.all([
    prisma.clothingItem.findMany({
      where: { id: { in: itemIds } },
      include: { category: true },
    }),
    prisma.clothingItem.findMany({
      where: {
        userId,
        status: "CLEAN",
        category: { slug: "accessories" },
        formalityScore: { gte: bandMin, lte: bandMax },
      },
      include: { category: true },
      orderBy: { wearCountSinceWash: "asc" },
      take: 4,
    }),
  ])

  const itemsById = new Map(items.map((item) => [item.id, item]))
  const targetCenter = (bandMin + bandMax) / 2

  const scoreRow = (row: SlotRow): Recommendation => {
    const top = itemsById.get(row.top_id)
    const bottom = itemsById.get(row.bottom_id)
    const footwear = itemsById.get(row.footwear_id)
    const outerwear = row.outer_id ? itemsById.get(row.outer_id) ?? null : null
    if (!top || !bottom || !footwear) return null as unknown as Recommendation

    const formalityTotal = top.formalityScore + bottom.formalityScore + footwear.formalityScore
    const freshnessTotal =
      top.wearCountSinceWash + bottom.wearCountSinceWash + footwear.wearCountSinceWash

    const formalityBonus = Math.max(
      0,
      6 - Math.abs(targetCenter * 3 - formalityTotal) * 0.5
    )
    const freshnessBonus = 3 / (freshnessTotal + 1)
    const preferBonus = [top, bottom, footwear, outerwear]
      .filter((item): item is ItemWithCategory => item !== null)
      .filter((item) => preferColor && item.color === preferColor).length * 1.5

    return {
      top,
      bottom,
      footwear,
      outerwear,
      accessories: accessories.slice(0, 2),
      score: Math.round((row.color_total + formalityBonus + freshnessBonus + preferBonus) * 100) / 100,
      colorTotal: row.color_total,
      formalityTotal,
      freshnessTotal,
    }
  }

  return rows
    .map(scoreRow)
    .filter((r) => r !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
