"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Heart, RefreshCcw, ShoppingBasket, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AiFoodSuggestionCard } from "@/components/ai-food-suggestion-card";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import {
  foodIntents,
  restaurants,
  reviews as mockReviews,
  user,
  type FoodIntent,
  type Review,
  type Restaurant,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function AiPage() {
  const { tx } = useI18n();
  const router = useRouter();
  const [serviceMode, setServiceMode] = useState<"book" | "takeaway">("book");
  const selectedChips = useMemo(() => ["附近"], []);
  const [suggestionSeed, setSuggestionSeed] = useState(0);
  const { bookings, orders, reviews, pendingVoteTasks, aiPreferences, addDislikedFoodIntent, removeDislikedFoodIntent, preferences } = useAppState();
  const [pendingBannerDismissed, setPendingBannerDismissed] = useState(false);

  const [dislikeOpen, setDislikeOpen] = useState(false);
  const [dislikeIntent, setDislikeIntent] = useState<FoodIntent | null>(null);
  const [dislikeReason, setDislikeReason] = useState<string>("taste");
  const [dislikeOtherText, setDislikeOtherText] = useState<string>("");

  const dislikeReasons = useMemo(
    () => [
      { value: "taste", label: "口味唔合" },
      { value: "budget", label: "價錢唔合" },
      { value: "distance", label: "太遠 / 唔方便" },
      { value: "already_had", label: "最近食過，想換下" },
      { value: "other", label: "其他" },
    ],
    []
  );

  const dislikeFeedbackMessage = useMemo(() => {
    if (dislikeReason === "taste") return tx("明白。我哋會降低類似口味／風格建議再次出現嘅機會。");
    if (dislikeReason === "budget") return tx("收到。我哋會更偏向符合你預算範圍嘅選擇。");
    if (dislikeReason === "distance") return tx("了解。我哋會優先推薦更近或更方便嘅選擇。");
    if (dislikeReason === "already_had") return tx("OK。短期內我哋會避免再次推薦同款食物。");
    if (dislikeReason === "other") return tx("收到。我哋會根據你嘅回饋調整之後推薦。");
    return tx("收到。我哋會根據你嘅回饋調整之後推薦。");
  }, [dislikeReason, tx]);

  const mergedReviewPool = useMemo(() => {
    const all = [...reviews, ...mockReviews];
    return all.filter((review, index, list) => list.findIndex((item) => item.id === review.id) === index);
  }, [reviews]);

  const pickCommunityReview = useMemo(() => {
    const verifiedPool = mergedReviewPool.filter((review) => review.verifiedVisit);

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

    const daysAgo = (iso: string) => {
      const t = +new Date(iso);
      if (!Number.isFinite(t)) return 9999;
      return (Date.now() - t) / (1000 * 60 * 60 * 24);
    };

    const hashSeed = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      }
      return hash;
    };

    const scoreReview = (review: Review, primaryRestaurantId: string) => {
      const restaurant = restaurants.find((item) => item.id === review.restaurantId);
      const tagMatches = restaurant
        ? preferences.cuisines.filter((cuisine) => restaurant.tags.includes(cuisine)).length
        : 0;
      const tasteSimilarity = clamp01(tagMatches / Math.max(1, preferences.cuisines.length));

      const totalVotes = Math.max(0, review.agreeCount) + Math.max(0, review.disagreeCount);
      const agreeRate = totalVotes > 0 ? clamp01(review.agreeCount / totalVotes) : 0.5;

      const credibility = clamp01(review.userReputationScore / 100);
      const freshness = clamp01(Math.exp(-daysAgo(review.createdAt) / 30));
      const relevance = review.restaurantId === primaryRestaurantId ? 1 : 0.75;

      return (
        credibility * 0.35 +
        tasteSimilarity * 0.25 +
        agreeRate * 0.25 +
        freshness * 0.15
      ) * relevance;
    };

    return (restaurantIds: string[], seed: string, primaryRestaurantId: string): Review | null => {
      const restaurantIdSet = new Set(restaurantIds);
      const restaurantReviews = verifiedPool.filter((review) => restaurantIdSet.has(review.restaurantId));
      const otherReviews = restaurantReviews.filter((review) => review.userName !== user.name);
      const pool = otherReviews.length > 0 ? otherReviews : restaurantReviews;

      const fromPool = (source: Review[]) => {
        if (source.length === 0) return null;
        const scored = source
          .map((review) => ({ review, score: scoreReview(review, primaryRestaurantId) }))
          .sort((a, b) => b.score - a.score);
        const top = scored.slice(0, Math.min(3, scored.length));
        const idx = hashSeed(seed) % top.length;
        return top[idx]?.review || null;
      };

      const picked = fromPool(pool);
      if (picked) return picked;

      const globalOthers = verifiedPool.filter((review) => review.userName !== user.name);
      const globalPool = globalOthers.length > 0 ? globalOthers : verifiedPool;
      return fromPool(globalPool);
    };
  }, [mergedReviewPool, preferences.cuisines]);

  const pendingCount = useMemo(
    () => (pendingVoteTasks || []).filter((task) => task.status === "PENDING").length,
    [pendingVoteTasks]
  );

  const personalizedSuggestions = useMemo(() => {
    const dislikedSet = new Set(aiPreferences.dislikedFoodIntents.map((item) => item.intentId));

    const resolvePrimaryRestaurant = (intent: FoodIntent) =>
      restaurants.find((restaurant) => restaurant.id === intent.primaryRestaurantId) ||
      restaurants.find((restaurant) => restaurant.id === intent.recommendedRestaurantIds[0]);

    const recentRestaurantIds: string[] = [];
    for (const order of orders) recentRestaurantIds.push(order.restaurantId);
    for (const booking of [...bookings].sort((a, b) => +new Date(b.datetime) - +new Date(a.datetime))) {
      recentRestaurantIds.push(booking.restaurantId);
    }
    const recentSet = new Set(recentRestaurantIds.filter(Boolean).slice(0, 5));

    const restaurantReviewScore = new Map<string, { avg: number; count: number }>();
    for (const review of mergedReviewPool) {
      const ratingAvg = (review.ratings.food + review.ratings.service + review.ratings.atmosphere) / 3;
      const prev = restaurantReviewScore.get(review.restaurantId) || { avg: 0, count: 0 };
      const nextCount = prev.count + 1;
      restaurantReviewScore.set(review.restaurantId, { avg: (prev.avg * prev.count + ratingAvg) / nextCount, count: nextCount });
    }

    const chipBias = (intent: FoodIntent) => {
      const selected = new Set(selectedChips);
      const primary = resolvePrimaryRestaurant(intent);
      if (!primary) return 0;

      let bias = 0;

      if (selected.has("附近")) bias += Math.max(0, 3 - primary.distanceKm) * 2;

      if (selected.has("平價")) {
        if (primary.priceRange === "$") bias += 8;
        else if (primary.priceRange === "$$") bias += 4;
      }

      if (selected.has("想食辣")) bias += intent.intentTags.includes("Spicy") ? 8 : 0;

      if (selected.has("宵夜")) bias += primary.tags.includes("Late Night") || intent.intentTags.includes("Late Night") ? 7 : 0;

      if (selected.has("約會")) bias += intent.intentTags.includes("Celebration") || primary.tags.includes("Premium") ? 6 : 0;

      return bias;
    };

    const scoreIntent = (intent: FoodIntent) => {
      const primary = resolvePrimaryRestaurant(intent);
      if (!primary) return -Infinity;
      if (serviceMode === "book" && !primary.supportsBooking) return -Infinity;
      if (serviceMode === "takeaway" && !primary.supportsTakeaway) return -Infinity;

      const cuisineMatches = preferences.cuisines.filter((cuisine) => primary.tags.includes(cuisine)).length;
      const cuisineBoost = Math.min(12, cuisineMatches * 6);
      const recentBoost = recentSet.has(primary.id) ? 8 : 0;
      const review = restaurantReviewScore.get(primary.id);
      const reviewBoost = review ? Math.max(0, (review.avg - 3.6) * 8) : 0;
      return intent.aiIntentScore + cuisineBoost + recentBoost + reviewBoost + chipBias(intent);
    };

    const mulberry32 = (seed: number) => {
      let t = seed + 0x6d2b79f5;
      return () => {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
      };
    };

    const shuffleWithSeed = <T,>(items: T[], seed: number) => {
      const next = [...items];
      const rand = mulberry32(seed);
      for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [next[i], next[j]] = [next[j], next[i]];
      }
      return next;
    };

    const ranked = foodIntents
      .filter((intent) => !dislikedSet.has(intent.id))
      .map((intent) => ({ intent, score: scoreIntent(intent) }))
      .filter((item) => Number.isFinite(item.score))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.intent);

    const rankedForMode =
      serviceMode === "book"
        ? (() => {
            const seen = new Set<string>();
            const uniqueRestaurants: FoodIntent[] = [];
            for (const intent of ranked) {
              const primary = resolvePrimaryRestaurant(intent);
              if (!primary) continue;
              if (seen.has(primary.id)) continue;
              seen.add(primary.id);
              uniqueRestaurants.push(intent);
            }
            if (uniqueRestaurants.length >= 3) return uniqueRestaurants;

            const filled = [...uniqueRestaurants];
            for (const intent of ranked) {
              if (filled.some((item) => item.id === intent.id)) continue;
              filled.push(intent);
              if (filled.length >= 3) break;
            }
            return filled;
          })()
        : ranked;

    const candidatesForMode = rankedForMode.slice(0, 18);
    const shuffledForMode = shuffleWithSeed(candidatesForMode, suggestionSeed);
    const batchForMode = shuffledForMode.slice(0, 3);
    const intentsForMode = batchForMode.length > 0 ? batchForMode : rankedForMode.slice(0, 3);

    return intentsForMode
      .map((intent) => {
        const primary = resolvePrimaryRestaurant(intent);
        if (!primary) return null;
        if (serviceMode === "book" && !primary.supportsBooking) return null;
        if (serviceMode === "takeaway" && !primary.supportsTakeaway) return null;
        const review = pickCommunityReview([primary.id, ...intent.recommendedRestaurantIds], intent.id, primary.id);
        if (!review) return null;
        return { intent, restaurant: primary, review };
      })
      .filter((item): item is { intent: FoodIntent; restaurant: Restaurant; review: Review } => Boolean(item));
  }, [aiPreferences.dislikedFoodIntents, bookings, orders, pickCommunityReview, preferences.cuisines, selectedChips, serviceMode, suggestionSeed]);

  return (
    <div className={cn("space-y-4 pb-2", serviceMode === "takeaway" ? "theme-takeaway" : "")}>
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={serviceMode}
            onValueChange={(value) => setServiceMode(value === "takeaway" ? "takeaway" : "book")}
            className="min-w-[240px] flex-1 sm:flex-none"
          >
            <TabsList className="h-11 w-full rounded-full bg-muted p-1 sm:w-auto">
              <TabsTrigger
                value="book"
                className="h-9 flex-1 rounded-full px-4 text-base font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=inactive]:text-orange-700 sm:flex-none"
              >
                {tx("堂食")}
              </TabsTrigger>
              <TabsTrigger
                value="takeaway"
                className="h-9 flex-1 rounded-full px-4 text-base font-semibold data-[state=active]:bg-sky-500 data-[state=active]:text-white data-[state=inactive]:text-sky-700 sm:flex-none"
              >
                {tx("外賣")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="secondary" size="icon" className="h-9 w-9 rounded-full" aria-label="Favorites">
              <Link href="/favorites">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="icon" className="h-9 w-9 rounded-full" aria-label="Shopping Cart">
              <Link href="/cart">
                <ShoppingBasket className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {!pendingBannerDismissed && pendingCount > 0 ? (
        <Card className="border-border/80 bg-gradient-to-r from-orange-500/10 via-background to-sky-500/10">
          <CardContent className="p-3">
            <div
              role="button"
              tabIndex={0}
              className="flex items-center justify-between gap-3"
              onClick={() => router.push("/review/pending")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push("/review/pending");
              }}
              aria-label={`${tx("你有")} ${pendingCount} ${tx("則評論尚未回應")}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{tx("你有")} {pendingCount} {tx("則評論尚未回應")}</p>
                <p className="text-xs text-muted-foreground">{tx("每次回應")} +0.2 $OSM</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
                  aria-label={tx("稍後")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingBannerDismissed(true);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
                <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section>
        <SectionHeader
          title={serviceMode === "takeaway" ? tx("個人化食物推薦") : tx("個人化餐廳推薦")}
          subtitle={tx("根據你的偏好、近期紀錄及可信評論篩選")}
          action={
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                aria-label="換一批"
                onClick={() => setSuggestionSeed((prev) => prev + 1)}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          }
        />
        <div className="space-y-3">
          {personalizedSuggestions.map((item) => (
            <AiFoodSuggestionCard
              key={item.intent.id}
              intent={item.intent}
              restaurant={item.restaurant}
              review={item.review}
              serviceMode={serviceMode}
              onDislike={(selected) => {
                setDislikeIntent(selected);
                setDislikeReason("taste");
                setDislikeOtherText("");
                setDislikeOpen(true);
              }}
            />
          ))}
          {personalizedSuggestions.length === 0 ? (
            <Card className="border-dashed border-border/80">
              <CardContent className="p-4 text-sm text-muted-foreground">
                {tx("暫時未有可用評論，請按「換一批」或調整偏好後再試。")}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      <Dialog
        open={dislikeOpen}
        onOpenChange={(open) => {
          setDislikeOpen(open);
          if (!open) setDislikeIntent(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("將「")}{tx(dislikeIntent?.title || "呢個建議")}{tx("」標記為不感興趣？")}</DialogTitle>
            <DialogDescription>{tx("選一個原因，我哋會用作調整之後推薦。")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">{tx("原因")}</Label>
              <RadioGroup value={dislikeReason} onValueChange={setDislikeReason} className="space-y-2">
                {dislikeReasons.map((reason) => (
                  <div key={reason.value} className="flex items-center gap-2">
                    <RadioGroupItem value={reason.value} id={`dislike-${reason.value}`} />
                    <Label htmlFor={`dislike-${reason.value}`} className="text-sm font-normal">
                      {tx(reason.label)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {dislikeReason === "other" ? (
              <div className="space-y-2">
                <Label htmlFor="dislike-other" className="text-sm">
                  {tx("其他原因（可選）")}
                </Label>
                <Textarea
                  id="dislike-other"
                  value={dislikeOtherText}
                  onChange={(event) => setDislikeOtherText(event.target.value)}
                  placeholder={tx("例如：對呢間餐廳冇興趣")}
                  className="min-h-[80px]"
                />
              </div>
            ) : null}

            <p className="text-xs text-muted-foreground">{dislikeFeedbackMessage}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDislikeOpen(false)}>
              {tx("取消")}
            </Button>
            <Button
              type="button"
              className={cn("gap-2", !dislikeIntent ? "pointer-events-none opacity-50" : "")}
              onClick={() => {
                if (!dislikeIntent) return;
                const reasonLabel = dislikeReasons.find((r) => r.value === dislikeReason)?.label || tx("其他");
                const reasonText =
                  dislikeReason === "other" && dislikeOtherText.trim()
                    ? `${reasonLabel}：${dislikeOtherText.trim()}`
                    : reasonLabel;

                addDislikedFoodIntent(dislikeIntent.id, reasonText);
                setDislikeOpen(false);

                toast({
                  title: tx("已收到回饋"),
                  description: dislikeFeedbackMessage,
                  action: (
                    <ToastAction
                      altText={tx("撤銷")}
                      onClick={() => {
                        removeDislikedFoodIntent(dislikeIntent.id);
                      }}
                    >
                      {tx("撤銷")}
                    </ToastAction>
                  ),
                });
              }}
            >
              {tx("確認")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
