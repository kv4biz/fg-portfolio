// src/components/admin/nav/tabs/Profile.tsx
"use client";

import { useState } from "react";
import { Save, Upload } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { toast } from "sonner";
import { UserSettingsData } from "../UserSettings";

interface ProfileProps {
  userData: UserSettingsData;
  onUpdateUser: (data: Partial<UserSettingsData>) => Promise<{ success: boolean; error?: string }>;
  onRefreshData: () => void;
}

const Profile = ({ userData, onUpdateUser, onRefreshData }: ProfileProps) => {
  const [profileData, setProfileData] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    const result = await onUpdateUser(profileData);

    if (result.success) {
      toast.success("Profile updated successfully! Refreshing page...");
      onRefreshData();

      // Wait a moment for the success message and data refresh, then do full page reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setIsLoading(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/user-settings/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Avatar uploaded successfully! Refreshing page...");
        onRefreshData();

        // Wait a moment for the success message and data refresh, then do full page reload
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error((err as Error).message || "Failed to upload avatar");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    return `${profileData.firstName[0] || ""}${profileData.lastName[0] || ""}`.toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal information and avatar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={userData.avatarUrl || ""} />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center space-x-2">
              <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isLoading} />
              <Label htmlFor="avatar-upload">
                <Button variant="outline" asChild disabled={isLoading}>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Avatar
                  </span>
                </Button>
              </Label>
              <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 10MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={profileData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={profileData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button onClick={handleSaveProfile} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default Profile;
