"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PaymentPill, OrderStatusPill } from "@/components/status-pills";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { restaurants } from "@/lib/mock-data";
import { cn, formatHKD } from "@/lib/utils";

export default function TakeawayOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { orders, reviews, cancelOrder, markOrderReady, markOrderPickedUp } = useAppState();

  const order = orders.find((item) => item.id === params.id);
  const restaurant = order ? restaurants.find((item) => item.id === order.restaurantId) : null;

  const alreadyReviewed = useMemo(
    () => Boolean(order && reviews.some((review) => review.relatedType === "TAKEAWAY" && review.relatedId === order.id)),
    [order, reviews]
  );

  if (!order || !restaurant) return <p className="text-sm text-muted-foreground">Order not found.</p>;

  const canPay = order.paymentStatus === "UNPAID" && order.status !== "CANCELLED";
  const canCancel = order.status === "PLACED" && order.paymentStatus === "UNPAID";
  const canMarkReady = order.status === "PLACED" && order.paymentStatus === "PAID_OSM" && order.status !== "CANCELLED";
  const canPickUp = order.status === "READY" && order.paymentStatus === "PAID_OSM";
  const canWriteReview = order.status === "PICKED_UP" && !alreadyReviewed;

  const helperText = canPay
    ? "Complete payment to confirm this takeaway order."
    : order.status === "READY"
      ? "Your order is ready for pickup."
      : order.status === "PLACED"
        ? "The restaurant is preparing your order."
        : order.status === "PICKED_UP"
          ? "Pickup completed. You can leave a review anytime."
          : "This order has been cancelled.";

  return (
    <div className={cn("space-y-4 pb-24", "theme-takeaway")}>
      <SectionHeader title="Takeaway" subtitle="Clear order and pickup status" />

      <Card className="border-border/80">
        <CardContent className="space-y-4 p-4">
          <div className="flex gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-border/70">
              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-base font-semibold text-foreground">{restaurant.name}</p>
                <p className="text-sm text-muted-foreground">{restaurant.area}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <OrderStatusPill status={order.status} />
                <PaymentPill status={order.paymentStatus} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">{helperText}</p>
          </div>

          <div className="space-y-2 rounded-2xl border border-border/80 p-3 text-sm">
            {order.items.map((line) => {
              const menuItem = restaurant.takeawayMenu.find((item) => item.id === line.menuItemId);
              if (!menuItem) return null;
              return (
                <div key={line.menuItemId} className="flex items-center justify-between gap-3">
                  <span className="text-foreground">{menuItem.name} × {line.qty}</span>
                  <span className="text-muted-foreground">{formatHKD(menuItem.price * line.qty)}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between border-t border-border/70 pt-2">
              <span className="font-medium text-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatHKD(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reward estimate</span>
              <span>{order.rewardEstimateVira} $OSM</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-xl">
              <Link href={`/restaurant/${restaurant.id}?mode=takeaway`}>Restaurant</Link>
            </Button>

            {canPay ? (
              <Button asChild size="sm" className="rounded-xl">
                <Link href={`/pay?context=order&orderId=${order.id}`}>Pay now</Link>
              </Button>
            ) : null}

            {canMarkReady ? (
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => markOrderReady(order.id)}>
                Mark ready
              </Button>
            ) : null}

            {canPickUp ? (
              <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => markOrderPickedUp(order.id)}>
                Mark picked up
              </Button>
            ) : null}

            {canWriteReview ? (
              <Button asChild size="sm" variant="secondary" className="rounded-xl">
                <Link href={`/review/new?restaurantId=${order.restaurantId}&relatedType=TAKEAWAY&relatedId=${order.id}`}>Write review</Link>
              </Button>
            ) : null}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl"
            disabled={!canCancel}
            onClick={() => cancelOrder(order.id)}
          >
            Cancel order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
