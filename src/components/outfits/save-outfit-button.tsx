"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SaveOutfitButton({
  itemIds,
  occasion,
  occasionLabel,
}: {
  itemIds: string[]
  occasion: string
  occasionLabel: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function save() {
    setPending(true)
    try {
      const response = await fetch("/api/outfits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${occasionLabel} look`,
          occasion,
          itemIds,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not save outfit")
      toast.success(`${data.name} saved to your outfits.`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save outfit")
    } finally {
      setPending(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={save} disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin" data-icon="inline-start" />
      ) : (
        <Bookmark data-icon="inline-start" />
      )}
      Save
    </Button>
  )
}

export function SavedOutfitBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <BookmarkCheck className="size-3.5" aria-hidden />
      Saved
    </span>
  )
}
