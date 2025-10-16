// src/components/admin/nav/SectionManager.tsx (updated)
"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Hero from "./tabs/Hero";
import About from "./tabs/About";
import Portfolio from "./tabs/Portfolio";
import Blog from "./tabs/Blog";
import Service from "./tabs/Service";
import Testimonials from "./tabs/Testimonials";

const SectionManager = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSaveAll = () => {
    toast.success("All changes saved successfully!");
  };

  if (isLoading) {
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
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-thin tracking-wider">Section Manager</h1>
          <p className="text-muted-foreground">Manage content for each section of your website</p>
        </div>
        <Button onClick={handleSaveAll}>
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="flex-1">
          <div className="h-full overflow-y-auto">
            <Hero />
          </div>
        </TabsContent>

        <TabsContent value="about" className="flex-1">
          <div className="h-full overflow-y-auto">
            <About />
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="flex-1">
          <div className="h-full overflow-y-auto">
            <Portfolio />
          </div>
        </TabsContent>
        <TabsContent value="services" className="flex-1">
          <div className="h-full overflow-y-auto">
            <Service />
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="flex-1">
          <div className="h-full overflow-y-auto">
            <Testimonials />
          </div>
        </TabsContent>

        <TabsContent value="blog" className="flex-1">
          <div className="h-full overflow-y-auto">
            <Blog />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectionManager;
