"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { HONG_KONG_LOCATION_OPTIONS } from "@/lib/hk-locations";
import { restaurants } from "@/lib/mock-data";
import {
  DEFAULT_SEARCH_FILTERS,
  getSearchSummary,
  parseSearchFiltersFromParams,
  toSearchParams,
  type SearchFilters,
  type SearchSort,
  type SearchServiceMode,
} from "@/lib/search-filters";

const sortOptions: SearchSort[] = ["熱門", "最新", "高評分", "高回贈", "附近"];
const serviceOptions: SearchServiceMode[] = ["全部", "堂食", "外賣"];
const ANY_PRICE = "__any_price";

export function AdvancedSearchClient({ initialQuery }: { initialQuery: string }) {
  const { tx } = useI18n();
  const router = useRouter();
  const initial = useMemo(() => parseSearchFiltersFromParams(new URLSearchParams(initialQuery)), [initialQuery]);
  const [filters, setFilters] = useState<SearchFilters>(initial || DEFAULT_SEARCH_FILTERS);

  const areaOptions = useMemo(() => {
    const set = new Set<string>(HONG_KONG_LOCATION_OPTIONS);
    for (const area of restaurants.map((r) => r.area).filter(Boolean)) set.add(area);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const cuisineOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of restaurants) for (const tag of r.tags) set.add(tag);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const appliedSummary = getSearchSummary(filters);

  return (
    <div className="space-y-4 pb-24">
      <SectionHeader
        title={tx("Advanced Search")}
        subtitle={appliedSummary ? tx(appliedSummary) : tx("更多條件（demo）")}
      />

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">{tx("地區")}</p>
          <div className="flex flex-wrap gap-2">
            {areaOptions.slice(0, 8).map((area) => {
              const active = filters.area === area;
              return (
                <button
                  key={area}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters((prev) => ({ ...prev, area: active ? null : area }))}
                >
                  <Badge variant={active ? "default" : "secondary"} className="rounded-full px-3 py-1 text-xs">
                    {tx(area)}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">{tx("菜式 / 類型")}</p>
          <div className="flex flex-wrap gap-2">
            {cuisineOptions.slice(0, 12).map((cuisine) => {
              const active = filters.cuisine === cuisine;
              return (
                <button
                  key={cuisine}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters((prev) => ({ ...prev, cuisine: active ? null : cuisine }))}
                >
                  <Badge variant={active ? "default" : "secondary"} className="rounded-full px-3 py-1 text-xs">
                    {tx(cuisine)}
                  </Badge>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-semibold text-foreground">{tx("服務 / 排序 / 價格")}</p>

          <div className="grid grid-cols-3 gap-2">
            <Select
              value={filters.serviceMode}
              onValueChange={(next) => setFilters((prev) => ({ ...prev, serviceMode: next as SearchServiceMode }))}
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder={tx("服務")} />
              </SelectTrigger>
              <SelectContent>
                {serviceOptions.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {tx(mode)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.sort} onValueChange={(next) => setFilters((prev) => ({ ...prev, sort: next as SearchSort }))}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder={tx("排序")} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((sort) => (
                  <SelectItem key={sort} value={sort}>
                    {tx(sort)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priceRange ?? ANY_PRICE}
              onValueChange={(next) =>
                setFilters((prev) => ({ ...prev, priceRange: next === ANY_PRICE ? null : (next as any) }))
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder={tx("價位")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_PRICE}>{tx("不限")}</SelectItem>
                <SelectItem value="$">$</SelectItem>
                <SelectItem value="$$">$$</SelectItem>
                <SelectItem value="$$$">$$$</SelectItem>
                <SelectItem value="$$$$">$$$$</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border/80 p-3">
            <div>
              <p className="text-sm font-medium text-foreground">{tx("只顯示高回贈")}</p>
              <p className="text-xs text-muted-foreground">{tx("示範：回贈 ≥ 5%")}</p>
            </div>
            <Switch checked={filters.highRewardOnly} onCheckedChange={(checked) => setFilters((prev) => ({ ...prev, highRewardOnly: checked }))} />
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-[78px] left-0 right-0 z-40 px-4">
        <div className="mx-auto flex w-full max-w-[480px] items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg">
          <Button
            type="button"
            variant="secondary"
            className="h-10 flex-1 rounded-lg"
            onClick={() => setFilters(DEFAULT_SEARCH_FILTERS)}
          >
            {tx("清除")}
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 rounded-lg"
            onClick={() => {
              const params = toSearchParams(filters);
              router.push(`/explore?${params.toString()}`);
            }}
          >
            {tx("套用篩選")}
          </Button>
        </div>
      </div>
    </div>
  );
}
