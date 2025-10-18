// src/components/admin/nav/tabs/General.tsx
"use client";

import { useState } from "react";
import { Save, Upload, Type, ImageDown } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { toast } from "sonner";
import { SiteSettingsData } from "../WebsiteSettings";
import Image from "next/image";

interface GeneralProps {
  siteSettings: SiteSettingsData;
  onUpdateSiteSettings: (data: Partial<SiteSettingsData>) => Promise<{ success: boolean; error?: string }>;
  onUploadImage: (file: File, imageType: "logo" | "favicon" | "socialImage") => Promise<{ success: boolean; url?: string; error?: string }>;
  onRefreshData: () => void;
}

const General = ({ siteSettings, onUpdateSiteSettings, onUploadImage, onRefreshData }: GeneralProps) => {
  const [generalData, setGeneralData] = useState({
    siteName: siteSettings.siteName || "",
    description: siteSettings.description || "",
    keywords: siteSettings.keywords || "",
    footerText: siteSettings.footerText || "",
    logoType: siteSettings.logoType || "text",
    logoText: siteSettings.logoText || "",
    ogTitle: siteSettings.ogTitle || "",
    ogDescription: siteSettings.ogDescription || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState<"logo" | "favicon" | "socialImage" | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setGeneralData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveGeneral = async () => {
    if (!generalData.siteName) {
      toast.error("Site name is required.");
      return;
    }

    setIsLoading(true);
    const result = await onUpdateSiteSettings(generalData);

    if (result.success) {
      toast.success("General settings updated successfully! Refreshing page...");
      onRefreshData();

      // Wait a moment for the success message and data refresh, then do full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error(result.error || "Failed to update general settings");
    }
    setIsLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageType: "logo" | "favicon" | "socialImage") => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setImageLoading(imageType);
    const result = await onUploadImage(file, imageType);

    if (result.success && result.url) {
      toast.success(
        `${imageType === "logo" ? "Logo" : imageType === "favicon" ? "Favicon" : "Social image"} uploaded successfully! Refreshing page...`
      );

      // Update the specific image field
      await onUpdateSiteSettings({ [imageType === "logo" ? "logoUrl" : imageType === "favicon" ? "faviconUrl" : "socialImage"]: result.url });

      onRefreshData();

      // Wait a moment for the success message and data refresh, then do full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error(result.error || `Failed to upload ${imageType}`);
    }
    setImageLoading(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Basic website information and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={generalData.siteName}
              onChange={(e) => handleInputChange("siteName", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Site Description</Label>
            <Textarea
              id="description"
              value={generalData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              disabled={isLoading}
              placeholder="Brief description of your website"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Meta Keywords</Label>
            <Input
              id="keywords"
              value={generalData.keywords}
              onChange={(e) => handleInputChange("keywords", e.target.value)}
              disabled={isLoading}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footerText">Footer Text</Label>
            <Input
              id="footerText"
              value={generalData.footerText}
              onChange={(e) => handleInputChange("footerText", e.target.value)}
              disabled={isLoading}
              placeholder="© 2025 Your Name. All rights reserved."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo & Branding</CardTitle>
          <CardDescription>Configure your website logo and favicon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Logo Type</Label>
            <div className="flex space-x-4">
              <Button
                variant={generalData.logoType === "text" ? "default" : "outline"}
                onClick={() => handleInputChange("logoType", "text")}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <Type className="w-4 h-4" />
                <span>Text Logo</span>
              </Button>
              <Button
                variant={generalData.logoType === "image" ? "default" : "outline"}
                onClick={() => handleInputChange("logoType", "image")}
                className="flex items-center space-x-2"
                disabled={isLoading}
              >
                <ImageDown className="w-4 h-4" />
                <span>Image Logo</span>
              </Button>
            </div>
          </div>

          {generalData.logoType === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="logoText">Logo Text</Label>
              <Input
                id="logoText"
                value={generalData.logoText}
                onChange={(e) => handleInputChange("logoText", e.target.value)}
                disabled={isLoading}
                placeholder="Your Brand Name"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Label>Logo Image</Label>
              <div className="flex items-center space-x-6">
                {siteSettings.logoUrl && (
                  <div className="w-20 h-20 border  overflow-hidden">
                    <Image src={siteSettings.logoUrl} alt="Logo preview" className="w-full h-full object-contain" width={1000} height={1000} />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logo")}
                      className="hidden"
                      disabled={imageLoading === "logo"}
                    />
                    <Label htmlFor="logo-upload">
                      <Button variant="outline" asChild disabled={imageLoading === "logo"}>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {imageLoading === "logo" ? "Uploading..." : "Upload Logo"}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 10MB.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Label>Favicon</Label>
            <div className="flex items-center space-x-6">
              {siteSettings.faviconUrl && (
                <div className="w-8 h-8 border rounded overflow-hidden">
                  <Image src={siteSettings.faviconUrl} alt="Favicon preview" className="w-full h-full object-contain" width={1000} height={1000} />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="favicon-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "favicon")}
                    className="hidden"
                    disabled={imageLoading === "favicon"}
                  />
                  <Label htmlFor="favicon-upload">
                    <Button variant="outline" asChild disabled={imageLoading === "favicon"}>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {imageLoading === "favicon" ? "Uploading..." : "Upload Favicon"}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground">16x16 or 32x32 px recommended. Max size 10MB.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Meta Tags</CardTitle>
          <CardDescription>Control how your site appears when shared on social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ogTitle">Open Graph Title</Label>
            <Input
              id="ogTitle"
              value={generalData.ogTitle}
              onChange={(e) => handleInputChange("ogTitle", e.target.value)}
              disabled={isLoading}
              placeholder="Title for social media sharing"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ogDescription">Open Graph Description</Label>
            <Textarea
              id="ogDescription"
              value={generalData.ogDescription}
              onChange={(e) => handleInputChange("ogDescription", e.target.value)}
              rows={3}
              disabled={isLoading}
              placeholder="Description for social media sharing"
            />
          </div>

          <div className="space-y-4">
            <Label>Social Media Image</Label>
            <div className="flex items-center space-x-6">
              {siteSettings.socialImage && (
                <div className="w-32 h-32 border  overflow-hidden">
                  <Image
                    src={siteSettings.socialImage}
                    alt="Social image preview"
                    className="w-full h-full object-cover"
                    height={1000}
                    width={1000}
                  />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    id="social-image-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "socialImage")}
                    className="hidden"
                    disabled={imageLoading === "socialImage"}
                  />
                  <Label htmlFor="social-image-upload">
                    <Button variant="outline" asChild disabled={imageLoading === "socialImage"}>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {imageLoading === "socialImage" ? "Uploading..." : "Upload Social Image"}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-sm text-muted-foreground">1200x630 px recommended. Max size 10MB.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSaveGeneral} disabled={isLoading}>
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? "Saving..." : "Save General Settings"}
      </Button>
    </div>
  );
};

export default General;
