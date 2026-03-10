"use client";

import Image from "next/image";
import Link from "next/link";
import { Banknote, Heart, MapPin, Medal, Settings, ShieldCheck, Ticket, UtensilsCrossed, Wallet } from "lucide-react";
import { useMemo } from "react";
import { ProfileFeatureTile } from "@/components/profile/profile-feature-tile";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { membershipCards, restaurants, user } from "@/lib/mock-data";

export default function ProfilePage() {
  const { tx } = useI18n();
  const { reviews, social, membership } = useAppState();
  const saved = restaurants.filter((restaurant) => user.savedRestaurantIds.includes(restaurant.id));
  const visited = restaurants.filter((restaurant) => user.visitedRestaurantIds.includes(restaurant.id));
  const ownedCards = membershipCards.filter((card) => membership.ownedCardIds.includes(card.id));

  const reviewCount = reviews.length;
  const decisionsHelpedTotal = useMemo(() => reviews.reduce((acc, review) => acc + review.helpedDecisions, 0), [reviews]);
  const nftTierSummary = useMemo(() => {
    const counts = { Bronze: 0, Silver: 0, Gold: 0 };
    for (const card of ownedCards) counts[card.tier] += 1;
    return counts;
  }, [ownedCards]);

  return (
    <div className="space-y-4 pb-4">
      <section className="overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-sm">
        <div className="relative h-56">
          <Image
            src="/images/food/paella.jpg"
            alt="Food background"
            fill
            className="scale-110 object-cover blur-sm"
            sizes="(max-width: 768px) 100vw, 480px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/55" />
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative flex h-full flex-col justify-between p-4 text-white">
            <div className="flex items-start justify-between gap-3">
              <Button asChild variant="secondary" size="icon" className="h-10 w-10 rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20">
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <div className="grid grid-cols-2 gap-6 text-right">
                <div>
                  <p className="text-3xl font-semibold leading-none">{social.followingUserIds.length}</p>
                  <p className="mt-1 text-xs text-white/75">{tx("Following")}</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold leading-none">{saved.length}</p>
                  <p className="mt-1 text-xs text-white/75">{tx("Saved")}</p>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="flex min-w-0 items-end gap-3">
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white/90 bg-white/15">
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="min-w-0 pb-1">
                  <p className="truncate text-3xl font-semibold">{user.name}</p>
                  <p className="mt-1 text-sm text-white/80">{user.diningRankLabel}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge className="border-0 bg-white/15 text-white hover:bg-white/15">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      {tx("Cred")} {user.reputationScore}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-semibold text-white/90">
                    <span className="inline-flex items-center gap-1" aria-label={`Bronze ${nftTierSummary.Bronze}`}>
                      <span>{nftTierSummary.Bronze}</span>
                      <Medal className="h-4 w-4 text-amber-600" />
                    </span>
                    <span className="inline-flex items-center gap-1" aria-label={`Silver ${nftTierSummary.Silver}`}>
                      <span>{nftTierSummary.Silver}</span>
                      <Medal className="h-4 w-4 text-slate-300" />
                    </span>
                    <span className="inline-flex items-center gap-1" aria-label={`Gold ${nftTierSummary.Gold}`}>
                      <span>{nftTierSummary.Gold}</span>
                      <Medal className="h-4 w-4 text-yellow-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="grid grid-cols-2 gap-3 p-4">
          <div className="rounded-2xl bg-secondary/70 p-4 text-center">
            <p className="text-xs text-muted-foreground">{tx("Reviews")}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{reviewCount}</p>
          </div>
          <div className="rounded-2xl bg-secondary/70 p-4 text-center">
            <p className="text-xs text-muted-foreground">{tx("Helped")}</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{decisionsHelpedTotal}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <ProfileFeatureTile
          href="/profile/membership"
          icon={Ticket}
          title="Membership Cards"
        />
        <ProfileFeatureTile
          href="/profile/preferences"
          icon={UtensilsCrossed}
          title="Dining Preferences"
        />
        <ProfileFeatureTile
          href="/profile/saved-restaurants"
          icon={Heart}
          title="Saved Restaurants"
        />
        <ProfileFeatureTile
          href="/profile/visited-restaurants"
          icon={MapPin}
          title="Visited Restaurants"
        />
        <ProfileFeatureTile
          href="/wallet"
          icon={Wallet}
          title="Wallet"
        />
        <ProfileFeatureTile
          href="/orders"
          icon={Banknote}
          title="Orders"
        />
      </div>
    </div>
  );
}
