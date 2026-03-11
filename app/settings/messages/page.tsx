"use client";

import { Bell } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";

function ToggleRow({ title, subtitle, defaultChecked = true }: { title: string; subtitle?: string; defaultChecked?: boolean }) {
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

export default function SettingsMessagesPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Message settings")} subtitle={tx("Choose which updates and reminders you want to receive")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{tx("Notifications")}</p>
          </div>
          <ToggleRow title={tx("Booking reminders")} subtitle={tx("Reservation time and deposit reminders")} />
          <ToggleRow title={tx("Order updates")} subtitle={tx("Takeaway preparation and ready-for-pickup updates")} />
          <ToggleRow title={tx("Community activity")} subtitle={tx("Votes, follows, and review-related updates")} defaultChecked={false} />
          <ToggleRow title={tx("Offers and campaigns")} subtitle={tx("Discounts, card drops, and seasonal offers")} defaultChecked={false} />
        </CardContent>
      </Card>
    </div>
  );
}
