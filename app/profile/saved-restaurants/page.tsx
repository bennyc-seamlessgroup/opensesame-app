"use client";

import Link from "next/link";
import { ExploreRestaurantCard } from "@/components/explore-restaurant-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";

export default function ProfileSavedRestaurantsPage() {
  const { tx } = useI18n();
  const savedRestaurants = restaurants.filter((restaurant) => user.savedRestaurantIds.includes(restaurant.id));

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Saved Restaurants")} subtitle={tx("Your restaurant shortlist")} />

      {savedRestaurants.length ? (
        <div className="space-y-3">
          <SectionHeader title={tx("Saved Restaurants")} subtitle={`${savedRestaurants.length} ${tx("restaurants")}`} />
          {savedRestaurants.map((restaurant) => (
            <ExploreRestaurantCard key={restaurant.id} restaurant={restaurant} mode="all" />
          ))}
        </div>
      ) : (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">{tx("No saved restaurants yet.")}</p>
            <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
              <Link href="/explore">{tx("Explore")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
