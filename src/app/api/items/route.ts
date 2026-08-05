import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { COLORS } from "@/lib/constants"
import type { WearStatus, PatternType } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const user = await getCurrentUser()
  const body = await request.json()

  const name = String(body.name ?? "").trim()
  const categoryId = String(body.categoryId ?? "").trim()

  if (!name || !categoryId) {
    return NextResponse.json({ error: "Name and category are required." }, { status: 400 })
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } })
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 })
  }

  const color = String(body.color ?? "charcoal")
  const colorHex = COLORS[color]?.hex ?? "#C9C4BA"

  const status: WearStatus = ["CLEAN", "LAUNDRY", "ARCHIVED"].includes(body.status)
    ? body.status
    : "CLEAN"

  const pattern: PatternType = [
    "SOLID",
    "STRIPED",
    "CHECKED",
    "FLORAL",
    "GRAPHIC",
    "TEXTURED",
    "OTHER",
  ].includes(body.pattern)
    ? body.pattern
    : "SOLID"

  const formalityScore = Math.max(1, Math.min(5, Number(body.formalityScore) || 3))
  const purchasePrice = Math.max(0, Number(body.purchasePrice) || 0)

  const item = await prisma.clothingItem.create({
    data: {
      userId: user.id,
      categoryId: category.id,
      name,
      description: body.description ? String(body.description).trim() : null,
      color,
      colorHex,
      pattern,
      formalityScore,
      status,
      purchasePrice,
      imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
