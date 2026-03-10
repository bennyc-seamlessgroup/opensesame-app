"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bookmark, ChevronDown, ChevronLeft, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { SearchQuickSheet } from "@/components/search/search-quick-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { user } from "@/lib/mock-data";
import { HONG_KONG_LOCATION_OPTIONS } from "@/lib/hk-locations";
import { useI18n } from "@/lib/i18n";
import {
  DEFAULT_SEARCH_FILTERS,
  getSearchSummary,
  parseSearchFiltersFromParams,
  toSearchParams,
  type SearchFilters,
} from "@/lib/search-filters";

export function AppTopHeader() {
  const { t, tx } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAiPage = pathname === "/ai";
  const isExplorePage = pathname === "/explore";
  const isRootTabPage = pathname === "/orders" || pathname === "/wallet" || pathname === "/profile" || pathname === "/";
  const isInnerPage = !isAiPage && !isExplorePage && !isRootTabPage;
  const currentLocation = user.preferences.areas[0] || "Current Location";
  const [aiFilters, setAiFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);
  const [exploreFilters, setExploreFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false);
  const [exploreLocationOpen, setExploreLocationOpen] = useState(false);

  const exploreUrlFilters = useMemo(() => {
    return parseSearchFiltersFromParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  useEffect(() => {
    if (!isExplorePage) return;
    setExploreFilters(exploreUrlFilters);
  }, [exploreUrlFilters, isExplorePage]);

  useEffect(() => {
    if (!isExplorePage) return;
    const openFilters = () => setExploreSheetOpen(true);
    const openLocation = () => setExploreLocationOpen(true);
    window.addEventListener("opensesame:openExploreFilters", openFilters);
    window.addEventListener("opensesame:openExploreLocation", openLocation);
    return () => {
      window.removeEventListener("opensesame:openExploreFilters", openFilters);
      window.removeEventListener("opensesame:openExploreLocation", openLocation);
    };
  }, [isExplorePage]);

  const aiSearchText = useMemo(() => {
    if (aiFilters.keyword.trim()) return aiFilters.keyword.trim();
    return getSearchSummary(aiFilters);
  }, [aiFilters]);

  const exploreSearchText = useMemo(() => {
    if (exploreFilters.keyword.trim()) return exploreFilters.keyword.trim();
    return getSearchSummary(exploreFilters);
  }, [exploreFilters]);

  const aiAdvancedHref = useMemo(() => {
    const params = toSearchParams(aiFilters);
    const suffix = params.toString();
    return suffix ? `/search/advanced?${suffix}` : "/search/advanced";
  }, [aiFilters]);

  const exploreLocationLabel = exploreFilters.area || currentLocation;

  const exploreAreaOptions = useMemo(() => {
    const set = new Set<string>(HONG_KONG_LOCATION_OPTIONS);
    for (const area of user.preferences.areas) if (area) set.add(area);
    if (currentLocation) set.add(currentLocation);
    return Array.from(set);
  }, [currentLocation]);

  const pushExplore = (nextFilters: SearchFilters) => {
    const params = toSearchParams(nextFilters);
    const suffix = params.toString();
    router.push(suffix ? `/explore?${suffix}` : "/explore");
  };

  if (isRootTabPage) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between">
        {isAiPage ? (
          <div className="flex w-full items-center gap-2">
            <p className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-foreground">
              <MapPin className="h-4 w-4" />
              <span>{currentLocation}</span>
            </p>
            <SearchBar
              text={aiSearchText}
              onClick={() => setAiSheetOpen(true)}
              className="h-9 flex-1 border-border/80 px-3 shadow-none"
            />
            <SearchQuickSheet
              open={aiSheetOpen}
              onOpenChange={setAiSheetOpen}
              value={aiFilters}
              onChange={setAiFilters}
              advancedHref={aiAdvancedHref}
              onApply={(nextFilters) => {
                const params = toSearchParams(nextFilters);
                const suffix = params.toString();
                router.push(suffix ? `/explore?${suffix}` : "/explore");
              }}
            />
          </div>
        ) : isExplorePage ? (
          <div className="flex w-full items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="h-9 shrink-0 gap-1 rounded-full px-2 text-sm font-semibold tracking-tight"
              onClick={() => setExploreLocationOpen(true)}
              aria-label={t("select_location")}
            >
              <MapPin className="h-4 w-4" />
              <span className="max-w-[88px] truncate">{exploreLocationLabel}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>

            <SearchBar
              text={exploreSearchText}
              placeholder={t("restaurant_food_address")}
              onClick={() => setExploreSheetOpen(true)}
              className="h-9 flex-1 border-border/80 px-3 shadow-none"
            />

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => router.push("/saved")}
              aria-label={t("saved")}
            >
              <Bookmark className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => setExploreSheetOpen(true)}
              aria-label={t("filter")}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>

            <SearchQuickSheet
              open={exploreSheetOpen}
              onOpenChange={setExploreSheetOpen}
              value={exploreFilters}
              onChange={setExploreFilters}
              onApply={(nextFilters) => pushExplore(nextFilters)}
            />

            <Sheet open={exploreLocationOpen} onOpenChange={setExploreLocationOpen}>
              <SheetContent side="bottom" className="max-h-[76vh] rounded-t-2xl px-4 pb-4 pt-4">
                <SheetHeader className="text-left">
                  <SheetTitle className="text-base">{t("select_location")}</SheetTitle>
                </SheetHeader>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {exploreAreaOptions.map((area) => {
                    const active = exploreFilters.area === area || (!exploreFilters.area && area === currentLocation);
                    return (
                      <Button
                        key={area}
                        type="button"
                        variant={active ? "default" : "secondary"}
                        className="h-10 justify-start rounded-xl"
                        onClick={() => {
                          const next = { ...exploreFilters, area };
                          setExploreFilters(next);
                          setExploreLocationOpen(false);
                          pushExplore(next);
                        }}
                      >
                        {tx(area)}
                      </Button>
                    );
                  })}
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 justify-start rounded-xl"
                    onClick={() => {
                      const next = { ...exploreFilters, area: null };
                      setExploreFilters(next);
                      setExploreLocationOpen(false);
                      pushExplore(next);
                    }}
                  >
                    {t("any_location")}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : isInnerPage ? (
          <div className="flex w-full items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => {
                if (window.history.length > 1) router.back();
                else router.push("/explore");
              }}
              aria-label={tx("Back")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
}
