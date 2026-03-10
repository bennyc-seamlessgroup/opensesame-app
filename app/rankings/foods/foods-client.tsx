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
import { foodIntents, restaurants } from "@/lib/mock-data";

type FoodRankingMode = "最多收藏" | "本週熱門" | "最高瀏覽" | "甜品榜" | "火鍋榜";
const modes: FoodRankingMode[] = ["最多收藏", "本週熱門", "最高瀏覽", "甜品榜", "火鍋榜"];

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

export function FoodRankingClient() {
  const [mode, setMode] = useState<FoodRankingMode>("最多收藏");
  const restaurantById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), []);

  const ranking = useMemo(() => {
    const base = foodIntents.map((intent) => {
      const restaurant = restaurantById.get(intent.primaryRestaurantId);
      const savedCount = stableInt(`${intent.id}:saved`, 180, 6400);
      const viewCount = stableInt(`${intent.id}:views`, 1200, 48000);
      const weeklyHot = stableInt(`${intent.id}:weekly`, 120, 6800);
      return { intent, restaurant, savedCount, viewCount, weeklyHot };
    });

    const byMode = (m: FoodRankingMode) => {
      if (m === "甜品榜") return base.filter((item) => item.intent.intentTags.includes("Dessert") || item.intent.title.includes("甜品"));
      if (m === "火鍋榜") return base.filter((item) => item.intent.intentTags.includes("Hotpot") || item.intent.title.includes("火鍋"));
      return base;
    };

    const list = byMode(mode);
    return [...list].sort((a, b) => {
      if (mode === "最高瀏覽") return b.viewCount - a.viewCount;
      if (mode === "本週熱門") return b.weeklyHot - a.weeklyHot;
      return b.savedCount - a.savedCount;
    });
  }, [mode, restaurantById]);

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader
        title="食物排行榜"
        subtitle="Demo ranking"
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
          <Link key={item.intent.id} href={`/food/${item.intent.id}`} className="block">
            <Card className="overflow-hidden border-border/80">
              <div className="relative w-full">
                <AspectRatio ratio={16 / 10}>
                  <Image src={item.intent.coverImage} alt={item.intent.title} fill className="object-cover" sizes="480px" />
                </AspectRatio>
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge className="rounded-full px-2 py-0.5 text-[11px]">#{idx + 1}</Badge>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
                    {mode}
                  </Badge>
                </div>
              </div>
              <CardContent className="space-y-1 p-3">
                <p className="text-sm font-semibold text-foreground">{item.intent.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.restaurant ? `${item.restaurant.name} • ${item.restaurant.area}` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "最高瀏覽"
                    ? `${item.viewCount.toLocaleString()} views`
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
        <Link href="/explore#food-ranking">
          回到 Explore <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
