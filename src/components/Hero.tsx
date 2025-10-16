// src/components/Hero.tsx
"use client";
import React, { useState, useEffect } from "react";
import { TypingText } from "./TypingText";
import { ImageWithFallback } from "./ImageWithFallBack";

interface HeroData {
  title: string;
  subtitle: string | null;
  description: string | null;
  bgImageUrl: string | null;
}

const Hero = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch hero data on component mount
  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const res = await fetch("/api/hero");
      if (res.ok) {
        const data = await res.json();
        setHeroData(data.hero);
      } else {
        // Fallback to default data if API fails
        setHeroData({
          title: "ELENA\nMORRISON",
          subtitle: "Photography & Modeling",
          description: "Capturing elegance through the lens of luxury fashion and portrait photography",
          bgImageUrl:
            "https://images.unsplash.com/photo-1636342230725-e1960028b85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBvcnRyYWl0JTIwbHV4dXJ5fGVufDF8fHx8MTc1OTg1OTIzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        });
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
      // Fallback to default data
      setHeroData({
        title: "ELENA\nMORRISON",
        subtitle: "Photography & Modeling",
        description: "Capturing elegance through the lens of luxury fashion and portrait photography",
        bgImageUrl:
          "https://images.unsplash.com/photo-1636342230725-e1960028b85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtb2RlbCUyMHBvcnRyYWl0JTIwbHV4dXJ5fGVufDF8fHx8MTc1OTg1OTIzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="home" className="relative h-screen w-full overflow-hidden bg-gray-900">
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white max-w-4xl px-6">
            <div className="h-16 md:h-24 bg-gray-700 rounded animate-pulse mb-6 mx-auto w-64 md:w-96"></div>
            <div className="h-6 bg-gray-700 rounded animate-pulse mb-8 mx-auto w-48"></div>
            <div className="w-24 h-px bg-white mx-auto opacity-60 mb-8"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse mx-auto w-72 max-w-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!heroData) {
    return null;
  }

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={heroData.bgImageUrl || "/placeholder-hero.jpg"}
          alt="Luxury fashion portrait"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-thin tracking-wider mb-6 leading-tight whitespace-pre-line">{heroData.title}</h1>
          {heroData.subtitle && (
            <p className="text-lg md:text-xl tracking-widest uppercase opacity-90 mb-8">
              <TypingText text={heroData.subtitle} speed={80} className="inline-block" />
            </p>
          )}
          <div className="w-24 h-px bg-white mx-auto opacity-60"></div>
          {heroData.description && <p className="text-sm md:text-base tracking-wide opacity-75 mt-8 max-w-2xl mx-auto">{heroData.description}</p>}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-white/40 animate-pulse"></div>
      </div>
    </section>
  );
};

export default Hero;
