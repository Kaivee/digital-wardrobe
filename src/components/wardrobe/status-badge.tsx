import { cn } from "@/lib/utils"
import type { WearStatus } from "@/lib/prisma"

export function StatusBadge({
  status,
  className,
}: {
  status: WearStatus
  className?: string
}) {
  const label =
    status === "CLEAN" ? "Clean" : status === "LAUNDRY" ? "In laundry" : "Archived"
  const tone =
    status === "CLEAN"
      ? "status-clean"
      : status === "LAUNDRY"
        ? "status-laundry"
        : "status-archived"

  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-4xl px-2.5 text-[0.6875rem] font-medium tracking-[0.05em] uppercase",
        tone,
        className
      )}
    >
      {label}
    </span>
  )
}

export function FormalityMeter({ score }: { score: number }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Formality ${score} of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={cn(
            "size-1 rounded-full",
            index < score ? "bg-foreground" : "bg-foreground/15"
          )}
        />
      ))}
    </div>
  )
}
