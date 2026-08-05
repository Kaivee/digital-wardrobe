import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { logWearAndTrigger } from "@/lib/laundry"

export const runtime = "nodejs"

/**
 * Logs a wear for one item and runs the Smart Laundry Trigger.
 */
export async function POST(
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

  const dateWorn = body.dateWorn ? new Date(String(body.dateWorn)) : new Date()
  const weatherTemp =
    body.weatherTemp == null || body.weatherTemp === ""
      ? null
      : Math.max(-40, Math.min(60, Number(body.weatherTemp)))
  const notes = body.notes ? String(body.notes).trim() : null
  const outfitId = body.outfitId ? String(body.outfitId) : null

  const result = await logWearAndTrigger({
    itemId: id,
    userId: user.id,
    dateWorn,
    weatherTemp,
    notes,
    outfitId,
  })

  return NextResponse.json({ ok: true, ...result }, { status: 201 })
}
