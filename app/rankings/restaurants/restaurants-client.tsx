"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { restaurants } from "@/lib/mock-data";

type RestaurantRankingMode = "最多收藏" | "本週熱門" | "最高評分" | "高回贈";
const modes: RestaurantRankingMode[] = ["最多收藏", "本週熱門", "最高評分", "高回贈"];

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

const priceRangeLabel = (priceRange: "$" | "$$" | "$$$" | "$$$$") => {
  if (priceRange === "$") return "$50-100";
  if (priceRange === "$$") return "$100-200";
  if (priceRange === "$$$") return "$200-500";
  return "$500+";
};

export function RestaurantRankingClient() {
  const [mode, setMode] = useState<RestaurantRankingMode>("本週熱門");

  const ranking = useMemo(() => {
    const base = restaurants.map((r) => {
      const savedCount = stableInt(`${r.id}:saved`, 260, 9800);
      const weeklyHot = stableInt(`${r.id}:weekly`, 160, 8200);
      const avgRating = stableInt(`${r.id}:rating`, 38, 48) / 10;
      return { restaurant: r, savedCount, weeklyHot, avgRating };
    });

    return [...base].sort((a, b) => {
      if (mode === "高回贈") return b.restaurant.rewardYieldPct - a.restaurant.rewardYieldPct;
      if (mode === "最高評分") return b.avgRating - a.avgRating;
      if (mode === "本週熱門") return b.weeklyHot - a.weeklyHot;
      return b.savedCount - a.savedCount;
    });
  }, [mode]);

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader
        title="餐廳排行榜"
        subtitle="Demo ranking"
        action={
          <Button asChild variant="secondary" size="sm" className="h-8 rounded-lg">
            <Link href="/explore">Back</Link>
          </Button>
        }
      />

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {modes.map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={mode === m ? "default" : "secondary"}
            className="h-8 shrink-0 rounded-full px-3 text-xs"
            onClick={() => setMode(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {ranking.slice(0, 20).map((item, idx) => (
          <Link key={item.restaurant.id} href={`/restaurant/${item.restaurant.id}`} className="block">
            <Card className="overflow-hidden border-border/80">
              <div className="relative w-full">
                <AspectRatio ratio={16 / 10}>
                  <Image src={item.restaurant.coverImage} alt={item.restaurant.name} fill className="object-cover" sizes="480px" />
                </AspectRatio>
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge className="rounded-full px-2 py-0.5 text-[11px]">#{idx + 1}</Badge>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                    {mode}
                  </Badge>
                </div>
              </div>
              <CardContent className="space-y-1 p-3">
                <p className="text-sm font-semibold text-foreground">{item.restaurant.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.restaurant.tags[0] ? `${item.restaurant.tags[0]} • ` : ""}
                  {item.restaurant.area} • {priceRangeLabel(item.restaurant.priceRange)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "高回贈"
                    ? `回贈 ${item.restaurant.rewardYieldPct}%`
                    : mode === "最高評分"
                      ? `評分 ${item.avgRating.toFixed(1)}`
                      : mode === "本週熱門"
                        ? `${item.weeklyHot.toLocaleString()} 本週人氣`
                        : `${item.savedCount.toLocaleString()} 收藏`}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Button asChild variant="ghost" size="sm" className="h-8 w-full justify-center gap-1 rounded-full text-xs text-muted-foreground">
        <Link href="/explore#restaurant-ranking">
          回到 Explore <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}

