import { NextResponse } from "next/server"
import mariadb from "mariadb"

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
  }

  let conn: mariadb.PoolConnection | undefined
  try {
    const pool = mariadb.createPool(config)
    conn = await pool.getConnection()
    const res = await conn.query("SELECT 1 AS ok, VERSION() AS version")
    await conn.end()
    await pool.end()
    return NextResponse.json({ ok: true, result: res[0] })
  } catch (e) {
    const err = e as Record<string, unknown> & { cause?: unknown }
    const cause = err.cause
      ? typeof cause === "object" && cause !== null
        ? Object.fromEntries(
            Object.entries(cause as Record<string, unknown>).filter(
              ([k]) => !["stack"].includes(k)
            )
          )
        : String(cause)
      : null
    return NextResponse.json({
      ok: false,
      name: err.name,
      code: err.code,
      errno: err.errno,
      message: err.message,
      cause,
    })
  }
}
