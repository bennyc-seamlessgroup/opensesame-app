"use client";

import { MembershipWalletSection } from "@/components/membership/membership-wallet-section";
import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/lib/i18n";

export default function ProfileMembershipPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("NFT Cards")} subtitle={tx("Restaurant cards, offers, and benefits")} />
      <MembershipWalletSection />
    </div>
  );
}
