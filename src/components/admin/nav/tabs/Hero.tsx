// src/components/admin/nav/tabs/Hero.tsx (updated)
"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { toast } from "sonner";
import Image from "next/image";

export interface HeroData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  bgImageUrl: string | null;
}

const Hero = () => {
  const [heroData, setHeroData] = useState<HeroData>({
    id: "",
    title: "",
    subtitle: "",
    description: "",
    bgImageUrl: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Fetch hero data on component mount
  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await fetch("/api/admin/hero", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setHeroData(
          data.hero || {
            id: "",
            title: "",
            subtitle: "",
            description: "",
            bgImageUrl: null,
          }
        );
      } else {
        throw new Error("Failed to fetch hero data");
      }
    } catch (err) {
      console.error("Error fetching hero data:", err);
      toast.error("Failed to load hero section");
    }
  };

  const handleInputChange = (field: keyof HeroData, value: string | null) => {
    setHeroData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!heroData.title) {
      toast.error("Title is required.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(heroData),
      });

      if (res.ok) {
        const data = await res.json();
        setHeroData(data.hero);
        toast.success("Hero section updated successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update hero section");
      }
    } catch (err) {
      console.error("Error updating hero section:", err);
      toast.error("Failed to update hero section");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setImageLoading(true);

    try {
      // First, ensure we have the hero record
      let currentHeroId = heroData.id;

      if (!currentHeroId) {
        // If no hero record exists, create one with basic data
        const saveRes = await fetch("/api/admin/hero", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: heroData.title || "Your Title",
            subtitle: heroData.subtitle,
            description: heroData.description,
          }),
        });

        if (!saveRes.ok) {
          throw new Error("Failed to create hero record");
        }

        const savedData = await saveRes.json();
        setHeroData(savedData.hero);
        currentHeroId = savedData.hero.id;
      }

      // Use the dedicated hero image upload endpoint
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await fetch("/api/admin/hero/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        setHeroData(uploadData.hero);
        toast.success("Hero background image uploaded successfully!");
      } else {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload background image");
    } finally {
      setImageLoading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!heroData.id || !heroData.bgImageUrl) return;

    try {
      const deleteRes = await fetch(`/api/admin/hero/image?heroId=${heroData.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (deleteRes.ok) {
        const deleteData = await deleteRes.json();
        setHeroData(deleteData.hero);
        toast.success("Background image deleted successfully!");
      } else {
        const errorData = await deleteRes.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Image delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete background image");
    }
  };

  // Format title for preview - split into lines if it contains spaces
  const formatTitleForPreview = (title: string) => {
    if (!title) return ["YOUR", "TITLE"];

    // If title contains multiple words, split into lines
    const words = title.split(" ");
    if (words.length > 1) {
      const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
      const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");
      return [firstLine, secondLine];
    }

    return [title];
  };

  const titleLines = formatTitleForPreview(heroData.title);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
          <CardDescription>Main banner content and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Main Title *</Label>
            <Input
              id="heroTitle"
              value={heroData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter your main title (e.g., ELENA MORRISON)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={heroData.subtitle || ""}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Enter your subtitle (e.g., Photography & Modeling)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroDescription">Description</Label>
            <Textarea
              id="heroDescription"
              value={heroData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              placeholder="Enter a brief description (e.g., Capturing elegance through the lens of luxury fashion and portrait photography)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Background Image</Label>
            <div className="border-2 border-dashed border-gray-300 p-6 text-center">
              {heroData.bgImageUrl ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Image
                      src={heroData.bgImageUrl}
                      width={1000}
                      height={1000}
                      alt="Background preview"
                      className="max-h-64 max-w-64 mx-auto object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleDeleteImage}
                      disabled={imageLoading || isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Background image uploaded</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload background image</p>
                </>
              )}
              <div className="flex items-center justify-center space-x-2">
                <input
                  type="file"
                  id="hero-image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageLoading || isLoading}
                />
                <Label htmlFor="hero-image-upload">
                  <Button variant="outline" asChild disabled={imageLoading || isLoading}>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {imageLoading ? "Uploading..." : "Choose File"}
                    </span>
                  </Button>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or WebP recommended. Max size 10MB.</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Hero Section"}
          </Button>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your hero section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="relative h-[450px] w-full overflow-hidden border">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              {heroData.bgImageUrl ? (
                <Image src={heroData.bgImageUrl} width={1000} height={1000} alt="Hero background preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black"></div>
              )}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white max-w-4xl px-6">
                {/* Main Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-thin tracking-wider mb-4 leading-tight">
                  {titleLines.map((line, index) => (
                    <span key={index} className="block">
                      {line || (index === 0 ? "YOUR" : "TITLE")}
                    </span>
                  ))}
                </h1>

                {/* Subtitle */}
                {heroData.subtitle && <p className="text-base md:text-lg tracking-widest uppercase opacity-90 mb-6">{heroData.subtitle}</p>}

                {/* Divider Line */}
                <div className="w-20 h-px bg-white mx-auto opacity-60 mb-4"></div>

                {/* Description */}
                {heroData.description && (
                  <p className="text-sm md:text-base tracking-wide opacity-75 max-w-2xl mx-auto leading-relaxed">{heroData.description}</p>
                )}
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="w-px h-12 bg-white/40 animate-pulse"></div>
            </div>
          </section>

          {/* Preview Notes */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 ">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your hero section will appear on the actual website. The background image has a dark
              overlay for better text readability. Titles are automatically split into multiple lines for better visual balance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Hero;
