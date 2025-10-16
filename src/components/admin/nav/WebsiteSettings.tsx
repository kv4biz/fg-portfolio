// src/components/admin/nav/WebsiteSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import General from "./tabs/General";
import Contact from "./tabs/Contact";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export interface SiteSettingsData {
  id: string;
  siteName: string;
  description: string | null;
  keywords: string | null;
  footerText: string | null;
  logoType: string; // "text" or "image"
  logoText: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  socialImage: string | null;
}

export interface ContactInfoData {
  id: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  workDays: string | null;
  workHours: string | null;
}

export interface SocialLinkData {
  id: string;
  name: string;
  link: string;
}

interface WebsiteSettingsResponse {
  siteSettings: SiteSettingsData;
  contactInfo: ContactInfoData;
  socialLinks: SocialLinkData[];
}

const WebsiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>({
    id: "",
    siteName: "",
    description: "",
    keywords: "",
    footerText: "",
    logoType: "",
    logoText: "",
    logoUrl: null,
    faviconUrl: null,
    ogTitle: "",
    ogDescription: "",
    socialImage: null,
  });

  const [contactInfo, setContactInfo] = useState<ContactInfoData>({
    id: "",
    email: "",
    phone: "",
    whatsapp: "",
    location: "",
    workDays: "",
    workHours: "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinkData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch website settings data on component mount
  useEffect(() => {
    fetchWebsiteData();
  }, []);

  const fetchWebsiteData = async () => {
    try {
      const res = await fetch("/api/admin/website-settings", {
        credentials: "include",
      });

      if (res.ok) {
        const data: WebsiteSettingsResponse = await res.json();
        setSiteSettings(data.siteSettings);
        setContactInfo(data.contactInfo);
        setSocialLinks(data.socialLinks || []);
      } else {
        throw new Error("Failed to fetch website settings");
      }
    } catch (err) {
      console.error("Error fetching website settings:", err);
      toast.error("Failed to load website settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSiteSettings = async (updatedData: Partial<SiteSettingsData>) => {
    try {
      const res = await fetch("/api/admin/website-settings/site", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        setSiteSettings(data.siteSettings);
        return { success: true, data };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: "Network error occurred" };
    }
  };

  const updateContactInfo = async (updatedData: Partial<ContactInfoData>) => {
    try {
      const res = await fetch("/api/admin/website-settings/contact", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        setContactInfo(data.contactInfo);
        return { success: true, data };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: "Network error occurred" };
    }
  };

  const updateSocialLinks = async (links: SocialLinkData[]) => {
    try {
      const res = await fetch("/api/admin/website-settings/social", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ socialLinks: links }),
      });

      if (res.ok) {
        const data = await res.json();
        setSocialLinks(data.socialLinks);
        return { success: true, data };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: "Network error occurred" };
    }
  };

  const uploadImage = async (file: File, imageType: "logo" | "favicon" | "socialImage") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("referenceType", "OTHER");
    formData.append("imageType", imageType);

    try {
      const res = await fetch("/api/admin/website-settings/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, url: data.url };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: "Network error occurred" };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Button disabled size="sm">
          <Spinner />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-thin tracking-wider">Website Settings</h1>
        <p className="text-muted-foreground">Manage your website configuration and contact information</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <General
            siteSettings={siteSettings}
            onUpdateSiteSettings={updateSiteSettings}
            onUploadImage={uploadImage}
            onRefreshData={fetchWebsiteData}
          />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Contact
            contactInfo={contactInfo}
            socialLinks={socialLinks}
            onUpdateContactInfo={updateContactInfo}
            onUpdateSocialLinks={updateSocialLinks}
            onRefreshData={fetchWebsiteData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteSettings;
