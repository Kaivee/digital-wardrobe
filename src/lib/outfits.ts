import { prisma, type OutfitOccasion } from "@/lib/prisma"

export type CreateOutfitInput = {
  userId: string
  name: string
  occasion: OutfitOccasion
  itemIds: string[]
  notes?: string | null
}

export async function createOutfit({
  userId,
  name,
  occasion,
  itemIds,
  notes = null,
}: CreateOutfitInput) {
  return prisma.outfit.create({
    data: {
      userId,
      name,
      occasion,
      notes,
      items: {
        create: itemIds.map((itemId, index) => ({
          itemId,
          position: index + 1,
        })),
      },
    },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { item: { include: { category: true } } },
      },
    },
  })
}

export async function getOutfitWithItems(outfitId: string) {
  return prisma.outfit.findUnique({
    where: { id: outfitId },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { item: { include: { category: true } } },
      },
    },
  })
}
