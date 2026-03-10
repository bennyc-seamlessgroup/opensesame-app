"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MembershipWalletSection } from "@/components/membership/membership-wallet-section";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function ProfileMembershipPage() {
  const { tx } = useI18n();

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Button asChild size="icon" variant="secondary" className="h-9 w-9 rounded-full">
          <Link href="/profile">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <p className="text-lg font-semibold text-foreground">{tx("NFT Cards")}</p>
          <p className="text-xs text-muted-foreground">{tx("Restaurant cards, offers, and benefits")}</p>
        </div>
      </div>
      <MembershipWalletSection />
    </div>
  );
}
