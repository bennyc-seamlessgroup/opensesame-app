"use client";

import Image from "next/image";
import { MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { type Restaurant } from "@/lib/mock-data";
import { cn, formatPerPersonRange } from "@/lib/utils";

type RestaurantLocationButtonProps = {
  restaurant: Restaurant;
  variant?: "ghost" | "secondary" | "outline";
  size?: "icon" | "sm";
  className?: string;
  label?: string;
};

function mapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function RestaurantLocationButton({
  restaurant,
  variant = "ghost",
  size = "icon",
  className,
  label = "Map",
}: RestaurantLocationButtonProps) {
  const { tx } = useI18n();
  const [open, setOpen] = useState(false);

  const distanceText = useMemo(() => `${tx("距離你約")} ${restaurant.distanceKm.toFixed(1)}km`, [restaurant.distanceKm, tx]);
  const addressText = restaurant.address || `${restaurant.name}, ${restaurant.area}`;
  const href = mapsHref(`${restaurant.name} ${addressText}`);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(
          size === "icon" ? "h-8 w-8 shrink-0 self-start" : "h-8 gap-1.5 px-3 text-xs",
          className
        )}
        aria-label={tx("查看地址及地圖")}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <MapPin className="h-4 w-4" />
        {size !== "icon" ? <span>{label}</span> : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{restaurant.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div className="rounded-lg border border-border/80 p-3 text-sm">
              <p className="text-muted-foreground">{tx("地址")}</p>
              <p className="text-foreground">{addressText}</p>
              <p className="mt-2 text-xs text-muted-foreground">{tx(restaurant.area)} • {distanceText} • {tx("人均")} {formatPerPersonRange(restaurant.avgSpend)}</p>
            </div>

            <div className="relative h-40 w-full overflow-hidden rounded-lg border border-border/80">
              <Image src="/images/map-placeholder.png" alt="Map preview" fill className="object-cover" />
            </div>
          </div>

          <DialogFooter>
            <Button asChild variant="outline" className="rounded-lg">
              <a href={href} target="_blank" rel="noreferrer">
                <Navigation className="mr-2 h-4 w-4" />
                {tx("Open in Maps")}
              </a>
            </Button>
            <Button variant="ghost" className="rounded-lg" onClick={() => setOpen(false)}>
              {tx("Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
