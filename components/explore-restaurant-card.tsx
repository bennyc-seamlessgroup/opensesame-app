"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { RestaurantMenuButton } from "@/components/restaurant-menu-button";
import { useI18n } from "@/lib/i18n";
import { type Restaurant } from "@/lib/mock-data";
import { cn, formatPerPersonRange } from "@/lib/utils";

type ExploreRestaurantCardProps = {
  restaurant: Restaurant;
  mode: "all" | "book" | "takeaway";
  className?: string;
};

export function ExploreRestaurantCard({ restaurant, mode, className }: ExploreRestaurantCardProps) {
  const { tx } = useI18n();
  const signatureDishes = restaurant.signatureDishes?.slice(0, 3) ?? [];

  const primaryHref =
    mode === "takeaway"
      ? `/restaurant/${restaurant.id}?mode=takeaway`
      : `/restaurant/${restaurant.id}?mode=book`;

  const primaryLabel = mode === "takeaway" ? tx("外賣落單") : tx("訂枱");

  return (
    <Card className={cn("overflow-hidden border-border/80", className)}>
      <div className="relative h-36 w-full">
        <Image
          src={restaurant.coverImage}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <RestaurantMenuButton restaurant={restaurant} className="bg-background/80 backdrop-blur hover:bg-background/90" />
          <RestaurantLocationButton
            restaurant={restaurant}
            variant="secondary"
            size="sm"
            label="Map"
            className="bg-background/80 backdrop-blur hover:bg-background/90"
          />
        </div>
      </div>

      <CardContent className="space-y-3 p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-foreground">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">
                {tx(restaurant.area)} • {tx("距離你約")} {restaurant.distanceKm.toFixed(1)}km • {tx("人均")} {formatPerPersonRange(restaurant.avgSpend)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <Badge variant="secondary" className="text-[11px]">
                {restaurant.trustVerifiedPct}% Verified
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[11px]">
              {tx("回贈")} {restaurant.rewardYieldPct}% $OSM
            </Badge>
            {restaurant.supportsBooking ? (
              <Badge variant="outline" className="text-[11px]">
                {tx("可訂枱")}
              </Badge>
            ) : null}
            {restaurant.supportsTakeaway ? (
              <Badge variant="outline" className="text-[11px]">
                {tx("可外賣")}
              </Badge>
            ) : null}
          </div>

          <p className="flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="mt-[1px] h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate">{restaurant.address}</span>
          </p>

          {signatureDishes.length ? (
            <div className="flex flex-wrap gap-1.5">
              {signatureDishes.map((dish) => (
                <Badge key={dish.name} variant="outline" className="text-[10px] text-muted-foreground">
                  {dish.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        {mode === "all" ? (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="h-8 flex-1 rounded-lg">
              <Link href={`/restaurant/${restaurant.id}`}>{tx("查看")}</Link>
            </Button>
            {restaurant.supportsBooking ? (
              <Button asChild size="sm" variant="secondary" className="h-8 flex-1 rounded-lg">
                <Link href={`/restaurant/${restaurant.id}?mode=book`}>{tx("訂枱")}</Link>
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="h-8 flex-1 rounded-lg" disabled>
                {tx("訂枱")}
              </Button>
            )}
            {restaurant.supportsTakeaway ? (
              <Button asChild size="sm" variant="secondary" className="h-8 flex-1 rounded-lg">
                <Link href={`/restaurant/${restaurant.id}?mode=takeaway`}>{tx("外賣")}</Link>
              </Button>
            ) : (
              <Button size="sm" variant="secondary" className="h-8 flex-1 rounded-lg" disabled>
                {tx("外賣")}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="h-8 flex-1 rounded-lg">
              <Link href={primaryHref}>{primaryLabel}</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg px-3">
              <Link href={`/restaurant/${restaurant.id}`}>{tx("查看")}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
