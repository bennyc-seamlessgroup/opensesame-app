"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { RestaurantMenuButton } from "@/components/restaurant-menu-button";
import { useI18n } from "@/lib/i18n";
import { type Restaurant } from "@/lib/mock-data";
import { formatPerPersonRange } from "@/lib/utils";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const { tx } = useI18n();
  return (
    <Card className="overflow-hidden border-border/80">
      <div className="relative h-36 w-full">
        <Image
          src={restaurant.coverImage}
          alt={restaurant.name}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 100vw, 480px"
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
          <h3 className="text-base font-semibold text-foreground">{restaurant.name}</h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[11px]">
              {restaurant.trustVerifiedPct}% Verified
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {restaurant.aiMatchScore}% match
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              Earn {restaurant.rewardEstimateVira} $OSM
            </Badge>
          </div>

          {restaurant.signatureDishes?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {restaurant.signatureDishes.slice(0, 3).map((dish) => (
                <Badge key={dish.name} variant="outline" className="text-[10px]">
                  {dish.name}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex items-start gap-2">
            <p className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="mt-[1px] h-3.5 w-3.5" />
              {tx("距離你約")} {restaurant.distanceKm.toFixed(1)}km • {tx("人均")} {formatPerPersonRange(restaurant.avgSpend)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="h-8 flex-1 rounded-lg">
            <Link href={`/restaurant/${restaurant.id}`}>View</Link>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 flex-1 rounded-lg"
            disabled={!restaurant.isBookableNow}
          >
            Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
