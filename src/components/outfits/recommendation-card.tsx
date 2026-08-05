import { getCategorySlug, GarmentIcon } from "@/components/shared/garment-icon"
import { ColorSwatch } from "@/components/wardrobe/color-swatch"
import { SaveOutfitButton } from "@/components/outfits/save-outfit-button"
import type { Recommendation } from "@/lib/recommender"

function SlotPiece({
  label,
  item,
}: {
  label: string
  item: { id: string; name: string; color: string; category: { name: string } }
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
        <GarmentIcon category={getCategorySlug(item.category.name)} className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="micro-label text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium">{item.name}</span>
      </div>
      <ColorSwatch color={item.color} className="ml-auto shrink-0" />
    </div>
  )
}

export function RecommendationCard({
  recommendation,
  occasion,
  occasionLabel,
}: {
  recommendation: Recommendation
  occasion: string
  occasionLabel: string
}) {
  const pieces = [
    { label: "Top", item: recommendation.top },
    { label: "Bottom", item: recommendation.bottom },
    { label: "Shoes", item: recommendation.footwear },
    ...(recommendation.outerwear
      ? [{ label: "Layer", item: recommendation.outerwear }]
      : []),
  ]

  const accessoryIds = recommendation.accessories.map((item) => item.id)
  const allIds = [
    recommendation.top.id,
    recommendation.bottom.id,
    recommendation.footwear.id,
    ...(recommendation.outerwear ? [recommendation.outerwear.id] : []),
    ...accessoryIds,
  ]

  return (
    <article className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="micro-label text-muted-foreground">Score {recommendation.score.toFixed(1)}</p>
          <h3 className="font-heading text-lg font-medium tracking-tight">
            {occasionLabel} look
          </h3>
        </div>
        <SaveOutfitButton itemIds={allIds} occasion={occasion} occasionLabel={occasionLabel} />
      </div>

      <div className="flex flex-col gap-2.5">
        {pieces.map((piece) => (
          <SlotPiece key={piece.item.id} label={piece.label} item={piece.item} />
        ))}
        {recommendation.accessories.length > 0 ? (
          <div className="flex items-center gap-2 border-t pt-2.5">
            <span className="micro-label text-muted-foreground">Acc.</span>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.accessories.map((item) => (
                <span
                  key={item.id}
                  title={item.name}
                  className="inline-flex items-center gap-1.5 rounded-4xl border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <footer className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
        <span>Freshness {recommendation.freshnessTotal}</span>
        <span>Formality {recommendation.formalityTotal}</span>
        <span>Colour {recommendation.colorTotal}</span>
      </footer>
    </article>
  )
}
