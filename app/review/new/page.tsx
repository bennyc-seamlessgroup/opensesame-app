import { ReviewNewClient } from "./review-new-client";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurantId?: string; relatedType?: string; relatedId?: string }>;
}) {
  const params = await searchParams;

  return (
    <ReviewNewClient
      presetRestaurantId={params.restaurantId}
      presetRelatedType={params.relatedType}
      presetRelatedId={params.relatedId}
    />
  );
}
