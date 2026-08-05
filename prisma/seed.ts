import { prisma } from "../src/lib/prisma"
import { scoreColorPair, normalizeColorPair } from "../src/lib/color-matrix"
import { COLORS, CATEGORIES, DEMO_USER_EMAIL, DEMO_USER_NAME } from "../src/lib/constants"

type SeedItem = {
  name: string
  category: string
  color: string
  pattern: "SOLID" | "STRIPED" | "CHECKED" | "FLORAL" | "GRAPHIC" | "TEXTURED" | "OTHER"
  formality: number
  price: number
  wears: number
  sinceWash: number
  status: "CLEAN" | "LAUNDRY" | "ARCHIVED"
  note?: string
}

const ITEMS: SeedItem[] = [
  // Tops
  { name: "Merino Crewneck", category: "Topwear", color: "charcoal", pattern: "SOLID", formality: 3, price: 95, wears: 12, sinceWash: 1, status: "CLEAN" },
  { name: "Oxford Button-Down", category: "Topwear", color: "white", pattern: "SOLID", formality: 4, price: 65, wears: 9, sinceWash: 1, status: "CLEAN" },
  { name: "Linen Camp Shirt", category: "Topwear", color: "sage", pattern: "SOLID", formality: 2, price: 48, wears: 6, sinceWash: 2, status: "LAUNDRY" },
  { name: "Striped Cotton Tee", category: "Topwear", color: "navy", pattern: "STRIPED", formality: 1, price: 28, wears: 14, sinceWash: 2, status: "LAUNDRY" },
  { name: "Black Mock-Turtleneck", category: "Topwear", color: "black", pattern: "SOLID", formality: 4, price: 58, wears: 8, sinceWash: 0, status: "CLEAN" },
  { name: "Rust Oversized Sweatshirt", category: "Topwear", color: "rust", pattern: "SOLID", formality: 1, price: 42, wears: 5, sinceWash: 1, status: "CLEAN" },
  { name: "Beige Pima Tee", category: "Topwear", color: "beige", pattern: "SOLID", formality: 1, price: 24, wears: 11, sinceWash: 2, status: "LAUNDRY" },
  { name: "Lavender Knit Polo", category: "Topwear", color: "lavender", pattern: "SOLID", formality: 3, price: 52, wears: 3, sinceWash: 0, status: "CLEAN" },
  // Bottoms
  { name: "Pleated Trousers", category: "Bottomwear", color: "cream", pattern: "SOLID", formality: 4, price: 110, wears: 7, sinceWash: 2, status: "CLEAN" },
  { name: "Selvedge Denim", category: "Bottomwear", color: "navy", pattern: "SOLID", formality: 2, price: 130, wears: 18, sinceWash: 3, status: "LAUNDRY" },
  { name: "Cargo Chinos", category: "Bottomwear", color: "olive", pattern: "SOLID", formality: 2, price: 75, wears: 10, sinceWash: 1, status: "CLEAN" },
  { name: "Tailored Skirt", category: "Bottomwear", color: "black", pattern: "SOLID", formality: 4, price: 88, wears: 4, sinceWash: 0, status: "CLEAN" },
  { name: "White Cropped Jeans", category: "Bottomwear", color: "white", pattern: "SOLID", formality: 2, price: 95, wears: 6, sinceWash: 2, status: "CLEAN" },
  { name: "Cord Harringtons", category: "Bottomwear", color: "brown", pattern: "SOLID", formality: 2, price: 70, wears: 8, sinceWash: 3, status: "LAUNDRY" },
  { name: "Formal Wool Trousers", category: "Bottomwear", color: "charcoal", pattern: "SOLID", formality: 5, price: 140, wears: 5, sinceWash: 1, status: "CLEAN" },
  // Footwear
  { name: "White Court Sneakers", category: "Footwear", color: "white", pattern: "SOLID", formality: 1, price: 85, wears: 22, sinceWash: 4, status: "CLEAN" },
  { name: "Cognac Derbies", category: "Footwear", color: "camel", pattern: "SOLID", formality: 4, price: 180, wears: 9, sinceWash: 2, status: "CLEAN" },
  { name: "Black Chelseas", category: "Footwear", color: "black", pattern: "SOLID", formality: 4, price: 210, wears: 7, sinceWash: 1, status: "CLEAN" },
  { name: "Trail Runners", category: "Footwear", color: "gray", pattern: "SOLID", formality: 1, price: 120, wears: 13, sinceWash: 5, status: "LAUNDRY" },
  { name: "Tan Loafers", category: "Footwear", color: "beige", pattern: "SOLID", formality: 3, price: 95, wears: 6, sinceWash: 1, status: "CLEAN" },
  { name: "Burgundy Monk Straps", category: "Footwear", color: "burgundy", pattern: "SOLID", formality: 5, price: 230, wears: 2, sinceWash: 0, status: "CLEAN" },
  // Outerwear
  { name: "Charcoal Wool Overcoat", category: "Outerwear", color: "charcoal", pattern: "SOLID", formality: 5, price: 320, wears: 6, sinceWash: 2, status: "CLEAN" },
  { name: "Olive Field Jacket", category: "Outerwear", color: "olive", pattern: "SOLID", formality: 2, price: 160, wears: 10, sinceWash: 3, status: "CLEAN" },
  { name: "Cream Trench", category: "Outerwear", color: "cream", pattern: "SOLID", formality: 4, price: 240, wears: 4, sinceWash: 1, status: "CLEAN" },
  { name: "Navy Bomber", category: "Outerwear", color: "navy", pattern: "SOLID", formality: 2, price: 130, wears: 8, sinceWash: 4, status: "LAUNDRY" },
  // Accessories
  { name: "Leather Belt", category: "Accessories", color: "brown", pattern: "SOLID", formality: 3, price: 45, wears: 15, sinceWash: 2, status: "CLEAN" },
  { name: "Silk Pocket Square", category: "Accessories", color: "blush", pattern: "CHECKED", formality: 4, price: 28, wears: 5, sinceWash: 1, status: "CLEAN" },
  { name: "Linen Scarf", category: "Accessories", color: "beige", pattern: "TEXTURED", formality: 3, price: 35, wears: 4, sinceWash: 1, status: "CLEAN" },
  { name: "Wool Beanie", category: "Accessories", color: "forest", pattern: "SOLID", formality: 1, price: 30, wears: 9, sinceWash: 4, status: "LAUNDRY" },
]

