"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { user } from "@/lib/mock-data";

export default function ProfilePreferencesPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Button asChild size="icon" variant="secondary" className="h-9 w-9 rounded-full">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-lg font-semibold text-foreground">{tx("Dining Preferences")}</p>
          <p className="text-xs text-muted-foreground">{tx("Used to personalize recommendations")}</p>
        </div>
      </div>

      <Card className="border-border/80">
        <CardContent className="space-y-4 p-4">
          <SectionHeader
            title={tx("Preference Summary")}
            action={
              <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                <Link href="/settings">{tx("Edit")}</Link>
              </Button>
            }
          />

          <div className="grid gap-3">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Cuisines")}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.preferences.cuisines.map((cuisine) => (
                  <Badge key={cuisine} variant="secondary" className="text-[11px]">
                    {tx(cuisine)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Areas")}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.preferences.areas.map((area) => (
                  <Badge key={area} variant="outline" className="text-[11px]">
                    {tx(area)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">{tx("Budget")}</p>
                </div>
                <p className="text-sm text-foreground">{user.preferences.budgetRange}</p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-2 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold text-foreground">{tx("Dietary")}</p>
                </div>
                <p className="text-sm text-foreground">
                  {user.preferences.dietaryRestrictions.length ? user.preferences.dietaryRestrictions.join(", ") : "—"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
