import { PayClient } from "./pay-client";

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; orderId?: string; bookingId?: string; intent?: string }>;
}) {
  const params = await searchParams;

  return (
    <PayClient
      context={params.context}
      orderId={params.orderId}
      bookingId={params.bookingId}
      intent={params.intent}
    />
  );
}
