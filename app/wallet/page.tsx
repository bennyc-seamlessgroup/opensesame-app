"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins, Lock, Sparkles, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/section-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WalletActionButtons } from "@/components/wallet-action-buttons";
import { WalletTxList } from "@/components/wallet-tx-list";
import { useAppState } from "@/lib/app-state";
import { cn, formatVira } from "@/lib/utils";

const txFilters = ["ALL", "SPEND", "EARN", "TRANSFER", "STAKE"] as const;
type TxFilter = (typeof txFilters)[number];

const formatWalletAmount = (amount: number) =>
  amount.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function WalletPage() {
  const { wallet, transactions, addTransferOut, addBuy, stake, unstake } = useAppState();
  const [filter, setFilter] = useState<TxFilter>("ALL");

  const [openTransfer, setOpenTransfer] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("50");
  const [transferNote, setTransferNote] = useState("");

  const [openBuy, setOpenBuy] = useState(false);
  const [buyAmount, setBuyAmount] = useState(100);

  const [stakingTab, setStakingTab] = useState<"stake" | "unstake">("stake");
  const [stakeAmount, setStakeAmount] = useState("100");
  const [unstakeAmount, setUnstakeAmount] = useState("100");

  const totalBalance = wallet.viraBalance + wallet.stakedBalance;

  const stakeValue = Number(stakeAmount);
  const unstakeValue = Number(unstakeAmount);
  const canStake = Number.isFinite(stakeValue) && stakeValue > 0 && stakeValue <= wallet.viraBalance;
  const canUnstake = Number.isFinite(unstakeValue) && unstakeValue > 0 && unstakeValue <= wallet.stakedBalance;

  const filtered = useMemo(() => {
    if (filter === "ALL") return transactions;
    if (filter === "TRANSFER") return transactions.filter((tx) => tx.type === "TRANSFER_OUT" || tx.type === "TRANSFER_IN");
    if (filter === "STAKE") return transactions.filter((tx) => tx.type === "STAKE" || tx.type === "UNSTAKE");
    if (filter === "SPEND") return transactions.filter((tx) => tx.amountVira < 0);
    if (filter === "EARN") return transactions.filter((tx) => tx.amountVira > 0);
    return transactions;
  }, [filter, transactions]);

  const transferValue = Number(transferAmount);
  const canTransfer =
    recipient.trim().length > 0 &&
    Number.isFinite(transferValue) &&
    transferValue > 0 &&
    transferValue <= wallet.viraBalance;

  return (
    <div className="space-y-4 pb-4">
      <section className="overflow-hidden rounded-[32px] border border-border/70 bg-card shadow-sm">
        <div className="relative h-56">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,173,51,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.96)_0%,_rgba(248,250,252,1)_100%)]" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:18px_18px]" />

          <div className="relative flex h-full flex-col justify-between p-4 text-foreground">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">Total balance</p>
                <p className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tabular-nums">{formatWalletAmount(totalBalance)}</span>
                  <span className="text-sm font-medium text-muted-foreground">$OSM</span>
                </p>
              </div>
              <div className="shrink-0 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                +{wallet.todayEarnings} today
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border/70 bg-card p-3">
                <p className="text-[11px] text-muted-foreground">Available</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{formatWalletAmount(wallet.viraBalance)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-3">
                <p className="text-[11px] text-muted-foreground">Staked</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{formatWalletAmount(wallet.stakedBalance)}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-card p-3">
                <p className="text-[11px] text-muted-foreground">APY</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{wallet.apyPct}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <WalletActionButtons onTransfer={() => setOpenTransfer(true)} onBuy={() => setOpenBuy(true)} />
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <SectionHeader
            title="Staking"
            subtitle="Lock $OSM to earn yield"
            action={
              <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                {wallet.apyPct}% APY
              </div>
            }
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-secondary/70 p-4 text-center">
              <p className="text-xs text-muted-foreground">APY</p>
              <p className="mt-2 inline-flex items-center gap-1 text-2xl font-semibold text-foreground tabular-nums">
                <TrendingUp className="h-5 w-5 text-sky-500" />
                {wallet.apyPct}%
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-4 text-center">
              <p className="text-xs text-muted-foreground">Projected yearly</p>
              <p className="mt-2 inline-flex items-baseline justify-center gap-1 text-center text-2xl font-semibold text-foreground">
                <Coins className="h-5 w-5 text-amber-500" />
                <span className="tabular-nums">{formatWalletAmount(Number((wallet.stakedBalance * wallet.apyPct / 100).toFixed(1)))}</span>
              </p>
            </div>
            <div className="rounded-2xl bg-secondary/70 p-4 text-center">
              <p className="text-xs text-muted-foreground">Today earned</p>
              <p className="mt-2 inline-flex items-baseline justify-center gap-1 text-center text-2xl font-semibold text-foreground">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="tabular-nums">{formatWalletAmount(wallet.todayEarnings)}</span>
              </p>
            </div>
          </div>

          <Tabs value={stakingTab} onValueChange={(v) => setStakingTab(v === "unstake" ? "unstake" : "stake")} className="w-full">
            <TabsList className="h-11 w-full rounded-full bg-muted p-1">
              <TabsTrigger value="stake" className="h-9 flex-1 rounded-full text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Stake
              </TabsTrigger>
              <TabsTrigger value="unstake" className="h-9 flex-1 rounded-full text-sm font-semibold data-[state=active]:bg-secondary data-[state=active]:text-foreground">
                Unstake
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {stakingTab === "stake" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Available: {formatWalletAmount(wallet.viraBalance)}</span>
                <div className="flex gap-1">
                  {[0.25, 0.5, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className="rounded-full bg-secondary px-2 py-1"
                      onClick={() => setStakeAmount(String(Math.floor(wallet.viraBalance * pct)))}
                    >
                      {pct === 1 ? "MAX" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} inputMode="decimal" aria-label="Stake amount" className="h-10 rounded-xl" />
                <Button className="h-10 rounded-xl" onClick={() => stake(stakeValue)} disabled={!canStake}>
                  Stake
                </Button>
              </div>
              {!canStake ? <p className="text-xs text-muted-foreground">Enter an amount ≤ available balance.</p> : null}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Staked: {formatWalletAmount(wallet.stakedBalance)}</span>
                <div className="flex gap-1">
                  {[0.25, 0.5, 1].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className="rounded-full bg-secondary px-2 py-1"
                      onClick={() => setUnstakeAmount(String(Math.floor(wallet.stakedBalance * pct)))}
                    >
                      {pct === 1 ? "MAX" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input value={unstakeAmount} onChange={(e) => setUnstakeAmount(e.target.value)} inputMode="decimal" aria-label="Unstake amount" className="h-10 rounded-xl" />
                <Button variant="secondary" className="h-10 rounded-xl" onClick={() => unstake(unstakeValue)} disabled={!canUnstake}>
                  Unstake
                </Button>
              </div>
              {!canUnstake ? <p className="text-xs text-muted-foreground">Enter an amount ≤ staked balance.</p> : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 bg-card shadow-sm">
        <CardContent className="space-y-4 p-4">
          <SectionHeader title="Transaction History" subtitle="Recent wallet activity" />
          <div className="flex flex-wrap gap-2">
            {txFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs",
                  filter === item ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                )}
              >
                {item === "SPEND" ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                {item === "EARN" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : null}
                {item === "TRANSFER" ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
                {item === "STAKE" ? <Lock className="h-3.5 w-3.5" /> : null}
                {item === "ALL" ? "All" : item === "SPEND" ? "Spend" : item === "EARN" ? "Earn" : item === "TRANSFER" ? "Transfer" : "Stake"}
              </button>
            ))}
          </div>
          <WalletTxList items={filtered} />
        </CardContent>
      </Card>

      <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
        <DialogContent>
          <DialogHeader><DialogTitle>Transfer</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Available: {formatWalletAmount(wallet.viraBalance)}</p>
            <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient" />
            <Input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="Amount ($OSM)" />
            <Input value={transferNote} onChange={(e) => setTransferNote(e.target.value)} placeholder="Note" />
            {!canTransfer ? <p className="text-xs text-muted-foreground">Enter a recipient and an amount ≤ available balance.</p> : null}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addTransferOut(recipient, Number(transferAmount), transferNote);
                setOpenTransfer(false);
              }}
              disabled={!canTransfer}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openBuy} onOpenChange={setOpenBuy}>
        <DialogContent>
          <DialogHeader><DialogTitle>Buy More</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-2">
            {[50, 100, 200].map((amount) => (
              <Button key={amount} variant={buyAmount === amount ? "default" : "secondary"} onClick={() => setBuyAmount(amount)} className="h-10 rounded-xl">
                <span className="tabular-nums">{amount}</span>
              </Button>
            ))}
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-3">
            <p className="text-sm font-medium text-foreground">You will receive</p>
            <p className="mt-1 flex items-baseline gap-1 text-lg font-semibold text-foreground">
              <span className="tabular-nums">{formatWalletAmount(buyAmount)}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Payment method: Card (placeholder)</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                addBuy(buyAmount, "Buy package");
                setOpenBuy(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
