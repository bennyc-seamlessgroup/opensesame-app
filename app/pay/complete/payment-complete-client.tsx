"use client";

import Link from "next/link";
import { CheckCircle2, ClipboardList, Home, Store } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { formatHKD } from "@/lib/utils";

type PaymentCompleteClientProps = {
  context?: string;
  orderId?: string;
  bookingId?: string;
  method?: string;
  walletOffset?: string;
};

export function PaymentCompleteClient({ context, orderId, bookingId, method, walletOffset }: PaymentCompleteClientProps) {
  const { tx } = useI18n();
  const { orders, bookings } = useAppState();

  const booking = context === "booking" && bookingId ? bookings.find((item) => item.id === bookingId) : null;
  const order = context === "order" && orderId ? orders.find((item) => item.id === orderId) : null;
  const restaurantId = booking?.restaurantId || order?.restaurantId;
  const restaurant = restaurantId ? restaurants.find((item) => item.id === restaurantId) : null;
  const detailHref = booking ? `/orders/booking/${booking.id}` : order ? `/orders/takeaway/${order.id}` : "/orders";
  const restaurantHref = restaurant ? `/restaurant/${restaurant.id}?mode=${booking ? "book" : "takeaway"}` : "/explore";
  const methodLabel = method === "apple_pay" ? tx("Apple Pay") : `${tx("Credit Card")} · Visa •••• 4356`;
  const walletValue = Number(walletOffset || "0");
  const orderReward = order?.rewardEstimateVira ?? 0;

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader title="Payment Complete" subtitle="" />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-5 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">{tx("付款完成")}</p>
            <p className="text-sm text-muted-foreground">
              {restaurant ? `${restaurant.name} • ${methodLabel}` : methodLabel}
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 text-left text-sm">
            {order ? (
              <div className="mb-2 flex items-center justify-between">
                <span className="text-muted-foreground">{tx("訂單編號")}</span>
                <span className="font-medium text-foreground">{order.id}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tx("付款方式")}</span>
              <span className="font-medium text-foreground">{methodLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">{tx("使用 $OSM")}</span>
              <span className="font-medium text-foreground">{formatHKD(Number.isFinite(walletValue) ? walletValue : 0)}</span>
            </div>
            {order ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">{tx("消費回贈")}</span>
                <span className="font-medium text-foreground">{orderReward} $OSM</span>
              </div>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild className="rounded-xl">
              <Link href={detailHref}>
                <ClipboardList className="mr-2 h-4 w-4" />
                {booking ? tx("查看訂座") : tx("查看訂單")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="rounded-xl">
              <Link href={restaurantHref}>
                <Store className="mr-2 h-4 w-4" />
                {tx("返回餐廳")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl sm:col-span-2">
              <Link href="/ai">
                <Home className="mr-2 h-4 w-4" />
                {tx("返回主頁")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
