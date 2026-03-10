import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; restaurantId?: string }>;
}) {
  const params = await searchParams;

  return <CheckoutClient type={params.type} restaurantId={params.restaurantId} />;
}
