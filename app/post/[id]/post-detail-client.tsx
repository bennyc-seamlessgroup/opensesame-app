"use client";

import Link from "next/link";
import { ReviewPostCard } from "@/components/review-post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { reviews as mockReviews } from "@/lib/mock-data";

export function PostDetailClient({ id }: { id: string }) {
  const { tx } = useI18n();
  const { reviews } = useAppState();
  const merged = [...reviews, ...mockReviews];
  const review = merged.find((r) => r.id === id);

  if (!review) {
    return (
      <Card className="border-border/80">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-medium text-foreground">{tx("搵唔到呢個內容。")}</p>
          <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
            <Link href="/explore">{tx("返 Explore")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <ReviewPostCard review={review} showVoteActions={false} showReviewMeta={false} />;
}
