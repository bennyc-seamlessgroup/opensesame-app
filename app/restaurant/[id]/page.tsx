"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CartItemRow } from "@/components/cart-item-row";
import { ReviewCard } from "@/components/review-card";
import { SectionHeader } from "@/components/section-header";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { cn, formatHKD, formatPerPersonRange } from "@/lib/utils";

export default function RestaurantDetailPage() {
  const { tx } = useI18n();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { reviews, cartDraft, setCartItem, setBookingDraft } = useAppState();

  const restaurant = restaurants.find((item) => item.id === params.id);
  const requestedMode = search.get("mode") === "takeaway" ? "takeaway" : "book";

  const [datetime, setDatetime] = useState("2026-02-28T19:00");
  const [partySize, setPartySize] = useState(2);
  const [bookingNotes, setBookingNotes] = useState("");

  if (!restaurant) return <p className="text-sm text-muted-foreground">{tx("找不到餐廳。")}</p>;

  const mode =
    requestedMode === "takeaway"
      ? (restaurant.supportsTakeaway ? "takeaway" : "book")
      : (restaurant.supportsBooking ? "book" : "takeaway");

  const restaurantReviews = reviews.filter((review) => review.restaurantId === restaurant.id);
  const mostTrusted = [...restaurantReviews].sort((a, b) => {
    if (a.verifiedVisit !== b.verifiedVisit) return a.verifiedVisit ? -1 : 1;
    if (a.userReputationScore !== b.userReputationScore) return b.userReputationScore - a.userReputationScore;
    return b.aiCitations - a.aiCitations;
  });
  const similar = [...restaurantReviews].sort((a, b) => b.helpedDecisions - a.helpedDecisions);
  const latest = [...restaurantReviews].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const cart = cartDraft[restaurant.id] || {};
  const subtotal = useMemo(
    () =>
      Object.entries(cart).reduce((acc, [menuId, qty]) => {
        const menu = restaurant.takeawayMenu.find((item) => item.id === menuId);
        return acc + (menu?.price || 0) * qty;
      }, 0),
    [cart, restaurant.takeawayMenu]
  );

  return (
    <div className={cn("space-y-4 pb-24", mode === "takeaway" ? "theme-takeaway" : "")}>
      <section className="space-y-3">
        <div className="relative h-44 w-full overflow-hidden rounded-xl">
          <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" />
        </div>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-semibold text-foreground">{restaurant.name}</h2>
            <RestaurantLocationButton restaurant={restaurant} variant="secondary" size="icon" />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{tx("回贈")} {restaurant.rewardYieldPct}% $OSM</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {tx(restaurant.area)} • {tx("距離你約")} {restaurant.distanceKm.toFixed(1)}km • {tx("人均")} {formatPerPersonRange(restaurant.avgSpend)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{restaurant.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {restaurant.supportsBooking ? (
            <Button
              asChild
              variant={mode === "book" ? "default" : "secondary"}
              className="rounded-lg"
            >
              <Link href={`/restaurant/${restaurant.id}?mode=book`}>{tx("Book枱")}</Link>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="rounded-lg opacity-50">
              {tx("Book枱")}
            </Button>
          )}
          {restaurant.supportsTakeaway ? (
            <Button
              asChild
              variant={mode === "takeaway" ? "default" : "secondary"}
              className="rounded-lg"
            >
              <Link href={`/restaurant/${restaurant.id}?mode=takeaway`}>{tx("外賣")}</Link>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="rounded-lg opacity-50">
              {tx("外賣")}
            </Button>
          )}
        </div>
      </section>

      {mode === "book" && restaurant.supportsBooking ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <SectionHeader title={tx("訂枱")} />
            <div className="space-y-1">
              <Label htmlFor="booking-datetime">{tx("日期 / 時間")}</Label>
              <Input id="booking-datetime" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{tx("人數")}</Label>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setPartySize((prev) => Math.max(1, prev - 1))}>-</Button>
                <span className="w-8 text-center">{partySize}</span>
                <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => setPartySize((prev) => prev + 1)}>+</Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="booking-notes">{tx("備註")}</Label>
              <Textarea id="booking-notes" value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} />
            </div>
            <Button
              className="w-full rounded-lg"
              onClick={() => {
                setBookingDraft({ restaurantId: restaurant.id, datetime: new Date(datetime).toISOString(), partySize, notes: bookingNotes });
                router.push(`/checkout?type=booking&restaurantId=${restaurant.id}`);
              }}
            >
              {tx("前往結帳")}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {mode === "takeaway" && restaurant.supportsTakeaway ? (
        <section className="space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <SectionHeader title={tx("外賣餐單")} />
              {restaurant.takeawayMenu.map((item) => (
                <CartItemRow
                  key={item.id}
                  name={item.name}
                  price={item.price}
                  qty={cart[item.id] || 0}
                  onDecrement={() => setCartItem(restaurant.id, item.id, (cart[item.id] || 0) - 1)}
                  onIncrement={() => setCartItem(restaurant.id, item.id, (cart[item.id] || 0) + 1)}
                />
              ))}
            </CardContent>
          </Card>

          <div className="fixed bottom-[78px] left-0 right-0 z-40 px-4">
            <div className="mx-auto flex w-full max-w-[480px] items-center justify-between rounded-xl border border-border bg-card p-2 shadow-lg">
              <p className="text-sm font-medium text-foreground">{tx("小計")}：{formatHKD(subtotal)}</p>
              <Button
                className="rounded-lg"
                disabled={subtotal <= 0}
                onClick={() => router.push(`/checkout?type=takeaway&restaurantId=${restaurant.id}`)}
              >
                {tx("去結帳")}
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <Card>
        <CardContent className="space-y-3 p-4">
          <SectionHeader title={tx("招牌菜式")} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {restaurant.signatureDishes.map((dish) => (
              <div key={dish.name} className="w-32 shrink-0 rounded-lg border border-border/80 p-2">
                <div className="relative mb-2 h-16 w-full overflow-hidden rounded">
                  <Image src={dish.image} alt={dish.name} fill className="object-cover" />
                </div>
                <p className="text-xs font-medium text-foreground">{dish.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <SectionHeader title={tx("回贈資訊")} />
          <p className="text-sm text-foreground">
            {tx("消費")} {formatHKD(500)}，{tx("約可獲")} {Math.round((500 * restaurant.rewardYieldPct) / 100)} $OSM
          </p>
          <p className="text-sm text-foreground">{tx("質押加成 +2%")}</p>
          <p className="text-sm text-foreground">{tx("推薦加成 +1%")}</p>
          <p className="text-xs text-muted-foreground">$OSM {tx("質押年化 4%")}</p>
        </CardContent>
      </Card>

      <section className="space-y-2">
        <SectionHeader title={tx("評論")} />
        <Tabs defaultValue="trusted">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trusted">{tx("最可信")}</TabsTrigger>
            <TabsTrigger value="similar">{tx("同口味")}</TabsTrigger>
            <TabsTrigger value="latest">{tx("最新")}</TabsTrigger>
          </TabsList>
          <TabsContent value="trusted" className="mt-3 space-y-3">{mostTrusted.map((review) => <ReviewCard key={review.id} review={review} />)}</TabsContent>
          <TabsContent value="similar" className="mt-3 space-y-3">{similar.map((review) => <ReviewCard key={review.id} review={review} />)}</TabsContent>
          <TabsContent value="latest" className="mt-3 space-y-3">{latest.map((review) => <ReviewCard key={review.id} review={review} />)}</TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
