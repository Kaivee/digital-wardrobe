"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "CLEAN", label: "Clean" },
  { value: "LAUNDRY", label: "In laundry" },
  { value: "ARCHIVED", label: "Archived" },
] as const

export function WardrobeFilters({
  categories,
}: {
  categories: { slug: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const status = searchParams.get("status") ?? "all"
  const category = searchParams.get("category") ?? "all"
  const query = searchParams.get("q") ?? ""

  function update(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === "" || value === "all") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    router.push(`/wardrobe${next.toString() ? `?${next.toString()}` : ""}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div
        role="tablist"
        aria-label="Filter by wear status"
        className="flex items-center gap-1 rounded-lg border bg-card p-1"
      >
        {STATUS_OPTIONS.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={status === option.value}
            onClick={() => update({ status: option.value })}
            className={cn(
              "h-7 rounded-md px-3 text-sm font-medium transition-colors",
              status === option.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Select
        value={category}
        onValueChange={(value) => update({ category: value })}
      >
        <SelectTrigger aria-label="Filter by category" className="w-full sm:w-44">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.slug} value={item.slug}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative w-full sm:max-w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(event) => update({ q: event.target.value })}
          placeholder="Search the wardrobe…"
          className="pl-9"
          aria-label="Search wardrobe items"
        />
      </div>
    </div>
  )
}
