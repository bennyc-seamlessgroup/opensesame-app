"use client";

import Link from "next/link";
import { CreditCard, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type WalletActionButtonsProps = {
  onTransfer: () => void;
  onBuy: () => void;
};

export function WalletActionButtons({ onTransfer, onBuy }: WalletActionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button asChild className="h-10 gap-2 rounded-xl" aria-label="Pay / Verify">
        <Link href="/pay">
          <CreditCard className="h-4 w-4" />
          Pay
        </Link>
      </Button>
      <Button variant="secondary" className="h-10 gap-2 rounded-xl" onClick={onTransfer} aria-label="Transfer">
        <Send className="h-4 w-4" />
        Transfer
      </Button>
      <Button variant="secondary" className="h-10 gap-2 rounded-xl" onClick={onBuy} aria-label="Buy more">
        <Plus className="h-4 w-4" />
        Buy
      </Button>
    </div>
  );
}
