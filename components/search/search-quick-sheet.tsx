"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { type SearchFilters, DEFAULT_SEARCH_FILTERS, type SearchServiceMode, type SearchSort } from "@/lib/search-filters";
import { cn } from "@/lib/utils";

type SearchQuickSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
  quickChips?: string[];
  selectedQuickChips?: string[];
  onToggleQuickChip?: (chip: string) => void;
  advancedHref?: string;
  onApply: (filters: SearchFilters) => void;
};

const sortOptions: SearchSort[] = ["熱門", "最新", "高評分", "高回贈", "附近"];
const serviceOptions: SearchServiceMode[] = ["全部", "堂食", "外賣"];
const ANY_AREA = "__any_area";
const ANY_CUISINE = "__any_cuisine";
const ANY_PRICE = "__any_price";

export function SearchQuickSheet({
  open,
  onOpenChange,
  value,
  onChange,
  quickChips = [],
  selectedQuickChips = [],
  onToggleQuickChip,
  advancedHref,
  onApply,
}: SearchQuickSheetProps) {
  const { t, tx } = useI18n();
  const [draft, setDraft] = useState<SearchFilters>(value);

  const areaOptions = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.area).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const cuisineOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of restaurants) for (const tag of r.tags) set.add(tag);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const openChanged = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (nextOpen) setDraft(value);
  };

  const apply = () => {
    onChange(draft);
    onApply(draft);
  };

  const clear = () => {
    setDraft(DEFAULT_SEARCH_FILTERS);
    onChange(DEFAULT_SEARCH_FILTERS);
  };

  return (
    <Sheet open={open} onOpenChange={openChanged}>
      <SheetContent side="bottom" className="max-h-[86vh] rounded-t-2xl px-4 pb-4 pt-4">
        <SheetHeader className="text-left">
          <SheetTitle className="text-base">{t("search")}</SheetTitle>
        </SheetHeader>

        <div className="mt-3 space-y-4">
          <div className="space-y-2">
            <Input
              value={draft.keyword}
              onChange={(e) => setDraft((prev) => ({ ...prev, keyword: e.target.value }))}
              placeholder={t("search_keyword_placeholder")}
              className="h-10 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              className="shrink-0"
              onClick={() => setDraft((prev) => ({ ...prev, area: prev.area === "附近" ? null : "附近" }))}
              aria-label={t("nearby")}
              aria-pressed={draft.area === "附近"}
            >
              <Badge
                variant={draft.area === "附近" ? "default" : "secondary"}
                className="rounded-full px-3 py-1 text-xs"
              >
                {t("nearby")}
              </Badge>
            </button>

            {quickChips.map((chip) => {
              const active = selectedQuickChips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  className="shrink-0"
                  aria-label={tx(chip)}
                  aria-pressed={active}
                  onClick={() => onToggleQuickChip?.(chip)}
                >
                  <Badge
                    variant={active ? "default" : "secondary"}
                    className={cn("rounded-full px-3 py-1 text-xs", active ? "" : "text-foreground")}
                  >
                    {tx(chip)}
                  </Badge>
                </button>
              );
            })}

            {advancedHref ? (
              <Button asChild variant="outline" size="sm" className="h-8 shrink-0 rounded-full px-3 text-xs">
                <Link href={advancedHref}>{t("advanced_search")}</Link>
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={draft.area ?? ANY_AREA}
                onValueChange={(next) =>
                  setDraft((prev) => ({ ...prev, area: next === ANY_AREA ? null : next }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("area")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_AREA}>{t("all_areas")}</SelectItem>
                  {areaOptions.map((area) => (
                    <SelectItem key={area} value={area}>
                      {tx(area)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={draft.cuisine ?? ANY_CUISINE}
                onValueChange={(next) =>
                  setDraft((prev) => ({ ...prev, cuisine: next === ANY_CUISINE ? null : next }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("cuisine")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_CUISINE}>{t("all_cuisines")}</SelectItem>
                  {cuisineOptions.slice(0, 24).map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine}>
                      {tx(cuisine)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={draft.sort} onValueChange={(next) => setDraft((prev) => ({ ...prev, sort: next as SearchSort }))}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("sort")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((sort) => (
                    <SelectItem key={sort} value={sort}>
                      {tx(sort)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Select
                value={draft.serviceMode}
                onValueChange={(next) => setDraft((prev) => ({ ...prev, serviceMode: next as SearchServiceMode }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("service")} />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {tx(mode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={draft.priceRange ?? ANY_PRICE}
                onValueChange={(next) =>
                  setDraft((prev) => ({ ...prev, priceRange: next === ANY_PRICE ? null : (next as any) }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("price")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_PRICE}>{t("all")}</SelectItem>
                  <SelectItem value="$">$</SelectItem>
                  <SelectItem value="$$">$$</SelectItem>
                  <SelectItem value="$$$">$$$</SelectItem>
                  <SelectItem value="$$$$">$$$$</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={draft.highRewardOnly ? "1" : "0"}
                onValueChange={(next) => setDraft((prev) => ({ ...prev, highRewardOnly: next === "1" }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder={t("preference")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("all")}</SelectItem>
                  <SelectItem value="1">{t("high_reward_only")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-4 gap-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="secondary" className="w-full rounded-xl" onClick={clear}>
            {t("clear_filters")}
          </Button>
          <Button
            type="button"
            className="w-full rounded-xl"
            onClick={() => {
              apply();
              onOpenChange(false);
            }}
          >
            {t("show_results")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
