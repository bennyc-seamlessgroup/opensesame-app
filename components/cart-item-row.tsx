import { Button } from "@/components/ui/button";
import { formatHKD } from "@/lib/utils";

type CartItemRowProps = {
  name: string;
  price: number;
  qty: number;
  onDecrement: () => void;
  onIncrement: () => void;
};

export function CartItemRow({ name, price, qty, onDecrement, onIncrement }: CartItemRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2">
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{formatHKD(price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={onDecrement} aria-label={`Decrease ${name}`}>
          -
        </Button>
        <span className="w-4 text-center text-sm">{qty}</span>
        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={onIncrement} aria-label={`Increase ${name}`}>
          +
        </Button>
      </div>
    </div>
  );
}
