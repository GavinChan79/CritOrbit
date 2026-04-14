# CritStudio Updated Blueprint

## Architecture Plan
- Next.js App Router full-stack app with reusable feature modules under `src/`.
- Prisma schema is modeled to stay PostgreSQL-ready; local development currently runs against SQLite in this workspace.
- Phase 1 auth stays lean: credentials-based register/login for users, with admin access controlled by a `role` field.
- Lead temperature is derived from lead score only and is never user-editable.

## Page Map
- `/`
- `/login`
- `/register`
- `/requirements`
- `/helpers/select`
- `/dashboard`
- `/admin`
- `/admin/leads`
- `/admin/leads/[leadId]`
- `/admin/helper-stats`
- `/admin/helpers`
- `/admin/settings`

## Component Map
- Shared: `SiteHeader`, `SiteFooter`, `SectionHeading`, `Card`, `Badge`, `MetricCard`, `StatusBadge`
- Auth/forms: `AuthForm`, `RequirementForm`, `LeadManagementForm`
- Admin shell: `AdminSidebar`
- Helper selection: filter pills, recommendation state, and match summary all live inside the helper selection client flow

## Database Rules
- `Helper.specialties` is a structured array field stored as JSON objects:
  - `code`
  - `label`
  - `taskTypes`
- Recommendation logic is explicit:
  - helper category must match request category
  - at least one helper specialty must list the request task type
- On `Get Matched`, lead persistence must succeed before WhatsApp redirect is attempted.
- Helper stats track these separately:
  - user-selected count
  - admin-assigned count
  - closed deals count

## Implementation Order
1. Shared styling, schema, auth, and business rules
2. Public marketing and auth pages
3. Requirement form and helper selection flow
4. User dashboard
5. Admin CRM views and helper stats
6. Verification and responsive cleanup
