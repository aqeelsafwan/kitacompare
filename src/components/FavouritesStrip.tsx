"use client";

import { Star, TrendDown } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComparisonResult } from "@/lib/types";
import { formatPricePerUnit } from "@/lib/calculations";

interface Props {
  favourites: ComparisonResult[];
}

export default function FavouritesStrip({ favourites }: Props) {
  if (favourites.length === 0) return null;

  const top3 = favourites.slice(0, 3);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-primary" weight="fill" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pinned Comparisons
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {top3.map((result) => {
          const winner = result.winnerId
            ? result.items.find((i) => i.id === result.winnerId)
            : null;
          const ppu = result.winnerId
            ? result.pricePerUnit[result.winnerId]
            : null;

          return (
            <Card
              key={result.id}
              className="min-w-[200px] max-w-[220px] p-3 flex-shrink-0 snap-start border border-border bg-card shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col gap-1">
                  {result.items.map((item) => (
                    <span
                      key={item.id}
                      className={`text-xs font-medium truncate max-w-[140px] ${
                        item.id === result.winnerId
                          ? "text-primary"
                          : "text-foreground/50"
                      }`}
                    >
                      {item.name || "Item"}
                    </span>
                  ))}
                </div>
                <Star className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" weight="fill" />
              </div>

              {winner && ppu !== null ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <TrendDown className="h-3.5 w-3.5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Best deal</p>
                    <p className="text-xs font-semibold text-foreground">
                      {winner.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatPricePerUnit(ppu, result.baseUnit)}
                    </p>
                  </div>
                </div>
              ) : (
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {result.mixedUnits ? "Mixed units" : "Tie"}
                </Badge>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
