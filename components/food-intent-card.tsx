"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleMinus, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { RestaurantMenuButton } from "@/components/restaurant-menu-button";
import { useI18n } from "@/lib/i18n";
import { foodIntents, restaurants, type FoodIntent } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type FoodIntentCardProps = {
  intent: FoodIntent;
  liked?: boolean;
  onToggleLike?: (intentId: string) => void;
  onDislike?: (intent: FoodIntent) => void;
};

export function FoodIntentCard({ intent, liked, onToggleLike, onDislike }: FoodIntentCardProps) {
  const { t, tx } = useI18n();
  const primaryRestaurant =
    restaurants.find((restaurant) => restaurant.id === intent.primaryRestaurantId) ||
    restaurants.find((restaurant) => restaurant.id === intent.recommendedRestaurantIds[0]);

  if (!primaryRestaurant) return null;

  return (
    <Card className="overflow-hidden border-border/80">
      <div className="relative h-24 w-full">
        <Image
          src={intent.coverImage}
          alt={tx(intent.title)}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 50vw, 240px"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <RestaurantMenuButton restaurant={primaryRestaurant} className="bg-background/80 backdrop-blur hover:bg-background/90" />
          <RestaurantLocationButton
            restaurant={primaryRestaurant}
            variant="secondary"
            size="sm"
            label="Map"
            className="bg-background/80 backdrop-blur hover:bg-background/90"
          />
        </div>
      </div>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 text-base font-semibold text-foreground">{tx(intent.title)}</h3>
          {onToggleLike || onDislike ? (
            <div className="flex items-center gap-1">
              {onToggleLike ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={liked ? t("unlike") : t("like")}
                  aria-pressed={liked}
                  onClick={(event) => {
                    event.preventDefault();
                    onToggleLike(intent.id);
                  }}
                >
                  <Heart className={cn("h-4 w-4", liked ? "fill-current" : "")} />
                </Button>
              ) : null}
              {onDislike ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={t("not_interested")}
                  onClick={(event) => {
                    event.preventDefault();
                    onDislike(intent);
                  }}
                >
                  <CircleMinus className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[11px]">
            {t("reward")} {primaryRestaurant.rewardYieldPct}% $OSM
          </Badge>
        </div>

        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs text-muted-foreground">
            {primaryRestaurant.name} • {tx(primaryRestaurant.area)} • {t("distance_away")} {primaryRestaurant.distanceKm.toFixed(1)}km
          </p>
        </div>

        <Button asChild size="sm" className="h-8 w-full rounded-lg">
          <Link href={`/restaurant/${primaryRestaurant.id}`}>{t("book_takeaway")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export const topFoodIntents = [...foodIntents].sort((a, b) => b.aiIntentScore - a.aiIntentScore).slice(0, 6);
