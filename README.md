# CritOrbit

CritOrbit is a platform that matches users with the right helper for their work.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- NextAuth
- Tailwind CSS

## Local Development

Run the app locally:

```bash
npm install
npm run db:init-local
npm run dev
```

Open `http://localhost:3000` in your browser.

## Core Flow

1. User logs in or registers
2. User submits a requirement brief
3. A draft is created server-side
4. User selects a helper from the ranked helper list
5. A lead is persisted before WhatsApp redirect
6. Admin manages the request lifecycle from the dashboard

## Deployment

CritOrbit is configured for Vercel deployment with Prisma and Postgres-compatible environment variables.
