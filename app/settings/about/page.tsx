"use client";

import { Info } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function SettingsAboutPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("About OEats")} subtitle={tx("App information and version details")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">OEats</p>
              <p className="text-xs text-muted-foreground">v2.1 Demo</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {tx("OEats helps users discover restaurants, order takeaway, book tables, and manage membership cards in one app experience.")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
