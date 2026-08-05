import { cn } from "@/lib/utils"
import { COLORS } from "@/lib/constants"

export function ColorSwatch({
  color,
  className,
  withLabel = false,
}: {
  color: string
  className?: string
  withLabel?: boolean
}) {
  const spec = COLORS[color]
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="inline-block size-2.5 rounded-full ring-1 ring-foreground/10"
        style={{ backgroundColor: spec?.hex ?? "#c9c4ba" }}
        aria-hidden
      />
      {withLabel && (
        <span className="text-sm capitalize text-foreground/70">{color}</span>
      )}
    </span>
  )
}
