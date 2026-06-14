import type { ComparisonResult } from "./types";

const HISTORY_KEY = "kitacompare_history";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getHistory(): ComparisonResult[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ComparisonResult[]) : [];
  } catch {
    return [];
  }
}

export function saveComparison(result: ComparisonResult): void {
  if (!isClient()) return;
  const history = getHistory();
  const updated = [result, ...history];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function deleteComparison(id: string): void {
  if (!isClient()) return;
  const history = getHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  if (!isClient()) return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}

export function toggleFavourite(id: string): void {
  if (!isClient()) return;
  const history = getHistory().map((r) =>
    r.id === id ? { ...r, isFavourite: !r.isFavourite } : r
  );
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getFavourites(): ComparisonResult[] {
  return getHistory().filter((r) => r.isFavourite);
}

export function getRecentHistory(limit = 5): ComparisonResult[] {
  return getHistory().slice(0, limit);
}
