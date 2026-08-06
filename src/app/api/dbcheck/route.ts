import { NextResponse } from "next/server"
import { createPool, type Pool } from "mariadb"

function serializeError(e: unknown) {
  const err = e as Record<string, unknown>
  const rawCause = err.cause
  const cause =
    rawCause && typeof rawCause === "object"
      ? Object.fromEntries(
          Object.entries(rawCause as Record<string, unknown>).filter(
            ([k]) => !["stack"].includes(k)
          )
        )
      : rawCause !== undefined
        ? String(rawCause)
        : null
  return {
    name: err.name,
    code: err.code,
    errno: err.errno,
    message: err.message,
    cause,
  }
}

export async function GET() {
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ ok: false, error: "no DATABASE_URL" })

  const parsed = new URL(url)
  const config = {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: parsed.pathname.replace(/^\//, ""),
    ssl: parsed.searchParams.get("ssl") === "true",
    connectionLimit: 1,
    connectTimeout: 20000,
    socketTimeout: 20000,
  }

  let pool: Pool | undefined
  try {
    pool = createPool(config)
    const conn = await pool.getConnection()
    const res = await conn.query("SELECT 1 AS ok, VERSION() AS version")
    await conn.end()
    await pool.end()
    return NextResponse.json({ ok: true, result: res[0] })
  } catch (e) {
    if (pool) await pool.end().catch(() => undefined)
    return NextResponse.json({ ok: false, ...serializeError(e) })
  }
}
