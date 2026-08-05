import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export function StatCard({
  label,
  value,
  hint,
  className,
  pending = false,
}: {
  label: string
  value: string
  hint?: string
  className?: string
  pending?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-5",
        className
      )}
    >
      <p className="micro-label text-muted-foreground">{label}</p>
      {pending ? (
        <Spinner className="size-4 text-muted-foreground" />
      ) : (
        <p className="font-heading text-3xl font-medium tracking-tight">{value}</p>
      )}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
