"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, MapPin, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TopFoodieCard } from "@/components/top-foodie-card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { foodIntents, restaurants, user } from "@/lib/mock-data";
import { parseSearchFiltersFromParams, toSearchParams, type SearchFilters } from "@/lib/search-filters";

type ReviewerSummary = {
  userId: string;
  username: string;
  avatar?: string;
  credibilityScore: number;
  agreeRatePct: number;
  totalVotes: number;
  totalReviews: number;
  lastActiveAt: string;
  followersCount: number;
  followingCount: number;
  topCategories: string[];
};

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

const daysAgo = (iso: string) => {
  const t = +new Date(iso);
  if (!Number.isFinite(t)) return 9999;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
};

type FoodRankingMode = "最多收藏" | "本週熱門" | "最高瀏覽" | "甜品榜" | "火鍋榜";
type RestaurantRankingMode = "最多收藏" | "本週熱門" | "最高評分" | "高回贈";

const foodRankingModes: FoodRankingMode[] = ["最多收藏", "本週熱門", "最高瀏覽", "甜品榜", "火鍋榜"];
const restaurantRankingModes: RestaurantRankingMode[] = ["最多收藏", "本週熱門", "最高評分", "高回贈"];

const priceRangeLabel = (priceRange: "$" | "$$" | "$$$" | "$$$$") => {
  if (priceRange === "$") return "$50-100";
  if (priceRange === "$$") return "$100-200";
  if (priceRange === "$$$") return "$200-500";
  return "$500+";
};

