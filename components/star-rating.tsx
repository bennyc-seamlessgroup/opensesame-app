"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
};

export function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className={cn(readOnly ? "cursor-default" : "cursor-pointer")}
        >
          <Star
            className={cn(
              size === "sm" ? "h-4 w-4" : "h-5 w-5",
              star <= value ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
