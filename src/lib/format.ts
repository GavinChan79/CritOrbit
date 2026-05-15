import { format } from "date-fns";

export function formatCurrency(value?: number | null) {
  if (!value) {
    return "Flexible";
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFromSen(value?: number | null) {
  if (!value) {
    return "Flexible";
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) {
    return "-";
  }

  return format(new Date(date), "dd MMM yyyy, h:mm a");
}

export function titleizeEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
