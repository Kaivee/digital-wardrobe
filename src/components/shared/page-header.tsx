import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow ? (
          <p className="micro-label text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
