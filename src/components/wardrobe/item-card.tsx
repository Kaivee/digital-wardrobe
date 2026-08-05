import Link from "next/link"
import { StatusBadge } from "@/components/wardrobe/status-badge"
import { ColorSwatch } from "@/components/wardrobe/color-swatch"
import { ItemImage } from "@/components/wardrobe/item-image"
import { costPerWear, formatMoney } from "@/lib/cpw"
import { cn } from "@/lib/utils"
import type { ClothingItem, Category } from "@/lib/prisma"

type Item = ClothingItem & { category: Category }

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link
      href={`/wardrobe/${item.id}`}
      className="group flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border bg-muted/40">
        <ItemImage
          src={item.imageUrl}
          category={item.category.name}
          colorHex={item.colorHex}
          alt={`${item.name} photo`}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.category.name} · <span className="capitalize">{item.color}</span>
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <div className="flex items-center justify-between">
          <ColorSwatch color={item.color} withLabel />
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {item.wearCount === 0
              ? "Unworn"
              : `${formatMoney(costPerWear(item.purchasePrice, item.wearCount))}/wear`}
          </p>
        </div>
      </div>
    </Link>
  )
}

export function ItemCardSkeleton() {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4",
        "animate-pulse"
      )}
    >
      <div className="aspect-[4/5] rounded-md bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
    </div>
  )
}
