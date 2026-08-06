import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "@/generated/prisma/client"

export type {
  ClothingItem,
  Category,
  Outfit,
  OutfitItem,
  WearLog,
  ColorCompatibility,
  User,
} from "@/generated/prisma/client"

export {
  PatternType,
  WearStatus,
  OutfitOccasion,
} from "@/generated/prisma/client"

export type * from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

function parseMysqlUrl(url: string) {
  // Parse mysql://user:password@host:port/database
  const parsed = new URL(url)
  const sslParam = parsed.searchParams.get("ssl")
  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: parsed.pathname.replace(/^\//, ""),
    connectionLimit: 5,
    connectTimeout: 30000,
    acquireTimeout: 60000,
    ssl: sslParam === "true" || sslParam === "1",
  }
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is missing. Copy .env.example to .env and set a MySQL connection string."
    )
  }
  const adapter = new PrismaMariaDb(parseMysqlUrl(connectionString))
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
