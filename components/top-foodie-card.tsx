"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TopFoodieCardProps = {
  userId: string;
  username: string;
  avatar?: string;
  credibilityScore: number;
  followersCount: number;
  coverImage: string;
  className?: string;
};

export function TopFoodieCard({
  userId,
  username,
  avatar,
  credibilityScore,
  followersCount,
  coverImage,
  className,
}: TopFoodieCardProps) {
  return (
    <Card className={cn("w-[260px] shrink-0 overflow-hidden border-border/80", className)}>
      <Link href={`/user/${userId}`} className="block">
        <div className="relative h-[136px] w-full bg-muted">
          <Image src={coverImage} alt={username} fill className="object-cover" sizes="260px" />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <CardContent className="relative space-y-2 p-3 pt-3">
          <div className="-mt-9 flex items-end justify-between gap-2">
            <div className="flex min-w-0 items-end gap-2">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/70 bg-muted">
                {avatar ? <Image src={avatar} alt={username} fill className="object-cover" sizes="48px" /> : null}
              </div>
              <div className="min-w-0 pb-0.5">
                <p className="truncate text-sm font-semibold text-foreground">{username}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                  <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{credibilityScore}</span>
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {followersCount.toLocaleString()} followers
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

