Here’s a cleaner, clearer, and more professional rewrite of your **README.md** that better explains your project and setup process while keeping it concise and developer-friendly:

---

# 📸 ElVora Photographer Portfolio

### Built with Next.js (App Router) + Prisma + Cloudinary

ElVora is a modern **photographer portfolio scaffold** built using **Next.js (App Router)**, **Prisma**, and **Cloudinary**.
It provides a solid foundation for photographers to showcase their work, manage media, and customize portfolio content through a clean admin experience.

---

## 🚀 Getting Started

### 1. Environment Setup

Create a `.env.local` file in the project root and copy the required variables:

```
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=
SMTP_USER=
SMTP_PASSWORD=
SMTP_HOST=
SMTP_PORT=587
NEXT_PUBLIC_BASE_URL=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NODE_ENV=development
```

---

### 2. Install Dependencies

```bash
npm ci
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Apply Database Migrations

```bash
npm run prisma:migrate
```

### 5. Start the Development Server

```bash
npm run dev
```

Your app should now be running at **[http://localhost:3000](http://localhost:3000)**

---

## 👤 Create Initial Admin Account

You can create your first admin user in one of two ways:

### Option 1 — API Route

Send a POST request to:

```
POST /api/admin/create
```

with the JSON body:

```json
{
  "email": "admin@example.com",
  "password": "yourpassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Option 2 — Command Line Script

Run the included script:

```bash
npm run create-admin
```

This script either calls the API endpoint or directly creates the admin via Prisma.

---

## ☁️ Cloudinary Integration

ElVora uses **Cloudinary** for image and media uploads.
Set the following environment variables in `.env.local` or your hosting environment:

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Media uploads are automatically handled through the `/api/media` endpoints, with total storage usage tracked in the system.

---

## 🌍 Deployment

To deploy to **Vercel**:

1. Push your code to **GitHub**.
2. Connect the repository to **Vercel**.
3. Add all environment variables from `.env.local` in the **Vercel Project Settings → Environment Variables**.
4. Deploy!

> ⚙️ A GitHub Action is included for optional CI/CD automation.

---

## 🧩 Tech Stack

- **Next.js (App Router)** — frontend and API routes
- **Prisma ORM** — database modeling and migrations
- **PostgreSQL** — database
- **Cloudinary** — media storage
- **JWT Authentication** — secure admin access

---
