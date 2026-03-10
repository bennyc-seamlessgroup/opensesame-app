"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { getBookingDepositAmount } from "@/lib/payment";
import { cn, formatDateTime, formatHKD } from "@/lib/utils";

type CheckoutClientProps = {
  type?: string;
  restaurantId?: string;
};

export function CheckoutClient({ type: rawType, restaurantId = "" }: CheckoutClientProps) {
  const { tx } = useI18n();
  const router = useRouter();
  const type = rawType === "booking" ? "booking" : "takeaway";
  const { bookingDraft, cartDraft, createBookingFromDraft, createOrderFromCart, wallet } = useAppState();
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "apple_pay">("credit_card");
  const [useWalletOffset, setUseWalletOffset] = useState(true);

  const restaurant = restaurants.find((item) => item.id === restaurantId);
  const cart = cartDraft[restaurantId] || {};
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

  const depositAmount = getBookingDepositAmount(restaurant);
  const payableAmount = type === "booking" ? depositAmount : subtotal;
  const walletOffset = useWalletOffset ? Math.min(wallet.viraBalance, payableAmount) : 0;
  const remainingAmount = Math.max(0, payableAmount - walletOffset);
  const spendReward = Math.round((subtotal * restaurant.rewardYieldPct) / 100);
  const creditCardLabel = "Visa •••• 4356";

  return (
    <div className={cn("space-y-4", type === "takeaway" ? "theme-takeaway" : "")}>
      <SectionHeader title={tx("Checkout")} subtitle={tx("Unified checkout for booking/takeaway")} />

      {type === "booking" ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-foreground">{restaurant.name}</p>
            <p className="text-sm text-muted-foreground">{tx("Time")}: {bookingDraft ? formatDateTime(bookingDraft.datetime) : tx("Not set")}</p>
            <p className="text-sm text-muted-foreground">{tx("Party size")}: {bookingDraft?.partySize ?? 0}</p>
            <div className="rounded-lg border border-border/80 p-3">
              <p className="text-sm font-medium text-foreground">{depositAmount > 0 ? tx("需要訂金") : tx("毋須訂金")}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {depositAmount > 0 ? `${tx("訂金")}: ${formatHKD(depositAmount)}` : tx("此訂座無需預先支付訂金。")}
              </p>
            </div>
            <div className="space-y-3 rounded-lg border border-border/80 p-3">
              <p className="text-sm font-medium text-foreground">{tx("付款方式")}</p>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "credit_card" | "apple_pay")} className="space-y-2">
                <Label className="flex items-center gap-3 rounded-lg border border-border/80 px-3 py-3">
                  <RadioGroupItem value="credit_card" />
                  <span className="text-sm text-foreground">{tx("Credit Card")} · {creditCardLabel}</span>
                </Label>
                <Label className="flex items-center gap-3 rounded-lg border border-border/80 px-3 py-3">
                  <RadioGroupItem value="apple_pay" />
                  <span className="text-sm text-foreground">{tx("Apple Pay")}</span>
                </Label>
              </RadioGroup>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx("使用 $OSM 抵扣")}</p>
                  <p className="text-xs text-muted-foreground">{tx("最多可抵扣")} {formatHKD(walletOffset)}</p>
                </div>
                <Switch checked={useWalletOffset} onCheckedChange={setUseWalletOffset} />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{tx("訂金")}</span>
                  <span>{formatHKD(depositAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{tx("使用 $OSM")}</span>
                  <span>- {formatHKD(walletOffset)}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>{tx("尚需支付")}</span>
                  <span>{formatHKD(remainingAmount)}</span>
                </div>
              </div>
            </div>
            <Button
              className="w-full rounded-lg"
              onClick={() => {
                const bookingId = createBookingFromDraft();
                if (!bookingId) return;
                router.push(`/pay?context=booking&bookingId=${bookingId}&method=${paymentMethod}&wallet=${useWalletOffset ? "1" : "0"}`);
              }}
            >
              {depositAmount > 0 ? tx("去付款") : tx("確認訂座")}
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
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-lg"
              onClick={() => router.push(`/restaurant/${restaurant.id}?mode=takeaway`)}
            >
              {tx("View more food")}
            </Button>
            <p className="text-sm text-foreground">{tx("Subtotal")}: {formatHKD(subtotal)}</p>
            <p className="text-sm text-foreground">{tx("消費回贈")}: {spendReward} $OSM</p>

            <div className="space-y-3 rounded-lg border border-border/80 p-3">
              <p className="text-sm font-medium text-foreground">{tx("付款方式")}</p>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "credit_card" | "apple_pay")} className="space-y-2">
                <Label className="flex items-center gap-3 rounded-lg border border-border/80 px-3 py-3">
                  <RadioGroupItem value="credit_card" />
                  <span className="text-sm text-foreground">{tx("Credit Card")} · {creditCardLabel}</span>
                </Label>
                <Label className="flex items-center gap-3 rounded-lg border border-border/80 px-3 py-3">
                  <RadioGroupItem value="apple_pay" />
                  <span className="text-sm text-foreground">{tx("Apple Pay")}</span>
                </Label>
              </RadioGroup>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx("使用 $OSM 抵扣")}</p>
                  <p className="text-xs text-muted-foreground">{tx("最多可抵扣")} {formatHKD(walletOffset)}</p>
                </div>
                <Switch checked={useWalletOffset} onCheckedChange={setUseWalletOffset} />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{tx("Subtotal")}</span>
                  <span>{formatHKD(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{tx("使用 $OSM")}</span>
                  <span>- {formatHKD(walletOffset)}</span>
                </div>
                <div className="flex items-center justify-between font-medium text-foreground">
                  <span>{tx("尚需支付")}</span>
                  <span>{formatHKD(remainingAmount)}</span>
                </div>
              </div>
            </div>

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
                router.push(`/pay?context=order&orderId=${orderId}&method=${paymentMethod}&wallet=${useWalletOffset ? "1" : "0"}`);
              }}
            >
              {tx("去付款")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
