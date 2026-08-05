import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { createOutfit } from "@/lib/outfits"
import { OCCASION_LABELS } from "@/lib/constants"

export const runtime = "nodejs"

export async function GET() {
  const user = await getCurrentUser()
  const outfits = await prisma.outfit.findMany({
    where: { userId: user.id },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: { item: { include: { category: true } } },
      },
      _count: { select: { wearLogs: true } },
    },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(outfits)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  const body = await request.json()

  const name = String(body.name ?? "").trim()
  const occasion = String(body.occasion ?? "CASUAL")
  const itemIds: string[] = Array.isArray(body.itemIds)
    ? body.itemIds.filter((id: unknown) => typeof id === "string")
    : []

  if (!name || itemIds.length === 0) {
    return NextResponse.json(
      { error: "A name and at least one item are required." },
      { status: 400 }
    )
  }
  if (!(occasion in OCCASION_LABELS)) {
    return NextResponse.json(
      { error: "Unsupported occasion." },
      { status: 400 }
    )
  }

  const owned = await prisma.clothingItem.findMany({
    where: { id: { in: itemIds }, userId: user.id },
    select: { id: true },
  })
  if (owned.length !== itemIds.length) {
    return NextResponse.json(
      { error: "One or more items don't belong to you." },
      { status: 400 }
    )
  }

  const outfit = await createOutfit({
    userId: user.id,
    name,
    occasion: occasion as keyof typeof OCCASION_LABELS,
    itemIds,
    notes: body.notes ? String(body.notes).trim() : null,
  })

  return NextResponse.json(outfit, { status: 201 })
}
