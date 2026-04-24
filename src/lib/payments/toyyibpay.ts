import "server-only";

import { createHash } from "node:crypto";
import type {
  CreatePaymentLinkInput,
  CreatePaymentLinkResult,
  NormalizedToyyibPayCallback,
  PaymentStatusValue,
  ToyyibPayCallbackPayload,
} from "@/lib/payments/types";

type ToyyibPayConfig = {
  userSecretKey: string;
  categoryCode: string;
  baseUrl: string;
  callbackUrl: string;
  returnUrl: string;
};

type ToyyibPayConfigValidation = {
  isValid: boolean;
  missing: string[];
  config: ToyyibPayConfig | null;
};

type ToyyibPayCreateBillResponse = Array<{
  BillCode?: string;
  billCode?: string;
}>;

export class ToyyibPayProviderError extends Error {
  code:
    | "CONFIG_INVALID"
    | "ACCOUNT_UNVERIFIED"
    | "CATEGORY_REJECTED"
    | "PROVIDER_UNAVAILABLE"
    | "INVALID_RESPONSE";
  safeMessage: string;
  providerStatus?: number;
  providerBody?: string;

  constructor(
    code: ToyyibPayProviderError["code"],
    safeMessage: string,
    options?: {
      cause?: unknown;
      providerStatus?: number;
      providerBody?: string;
    },
  ) {
    super(safeMessage, options?.cause ? { cause: options.cause } : undefined);
    this.name = "ToyyibPayProviderError";
    this.code = code;
    this.safeMessage = safeMessage;
    this.providerStatus = options?.providerStatus;
    this.providerBody = options?.providerBody;
  }
}

export function validateToyyibPayConfig(): ToyyibPayConfigValidation {
  const userSecretKey = process.env.TOYYIBPAY_USER_SECRET_KEY?.trim();
  const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE?.trim();
  const baseUrl = (process.env.TOYYIBPAY_BASE_URL?.trim() || "https://toyyibpay.com").replace(/\/$/, "");
  const callbackUrl = process.env.TOYYIBPAY_CALLBACK_URL?.trim();
  const returnUrl = process.env.TOYYIBPAY_RETURN_URL?.trim();
  const missing = [
    !userSecretKey ? "TOYYIBPAY_USER_SECRET_KEY" : null,
    !categoryCode ? "TOYYIBPAY_CATEGORY_CODE" : null,
    !baseUrl ? "TOYYIBPAY_BASE_URL" : null,
    !callbackUrl ? "TOYYIBPAY_CALLBACK_URL" : null,
    !returnUrl ? "TOYYIBPAY_RETURN_URL" : null,
  ].filter((value): value is string => Boolean(value));

  if (missing.length > 0) {
    return {
      isValid: false,
      missing,
      config: null,
    };
  }

  return {
    isValid: true,
    missing: [],
    config: {
      userSecretKey: userSecretKey!,
      categoryCode: categoryCode!,
      baseUrl,
      callbackUrl: callbackUrl!,
      returnUrl: returnUrl!,
    },
  };
}

export function getToyyibPayConfig(): ToyyibPayConfig {
  const validation = validateToyyibPayConfig();

  if (!validation.isValid || !validation.config) {
    throw new ToyyibPayProviderError(
      "CONFIG_INVALID",
      `ToyyibPay configuration is incomplete. Missing: ${validation.missing.join(", ")}`,
    );
  }

  return validation.config;
}

