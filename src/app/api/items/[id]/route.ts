import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export const runtime = "nodejs"

/**
 * PATCH a single item. Handles status changes (e.g. mark clean / send to
 * laundry) and profile edits. Marking an item CLEAN also resets its
 * "wears since wash" counter.
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  const { id } = await context.params
  const body = await request.json()

  const existing = await prisma.clothingItem.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ error: "Item not found." }, { status: 404 })
  }

  const data: {
    name?: string
    description?: string | null
    status?: "CLEAN" | "LAUNDRY" | "ARCHIVED"
    wearCountSinceWash?: number
    formalityScore?: number
    purchasePrice?: number
    imageUrl?: string | null
  } = {}

  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim()
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim() || null
  }
  if (typeof body.status === "string" && ["CLEAN", "LAUNDRY", "ARCHIVED"].includes(body.status)) {
    data.status = body.status as "CLEAN" | "LAUNDRY" | "ARCHIVED"
    if (body.status === "CLEAN") {
      data.wearCountSinceWash = 0
    }
  }
  if (typeof body.formalityScore === "number") {
    data.formalityScore = Math.max(1, Math.min(5, body.formalityScore))
  }
  if (typeof body.purchasePrice === "number") {
    data.purchasePrice = Math.max(0, body.purchasePrice)
  }
  if (typeof body.imageUrl === "string") {
    data.imageUrl = body.imageUrl.trim() || null
  }

  const item = await prisma.clothingItem.update({
    where: { id },
    data,
    include: { category: true },
  })

  return NextResponse.json(item)
}
