import "server-only";

import type { Lead } from "@prisma/client";

export type PaymentStatusValue = NonNullable<Lead["paymentStatus"]>;

export type CreatePaymentLinkInput = {
  leadId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
};

export type CreatePaymentLinkResult = {
  paymentProvider: "TOYYIBPAY";
  paymentLinkUrl: string;
  paymentLinkRef: string;
};

export type ToyyibPayCallbackPayload = {
  refno?: string;
  status?: string;
  reason?: string;
  billcode?: string;
  order_id?: string;
  amount?: string;
  transaction_time?: string;
  hash?: string;
  status_id?: string;
  msg?: string;
  transaction_id?: string;
  dnqr_transaction_id?: string;
};

export type NormalizedToyyibPayCallback = {
  leadId: string;
  paymentLinkRef: string;
  paymentRef: string | null;
  amount: number | null;
  providerStatus: string | null;
  providerReason: string | null;
  nextStatus: PaymentStatusValue | null;
  paidAt: Date | null;
  occurredAt: Date;
};
