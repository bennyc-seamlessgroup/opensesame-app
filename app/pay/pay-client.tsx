"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { QrActionSheet } from "@/components/qr-action-sheet";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/app-state";
import { bookings, orders, qrPayloadSamples, restaurants, type QrPayload } from "@/lib/mock-data";

type PayClientProps = {
  context?: string;
  orderId?: string;
  bookingId?: string;
  intent?: string;
};

function safeParseQr(value: string): QrPayload | null {
  try {
    const data = JSON.parse(value) as QrPayload;
    if (!data.type || !data.restaurantId || !data.merchantId || !data.nonce || !data.timestamp) return null;
    return data;
  } catch {
    return null;
  }
}

export function PayClient({ context, orderId, bookingId, intent }: PayClientProps) {
  const [activeTab, setActiveTab] = useState<"scan" | "myqr">("scan");
  const [rawPayload, setRawPayload] = useState("");
  const [selectedSample, setSelectedSample] = useState(qrPayloadSamples[0]?.payload || "");
  const [parsedPayload, setParsedPayload] = useState<QrPayload | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [result, setResult] = useState("");
  const [resultLink, setResultLink] = useState<string | null>(null);

  const { confirmQrAction, orders: stateOrders, bookings: stateBookings } = useAppState();

  const payloadFromContext = useMemo(() => {
    if (!context) return "";

    if (context === "order" && orderId) {
      const order = stateOrders.find((item) => item.id === orderId) || orders.find((item) => item.id === orderId);
      if (!order) return "";
      return JSON.stringify({
        type: intent === "verify" ? "VERIFY" : "PAY",
        merchantId: `m-${order.restaurantId}`,
        restaurantId: order.restaurantId,
        orderId,
        amount: intent === "verify" ? undefined : order.subtotal,
        nonce: `nonce-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (context === "booking" && bookingId) {
      const booking = stateBookings.find((item) => item.id === bookingId) || bookings.find((item) => item.id === bookingId);
      if (!booking) return "";
      const restaurant = restaurants.find((item) => item.id === booking.restaurantId);
      const amount = Math.round((restaurant?.avgSpend || 120) * 0.3);
      return JSON.stringify({
        type: intent === "verify" ? "VERIFY" : "PAY",
        merchantId: `m-${booking.restaurantId}`,
        restaurantId: booking.restaurantId,
        bookingId,
        amount: intent === "verify" ? undefined : amount,
        nonce: `nonce-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }

    return "";
  }, [context, orderId, bookingId, intent, stateOrders, stateBookings]);

  const currentPayload = parsedPayload || safeParseQr(rawPayload);
  const restaurant = currentPayload ? restaurants.find((item) => item.id === currentPayload.restaurantId) : null;
  const rewardEstimate =
    currentPayload && restaurant ? (currentPayload.amount ? Math.round((currentPayload.amount * restaurant.rewardYieldPct) / 100) : 2) : 0;

  return (
    <div className="space-y-4 pb-2">
      <SectionHeader title="Pay / Verify" subtitle="Unified QR flow for payment and verification" />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "scan" | "myqr")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">Scan QR</TabsTrigger>
          <TabsTrigger value="myqr">My QR</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-3 space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Camera placeholder</div>

              <div className="space-y-2">
                <Input value={rawPayload} onChange={(e) => setRawPayload(e.target.value)} placeholder='Paste QR payload: {"type":"PAY", ...}' aria-label="QR payload" />
                <div className="flex gap-2">
                  <select value={selectedSample} onChange={(e) => setSelectedSample(e.target.value)} className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm">
                    {qrPayloadSamples.map((sample) => (
                      <option key={sample.label} value={sample.payload}>{sample.label}</option>
                    ))}
                  </select>
                  <Button type="button" variant="secondary" onClick={() => setRawPayload(selectedSample)}>Simulate Scan</Button>
                </div>
                {payloadFromContext ? (
                  <Button type="button" variant="outline" className="w-full" onClick={() => setRawPayload(payloadFromContext)}>
                    Use current context payload
                  </Button>
                ) : null}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  const parsed = safeParseQr(rawPayload);
                  if (!parsed) {
                    setResult("Invalid QR payload.");
                    return;
                  }
                  setParsedPayload(parsed);
                  setOpenSheet(true);
                }}
              >
                Parse & Continue
              </Button>

              {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}

              {currentPayload?.type === "PAY" && restaurant && !restaurant.livePosSync ? (
                <Badge variant="outline">After payment, scan VERIFY QR for non-integrated POS</Badge>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="myqr" className="mt-3 space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-lg border border-border/80">
                <Image src="/images/qr-placeholder.png" alt="My QR" fill className="object-cover" />
              </div>
              <Input readOnly value='{"walletId":"opensesame-user-021","type":"PAY_OR_VERIFY","nonce":"myqr"}' aria-label="My QR payload" />
              <Button type="button" variant="secondary" className="w-full">Copy</Button>
              <p className="text-xs text-muted-foreground">Show this to merchant to pay with $OSM or verify visit.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QrActionSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        payload={currentPayload}
        rewardEstimate={rewardEstimate}
        onConfirm={() => {
          if (!currentPayload) return;
          const response = confirmQrAction(currentPayload);
          setResult(response.message);
          if (response.ok) {
            if (currentPayload.bookingId) setResultLink(`/orders/booking/${currentPayload.bookingId}`);
            else if (currentPayload.orderId) setResultLink(`/orders/takeaway/${currentPayload.orderId}`);
          }
          setOpenSheet(false);
        }}
      />

      {resultLink ? (
        <Button asChild className="w-full rounded-lg">
          <Link href={resultLink}>View details</Link>
        </Button>
      ) : null}
    </div>
  );
}
