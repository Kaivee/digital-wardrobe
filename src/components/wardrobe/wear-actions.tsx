"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Loader2, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function WearActions({ itemId }: { itemId: string }) {
  const router = useRouter()
  const [dateWorn, setDateWorn] = useState(() => new Date().toISOString().slice(0, 10))
  const [pending, setPending] = useState<"wear" | "clean" | null>(null)

  async function logWear(event: React.FormEvent) {
    event.preventDefault()
    setPending("wear")
    try {
      const response = await fetch(`/api/items/${itemId}/wear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateWorn }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not log wear")
      toast.success(
        data.triggered
          ? "Wear logged — this piece is due for the wash."
          : "Wear logged."
      )
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log wear")
    } finally {
      setPending(null)
    }
  }

  async function markClean() {
    setPending("clean")
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLEAN" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Update failed")
      toast.success("Marked clean — wash counter reset.")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={markClean}
        disabled={pending !== null}
      >
        {pending === "clean" ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <Check data-icon="inline-start" />
        )}
        Mark clean
      </Button>
      <Dialog>
        <DialogTrigger
          render={
            <Button disabled={pending !== null}>
              {pending === "wear" && <Loader2 className="animate-spin" data-icon="inline-start" />}
              <CalendarPlus data-icon="inline-start" />
              Log a wear
            </Button>
          }
        >
          Log a wear
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <form onSubmit={logWear}>
            <DialogHeader>
              <DialogTitle>Log a wear</DialogTitle>
              <DialogDescription>
                Adds a wear log entry and advances the smart laundry counter.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-2">
                <Label htmlFor="date-worn">Date worn</Label>
                <Input
                  id="date-worn"
                  type="date"
                  value={dateWorn}
                  onChange={(event) => setDateWorn(event.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending !== null}>
                {pending === "wear" && <Loader2 className="animate-spin" data-icon="inline-start" />}
                {pending === "wear" ? "Logging…" : "Log wear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
