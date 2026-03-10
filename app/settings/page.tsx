"use client";

import { Globe, HeartPulse, MapPin, Sparkles, UtensilsCrossed } from "lucide-react";
import { useMemo } from "react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppState, type AppLocale } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

const cuisineOptions = ["Italian", "Thai", "Cafe", "Spanish", "Western", "Healthy"];
const dietaryOptions = ["Low sugar", "Vegetarian", "Gluten free", "Dairy free"];
const healthOptions = ["Low sodium", "Nut allergy", "Shellfish allergy", "Pregnancy-safe"];
const spiceOptions = ["No spicy", "Mild", "Anything"] as const;
const diningForOptions = ["Solo", "Couple", "Family", "Friends"] as const;
const budgetOptions = ["HK$100 - HK$250", "HK$250 - HK$450", "HK$450+"] as const;

function SettingRow({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Globe;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-border/70 py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="pl-12">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { t, tx } = useI18n();
  const { locale, setLocale, preferences, updatePreferences } = useAppState();

  const preferredAreas = useMemo(() => preferences.areas.join(", "), [preferences.areas]);

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
      <SectionHeader title={t("settings")} subtitle={tx("Personalize the app to fit your dining habits")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="p-4">
          <SettingRow icon={Globe} title={t("language")} subtitle={tx("Switch app language instantly")}>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "en", label: t("english") },
                { value: "zh-HK", label: t("traditional_chinese") },
              ] as const).map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={locale === option.value ? "default" : "secondary"}
                  className="h-11 rounded-2xl"
                  onClick={() => setLocale(option.value as AppLocale)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </SettingRow>

          <SettingRow icon={MapPin} title={tx("Preferred areas")} subtitle={tx("Used for nearby recommendations and pickup defaults")}>
            <Input
              value={preferredAreas}
              className="h-11 rounded-2xl"
              onChange={(e) =>
                updatePreferences({
                  areas: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
              placeholder={tx("Causeway Bay, Central")}
            />
          </SettingRow>

          <SettingRow icon={UtensilsCrossed} title={tx("Favorite cuisines")} subtitle={tx("Helps AI rank the right restaurants first")}>
            {renderChoicePills(cuisineOptions, preferences.cuisines, (value) =>
              updatePreferences({ cuisines: toggleListValue(preferences.cuisines, value) })
            )}
          </SettingRow>

          <SettingRow icon={Sparkles} title={tx("Dining for")} subtitle={tx("Used for portion and recommendation style")}>
            {renderChoicePills(diningForOptions, preferences.diningFor, (value) =>
              updatePreferences({ diningFor: value as (typeof diningForOptions)[number] })
            )}
          </SettingRow>

          <SettingRow icon={Sparkles} title={tx("Budget")} subtitle={tx("Keeps recommendations in the right spend range")}>
            {renderChoicePills(budgetOptions, preferences.budgetRange, (value) =>
              updatePreferences({ budgetRange: value })
            )}
          </SettingRow>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="p-4">
          <SettingRow icon={HeartPulse} title={tx("Taste & health")} subtitle={tx("Keep recommendations safer and closer to your needs")}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{tx("Spice preference")}</p>
                {renderChoicePills(spiceOptions, preferences.spicePreference, (value) =>
                  updatePreferences({ spicePreference: value as (typeof spiceOptions)[number] })
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{tx("Dietary restrictions")}</p>
                {renderChoicePills(dietaryOptions, preferences.dietaryRestrictions, (value) =>
                  updatePreferences({
                    dietaryRestrictions: toggleListValue(preferences.dietaryRestrictions, value),
                  })
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">{tx("Medical / allergy notes")}</p>
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
            </div>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
