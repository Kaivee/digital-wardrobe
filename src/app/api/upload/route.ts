import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/user"

export const runtime = "nodejs"

const MAX_SIZE = 8 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

export async function POST(request: Request) {
  await getCurrentUser()

  const form = await request.formData()
  const file = form.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, GIF and AVIF images are allowed." },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image must be under 8 MB." },
      { status: 400 }
    )
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const base64 = bytes.toString("base64")
  const dataUrl = `data:${file.type};base64,${base64}`

  return NextResponse.json({ url: dataUrl })
}
