"use client";

import { Flame, Menu, Search, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n";
import { type MenuItem, type MenuSection, type Restaurant } from "@/lib/mock-data";
import { cn, formatHKD } from "@/lib/utils";

type RestaurantMenuButtonProps = {
  restaurant: Restaurant;
  variant?: "ghost" | "secondary" | "outline";
  className?: string;
  label?: string;
};

export function RestaurantMenuButton({
  restaurant,
  variant = "secondary",
  className,
  label = "Menu",
}: RestaurantMenuButtonProps) {
  const { tx } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);

  const availableTakeaway = useMemo(
    () => (restaurant.takeawayMenu || []).filter((item) => item.available),
    [restaurant.takeawayMenu]
  );

  const takeawaySections = useMemo(() => buildTakeawaySections(restaurant.takeawayMenu || []), [restaurant.takeawayMenu]);

  const dineInSections = useMemo(() => {
    if (restaurant.menu?.dineInSections?.length) return restaurant.menu.dineInSections;
    return buildFallbackDineInSections(restaurant);
  }, [restaurant]);

  const drinksSections = useMemo(() => {
    if (restaurant.menu?.drinksSections?.length) return restaurant.menu.drinksSections;
    return [];
  }, [restaurant.menu?.drinksSections]);

  const menuMeta = restaurant.menu;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        className={cn("h-8 gap-1.5 px-3 text-xs", className)}
        aria-label={tx("查看餐單")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Menu className="h-4 w-4" />
        <span>{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-1">
              <span className="text-base sm:text-lg">{restaurant.name} Menu</span>
              <span className="text-xs font-normal text-muted-foreground">
                {tx(restaurant.area)} • {restaurant.distanceKm.toFixed(1)} km • {tx("更新")} {menuMeta?.lastUpdated ?? "—"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tx("搜尋：菜式 / 關鍵字")}
                  className="h-9 pl-9 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={popularOnly ? "secondary" : "outline"}
                  size="sm"
                  className="h-9 gap-1.5 rounded-full px-3 text-xs"
                  onClick={() => setPopularOnly((v) => !v)}
                >
                  <Star className="h-4 w-4" />
                  {tx("熱門")}
                </Button>
                <Button
                  type="button"
                  variant={availableOnly ? "secondary" : "outline"}
                  size="sm"
                  className="h-9 gap-1.5 rounded-full px-3 text-xs"
                  onClick={() => setAvailableOnly((v) => !v)}
                >
                  <Sparkles className="h-4 w-4" />
                  {tx("只看供應中")}
                </Button>
              </div>
            </div>

            <Card className="border-border/80">
              <CardContent className="space-y-2 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {menuMeta?.serviceNotes?.length
                    ? menuMeta.serviceNotes.slice(0, 4).map((note) => (
                        <Badge key={note} variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                          {note}
                        </Badge>
                      ))
                    : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {tx("堂食：")}{tx(restaurant.bookingNotes)}　{tx("外賣：")}{tx(restaurant.takeawayNotes)}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="dinein" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dinein">{tx("堂食")}</TabsTrigger>
                <TabsTrigger value="takeaway">{tx("外賣")}</TabsTrigger>
                <TabsTrigger value="drinks">{tx("飲品")}</TabsTrigger>
              </TabsList>

              <TabsContent value="dinein" className="mt-3">
                <MenuSectionsView sections={dineInSections} query={query} popularOnly={popularOnly} availableOnly={availableOnly} />
              </TabsContent>

              <TabsContent value="takeaway" className="mt-3">
                {restaurant.supportsTakeaway && restaurant.takeawayMenu.length ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{tx("外賣可下單項目（以 App 內供應為準）")}</span>
                      <span>
                        {availableTakeaway.length}/{restaurant.takeawayMenu.length} {tx("供應中")}
                      </span>
                    </div>
                    <MenuSectionsView sections={takeawaySections} query={query} popularOnly={popularOnly} availableOnly={availableOnly} />
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/80 p-4 text-sm text-muted-foreground">{tx("此店暫不提供外賣。")}</div>
                )}
              </TabsContent>

              <TabsContent value="drinks" className="mt-3">
                {drinksSections.length ? (
                  <MenuSectionsView sections={drinksSections} query={query} popularOnly={popularOnly} availableOnly={availableOnly} />
                ) : (
                  <div className="rounded-lg border border-border/80 p-4 text-sm text-muted-foreground">{tx("暫無飲品餐單資料。")}</div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          <DialogFooter>
            <p className="mr-auto hidden text-xs text-muted-foreground sm:block">{tx("示範餐單｜價格僅供 demo 參考")}</p>
            <Button variant="ghost" className="rounded-lg" onClick={() => setOpen(false)}>
              {tx("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function buildFallbackDineInSections(restaurant: Restaurant): MenuSection[] {
  const recommended: MenuItem[] = (restaurant.signatureDishes || []).map((dish, index) => ({
    id: `${restaurant.id}-sig-${index}`,
    name: dish.name,
    description: dish.tags?.length ? dish.tags.join(" • ") : undefined,
    tags: ["Recommended"],
    isPopular: true,
  }));

  return recommended.length
    ? [
        {
          id: `${restaurant.id}-recommended`,
          title: "Recommended",
          items: recommended,
        },
      ]
    : [];
}

function buildTakeawaySections(takeawayMenu: Restaurant["takeawayMenu"]): MenuSection[] {
  const items: MenuItem[] = takeawayMenu.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    tags: item.tags,
    available: item.available,
    isPopular: item.tags?.some((tag) => /best|top|popular/i.test(tag)),
  }));

  const buckets = new Map<string, MenuItem[]>();
  for (const item of items) {
    const title = classifyTakeawayItem(item);
    buckets.set(title, [...(buckets.get(title) ?? []), item]);
  }

  return Array.from(buckets.entries()).map(([title, bucketItems], index) => ({
    id: `takeaway-${index}`,
    title,
    items: bucketItems,
  }));
}

function classifyTakeawayItem(item: MenuItem) {
  const tags = (item.tags ?? []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("coffee"))) return "Coffee & Drinks 飲品";
  if (tags.some((t) => t.includes("bakery") || t.includes("tart"))) return "Bakery 烘焙";
  if (tags.some((t) => t.includes("soup"))) return "Soup 湯";
  if (tags.some((t) => t.includes("side") || t.includes("snack"))) return "Sides 小食";
  if (tags.some((t) => t.includes("rice"))) return "Rice 飯";
  if (tags.some((t) => t.includes("noodle"))) return "Noodles 麵";
  return "Takeaway 外賣";
}

function MenuSectionsView({
  sections,
  query,
  popularOnly,
  availableOnly,
}: {
  sections: MenuSection[];
  query: string;
  popularOnly: boolean;
  availableOnly: boolean;
}) {
  const { tx } = useI18n();
  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    const filterItem = (item: MenuItem) => {
      if (popularOnly && !item.isPopular) return false;
      if (availableOnly && item.available === false) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        item.name,
        item.description ?? "",
        ...(item.tags ?? []),
        ...(item.allergens ?? []),
        ...(item.variants?.map((v) => v.name) ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    };

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(filterItem),
      }))
      .filter((section) => section.items.length > 0);
  }, [availableOnly, normalizedQuery, popularOnly, sections]);

  if (!filteredSections.length) {
    return <div className="rounded-lg border border-border/80 p-4 text-sm text-muted-foreground">{tx("沒有符合條件的項目。")}</div>;
  }

  const defaultOpen = filteredSections.slice(0, 2).map((s) => s.id);

  return (
    <div className="rounded-lg border border-border/80">
      <ScrollArea className="h-[52vh]">
        <div className="px-3">
          <Accordion type="multiple" defaultValue={defaultOpen}>
            {filteredSections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="py-3 text-sm">
                  <div className="flex w-full items-start justify-between gap-3 text-left">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{tx(section.title)}</p>
                      {section.subtitle ? <p className="truncate text-xs text-muted-foreground">{tx(section.subtitle)}</p> : null}
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full px-2 py-0.5 text-[11px]">
                      {section.items.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <MenuItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const { tx } = useI18n();
  const muted = item.available === false;
  const variants = item.variants?.filter(Boolean) ?? [];
  const hasVariants = variants.length > 0;
  const minVariantPrice = hasVariants ? Math.min(...variants.map((v) => v.price)) : undefined;

  return (
    <div className={cn("rounded-lg border border-border/70 p-3", muted && "opacity-70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={cn("min-w-0 truncate text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
              {item.name}
            </p>
            {item.isPopular ? (
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                {tx("熱門")}
              </Badge>
            ) : null}
            {item.spicyLevel && item.spicyLevel > 0 ? (
              <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[11px]">
                <Flame className="mr-1 h-3 w-3" />
                {tx("辣")}{item.spicyLevel}
              </Badge>
            ) : null}
          </div>
          {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
          {item.tags?.length ? (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 6).map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full px-2 py-0.5 text-[11px] text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
          {item.allergens?.length ? (
            <p className="text-[11px] text-muted-foreground">Allergens: {item.allergens.join(", ")}</p>
          ) : null}
          {hasVariants ? (
            <p className="text-[11px] text-muted-foreground">
              {variants
                .slice(0, 4)
                .map((variant) => `${variant.name} ${formatHKD(variant.price)}`)
                .join(" • ")}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <p className={cn("text-sm font-medium", muted ? "text-muted-foreground" : "text-foreground")}>
            {typeof item.price === "number"
              ? formatHKD(item.price)
              : typeof minVariantPrice === "number"
                ? `From ${formatHKD(minVariantPrice)}`
                : "—"}
          </p>
          {muted ? <p className="text-[11px] text-muted-foreground">{tx("Sold out")}</p> : null}
        </div>
      </div>
    </div>
  );
}
