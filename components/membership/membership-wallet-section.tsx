"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, TicketPercent } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { membershipCards, restaurants } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MembershipWalletSection({ className }: { className?: string }) {
  const { tx } = useI18n();
  const { membership, addMembershipCard, setActiveMembershipCard } = useAppState();
  const [openBrowse, setOpenBrowse] = useState(false);

  const restaurantById = useMemo(() => new Map(restaurants.map((r) => [r.id, r])), []);
  const ownedCards = useMemo(
    () => membershipCards.filter((card) => membership.ownedCardIds.includes(card.id)),
    [membership.ownedCardIds]
  );

  const activeCard = useMemo(() => {
    const byId = new Map(membershipCards.map((card) => [card.id, card]));
    return (membership.activeCardId ? byId.get(membership.activeCardId) : null) ?? ownedCards[0] ?? null;
  }, [membership.activeCardId, ownedCards]);

  return (
    <>
      <Card id="membership-cards" className={cn("border-border/80", className)}>
        <CardContent className="space-y-3 p-4">
          <SectionHeader
            title={tx("NFT Cards")}
            subtitle={tx("Select a card to view perks")}
            action={
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 gap-1 rounded-full px-3 text-xs"
                onClick={() => setOpenBrowse(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                {tx("Browse cards")}
              </Button>
            }
          />

          {ownedCards.length ? (
            <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide">
              <div className="flex snap-x snap-mandatory gap-3">
                {ownedCards.map((card) => {
                  const isActive = activeCard?.id === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveMembershipCard(card.id)}
                      className={cn(
                        "relative w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card text-left transition",
                        isActive ? "border-orange-500/60 ring-2 ring-orange-500/25" : "border-border/70 opacity-90 hover:opacity-100"
                      )}
                      aria-label={tx("Select membership card")}
                    >
                      <div className="relative aspect-[16/10] w-full bg-muted p-2">
                        <Image src={card.image} alt={card.name} fill className="object-contain" sizes="260px" />
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">{restaurantById.get(card.restaurantId)?.name || card.name}</p>
                          <p className="text-[11px] text-muted-foreground">{tx(card.tier)}</p>
                        </div>
                        {isActive ? (
                          <Badge variant="secondary" className="text-[10px]">
                            {tx("Active")}
                          </Badge>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <Card className="border-border/80">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium text-foreground">{tx("No membership cards yet (demo).")}</p>
                <p className="text-xs text-muted-foreground">{tx("Browse a list of restaurant cards to add.")}</p>
                <Button type="button" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => setOpenBrowse(true)}>
                  {tx("Browse cards")}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeCard ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {restaurantById.get(activeCard.restaurantId)?.name || activeCard.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx("Offers & discounts")}</p>
                </div>
                <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                  <Link href={`/membership/${activeCard.id}`}>{tx("View")}</Link>
                </Button>
              </div>

              <div className="grid gap-2">
                {activeCard.offers.map((offer) => (
                  <div key={offer.id} className="rounded-2xl border border-border/80 bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{offer.title}</p>
                        {offer.subtitle ? <p className="text-xs text-muted-foreground">{offer.subtitle}</p> : null}
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        <TicketPercent className="mr-1 h-3.5 w-3.5" />
                        {offer.discountLabel}
                      </Badge>
                    </div>
                    {offer.terms ? <p className="mt-2 text-[11px] text-muted-foreground">{offer.terms}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={openBrowse} onOpenChange={setOpenBrowse}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{tx("Browse restaurant cards")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {membershipCards.map((card) => {
              const restaurant = restaurantById.get(card.restaurantId);
              const owned = membership.ownedCardIds.includes(card.id);
              return (
                <div key={card.id} className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-3">
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
                    <Image src={card.image} alt={card.name} fill className="object-contain" sizes="80px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name || card.name}</p>
                    <p className="text-xs text-muted-foreground">{restaurant?.area ? `${restaurant.area} · ${tx(card.tier)}` : tx(card.tier)}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={owned ? "secondary" : "default"}
                    className="h-8 rounded-full px-3 text-xs"
                    disabled={owned}
                    onClick={() => addMembershipCard(card.id)}
                  >
                    {owned ? tx("Added") : tx("Add")}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
