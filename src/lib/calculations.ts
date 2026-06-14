import type { ComparisonItem, Unit } from "./types";

const WEIGHT_UNITS = new Set<Unit>(["g", "kg"]);
const VOLUME_UNITS = new Set<Unit>(["ml", "L"]);

export function toBaseUnit(quantity: number, unit: Unit): number {
  switch (unit) {
    case "kg":
      return quantity * 1000;
    case "L":
      return quantity * 1000;
    default:
      return quantity;
  }
}

export function getBaseUnit(unit: Unit): "g" | "ml" {
  return WEIGHT_UNITS.has(unit) ? "g" : "ml";
}

export function hasMixedUnits(items: ComparisonItem[]): boolean {
  const types = items.map((i) => (WEIGHT_UNITS.has(i.unit) ? "weight" : "volume"));
  return new Set(types).size > 1;
}

export function calculatePricePerUnit(item: ComparisonItem): number {
  const base = toBaseUnit(item.quantity, item.unit);
  if (base === 0) return 0;
  return item.price / base;
}

export function findWinner(items: ComparisonItem[]): {
  winnerId: string | null;
  pricePerUnit: Record<string, number>;
  baseUnit: "g" | "ml";
  mixedUnits: boolean;
} {
  const mixedUnits = hasMixedUnits(items);
  const baseUnit = getBaseUnit(items[0].unit);

  const pricePerUnit: Record<string, number> = {};
  for (const item of items) {
    pricePerUnit[item.id] = calculatePricePerUnit(item);
  }

  const validItems = items.filter((i) => pricePerUnit[i.id] > 0);
  if (validItems.length === 0 || mixedUnits) {
    return { winnerId: null, pricePerUnit, baseUnit, mixedUnits };
  }

  let winner = validItems[0];
  for (const item of validItems.slice(1)) {
    if (pricePerUnit[item.id] < pricePerUnit[winner.id]) {
      winner = item;
    }
  }

  const sorted = [...validItems].sort((a, b) => pricePerUnit[a.id] - pricePerUnit[b.id]);
  const isTie = sorted.length > 1 && pricePerUnit[sorted[0].id] === pricePerUnit[sorted[1].id];

  return {
    winnerId: isTie ? null : winner.id,
    pricePerUnit,
    baseUnit,
    mixedUnits,
  };
}

export function formatPricePerUnit(price: number, unit: "g" | "ml"): string {
  if (price < 0.01) {
    return `RM ${(price * 100).toFixed(4)}/100${unit}`;
  }
  return `RM ${price.toFixed(4)}/${unit}`;
}

export function getSavingsText(
  items: ComparisonItem[],
  winnerId: string,
  pricePerUnit: Record<string, number>,
  baseUnit: "g" | "ml"
): string {
  const winner = items.find((i) => i.id === winnerId);
  if (!winner) return "";

  const others = items.filter((i) => i.id !== winnerId && pricePerUnit[i.id] > 0);
  if (others.length === 0) return "";

  const maxOther = Math.max(...others.map((i) => pricePerUnit[i.id]));
  const diff = maxOther - pricePerUnit[winnerId];

  return `${winner.name} is cheaper by RM ${diff.toFixed(4)} per ${baseUnit}`;
}
