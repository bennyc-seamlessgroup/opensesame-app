"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

type ProfileFeatureTileProps = {
  href: string;
  icon: LucideIcon;
  title: string;
};

export function ProfileFeatureTile({ href, icon: Icon, title }: ProfileFeatureTileProps) {
  const { tx } = useI18n();

  return (
    <Link href={href} className="block">
      <Card className="h-full rounded-[24px] border-border/70 bg-card/95 shadow-sm transition hover:border-border hover:shadow-md">
        <CardContent className="flex h-full items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-[15px] font-semibold leading-snug text-foreground">{tx(title)}</p>
          </div>
          <div className="flex shrink-0 items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
