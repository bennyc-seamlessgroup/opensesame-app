import { Badge } from "@/components/ui/badge";

type StatsPillProps = {
  label: string;
  value: string;
};

export function StatsPill({ label, value }: StatsPillProps) {
  return (
    <Badge variant="secondary" className="gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </Badge>
  );
}
