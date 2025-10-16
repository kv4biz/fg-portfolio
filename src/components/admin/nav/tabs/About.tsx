// src/components/admin/nav/tabs/About.tsx (updated)
"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { toast } from "sonner";
import Image from "next/image";

export interface AboutData {
  id: string;
  title: string;
  description: string;
  aboutImage: string | null;
  lists: AboutList[];
  stats: AboutStat[];
}

export interface AboutList {
  id: string;
  title: string;
  items: AboutListItem[];
}

export interface AboutListItem {
  id: string;
  mainText: string;
  subText: string | null;
}

export interface AboutStat {
  id: string;
  number: number;
  text: string;
}

const About = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    id: "",
    title: "ABOUT",
    description: "",
    aboutImage: null,
    lists: [],
    stats: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Fetch about data on component mount
  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await fetch("/api/admin/about", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAboutData(
          data.about || {
            id: "",
            title: "ABOUT",
            description: "",
            aboutImage: null,
            lists: [],
            stats: [],
          }
        );
      } else {
        throw new Error("Failed to fetch about data");
      }
    } catch (err) {
      console.error("Error fetching about data:", err);
      toast.error("Failed to load about section");
    }
  };

  const handleInputChange = (field: keyof AboutData, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!aboutData.title) {
      toast.error("Title is required.");
      return;
    }

    if (!aboutData.description) {
      toast.error("Description is required.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(aboutData),
      });

      if (res.ok) {
        const data = await res.json();
        setAboutData(data.about);
        toast.success("About section updated successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update about section");
      }
    } catch (err) {
      console.error("Error updating about section:", err);
      toast.error("Failed to update about section");
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
      // First, ensure we have the about record
      let currentAboutId = aboutData.id;

      if (!currentAboutId) {
        // If no about record exists, create one with basic data
        const saveRes = await fetch("/api/admin/about", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: aboutData.title,
            description: aboutData.description,
            lists: aboutData.lists,
            stats: aboutData.stats,
          }),
        });

        if (!saveRes.ok) {
          throw new Error("Failed to create about record");
        }

        const savedData = await saveRes.json();
        setAboutData(savedData.about);
        currentAboutId = savedData.about.id;
      }

      // Use the dedicated about image upload endpoint
      const formData = new FormData();
      formData.append("image", file);

      const uploadRes = await fetch("/api/admin/about/image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        setAboutData(uploadData.about);
        toast.success("About profile image uploaded successfully!");
      } else {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload profile image");
    } finally {
      setImageLoading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!aboutData.id || !aboutData.aboutImage) return;

    try {
      const deleteRes = await fetch(`/api/admin/about/image?aboutId=${aboutData.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (deleteRes.ok) {
        const deleteData = await deleteRes.json();
        setAboutData(deleteData.about);
        toast.success("Profile image deleted successfully!");
      } else {
        const errorData = await deleteRes.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Image delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete profile image");
    }
  };

  // List management functions
  const addList = () => {
    const newList: AboutList = {
      id: `temp-${Date.now()}`,
      title: "",
      items: [{ id: `temp-item-${Date.now()}`, mainText: "", subText: "" }],
    };
    setAboutData((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
    }));
  };

  const removeList = (listId: string) => {
    setAboutData((prev) => ({
      ...prev,
      lists: prev.lists.filter((list) => list.id !== listId),
    }));
  };

  const updateListTitle = (listId: string, title: string) => {
    setAboutData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => (list.id === listId ? { ...list, title } : list)),
    }));
  };

  const addListItem = (listId: string) => {
    setAboutData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: [...list.items, { id: `temp-item-${Date.now()}`, mainText: "", subText: "" }],
            }
          : list
      ),
    }));
  };

  const removeListItem = (listId: string, itemId: string) => {
    setAboutData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.filter((item) => item.id !== itemId),
            }
          : list
      ),
    }));
  };

  const updateListItem = (listId: string, itemId: string, field: "mainText" | "subText", value: string) => {
    setAboutData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
            }
          : list
      ),
    }));
  };

  // Stats management functions
  const addStat = () => {
    const newStat: AboutStat = {
      id: `temp-${Date.now()}`,
      number: 0,
      text: "",
    };
    setAboutData((prev) => ({
      ...prev,
      stats: [...prev.stats, newStat],
    }));
  };

  const removeStat = (statId: string) => {
    setAboutData((prev) => ({
      ...prev,
      stats: prev.stats.filter((stat) => stat.id !== statId),
    }));
  };

  const updateStat = (statId: string, field: "number" | "text", value: string | number) => {
    setAboutData((prev) => ({
      ...prev,
      stats: prev.stats.map((stat) => (stat.id === statId ? { ...stat, [field]: value } : stat)),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
          <CardDescription>Basic information and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutTitle">Section Title *</Label>
            <Input
              id="aboutTitle"
              value={aboutData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter section title (e.g., ABOUT)"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutDescription">Description *</Label>
            <Textarea
              id="aboutDescription"
              value={aboutData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={5}
              placeholder="Enter your about description..."
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="border-2 border-dashed border-gray-300 p-6 text-center">
              {aboutData.aboutImage ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Image
                      width={1000}
                      height={1000}
                      src={aboutData.aboutImage}
                      alt="Profile preview"
                      className="max-h-64 max-w-64 mx-auto  object-cover"
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
                  <p className="text-sm text-muted-foreground">Profile image uploaded</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload profile image</p>
                </>
              )}
              <div className="flex items-center justify-center space-x-2">
                <input
                  type="file"
                  id="about-image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageLoading || isLoading}
                />
                <Label htmlFor="about-image-upload">
                  <Button variant="outline" asChild disabled={imageLoading || isLoading}>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {imageLoading ? "Uploading..." : "Choose File"}
                    </span>
                  </Button>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or WebP recommended. 3:4 aspect ratio works best. Max size 10MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience & Education Lists Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experience & Education</CardTitle>
              <CardDescription>Add your professional experience and education</CardDescription>
            </div>
            <Button onClick={addList} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add List
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {aboutData.lists.map((list) => (
            <div key={list.id} className="border  p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="List title (e.g., EXPERIENCE, EDUCATION)"
                  value={list.title}
                  onChange={(e) => updateListTitle(list.id, e.target.value)}
                  className="font-medium"
                  disabled={isLoading}
                />
                <Button variant="outline" size="sm" onClick={() => removeList(list.id)} disabled={isLoading}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {list.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Main text (e.g., Job title, Degree)"
                      value={item.mainText}
                      onChange={(e) => updateListItem(list.id, item.id, "mainText", e.target.value)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Sub text (e.g., Company, Dates, School)"
                        value={item.subText || ""}
                        onChange={(e) => updateListItem(list.id, item.id, "subText", e.target.value)}
                        disabled={isLoading}
                      />
                      <Button variant="outline" size="sm" onClick={() => removeListItem(list.id, item.id)} disabled={isLoading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={() => addListItem(list.id)} disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          ))}

          {aboutData.lists.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed">
              <p>No lists added yet.</p>
              <p className="text-sm">Click Add List to add experience or education sections.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Add key statistics and achievements</CardDescription>
            </div>
            <Button onClick={addStat} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Stat
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {aboutData.stats.map((stat) => (
            <div key={stat.id} className="flex items-center space-x-4 p-4 border">
              <Input
                type="number"
                placeholder="Number"
                value={stat.number}
                onChange={(e) => updateStat(stat.id, "number", parseInt(e.target.value) || 0)}
                className="w-24"
                disabled={isLoading}
              />
              <Input
                placeholder="Text (e.g., YEARS, PROJECTS, CLIENTS)"
                value={stat.text}
                onChange={(e) => updateStat(stat.id, "text", e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button variant="outline" size="sm" onClick={() => removeStat(stat.id)} disabled={isLoading}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {aboutData.stats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed ">
              <p>No statistics added yet.</p>
              <p className="text-sm">Click Add Stat to add your key achievements.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading}>
        <Save className="w-4 h-4 mr-2" />
        {isLoading ? "Saving..." : "Save About Section"}
      </Button>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your about section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="py-12 bg-white border">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Text Content */}
                <div className="order-2 lg:order-1 space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-thin tracking-wider text-black mb-4">{aboutData.title || "ABOUT"}</h2>
                    <div className="w-20 h-px bg-black opacity-60 mb-6"></div>

                    {aboutData.description && <p className="text-gray-700 leading-relaxed text-sm">{aboutData.description}</p>}
                  </div>

                  {/* Lists Preview */}
                  {aboutData.lists.map((list) => (
                    <div key={list.id}>
                      <h3 className="text-black tracking-wide mb-4 text-sm uppercase">{list.title || "SECTION TITLE"}</h3>
                      <div className="space-y-3">
                        {list.items.map((item, index) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-3">
                            <h4 className="text-black font-medium mb-1 text-sm">{item.mainText || "Main text"}</h4>
                            {item.subText && <p className="text-xs text-gray-500">{item.subText}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Stats Preview */}
                  {aboutData.stats.length > 0 && (
                    <div className="flex space-x-6 text-sm text-gray-600 pt-4">
                      {aboutData.stats.map((stat, index) => (
                        <div key={index}>
                          <span className="block text-xl font-thin text-black">{stat.number}+</span>
                          <span className="tracking-wide text-xs">{stat.text || "STAT"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image Preview */}
                <div className="order-1 lg:order-2">
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                    {aboutData.aboutImage ? (
                      <Image width={1000} height={1000} src={aboutData.aboutImage} alt="About preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <p className="text-muted-foreground text-sm">Profile image will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preview Notes */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your about section will appear on the actual website. The layout is responsive and will
              stack on mobile devices. Lists appear with elegant left borders and proper spacing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
