"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaymentPill, VerificationPill, OrderStatusPill } from "@/components/status-pills";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { restaurants } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { bookings, reviews, updateBooking, cancelBooking, completeBooking } = useAppState();

  const booking = bookings.find((item) => item.id === params.id);
  const restaurant = booking ? restaurants.find((item) => item.id === booking.restaurantId) : null;

  const [editOpen, setEditOpen] = useState(false);
  const [editDatetime, setEditDatetime] = useState("");
  const [editPartySize, setEditPartySize] = useState(2);
  const [editNotes, setEditNotes] = useState("");

  const alreadyReviewed = useMemo(() => Boolean(booking && reviews.some((review) => review.relatedType === "BOOKING" && review.relatedId === booking.id)), [booking, reviews]);

  if (!booking || !restaurant) return <p className="text-sm text-muted-foreground">Booking not found.</p>;

  const bookingTime = +new Date(booking.datetime);
  const canModify = booking.status === "CONFIRMED" && Number.isFinite(bookingTime) && bookingTime - Date.now() > 30 * 60 * 1000;
  const canPay = booking.paymentStatus === "UNPAID" && booking.status !== "CANCELLED";
  const canVerify = booking.verificationStatus === "QR_REQUIRED" && booking.status !== "CANCELLED";
  const canComplete =
    booking.status === "CONFIRMED" &&
    booking.paymentStatus === "PAID_OSM" &&
    (booking.verificationStatus === "VERIFIED" || booking.verificationStatus === "AUTO");
  const canWriteReview = booking.status === "COMPLETED" && booking.verificationStatus === "VERIFIED" && !alreadyReviewed;

  return (
    <div className="space-y-4 pb-24">
      <SectionHeader title="Booking" subtitle="Reservation details & actions" />

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-3">
          <div className="flex gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border/70">
              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground">{restaurant.area}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <OrderStatusPill status={booking.status} />
                <PaymentPill status={booking.paymentStatus} />
                <VerificationPill status={booking.verificationStatus} />
              </div>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">Time</p>
            <p className="text-foreground">{formatDateTime(booking.datetime)}</p>
            <p className="text-muted-foreground">Party size</p>
            <p className="text-foreground">{booking.partySize}</p>
            {booking.notes ? (
              <>
                <p className="text-muted-foreground">Notes</p>
                <p className="text-foreground">{booking.notes}</p>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-lg">
              <Link href={`/restaurant/${restaurant.id}?mode=book`}>Restaurant</Link>
            </Button>

            {canPay ? (
              <Button asChild size="sm" className="rounded-lg">
                <Link href={`/pay?context=booking&bookingId=${booking.id}`}>Pay</Link>
              </Button>
            ) : null}

            {canVerify ? (
              <Button asChild size="sm" variant="secondary" className="rounded-lg">
                <Link href={`/pay?intent=verify&context=booking&bookingId=${booking.id}`}>Verify</Link>
              </Button>
            ) : null}

            {canComplete ? (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-lg"
                onClick={() => {
                  completeBooking(booking.id);
                  router.refresh();
                }}
              >
                Complete visit
              </Button>
            ) : null}

            {canWriteReview ? (
              <Button asChild size="sm" variant="secondary" className="rounded-lg">
                <Link href={`/review/new?restaurantId=${booking.restaurantId}&relatedType=BOOKING&relatedId=${booking.id}`}>Write review</Link>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={!canModify}
              onClick={() => {
                setEditDatetime(toDateTimeLocalValue(booking.datetime));
                setEditPartySize(booking.partySize);
                setEditNotes(booking.notes || "");
                setEditOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              disabled={!canModify}
              onClick={() => cancelBooking(booking.id)}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {canModify ? "You can edit/cancel up to 30 minutes before reservation time." : "Edit/cancel window has passed."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardContent className="space-y-2 p-3">
          <SectionHeader title="Restaurant note" />
          <p className="text-sm text-muted-foreground">{restaurant.bookingNotes}</p>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="edit-datetime">Date / time</Label>
              <Input id="edit-datetime" type="datetime-local" value={editDatetime} onChange={(e) => setEditDatetime(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-party">Party size</Label>
              <Input id="edit-party" type="number" min={1} value={editPartySize} onChange={(e) => setEditPartySize(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                updateBooking(booking.id, {
                  datetime: new Date(editDatetime).toISOString(),
                  partySize: editPartySize,
                  notes: editNotes.trim() || undefined,
                });
                setEditOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

