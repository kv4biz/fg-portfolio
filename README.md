# ElVora Photographer Portfolio - Next.js (App Router) scaffold

## Setup

1. copy .env.local with required variables.
2. Install: npm ci
3. Generate Prisma client: npm run prisma:generate
4. Run migrations: npm run prisma:migrate
5. Start dev: npm run dev

## Create initial admin

- Use POST /api/admin/create with { email, password, firstName?, lastName? } once.
- OR run: npm run create-admin (script hits that route or creates via Prisma)

## Cloudinary

Set CLOUDINARY\_\* env vars. Media upload endpoint will upload and track bytes.

## Deploy

Connect GitHub repo to Vercel and set environment variables there. The included Github Action is optional.
