"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { OCCASION_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const OCCASIONS = Object.keys(OCCASION_LABELS) as (keyof typeof OCCASION_LABELS)[]

export function OccasionTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get("occasion") ?? "CASUAL"

  return (
    <div
      role="tablist"
      aria-label="Choose an occasion"
      className="flex flex-wrap items-center gap-1 rounded-lg border bg-card p-1"
    >
      {OCCASIONS.map((occasion) => (
        <button
          key={occasion}
          role="tab"
          aria-selected={active === occasion}
          onClick={() =>
            router.push(`/outfits?occasion=${occasion}`, { scroll: false })
          }
          className={cn(
            "h-8 rounded-md px-3 text-sm font-medium transition-colors",
            active === occasion
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {OCCASION_LABELS[occasion]}
        </button>
      ))}
    </div>
  )
}
