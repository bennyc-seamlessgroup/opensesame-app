"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleMinus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReviewConsensusBar } from "@/components/review-consensus-bar";
import { StarRating } from "@/components/star-rating";
import { RestaurantLocationButton } from "@/components/restaurant-location-button";
import { RestaurantMenuButton } from "@/components/restaurant-menu-button";
import { useI18n } from "@/lib/i18n";
import { type FoodIntent, type Restaurant, type Review } from "@/lib/mock-data";
import { formatDateTime, formatPerPersonRange } from "@/lib/utils";

const DEMO_IMG_VERSION = "20260225b";

const withVersion = (src: string) => {
  if (!src.startsWith("/images/")) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}v=${DEMO_IMG_VERSION}`;
};

type AiFoodSuggestionCardProps = {
  intent: FoodIntent;
  restaurant: Restaurant;
  review: Review;
  serviceMode: "book" | "takeaway";
  onDislike?: (intent: FoodIntent) => void;
};

export function AiFoodSuggestionCard({
  intent,
  restaurant,
  review,
  serviceMode,
  onDislike,
}: AiFoodSuggestionCardProps) {
  const { t, tx } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const avgRating = Math.round((review.ratings.food + review.ratings.service + review.ratings.atmosphere) / 3);
  const hasLongText = review.text.trim().length > 180;
  const collapsedText = useMemo(() => {
    const raw = review.text.trim();
    if (!hasLongText) return raw;
    return raw.slice(0, 180).trimEnd() + "…";
  }, [hasLongText, review.text]);

  return (
    <Card className="overflow-hidden border-border/80">
      <div className="relative">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={withVersion(serviceMode === "book" ? restaurant.coverImage : intent.coverImage)}
            alt={serviceMode === "book" ? restaurant.name : tx(intent.title)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </AspectRatio>

        {onDislike ? (
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 bg-background/80 backdrop-blur"
              aria-label={t("not_interested")}
              onClick={() => onDislike(intent)}
            >
              <CircleMinus className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <RestaurantMenuButton restaurant={restaurant} className="bg-background/80 backdrop-blur hover:bg-background/90" />
          <RestaurantLocationButton
            restaurant={restaurant}
            variant="secondary"
            size="sm"
            label="Map"
            className="bg-background/80 backdrop-blur hover:bg-background/90"
          />
        </div>
      </div>

      <CardContent className="space-y-3 p-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-foreground">
                {serviceMode === "book" ? restaurant.name : tx(intent.title)}
              </h3>
              <p className="text-xs text-muted-foreground">
                {serviceMode === "book"
                  ? `${tx(restaurant.area)} • ${t("distance_away")} ${restaurant.distanceKm.toFixed(1)}km • ${tx(intent.title)}`
                  : `${restaurant.name} • ${tx(restaurant.area)} • ${t("distance_away")} ${restaurant.distanceKm.toFixed(1)}km`}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {serviceMode === "takeaway" ? (
                <Badge variant="outline" className="text-[11px]">
                  HK${intent.fixedPrice}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[11px]">
                  {t("avg_spend")} {formatPerPersonRange(restaurant.avgSpend)}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[11px]">
                {t("reward")} {restaurant.rewardYieldPct}% $OSM
              </Badge>
            </div>
          </div>
        </div>

        <Button asChild size="sm" className="h-8 w-full rounded-lg">
          <Link href={`/restaurant/${restaurant.id}?mode=${serviceMode}`}>
            {serviceMode === "takeaway" ? tx("外賣落單") : tx("訂枱")}
          </Link>
        </Button>

        <div className="border-t border-border/70 pt-3">
          <div className="space-y-2">
            <Link href={`/user/${review.userId}`} className="flex items-center gap-2">
              {review.userAvatar ? (
                <Image
                  src={withVersion(review.userAvatar)}
                  alt={review.userName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : null}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">{review.userName}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{review.userReputationScore}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
              </div>
            </Link>

            <StarRating value={avgRating} readOnly size="sm" />
            <div className="space-y-1.5">
              <p className="text-sm text-foreground/90">{expanded ? review.text : collapsedText}</p>
              {hasLongText ? (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-muted-foreground"
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  {expanded ? tx("收起") : "View more"}
                </Button>
              ) : null}
            </div>

            <ReviewConsensusBar
              agreeCount={review.agreeCount}
              disagreeCount={review.disagreeCount}
              label={tx("食過同款嘅客人對呢段評論嘅共識")}
            />

            {review.photos.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {review.photos.map((photo, idx) => (
                  <button
                    key={`${review.id}-${idx}`}
                    type="button"
                    className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md border border-border/70"
                    onClick={() => setPreviewPhoto(photo)}
                    aria-label={`${tx("查看相片")} ${idx + 1}`}
                  >
                    <Image
                      src={withVersion(photo)}
                      alt={`${review.userName} ${tx("查看相片")} ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>

      <Dialog open={Boolean(previewPhoto)} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-2 sm:p-3">
          {previewPhoto ? (
            <div className="relative w-full overflow-hidden rounded-md">
              <AspectRatio ratio={16 / 10}>
                <Image
                  src={withVersion(previewPhoto)}
                  alt="Review photo preview"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 900px"
                />
              </AspectRatio>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
