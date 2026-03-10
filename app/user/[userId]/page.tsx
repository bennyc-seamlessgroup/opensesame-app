import { ReviewerProfileClient } from "@/app/user/[userId]/reviewer-profile-client";

export default async function ReviewerProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <ReviewerProfileClient userId={userId} />;
}
