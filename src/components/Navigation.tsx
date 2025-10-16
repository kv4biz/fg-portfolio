// src/components/Navigation.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface SiteSettings {
  siteName: string;
  logoType: "text" | "image";
  logoText: string | null;
  logoUrl: string | null;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          siteName: "PORTFOLIO",
          logoType: "text",
          logoText: "PORTFOLIO",
          logoUrl: null,
        });
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      // Fallback to default settings
      setSiteSettings({
        siteName: "PORTFOLIO",
        logoType: "text",
        logoText: "PORTFOLIO",
        logoUrl: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  // Render logo based on settings
  const renderLogo = () => {
    if (isLoading) {
      return <div className="text-white text-2xl tracking-wider font-light animate-pulse">PORTFOLIO</div>;
    }

    if (!siteSettings) {
      return <h1 className="text-white text-2xl tracking-wider font-light">PORTFOLIO</h1>;
    }

    if (siteSettings.logoType === "image" && siteSettings.logoUrl) {
      return (
        <div className="flex items-center">
          <Image src={siteSettings.logoUrl} alt={siteSettings.siteName} width={120} height={40} className="h-10 w-auto object-contain" priority />
        </div>
      );
    }

    return <h1 className="text-white text-2xl tracking-wider font-light">{siteSettings.logoText || siteSettings.siteName}</h1>;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">{renderLogo()}</div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-12">
              <button
                onClick={() => scrollToSection("home")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("portfolio")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Portfolio
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("blog")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-white hover:text-gray-300 transition-colors duration-300 text-sm tracking-widest uppercase"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-gray-300 transition-colors duration-300">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-sm">
            <button
              onClick={() => scrollToSection("home")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("portfolio")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Portfolio
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("blog")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-white hover:text-gray-300 block px-3 py-2 text-sm tracking-widest uppercase transition-colors duration-300 w-full text-left"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
