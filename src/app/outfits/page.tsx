import type { Metadata } from "next"
import { Sparkles, Shirt } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { recommendOutfit } from "@/lib/recommender"
import { OCCASION_LABELS } from "@/lib/constants"
import { PageHeader } from "@/components/shared/page-header"
import { OccasionTabs } from "@/components/outfits/occasion-tabs"
import { RecommendationCard } from "@/components/outfits/recommendation-card"
import { OutfitCard } from "@/components/outfits/outfit-card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Outfits",
  description: "Colour-wheel-matched looks, generated from your wardrobe.",
}

const OCCASIONS = Object.keys(OCCASION_LABELS) as (keyof typeof OCCASION_LABELS)[]

export default async function OutfitsPage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams

  const occasion = OCCASIONS.includes(params.occasion as keyof typeof OCCASION_LABELS)
    ? (params.occasion as keyof typeof OCCASION_LABELS)
    : "CASUAL"

  const [recommendations, savedOutfits] = await Promise.all([
    recommendOutfit({ userId: user.id, occasion, limit: 3 }),
    prisma.outfit.findMany({
      where: { userId: user.id },
      include: {
        items: {
          orderBy: { position: "asc" },
          include: { item: { include: { category: true } } },
        },
        _count: { select: { wearLogs: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
  ])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Style lab"
        title="Outfits"
        description="Pick an occasion and the recommender assembles colour-wheel-matched looks from what's clean and ready."
      />

      <section className="flex flex-col gap-5">
        <OccasionTabs />

        {recommendations.length === 0 ? (
          <Empty className="min-h-56">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No clean combinations yet</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>
                {OCCASION_LABELS[occasion]} needs a clean top, bottom and shoes that
                sit in the right formality band. Add a few pieces or mark something clean.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={`${recommendation.top.id}-${recommendation.bottom.id}-${recommendation.footwear.id}`}
                recommendation={recommendation}
                occasion={occasion}
                occasionLabel={OCCASION_LABELS[occasion]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            Saved outfits
          </h2>
          <p className="text-sm text-muted-foreground">
            Looks you&apos;ve bookmarked, with wear stats.
          </p>
        </div>
        {savedOutfits.length === 0 ? (
          <Empty className="min-h-48">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Shirt aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No saved outfits yet</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
              <EmptyDescription>
                Save a recommended look and it will live here for quick reuse.
              </EmptyDescription>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {savedOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
