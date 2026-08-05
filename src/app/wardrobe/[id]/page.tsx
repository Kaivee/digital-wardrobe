import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Repeat2, CalendarDays, Tag } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { costPerWear, formatMoney } from "@/lib/cpw"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, FormalityMeter } from "@/components/wardrobe/status-badge"
import { ColorSwatch } from "@/components/wardrobe/color-swatch"
import { ItemImage } from "@/components/wardrobe/item-image"
import { WearActions } from "@/components/wardrobe/wear-actions"
import { StatCard } from "@/components/shared/stat-card"
import { PATTERN_LABELS } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const item = await prisma.clothingItem.findUnique({
    where: { id },
    select: { name: true },
  })
  return { title: item?.name ?? "Item detail" }
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatWearDate(date: Date): string {
  const d = new Date(date)
  return `${DAYS[d.getDay()]} · ${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  const { id } = await params

  const item = await prisma.clothingItem.findFirst({
    where: { id, userId: user.id },
    include: {
      category: true,
      wearLogs: {
        orderBy: { dateWorn: "desc" },
        take: 12,
        include: { outfit: { select: { id: true, name: true } } },
      },
    },
  })

  if (!item) notFound()

  const cpw = costPerWear(item.purchasePrice, item.wearCount)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <Link
        href="/wardrobe"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to wardrobe
      </Link>

      <PageHeader
        eyebrow={item.category.name}
        title={item.name}
        description={item.description ?? undefined}
        actions={
          <>
            <StatusBadge status={item.status} />
            <WearActions itemId={item.id} />
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative h-[320px] overflow-hidden rounded-lg border bg-muted/40 sm:h-[420px] lg:h-[480px]">
            <ItemImage
              src={item.imageUrl}
              category={item.category.name}
              colorHex={item.colorHex}
              alt={`${item.name} photo`}
              iconClassName="size-24 text-foreground/70"
            />
          </div>
          {item.imageUrl ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Source photo:{" "}
              <a
                href={item.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {item.imageUrl}
              </a>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Cost per wear" value={formatMoney(cpw)} hint={`${formatMoney(item.purchasePrice)} purchase`} />
            <StatCard label="Total wears" value={String(item.wearCount)} />
            <StatCard label="Since last wash" value={String(item.wearCountSinceWash)} hint={`${item.category.name} limit is ${item.category.wearLimit}`} />
            <StatCard label="Value per wear" value={item.wearCount === 0 ? "—" : `${formatMoney(item.purchasePrice)}`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="size-4" aria-hidden />
                  Pattern
                </span>
                <span>{PATTERN_LABELS[item.pattern]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Repeat2 className="size-4" aria-hidden />
                  Formality
                </span>
                <FormalityMeter score={item.formalityScore} />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="size-4" aria-hidden />
                  Colour
                </span>
                <ColorSwatch color={item.color} withLabel />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
                  Recent wears
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {item.wearLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No wears logged yet. Log the first one to watch the cost-per-wear fall.
                </p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {item.wearLogs.map((log) => (
                    <li
                      key={log.id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-foreground/40" aria-hidden />
                        {formatWearDate(log.dateWorn)}
                      </span>
                      <span className="truncate pl-4 text-muted-foreground">
                        {log.outfit ? log.outfit.name : log.weatherTemp != null ? `${log.weatherTemp}°` : "Standalone"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
