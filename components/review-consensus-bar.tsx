"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type ReviewConsensusBarProps = {
  agreeCount: number;
  disagreeCount: number;
  label?: string;
  className?: string;
};

const clampInt = (value: number) => Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));

export function ReviewConsensusBar({ agreeCount, disagreeCount, label, className }: ReviewConsensusBarProps) {
  const { tx } = useI18n();
  const agree = clampInt(agreeCount);
  const disagree = clampInt(disagreeCount);
  const total = agree + disagree;
  const agreePct = total > 0 ? Math.round((agree / total) * 100) : 0;
  const disagreePct = total > 0 ? 100 - agreePct : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-xs text-muted-foreground">
        {tx(label || "其他顧客投票共識")}
      </p>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" aria-label={tx("同意")} />
          {agree}{total > 0 ? `（${agreePct}%）` : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <ThumbsDown className="h-3.5 w-3.5" aria-label={tx("不同意")} />
          {disagree}{total > 0 ? `（${disagreePct}%）` : ""}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="flex h-full w-full">
          <div className="h-full bg-emerald-500" style={{ width: `${agreePct}%` }} />
          <div className="h-full bg-rose-500" style={{ width: `${disagreePct}%` }} />
        </div>
      </div>
    </div>
  );
}
