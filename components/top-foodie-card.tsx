"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TopFoodieCardProps = {
  userId: string;
  username: string;
  avatar?: string;
  credibilityScore: number;
  followersCount: number;
  className?: string;
};

export function TopFoodieCard({
  userId,
  username,
  avatar,
  credibilityScore,
  followersCount,
  className,
}: TopFoodieCardProps) {
  const { tx } = useI18n();

  return (
    <Card className={cn("overflow-hidden border-border/80 bg-card shadow-sm", className)}>
      <Link href={`/user/${userId}`} className="block h-full">
        <CardContent className="flex h-full flex-col justify-between gap-3 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted">
              {avatar ? <Image src={avatar} alt={username} fill className="object-cover" sizes="48px" /> : null}
            </div>
            <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{credibilityScore}</span>
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{username}</p>
            <p className="text-[11px] text-muted-foreground">{followersCount.toLocaleString()} {tx("followers")}</p>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
