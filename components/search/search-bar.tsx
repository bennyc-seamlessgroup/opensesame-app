"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  text: string;
  placeholder?: string;
  onClick: () => void;
  className?: string;
};

export function SearchBar({ text, placeholder = "餐廳、地區/地址、菜式/食品…", onClick, className }: SearchBarProps) {
  const { t, tx } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const display = mounted ? tx(text.trim()) || tx(placeholder) : text.trim() || placeholder;
  const muted = !text.trim();
  const ariaLabel = mounted ? t("open_search_filters") : "Open search filters";

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-11 w-full justify-between rounded-full border-border/80 bg-card px-4 text-left shadow-sm hover:bg-accent",
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span
          className={cn("min-w-0 truncate text-sm", muted ? "text-muted-foreground" : "text-foreground")}
          suppressHydrationWarning
        >
          {display}
        </span>
      </span>
      <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Button>
  );
}
