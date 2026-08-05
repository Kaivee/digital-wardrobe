import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Shirt, Sparkles, Waves, Wallet } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/user"
import { formatMoney } from "@/lib/cpw"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { StatusBadge } from "@/components/wardrobe/status-badge"
import { GarmentIcon, getCategorySlug } from "@/components/shared/garment-icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "Overview",
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default async function HomePage() {
  const user = await getCurrentUser()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [items, outfits, laundryItems, recentWears, wearCount30d] = await Promise.all([
    prisma.clothingItem.findMany({
      where: { userId: user.id },
      include: { category: true },
    }),
    prisma.outfit.count({ where: { userId: user.id } }),
    prisma.clothingItem.findMany({
      where: {
        userId: user.id,
        status: "LAUNDRY",
      },
      include: { category: true },
      orderBy: { wearCountSinceWash: "desc" },
      take: 6,
    }),
    prisma.wearLog.findMany({
      where: { userId: user.id },
      include: { item: { include: { category: true } } },
      orderBy: { dateWorn: "desc" },
      take: 8,
    }),
    prisma.wearLog.count({ where: { userId: user.id, dateWorn: { gte: thirtyDaysAgo } } }),
  ])

  const totalValue = items.reduce((sum, item) => sum + item.purchasePrice, 0)
  const totalWears = items.reduce((sum, item) => sum + item.wearCount, 0)
  const overdue = items.filter(
    (item) => item.status === "CLEAN" && item.wearCountSinceWash >= item.category.wearLimit
  )

  const firstName = (user.name ?? "there").split(" ")[0]

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow={`${new Date().getFullYear()} · ${items.length} pieces tracked`}
        title={`Welcome back, ${firstName}`}
        description="Your wardrobe at a glance — value, wear frequency, and what's due for the wash."
      />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Wardrobe value"
          value={formatMoney(totalValue)}
          hint={`${totalWears} total wears`}
        />
        <StatCard
          label="Worn last 30 days"
          value={String(wearCount30d)}
          hint={`${outfits} saved outfits`}
        />
        <StatCard
          label="In laundry"
          value={String(laundryItems.length)}
          hint={overdue.length > 0 ? `${overdue.length} more overdue` : "All caught up"}
        />
        <StatCard
          label="Items tracked"
          value={String(items.length)}
          hint={`${items.filter((item) => item.status === "ARCHIVED").length} archived`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Waves className="size-4 text-muted-foreground" aria-hidden />
                Laundry queue
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {laundryItems.length === 0 && overdue.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing needs washing. A piece flips to laundry once it hits its
                category wear limit.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {[...laundryItems, ...overdue].slice(0, 6).map((item) => {
                  const limit = item.category.wearLimit
                  const progress = Math.min(100, (item.wearCountSinceWash / limit) * 100)
                  return (
                    <li key={item.id} className="flex flex-col gap-2 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          href={`/wardrobe/${item.id}`}
                          className="flex min-w-0 items-center gap-2.5 text-sm font-medium hover:underline underline-offset-4"
                        >
                          <GarmentIcon
                            category={getCategorySlug(item.category.name)}
                            className="size-4.5 shrink-0 text-muted-foreground"
                          />
                          <span className="truncate">{item.name}</span>
                        </Link>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-1.5" aria-label={`${progress.toFixed(0)}% of wear limit reached`} />
                        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                          {item.wearCountSinceWash}/{limit} wears
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Shirt className="size-4 text-muted-foreground" aria-hidden />
                Recent wears
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentWears.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No wears logged yet. Start logging to unlock cost-per-wear insights.
              </p>
            ) : (
              <ul className="flex flex-col divide-y">
                {recentWears.map((log) => {
                  const date = new Date(log.dateWorn)
                  return (
                    <li
                      key={log.id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <Link
                        href={`/wardrobe/${log.itemId}`}
                        className="flex min-w-0 items-center gap-2.5 font-medium hover:underline underline-offset-4"
                      >
                        <GarmentIcon
                          category={getCategorySlug(log.item.category.name)}
                          className="size-4.5 shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{log.item.name}</span>
                      </Link>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {DAYS[date.getDay()]} {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-5">
        <h2 className="font-heading text-2xl font-medium tracking-tight">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/outfits"
            className="group flex flex-col gap-3 rounded-lg border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <span className="flex size-9 items-center justify-center rounded-md border bg-muted/50">
              <Sparkles className="size-4.5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-medium tracking-tight">
                Style lab
              </span>
              <span className="text-sm text-muted-foreground">
                Colour-wheel-matched looks for any occasion.
              </span>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground">
              Open the lab <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
          <Link
            href="/analytics"
            className="group flex flex-col gap-3 rounded-lg border bg-card p-5 transition-colors hover:border-foreground/30"
          >
            <span className="flex size-9 items-center justify-center rounded-md border bg-muted/50">
              <Wallet className="size-4.5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-medium tracking-tight">
                Analytics
              </span>
              <span className="text-sm text-muted-foreground">
                Wear frequency, cost-per-wear, and best-value pieces.
              </span>
            </div>
            <span className="mt-auto flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-foreground">
              View insights <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </Link>
        </div>
      </section>
    </div>
  )
}
