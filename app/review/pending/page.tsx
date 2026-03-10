"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { cn, formatDateTime, formatHKD } from "@/lib/utils";

export default function PendingResponsesPage() {
  const { tx } = useI18n();
  const { pendingVoteTasks, bookings, orders, reviews, respondPendingVote } = useAppState();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const pending = useMemo(
    () =>
      (pendingVoteTasks || [])
        .filter((task) => task.status === "PENDING")
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [pendingVoteTasks]
  );

  const resolveContext = (task: (typeof pending)[number]) => {
    const restaurant = restaurants.find((r) => r.id === task.restaurantId);
    const review = reviews.find((rv) => rv.id === task.reviewId);
    const booking = task.contextType === "BOOKING" ? bookings.find((b) => b.id === task.contextId) : null;
    const order = task.contextType === "TAKEAWAY" ? orders.find((o) => o.id === task.contextId) : null;
    return { restaurant, review, booking, order };
  };

  return (
    <div className="space-y-4 pb-24">
      <SectionHeader title="Pending Responses" subtitle={pending.length ? `You have ${pending.length} review(s) to respond` : "No pending votes"} />

      {pending.length === 0 ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="p-4 text-sm text-muted-foreground">
            {tx("暫時冇待回覆投票。完成已驗證訂單／到訪後，會喺呢度逐一回應同意／不同意。")}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {pending.map((task) => {
          const { restaurant, review, booking, order } = resolveContext(task);
          if (!restaurant || !review) return null;

          const expanded = Boolean(expandedIds[task.id]);
          const rawText = review.text.trim();
          const clipped = rawText.length > 220 ? rawText.slice(0, 220).trimEnd() + "…" : rawText;

          return (
            <Card key={task.id} className={cn("border-border/80")}>
              <CardContent className="space-y-3 p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border/70">
                    <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">{restaurant.name}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {task.contextType === "TAKEAWAY" ? tx("外賣") : tx("堂食")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tx(restaurant.area)} • {restaurant.distanceKm.toFixed(1)}km
                    </p>
                    {booking ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(booking.datetime)} • {tx("Party")} {booking.partySize}
                      </p>
                    ) : null}
                    {order ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.items.length} {tx("item(s)")} • {formatHKD(order.subtotal)}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="inline-flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{review.userReputationScore}</span>
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{tx("Agree")} {review.agreeCount}</Badge>
                    <Badge variant="outline" className="text-[10px]">{tx("Disagree")} {review.disagreeCount}</Badge>
                    <Badge variant="secondary" className="text-[10px]">+{task.rewardForVote} $OSM</Badge>
                  </div>

                  <p className="mt-2 text-sm text-foreground/90">{expanded ? rawText : clipped}</p>
                  {rawText.length > 220 ? (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto px-0 text-xs text-muted-foreground"
                      onClick={() => setExpandedIds((prev) => ({ ...prev, [task.id]: !expanded }))}
                    >
                      {expanded ? tx("收起") : tx("View more")}
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="gap-2 rounded-lg"
                    onClick={() => {
                      respondPendingVote(task.id, "AGREE");
                      toast({ title: tx("已回應：同意"), description: `${tx("獲得")} +${task.rewardForVote} $OSM` });
                    }}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {tx("同意")}
                  </Button>
                  <Button
                    variant="secondary"
                    className="gap-2 rounded-lg"
                    onClick={() => {
                      respondPendingVote(task.id, "DISAGREE");
                      toast({ title: tx("已回應：不同意"), description: `${tx("獲得")} +${task.rewardForVote} $OSM` });
                    }}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {tx("不同意")}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{tx("你是否同意剛才推薦的評論？")}</span>
                  <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2">
                    <Link href="/ai">{tx("Back")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
