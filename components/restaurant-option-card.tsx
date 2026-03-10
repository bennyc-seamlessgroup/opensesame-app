"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { RestaurantMenuButton } from "@/components/restaurant-menu-button";
import { useI18n } from "@/lib/i18n";
import { type Restaurant } from "@/lib/mock-data";
import { formatPerPersonRange } from "@/lib/utils";

type RestaurantOptionCardProps = {
  restaurant: Restaurant;
  mode: "book" | "takeaway";
};

export function RestaurantOptionCard({ restaurant, mode }: RestaurantOptionCardProps) {
  const { tx } = useI18n();
  const signatureDish = restaurant.signatureDishes[0];

  return (
    <Card className="border-border/80">
      <CardContent className="space-y-3 p-3">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg">
            <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="80px" />
            <div className="absolute bottom-1 right-1 flex items-center gap-1">
              <RestaurantMenuButton restaurant={restaurant} className="h-7 bg-background/80 px-2 text-[11px] backdrop-blur hover:bg-background/90" />
              <RestaurantLocationButton
                restaurant={restaurant}
                variant="secondary"
                size="sm"
                label="Map"
                className="h-7 bg-background/80 px-2 text-[11px] backdrop-blur hover:bg-background/90"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{restaurant.name}</h3>
            <p className="text-xs text-muted-foreground">{tx(restaurant.area)} • {restaurant.distanceKm.toFixed(1)}km</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {mode === "book" ? (
                <Badge variant="secondary" className="text-[10px]">{tx("人均")} {formatPerPersonRange(restaurant.avgSpend)}</Badge>
              ) : null}
              <Badge variant="secondary" className="text-[10px]">{restaurant.trustVerifiedPct}% Verified</Badge>
              <Badge variant="secondary" className="text-[10px]">{restaurant.rewardYieldPct}% back</Badge>
              <Badge variant="outline" className="text-[10px]">{tx(restaurant.livePosSync ? "Live Sync" : "QR verify")}</Badge>
            </div>
          </div>
        </div>

        {signatureDish ? (
          <p className="text-xs text-muted-foreground">{tx("Signature")}: {signatureDish.name}</p>
        ) : null}

        <Button asChild className="h-8 w-full rounded-lg" size="sm">
          <Link href={`/restaurant/${restaurant.id}?mode=${mode}`}>{tx(mode === "book" ? "Book" : "Order")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
