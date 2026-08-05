/**
 * Cost-Per-Wear engine.
 *
 * CPW = purchase_price / MAX(wear_count, 1)
 *
 * The value is derived rather than stored, so it is always consistent with the
 * source counters.
 */
export function costPerWear(purchasePrice: number, wearCount: number): number {
  return roundMoney(purchasePrice / Math.max(wearCount, 1))
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}
