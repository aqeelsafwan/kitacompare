"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import HistoryCard from "@/components/HistoryCard";
import { getHistory, deleteComparison, clearHistory, toggleFavourite } from "@/lib/storage";
import type { ComparisonResult } from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<ComparisonResult[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function refresh() {
    setHistory(getHistory());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleDelete(id: string) {
    deleteComparison(id);
    refresh();
  }

  function handleClearAll() {
    clearHistory();
    setConfirmOpen(false);
    refresh();
  }

  function handleToggleFavourite(id: string) {
    toggleFavourite(id);
    refresh();
  }

  return (
    <main className="flex flex-col min-h-dvh px-4 pt-4 pb-8 safe-bottom">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-foreground">History</h1>
        </div>

        {history.length > 0 && (
          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogTrigger
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              render={
                <button type="button">
                  <Trash className="h-3.5 w-3.5 mr-1" />
                  Clear all
                </button>
              }
            />
            <DialogContent className="max-w-xs mx-auto">
              <DialogHeader>
                <DialogTitle>Clear all history?</DialogTitle>
                <DialogDescription>
                  This will permanently delete all {history.length} comparison
                  {history.length !== 1 ? "s" : ""}. Pinned favourites will also be removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  className="flex-1"
                >
                  Clear all
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16">
          <p className="text-base font-semibold text-foreground">No history yet</p>
          <p className="text-sm text-muted-foreground">
            Completed comparisons will appear here
          </p>
          <Link href="/compare">
            <Button size="sm" className="bg-primary text-primary-foreground mt-2">
              Start comparing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-2">
            {history.length} comparison{history.length !== 1 ? "s" : ""}
          </p>
          {history.map((r) => (
            <HistoryCard
              key={r.id}
              result={r}
              onDelete={handleDelete}
              onToggleFavourite={handleToggleFavourite}
            />
          ))}
        </div>
      )}
    </main>
  );
}
