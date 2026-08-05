import type { Metadata } from "next"
import { BarChart3, Repeat2, Trophy } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { costPerWear, formatMoney } from "@/lib/cpw"
import { getCategorySlug, GarmentIcon } from "@/components/shared/garment-icon"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Wear frequency, cost-per-wear, and category mix.",
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 13)

  const [items, recentLogs, totalLogs] = await Promise.all([
    prisma.clothingItem.findMany({
      where: { userId: user.id },
      include: { category: true },
    }),
    prisma.wearLog.findMany({
      where: { userId: user.id, dateWorn: { gte: start } },
      select: { dateWorn: true },
    }),
    prisma.wearLog.count({ where: { userId: user.id } }),
  ])

  // Last 14 days of wear activity.
  const byDay = new Map<string, number>()
  for (let i = 0; i < 14; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    byDay.set(dayKey(d), 0)
  }
  for (const log of recentLogs) {
    const key = dayKey(new Date(log.dateWorn))
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }
  const activity = Array.from(byDay.entries()).map(([key, count]) => ({
    key,
    count,
    label: DAY_LABELS[new Date(key).getDay()],
  }))
  const maxActivity = Math.max(1, ...activity.map((a) => a.count))

  // Category mix.
  const categoryCounts = new Map<string, { name: string; count: number }>()
  for (const item of items) {
    const slug = getCategorySlug(item.category.name)
    const current = categoryCounts.get(slug) ?? { name: item.category.name, count: 0 }
    current.count += 1
    categoryCounts.set(slug, current)
  }
  const categoryMix = Array.from(categoryCounts.entries())
    .map(([slug, value]) => ({ slug, ...value }))
    .sort((a, b) => b.count - a.count)
  const maxCategory = Math.max(1, ...categoryMix.map((c) => c.count))

  // CPW leaderboard — best value first (worn at least once).
  const withCpW = items
    .filter((item) => item.wearCount > 0)
    .map((item) => ({
      item,
      cpw: costPerWear(item.purchasePrice, item.wearCount),
    }))
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 6)

  // Most worn.
  const mostWorn = [...items]
    .sort((a, b) => b.wearCount - a.wearCount)
    .filter((item) => item.wearCount > 0)
    .slice(0, 6)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="How your wardrobe actually gets used — and which pieces earn their keep."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
                Wears, last 14 days
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalLogs === 0 ? (
              <p className="text-sm text-muted-foreground">
                No wear data yet. Log wears from any item page to see activity here.
              </p>
            ) : (
              <div className="flex h-40 items-end gap-2" role="img" aria-label={`Wear activity over the last 14 days. ${totalLogs} total wears.`}>
                {activity.map((day) => (
                  <div
                    key={day.key}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <div className="relative flex w-full flex-1 items-end">
                      <div
                        className={cn(
                          "w-full rounded-t-sm",
                          day.count > 0 ? "bg-foreground" : "bg-foreground/10"
                        )}
                        style={{ height: `${Math.max(4, (day.count / maxActivity) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[0.625rem] text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category mix</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryMix.length === 0 ? (
              <p className="text-sm text-muted-foreground">Add items to see the breakdown.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {categoryMix.map((category) => (
                  <div key={category.slug} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category.name}</span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {category.count}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${(category.count / maxCategory) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Trophy className="size-4 text-muted-foreground" aria-hidden />
                Best cost-per-wear
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {withCpW.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Items become eligible once they&apos;ve been worn at least once.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {withCpW.map(({ item, cpw }, index) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <GarmentIcon
                      category={getCategorySlug(item.category.name)}
                      className="size-4.5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.wearCount} wears · {formatMoney(item.purchasePrice)} paid
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {formatMoney(cpw)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Repeat2 className="size-4 text-muted-foreground" aria-hidden />
                Most worn
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostWorn.length === 0 ? (
              <p className="text-sm text-muted-foreground">Wear counts will appear here.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {mostWorn.map((item, index) => (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <GarmentIcon
                      category={getCategorySlug(item.category.name)}
                      className="size-4.5 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {item.color} · {item.category.name}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {item.wearCount} wears
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