async function seedColorMatrix() {
  const pairs: { color1: string; color2: string; score: number }[] = []
  const colorNames = Object.keys(COLORS)
  for (let i = 0; i < colorNames.length; i++) {
    for (let j = i + 1; j < colorNames.length; j++) {
      const [color1, color2] = normalizeColorPair(colorNames[i], colorNames[j])
      pairs.push({ color1, color2, score: scoreColorPair(colorNames[i], colorNames[j]) })
    }
  }

  await prisma.colorCompatibility.createMany({ data: pairs })
  return pairs.length
}

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(12, 0, 0, 0)
  return d
}

const WEAR_TEMP_NOTES: [number, number, string][] = [
  [2, 6, "Studio day"],
  [5, 9, "Commute + errands"],
  [9, 14, "Client meeting"],
  [14, 18, "Gallery opening"],
  [18, 23, "Evening walk"],
  [23, 30, "Market run"],
]

async function seedWearLogs(userId: string, items: { id: string; wears: number }[]) {
  const logs: {
    userId: string
    itemId: string
    dateWorn: Date
    weatherTemp: number
    notes: string
  }[] = []

  for (const item of items) {
    let offset = 1
    for (let i = 0; i < item.wears; i++) {
      const [tempMin, tempMax, note] = WEAR_TEMP_NOTES[i % WEAR_TEMP_NOTES.length]
      const temp = tempMin + ((i * 7) % (tempMax - tempMin + 1))
      logs.push({
        userId,
        itemId: item.id,
        dateWorn: daysAgo(offset),
        weatherTemp: temp,
        notes: note,
      })
      offset += 3 + (i % 4)
    }
  }

  await prisma.wearLog.createMany({ data: logs })
  return logs.length
}

