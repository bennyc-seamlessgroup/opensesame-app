"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ReviewerCard } from "@/components/reviewer-card";
import { ReviewPostCard } from "@/components/review-post-card";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";

type SortMode = "latest" | "agreed";

const stableInt = (seed: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const span = Math.max(1, max - min + 1);
  return min + (hash % span);
};

export function ReviewerProfileClient({ userId }: { userId: string }) {
  const { tx } = useI18n();
  const { reviews, social, toggleFollowUser } = useAppState();
  const [sortMode, setSortMode] = useState<SortMode>("latest");

  const restaurantById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), []);

  const reviewerReviews = useMemo(
    () => reviews.filter((review) => review.verifiedVisit && review.userId === userId),
    [reviews, userId]
  );

  const profile = useMemo(() => {
    const sample = reviewerReviews[0];
    if (!sample) return null;

    const credibilityScore = Math.round(
      reviewerReviews.reduce((acc, r) => acc + r.userReputationScore, 0) / Math.max(1, reviewerReviews.length)
    );

    const agree = reviewerReviews.reduce((acc, r) => acc + Math.max(0, r.agreeCount), 0);
    const disagree = reviewerReviews.reduce((acc, r) => acc + Math.max(0, r.disagreeCount), 0);
    const totalVotes = agree + disagree;
    const agreeRatePct = totalVotes > 0 ? Math.round((agree / totalVotes) * 100) : 0;

    const categoryCounts = new Map<string, number>();
    for (const r of reviewerReviews) {
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
      totalReviews: reviewerReviews.length,
      agreeRatePct,
      totalVotes,
      topCategories,
      isFollowing,
      isSelf: userId === user.id,
    };
  }, [restaurantById, reviewerReviews, social.followingUserIds, userId]);

  const sortedReviews = useMemo(() => {
    const next = [...reviewerReviews];
    if (sortMode === "agreed") next.sort((a, b) => b.agreeCount - a.agreeCount);
    else next.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return next;
  }, [reviewerReviews, sortMode]);

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
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionHeader title={tx("Reviewer Profile")} action={<Link href="/explore" className="text-xs text-muted-foreground hover:underline">{tx("Explore")}</Link>} />
        <Card className="border-border/80">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border/70 bg-muted">
                {profile.avatar ? <Image src={profile.avatar} alt={profile.username} fill className="object-cover" sizes="56px" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-foreground">{profile.username}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="inline-flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{profile.credibilityScore}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-[11px]">{profile.followersCount.toLocaleString()} {tx("followers")}</Badge>
                  <Badge variant="secondary" className="text-[11px]">{profile.followingCount.toLocaleString()} {tx("following")}</Badge>
                  <Badge variant="outline" className="text-[11px]">{profile.totalReviews} {tx("reviews")}</Badge>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant={profile.isFollowing ? "secondary" : "default"}
                className="h-9 rounded-lg px-4"
                onClick={() => toggleFollowUser(profile.userId)}
                disabled={profile.isSelf}
              >
                {profile.isSelf ? tx("You") : profile.isFollowing ? tx("Following") : tx("Follow")}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-secondary p-2">
                <p className="text-[11px] text-muted-foreground">{tx("Agree rate")}</p>
                <p className="text-sm font-semibold text-foreground">{profile.agreeRatePct}%</p>
              </div>
              <div className="rounded-lg bg-secondary p-2">
                <p className="text-[11px] text-muted-foreground">{tx("Votes received")}</p>
                <p className="text-sm font-semibold text-foreground">{profile.totalVotes.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-secondary p-2">
                <p className="text-[11px] text-muted-foreground">{tx("Top category")}</p>
                <p className="text-sm font-semibold text-foreground">{profile.topCategories[0] ?? "—"}</p>
              </div>
            </div>

            {profile.topCategories.length ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.topCategories.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[11px] text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title={tx("Reviews")} />
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

      <section className="space-y-3">
        <SectionHeader title={tx("More reviewers")} />
        <div className="-mx-4 overflow-x-auto px-4 pb-1">
          <div className="flex gap-3">
            {reviews
              .filter((r) => r.verifiedVisit)
              .reduce<{ userId: string; username: string; avatar?: string; credibility: number }[]>((acc, r) => {
                if (r.userId === profile.userId || r.userId === user.id) return acc;
                if (acc.some((x) => x.userId === r.userId)) return acc;
                acc.push({ userId: r.userId, username: r.userName, avatar: r.userAvatar, credibility: r.userReputationScore });
                return acc;
              }, [])
              .slice(0, 12)
              .map((r) => (
                <ReviewerCard
                  key={r.userId}
                  userId={r.userId}
                  username={r.username}
                  avatar={r.avatar}
                  credibilityScore={r.credibility}
                  followersCount={stableInt(`${r.userId}:followers`, 340, 5600) + (social.followingUserIds.includes(r.userId) ? 1 : 0)}
                />
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
