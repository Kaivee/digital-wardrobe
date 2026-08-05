import { prisma } from "@/lib/prisma"
import type { WearStatus } from "@/lib/prisma"

export type LaundryResult = {
  status: WearStatus
  triggered: boolean
}

/**
 * Smart Laundry Trigger.
 *
 * An item flips to LAUNDRY once `wearCountSinceWash` reaches its category's
 * `wearLimit`. Marking an item CLEAN (by hand) resets the counter.
 */
export function shouldLaunder(
  wearCountSinceWash: number,
  wearLimit: number
): boolean {
  return wearCountSinceWash >= wearLimit
}

export async function resetWashCounter(itemId: string): Promise<void> {
  await prisma.clothingItem.update({
    where: { id: itemId },
    data: { wearCountSinceWash: 0 },
  })
}

export type LogWearInput = {
  itemId: string
  userId: string
  dateWorn?: Date
  weatherTemp?: number | null
  notes?: string | null
  outfitId?: string | null
}

/**
 * Records a single wear in one transaction:
 *  - inserts the WearLog row
 *  - bumps `wearCount` and `wearCountSinceWash`
 *  - runs the laundry trigger against the item's category threshold
 */
export async function logWearAndTrigger({
  itemId,
  userId,
  dateWorn = new Date(),
  weatherTemp = null,
  notes = null,
  outfitId = null,
}: LogWearInput): Promise<LaundryResult> {
  const item = await prisma.clothingItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { category: true },
  })

  const nextSinceWash = item.wearCountSinceWash + 1
  const triggered = shouldLaunder(nextSinceWash, item.category.wearLimit)
  const status: WearStatus = triggered ? "LAUNDRY" : "CLEAN"

  await prisma.$transaction([
    prisma.wearLog.create({
      data: {
        userId,
        itemId,
        outfitId,
        dateWorn,
        weatherTemp,
        notes,
      },
    }),
    prisma.clothingItem.update({
      where: { id: itemId },
      data: {
        wearCount: { increment: 1 },
        wearCountSinceWash: { increment: 1 },
        status,
      },
    }),
  ])

  return { status, triggered }
}
