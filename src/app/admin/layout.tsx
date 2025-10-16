//src/app/admin/layout.tsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </div>
  );
}
