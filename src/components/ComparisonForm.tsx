"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Plus,
  Minus,
  Warning,
  TrendDown,
  Star,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ComparisonItem, ComparisonResult, Unit } from "@/lib/types";
import { findWinner, formatPricePerUnit, getSavingsText } from "@/lib/calculations";
import { saveComparison, toggleFavourite } from "@/lib/storage";

const UNITS: Unit[] = ["g", "kg", "ml", "L"];

function makeItem(id: string): ComparisonItem {
  return { id, name: "", price: 0, quantity: 0, unit: "g" };
}

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

interface ItemFieldProps {
  item: ComparisonItem;
  index: number;
  canRemove: boolean;
  onUpdate: (updated: ComparisonItem) => void;
  onRemove: () => void;
  onPhotoCapture: (index: number) => void;
  isExtracting: boolean;
}

function ItemField({ item, index, canRemove, onUpdate, onRemove, onPhotoCapture, isExtracting }: ItemFieldProps) {
  const label = `Item ${String.fromCharCode(65 + index)}`;

  return (
    <Card className="p-4 border border-border bg-card shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onPhotoCapture(index)}
            disabled={isExtracting}
            title="Extract from photo"
          >
            <Camera className="h-4 w-4" />
          </Button>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <Minus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Product name (optional)"
          value={item.name}
          onChange={(e) => onUpdate({ ...item, name: e.target.value })}
          className="w-full rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
              RM
            </span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={item.price || ""}
              onChange={(e) => onUpdate({ ...item, price: parseFloat(e.target.value) || 0 })}
              className="w-full rounded-lg bg-input border border-border pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <input
            type="number"
            inputMode="decimal"
            placeholder="Qty"
            min="0"
            step="any"
            value={item.quantity || ""}
            onChange={(e) => onUpdate({ ...item, quantity: parseFloat(e.target.value) || 0 })}
            className="w-24 rounded-lg bg-input border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <select
            value={item.unit}
            onChange={(e) => onUpdate({ ...item, unit: e.target.value as Unit })}
            className="appearance-none rounded-lg bg-input border border-border px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}

interface ResultDisplayProps {
  result: ComparisonResult;
  onFavouriteToggle: () => void;
}

function ResultDisplay({ result, onFavouriteToggle }: ResultDisplayProps) {
  const winner = result.winnerId
    ? result.items.find((i) => i.id === result.winnerId)
    : null;
  const savingsText = winner
    ? getSavingsText(result.items, result.winnerId!, result.pricePerUnit, result.baseUnit)
    : null;

  return (
    <div className="space-y-3 mt-4">
      {result.mixedUnits && (
        <Alert className="border-amber-200 bg-amber-50">
          <Warning className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            Items use different unit types (weight vs volume). Comparison shown but may not be meaningful.
          </AlertDescription>
        </Alert>
      )}

      <Card className={`p-4 border shadow-sm ${winner ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            {winner ? (
              <>
                <div className="flex items-center gap-2">
                  <TrendDown className="h-5 w-5 text-primary" weight="bold" />
                  <h3 className="text-base font-bold text-foreground">Best Value</h3>
                </div>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {winner.name || `Item ${result.items.findIndex(i => i.id === winner.id) === 0 ? "A" : "B"}`}
                </p>
                {savingsText && (
                  <p className="text-xs text-muted-foreground mt-0.5">{savingsText}</p>
                )}
              </>
            ) : (
              <p className="text-sm font-semibold text-foreground">
                {result.mixedUnits ? "Cannot compare — different units" : "It's a tie!"}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFavouriteToggle}
            className="h-8 w-8"
            title={result.isFavourite ? "Unpin" : "Pin to favourites"}
          >
            <Star
              className={`h-4 w-4 ${result.isFavourite ? "text-primary" : "text-muted-foreground"}`}
              weight={result.isFavourite ? "fill" : "regular"}
            />
          </Button>
        </div>

        <div className="space-y-2">
          {result.items.map((item, idx) => {
            const ppu = result.pricePerUnit[item.id];
            const isWinner = item.id === result.winnerId;

            return (
              <div
                key={item.id}
                className={`flex justify-between items-center rounded-lg px-3 py-2.5 ${
                  isWinner ? "bg-primary/10 border border-primary/30" : "bg-secondary"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.name || `Item ${String.fromCharCode(65 + idx)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    RM {item.price.toFixed(2)} / {item.quantity}{item.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {ppu ? formatPricePerUnit(ppu, result.baseUnit) : "—"}
                  </p>
                  {isWinner && (
                    <Badge className="text-[9px] bg-primary text-primary-foreground mt-0.5 px-1.5">
                      Best
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default function ComparisonForm() {
  const [items, setItems] = useState<ComparisonItem[]>([
    makeItem(newId()),
    makeItem(newId()),
  ]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [extractingIndex, setExtractingIndex] = useState<number | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeExtractIndex = useRef<number>(0);

  function updateItem(index: number, updated: ComparisonItem) {
    setItems((prev) => prev.map((it, i) => (i === index ? updated : it)));
    setResult(null);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function addItem() {
    if (items.length >= 3) return;
    setItems((prev) => [...prev, makeItem(newId())]);
    setResult(null);
  }

  function handleCompare() {
    const valid = items.filter((i) => i.price > 0 && i.quantity > 0);
    if (valid.length < 2) return;

    const { winnerId, pricePerUnit, baseUnit, mixedUnits } = findWinner(valid);
    const newResult: ComparisonResult = {
      id: newId(),
      items: valid,
      winnerId,
      pricePerUnit,
      baseUnit,
      mixedUnits,
      createdAt: new Date().toISOString(),
      isFavourite: false,
    };
    setResult(newResult);
    saveComparison(newResult);
  }

  function handleFavouriteToggle() {
    if (!result) return;
    toggleFavourite(result.id);
    setResult((prev) => prev ? { ...prev, isFavourite: !prev.isFavourite } : null);
  }

  function handleReset() {
    setItems([makeItem(newId()), makeItem(newId())]);
    setResult(null);
    setExtractError(null);
  }

  function handlePhotoCapture(index: number) {
    activeExtractIndex.current = index;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const index = activeExtractIndex.current;
    setExtractingIndex(index);
    setExtractError(null);

    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: file.type }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Extraction failed");
      }

      const data = await res.json();
      updateItem(index, {
        ...items[index],
        name: data.name ?? items[index].name,
        price: data.price ?? items[index].price,
        quantity: data.quantity ?? items[index].quantity,
        unit: data.unit ?? items[index].unit,
      });
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Failed to extract from photo");
    } finally {
      setExtractingIndex(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const canCompare = items.filter((i) => i.price > 0 && i.quantity > 0).length >= 2;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {items.map((item, index) => (
        <ItemField
          key={item.id}
          item={item}
          index={index}
          canRemove={items.length > 2}
          onUpdate={(updated) => updateItem(index, updated)}
          onRemove={() => removeItem(index)}
          onPhotoCapture={handlePhotoCapture}
          isExtracting={extractingIndex === index}
        />
      ))}

      {extractingIndex !== null && (
        <p className="text-xs text-center text-muted-foreground animate-pulse">
          Extracting details from photo…
        </p>
      )}

      {extractError && (
        <Alert className="border-red-200 bg-red-50">
          <Warning className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-600 text-sm">
            {extractError}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        {items.length < 3 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item C
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground"
        >
          <ArrowCounterClockwise className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full bg-primary text-primary-foreground font-bold text-base hover:bg-accent"
        onClick={handleCompare}
        disabled={!canCompare}
      >
        Compare Now
      </Button>

      {result && (
        <ResultDisplay result={result} onFavouriteToggle={handleFavouriteToggle} />
      )}
    </div>
  );
}
