"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewConsensusBar } from "@/components/review-consensus-bar";
import { StarRating } from "@/components/star-rating";
import { useI18n } from "@/lib/i18n";
import { type Review } from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/utils";

type ReviewCardProps = {
  review: Review;
  headerAction?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function ReviewCard({ review, headerAction, footer, className }: ReviewCardProps) {
  const { tx } = useI18n();
  const avgRating = Math.round((review.ratings.food + review.ratings.service + review.ratings.atmosphere) / 3);

  return (
    <Card className={cn("border-border/80", className)}>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/user/${review.userId}`} className="flex items-center gap-2">
            {review.userAvatar ? (
              <Image src={review.userAvatar} alt={review.userName} width={28} height={28} className="rounded-full" />
            ) : null}
            <div>
              <p className="text-sm font-medium text-foreground">{review.userName}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[11px]">{tx("信譽")} {review.userReputationScore}</Badge>
            {headerAction}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {review.verifiedVisit ? <Badge className="text-[11px]">{tx("已驗證到訪")}</Badge> : null}
          <Badge variant="outline" className="text-[11px]">{tx(review.verificationMethod === "AUTO" ? "自動驗證" : "QR 驗證")}</Badge>
          {review.txHash ? <Badge variant="outline" className="text-[11px]">{tx("交易已驗證")}</Badge> : null}
          <Badge variant="secondary" className="text-[11px]">{tx("幫助決策")} {review.helpedDecisions}</Badge>
          <Badge variant="secondary" className="text-[11px]">{tx("AI 引用")} {review.aiCitations}</Badge>
        </div>

        <div className="space-y-2">
          <StarRating value={avgRating} readOnly size="sm" />
          <p className="text-sm text-foreground/90">{review.text}</p>
          <ReviewConsensusBar
            agreeCount={review.agreeCount}
            disagreeCount={review.disagreeCount}
            label={tx("到訪過同一餐廳嘅客人對呢段評論嘅共識")}
          />
          <div className="flex flex-wrap gap-1">
            {review.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
            ))}
          </div>
        </div>

        {review.photos.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {review.photos.map((photo, idx) => (
              <div key={`${review.id}-${idx}`} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md">
                <Image src={photo} alt={`${review.userName} ${tx("相片")} ${idx + 1}`} fill sizes="96px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        {footer ? <div className="pt-1">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}
