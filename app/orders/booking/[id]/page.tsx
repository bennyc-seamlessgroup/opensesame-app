"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CalendarClock, ChevronRight, MapPin, PencilLine } from "lucide-react";
import { PaymentPill, OrderStatusPill } from "@/components/status-pills";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function splitDateTimeLocal(value: string) {
  const [date = "", time = "19:00"] = value.split("T");
  return { date, time };
}

export default function BookingDetailPage() {
  const { tx } = useI18n();
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

  if (!booking || !restaurant) return <p className="text-sm text-muted-foreground">{tx("Booking not found.")}</p>;

  const bookingTime = +new Date(booking.datetime);
  const canModify = booking.status === "CONFIRMED" && Number.isFinite(bookingTime) && bookingTime - Date.now() > 30 * 60 * 1000;
  const canPay = booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED";
  const canComplete = booking.status === "CONFIRMED" && booking.paymentStatus === "PAID_OSM";
  const canWriteReview = booking.status === "COMPLETED" && !alreadyReviewed;

  const helperText = canPay
    ? tx("Pay deposit to secure your table.")
    : booking.status === "CONFIRMED"
      ? tx("Your table is secured. Just arrive on time.")
      : booking.status === "COMPLETED"
        ? tx("Visit completed. You can leave a review anytime.")
        : tx("This booking has been cancelled.");

  return (
    <div className="space-y-4 pb-24">
      <SectionHeader title={tx("Booking")} subtitle={tx("Clear reservation details")} />

      <Card className="overflow-hidden border-border/80">
        <CardContent className="space-y-4 p-4">
          <Link href={`/restaurant/${restaurant.id}?mode=book`} className="block rounded-[20px] border border-border/70 transition hover:bg-secondary/20">
            <div className="flex gap-3 p-3">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border/70">
                <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">{restaurant.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{tx(restaurant.area)}</span>
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <OrderStatusPill status={booking.status} />
                  <PaymentPill status={booking.paymentStatus} />
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-2xl border border-border/80 bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">{helperText}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-border/80 p-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{tx("Time")}</p>
              <p className="mt-1 inline-flex items-center gap-2 font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                {formatDateTime(booking.datetime)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
              <div>
                <p className="text-xs text-muted-foreground">{tx("Party size")}</p>
                <p className="mt-1 font-medium text-foreground">{booking.partySize}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{tx("Deposit")}</p>
                <p className="mt-1 font-medium text-foreground">{booking.paymentStatus === "UNPAID" ? tx("需要訂金") : tx("已支付")}</p>
              </div>
            </div>
            {booking.notes ? (
              <div>
                <p className="text-xs text-muted-foreground">{tx("Notes")}</p>
                <p className="mt-1 text-foreground">{booking.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {canPay ? (
              <Button asChild size="sm" className="rounded-xl">
                <Link href={`/pay?context=booking&bookingId=${booking.id}`}>{tx("Pay deposit")}</Link>
              </Button>
            ) : null}

            {canComplete ? (
              <Button
                size="sm"
                variant="secondary"
                className="rounded-xl"
                onClick={() => {
                  completeBooking(booking.id);
                  router.refresh();
                }}
              >
                {tx("Mark visited")}
              </Button>
            ) : null}

            {canWriteReview ? (
              <Button asChild size="sm" variant="secondary" className="rounded-xl">
                <Link href={`/review/new?restaurantId=${booking.restaurantId}&relatedType=BOOKING&relatedId=${booking.id}`}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  {tx("Write review")}
                </Link>
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={!canModify}
              onClick={() => {
                setEditDatetime(toDateTimeLocalValue(booking.datetime));
                setEditPartySize(booking.partySize);
                setEditNotes(booking.notes || "");
                setEditOpen(true);
              }}
            >
              {tx("Edit")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              disabled={!canModify}
              onClick={() => cancelBooking(booking.id)}
            >
              {tx("Cancel")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {canModify ? tx("You can edit or cancel up to 30 minutes before the reservation time.") : tx("Edit and cancel are no longer available for this booking.")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardContent className="space-y-2 p-4">
          <SectionHeader title={tx("Restaurant note")} />
          <p className="text-sm text-muted-foreground">{restaurant.bookingNotes}</p>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("Edit booking")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-date">{tx("Date")}</Label>
                <Input
                  id="edit-date"
                  type="date"
                  className="w-full min-w-0"
                  value={splitDateTimeLocal(editDatetime).date}
                  onChange={(e) => setEditDatetime(`${e.target.value}T${splitDateTimeLocal(editDatetime).time}`)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-time">{tx("Time")}</Label>
                <Input
                  id="edit-time"
                  type="time"
                  className="w-full min-w-0"
                  value={splitDateTimeLocal(editDatetime).time}
                  onChange={(e) => setEditDatetime(`${splitDateTimeLocal(editDatetime).date}T${e.target.value}`)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-party">{tx("Party size")}</Label>
              <Input id="edit-party" type="number" min={1} value={editPartySize} onChange={(e) => setEditPartySize(Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-notes">{tx("Notes")}</Label>
              <Textarea id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>{tx("Close")}</Button>
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
              {tx("Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
