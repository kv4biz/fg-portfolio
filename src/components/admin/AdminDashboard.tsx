// src/components/admin/AdminDashboard.tsx (updated loading and storage calculations)
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Settings,
  Home,
  FileText,
  MessageSquare,
  Shield,
  LogOut,
  Camera,
  ImageDown,
  Play,
  Star,
  HeadphonesIcon,
  Moon,
  Sun,
  Globe,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import WebsiteSettings from "./nav/WebsiteSettings";
import SectionManager from "./nav/SectionManager";
import UserManagement from "./nav/UserManagement";
import UserSettings from "./nav/UserSettings";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load data from /api/admin/overview
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/overview", {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok) setData(json);
        else console.error("Failed to fetch overview:", json.error);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle dark/light theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("admin-theme", newTheme ? "dark" : "light");
  };

  const handleSupportClick = () => {
    window.open("https://wa.me/2340000000000?text=Hello%20ElVora%20Support,%20I%20need%20help%20with%20the%20admin%20panel", "_blank");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Logged out successfully!");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error((err as Error).message || "Failed to log out");
    } finally {
      onLogout();
    }
  };

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Show loading state only for the overview section
  if (loading && activeSection === "overview") {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Button disabled size="sm">
          <Spinner />
          Loading...
        </Button>
      </div>
    );
  }

  const user = data?.user;
  const stats = data?.stats || {};
  const storage = data?.storage || { used: 0, limit: 2147483648, imageCount: 0, videoCount: 0 };

  const storagePercent = storage.limit > 0 ? (storage.used / storage.limit) * 100 : 0;

  const statCards = [
    { label: "Portfolio", value: stats.portfolios, icon: Camera },
    { label: "Services", value: stats.services, icon: Settings },
    { label: "Blogs", value: stats.blogs, icon: FileText },
    { label: "Testimonials", value: stats.testimonials, icon: Star },
    { label: "Messages", value: stats.messages, icon: MessageSquare },
    { label: "Media Files", value: (storage.imageCount || 0) + (storage.videoCount || 0), icon: ImageDown },
  ];

  const storageBreakdown = [
    { type: "Images", amount: `${storage.imageCount || 0} files`, icon: ImageDown },
    { type: "Videos", amount: `${storage.videoCount || 0} files`, icon: Play },
  ];

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "website-settings", label: "Website Settings", icon: Settings },
    { id: "sections", label: "Section Manager", icon: FileText },
    { id: "users", label: "Messages", icon: MessageSquare },
    { id: "user-settings", label: "Account Settings", icon: Shield },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "website-settings":
        return <WebsiteSettings />;
      case "sections":
        return <SectionManager />;
      case "users":
        return <UserManagement />;
      case "user-settings":
        return <UserSettings />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-thin tracking-wider">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.firstName || "Admin"} — here is your overview.</p>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value ?? 0}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Storage usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Storage Usage</CardTitle>
                  <CardDescription>Your media space usage overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {formatBytes(storage.used)} of {formatBytes(storage.limit)} used
                    </span>
                    <span>{Math.round(storagePercent)}%</span>
                  </div>
                  <Progress value={storagePercent} className="h-2" />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Storage Breakdown</h4>
                    {storageBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span>{item.type}</span>
                        </div>
                        <span className="text-muted-foreground">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used management tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("sections")}>
                    <Globe className="mr-2 h-4 w-4" />
                    Manage Contents
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("users")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    View Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("user-settings")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar className="border-r">
            <SidebarHeader className="border-b p-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center  bg-primary text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{user ? `${user.firstName} ${user.lastName}` : "Admin"}</p>
                  <p className="text-xs text-muted-foreground">Photography Admin</p>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton onClick={() => setActiveSection(item.id)} isActive={activeSection === item.id}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-16 bg-sidebar shrink-0 items-center justify-between z-50 border-b sticky top-0 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center space-x-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleSupportClick}>
                      <HeadphonesIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Contact ElVora Support</TooltipContent>
                </Tooltip>

                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* User avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || "/default-avatar.png"} />
                  <AvatarFallback>{user?.firstName?.[0] || "A"}</AvatarFallback>
                </Avatar>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {loading && activeSection !== "overview" ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Spinner className="w-8 h-8 mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading {activeSection}...</p>
                  </div>
                </div>
              ) : (
                renderContent()
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