export async function createToyyibPayPaymentLink(
  input: CreatePaymentLinkInput,
): Promise<CreatePaymentLinkResult> {
  const config = getToyyibPayConfig();
  const payload = new URLSearchParams({
    userSecretKey: config.userSecretKey,
    categoryCode: config.categoryCode,
    billName: sanitizeToyyibPayText(`CritOrbit ${input.leadId.slice(0, 8)}`, 30),
    billDescription: sanitizeToyyibPayText(input.description, 100),
    billPriceSetting: "1",
    billPayorInfo: "1",
    billAmount: String(input.amount),
    billReturnUrl: config.returnUrl,
    billCallbackUrl: config.callbackUrl,
    billExternalReferenceNo: input.leadId,
    billTo: sanitizeToyyibPayText(input.customerName || "CritOrbit Customer", 30),
    billEmail: input.customerEmail,
    billPhone: normalizePhone(input.customerPhone),
    billPaymentChannel: "2",
    billExpiryDays: "3",
  });

  console.info("[payments][toyyibpay] createBill request", {
    leadId: input.leadId,
    amount: input.amount,
    categoryCode: config.categoryCode,
    billName: payload.get("billName"),
    billDescriptionLength: payload.get("billDescription")?.length ?? 0,
    callbackUrl: config.callbackUrl,
    returnUrl: config.returnUrl,
    hasCustomerEmail: Boolean(input.customerEmail),
    hasCustomerPhone: Boolean(normalizePhone(input.customerPhone)),
  });

  let response: Response;
  let responseText = "";

  try {
    response = await fetch(`${config.baseUrl}/index.php/api/createBill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
    });
    responseText = await response.text();
  } catch (error) {
    console.error("[payments][toyyibpay] createBill network failure", {
      leadId: input.leadId,
      error,
    });
    throw new ToyyibPayProviderError(
      "PROVIDER_UNAVAILABLE",
      "ToyyibPay is temporarily unavailable. Please try again shortly.",
      { cause: error },
    );
  }

  if (!response.ok) {
    const safeBody = toSafeProviderBody(responseText);
    console.error("[payments][toyyibpay] createBill failed", {
      leadId: input.leadId,
      status: response.status,
      body: safeBody,
    });
    throw new ToyyibPayProviderError(
      classifyToyyibPayFailure(safeBody),
      getToyyibPaySafeMessage(classifyToyyibPayFailure(safeBody)),
      {
        providerStatus: response.status,
        providerBody: safeBody,
      },
    );
  }

  let parsed: ToyyibPayCreateBillResponse;
  try {
    parsed = JSON.parse(responseText) as ToyyibPayCreateBillResponse;
  } catch (error) {
    const safeBody = toSafeProviderBody(responseText);
    console.error("[payments][toyyibpay] createBill invalid JSON", {
      leadId: input.leadId,
      status: response.status,
      body: safeBody,
      error,
    });
    throw new ToyyibPayProviderError(
      "INVALID_RESPONSE",
      "ToyyibPay returned an invalid response. Please verify the account and category configuration.",
      {
        cause: error,
        providerStatus: response.status,
        providerBody: safeBody,
      },
    );
  }

  const billCode = parsed[0]?.BillCode || parsed[0]?.billCode;

  if (!billCode) {
    const safeBody = toSafeProviderBody(responseText);
    console.error("[payments][toyyibpay] createBill missing bill code", {
      leadId: input.leadId,
      status: response.status,
      body: safeBody,
    });
    const failureCode = classifyToyyibPayFailure(safeBody);
    throw new ToyyibPayProviderError(
      failureCode,
      getToyyibPaySafeMessage(failureCode),
      {
        providerStatus: response.status,
        providerBody: safeBody,
      },
    );
  }

  return {
    paymentProvider: "TOYYIBPAY",
    paymentLinkUrl: `${config.baseUrl}/${billCode}`,
    paymentLinkRef: billCode,
  };
}

export function normalizeToyyibPayCallback(
  payload: ToyyibPayCallbackPayload,
): NormalizedToyyibPayCallback {
  const leadId = payload.order_id?.trim();
  const paymentLinkRef = payload.billcode?.trim();

  if (!leadId || !paymentLinkRef) {
    throw new Error("ToyyibPay callback is missing order_id or billcode.");
  }

  const statusCode = payload.status?.trim() || payload.status_id?.trim() || null;
  const providerReason = payload.reason?.trim() || payload.msg?.trim() || null;
  const providerStatus = statusCode;
  const amount = normalizeToyyibPayAmount(payload.amount);
  const paymentRef =
    payload.transaction_id?.trim() ||
    payload.refno?.trim() ||
    payload.dnqr_transaction_id?.trim() ||
    null;
  const occurredAt = payload.transaction_time
    ? new Date(payload.transaction_time)
    : new Date();

  let nextStatus: PaymentStatusValue | null = null;
  let paidAt: Date | null = null;

  if (statusCode === "1") {
    nextStatus = "PAID";
    paidAt = new Date();
  } else if (statusCode === "3") {
    nextStatus =
      providerReason && providerReason.toLowerCase().includes("expir")
        ? "PAYMENT_EXPIRED"
        : "PAYMENT_FAILED";
  }

  return {
    leadId,
    paymentLinkRef,
    paymentRef,
    amount,
    providerStatus,
    providerReason,
    nextStatus,
    paidAt,
    occurredAt,
  };
}

export function verifyToyyibPayRequest(payload: ToyyibPayCallbackPayload) {
  const config = getToyyibPayConfig();
  const receivedHash = payload.hash?.trim();

  if (!receivedHash) {
    return false;
  }

  const expectedHash = createHash("md5")
    .update(
      `${config.userSecretKey}${payload.status ?? ""}${payload.order_id ?? ""}${payload.refno ?? ""}ok`,
    )
    .digest("hex");

  return expectedHash === receivedHash;
}

function sanitizeToyyibPayText(value: string, maxLength: number) {
  const sanitized = value
    .replace(/[^A-Za-z0-9 _]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (sanitized || "CritOrbit Payment").slice(0, maxLength);
}

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 20);
}

function normalizeToyyibPayAmount(value?: string) {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.round(numeric * 100);
}

function toSafeProviderBody(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function classifyToyyibPayFailure(
  safeBody: string,
): ToyyibPayProviderError["code"] {
  const normalized = safeBody.toLowerCase();

  if (
    normalized.includes("verify") ||
    normalized.includes("not approved") ||
    normalized.includes("not active")
  ) {
    return "ACCOUNT_UNVERIFIED";
  }

  if (
    normalized.includes("category") ||
    normalized.includes("categorycode") ||
    normalized.includes("invalid category")
  ) {
    return "CATEGORY_REJECTED";
  }

  if (!normalized) {
    return "PROVIDER_UNAVAILABLE";
  }

  return "INVALID_RESPONSE";
}

function getToyyibPaySafeMessage(
  code: ToyyibPayProviderError["code"],
) {
  switch (code) {
    case "CONFIG_INVALID":
      return "ToyyibPay configuration is invalid. Check the payment environment variables.";
    case "ACCOUNT_UNVERIFIED":
      return "ToyyibPay account is not approved for bill creation yet. Check the ToyyibPay account verification status.";
    case "CATEGORY_REJECTED":
      return "ToyyibPay rejected the category or bill setup. Verify the category code and account category settings.";
    case "PROVIDER_UNAVAILABLE":
      return "ToyyibPay is temporarily unavailable. Please try again shortly.";
    case "INVALID_RESPONSE":
    default:
      return "ToyyibPay rejected the bill request. Check the ToyyibPay account or category setup.";
  }
}
