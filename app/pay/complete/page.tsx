import { PaymentCompleteClient } from "./payment-complete-client";

export default async function PaymentCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; orderId?: string; bookingId?: string; method?: string; walletOffset?: string }>;
}) {
  const params = await searchParams;

  return (
    <PaymentCompleteClient
      context={params.context}
      orderId={params.orderId}
      bookingId={params.bookingId}
      method={params.method}
      walletOffset={params.walletOffset}
    />
  );
}
