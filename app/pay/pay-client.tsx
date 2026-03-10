"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { getBookingDepositAmount } from "@/lib/payment";
import { formatHKD } from "@/lib/utils";

type PayClientProps = {
  context?: string;
  orderId?: string;
  bookingId?: string;
  intent?: string;
  method?: string;
  wallet?: string;
};

export function PayClient({ context, orderId, bookingId, method, wallet }: PayClientProps) {
  const router = useRouter();
  const { tx } = useI18n();
  const { orders, bookings, wallet: walletState, processPayment } = useAppState();
  const [message, setMessage] = useState("");

  const paymentMethod = method === "apple_pay" ? "apple_pay" : "credit_card";
  const useWalletOffset = wallet === "1";
  const methodLabel = paymentMethod === "apple_pay" ? tx("Apple Pay") : `${tx("Credit Card")} · Visa •••• 4356`;

  const paymentMeta = useMemo(() => {
    if (context === "booking" && bookingId) {
      const booking = bookings.find((item) => item.id === bookingId);
      if (!booking) return null;
      const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
      if (!restaurant) return null;
      const total = getBookingDepositAmount(restaurant);
      const walletOffset = useWalletOffset ? Math.min(walletState.viraBalance, total) : 0;
      return {
        title: restaurant.name,
        subtitle: tx("正在確認你的訂座付款"),
        total,
        walletOffset,
      };
    }

    if (context === "order" && orderId) {
      const order = orders.find((item) => item.id === orderId);
      if (!order) return null;
      const restaurant = restaurants.find((item) => item.id === order.restaurantId);
      if (!restaurant) return null;
      const total = order.subtotal;
      const walletOffset = useWalletOffset ? Math.min(walletState.viraBalance, total) : 0;
      return {
        title: restaurant.name,
        subtitle: tx("正在確認你的外賣付款"),
        total,
        walletOffset,
      };
    }

    return null;
  }, [bookingId, bookings, context, orderId, orders, tx, useWalletOffset, walletState.viraBalance]);

  useEffect(() => {
    if (!paymentMeta || !(context === "booking" || context === "order")) return;

    const timer = window.setTimeout(() => {
      const response = processPayment({
        context,
        bookingId,
        orderId,
        paymentMethod,
        walletOffset: paymentMeta.walletOffset,
      });
      if (!response.ok || !response.route) {
        setMessage(response.message);
        return;
      }
      router.replace(`${response.route}&method=${paymentMethod}&walletOffset=${paymentMeta.walletOffset}`);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [bookingId, context, orderId, paymentMeta, paymentMethod, processPayment, router]);

  if (!paymentMeta) {
    return (
      <div className="space-y-4">
        <SectionHeader title="Payment" subtitle="" />
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">{message || tx("Checkout context missing.")}</p>
            <Button asChild className="w-full rounded-lg">
              <Link href="/orders">{tx("返 Orders")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader title="Payment" subtitle="" />
      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-5 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">{paymentMeta.title}</p>
            <p className="text-sm text-muted-foreground">{paymentMeta.subtitle}</p>
          </div>
          <div className="rounded-2xl border border-border/80 bg-secondary/40 p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{tx("付款方式")}</span>
              <span className="font-medium text-foreground">{methodLabel}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">{tx("使用 $OSM")}</span>
              <span className="font-medium text-foreground">{formatHKD(paymentMeta.walletOffset)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">{tx("尚需支付")}</span>
              <span className="font-medium text-foreground">{formatHKD(Math.max(0, paymentMeta.total - paymentMeta.walletOffset))}</span>
            </div>
          </div>
          {message ? <p className="text-sm text-destructive">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
