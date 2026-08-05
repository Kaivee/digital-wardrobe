import { cn } from "@/lib/utils"

const ICON_PATHS: Record<string, string> = {
  tops: "M12 3.5c-1.5 0-1.5.9-3 .9s-1.5-.9-3-.9c-1.2 0-2.2 1.2-1.7 2.4.5 1.2 1.6 1.6 2 2.1.4.5.6 1.3.9 3.1h9.6c.3-1.8.5-2.6.9-3.1.4-.5 1.5-.9 2-2.1.5-1.2-.5-2.4-1.7-2.4-1.5 0-1.5.9-3 .9s-1.5-.9-3-.9ZM9.5 12h5l-.6 8.5h-3.8L9.5 12Z",
  topwear: "M12 3.5c-1.5 0-1.5.9-3 .9s-1.5-.9-3-.9c-1.2 0-2.2 1.2-1.7 2.4.5 1.2 1.6 1.6 2 2.1.4.5.6 1.3.9 3.1h9.6c.3-1.8.5-2.6.9-3.1.4-.5 1.5-.9 2-2.1.5-1.2-.5-2.4-1.7-2.4-1.5 0-1.5.9-3 .9s-1.5-.9-3-.9ZM9.5 12h5l-.6 8.5h-3.8L9.5 12Z",
  bottoms:
    "M8 3.5c0 3 .4 7 .7 9.5.2 1.6.5 2.5 1.2 3.6l1.2 1.9 1.1-2.6c.5-1.4.6-2.6.7-4.6V3.5M8 3.5c0-1.2 1.8-1.2 4 0M8 3.5h8M8 3.5c2.7.2 5.3.2 8 0M8 6h8",
  bottomwear:
    "M8 3.5c0 3 .4 7 .7 9.5.2 1.6.5 2.5 1.2 3.6l1.2 1.9 1.1-2.6c.5-1.4.6-2.6.7-4.6V3.5M8 3.5c0-1.2 1.8-1.2 4 0M8 3.5h8M8 3.5c2.7.2 5.3.2 8 0M8 6h8",
  footwear:
    "M4.5 12.5c0 3 1.5 4.5 4 4.5h4.5c2 0 3-.6 3.2-2 .2-1.4-1.4-2-1.4-2.6 0-1 1.2-1.4 1.2-2.6 0-1.8-1.2-3.2-3.4-3.2H8c-2 .1-3.5 2.1-3.5 5.9ZM5 17c0 1 .6 2 1.6 2H14",
  outerwear:
    "M12 3.5c-2.6 0-4 2-4.6 4.5-.3 1.2-.5 2.7-.8 4l-2.1 9.5c-.2.9.5 1.5 1.4 1.2l4.1-1.6c.6-.2 1-.8.9-1.4L11 14c.6-.2 1.3-.4 2 0l.1 5.7c0 .6.4 1.2 1 1.4l4 1.6c.9.3 1.6-.3 1.4-1.2l-2.1-9.5c-.3-1.3-.5-2.8-.8-4C16 5.5 14.6 3.5 12 3.5ZM12 3.5v10",
  accessories:
    "M12 6.5c-2.5 0-4.5 1.2-4.5 3 0 1.2.9 1.9 2 2.4L8.2 17m3.8-8c2.5 0 4.5 1.2 4.5 3 0 1.2-.9 1.9-2 2.4l1.3 5.1M12 3.5v3m0 9.5 1 3.5",
}

export function GarmentIcon({
  category,
  className,
}: {
  category: string
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-10", className)}
      aria-hidden
    >
      <path d={ICON_PATHS[category] ?? ICON_PATHS.tops} />
    </svg>
  )
}

export function getCategorySlug(categoryName: string): string {
  return categoryName.toLowerCase().replace(/[^a-z]/g, "")
}
