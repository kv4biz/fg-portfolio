// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { Toaster } from "@/components/ui/sonner";

export const revalidate = 3600; // ✅ Cache metadata for 1 hour

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// --- Safe DB Query Helper (retries 3x if Neon is waking up) ---
async function safeQuery<T>(fn: () => Promise<T>, retries = 3): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        console.error("DB retry failed:", error);
        return null;
      }
      console.warn(`DB retrying (${i + 1}/${retries})...`);
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 second before retry
    }
  }
  return null;
}

// --- Dynamic Metadata Loader ---
export async function generateMetadata(): Promise<Metadata> {
  const settings = await safeQuery(() => prisma.siteSettings.findFirst());

  const title = settings?.siteName || "ElVora";
  const description = settings?.description || "";
  const image = settings?.socialImage || settings?.logoUrl || "/default-social.jpg";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    title,
    description,
    keywords: settings?.keywords?.split(",") || [],
    openGraph: {
      title: settings?.ogTitle || title,
      description: settings?.ogDescription || description,
      type: "website",
      url: baseUrl,
      siteName: settings?.siteName,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.ogTitle || title,
      description: settings?.ogDescription || description,
      images: image ? [image] : [],
    },
    other: {
      "instagram:title": settings?.ogTitle || title,
      "instagram:description": settings?.ogDescription || description,
      "snapchat:title": settings?.ogTitle || title,
      "snapchat:description": settings?.ogDescription || description,
      "tiktok:title": settings?.ogTitle || title,
      "tiktok:description": settings?.ogDescription || description,
      "pinterest:title": settings?.ogTitle || title,
      "pinterest:description": settings?.ogDescription || description,
      "whatsapp:title": settings?.ogTitle || title,
      "whatsapp:description": settings?.ogDescription || description,
      "og:image:secure_url": image,
      "og:type": "website",
    },
    icons: {
      icon: settings?.faviconUrl || "/favicon.ico",
    },
  };
}

// --- Layout Component ---
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
