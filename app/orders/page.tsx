"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, ClipboardList, CreditCard, PencilLine, Scan } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { PaymentPill, VerificationPill, OrderStatusPill } from "@/components/status-pills";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { cn, formatDateTime } from "@/lib/utils";

export default function OrdersPage() {
  const { tx } = useI18n();
  const [segment, setSegment] = useState<"bookings" | "takeaway">("bookings");
  const { bookings, orders, reviews } = useAppState();

  const reviewedIds = useMemo(() => new Set(reviews.map((review) => review.relatedId)), [reviews]);

  const sortedBookings = useMemo(() => {
    const now = Date.now();
    const score = (status: string, datetime: string) => {
      const t = +new Date(datetime);
      const soon = Number.isFinite(t) ? Math.max(0, Math.min(72, (t - now) / (1000 * 60 * 60))) : 999;
      const statusBoost =
        status === "CONFIRMED" ? 0 :
        status === "DRAFT" ? 10 :
        status === "COMPLETED" ? 60 :
        status === "CANCELLED" ? 80 :
        50;
      return statusBoost + soon;
    };
    return [...bookings].sort((a, b) => score(a.status, a.datetime) - score(b.status, b.datetime));
  }, [bookings]);

  const sortedOrders = useMemo(() => {
    const statusBoost = (status: string) => {
      if (status === "READY") return 0;
      if (status === "PLACED") return 10;
      if (status === "DRAFT") return 20;
      if (status === "PICKED_UP") return 60;
      if (status === "CANCELLED") return 80;
      return 50;
    };
    return [...orders].sort((a, b) => statusBoost(a.status) - statusBoost(b.status));
  }, [orders]);

  const bookingCounts = useMemo(() => {
    let action = 0;
    let upcoming = 0;
    let history = 0;
    for (const booking of bookings) {
      const reviewable =
        booking.status === "COMPLETED" &&
        booking.verificationStatus === "VERIFIED" &&
        !reviewedIds.has(booking.id);
      const needsAction =
        (booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID") ||
        (booking.status === "CONFIRMED" && booking.verificationStatus === "QR_REQUIRED") ||
        reviewable;
      const inHistory = booking.status === "CANCELLED" || booking.status === "COMPLETED";
      if (needsAction) action += 1;
      if (inHistory) history += 1;
      else upcoming += 1;
    }
    return { action, upcoming, history };
  }, [bookings, reviewedIds]);

  const takeawayCounts = useMemo(() => {
    let action = 0;
    let inProgress = 0;
    let history = 0;
    for (const order of orders) {
      const reviewable =
        order.status === "PICKED_UP" &&
        order.verificationStatus === "VERIFIED" &&
        !reviewedIds.has(order.id);
      const needsAction =
        (order.status !== "CANCELLED" && order.paymentStatus === "UNPAID") ||
        (order.status !== "CANCELLED" && order.verificationStatus === "QR_REQUIRED") ||
        reviewable;
      const inHistory = order.status === "CANCELLED" || order.status === "PICKED_UP";
      const isProgress = order.status === "PLACED" || order.status === "READY";
      if (needsAction) action += 1;
      if (inHistory) history += 1;
      else if (isProgress) inProgress += 1;
    }
    return { action, inProgress, history };
  }, [orders, reviewedIds]);

  const bookingSections = useMemo(() => {
    const actionRequired = [];
    const upcoming = [];
    const history = [];
    for (const booking of sortedBookings) {
      const reviewable =
        booking.status === "COMPLETED" &&
        booking.verificationStatus === "VERIFIED" &&
        !reviewedIds.has(booking.id);
      const needsAction =
        (booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID") ||
        (booking.status === "CONFIRMED" && booking.verificationStatus === "QR_REQUIRED") ||
        reviewable;
      const inHistory = booking.status === "CANCELLED" || booking.status === "COMPLETED";
      if (needsAction) actionRequired.push(booking);
      else if (inHistory) history.push(booking);
      else upcoming.push(booking);
    }
    return { actionRequired, upcoming, history };
  }, [reviewedIds, sortedBookings]);

  const takeawaySections = useMemo(() => {
    const actionRequired = [];
    const inProgress = [];
    const history = [];
    for (const order of sortedOrders) {
      const reviewable =
        order.status === "PICKED_UP" &&
        order.verificationStatus === "VERIFIED" &&
        !reviewedIds.has(order.id);
      const needsAction =
        (order.status !== "CANCELLED" && order.paymentStatus === "UNPAID") ||
        (order.status !== "CANCELLED" && order.verificationStatus === "QR_REQUIRED") ||
        reviewable;
      const inHistory = order.status === "CANCELLED" || order.status === "PICKED_UP";
      const isProgress = order.status === "PLACED" || order.status === "READY";
      if (needsAction) actionRequired.push(order);
      else if (inHistory) history.push(order);
      else if (isProgress) inProgress.push(order);
      else history.push(order);
    }
    return { actionRequired, inProgress, history };
  }, [reviewedIds, sortedOrders]);

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader title="Orders" subtitle="Bookings & takeaway" />

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">Overview</p>
                <p className="text-xs text-muted-foreground">Quick actions and history</p>
              </div>
            </div>
            <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
              <Link href="/ai">
                {tx("用 AI 搵餐")} <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <Tabs value={segment} onValueChange={(v) => setSegment(v === "takeaway" ? "takeaway" : "bookings")} className="w-full">
            <TabsList className="h-11 w-full rounded-full bg-muted p-1">
              <TabsTrigger value="bookings" className="h-9 flex-1 rounded-full text-sm font-semibold data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                {tx("堂食訂枱")}
                {bookingCounts.action > 0 ? <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">{bookingCounts.action}</span> : null}
              </TabsTrigger>
              <TabsTrigger value="takeaway" className="h-9 flex-1 rounded-full text-sm font-semibold data-[state=active]:bg-sky-500 data-[state=active]:text-white">
                {tx("外賣")}
                {takeawayCounts.action > 0 ? <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-[11px]">{takeawayCounts.action}</span> : null}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {segment === "bookings" ? (
        <div className="space-y-3">
          {sortedBookings.length === 0 ? (
            <Card className="border-border/80">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium text-foreground">{tx("未有訂枱記錄。")}</p>
                <p className="text-xs text-muted-foreground">{tx("用 AI 或 Explore 搵餐廳，落訂枱就會出現喺度。")}</p>
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
                    <Link href="/ai">{tx("去 AI")}</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                    <Link href="/explore">{tx("去 Explore")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {bookingSections.actionRequired.length ? (
            <div className="space-y-2">
              <SectionHeader title={tx("待處理")} subtitle={tx("需要你下一步")} />
              <div className="space-y-3">
                {bookingSections.actionRequired.map((booking) => {
                  const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
                  const reviewable = booking.status === "COMPLETED" && booking.verificationStatus === "VERIFIED" && !reviewedIds.has(booking.id);
                  const primary =
                    booking.paymentStatus === "UNPAID"
                      ? { href: `/pay?context=booking&bookingId=${booking.id}`, label: "Pay", Icon: CreditCard, variant: "default" as const }
                      : booking.verificationStatus === "QR_REQUIRED"
                        ? { href: `/pay?intent=verify&context=booking&bookingId=${booking.id}`, label: "Verify", Icon: Scan, variant: "secondary" as const }
                        : reviewable
                          ? { href: `/review/new?restaurantId=${booking.restaurantId}&relatedType=BOOKING&relatedId=${booking.id}`, label: "Write Review", Icon: PencilLine, variant: "secondary" as const }
                          : { href: `/orders/booking/${booking.id}`, label: "Details", Icon: ArrowRight, variant: "outline" as const };

                  return (
                    <Card key={booking.id} className="border-border/80">
                      <CardContent className="space-y-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70">
                            {restaurant ? (
                              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="64px" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <OrderStatusPill status={booking.status} />
                              <PaymentPill status={booking.paymentStatus} />
                              <VerificationPill status={booking.verificationStatus} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant={primary.variant} className="h-9 gap-2 rounded-xl">
                            <Link href={primary.href}>
                              <primary.Icon className="h-4 w-4" />
                              {tx(primary.label)}
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
                            <Link href={`/orders/booking/${booking.id}`}>{tx("Details")}</Link>
                          </Button>
                          {restaurant ? (
                            <Button asChild size="sm" variant="ghost" className="h-9 rounded-xl">
                              <Link href={`/restaurant/${restaurant.id}?mode=book`}>{tx("Restaurant")}</Link>
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {bookingSections.upcoming.length ? (
            <div className="space-y-2">
              <SectionHeader title={tx("即將到來")} />
              <div className="space-y-3">
                {bookingSections.upcoming.map((booking) => {
                  const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
                  return (
                    <Card key={booking.id} className="border-border/80">
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                          </div>
                          <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                            <Link href={`/orders/booking/${booking.id}`}>{tx("Details")}</Link>
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <OrderStatusPill status={booking.status} />
                          <PaymentPill status={booking.paymentStatus} />
                          <VerificationPill status={booking.verificationStatus} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {bookingSections.history.length ? (
            <Accordion type="single" collapsible className="rounded-xl border border-border/80 bg-card px-3">
              <AccordionItem value="history" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm font-semibold text-foreground">
                  {tx("歷史記錄")} ({bookingSections.history.length})
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-3">
                    {bookingSections.history.map((booking) => {
                      const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
                      return (
                        <Card key={booking.id} className="border-border/80">
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                                <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                              </div>
                              <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                                <Link href={`/orders/booking/${booking.id}`}>{tx("Details")}</Link>
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <OrderStatusPill status={booking.status} />
                              <PaymentPill status={booking.paymentStatus} />
                              <VerificationPill status={booking.verificationStatus} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      ) : (
        <div className={cn("space-y-3", "theme-takeaway")}>
          {sortedOrders.length === 0 ? (
            <Card className="border-border/80">
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium text-foreground">{tx("未有外賣訂單。")}</p>
                <p className="text-xs text-muted-foreground">{tx("喺餐廳頁加入購物車落單，訂單狀態就會出現喺度。")}</p>
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" className="h-8 rounded-full px-3 text-xs">
                    <Link href="/ai">{tx("去 AI")}</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">
                    <Link href="/cart">{tx("去購物車")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {takeawaySections.actionRequired.length ? (
            <div className="space-y-2">
              <SectionHeader title={tx("待處理")} subtitle={tx("需要你下一步")} />
              <div className="space-y-3">
                {takeawaySections.actionRequired.map((order) => {
                  const restaurant = restaurants.find((item) => item.id === order.restaurantId);
                  const reviewable = order.status === "PICKED_UP" && order.verificationStatus === "VERIFIED" && !reviewedIds.has(order.id);
                  const primary =
                    order.paymentStatus === "UNPAID"
                      ? { href: `/pay?context=order&orderId=${order.id}`, label: "Pay", Icon: CreditCard, variant: "default" as const }
                      : order.verificationStatus === "QR_REQUIRED"
                        ? { href: `/pay?intent=verify&context=order&orderId=${order.id}`, label: "Verify", Icon: Scan, variant: "secondary" as const }
                        : reviewable
                          ? { href: `/review/new?restaurantId=${order.restaurantId}&relatedType=TAKEAWAY&relatedId=${order.id}`, label: "Write Review", Icon: PencilLine, variant: "secondary" as const }
                          : { href: `/orders/takeaway/${order.id}`, label: "Details", Icon: ArrowRight, variant: "outline" as const };

                  return (
                    <Card key={order.id} className="border-border/80">
                      <CardContent className="space-y-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70">
                            {restaurant ? (
                              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="64px" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <OrderStatusPill status={order.status} />
                              <PaymentPill status={order.paymentStatus} />
                              <VerificationPill status={order.verificationStatus} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant={primary.variant} className="h-9 gap-2 rounded-xl">
                            <Link href={primary.href}>
                              <primary.Icon className="h-4 w-4" />
                              {tx(primary.label)}
                            </Link>
                          </Button>
                          <Button asChild size="sm" variant="outline" className="h-9 rounded-xl">
                            <Link href={`/orders/takeaway/${order.id}`}>{tx("Details")}</Link>
                          </Button>
                          {restaurant ? (
                            <Button asChild size="sm" variant="ghost" className="h-9 rounded-xl">
                              <Link href={`/restaurant/${restaurant.id}?mode=takeaway`}>{tx("Restaurant")}</Link>
                            </Button>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {takeawaySections.inProgress.length ? (
            <div className="space-y-2">
              <SectionHeader title={tx("進行中")} />
              <div className="space-y-3">
                {takeawaySections.inProgress.map((order) => {
                  const restaurant = restaurants.find((item) => item.id === order.restaurantId);
                  return (
                    <Card key={order.id} className="border-border/80">
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                            </p>
                          </div>
                          <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                            <Link href={`/orders/takeaway/${order.id}`}>{tx("Details")}</Link>
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <OrderStatusPill status={order.status} />
                          <PaymentPill status={order.paymentStatus} />
                          <VerificationPill status={order.verificationStatus} />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {takeawaySections.history.length ? (
            <Accordion type="single" collapsible className="rounded-xl border border-border/80 bg-card px-3">
              <AccordionItem value="history" className="border-b-0">
                <AccordionTrigger className="py-3 text-sm font-semibold text-foreground">
                  {tx("歷史記錄")} ({takeawaySections.history.length})
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="space-y-3">
                    {takeawaySections.history.map((order) => {
                      const restaurant = restaurants.find((item) => item.id === order.restaurantId);
                      return (
                        <Card key={order.id} className="border-border/80">
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                                </p>
                              </div>
                              <Button asChild size="sm" variant="outline" className="h-8 rounded-full px-3 text-xs">
                                <Link href={`/orders/takeaway/${order.id}`}>{tx("Details")}</Link>
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <OrderStatusPill status={order.status} />
                              <PaymentPill status={order.paymentStatus} />
                              <VerificationPill status={order.verificationStatus} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : null}
        </div>
      )}
    </div>
  );
}
