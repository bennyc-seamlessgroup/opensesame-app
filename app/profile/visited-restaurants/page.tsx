"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ExploreRestaurantCard } from "@/components/explore-restaurant-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";

export default function ProfileVisitedRestaurantsPage() {
  const { tx } = useI18n();
  const visitedRestaurants = restaurants.filter((restaurant) => user.visitedRestaurantIds.includes(restaurant.id));

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Button asChild size="icon" variant="secondary" className="h-9 w-9 rounded-full">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-lg font-semibold text-foreground">{tx("Visited Restaurants")}</p>
          <p className="text-xs text-muted-foreground">{tx("Restaurants you have completed transactions with")}</p>
        </div>
      </div>

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
