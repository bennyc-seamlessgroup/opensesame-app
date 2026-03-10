"use client";

import { ExploreRestaurantCard } from "@/components/explore-restaurant-card";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";

export default function ProfileVisitedRestaurantsPage() {
  const { tx } = useI18n();
  const visitedRestaurants = restaurants.filter((restaurant) => user.visitedRestaurantIds.includes(restaurant.id));

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Visited Restaurants")} subtitle={tx("Restaurants you have completed transactions with")} />

      {visitedRestaurants.length ? (
        <div className="space-y-3">
          <SectionHeader title={tx("Visited Restaurants")} subtitle={`${visitedRestaurants.length} ${tx("restaurants")}`} />
          {visitedRestaurants.map((restaurant) => (
            <ExploreRestaurantCard key={restaurant.id} restaurant={restaurant} mode="all" />
          ))}
        </div>
      ) : (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">{tx("No visited restaurants yet.")}</p>
            <p className="text-xs text-muted-foreground">{tx("Completed pay + verify transactions will appear here.")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
