"use client";

import Link from "next/link";
import { Bell, ChevronRight, Globe, Info, LogOut, Shield, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { useAppState, type AppLocale } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

function SettingsLinkRow({
  href,
  icon: Icon,
  title,
  detail,
}: {
  href: string;
  icon: typeof Globe;
  title: string;
  detail?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-1 py-3 transition hover:bg-secondary/60 active:scale-[0.995]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function SettingsPage() {
  const { t, tx } = useI18n();
  const { locale, setLocale } = useAppState();

  return (
    <div className="space-y-4 pb-6">
      <SectionHeader title={t("settings")} subtitle={tx("Manage language, preferences, privacy, and app info")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">{t("language")}</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "en", label: "English" },
                { value: "zh-HK", label: "繁中" },
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
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="p-4">
          <SettingsLinkRow href="/settings/preferences" icon={SlidersHorizontal} title={tx("Personal preferences")} detail={tx("Taste, health, budget, and dining style")} />
          <SettingsLinkRow href="/settings/messages" icon={Bell} title={tx("Message settings")} />
          <SettingsLinkRow href="/settings/privacy" icon={Shield} title={tx("Privacy settings")} />
          <SettingsLinkRow href="/settings/cache" icon={Trash2} title={tx("Memory cache")} detail="7.94 MB" />
          <SettingsLinkRow href="/settings/about" icon={Info} title={tx("About OEats")} />
        </CardContent>
      </Card>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full rounded-2xl justify-center gap-2"
        onClick={() => {}}
      >
        <LogOut className="h-4 w-4" />
        {t("logout")}
      </Button>
    </div>
  );
}
