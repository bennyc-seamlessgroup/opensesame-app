"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/section-header";
import { user } from "@/lib/mock-data";
import { useAppState, type AppLocale } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

export default function SettingsPage() {
  const { locale, setLocale } = useAppState();
  const { t } = useI18n();
  const [areas, setAreas] = useState(user.preferences.areas.join(", "));
  const [language, setLanguage] = useState<AppLocale>(locale);
  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  return (
    <div className="space-y-4">
      <SectionHeader title={t("settings")} subtitle={t("preferences_security")} />

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium text-foreground">{t("dining_preferences")}</p>
          <div className="space-y-1">
            <Label htmlFor="areas">{t("preferred_areas")}</Label>
            <Input id="areas" value={areas} onChange={(e) => setAreas(e.target.value)} />
          </div>
          <Button variant="secondary" className="rounded-lg">{t("save_preferences")}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium text-foreground">{t("security")}</p>
          <p className="text-sm text-muted-foreground">{t("wallet_recovery_placeholder")}</p>
          <Button variant="secondary" className="rounded-lg">{t("manage_recovery")}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm font-medium text-foreground">{t("language")}</p>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLocale)}
          >
            <option value="en">{t("english")}</option>
            <option value="zh-HK">{t("traditional_chinese")}</option>
          </select>
          <Button variant="secondary" className="rounded-lg" onClick={() => setLocale(language)}>
            {t("apply")}
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full rounded-lg">{t("logout")}</Button>
    </div>
  );
}
