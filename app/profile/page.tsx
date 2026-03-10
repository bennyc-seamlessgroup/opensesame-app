"use client";

import Image from "next/image";
import Link from "next/link";
import { Award, Bookmark, Compass, Heart, Settings, Share2, ShieldCheck, Wallet } from "lucide-react";
import { useMemo } from "react";
import { ExploreRestaurantCard } from "@/components/explore-restaurant-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants, user } from "@/lib/mock-data";
import { formatVira } from "@/lib/utils";

export default function ProfilePage() {
  const { tx } = useI18n();
  const { reviews, social, wallet } = useAppState();
  const saved = restaurants.filter((restaurant) => user.savedRestaurantIds.includes(restaurant.id));
  const visited = restaurants.filter((restaurant) => user.visitedRestaurantIds.includes(restaurant.id));

  const reviewCount = reviews.length;
  const aiCitationsTotal = useMemo(() => reviews.reduce((acc, review) => acc + review.aiCitations, 0), [reviews]);
  const decisionsHelpedTotal = useMemo(() => reviews.reduce((acc, review) => acc + review.helpedDecisions, 0), [reviews]);

  return (
    <div className="space-y-4 pb-2">
      <Card className="border-border/80 bg-gradient-to-br from-orange-500/10 via-background to-sky-500/10">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-border/70 bg-muted">
                <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="56px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.diningRankLabel}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{tx("Cred")} {user.reputationScore}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {tx("Verified")} {user.verifiedRatioPct}%
                  </Badge>
                </div>
              </div>
            </div>

            <Button asChild variant="secondary" size="icon" className="h-9 w-9 rounded-full" aria-label="Settings">
              <Link href="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("Wallet")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatVira(wallet.viraBalance + wallet.stakedBalance)}
              </p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("Saved")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{social.savedReviewIds.length}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("Following")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{social.followingUserIds.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button asChild variant="secondary" className="h-10 flex-col gap-1 rounded-xl px-2 text-xs">
              <Link href="/wallet">
                <Wallet className="h-4 w-4" />
                {tx("Wallet")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 flex-col gap-1 rounded-xl px-2 text-xs">
              <Link href="/orders">
                <Award className="h-4 w-4" />
                {tx("Orders")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 flex-col gap-1 rounded-xl px-2 text-xs">
              <Link href="/favorites">
                <Heart className="h-4 w-4" />
                {tx("Favs")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 flex-col gap-1 rounded-xl px-2 text-xs">
              <Link href="/saved">
                <Bookmark className="h-4 w-4" />
                {tx("Saved")}
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" className="h-10 gap-2 rounded-xl">
              <Link href="/referral">
                <Share2 className="h-4 w-4" />
                {tx("Referral Hub")}
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-10 gap-2 rounded-xl">
              <Link href="/explore">
                <Compass className="h-4 w-4" />
                {tx("Explore")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <SectionHeader
            title={tx("飲食偏好")}
            subtitle={tx("用嚟提升推薦準確度")}
            action={
              <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                <Link href="/settings">{tx("Edit")}</Link>
              </Button>
            }
          />

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{tx("菜式")}</p>
              <div className="flex flex-wrap gap-1.5">
                {user.preferences.cuisines.slice(0, 10).map((cuisine) => (
                  <Badge key={cuisine} variant="secondary" className="text-[11px]">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{tx("地區")}</p>
              <div className="flex flex-wrap gap-1.5">
                {user.preferences.areas.slice(0, 8).map((area) => (
                  <Badge key={area} variant="outline" className="text-[11px]">
                    {tx(area)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{tx("Budget")}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{user.preferences.budgetRange}</p>
              </div>
              <div className="rounded-xl bg-secondary p-3">
                <p className="text-xs text-muted-foreground">{tx("Dietary")}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {user.preferences.dietaryRestrictions.length ? user.preferences.dietaryRestrictions.join(", ") : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <SectionHeader title={tx("貢獻")} subtitle={tx("你嘅食評影響力（demo）")} />
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("Reviews")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{reviewCount}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("AI citations")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{aiCitationsTotal}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <p className="text-xs text-muted-foreground">{tx("Helped")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{decisionsHelpedTotal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <SectionHeader title={tx("收藏餐廳")} subtitle={saved.length ? `${saved.length} ${tx("間")}` : tx("未有收藏")} action={<Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs"><Link href="/favorites">{tx("View")}</Link></Button>} />
        {saved.length ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
            <div className="flex snap-x snap-mandatory gap-3">
              {saved.map((restaurant) => (
                <ExploreRestaurantCard key={restaurant.id} restaurant={restaurant} mode="all" className="w-[320px] shrink-0 snap-start" />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium text-foreground">{tx("未有收藏餐廳。")}</p>
              <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
                <Link href="/explore">{tx("去 Explore")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader title={tx("去過餐廳")} subtitle={visited.length ? `${visited.length} ${tx("間")}` : tx("未有到訪")} />
        {visited.length ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
            <div className="flex snap-x snap-mandatory gap-3">
              {visited.map((restaurant) => (
                <ExploreRestaurantCard key={restaurant.id} restaurant={restaurant} mode="all" className="w-[320px] shrink-0 snap-start" />
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium text-foreground">{tx("未有到訪記錄。")}</p>
              <p className="text-xs text-muted-foreground">{tx("完成交易（pay + verify）後，會出現到訪紀錄。")}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
