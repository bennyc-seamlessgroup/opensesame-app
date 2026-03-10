import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVira(amount: number) {
  return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} $OSM`;
}

export function formatHKD(amount: number) {
  return `HK$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatHKDRange(min: number, max: number) {
  return `${formatHKD(min)} - ${formatHKD(max)}`;
}

export function formatPerPersonRange(avgSpend: number) {
  const roundedAvg = Math.max(0, Math.round(avgSpend));
  if (roundedAvg <= 0) return "";
  const roundTo = (value: number, step: number) => Math.round(value / step) * step;
  const low = Math.max(20, roundTo(roundedAvg * 0.6, 10));
  const high = Math.max(low + 10, roundTo(roundedAvg * 1.6, 10));
  return formatHKDRange(low, high);
}

export function formatDateTime(iso: string) {
  return format(new Date(iso), "MMM d, yyyy HH:mm");
}

export function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
