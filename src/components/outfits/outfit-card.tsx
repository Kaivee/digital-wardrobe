import { getCategorySlug, GarmentIcon } from "@/components/shared/garment-icon"
import { StatusBadge } from "@/components/wardrobe/status-badge"
import { OCCASION_LABELS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Outfit, OutfitItem, ClothingItem, Category } from "@/lib/prisma"

type OutfitWithItems = Outfit & {
  items: (OutfitItem & {
    item: ClothingItem & { category: Category }
  })[]
  _count: { wearLogs: number }
}

export function OutfitCard({ outfit }: { outfit: OutfitWithItems }) {
  const occasionLabel = OCCASION_LABELS[outfit.occasion]
  const laundryCount = outfit.items.filter(
    ({ item }) => item.status === "LAUNDRY"
  ).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="micro-label text-muted-foreground">{occasionLabel}</p>
            <CardTitle>{outfit.name}</CardTitle>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            {outfit._count.wearLogs} wears
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {outfit.items.map(({ item }) => (
            <span
              key={item.id}
              title={item.name}
              className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
            >
              <GarmentIcon
                category={getCategorySlug(item.category.name)}
                className="size-3.5"
              />
              <span className="max-w-28 truncate">{item.name}</span>
              <span
                className="size-2 rounded-full ring-1 ring-foreground/10"
                style={{ backgroundColor: item.colorHex }}
                aria-hidden
              />
            </span>
          ))}
        </div>
        {outfit.notes ? (
          <p className="text-sm text-muted-foreground">{outfit.notes}</p>
        ) : null}
        {laundryCount > 0 ? (
          <div className="flex items-center gap-2">
            <StatusBadge status="LAUNDRY" />
            <span className="text-xs text-muted-foreground">
              {laundryCount} piece{laundryCount === 1 ? "" : "s"} need washing
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