export function ExploreClient({ initialQuery }: { initialQuery: string }) {
  const { tx } = useI18n();
  const router = useRouter();
  const { reviews, social } = useAppState();
  const [foodRankingMode, setFoodRankingMode] = useState<FoodRankingMode>("最多收藏");
  const [restaurantRankingMode, setRestaurantRankingMode] = useState<RestaurantRankingMode>("本週熱門");

  const restaurantById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), []);
  const urlFilters: SearchFilters = useMemo(() => parseSearchFiltersFromParams(new URLSearchParams(initialQuery)), [initialQuery]);

  const exploreReviews = useMemo(() => reviews.filter((review) => review.verifiedVisit), [reviews]);

  const reviewerSummaries = useMemo(() => {
    const byUser = new Map<string, ReviewerSummary>();
    const tagCount = new Map<string, Map<string, number>>();

    for (const review of exploreReviews) {
      const prev = byUser.get(review.userId);
      const totalVotes = review.agreeCount + review.disagreeCount;
      const next = prev
        ? {
            ...prev,
            credibilityScore: Math.round((prev.credibilityScore * prev.totalReviews + review.userReputationScore) / (prev.totalReviews + 1)),
            totalVotes: prev.totalVotes + totalVotes,
            totalReviews: prev.totalReviews + 1,
            lastActiveAt: +new Date(review.createdAt) > +new Date(prev.lastActiveAt) ? review.createdAt : prev.lastActiveAt,
          }
        : {
            userId: review.userId,
            username: review.userName,
            avatar: review.userAvatar,
            credibilityScore: review.userReputationScore,
            agreeRatePct: 0,
            totalVotes,
            totalReviews: 1,
            lastActiveAt: review.createdAt,
            followersCount: stableInt(`${review.userId}:followers`, 340, 5600),
            followingCount: stableInt(`${review.userId}:following`, 120, 980),
            topCategories: [],
          };
      byUser.set(review.userId, next);

      const restaurant = restaurantById.get(review.restaurantId);
      if (!restaurant) continue;
      if (!tagCount.has(review.userId)) tagCount.set(review.userId, new Map());
      const counts = tagCount.get(review.userId)!;
      for (const tag of restaurant.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }

    for (const [userId, summary] of byUser.entries()) {
      const userReviews = exploreReviews.filter((r) => r.userId === userId);
      const agree = userReviews.reduce((acc, r) => acc + Math.max(0, r.agreeCount), 0);
      const disagree = userReviews.reduce((acc, r) => acc + Math.max(0, r.disagreeCount), 0);
      const total = agree + disagree;
      const agreeRatePct = total > 0 ? Math.round((agree / total) * 100) : 0;

      const categories = Array.from(tagCount.get(userId)?.entries() ?? [])
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 3);

      const isFollowed = social.followingUserIds.includes(userId);
      const followersCount = summary.followersCount + (isFollowed ? 1 : 0);

      byUser.set(userId, { ...summary, agreeRatePct, topCategories: categories, followersCount });
    }

    return Array.from(byUser.values());
  }, [exploreReviews, restaurantById, social.followingUserIds]);

  const topReviewers = useMemo(() => {
    const score = (r: ReviewerSummary) => {
      const recencyBoost = Math.max(0, 14 - daysAgo(r.lastActiveAt)) * 2.5;
      const agreeBoost = r.agreeRatePct * 0.35;
      const followerBoost = Math.min(25, Math.log10(Math.max(1, r.followersCount)) * 10);
      return r.credibilityScore * 0.6 + agreeBoost + recencyBoost + followerBoost;
    };
    return [...reviewerSummaries]
      .filter((r) => r.userId !== user.id)
      .sort((a, b) => score(b) - score(a))
      .slice(0, 18);
  }, [reviewerSummaries]);

  const topFoodiesWithCovers = useMemo(() => {
    const pickCover = (userId: string) => {
      if (!restaurants.length) return "";
      const idx = stableInt(`${userId}:cover`, 0, restaurants.length - 1);
      return restaurants[idx]?.coverImage || restaurants[0]!.coverImage;
    };
    return topReviewers.map((foodie) => ({ ...foodie, coverImage: pickCover(foodie.userId) }));
  }, [topReviewers]);

  const filteredFeed = useMemo(() => {
    const normalizedQuery = urlFilters.keyword.trim().toLowerCase();

    const matches = (review: (typeof exploreReviews)[number]) => {
      if (!normalizedQuery) return true;
      const restaurant = restaurantById.get(review.restaurantId);
      const restaurantName = restaurant?.name ?? "";
      const restaurantArea = restaurant?.area ?? "";
      const restaurantAddress = restaurant?.address ?? "";
      const foodHints = [
        ...(restaurant?.signatureDishes?.map((d) => d.name) ?? []),
        ...(review.tags ?? []),
      ].join(" ");

      return [restaurantName, foodHints, review.userName, restaurantArea, restaurantAddress]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    };

    const score = (review: (typeof exploreReviews)[number]) => {
      const restaurant = restaurantById.get(review.restaurantId);
      const total = Math.max(0, review.agreeCount) + Math.max(0, review.disagreeCount);
      const agreeRate = total > 0 ? review.agreeCount / total : 0.5;
      const recencyBoost = Math.max(0, 10 - daysAgo(review.createdAt)) * 1.8;
      const locationBoost = restaurant ? Math.max(0, 3 - restaurant.distanceKm) * 3 : 0;
      const rewardBoost = restaurant ? restaurant.rewardYieldPct * 1.2 : 0;
      return review.userReputationScore * 0.55 + agreeRate * 35 + recencyBoost + locationBoost * 1.2 + rewardBoost * 0.15;
    };

    const base = [...exploreReviews].filter((review) => matches(review));

    const filteredByQuick = base.filter((review) => {
      const restaurant = restaurantById.get(review.restaurantId);
      if (!restaurant) return true;
      if (urlFilters.area && urlFilters.area !== "附近" && restaurant.area !== urlFilters.area) return false;
      if (urlFilters.cuisine && !restaurant.tags.includes(urlFilters.cuisine)) return false;
      if (urlFilters.priceRange && restaurant.priceRange !== urlFilters.priceRange) return false;
      if (urlFilters.highRewardOnly && restaurant.rewardYieldPct < 5) return false;
      if (urlFilters.serviceMode === "堂食" && review.relatedType === "TAKEAWAY") return false;
      if (urlFilters.serviceMode === "外賣" && review.relatedType !== "TAKEAWAY") return false;
      return true;
    });

    const sort = urlFilters.sort;
    if (sort === "最新") return filteredByQuick.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "附近") {
      return filteredByQuick.sort((a, b) => {
        const ra = restaurantById.get(a.restaurantId);
        const rb = restaurantById.get(b.restaurantId);
        return (ra?.distanceKm ?? 999) - (rb?.distanceKm ?? 999);
      });
    }
    if (sort === "高回贈") {
      return filteredByQuick.sort((a, b) => {
        const ra = restaurantById.get(a.restaurantId);
        const rb = restaurantById.get(b.restaurantId);
        return (rb?.rewardYieldPct ?? 0) - (ra?.rewardYieldPct ?? 0);
      });
    }
    if (sort === "高評分") {
      const avg = (r: (typeof exploreReviews)[number]) => (r.ratings.food + r.ratings.service + r.ratings.atmosphere) / 3;
      return filteredByQuick.sort((a, b) => avg(b) - avg(a));
    }

    return filteredByQuick.sort((a, b) => score(b) - score(a));
  }, [exploreReviews, restaurantById, urlFilters]);

  const foodRanking = useMemo(() => {
    const base = foodIntents.map((intent) => {
      const restaurant = restaurantById.get(intent.primaryRestaurantId);
      const savedCount = stableInt(`${intent.id}:saved`, 180, 6400);
      const viewCount = stableInt(`${intent.id}:views`, 1200, 48000);
      const weeklyHot = stableInt(`${intent.id}:weekly`, 120, 6800);
      return { intent, restaurant, savedCount, viewCount, weeklyHot };
    });

    const byMode = (mode: FoodRankingMode) => {
      if (mode === "甜品榜") return base.filter((item) => item.intent.intentTags.includes("Dessert") || item.intent.title.includes("甜品"));
      if (mode === "火鍋榜") return base.filter((item) => item.intent.intentTags.includes("Hotpot") || item.intent.title.includes("火鍋"));
      return base;
    };

    const list = byMode(foodRankingMode);
    const sorted = [...list].sort((a, b) => {
      if (foodRankingMode === "最高瀏覽") return b.viewCount - a.viewCount;
      if (foodRankingMode === "本週熱門") return b.weeklyHot - a.weeklyHot;
      return b.savedCount - a.savedCount;
    });

    return sorted.slice(0, 8);
  }, [foodRankingMode, restaurantById]);

  const restaurantRanking = useMemo(() => {
    const base = restaurants.map((r) => {
      const savedCount = stableInt(`${r.id}:saved`, 260, 9800);
      const weeklyHot = stableInt(`${r.id}:weekly`, 160, 8200);
      const avgRating = stableInt(`${r.id}:rating`, 38, 48) / 10;
      return { restaurant: r, savedCount, weeklyHot, avgRating };
    });

    const sorted = [...base].sort((a, b) => {
      if (restaurantRankingMode === "高回贈") return b.restaurant.rewardYieldPct - a.restaurant.rewardYieldPct;
      if (restaurantRankingMode === "最高評分") return b.avgRating - a.avgRating;
      if (restaurantRankingMode === "本週熱門") return b.weeklyHot - a.weeklyHot;
      return b.savedCount - a.savedCount;
    });

    return sorted.slice(0, 8);
  }, [restaurantRankingMode]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeader
          title="達人用戶"
          action={
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 rounded-full px-2 text-xs text-muted-foreground">
              <Link href="/explore/foodies">
                {tx("瀏覽更多")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <div className="flex snap-x snap-mandatory gap-3">
            {topFoodiesWithCovers.map((foodie) => (
              <TopFoodieCard
                key={foodie.userId}
                userId={foodie.userId}
                username={foodie.username}
                avatar={foodie.avatar}
                credibilityScore={foodie.credibilityScore}
                followersCount={foodie.followersCount}
                coverImage={foodie.coverImage}
                className="snap-start"
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <Card className="border-border/80">
          <CardContent className="flex flex-wrap items-center gap-2 p-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => window.dispatchEvent(new Event("opensesame:openExploreLocation"))}
            >
              <MapPin className="mr-1 h-4 w-4" />
              {tx("地區")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => window.dispatchEvent(new Event("opensesame:openExploreFilters"))}
            >
              <UtensilsCrossed className="mr-1 h-4 w-4" />
              {tx("菜式")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={urlFilters.sort === "熱門" ? "default" : "secondary"}
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => {
                const params = toSearchParams({ ...urlFilters, sort: "熱門" });
                router.push(params.toString() ? `/explore?${params.toString()}` : "/explore");
              }}
            >
              <Flame className="mr-1 h-4 w-4" />
              {tx("熱門")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => {
                const el = document.getElementById("food-ranking");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {tx("排行榜")}
            </Button>
          </CardContent>
        </Card>
      </section>

      {filteredFeed.length ? (
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {filteredFeed.slice(0, 10).map((review) => {
              const restaurant = restaurantById.get(review.restaurantId);
              const coverImage = review.photos[0] || restaurant?.coverImage || restaurants[0]!.coverImage;
              const caption = review.text.length > 44 ? `${review.text.slice(0, 44)}…` : review.text;
              return (
                <Link key={review.id} href={`/post/${review.id}`} className="block">
                  <Card className="overflow-hidden border-border/80">
                    <div className="relative w-full">
                      <AspectRatio ratio={1}>
                        <Image src={coverImage} alt={restaurant?.name ?? "Post"} fill className="object-cover" sizes="240px" />
                      </AspectRatio>
                    </div>
                    <CardContent className="space-y-1.5 p-3">
                      <p className="truncate text-sm font-semibold text-foreground">{review.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{restaurant?.name ?? "Restaurant"}</p>
                      <p className="text-xs text-foreground/90">{caption}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div id="food-ranking" className="space-y-3">
            <SectionHeader
              title={tx("食物排行榜")}
              action={
                <Button asChild variant="ghost" size="sm" className="h-8 gap-1 rounded-full px-2 text-xs text-muted-foreground">
                  <Link href="/rankings/foods">
                    {tx("查看全部")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {foodRankingModes.map((mode) => {
                const active = foodRankingMode === mode;
                return (
                  <Button
                    key={mode}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "secondary"}
                    className="h-8 shrink-0 rounded-full px-3 text-xs"
                    onClick={() => setFoodRankingMode(mode)}
                  >
                    {tx(mode)}
                  </Button>
                );
              })}
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
              <div className="flex snap-x snap-mandatory gap-3">
                {foodRanking.map((item, idx) => (
                  <Link key={item.intent.id} href={`/food/${item.intent.id}`} className="block snap-start">
                    <Card className="w-[280px] shrink-0 overflow-hidden border-border/80">
                      <div className="relative w-full">
                        <AspectRatio ratio={16 / 10}>
                          <Image src={item.intent.coverImage} alt={tx(item.intent.title)} fill className="object-cover" sizes="280px" />
                        </AspectRatio>
                        <div className="absolute left-2 top-2">
                          <Badge className="rounded-full px-2 py-0.5 text-[11px]">#{idx + 1}</Badge>
                        </div>
                      </div>
                      <CardContent className="space-y-1 p-3">
                        <p className="truncate text-sm font-semibold text-foreground">{tx(item.intent.title)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.restaurant ? `${item.restaurant.name} • ${tx(item.restaurant.area)}` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {foodRankingMode === "最高瀏覽"
                            ? `${item.viewCount.toLocaleString()} views`
                            : foodRankingMode === "本週熱門"
                              ? `${item.weeklyHot.toLocaleString()} ${tx("本週人氣")}`
                              : `${item.savedCount.toLocaleString()} ${tx("收藏")}`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredFeed.slice(10, 22).map((review) => {
              const restaurant = restaurantById.get(review.restaurantId);
              const coverImage = review.photos[0] || restaurant?.coverImage || restaurants[0]!.coverImage;
              const caption = review.text.length > 44 ? `${review.text.slice(0, 44)}…` : review.text;
              return (
                <Link key={review.id} href={`/post/${review.id}`} className="block">
                  <Card className="overflow-hidden border-border/80">
                    <div className="relative w-full">
                      <AspectRatio ratio={1}>
                        <Image src={coverImage} alt={restaurant?.name ?? "Post"} fill className="object-cover" sizes="240px" />
                      </AspectRatio>
                    </div>
                    <CardContent className="space-y-1.5 p-3">
                      <p className="truncate text-sm font-semibold text-foreground">{review.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{restaurant?.name ?? "Restaurant"}</p>
                      <p className="text-xs text-foreground/90">{caption}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div id="restaurant-ranking" className="space-y-3">
            <SectionHeader
              title={tx("餐廳排行榜")}
              action={
                <Button asChild variant="ghost" size="sm" className="h-8 gap-1 rounded-full px-2 text-xs text-muted-foreground">
                  <Link href="/rankings/restaurants">
                    {tx("查看全部")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              }
            />

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {restaurantRankingModes.map((mode) => {
                const active = restaurantRankingMode === mode;
                return (
                  <Button
                    key={mode}
                    type="button"
                    size="sm"
                    variant={active ? "default" : "secondary"}
                    className="h-8 shrink-0 rounded-full px-3 text-xs"
                    onClick={() => setRestaurantRankingMode(mode)}
                  >
                    {tx(mode)}
                  </Button>
                );
              })}
            </div>

            <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
              <div className="flex snap-x snap-mandatory gap-3">
                {restaurantRanking.map((item, idx) => (
                  <Link key={item.restaurant.id} href={`/restaurant/${item.restaurant.id}`} className="block snap-start">
                    <Card className="w-[280px] shrink-0 overflow-hidden border-border/80">
                      <div className="relative w-full">
                        <AspectRatio ratio={16 / 10}>
                          <Image src={item.restaurant.coverImage} alt={item.restaurant.name} fill className="object-cover" sizes="280px" />
                        </AspectRatio>
                        <div className="absolute left-2 top-2">
                          <Badge className="rounded-full px-2 py-0.5 text-[11px]">#{idx + 1}</Badge>
                        </div>
                      </div>
                      <CardContent className="space-y-1 p-3">
                        <p className="truncate text-sm font-semibold text-foreground">{item.restaurant.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.restaurant.tags[0] ? `${item.restaurant.tags[0]} • ` : ""}
                          {tx(item.restaurant.area)} • {priceRangeLabel(item.restaurant.priceRange)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {restaurantRankingMode === "高回贈"
                            ? `${tx("回贈")} ${item.restaurant.rewardYieldPct}%`
                            : restaurantRankingMode === "最高評分"
                              ? `${tx("評分")} ${item.avgRating.toFixed(1)}`
                              : restaurantRankingMode === "本週熱門"
                                ? `${item.weeklyHot.toLocaleString()} ${tx("本週人氣")}`
                                : `${item.savedCount.toLocaleString()} ${tx("收藏")}`}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {filteredFeed.length > 22 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredFeed.slice(22).map((review) => {
                const restaurant = restaurantById.get(review.restaurantId);
                const coverImage = review.photos[0] || restaurant?.coverImage || restaurants[0]!.coverImage;
                const caption = review.text.length > 44 ? `${review.text.slice(0, 44)}…` : review.text;
                return (
                  <Link key={review.id} href={`/post/${review.id}`} className="block">
                    <Card className="overflow-hidden border-border/80">
                      <div className="relative w-full">
                        <AspectRatio ratio={1}>
                          <Image src={coverImage} alt={restaurant?.name ?? "Post"} fill className="object-cover" sizes="240px" />
                        </AspectRatio>
                      </div>
                      <CardContent className="space-y-1.5 p-3">
                        <p className="truncate text-sm font-semibold text-foreground">{review.userName}</p>
                        <p className="truncate text-xs text-muted-foreground">{restaurant?.name ?? "Restaurant"}</p>
                        <p className="text-xs text-foreground/90">{caption}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">{tx("搵唔到符合搜尋嘅內容。")}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 rounded-full px-3 text-xs"
                onClick={() => router.push("/explore")}
              >
                {tx("Reset")}
              </Button>
              <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href="/ai">{tx("用 AI 幫你揀")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
