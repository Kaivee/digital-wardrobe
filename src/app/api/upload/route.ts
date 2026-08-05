import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { getCurrentUser } from "@/lib/user"

export const runtime = "nodejs"

const MAX_SIZE = 8 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
}

export async function POST(request: Request) {
  await getCurrentUser()

  const form = await request.formData()
  const file = form.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  const extension = EXTENSIONS[file.type]
  if (!extension) {
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
  const filename = `${randomUUID()}.${extension}`
  const directory = path.join(process.cwd(), "public", "uploads")
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, filename), bytes)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
