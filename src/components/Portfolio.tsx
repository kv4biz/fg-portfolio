"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallBack";

interface PortfolioItem {
  id: string;
  type: "PHOTOGRAPHY" | "CINEMATOGRAPHY";
  title: string;
  category: string | null;
  description: string | null;
  images: PortfolioImage[];
  videoUrl: string | null;
}

interface PortfolioImage {
  id: string;
  url: string;
}

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState("photography");
  const [showAllPhotography, setShowAllPhotography] = useState(false);
  const [showAllCinematography, setShowAllCinematography] = useState(false);
  const [activePhotoFilter, setActivePhotoFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setPortfolioItems(data.portfolioItems || []);
      }
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter portfolio items by type
  const photographyItems = portfolioItems.filter((item) => item.type === "PHOTOGRAPHY");
  const cinematographyItems = portfolioItems.filter((item) => item.type === "CINEMATOGRAPHY");

  // Get unique categories from photography items
  const photoCategories = ["All", ...Array.from(new Set(photographyItems.filter((item) => item.category).map((item) => item.category!)))];

  const filteredPhotography = activePhotoFilter === "All" ? photographyItems : photographyItems.filter((item) => item.category === activePhotoFilter);

  const visiblePhotography = showAllPhotography ? filteredPhotography : filteredPhotography.slice(0, 6);
  const visibleCinematography = showAllCinematography ? cinematographyItems : cinematographyItems.slice(0, 4);

  const openModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === selectedItem.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.images.length - 1 : prev - 1));
    }
  };

  if (isLoading) {
    return (
      <section id="portfolio" className="py-24 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">PORTFOLIO</h2>
            <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
            <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
              A curated selection of photography and cinematography work, showcasing elegance and sophistication across various luxury projects
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-white border border-gray-200 rounded-none overflow-hidden">
              <div className="px-8 py-3 bg-gray-200 animate-pulse w-32"></div>
              <div className="px-8 py-3 bg-gray-200 animate-pulse w-32"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">PORTFOLIO</h2>
          <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
          <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
            A curated selection of photography and cinematography work, showcasing elegance and sophistication across various luxury projects
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white border border-gray-200 rounded-none overflow-hidden">
            <button
              onClick={() => setActiveTab("photography")}
              className={`px-8 py-3 tracking-widest text-sm uppercase transition-colors duration-300 ${
                activeTab === "photography" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              Photography
            </button>
            <button
              onClick={() => setActiveTab("cinematography")}
              className={`px-8 py-3 tracking-widest text-sm uppercase transition-colors duration-300 ${
                activeTab === "cinematography" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
              }`}
            >
              Cinematography
            </button>
          </div>
        </div>

        {/* Photography Tab */}
        {activeTab === "photography" && (
          <>
            {/* Photography Filters - Only show if there are categories */}
            {photoCategories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {photoCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActivePhotoFilter(category)}
                    className={`px-6 py-2 tracking-wide text-sm transition-colors duration-300 ${
                      activePhotoFilter === category ? "bg-black text-white" : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Photography Grid */}
            {photographyItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {visiblePhotography.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-500 cursor-pointer"
                      onClick={() => openModal(item)}
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <ImageWithFallback
                          src={item.images[0]?.url || "/placeholder-portfolio.jpg"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          {item.category && <p className="text-xs tracking-widest uppercase opacity-80 mb-1">{item.category}</p>}
                          <h3 className="text-lg tracking-wide mb-2">{item.title}</h3>
                          {item.description && <p className="text-sm opacity-90 line-clamp-2">{item.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View More Button for Photography */}
                {filteredPhotography.length && !showAllPhotography && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllPhotography(true)}
                      className="inline-block bg-black text-white px-8 py-3 tracking-widest text-sm uppercase hover:bg-gray-800 transition-colors duration-300"
                    >
                      View More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No photography items yet.</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for updates.</p>
              </div>
            )}
          </>
        )}

        {/* Cinematography Tab */}
        {activeTab === "cinematography" && (
          <>
            {/* Cinematography Grid */}
            {cinematographyItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {visibleCinematography.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-500 cursor-pointer"
                      onClick={() => openModal(item)}
                    >
                      <div className="aspect-[16/9] overflow-hidden">
                        <ImageWithFallback
                          src={item.images[0]?.url || "/placeholder-cinematography.jpg"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-lg tracking-wide mb-2">{item.title}</h3>
                          {item.description && <p className="text-sm opacity-90 line-clamp-2">{item.description}</p>}
                        </div>
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                          <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View More Button for Cinematography */}
                {cinematographyItems.length > 4 && !showAllCinematography && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowAllCinematography(true)}
                      className="inline-block bg-black text-white px-8 py-3 tracking-widest text-sm uppercase hover:bg-gray-800 transition-colors duration-300"
                    >
                      View More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No cinematography items yet.</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for updates.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Full Screen Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 z-10 text-white lg:text-black hover:text-gray-300 lg:hover:text-gray-600 transition-colors duration-300"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="w-full h-full flex flex-col lg:flex-row">
            {/* Media Section */}
            <div className="lg:w-3/4 h-1/2 lg:h-full flex items-center justify-center bg-black p-6">
              {selectedItem.type === "PHOTOGRAPHY" ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {selectedItem.images.length > 0 ? (
                    <>
                      <ImageWithFallback
                        src={selectedItem.images[currentImageIndex]?.url || "/placeholder-portfolio.jpg"}
                        alt={selectedItem.title}
                        className="max-w-full max-h-full object-contain"
                      />

                      {/* Carousel Navigation */}
                      {selectedItem.images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300"
                          >
                            <ChevronLeft className="w-8 h-8" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300"
                          >
                            <ChevronRight className="w-8 h-8" />
                          </button>

                          {/* Image Indicators */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {selectedItem.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-white text-center">
                      <p>No images available</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {selectedItem.videoUrl ? (
                    <video src={selectedItem.videoUrl} controls className="max-w-full max-h-full" autoPlay>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="text-white text-center">
                      <p>No video available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="lg:w-1/4 md:w-2/5 h-1/2 lg:h-full bg-white p-8 flex flex-col justify-center overflow-y-auto">
              <div className="space-y-6">
                {selectedItem.category && (
                  <div>
                    <span className="text-xs tracking-widest uppercase text-gray-500">{selectedItem.category}</span>
                  </div>
                )}
                <h2 className="text-2xl md:text-3xl font-thin tracking-wide text-black">{selectedItem.title}</h2>
                <div className="w-16 h-px bg-black opacity-60"></div>
                {selectedItem.description && <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>}
                {selectedItem.type === "PHOTOGRAPHY" && selectedItem.images.length > 1 && (
                  <div className="text-sm text-gray-500">
                    {currentImageIndex + 1} of {selectedItem.images.length} images
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Portfolio;
