"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, ClipboardList, Wallet, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const tabs = [
    { href: "/ai", label: "AI", subtitle: t("ai_subtitle"), icon: Sparkles },
    { href: "/explore", label: t("explore"), subtitle: "", icon: Compass },
    { href: "/orders", label: t("orders"), subtitle: "", icon: ClipboardList },
    { href: "/wallet", label: t("wallet"), subtitle: "", icon: Wallet },
    { href: "/profile", label: t("profile"), subtitle: "", icon: UserRound },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 pb-safe backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex w-full max-w-[480px] items-end justify-around px-2 pb-2 pt-2">
        {tabs.map(({ href, label, subtitle, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/ai" && pathname.startsWith(href)) ||
            (href === "/orders" && (pathname.startsWith("/checkout") || pathname.startsWith("/pay") || pathname.startsWith("/cart")));

          return (
            <Link
              key={href}
              href={href}
              className="flex min-w-[60px] flex-col items-center gap-0.5 rounded-lg px-1 py-1"
              aria-label={label}
            >
              <Icon
                className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-muted-foreground")}
                strokeWidth={active ? 2.4 : 1.9}
              />
              <span
                className={cn(
                  "text-[10px] font-medium leading-none",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {subtitle ? (
                <span className="text-[9px] leading-none text-muted-foreground">{subtitle}</span>
              ) : (
                <span className="h-[9px]" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
