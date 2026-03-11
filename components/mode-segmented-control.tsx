"use client";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ModeSegmentedControlProps = {
  value: "book" | "takeaway";
  onChange: (value: "book" | "takeaway") => void;
};

export function ModeSegmentedControl({ value, onChange }: ModeSegmentedControlProps) {
  const { tx } = useI18n();
  return (
    <div className="grid grid-cols-2 rounded-xl border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => onChange("book")}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          value === "book" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {tx("Book")}
      </button>
      <button
        type="button"
        onClick={() => onChange("takeaway")}
        className={cn(
          "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          value === "takeaway" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
        )}
      >
        {tx("Takeaway")}
      </button>
    </div>
  );
}