async function resetData() {
  await prisma.$transaction([
    prisma.wearLog.deleteMany({}),
    prisma.outfitItem.deleteMany({}),
    prisma.outfit.deleteMany({}),
    prisma.clothingItem.deleteMany({}),
    prisma.colorCompatibility.deleteMany({}),
    prisma.category.deleteMany({}),
  ])
}

async function main() {
  console.log("Seeding Atelier wardrobe…")

  await resetData()

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: DEMO_USER_NAME },
    create: { email: DEMO_USER_EMAIL, name: DEMO_USER_NAME },
  })

  const categoryByName = new Map<string, string>()
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, wearLimit: category.wearLimit, sortOrder: category.sortOrder },
      create: { ...category },
    })
    categoryByName.set(category.name, row.id)
  }

  const pairCount = await seedColorMatrix()
  console.log(`  · colour compatibility matrix: ${pairCount} pairs`)

  const created: { id: string; wears: number }[] = []
  for (const item of ITEMS) {
    const row = await prisma.clothingItem.create({
      data: {
        userId: user.id,
        categoryId: categoryByName.get(item.category)!,
        name: item.name,
        color: item.color,
        colorHex: COLORS[item.color]?.hex ?? "#c9c4ba",
        pattern: item.pattern,
        formalityScore: item.formality,
        status: item.status,
        purchasePrice: item.price,
        wearCount: item.wears,
        wearCountSinceWash: item.sinceWash,
        description: item.note ?? null,
      },
    })
    created.push({ id: row.id, wears: item.wears })
  }
  console.log(`  · clothing items: ${created.length}`)

  const byName = new Map(ITEMS.map((item, i) => [item.name, created[i].id]))

  const outfits: { name: string; occasion: "FORMAL" | "SMART_CASUAL" | "CASUAL" | "ACTIVE"; names: string[]; notes: string }[] = [
    {
      name: "Client Presentation",
      occasion: "FORMAL",
      names: ["Black Mock-Turtleneck", "Formal Wool Trousers", "Black Chelseas", "Charcoal Wool Overcoat", "Silk Pocket Square"],
      notes: "Sharp monochrome base with a blush pocket square for contrast.",
    },
    {
      name: "Saturday Market Run",
      occasion: "CASUAL",
      names: ["Beige Pima Tee", "Cargo Chinos", "White Court Sneakers", "Olive Field Jacket", "Linen Scarf"],
      notes: "Neutrals on neutrals; easy to layer when the morning is cool.",
    },
    {
      name: "Gallery Opening",
      occasion: "SMART_CASUAL",
      names: ["Lavender Knit Polo", "Pleated Trousers", "Tan Loafers", "Cream Trench"],
      notes: "Analogous pastels that read warm under gallery lighting.",
    },
    {
      name: "Studio Session",
      occasion: "ACTIVE",
      names: ["Striped Cotton Tee", "Selvedge Denim", "Trail Runners"],
      notes: "Sweat-wicking layers for a long day on foot.",
    },
  ]

  for (const outfit of outfits) {
    const itemIds = outfit.names.map((name) => byName.get(name)!).filter(Boolean)
    await prisma.outfit.create({
      data: {
        userId: user.id,
        name: outfit.name,
        occasion: outfit.occasion,
        notes: outfit.notes,
        items: {
          create: itemIds.map((itemId, index) => ({ itemId, position: index + 1 })),
        },
      },
    })
  }
  console.log(`  · outfits: ${outfits.length}`)

  const logCount = await seedWearLogs(user.id, created)
  console.log(`  · wear logs: ${logCount}`)

  console.log("Done.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
