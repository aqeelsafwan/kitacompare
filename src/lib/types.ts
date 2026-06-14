export type Unit = "g" | "kg" | "ml" | "L";

export interface ComparisonItem {
  id: string;
  name: string;
  price: number; // in RM
  quantity: number;
  unit: Unit;
}

export interface ComparisonResult {
  id: string;
  items: ComparisonItem[];
  winnerId: string | null; // null = tie
  pricePerUnit: Record<string, number>; // item id -> price per base unit
  baseUnit: "g" | "ml";
  mixedUnits: boolean;
  createdAt: string; // ISO string
  isFavourite: boolean;
}
