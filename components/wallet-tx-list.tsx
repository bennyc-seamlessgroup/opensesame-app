import { type WalletTx } from "@/lib/mock-data";
import { ArrowDownLeft, ArrowUpRight, CreditCard, Gift, Lock, Scan, ThumbsUp, Undo2 } from "lucide-react";
import type { ComponentType } from "react";
import { formatDateTime } from "@/lib/utils";

type WalletTxListProps = {
  items: WalletTx[];
};

const txMeta: Record<
  WalletTx["type"],
  { label: string; Icon: ComponentType<{ className?: string }> }
> = {
  PAY: { label: "Pay", Icon: CreditCard },
  VERIFY: { label: "Verify", Icon: Scan },
  TRANSFER_OUT: { label: "Transfer", Icon: ArrowUpRight },
  TRANSFER_IN: { label: "Receive", Icon: ArrowDownLeft },
  BUY: { label: "Buy", Icon: CreditCard },
  REWARD: { label: "Reward", Icon: Gift },
  REWARD_VOTE: { label: "Vote Reward", Icon: ThumbsUp },
  STAKE: { label: "Stake", Icon: Lock },
  UNSTAKE: { label: "Unstake", Icon: Undo2 },
};

export function WalletTxList({ items }: WalletTxListProps) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <div className="space-y-2">
      {items.map((tx) => (
        <div key={tx.id} className="rounded-lg border border-border/80 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                {(() => {
                  const meta = txMeta[tx.type];
                  const Icon = meta?.Icon ?? CreditCard;
                  return <Icon className="h-4 w-4 text-muted-foreground" />;
                })()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{txMeta[tx.type]?.label ?? tx.type.replaceAll("_", " ")}</p>
                <p className="truncate text-xs text-muted-foreground">{formatDateTime(tx.createdAt)}</p>
              </div>
            </div>
            <div className={`min-w-[92px] text-right ${tx.amountVira >= 0 ? "text-primary" : "text-foreground"}`}>
              <p className="inline-flex items-baseline justify-end gap-1 whitespace-nowrap text-sm font-semibold tabular-nums">
                <span>{tx.amountVira >= 0 ? "+" : ""}{tx.amountVira.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">$OSM</span>
              </p>
            </div>
          </div>
          {tx.note ? <p className="mt-1 text-xs text-muted-foreground">{tx.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
