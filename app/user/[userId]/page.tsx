import { ReviewerProfileClient } from "@/app/user/[userId]/reviewer-profile-client";

export default function ReviewerProfilePage({ params }: { params: { userId: string } }) {
  return <ReviewerProfileClient userId={params.userId} />;
}

