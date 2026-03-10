"use client";

import Link from "next/link";
import { ReviewPostCard } from "@/components/review-post-card";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";

export default function SavedReviewsPage() {
  const { tx } = useI18n();
  const { reviews, social } = useAppState();
  const savedSet = new Set(social.savedReviewIds);
  const savedReviews = reviews.filter((review) => savedSet.has(review.id));

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionHeader title={tx("Saved Reviews")} subtitle={tx("你保存咗嘅評論（demo）")} action={<Link href="/explore" className="text-xs text-muted-foreground hover:underline">{tx("Explore")}</Link>} />
        {savedReviews.length ? (
          <div className="space-y-3">
            {savedReviews.map((review) => (
              <ReviewPostCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card className="border-border/80">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-medium text-foreground">{tx("你未保存任何評論。")}</p>
              <p className="text-xs text-muted-foreground">{tx("去 Explore 先，見到好評論就按「保存」。")}</p>
              <Button asChild size="sm" className="h-8 rounded-lg">
                <Link href="/explore">{tx("去 Explore")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
