"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { foodIntents, restaurants, user } from "@/lib/mock-data";

export default function FavoritesPage() {
  const { tx } = useI18n();
  const { aiPreferences } = useAppState();

  const favoriteFoodIds = new Set(aiPreferences.likedFoodIntentIds || []);
  const favoriteFoods = foodIntents.filter((item) => favoriteFoodIds.has(item.id));
  const favoriteRestaurants = restaurants.filter((item) => user.savedRestaurantIds.includes(item.id));

  const hasAny = favoriteFoods.length > 0 || favoriteRestaurants.length > 0;

  return (
    <div className="space-y-4">
      <SectionHeader title={tx("Favorites")} />

      {!hasAny ? (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">{tx("你仲未有任何收藏。")}</p>
            <p className="text-xs text-muted-foreground">{tx("去 AI 頁按心心，或者收藏餐廳後會喺呢度見到。")}</p>
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/ai">{tx("去 AI 頁")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {favoriteFoods.length > 0 ? (
        <section className="space-y-2">
          <SectionHeader title={tx("Favorite Food")} />
          <div className="space-y-2">
            {favoriteFoods.map((item) => {
              const restaurant = restaurants.find((r) => r.id === item.primaryRestaurantId);
              return (
                <Link
                  key={item.id}
                  href={restaurant ? `/restaurant/${restaurant.id}?mode=takeaway` : "/ai"}
                  className="block rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                      <Image src={item.coverImage} alt={tx(item.title)} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{tx(item.title)}</p>
                      <p className="truncate text-xs text-muted-foreground">{restaurant?.name || "Restaurant"}</p>
                    </div>
                    <Heart className="h-4 w-4 fill-current text-rose-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {favoriteRestaurants.length > 0 ? (
        <section className="space-y-2">
          <SectionHeader title={tx("Favorite Restaurant")} />
          <div className="space-y-2">
            {favoriteRestaurants.map((restaurant) => (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.id}`} className="block rounded-xl border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{restaurant.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tx(restaurant.area)} • {restaurant.distanceKm.toFixed(1)}km
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">{restaurant.trustVerifiedPct}% Verified</Badge>
                      <Badge variant="secondary" className="text-[10px]">{restaurant.rewardYieldPct}% back</Badge>
                    </div>
                  </div>
                  <Heart className="h-4 w-4 fill-current text-rose-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
