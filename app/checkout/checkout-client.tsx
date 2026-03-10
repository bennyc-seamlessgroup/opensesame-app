"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { cn, formatDateTime, formatHKD } from "@/lib/utils";

type CheckoutClientProps = {
  type?: string;
  restaurantId?: string;
};

export function CheckoutClient({ type: rawType, restaurantId = "" }: CheckoutClientProps) {
  const { tx } = useI18n();
  const router = useRouter();
  const type = rawType === "booking" ? "booking" : "takeaway";
  const { bookingDraft, cartDraft, setCartItem, createBookingFromDraft, createOrderFromCart } = useAppState();
  const [depositRequired, setDepositRequired] = useState(false);

  const restaurant = restaurants.find((item) => item.id === restaurantId);
  const cart = cartDraft[restaurantId] || {};
  const cartMenuIds = useMemo(() => new Set(Object.keys(cart)), [cart]);

  const addOnSuggestions = useMemo(() => {
    if (!restaurant) return [];
    const candidates = restaurant.takeawayMenu.filter((item) => item.available && !cartMenuIds.has(item.id));
    const score = (item: (typeof restaurant.takeawayMenu)[number]) => {
      const tags = new Set(item.tags);
      return (tags.has("Top") ? 10 : 0) + (tags.has("Snack") ? 2 : 0) + (tags.has("Mixed") ? 1 : 0);
    };
    return [...candidates].sort((a, b) => score(b) - score(a)).slice(0, 3);
  }, [cartMenuIds, restaurant]);

  const nearbyRestaurants = useMemo(() => {
    if (!restaurant) return [];
    const candidates = restaurants
      .filter((item) => item.id !== restaurant.id && item.supportsTakeaway)
      .map((item) => {
        const sameArea = item.area === restaurant.area ? 1 : 0;
        const distanceCloseness = Math.max(0, 3 - Math.abs(item.distanceKm - restaurant.distanceKm));
        return { item, score: sameArea * 5 + distanceCloseness };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);

    return candidates.slice(0, 2);
  }, [restaurant]);

  const subtotal = useMemo(() => {
    if (!restaurant) return 0;
    return Object.entries(cart).reduce((acc, [menuId, qty]) => {
      const menu = restaurant.takeawayMenu.find((item) => item.id === menuId);
      return acc + (menu?.price || 0) * qty;
    }, 0);
  }, [cart, restaurant]);

  if (!restaurant) return <p className="text-sm text-muted-foreground">{tx("Checkout context missing.")}</p>;

  const rewardEstimate =
    type === "booking"
      ? Math.round((restaurant.avgSpend * restaurant.rewardYieldPct) / 100)
      : Math.round((subtotal * restaurant.rewardYieldPct) / 100);

  return (
    <div className={cn("space-y-4", type === "takeaway" ? "theme-takeaway" : "")}>
      <SectionHeader title={tx("Checkout")} subtitle={tx("Unified checkout for booking/takeaway")} />

      {type === "booking" ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">{restaurant.name}</p>
            <p className="text-sm text-muted-foreground">{tx("Time")}: {bookingDraft ? formatDateTime(bookingDraft.datetime) : tx("Not set")}</p>
            <p className="text-sm text-muted-foreground">{tx("Party size")}: {bookingDraft?.partySize ?? 0}</p>
            <div className="flex items-center justify-between rounded-lg border border-border/80 p-3">
              <p className="text-sm text-foreground">{tx("Deposit required?")}</p>
              <Switch checked={depositRequired} onCheckedChange={setDepositRequired} />
            </div>
            <p className="text-sm text-foreground">{tx("Reward estimate")}: {rewardEstimate} $OSM</p>
            <Button
              className="w-full rounded-lg"
              onClick={() => {
                const bookingId = createBookingFromDraft();
                if (!bookingId) return;
                router.push(`/pay?context=booking&bookingId=${bookingId}`);
              }}
            >
              {tx("Proceed to Pay/Verify")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">{restaurant.name}</p>
            <div className="space-y-2">
              {Object.entries(cart).map(([menuId, qty]) => {
                const item = restaurant.takeawayMenu.find((menu) => menu.id === menuId);
                if (!item) return null;
                return (
                  <div key={menuId} className="flex items-center justify-between text-sm">
                    <span>{item.name} x{qty}</span>
                    <span>{formatHKD(item.price * qty)}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-foreground">{tx("Subtotal")}: {formatHKD(subtotal)}</p>
            <p className="text-sm text-foreground">{tx("Reward estimate")}: {rewardEstimate} $OSM</p>

            {addOnSuggestions.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-border/80 p-3">
                <p className="text-sm font-semibold text-foreground">{tx("多人分享建議")}</p>
                <p className="text-xs text-muted-foreground">{tx("幫家人／朋友加多兩三樣，同一間店一齊拎。")}</p>
                <div className="space-y-2">
                  {addOnSuggestions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatHKD(item.price)}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 rounded-lg"
                        onClick={() => setCartItem(restaurant.id, item.id, 1)}
                      >
                        {tx("Add")}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {nearbyRestaurants.length > 0 ? (
              <div className="space-y-2 rounded-lg border border-border/80 p-3">
                <p className="text-sm font-semibold text-foreground">{tx("附近其他外賣")}</p>
                <p className="text-xs text-muted-foreground">{tx("同區域／距離相近，方便一齊拎。")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {nearbyRestaurants.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-auto justify-start rounded-lg px-3 py-2 text-left"
                      onClick={() => router.push(`/restaurant/${item.id}?mode=takeaway`)}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{tx(item.area)} • {item.distanceKm.toFixed(1)}km</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}

            <Button
              className="w-full rounded-lg"
              disabled={subtotal <= 0}
              onClick={() => {
                const orderId = createOrderFromCart(restaurant.id);
                if (!orderId) return;
                router.push(`/pay?context=order&orderId=${orderId}`);
              }}
            >
              {tx("Proceed to Pay/Verify")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
