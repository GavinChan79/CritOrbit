import "server-only";

import type { Lead } from "@prisma/client";
import {
  createToyyibPayPaymentLink,
  getToyyibPayConfig,
  validateToyyibPayConfig,
  normalizeToyyibPayCallback,
  verifyToyyibPayRequest,
} from "@/lib/payments/toyyibpay";
import type {
  CreatePaymentLinkInput,
  PaymentStatusValue,
  ToyyibPayCallbackPayload,
} from "@/lib/payments/types";

export {
  createToyyibPayPaymentLink as createPaymentLink,
  getToyyibPayConfig,
  validateToyyibPayConfig,
  normalizeToyyibPayCallback,
  verifyToyyibPayRequest,
};

export type { CreatePaymentLinkInput, ToyyibPayCallbackPayload };

export function normalizePaymentAmountInput(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (!Number.isInteger(value) || value <= 0) {
      return NaN;
    }

    return value * 100;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return NaN;
    }

    if (!/^\d+$/.test(trimmed)) {
      return NaN;
    }

    const numeric = Number(trimmed);
    if (!Number.isInteger(numeric) || numeric <= 0) {
      return NaN;
    }

    return numeric * 100;
  }

  return NaN;
}

export function canCreatePaymentLink(status: PaymentStatusValue) {
  return !["PAID", "RELEASED", "REFUNDED"].includes(status);
}

export function assertPaymentTransition(
  currentStatus: PaymentStatusValue,
  nextStatus: PaymentStatusValue,
) {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowedTransitions: Record<PaymentStatusValue, PaymentStatusValue[]> = {
    UNPAID: ["PAYMENT_LINK_SENT", "PAID"],
    PAYMENT_LINK_SENT: ["PAID", "PAYMENT_FAILED", "PAYMENT_EXPIRED"],
    PAID: ["RELEASE_READY", "REFUNDED", "RELEASED"],
    REFUNDED: [],
    RELEASE_READY: ["RELEASED"],
    RELEASED: [],
    PAYMENT_FAILED: ["PAYMENT_LINK_SENT", "PAID"],
    PAYMENT_EXPIRED: ["PAYMENT_LINK_SENT", "PAID"],
  };

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new Error(`Invalid payment transition: ${currentStatus} -> ${nextStatus}`);
  }
}

export function getPaymentStatusLabel(status: PaymentStatusValue) {
  const labels: Record<PaymentStatusValue, string> = {
    UNPAID: "Unpaid",
    PAYMENT_LINK_SENT: "Payment link sent",
    PAID: "Payment received by CritOrbit",
    REFUNDED: "Refunded",
    RELEASE_READY: "Release managed after completion",
    RELEASED: "Released",
    PAYMENT_FAILED: "Payment failed",
    PAYMENT_EXPIRED: "Payment expired",
  };

  return labels[status];
}

export function buildPaymentDescription(lead: Pick<Lead, "category" | "taskType" | "id">, note?: string) {
  const base = `CritOrbit ${lead.category} ${lead.taskType} ${lead.id.slice(0, 8)}`;
  return note ? `${base} ${note}` : base;
}

export function appendPaymentNote(notes: string, line: string) {
  const stampedLine = `[${new Date().toISOString()}] ${line}`.trim();
  return notes.trim() ? `${notes.trim()}\n${stampedLine}` : stampedLine;
}
