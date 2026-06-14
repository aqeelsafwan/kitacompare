"use client";

import Link from "next/link";
import { ArrowLeft, Camera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ComparisonForm from "@/components/ComparisonForm";

export default function ComparePage() {
  return (
    <main className="flex flex-col min-h-dvh px-4 pt-4 pb-8 safe-bottom">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold text-foreground">New Comparison</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Enter details manually or use{" "}
            <Camera className="h-3 w-3 inline" /> to capture from photo
          </p>
        </div>
      </div>

      <ComparisonForm />
    </main>
  );
}
