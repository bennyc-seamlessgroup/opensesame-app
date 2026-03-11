"use client";

import { HeartPulse, Sparkles, UtensilsCrossed } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

const cuisineOptions = ["Italian", "Thai", "Cafe", "Spanish", "Western", "Healthy"];
const dietaryOptions = ["Low sugar", "Vegetarian", "Gluten free", "Dairy free"];
const healthOptions = ["Low sodium", "Nut allergy", "Shellfish allergy", "Pregnancy-safe"];
const spiceOptions = ["No spicy", "Mild", "Anything"] as const;
const diningForOptions = ["Solo", "Couple", "Family", "Friends"] as const;
const budgetOptions = ["HK$100 - HK$250", "HK$250 - HK$450", "HK$450+"] as const;

export default function SettingsPreferencesPage() {
  const { tx } = useI18n();
  const { preferences, updatePreferences } = useAppState();

  const toggleListValue = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const renderChoicePills = (
    values: readonly string[],
    activeValue: string | string[],
    onSelect: (value: string) => void
  ) => (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => {
        const active = Array.isArray(activeValue) ? activeValue.includes(value) : activeValue === value;
        return (
          <Button
            key={value}
            type="button"
            variant={active ? "default" : "secondary"}
            className="h-9 rounded-full px-4 text-xs"
            onClick={() => onSelect(value)}
          >
            {tx(value)}
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Personal preferences")} subtitle={tx("Tune recommendations around your taste and health needs")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{tx("Favorite cuisines")}</p>
            </div>
            {renderChoicePills(cuisineOptions, preferences.cuisines, (value) =>
              updatePreferences({ cuisines: toggleListValue(preferences.cuisines, value) })
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{tx("Dining for")}</p>
            </div>
            {renderChoicePills(diningForOptions, preferences.diningFor, (value) =>
              updatePreferences({ diningFor: value as (typeof diningForOptions)[number] })
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{tx("Budget")}</p>
            </div>
            {renderChoicePills(budgetOptions, preferences.budgetRange, (value) =>
              updatePreferences({ budgetRange: value })
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">{tx("Spice preference")}</p>
            </div>
            {renderChoicePills(spiceOptions, preferences.spicePreference, (value) =>
              updatePreferences({ spicePreference: value as (typeof spiceOptions)[number] })
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{tx("Dietary restrictions")}</p>
            {renderChoicePills(dietaryOptions, preferences.dietaryRestrictions, (value) =>
              updatePreferences({
                dietaryRestrictions: toggleListValue(preferences.dietaryRestrictions, value),
              })
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{tx("Medical / allergy notes")}</p>
            {renderChoicePills(healthOptions, preferences.healthNotes, (value) =>
              updatePreferences({ healthNotes: toggleListValue(preferences.healthNotes, value) })
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{tx("Avoid spicy suggestions")}</p>
              <p className="text-xs text-muted-foreground">{tx("Hide obviously spicy picks in AI suggestions")}</p>
            </div>
            <Switch
              checked={preferences.spicePreference === "No spicy"}
              onCheckedChange={(checked) =>
                updatePreferences({ spicePreference: checked ? "No spicy" : "Mild" })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
