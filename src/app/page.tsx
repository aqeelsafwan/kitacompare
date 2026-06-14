"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ClockCounterClockwise, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import FavouritesStrip from "@/components/FavouritesStrip";
import HistoryCard from "@/components/HistoryCard";
import { getFavourites, getRecentHistory, toggleFavourite, deleteComparison } from "@/lib/storage";
import type { ComparisonResult } from "@/lib/types";

export default function HomePage() {
  const [favourites, setFavourites] = useState<ComparisonResult[]>([]);
  const [recent, setRecent] = useState<ComparisonResult[]>([]);

  function refresh() {
    setFavourites(getFavourites());
    setRecent(getRecentHistory(3));
  }

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  function handleDelete(id: string) {
    deleteComparison(id);
    refresh();
  }

  function handleToggleFavourite(id: string) {
    toggleFavourite(id);
    refresh();
  }

  return (
    <main className="flex flex-col min-h-dvh px-4 pt-6 pb-8 safe-bottom">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingCart className="h-6 w-6 text-primary" weight="bold" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            KitaCompare
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Know which product gives more value, instantly.
        </p>
      </header>

      {/* Favourites strip */}
      {favourites.length > 0 && (
        <div className="mb-8">
          <FavouritesStrip favourites={favourites} />
        </div>
      )}

      {/* Primary CTA */}
      <Link href="/compare" className="block mb-8">
        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground font-bold text-base py-6 rounded-xl hover:bg-accent transition-colors shadow-md shadow-primary/30"
        >
          <ShoppingCart className="h-5 w-5 mr-2" weight="bold" />
          New Comparison
        </Button>
      </Link>

      {/* Recent history */}
      {recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClockCounterClockwise className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent
              </h2>
            </div>
            <Link
              href="/history"
              className="flex items-center gap-0.5 text-xs text-primary font-medium hover:text-accent"
            >
              View all
              <CaretRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recent.map((r) => (
              <HistoryCard
                key={r.id}
                result={r}
                onDelete={handleDelete}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}
          </div>
        </section>
      )}

      {recent.length === 0 && favourites.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-16">
          <div className="rounded-full bg-secondary p-5">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No comparisons yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tap &quot;New Comparison&quot; to get started at the shelf
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
