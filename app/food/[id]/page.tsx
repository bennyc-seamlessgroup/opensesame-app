"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ModeSegmentedControl } from "@/components/mode-segmented-control";
import { RestaurantOptionCard } from "@/components/restaurant-option-card";
import { Badge } from "@/components/ui/badge";
import { foodIntents, restaurants } from "@/lib/mock-data";

export default function FoodDetailPage() {
  const params = useParams<{ id: string }>();
  const [mode, setMode] = useState<"book" | "takeaway">("book");

  const intent = foodIntents.find((item) => item.id === params.id);

  const options = useMemo(() => {
    if (!intent) return [];
    return intent.recommendedRestaurantIds
      .map((id) => restaurants.find((restaurant) => restaurant.id === id))
      .filter((restaurant): restaurant is (typeof restaurants)[number] => Boolean(restaurant))
      .filter((restaurant) => (mode === "book" ? restaurant.supportsBooking : restaurant.supportsTakeaway));
  }, [intent, mode]);

  if (!intent) return <p className="text-sm text-muted-foreground">Food intent not found.</p>;

  return (
    <div className="space-y-4">
      <section className="space-y-3">
        <div className="relative h-40 w-full overflow-hidden rounded-xl">
          <Image src={intent.coverImage} alt={intent.title} fill className="object-cover" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{intent.title}</h2>
          <p className="text-sm text-muted-foreground">{intent.subtitle}</p>
          <div className="flex flex-wrap gap-1.5">
            {intent.intentTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[11px]">{tag}</Badge>
            ))}
            <Badge variant="secondary" className="text-[11px]">{intent.priceHint}</Badge>
            <Badge variant="secondary" className="text-[11px]">Up to {intent.expectedRewardViraUpTo} $OSM</Badge>
          </div>
        </div>
      </section>

      <ModeSegmentedControl value={mode} onChange={setMode} />

      <section className="space-y-3">
        {options.map((restaurant) => (
          <RestaurantOptionCard key={restaurant.id} restaurant={restaurant} mode={mode} />
        ))}
        {options.length === 0 ? <p className="text-sm text-muted-foreground">No options for this mode.</p> : null}
      </section>
    </div>
  );
}
