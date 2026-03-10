"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  const { tx } = useI18n();
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-base font-semibold text-foreground">{tx(title)}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{tx(subtitle)}</p> : null}
      </div>
      {action}
    </div>
  );
}
