"use client";

import { Shield } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";

function ToggleRow({ title, subtitle, defaultChecked = false }: { title: string; subtitle?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/70 py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export default function SettingsPrivacyPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Privacy settings")} subtitle={tx("Control what others can see and how the app uses your data")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{tx("Privacy")}</p>
          </div>
          <ToggleRow title={tx("Private profile")} subtitle={tx("Hide your profile from public discovery")} />
          <ToggleRow title={tx("Show review activity")} subtitle={tx("Let others see your public review updates")} defaultChecked />
          <ToggleRow title={tx("Allow location-based suggestions")} subtitle={tx("Use your nearby location to rank recommendations")} defaultChecked />
        </CardContent>
      </Card>
    </div>
  );
}
