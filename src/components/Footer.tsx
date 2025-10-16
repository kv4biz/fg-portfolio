"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface SiteSettings {
  siteName: string;
  description: string | null;
  footerText: string | null;
}

interface UserInfo {
  firstName: string;
  lastName: string;
}

const Footer = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both site settings and user info
      const [settingsRes, userRes] = await Promise.all([fetch("/api/site-settings"), fetch("/api/user")]);

      let settings: SiteSettings = {
        siteName: "ELENA MORRISON",
        description: "Photography & Cinematography",
        footerText: "© {year} Elena Morrison. All rights reserved.",
      };

      if (settingsRes.ok) {
        const data = await settingsRes.json();
        settings = data.siteSettings;
      }

      setSiteSettings(settings);

      if (userRes.ok) {
        const data = await userRes.json();
        if (data.success) {
          setUserInfo({
            firstName: data.user.firstName,
            lastName: data.user.lastName,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  const displayName =
    userInfo && (userInfo.firstName || userInfo.lastName)
      ? `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim()
      : siteSettings?.siteName || "ELENA MORRISON";

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
                <h3 className="text-xl font-thin tracking-wider">{displayName}</h3>
                <p className="text-gray-400 text-sm tracking-wide">{siteSettings?.siteName || "Photography & Cinematography"}</p>
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
                  : `© ${currentYear} ${displayName}. All rights reserved.`}

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
