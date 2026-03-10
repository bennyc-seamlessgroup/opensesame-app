"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardList, CreditCard, PencilLine } from "lucide-react";
import { SectionHeader } from "@/components/section-header";
import { PaymentPill, OrderStatusPill } from "@/components/status-pills";
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
  const router = useRouter();
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
      const reviewable = booking.status === "COMPLETED" && !reviewedIds.has(booking.id);
      const needsAction = (booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID") || reviewable;
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
      const reviewable = order.status === "PICKED_UP" && !reviewedIds.has(order.id);
      const needsAction = (order.status !== "CANCELLED" && order.paymentStatus === "UNPAID") || reviewable;
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
      const reviewable = booking.status === "COMPLETED" && !reviewedIds.has(booking.id);
      const needsAction = (booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID") || reviewable;
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
      const reviewable = order.status === "PICKED_UP" && !reviewedIds.has(order.id);
      const needsAction = (order.status !== "CANCELLED" && order.paymentStatus === "UNPAID") || reviewable;
      const inHistory = order.status === "CANCELLED" || order.status === "PICKED_UP";
      const isProgress = order.status === "PLACED" || order.status === "READY";
      if (needsAction) actionRequired.push(order);
      else if (inHistory) history.push(order);
      else if (isProgress) inProgress.push(order);
      else history.push(order);
    }
    return { actionRequired, inProgress, history };
  }, [reviewedIds, sortedOrders]);

  const getBookingSummary = (booking: (typeof bookings)[number]) => {
    if (booking.status === "CONFIRMED" && booking.paymentStatus === "UNPAID") {
      return tx("支付訂金後先會為你保留座位。");
    }
    if (booking.status === "CONFIRMED") {
      return tx("已預留座位，到時到店即可。");
    }
    if (booking.status === "COMPLETED" && !reviewedIds.has(booking.id)) {
      return tx("用餐已完成，可以補寫評論。");
    }
    if (booking.status === "COMPLETED") {
      return tx("用餐已完成。");
    }
    return tx("訂座已取消。");
  };

  const getTakeawaySummary = (order: (typeof orders)[number]) => {
    if (order.paymentStatus === "UNPAID" && order.status !== "CANCELLED") {
      return tx("完成付款後，餐廳先會正式確認這張訂單。");
    }
    if (order.status === "READY") {
      return tx("餐點已準備好，可以前往取餐。");
    }
    if (order.status === "PLACED") {
      return tx("餐廳正在處理你的訂單。");
    }
    if (order.status === "PICKED_UP" && !reviewedIds.has(order.id)) {
      return tx("已取餐，可以補寫評論。");
    }
    if (order.status === "PICKED_UP") {
      return tx("已完成取餐。");
    }
    return tx("訂單已取消。");
  };

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader title="Orders" subtitle="Bookings & takeaway" />

      <Card className="border-border/80">
        <CardContent className="space-y-3 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Overview</p>
              <p className="text-xs text-muted-foreground">
                {segment === "bookings" ? tx("訂枱付款、查看狀態、補寫評論。") : tx("查看付款、備餐進度與取餐記錄。")}
              </p>
            </div>
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
                  const reviewable = booking.status === "COMPLETED" && !reviewedIds.has(booking.id);
                  const primary =
                    booking.paymentStatus === "UNPAID"
                      ? { href: `/pay?context=booking&bookingId=${booking.id}`, label: tx("支付訂金"), Icon: CreditCard, variant: "default" as const }
                      : reviewable
                        ? { href: `/review/new?restaurantId=${booking.restaurantId}&relatedType=BOOKING&relatedId=${booking.id}`, label: tx("寫評論"), Icon: PencilLine, variant: "secondary" as const }
                        : { href: `/orders/booking/${booking.id}`, label: tx("查看詳情"), Icon: CreditCard, variant: "outline" as const };

                  return (
                    <Card
                      key={booking.id}
                      className="cursor-pointer border-border/80 transition hover:border-border"
                      onClick={() => router.push(`/orders/booking/${booking.id}`)}
                    >
                      <CardContent className="space-y-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70">
                            {restaurant ? (
                              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="64px" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">{getBookingSummary(booking)}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <OrderStatusPill status={booking.status} />
                              <PaymentPill status={booking.paymentStatus} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button asChild size="sm" variant={primary.variant} className="h-9 gap-2 rounded-xl">
                            <Link href={primary.href}>
                              <primary.Icon className="h-4 w-4" />
                              {primary.label}
                            </Link>
                          </Button>
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
                    <Card
                      key={booking.id}
                      className="cursor-pointer border-border/80 transition hover:border-border"
                      onClick={() => router.push(`/orders/booking/${booking.id}`)}
                    >
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{getBookingSummary(booking)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <OrderStatusPill status={booking.status} />
                          <PaymentPill status={booking.paymentStatus} />
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
                        <Card
                          key={booking.id}
                          className="cursor-pointer border-border/80 transition hover:border-border"
                          onClick={() => router.push(`/orders/booking/${booking.id}`)}
                        >
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">{formatDateTime(booking.datetime)} • {booking.partySize} {tx("位")}</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">{getBookingSummary(booking)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <OrderStatusPill status={booking.status} />
                              <PaymentPill status={booking.paymentStatus} />
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
                  const reviewable = order.status === "PICKED_UP" && !reviewedIds.has(order.id);
                  const primary =
                    order.paymentStatus === "UNPAID"
                      ? { href: `/pay?context=order&orderId=${order.id}`, label: tx("立即付款"), Icon: CreditCard, variant: "default" as const }
                      : reviewable
                        ? { href: `/review/new?restaurantId=${order.restaurantId}&relatedType=TAKEAWAY&relatedId=${order.id}`, label: tx("寫評論"), Icon: PencilLine, variant: "secondary" as const }
                        : { href: `/orders/takeaway/${order.id}`, label: tx("查看詳情"), Icon: CreditCard, variant: "outline" as const };

                  return (
                    <Card
                      key={order.id}
                      className="cursor-pointer border-border/80 transition hover:border-border"
                      onClick={() => router.push(`/orders/takeaway/${order.id}`)}
                    >
                      <CardContent className="space-y-3 p-3">
                        <div className="flex gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/70">
                            {restaurant ? (
                              <Image src={restaurant.coverImage} alt={restaurant.name} fill className="object-cover" sizes="64px" />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                            </p>
                            <p className="mt-2 text-xs leading-5 text-muted-foreground">{getTakeawaySummary(order)}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <OrderStatusPill status={order.status} />
                              <PaymentPill status={order.paymentStatus} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button asChild size="sm" variant={primary.variant} className="h-9 gap-2 rounded-xl">
                            <Link href={primary.href}>
                              <primary.Icon className="h-4 w-4" />
                              {primary.label}
                            </Link>
                          </Button>
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
                    <Card
                      key={order.id}
                      className="cursor-pointer border-border/80 transition hover:border-border"
                      onClick={() => router.push(`/orders/takeaway/${order.id}`)}
                    >
                      <CardContent className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{getTakeawaySummary(order)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <OrderStatusPill status={order.status} />
                          <PaymentPill status={order.paymentStatus} />
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
                        <Card
                          key={order.id}
                          className="cursor-pointer border-border/80 transition hover:border-border"
                          onClick={() => router.push(`/orders/takeaway/${order.id}`)}
                        >
                          <CardContent className="space-y-2 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="truncate text-sm font-semibold text-foreground">{restaurant?.name ?? "Restaurant"}</p>
                                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {order.items.length} {tx("項")} • {tx("小計")} {order.subtotal} $OSM
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">{getTakeawaySummary(order)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <OrderStatusPill status={order.status} />
                              <PaymentPill status={order.paymentStatus} />
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
