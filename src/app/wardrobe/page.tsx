import type { Metadata } from "next"
import { Suspense } from "react"
import { Shirt } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { PageHeader } from "@/components/shared/page-header"
import { WardrobeFilters } from "@/components/wardrobe/wardrobe-filters"
import { ItemCard, ItemCardSkeleton } from "@/components/wardrobe/item-card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AddItemDialog } from "@/components/wardrobe/add-item-dialog"

export const metadata: Metadata = {
  title: "Wardrobe",
  description: "Browse and manage every item in your wardrobe.",
}

type WardrobeSearchParams = {
  status?: string
  category?: string
  q?: string
}

export default async function WardrobePage({
  searchParams,
}: {
  searchParams: Promise<WardrobeSearchParams>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.clothingItem.findMany({
      where: {
        userId: user.id,
        ...(params.status && ["CLEAN", "LAUNDRY", "ARCHIVED"].includes(params.status)
          ? { status: params.status as "CLEAN" | "LAUNDRY" | "ARCHIVED" }
          : {}),
        ...(params.category
          ? { category: { slug: params.category } }
          : {}),
        ...(params.q
          ? {
              OR: [
                { name: { contains: params.q } },
                { description: { contains: params.q } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Inventory"
        title="The wardrobe"
        description="Every piece you own, its wear count, and its true cost-per-wear."
        actions={<AddItemDialog categories={categories} />}
      />

      <WardrobeFilters categories={categories} />

      <Suspense fallback={<ItemGridSkeleton />}>
        {items.length === 0 ? (
          <Empty className="min-h-72">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Shirt aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Nothing here yet</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>
                {params.q || params.category || params.status !== "all"
                  ? "No items match those filters. Try widening them."
                  : "Your wardrobe is empty. Add a first piece to start tracking cost-per-wear."}
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  )
}

function ItemGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <ItemCardSkeleton key={index} />
      ))}
    </div>
  )
}
