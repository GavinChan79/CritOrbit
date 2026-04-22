# CritOrbit Payment Soft Launch Checklist

## Required environment variables
- `TOYYIBPAY_USER_SECRET_KEY`
- `TOYYIBPAY_CATEGORY_CODE`
- `TOYYIBPAY_BASE_URL`
- `TOYYIBPAY_CALLBACK_URL`
- `TOYYIBPAY_RETURN_URL`

## Before launch
- Confirm Prisma migration for lead payment fields is applied in the production database.
- Confirm all ToyyibPay environment variables are set in production.
- Confirm the callback route is reachable:
  - `/api/payments/toyyibpay/callback`
- Confirm the admin lead page shows payment controls:
  - `Create Payment Link`
  - `Mark as Paid`
  - `Mark Release Ready`
  - `Mark as Released`
  - `Mark as Refunded`

## First live payment test
- Create a low-value test lead.
- Open the admin lead detail page.
- Create a payment link for `RM10`.
- Open the ToyyibPay bill page from the returned link.
- Complete the payment.
- Confirm the lead becomes `PAID`.
- If webhook is delayed, verify the payment in the ToyyibPay dashboard and use the manual fallback only if necessary.

## Webhook fallback procedure
- Confirm the payment exists in the ToyyibPay dashboard.
- On the admin lead page, use `Mark as Paid`.
- Add a payment reference or internal note for audit trail.
- Confirm the lead shows:
  - `paymentStatus = PAID`
  - `paymentRef` populated if available

## Release flow test
- Mark the lead as `Release Ready`.
- Mark the lead as `Released`.
- Confirm the release reference is stored.

## Safety checks
- Repeated `Create Payment Link` on the same unpaid lead returns the same active link.
- Fake callback with wrong amount does not mark the lead as `PAID`.
- Fake callback with wrong lead reference does not mark the lead as `PAID`.
- Duplicate callback does not double-process a paid lead.
- The return page does not show false success before backend confirms `PAID`.
