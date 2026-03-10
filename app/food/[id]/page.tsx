"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ModeSegmentedControl } from "@/components/mode-segmented-control";
import { RestaurantOptionCard } from "@/components/restaurant-option-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { foodIntents, restaurants } from "@/lib/mock-data";
import { formatHKD } from "@/lib/utils";

export default function FoodDetailPage() {
  const { tx } = useI18n();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { cartDraft, setCartItem } = useAppState();
  const [mode, setMode] = useState<"book" | "takeaway">("book");

  const intent = foodIntents.find((item) => item.id === params.id);

  const options = useMemo(() => {
    if (!intent) return [];
    return intent.recommendedRestaurantIds
      .map((id) => restaurants.find((restaurant) => restaurant.id === id))
      .filter((restaurant): restaurant is (typeof restaurants)[number] => Boolean(restaurant))
      .filter((restaurant) => (mode === "book" ? restaurant.supportsBooking : restaurant.supportsTakeaway));
  }, [intent, mode]);

  const takeawayRestaurant = useMemo(() => {
    if (!intent) return null;
    return (
      restaurants.find((restaurant) => restaurant.id === intent.primaryRestaurantId && restaurant.supportsTakeaway) ||
      options[0] ||
      null
    );
  }, [intent, options]);

  const selectedMenuItem = useMemo(() => {
    if (!intent || !takeawayRestaurant) return null;
    const normalizedTitle = intent.title.toLowerCase();
    const exact = takeawayRestaurant.takeawayMenu.find((item) => item.name.toLowerCase() === normalizedTitle);
    if (exact) return exact;
    const partial = takeawayRestaurant.takeawayMenu.find((item) => normalizedTitle.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(normalizedTitle));
    if (partial) return partial;
    return takeawayRestaurant.takeawayMenu[0] || null;
  }, [intent, takeawayRestaurant]);

  const takeawayCart = takeawayRestaurant ? cartDraft[takeawayRestaurant.id] || {} : {};
  const selectedQty = selectedMenuItem ? takeawayCart[selectedMenuItem.id] || 0 : 0;

  useEffect(() => {
    if (mode !== "takeaway" || !takeawayRestaurant || !selectedMenuItem) return;
    if (selectedQty > 0) return;
    setCartItem(takeawayRestaurant.id, selectedMenuItem.id, 1);
  }, [mode, selectedMenuItem, selectedQty, setCartItem, takeawayRestaurant]);

  const recommendedItems = useMemo(() => {
    if (!takeawayRestaurant || !selectedMenuItem) return [];
    return takeawayRestaurant.takeawayMenu.filter((item) => item.id !== selectedMenuItem.id && item.available).slice(0, 4);
  }, [selectedMenuItem, takeawayRestaurant]);

  const takeawaySubtotal = useMemo(() => {
    if (!takeawayRestaurant) return 0;
    return Object.entries(takeawayCart).reduce((acc, [menuId, qty]) => {
      const menu = takeawayRestaurant.takeawayMenu.find((item) => item.id === menuId);
      return acc + (menu?.price || 0) * qty;
    }, 0);
  }, [takeawayCart, takeawayRestaurant]);

  if (!intent) return <p className="text-sm text-muted-foreground">{tx("Food intent not found.")}</p>;

  return (
    <div className="space-y-4 pb-24">
      <section className="space-y-3">
        <div className="relative h-40 w-full overflow-hidden rounded-xl">
          <Image src={intent.coverImage} alt={intent.title} fill className="object-cover" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{intent.title}</h2>
          <p className="text-sm text-muted-foreground">{intent.subtitle}</p>
          <div className="flex flex-wrap gap-1.5">
            {intent.intentTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>
            ))}
            <Badge variant="secondary" className="text-[11px]">{intent.priceHint}</Badge>
          </div>
        </div>
      </section>

      <ModeSegmentedControl value={mode} onChange={setMode} />

      {mode === "takeaway" && takeawayRestaurant && selectedMenuItem ? (
        <section className="space-y-3">
          <Card className="border-border/80">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{takeawayRestaurant.name}</p>
                  <p className="text-xs text-muted-foreground">{tx(takeawayRestaurant.area)} • {takeawayRestaurant.distanceKm.toFixed(1)}km</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-lg">
                  <Link href={`/restaurant/${takeawayRestaurant.id}?mode=takeaway`}>{tx("View more food")}</Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-border/80 p-3">
                <p className="mb-3 text-sm font-semibold text-foreground">{tx("Selected item")}</p>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border/70">
                    <Image src={selectedMenuItem.image} alt={selectedMenuItem.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{selectedMenuItem.name}</p>
                    <p className="text-xs text-muted-foreground">{formatHKD(selectedMenuItem.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full" onClick={() => setCartItem(takeawayRestaurant.id, selectedMenuItem.id, Math.max(0, selectedQty - 1))}>-</Button>
                    <span className="w-5 text-center text-sm">{selectedQty}</span>
                    <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full" onClick={() => setCartItem(takeawayRestaurant.id, selectedMenuItem.id, selectedQty + 1)}>+</Button>
                  </div>
                </div>
              </div>

              {recommendedItems.length ? (
                <div className="space-y-2 rounded-2xl border border-border/80 p-3">
                  <p className="text-sm font-semibold text-foreground">{tx("Recommended with this dish")}</p>
                  <p className="text-xs text-muted-foreground">{tx("Add drinks or extra dishes before checkout.")}</p>
                  <div className="space-y-2">
                    {recommendedItems.map((item) => {
                      const qty = takeawayCart[item.id] || 0;
                      return (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/70 px-3 py-2">
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border/70">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatHKD(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full" onClick={() => setCartItem(takeawayRestaurant.id, item.id, Math.max(0, qty - 1))}>-</Button>
                            <span className="w-5 text-center text-sm">{qty}</span>
                            <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full" onClick={() => setCartItem(takeawayRestaurant.id, item.id, qty + 1)}>+</Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tx("Subtotal")}</span>
                  <span className="font-medium text-foreground">{formatHKD(takeawaySubtotal)}</span>
                </div>
              </div>

              <Button
                className="w-full rounded-lg"
                disabled={takeawaySubtotal <= 0}
                onClick={() => router.push(`/checkout?type=takeaway&restaurantId=${takeawayRestaurant.id}`)}
              >
                {tx("去結帳")}
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="space-y-3">
          {options.map((restaurant) => (
            <RestaurantOptionCard key={restaurant.id} restaurant={restaurant} mode={mode} />
          ))}
          {options.length === 0 ? <p className="text-sm text-muted-foreground">{tx("No options for this mode.")}</p> : null}
        </section>
      )}
    </div>
  );
}
