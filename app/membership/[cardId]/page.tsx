import { MembershipCardDetailClient } from "./payment-membership-card-client";

export default async function MembershipCardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  return <MembershipCardDetailClient cardId={cardId} />;
}
