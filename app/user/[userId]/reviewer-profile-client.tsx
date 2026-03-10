"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, ShieldCheck, UserPlus } from "lucide-react";
import { ReviewPostCard } from "@/components/review-post-card";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { membershipCards, restaurants, reviews as seedReviews, user, type MembershipCard, type Review } from "@/lib/mock-data";

type SortMode = "latest" | "agreed";

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

export function ReviewerProfileClient({ userId }: { userId: string }) {
  const { tx } = useI18n();
  const searchParams = useSearchParams();
  const { reviews, social, toggleFollowUser, membership } = useAppState();
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const activeTab = searchParams.get("tab") === "badges" ? "badges" : "reviews";
  const isSelf = userId === user.id;

  const restaurantById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), []);
  const membershipByRestaurantId = useMemo(() => new Map(membershipCards.map((card) => [card.restaurantId, card])), []);

  const mergedReviews = useMemo(() => {
    const all = [...reviews, ...seedReviews];
    return all.filter((review, index, list) => list.findIndex((item) => item.id === review.id) === index);
  }, [reviews]);

  const reviewerReviews = useMemo(
    () => mergedReviews.filter((review) => review.verifiedVisit && review.userId === userId),
    [mergedReviews, userId]
  );

  const dummyReviews = useMemo<Review[]>(() => {
    if (reviewerReviews.length > 0) return [];
    const selected = restaurants.slice(0, 3);
    return selected.map((restaurant, index) => ({
      id: `dummy-${userId}-${restaurant.id}`,
      userId,
      userName: userId.replace(/^user-/, "").replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Foodie",
      userAvatar: `/images/avatar-${(stableInt(`${userId}:avatar`, 1, 3)).toString()}.jpg`,
      restaurantId: restaurant.id,
      relatedType: "VISIT",
      relatedId: `visit-${userId}-${index + 1}`,
      createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      agreeCount: stableInt(`${userId}:${restaurant.id}:agree`, 6, 42),
      disagreeCount: stableInt(`${userId}:${restaurant.id}:disagree`, 0, 8),
      ratings: {
        food: stableInt(`${userId}:${restaurant.id}:food`, 4, 5),
        service: stableInt(`${userId}:${restaurant.id}:service`, 3, 5),
        atmosphere: stableInt(`${userId}:${restaurant.id}:atmo`, 3, 5),
      },
      text: `Great experience at ${restaurant.name}. Good quality and consistent service. Would come again with friends.`,
      photos: [restaurant.coverImage],
      verifiedVisit: true,
      verificationMethod: "AUTO",
      txHash: null,
      userReputationScore: stableInt(`${userId}:cred`, 80, 95),
      helpedDecisions: stableInt(`${userId}:${restaurant.id}:helped`, 12, 80),
      aiCitations: stableInt(`${userId}:${restaurant.id}:ai`, 2, 14),
      tags: restaurant.tags.slice(0, 3).map((tag) => tag.toLowerCase()),
    }));
  }, [reviewerReviews.length, userId]);

  const effectiveReviews = reviewerReviews.length > 0 ? reviewerReviews : dummyReviews;

  const profile = useMemo(() => {
    const sample = effectiveReviews[0];
    if (!sample) return null;

    const credibilityScore = Math.round(
      effectiveReviews.reduce((acc, r) => acc + r.userReputationScore, 0) / Math.max(1, effectiveReviews.length)
    );

    const agree = effectiveReviews.reduce((acc, r) => acc + Math.max(0, r.agreeCount), 0);
    const disagree = effectiveReviews.reduce((acc, r) => acc + Math.max(0, r.disagreeCount), 0);
    const totalVotes = agree + disagree;
    const agreeRatePct = totalVotes > 0 ? Math.round((agree / totalVotes) * 100) : 0;

    const categoryCounts = new Map<string, number>();
    for (const r of effectiveReviews) {
      const restaurant = restaurantById.get(r.restaurantId);
      if (!restaurant) continue;
      for (const tag of restaurant.tags) categoryCounts.set(tag, (categoryCounts.get(tag) ?? 0) + 1);
    }
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 3);

    const isFollowing = social.followingUserIds.includes(userId);
    const followersBase = stableInt(`${userId}:followers`, 340, 5600);
    const followingBase = stableInt(`${userId}:following`, 120, 980);
    const followersCount = followersBase + (isFollowing ? 1 : 0);

    return {
      userId,
      username: sample.userName,
      avatar: sample.userAvatar,
      credibilityScore,
      followersCount,
      followingCount: followingBase,
      totalReviews: effectiveReviews.length,
      agreeRatePct,
      totalVotes,
      topCategories,
      isFollowing,
      isSelf: userId === user.id,
    };
  }, [effectiveReviews, restaurantById, social.followingUserIds, userId]);

  const sortedReviews = useMemo(() => {
    const next = [...effectiveReviews];
    if (sortMode === "agreed") next.sort((a, b) => b.agreeCount - a.agreeCount);
    else next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return next;
  }, [effectiveReviews, sortMode]);

  const visitorsCount = useMemo(() => stableInt(`${userId}:visitors`, 20, 120), [userId]);

  const membershipShowcase = useMemo<MembershipCard[]>(() => {
    const sourceIds = isSelf ? membership.ownedCardIds : Array.from(new Set(effectiveReviews.map((r) => r.restaurantId)));
    return sourceIds
      .map((id) => membershipByRestaurantId.get(id))
      .filter((item): item is MembershipCard => Boolean(item))
      .slice(0, 12);
  }, [effectiveReviews, isSelf, membership.ownedCardIds, membershipByRestaurantId]);

  const headerImage = useMemo(() => {
    const firstRestaurantId = effectiveReviews[0]?.restaurantId;
    return restaurantById.get(firstRestaurantId || "")?.coverImage || restaurants[0]?.coverImage || "/images/restaurant-1.jpg";
  }, [effectiveReviews, restaurantById]);

  if (!profile) {
    return (
      <div className="space-y-4">
        <SectionHeader title={tx("Reviewer")} subtitle={tx("找不到該用戶（demo）")} />
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-foreground">{tx("此 reviewer 暫無公開 verified 評論。")}</p>
            <Button asChild size="sm" className="h-8 rounded-lg">
              <Link href="/explore">{tx("返回 Explore")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card">
        <div className="relative h-36 w-full">
          <Image
            src={headerImage}
            alt={profile.username}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-background/95" />
          <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
            <Button asChild size="icon" variant="secondary" className="h-8 w-8 rounded-full">
              <Link href="/explore">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative px-4 pb-4">
          <div className="-mt-10 flex items-end justify-between gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-muted">
              {profile.avatar ? <Image src={profile.avatar} alt={profile.username} fill className="object-cover" sizes="80px" /> : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="h-9 rounded-full bg-orange-500 px-5 text-white hover:bg-orange-600"
                onClick={() => toggleFollowUser(profile.userId)}
                disabled={profile.isSelf}
              >
                {profile.isSelf ? tx("You") : profile.isFollowing ? tx("Following") : tx("Follow")}
              </Button>
              <Button size="icon" variant="outline" className="h-9 w-9 rounded-full">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-1.5">
              <p className="text-2xl font-semibold text-foreground">{profile.username}</p>
              <ShieldCheck className="h-4 w-4 text-sky-500" />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="inline-flex items-center gap-1 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{profile.credibilityScore}</span>
              </Badge>
              {profile.topCategories.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[11px]">{tag}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/80 bg-background/60 p-2.5">
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{profile.followingCount}</p>
                <p className="text-[11px] text-muted-foreground">{tx("following")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{profile.followersCount}</p>
                <p className="text-[11px] text-muted-foreground">{tx("followers")}</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{visitorsCount}</p>
                <p className="text-[11px] text-muted-foreground">{tx("Visitors")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="reviews" asChild>
              <Link href={`/user/${userId}`}>{tx("Reviews")}</Link>
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="badges" asChild>
              <Link href={`/user/${userId}?tab=badges`}>{tx("Membership Cards")}</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {activeTab === "badges" ? (
        <section className="space-y-2">
          <SectionHeader
            title={tx("Membership Cards")}
            subtitle={tx("Showcase restaurant perks")}
            action={
              isSelf ? (
                <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                  <Link href="/profile/membership">{tx("Manage")}</Link>
                </Button>
              ) : null
            }
          />

          {membershipShowcase.length ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {membershipShowcase.map((card) => {
                const restaurant = restaurantById.get(card.restaurantId);
                return (
                  <Link
                    key={card.id}
                    href={`/restaurant/${card.restaurantId}`}
                    className="group overflow-hidden rounded-2xl border border-border/80 bg-card"
                  >
                    <div className="relative aspect-[16/10] w-full bg-muted p-2">
                      <Image src={card.image} alt={card.name} fill className="object-contain" sizes="240px" />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-white">{restaurant?.name || card.name}</p>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          {card.offers.length} {tx("offers")}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-border/80">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium text-foreground">{tx("No membership cards yet (demo).")}</p>
                {isSelf ? (
                  <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
                    <Link href="/profile/membership">{tx("Browse cards")}</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}
        </section>
      ) : (
        <section className="space-y-2">
          <SectionHeader title={tx("Reviews")} subtitle={`${profile.totalReviews} ${tx("reviews")}`} />
          <Tabs value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
            <TabsList className="w-full">
              <TabsTrigger className="flex-1" value="latest">{tx("Latest")}</TabsTrigger>
              <TabsTrigger className="flex-1" value="agreed">{tx("Most agreed")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="space-y-3">
            {sortedReviews.map((review) => (
              <ReviewPostCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
