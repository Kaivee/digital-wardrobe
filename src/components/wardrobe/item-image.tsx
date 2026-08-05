import { GarmentIcon, getCategorySlug } from "@/components/shared/garment-icon"
import { cn } from "@/lib/utils"

/**
 * Renders an item's photo when the user uploaded one, falling back to the
 * tinted garment icon so the grid stays readable for items without a photo.
 */
export function ItemImage({
  src,
  category,
  colorHex,
  alt,
  className,
  iconClassName,
}: {
  src?: string | null
  category: string
  colorHex?: string | null
  alt: string
  className?: string
  iconClassName?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("size-full object-cover", className)}
      />
    )
  }

  return (
    <div
      className={cn("flex size-full items-center justify-center", className)}
      style={
        colorHex
          ? { backgroundColor: `color-mix(in oklab, ${colorHex} 18%, transparent)` }
          : undefined
      }
    >
      <GarmentIcon
        category={getCategorySlug(category)}
        className={cn("size-16 text-foreground/80", iconClassName)}
      />
    </div>
  )
}
