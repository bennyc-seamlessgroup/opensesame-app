import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section-header";
import { referralLink, user } from "@/lib/mock-data";

export default function ReferralPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-2 p-4">
          <SectionHeader title="Referral Hub" subtitle="Referral NFT + earnings" />
          <p className="text-sm text-muted-foreground">Tier</p>
          <p className="text-base font-semibold text-foreground">{user.nfts.referralTier}</p>
          <p className="text-sm text-foreground">Benefits: referral multipliers and network rewards.</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <SectionHeader title="Earnings" />
          <p className="text-sm text-foreground">Total: {user.nfts.referralEarningsTotal} $OSM</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-muted-foreground">Level 1</p>
              <p className="font-semibold text-foreground">{user.nfts.referralGraph.level1Count}</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-muted-foreground">Level 2</p>
              <p className="font-semibold text-foreground">{user.nfts.referralGraph.level2Count}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <SectionHeader title="Share" />
          <Input value={referralLink} readOnly aria-label="Referral link" />
          <Button type="button" variant="secondary" className="w-full rounded-lg">Copy Link</Button>
          <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-lg border border-border/80">
            <Image src="/images/qr-placeholder.png" alt="Referral QR placeholder" fill className="object-cover" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
