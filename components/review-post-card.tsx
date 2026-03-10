"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Share2, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { ReviewConsensusBar } from "@/components/review-consensus-bar";
import { StarRating } from "@/components/star-rating";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants, user, type Review, type Restaurant } from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/utils";

type ReviewPostCardProps = {
  review: Review;
  className?: string;
  compact?: boolean;
  showVoteActions?: boolean;
  showReviewMeta?: boolean;
};

const getRestaurant = (restaurantId: string): Restaurant | undefined => restaurants.find((r) => r.id === restaurantId);

export function ReviewPostCard({ review, className, compact, showVoteActions = true, showReviewMeta = true }: ReviewPostCardProps) {
  const { tx } = useI18n();
  const { social, toggleSavedReview, voteOnReview, hasCompletedTransaction, getUnusedVoteContexts } = useAppState();
  const restaurant = getRestaurant(review.restaurantId);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [voteOpen, setVoteOpen] = useState(false);
  const [pendingVote, setPendingVote] = useState<"AGREE" | "DISAGREE">("AGREE");
  const [selectedContextKey, setSelectedContextKey] = useState<string>("");

  const agreeCountSafe = typeof review.agreeCount === "number" && Number.isFinite(review.agreeCount) ? review.agreeCount : 0;
  const disagreeCountSafe = typeof review.disagreeCount === "number" && Number.isFinite(review.disagreeCount) ? review.disagreeCount : 0;

  const avgRating = Math.round((review.ratings.food + review.ratings.service + review.ratings.atmosphere) / 3);
  const userVote = useMemo(() => {
    const entries = Object.values(social.transactionVotes || {});
    const found = entries.find((entry) => entry.reviewId === review.id);
    return found?.vote;
  }, [review.id, social.transactionVotes]);
  const isSaved = social.savedReviewIds.includes(review.id);
  const canVote = hasCompletedTransaction(review.restaurantId);
  const isSelf = review.userId === user.id;
  const unusedContexts = useMemo(() => getUnusedVoteContexts(review.restaurantId), [getUnusedVoteContexts, review.restaurantId]);
  const canStartVote = !isSelf && !userVote && unusedContexts.length > 0;

  const consensusScore = useMemo(() => {
    const total = Math.max(0, agreeCountSafe) + Math.max(0, disagreeCountSafe);
    if (total <= 0) return 0;
    return Math.round((agreeCountSafe / total) * 100);
  }, [agreeCountSafe, disagreeCountSafe]);

  const openVoteDialog = () => {
    if (isSelf) {
      toast({ title: tx("你唔可以投票比自己。") });
      return;
    }
    if (!canVote) {
      toast({
        title: tx("完成交易後先可以投票"),
        description: tx("完成該餐廳訂枱或外賣後，才可以對評論同意／不同意。"),
        action: restaurant ? (
          <ToastAction altText={tx("去落單")} asChild>
            <Link href={`/restaurant/${restaurant.id}?mode=book`}>{tx("去餐廳")}</Link>
          </ToastAction>
        ) : undefined,
      });
      return;
    }
    if (userVote) {
      toast({ title: tx("你已經投過票。") });
      return;
    }
    if (!unusedContexts.length) {
      toast({ title: tx("你暫時冇可用嘅交易去投票。") });
      return;
    }
    const first = unusedContexts[0];
    setSelectedContextKey(first ? `${first.relatedType}:${first.relatedId}` : "");
    setVoteOpen(true);
  };

  const confirmVote = () => {
    const ctx = unusedContexts.find((item) => `${item.relatedType}:${item.relatedId}` === selectedContextKey);
    if (!ctx) {
      toast({ title: tx("請選擇一筆交易") });
      return;
    }
    const result = voteOnReview({
      reviewId: review.id,
      restaurantId: review.restaurantId,
      relatedType: ctx.relatedType,
      relatedId: ctx.relatedId,
      vote: pendingVote,
    });
    toast({ title: result.ok ? tx("已投票") : tx("未能投票"), description: tx(result.message) });
    if (result.ok) setVoteOpen(false);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/user/${review.userId}` : "";
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: tx("已複製連結"), description: tx("你可以貼到訊息分享。") });
    } catch {
      toast({ title: tx("未能複製連結"), description: tx("你的瀏覽器可能未允許剪貼簿。") });
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/80", className)}>
      <CardContent className={cn("space-y-3 p-3", compact && "space-y-2")}>
        <div className="flex items-start justify-between gap-3">
          <Link href={`/user/${review.userId}`} className="flex min-w-0 items-center gap-2">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-border/70 bg-muted">
              {review.userAvatar ? (
                <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" sizes="36px" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-foreground">{review.userName}</p>
                <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{review.userReputationScore}</span>
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{formatDateTime(review.createdAt)}</p>
            </div>
          </Link>

          {showReviewMeta ? (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge variant="outline" className="text-[10px]">
                {tx("共識")} {consensusScore}%
              </Badge>
              {review.verifiedVisit ? (
                <Badge variant="secondary" className="text-[10px]">
                  {tx("已驗證到訪")}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={restaurant ? `/restaurant/${restaurant.id}` : "/explore"} className="text-sm font-semibold text-foreground hover:underline">
                {restaurant?.name ?? "Restaurant"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {restaurant ? `${tx(restaurant.area)} • ${restaurant.address}` : "—"}
              </p>
            </div>
            <StarRating value={avgRating} readOnly size="sm" />
          </div>
        </div>

        {review.photos.length ? (
          <button
            type="button"
            className="relative w-full overflow-hidden rounded-lg border border-border/70"
            onClick={() => setPhotoPreview(review.photos[0])}
            aria-label={tx("查看相片")}
          >
            <AspectRatio ratio={16 / 10}>
              <Image src={review.photos[0]} alt="Review photo" fill className="object-cover" sizes="(max-width: 768px) 100vw, 768px" />
            </AspectRatio>
          </button>
        ) : null}

        <p className={cn("text-sm text-foreground/90", compact && "text-[13px]")}>{review.text}</p>

        {showReviewMeta ? <ReviewConsensusBar agreeCount={agreeCountSafe} disagreeCount={disagreeCountSafe} /> : null}

        <div className="flex flex-wrap items-center gap-2">
          {showVoteActions ? (
            userVote ? (
              <Badge variant="secondary" className="h-8 rounded-full px-3 text-xs">
                {tx("你已投票：")}{userVote === "AGREE" ? tx("同意") : tx("不同意")}
              </Badge>
            ) : canStartVote ? (
              <Button type="button" size="sm" variant="secondary" className="h-8 gap-1.5 rounded-full px-3 text-xs" onClick={openVoteDialog}>
                <ThumbsUp className="h-4 w-4" />
                {tx("投票")}
              </Button>
            ) : !isSelf ? (
              <p className="text-xs text-muted-foreground">
                {canVote ? tx("此餐廳投票次數已用完") : tx("完成該餐廳交易後才可投票")}
              </p>
            ) : null
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 rounded-full px-3 text-xs"
            onClick={() => toggleSavedReview(review.id)}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {isSaved ? tx("已保存") : tx("保存")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 rounded-full px-3 text-xs"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            {tx("分享")}
          </Button>
        </div>

        {showVoteActions && !canVote && !isSelf ? (
          <p className="text-[11px] text-muted-foreground">
            {tx("完成該餐廳交易後，先可以投票（同意／不同意）。")}
          </p>
        ) : null}
      </CardContent>

      <Dialog open={Boolean(photoPreview)} onOpenChange={(open) => !open && setPhotoPreview(null)}>
        <DialogContent className="max-w-3xl p-2 sm:p-3">
          <DialogHeader>
            <DialogTitle className="sr-only">Review photo preview</DialogTitle>
          </DialogHeader>
          {photoPreview ? (
            <div className="relative w-full overflow-hidden rounded-md">
              <AspectRatio ratio={16 / 10}>
                <Image src={photoPreview} alt="Review photo preview" fill className="object-contain" sizes="(max-width: 1024px) 100vw, 900px" />
              </AspectRatio>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={voteOpen}
        onOpenChange={(open) => {
          setVoteOpen(open);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{tx("選擇用邊筆交易投票")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={pendingVote === "AGREE" ? "secondary" : "outline"}
                className="h-8 gap-1.5 rounded-full px-3 text-xs"
                onClick={() => setPendingVote("AGREE")}
              >
                <ThumbsUp className="h-4 w-4" />
                {tx("同意")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={pendingVote === "DISAGREE" ? "secondary" : "outline"}
                className="h-8 gap-1.5 rounded-full px-3 text-xs"
                onClick={() => setPendingVote("DISAGREE")}
              >
                <ThumbsDown className="h-4 w-4" />
                {tx("不同意")}
              </Button>
              <Badge variant="secondary" className="h-8 rounded-full px-3 text-xs">
                {tx("每筆交易只可投票一次")}
              </Badge>
            </div>

            <RadioGroup value={selectedContextKey} onValueChange={setSelectedContextKey} className="space-y-2">
              {unusedContexts.map((ctx) => {
                const key = `${ctx.relatedType}:${ctx.relatedId}`;
                return (
                  <label
                    key={key}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border border-border/80 px-3 py-2 text-sm hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={key} id={key} />
                      <span className="text-foreground">{tx(ctx.label)}</span>
                    </div>
                    {selectedContextKey === key ? <Check className="h-4 w-4 text-muted-foreground" /> : null}
                  </label>
                );
              })}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" className="rounded-lg" onClick={() => setVoteOpen(false)}>
              {tx("取消")}
            </Button>
            <Button type="button" className="rounded-lg" onClick={confirmVote} disabled={!selectedContextKey}>
              {tx("確認投票")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
