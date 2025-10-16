"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface Service {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
}

interface ServiceItem {
  id: string;
  text: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch services data on component mount
  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Error fetching services data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section id="services" className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">SERVICES</h2>
            <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
            <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
              Professional photography services tailored to capture your most important moments with artistic excellence and refined attention to
              detail.
            </p>
          </div>

          {/* Services Grid Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-xl transition-shadow duration-300 border-gray-200 bg-white rounded-none">
                <CardHeader className="pb-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="bg-gray-50 py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">SERVICES</h2>
          <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
          <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
            Professional photography services tailored to capture your most important moments with artistic excellence and refined attention to
            detail.
          </p>
        </div>

        {/* Services Grid */}
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="hover:shadow-xl transition-shadow duration-300 border-gray-200 bg-white rounded-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-thin tracking-wide text-black">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600 tracking-wide leading-relaxed">{service.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {service.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-600 tracking-wide">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for updates.</p>
          </div>
        )}
      </div>
    </section>
  );
}
