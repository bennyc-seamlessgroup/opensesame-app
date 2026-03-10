"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { SectionHeader } from "@/components/section-header";
import { useAppState } from "@/lib/app-state";
import { restaurants, reviewTags } from "@/lib/mock-data";

type ReviewNewClientProps = {
  presetRestaurantId?: string;
  presetRelatedType?: string;
  presetRelatedId?: string;
};

export function ReviewNewClient({ presetRestaurantId, presetRelatedType, presetRelatedId }: ReviewNewClientProps) {
  const router = useRouter();
  const { bookings, orders, reviews, submitReviewWithReward } = useAppState();

  const existingRelated = new Set(reviews.map((review) => review.relatedId));
  const relatedOptions = [
    ...bookings
      .filter((booking) => booking.status === "COMPLETED" && booking.verificationStatus === "VERIFIED" && !existingRelated.has(booking.id))
      .map((booking) => ({ label: `Booking ${booking.id}`, relatedType: "BOOKING" as const, relatedId: booking.id, restaurantId: booking.restaurantId })),
    ...orders
      .filter((order) => order.status === "PICKED_UP" && order.verificationStatus === "VERIFIED" && !existingRelated.has(order.id))
      .map((order) => ({ label: `Takeaway ${order.id}`, relatedType: "TAKEAWAY" as const, relatedId: order.id, restaurantId: order.restaurantId })),
  ];

  const defaultOption = relatedOptions.find((option) => option.relatedId === presetRelatedId) || relatedOptions[0];

  const [restaurantId, setRestaurantId] = useState(presetRestaurantId || defaultOption?.restaurantId || restaurants[0]?.id || "");
  const [relatedType, setRelatedType] = useState<"BOOKING" | "TAKEAWAY" | "VISIT">(
    (presetRelatedType as "BOOKING" | "TAKEAWAY" | "VISIT") || defaultOption?.relatedType || "VISIT"
  );
  const [relatedId, setRelatedId] = useState(presetRelatedId || defaultOption?.relatedId || `visit-${Date.now()}`);

  const [ratingFood, setRatingFood] = useState(4);
  const [ratingService, setRatingService] = useState(4);
  const [ratingAtmosphere, setRatingAtmosphere] = useState(4);
  const [text, setText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Value"]);
  const [filesCount, setFilesCount] = useState(0);
  const [openSuccess, setOpenSuccess] = useState(false);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === restaurantId),
    [restaurantId]
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  };

  return (
    <div className="space-y-4 pb-8">
      <SectionHeader title="Submit Review" subtitle="Verified review reward credit on submit" />

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1">
            <Label htmlFor="restaurant">Restaurant</Label>
            <select
              id="restaurant"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Selected: {selectedRestaurant?.name}</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="related">Linked booking/order</Label>
            <select
              id="related"
              value={`${relatedType}:${relatedId}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(":");
                const option = relatedOptions.find((item) => item.relatedType === type && item.relatedId === id);
                setRelatedType(type as "BOOKING" | "TAKEAWAY" | "VISIT");
                setRelatedId(id);
                if (option?.restaurantId) setRestaurantId(option.restaurantId);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {relatedOptions.length === 0 ? (
                <option value={`VISIT:${relatedId}`}>Manual Visit</option>
              ) : (
                relatedOptions.map((option) => (
                  <option key={option.relatedId} value={`${option.relatedType}:${option.relatedId}`}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="photos">Photos (mock upload)</Label>
            <Input
              id="photos"
              type="file"
              multiple
              onChange={(e) => setFilesCount(e.target.files?.length || 0)}
              aria-label="Upload photos"
            />
            <p className="text-xs text-muted-foreground">{filesCount} file(s) selected</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Food</Label>
              <StarRating value={ratingFood} onChange={setRatingFood} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Service</Label>
              <StarRating value={ratingService} onChange={setRatingService} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Atmosphere</Label>
              <StarRating value={ratingAtmosphere} onChange={setRatingAtmosphere} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="review-text">Review</Label>
            <Textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share what made this dining experience reliable"
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {reviewTags.map((tag) => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}>
                  <Badge variant={selectedTags.includes(tag) ? "default" : "secondary"}>{tag}</Badge>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full rounded-xl"
            onClick={() => {
              submitReviewWithReward({
                restaurantId,
                relatedType,
                relatedId,
                ratings: { food: ratingFood, service: ratingService, atmosphere: ratingAtmosphere },
                text: text || "Verified review submitted.",
                tags: selectedTags,
                photos: [],
              });
              setOpenSuccess(true);
            }}
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>

      <Dialog open={openSuccess} onOpenChange={setOpenSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submitted</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Reward Breakdown</p>
            <p className="text-foreground">Base: 5 $OSM</p>
            <p className="text-muted-foreground">Future bonus: AI citation +2</p>
            <p className="text-muted-foreground">Future bonus: 10+ saves +3</p>
          </div>
          <Button
            onClick={() => {
              setOpenSuccess(false);
              router.push("/wallet");
            }}
          >
            View Wallet
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
