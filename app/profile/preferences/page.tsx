"use client";

import { HeartPulse, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

export default function ProfilePreferencesPage() {
  const { tx } = useI18n();
  const { preferences } = useAppState();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Dining Preferences")} subtitle={tx("Used to personalize recommendations")} />

      <Card className="border-border/80">
        <CardContent className="space-y-4 p-4">
          <div className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{tx("Favorite cuisines")}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {preferences.cuisines.map((cuisine) => (
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
              {preferences.areas.map((area) => (
                <Badge key={area} variant="outline" className="text-[11px]">
                  {tx(area)}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Budget")}</p>
              </div>
              <p className="text-sm text-foreground">{tx(preferences.budgetRange)}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Dining for")}</p>
              </div>
              <p className="text-sm text-foreground">{tx(preferences.diningFor)}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Spice preference")}</p>
              </div>
              <p className="text-sm text-foreground">{tx(preferences.spicePreference)}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Dietary")}</p>
              </div>
              <p className="text-sm text-foreground">
                {preferences.dietaryRestrictions.length ? preferences.dietaryRestrictions.map(tx).join(", ") : "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">{tx("Medical / allergy notes")}</p>
              </div>
              <p className="text-sm text-foreground">
                {preferences.healthNotes.length ? preferences.healthNotes.map(tx).join(", ") : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
