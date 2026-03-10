"use client";

import Link from "next/link";
import { useMemo } from "react";
import { TopFoodieCard } from "@/components/top-foodie-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";

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

export function FoodiesClient() {
  const { tx } = useI18n();
  const { reviews, social } = useAppState();

  const exploreReviews = useMemo(() => reviews.filter((review) => review.verifiedVisit), [reviews]);

  const foodies = useMemo(() => {
    const byUser = new Map<string, ReviewerSummary>();

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
          };
      byUser.set(review.userId, next);
    }

    for (const [userId, summary] of byUser.entries()) {
      const userReviews = exploreReviews.filter((r) => r.userId === userId);
      const agree = userReviews.reduce((acc, r) => acc + Math.max(0, r.agreeCount), 0);
      const disagree = userReviews.reduce((acc, r) => acc + Math.max(0, r.disagreeCount), 0);
      const total = agree + disagree;
      const agreeRatePct = total > 0 ? Math.round((agree / total) * 100) : 0;

      const isFollowed = social.followingUserIds.includes(userId);
      const followersCount = summary.followersCount + (isFollowed ? 1 : 0);

      byUser.set(userId, { ...summary, agreeRatePct, followersCount });
    }

    const score = (r: ReviewerSummary) => {
      const recencyBoost = Math.max(0, 14 - daysAgo(r.lastActiveAt)) * 2.5;
      const agreeBoost = r.agreeRatePct * 0.35;
      const followerBoost = Math.min(25, Math.log10(Math.max(1, r.followersCount)) * 10);
      return r.credibilityScore * 0.6 + agreeBoost + recencyBoost + followerBoost;
    };

    const pickCover = (userId: string) => {
      if (!restaurants.length) return "";
      const idx = stableInt(`${userId}:cover`, 0, restaurants.length - 1);
      return restaurants[idx]?.coverImage || restaurants[0]!.coverImage;
    };

    return Array.from(byUser.values())
      .filter((r) => r.userId !== user.id)
      .sort((a, b) => score(b) - score(a))
      .map((r) => ({ ...r, coverImage: pickCover(r.userId) }));
  }, [exploreReviews, social.followingUserIds]);

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader
        title="達人用戶"
        subtitle={tx("發掘更多 Foodie（demo）")}
        action={
          <Button asChild variant="secondary" size="sm" className="h-8 rounded-lg">
            <Link href="/explore">{tx("Back")}</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3">
        {foodies.map((foodie) => (
          <TopFoodieCard
            key={foodie.userId}
            userId={foodie.userId}
            username={foodie.username}
            avatar={foodie.avatar}
            credibilityScore={foodie.credibilityScore}
            followersCount={foodie.followersCount}
            coverImage={foodie.coverImage}
          />
        ))}
      </div>
    </div>
  );
}
