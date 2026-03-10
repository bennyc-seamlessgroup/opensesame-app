"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export function OrderStatusPill({ status }: { status: string }) {
  const { tx } = useI18n();
  return <Badge variant="secondary" className="text-[10px]">{tx(status.replaceAll("_", " "))}</Badge>;
}

export function VerificationPill({ status }: { status: "AUTO" | "QR_REQUIRED" | "VERIFIED" }) {
  const { tx } = useI18n();
  const text = status === "QR_REQUIRED" ? "QR REQUIRED" : status;
  return <Badge variant={status === "VERIFIED" ? "default" : "outline"} className="text-[10px]">{tx(text)}</Badge>;
}

export function PaymentPill({ status }: { status: "UNPAID" | "PAID_OSM" }) {
  const { tx } = useI18n();
  return <Badge variant={status === "PAID_OSM" ? "default" : "secondary"} className="text-[10px]">{tx(status === "PAID_OSM" ? "PAID" : "UNPAID")}</Badge>;
}
