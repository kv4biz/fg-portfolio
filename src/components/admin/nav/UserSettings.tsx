//src/components/admin/nav/UserSettings.tsx
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import Profile from "./tabs/Profile";
import Security from "./tabs/Security";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export interface UserSettingsData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

const UserSettings = () => {
  const [userData, setUserData] = useState<UserSettingsData>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    avatarUrl: null,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/admin/user-settings", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (updatedData: Partial<UserSettingsData>) => {
    try {
      const res = await fetch("/api/admin/user-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        return { success: true, data };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      console.error("Network error:", err);
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
        <h1 className="text-3xl font-thin tracking-wider">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and security settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Profile userData={userData} onUpdateUser={updateUserData} onRefreshData={fetchUserData} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Security />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserSettings;
