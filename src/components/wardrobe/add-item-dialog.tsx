"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COLORS, FORMALITY_LABELS } from "@/lib/constants"

type CategoryOption = { id: string; name: string }

const MAX_IMAGE_SIZE = 8 * 1024 * 1024

export function AddItemDialog({
  categories,
  trigger,
}: {
  categories: CategoryOption[]
  trigger?: React.ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [color, setColor] = useState("")
  const [formality, setFormality] = useState("3")
  const [status, setStatus] = useState("CLEAN")
  const [price, setPrice] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewSrc, setPreviewSrc] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    return () => {
      if (previewSrc) URL.revokeObjectURL(previewSrc)
    }
  }, [previewSrc])

  function clearPhoto() {
    setFile(null)
    setPreviewSrc("")
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    event.target.value = ""
    if (!selected) return
    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (selected.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 8 MB.")
      return
    }
    if (previewSrc) URL.revokeObjectURL(previewSrc)
    setFile(selected)
    setPreviewSrc(URL.createObjectURL(selected))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !categoryId) {
      toast.error("Name and category are required.")
      return
    }
    setPending(true)
    try {
      let savedImageUrl: string | null = imageUrl.trim() || null

      if (file) {
        const uploadForm = new FormData()
        uploadForm.append("file", file)
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        })
        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok) {
          throw new Error(uploadData.error ?? "Upload failed")
        }
        savedImageUrl = uploadData.url as string
      }

      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          categoryId,
          color: color || "charcoal",
          formalityScore: Number(formality),
          status,
          purchasePrice: price ? Number(price) : 0,
          imageUrl: savedImageUrl,
          description: description.trim() || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not add item")
      toast.success(`${data.name} added to the wardrobe.`)
      setOpen(false)
      setName("")
      setCategoryId("")
      setColor("")
      setPrice("")
      setImageUrl("")
      clearPhoto()
      setDescription("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add item")
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button>
              <Plus data-icon="inline-start" />
              Add item
            </Button>
          )
        }
      >
        Add item
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add an item</DialogTitle>
          <DialogDescription>
            Enter the details by hand and the wardrobe tracks its wear and
            cost-per-wear.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Item name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Merino crewneck"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="item-category">Category</Label>
                <Select
                  value={categoryId}
                  onValueChange={(value) => value !== null && setCategoryId(value)}
                >
                  <SelectTrigger id="item-category" className="w-full">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-color">Color</Label>
                <Select
                  value={color}
                  onValueChange={(value) => value !== null && setColor(value)}
                >
                  <SelectTrigger id="item-color" className="w-full">
                    <SelectValue placeholder="Choose color" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(COLORS).map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="capitalize">{c}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-formality">Formality score</Label>
                <Select
                  value={formality}
                  onValueChange={(value) => value !== null && setFormality(value)}
                >
                  <SelectTrigger id="item-formality" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <SelectItem key={value} value={String(value)}>
                        {value} · {FORMALITY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="item-status">Initial status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => value !== null && setStatus(value)}
                >
                  <SelectTrigger id="item-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEAN">Clean</SelectItem>
                    <SelectItem value="LAUNDRY">In laundry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-price">Purchase price</Label>
              <Input
                id="item-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label>Photo</Label>
              {previewSrc && file ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <img
                    src={previewSrc}
                    alt="Selected photo preview"
                    className="size-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearPhoto}
                    >
                      <X data-icon="inline-start" />
                      Remove photo
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="item-photo"
                  className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed p-6 text-center text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted/40"
                >
                  <Upload className="size-5" aria-hidden />
                  <span className="text-sm font-medium text-foreground">
                    Upload a photo
                  </span>
                  <span className="text-xs">
                    Optional · JPG, PNG, WEBP, GIF or AVIF · up to 8 MB
                  </span>
                  <input
                    id="item-photo"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-notes">Notes</Label>
              <Textarea
                id="item-notes"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="Fabric, fit, care notes…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
              {pending ? "Adding…" : "Add to wardrobe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
