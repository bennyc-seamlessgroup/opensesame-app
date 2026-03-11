"use client";

import { HardDriveDownload, Trash2 } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export default function SettingsCachePage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Memory cache")} subtitle={tx("Manage temporary app files stored on this device")} />

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <HardDriveDownload className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{tx("Cached images and menu data")}</p>
              <p className="mt-1 text-xs text-muted-foreground">7.94 MB</p>
            </div>
          </div>

          <Button type="button" variant="outline" className="h-11 w-full rounded-2xl justify-center gap-2" onClick={() => {}}>
            <Trash2 className="h-4 w-4" />
            {tx("Clear cache")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
