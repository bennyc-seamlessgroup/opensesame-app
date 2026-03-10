"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";
import { ReviewCard } from "@/components/review-card";
import { useAppState } from "@/lib/app-state";
import { restaurants } from "@/lib/mock-data";

export default function ReviewHubPage() {
  const { bookings, orders, reviews } = useAppState();

  const reviewedIds = new Set(reviews.map((review) => review.relatedId));

  const eligibleFromBookings = bookings
    .filter((booking) => booking.status === "COMPLETED" && booking.verificationStatus === "VERIFIED" && !reviewedIds.has(booking.id))
    .map((booking) => ({
      restaurantId: booking.restaurantId,
      relatedType: "BOOKING" as const,
      relatedId: booking.id,
      label: `Booking ${booking.id}`,
    }));

  const eligibleFromOrders = orders
    .filter((order) => order.status === "PICKED_UP" && order.verificationStatus === "VERIFIED" && !reviewedIds.has(order.id))
    .map((order) => ({
      restaurantId: order.restaurantId,
      relatedType: "TAKEAWAY" as const,
      relatedId: order.id,
      label: `Order ${order.id}`,
    }));

  const eligible = [...eligibleFromBookings, ...eligibleFromOrders];

  return (
    <div className="space-y-4">
      <SectionHeader title="Review Hub" subtitle="Verified reviews earn $OSM" />

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-medium text-foreground">Eligible to Review</p>
          {eligible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No eligible items yet. Complete and verify bookings/orders first.</p>
          ) : (
            <div className="space-y-2">
              {eligible.map((item) => {
                const restaurant = restaurants.find((r) => r.id === item.restaurantId);
                return (
                  <div key={item.relatedId} className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{restaurant?.name}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                    <Button asChild size="sm" className="rounded-lg">
                      <Link href={`/review/new?restaurantId=${item.restaurantId}&relatedType=${item.relatedType}&relatedId=${item.relatedId}`}>Write Review</Link>
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-2">
        <SectionHeader title="My Reviews" subtitle={`${reviews.length} records`} />
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>
    </div>
  );
}
