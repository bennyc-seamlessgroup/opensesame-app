"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

type ReviewerCardProps = {
  userId: string;
  username: string;
  avatar?: string;
  credibilityScore: number;
  followersCount: number;
  className?: string;
};

export function ReviewerCard({
  userId,
  username,
  avatar,
  credibilityScore,
  followersCount,
  className,
}: ReviewerCardProps) {
  const { social, toggleFollowUser } = useAppState();
  const isFollowing = social.followingUserIds.includes(userId);

  return (
    <Card className={cn("w-[240px] shrink-0 border-border/80", className)}>
      <CardContent className="space-y-3 p-3">
        <Link href={`/user/${userId}`} className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-border/70 bg-muted">
            {avatar ? <Image src={avatar} alt={username} fill className="object-cover" sizes="44px" /> : null}
          </div>
          <div className="min-w-0 flex-1">
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
        </Link>

        <Button
          type="button"
          size="sm"
          variant={isFollowing ? "secondary" : "default"}
          className="h-8 w-full rounded-lg"
          onClick={() => toggleFollowUser(userId)}
          disabled={!userId}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      </CardContent>
    </Card>
  );
}
