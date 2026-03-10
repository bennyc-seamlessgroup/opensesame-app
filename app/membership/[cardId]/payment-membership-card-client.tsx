"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, TicketPercent } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { membershipCards, restaurants } from "@/lib/mock-data";
import { formatHKD } from "@/lib/utils";

export function MembershipCardDetailClient({ cardId }: { cardId: string }) {
  const { tx } = useI18n();
  const card = membershipCards.find((item) => item.id === cardId);
  const restaurant = card ? restaurants.find((item) => item.id === card.restaurantId) : null;

  if (!card) {
    return <p className="text-sm text-muted-foreground">{tx("搵唔到呢個內容。")}</p>;
  }

  const ctaLabel =
    card.acquisition.type === "FREE"
      ? tx("I want to get this card")
      : card.acquisition.type === "PAID"
        ? `${tx("I want to get this card")} · ${formatHKD(card.acquisition.price || 0)}`
        : `${tx("I want to get this card")} · ${tx("需餐廳審批")}`;

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("NFT Cards")} subtitle={restaurant?.name || card.name} />

      <Card className="overflow-hidden rounded-[28px] border-border/70 bg-card shadow-sm">
        <div className="relative aspect-[16/10] w-full bg-muted p-4">
          <Image src={card.image} alt={card.name} fill className="object-contain" sizes="480px" />
        </div>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{card.tier}</Badge>
            <Badge variant="outline">{restaurant?.area}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{card.acquisition.note}</p>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-3 p-4">
          <SectionHeader title={tx("Benefits")} subtitle={tx("Offers & discounts")} />
          <div className="space-y-3">
            {card.offers.map((offer) => (
              <div key={offer.id} className="rounded-2xl border border-border/80 bg-secondary/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{offer.title}</p>
                    {offer.subtitle ? <p className="mt-1 text-xs text-muted-foreground">{offer.subtitle}</p> : null}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <TicketPercent className="mr-1 h-3.5 w-3.5" />
                    {offer.discountLabel}
                  </Badge>
                </div>
                {offer.terms ? <p className="mt-2 text-xs leading-5 text-muted-foreground">{offer.terms}</p> : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            {card.acquisition.type === "APPROVAL" ? <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <p>{card.acquisition.note}</p>
          </div>
          <Button asChild className="w-full rounded-xl">
            <Link href={restaurant ? `/restaurant/${restaurant.id}` : "/profile/membership"}>{ctaLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
