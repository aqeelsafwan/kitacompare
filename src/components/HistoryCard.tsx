"use client";

import { Star, Trash, TrendDown } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComparisonResult } from "@/lib/types";
import { formatPricePerUnit } from "@/lib/calculations";

interface Props {
  result: ComparisonResult;
  onDelete?: (id: string) => void;
  onToggleFavourite?: (id: string) => void;
}

export default function HistoryCard({ result, onDelete, onToggleFavourite }: Props) {
  const winner = result.winnerId
    ? result.items.find((i) => i.id === result.winnerId)
    : null;

  const date = new Date(result.createdAt);
  const dateStr = date.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="p-4 border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {dateStr} · {timeStr}
          </p>
          {result.mixedUnits && (
            <Badge
              variant="secondary"
              className="text-[10px] mt-1"
            >
              Mixed units — comparison may not be meaningful
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggleFavourite && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleFavourite(result.id)}
              aria-label={result.isFavourite ? "Unpin" : "Pin as favourite"}
            >
              <Star
                className={`h-4 w-4 ${
                  result.isFavourite ? "text-primary" : "text-muted-foreground"
                }`}
                weight={result.isFavourite ? "fill" : "regular"}
              />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(result.id)}
              aria-label="Delete"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {result.items.map((item) => {
          const ppu = result.pricePerUnit[item.id];
          const isWinner = item.id === result.winnerId;

          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                isWinner
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary"
              }`}
            >
              <div className="flex items-center gap-2">
                {isWinner && (
                  <TrendDown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isWinner ? "text-foreground" : "text-foreground"
                    }`}
                  >
                    {item.name || "Unnamed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    RM {item.price.toFixed(2)} · {item.quantity}
                    {item.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-xs font-semibold ${
                    isWinner ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {ppu ? formatPricePerUnit(ppu, result.baseUnit) : "—"}
                </p>
                {isWinner && (
                  <Badge className="text-[9px] bg-primary text-primary-foreground mt-0.5 px-1.5 py-0">
                    Best
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {winner && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          <span className="font-medium text-foreground">{winner.name}</span> gives
          the best value
        </p>
      )}
      {!winner && !result.mixedUnits && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Items are equally priced per unit
        </p>
      )}
    </Card>
  );
}
