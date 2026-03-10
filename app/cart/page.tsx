"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAppState } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { restaurants } from "@/lib/mock-data";
import { formatHKD } from "@/lib/utils";

export default function CartPage() {
  const { tx } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const { cartDraft, setCartItem, createOrderFromCart } = useAppState();

  const cartGroups = useMemo(() => {
    return restaurants
      .map((restaurant) => {
        const cart = cartDraft[restaurant.id] || {};
        const lines = Object.entries(cart)
          .map(([menuItemId, qty]) => {
            const menu = restaurant.takeawayMenu.find((item) => item.id === menuItemId);
            if (!menu || qty <= 0) return null;
            return { menu, qty, lineTotal: menu.price * qty };
          })
          .filter(Boolean) as { menu: (typeof restaurant.takeawayMenu)[number]; qty: number; lineTotal: number }[];

        const subtotal = lines.reduce((acc, line) => acc + line.lineTotal, 0);
        return { restaurant, lines, subtotal };
      })
      .filter((group) => group.lines.length > 0);
  }, [cartDraft]);

  const total = cartGroups.reduce((acc, group) => acc + group.subtotal, 0);

  const handlePlaceAll = () => {
    const orderIds: string[] = [];
    for (const group of cartGroups) {
      const id = createOrderFromCart(group.restaurant.id);
      if (id) orderIds.push(id);
    }

    if (!orderIds.length) return;

    if (orderIds.length > 1) {
      toast({
        title: `已建立 ${orderIds.length} 張訂單`,
        description: tx("可先支付第一張，其餘可在 Orders 逐張支付。"),
      });
    }

    router.push(`/pay?context=order&orderId=${orderIds[0]}`);
  };

  return (
    <div className="space-y-4 pb-4">
      <SectionHeader title={tx("Shopping Cart")} subtitle={tx("可同時加入多間餐廳，再一次建立訂單")} />

      {!cartGroups.length ? (
        <Card className="border-border/80">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-medium text-foreground">{tx("購物車暫時無項目。")}</p>
            <Button asChild size="sm" className="rounded-lg">
              <Link href="/ai">{tx("去 AI 頁加購物項目")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {cartGroups.map((group) => (
        <Card key={group.restaurant.id} className="border-border/80">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{group.restaurant.name}</p>
                <p className="text-xs text-muted-foreground">{tx(group.restaurant.area)}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 rounded-lg">
                <Link href={`/restaurant/${group.restaurant.id}?mode=takeaway`}>{tx("再加項目")}</Link>
              </Button>
            </div>

            <div className="space-y-2">
              {group.lines.map((line) => (
                <div key={`${group.restaurant.id}-${line.menu.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{line.menu.name}</p>
                    <p className="text-xs text-muted-foreground">{formatHKD(line.menu.price)} / item</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setCartItem(group.restaurant.id, line.menu.id, line.qty - 1)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 rounded-full"
                      onClick={() => setCartItem(group.restaurant.id, line.menu.id, line.qty + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/70 pt-2 text-sm">
              <span className="text-muted-foreground">{tx("小計")}</span>
              <span className="font-medium text-foreground">{formatHKD(group.subtotal)}</span>
            </div>
          </CardContent>
        </Card>
      ))}

      {cartGroups.length > 0 ? (
        <div className="sticky bottom-[78px] z-40">
          <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{tx("總計")}</span>
              <span className="font-semibold text-foreground">{formatHKD(total)}</span>
            </div>
            <Button className="w-full rounded-lg" onClick={handlePlaceAll}>
              {tx("建立全部訂單並前往支付")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
