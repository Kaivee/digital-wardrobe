import Link from "next/link"
import { AppNav } from "@/components/app/app-nav"
import { AddItemDialog } from "@/components/wardrobe/add-item-dialog"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"

export async function AppHeader() {
  const user = await getCurrentUser()
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  })

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-baseline gap-2"
            aria-label="Atelier home"
          >
            <span className="font-heading text-lg font-semibold tracking-tight">
              Atelier
            </span>
            <span className="micro-label hidden text-muted-foreground sm:inline">
              {user.name ?? "Wardrobe"}
            </span>
          </Link>
          <AppNav />
        </div>
        <AddItemDialog categories={categories} />
      </div>
    </header>
  )
}
