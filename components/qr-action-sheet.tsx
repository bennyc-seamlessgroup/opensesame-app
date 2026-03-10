"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type QrPayload, restaurants } from "@/lib/mock-data";

type QrActionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: QrPayload | null;
  rewardEstimate?: number;
  onConfirm: () => void;
};

export function QrActionSheet({ open, onOpenChange, payload, rewardEstimate, onConfirm }: QrActionSheetProps) {
  if (!payload) return null;

  const restaurant = restaurants.find((item) => item.id === payload.restaurantId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{payload.type === "PAY" ? "Confirm Payment" : "Confirm Verification"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Restaurant: </span>{restaurant?.name || payload.restaurantId}</p>
          <p><span className="text-muted-foreground">Action: </span>{payload.type}</p>
          {payload.amount ? <p><span className="text-muted-foreground">Amount: </span>{payload.amount} $OSM</p> : null}
          {payload.orderId ? <p><span className="text-muted-foreground">Order: </span>{payload.orderId}</p> : null}
          {payload.bookingId ? <p><span className="text-muted-foreground">Booking: </span>{payload.bookingId}</p> : null}
          <p><span className="text-muted-foreground">Reward estimate: </span>{rewardEstimate || 0} $OSM</p>
        </div>

        <DialogFooter>
          <Button onClick={onConfirm}>{payload.type === "PAY" ? "Confirm Payment" : "Confirm Verification"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
