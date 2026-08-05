import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"
import { recommendOutfit } from "@/lib/recommender"
import { OCCASION_LABELS } from "@/lib/constants"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  const url = new URL(request.url)

  const occasion = String(url.searchParams.get("occasion") ?? "CASUAL")
  if (!(occasion in OCCASION_LABELS)) {
    return NextResponse.json({ error: "Unsupported occasion." }, { status: 400 })
  }

  const limit = Math.max(1, Math.min(12, Number(url.searchParams.get("limit")) || 6))
  const preferColor = url.searchParams.get("color")
  const exclude = url.searchParams.get("exclude")?.split(",").filter(Boolean)

  const recommendations = await recommendOutfit({
    userId: user.id,
    occasion: occasion as keyof typeof OCCASION_LABELS,
    preferColor: preferColor && preferColor !== "any" ? preferColor : null,
    excludeItemIds: exclude,
    limit,
  })

  return NextResponse.json({ occasion, recommendations })
}
