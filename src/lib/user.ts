import { cache } from "react"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { DEMO_USER_EMAIL, DEMO_USER_NAME } from "@/lib/constants"

/**
 * Resolves the active user for the current request.
 *
 * This is a single-user demo: we look up (or lazily create) one demo account so
 * every query can be scoped with `userId`. Swapping in real authentication is a
 * matter of replacing the body of this function with a session/`cookies()` lookup.
 *
 * Calling `headers()` also opts the surrounding route into dynamic rendering,
 * so pages are never prerendered against a cold database.
 */
export const getCurrentUser = cache(async () => {
  await headers()

  let user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_USER_EMAIL,
        name: DEMO_USER_NAME,
      },
    })
  }

  return user
})
