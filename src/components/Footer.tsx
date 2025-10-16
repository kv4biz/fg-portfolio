// src/components/Footer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SiteSettings {
  siteName: string;
  description: string | null;
  footerText: string | null;
}

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch site settings on component mount
  useEffect(() => {
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/site-settings");
      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data.siteSettings);
      } else {
        // Fallback to default settings if API fails
        setSiteSettings({
          siteName: "ELENA MORRISON",
          description: "Photography & Cinematography",
          footerText: "© 2025 Elena Morrison. All rights reserved.",
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      // Fallback to default settings
      setSiteSettings({
        siteName: "ELENA MORRISON",
        description: "Photography & Cinematography",
        footerText: "© 2025 Elena Morrison. All rights reserved.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            {isLoading ? (
              <>
                <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-700 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-thin tracking-wider">{siteSettings?.siteName || "ELENA MORRISON"}</h3>
                <p className="text-gray-400 text-sm tracking-wide">{siteSettings?.description || "Photography & Cinematography"}</p>
              </>
            )}
          </div>
          <div className="text-gray-400 text-sm tracking-wide">
            {isLoading ? (
              <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <>
                {siteSettings?.footerText
                  ? siteSettings.footerText.replace("{year}", currentYear.toString())
                  : `© ${currentYear} ${siteSettings?.siteName || "ELENA MORRISON"}. All rights reserved.`}
                <Link href="/admin" className="ml-4 text-xs opacity-30 hover:opacity-100 transition-opacity duration-300">
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
