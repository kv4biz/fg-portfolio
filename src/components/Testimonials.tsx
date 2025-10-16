"use client";
import React, { useState, useEffect } from "react";

// Define the Testimonial type based on your Prisma model
type Testimonial = {
  id: string;
  name: string;
  job?: string;
  review: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch testimonials from API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/testimonials");
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Navigation functions
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, currentIndex]);

  // Avatar with Initials Component
  const AvatarWithInitials = ({ name, className }: { name: string; className: string }) => {
    // Generate initials from name (first letter of each word, max 2 letters)
    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2);
    };

    return <div className={`${className} bg-black flex items-center justify-center text-white font-medium rounded-full`}>{getInitials(name)}</div>;
  };

  if (isLoading) {
    return (
      <section id="testimonials" className="bg-gray-50 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-px bg-gray-300 w-24 mx-auto mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-64 mx-auto mb-16"></div>
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-8"></div>
              <div className="h-6 bg-gray-300 rounded w-full max-w-2xl mx-auto mb-8"></div>
              <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="bg-gray-50 py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">TESTIMONIALS</h2>
          <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
          <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
            Hear from clients who trusted us to capture their most important moments and create lasting memories through our photography.
          </p>
        </div>

        {/* Testimonial Carousel */}
        {testimonials.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="text-center max-w-3xl mx-auto">
                      {/* Avatar */}
                      <div className="w-20 h-20 mx-auto mb-8 rounded-full overflow-hidden border-2 border-gray-200">
                        <AvatarWithInitials name={testimonial.name} className="w-full h-full text-xl" />
                      </div>

                      {/* Feedback */}
                      <blockquote className="text-xl md:text-2xl leading-relaxed text-gray-800 italic mb-8 tracking-wide">
                        &ldquo;{testimonial.review}&rdquo;
                      </blockquote>

                      {/* Name and Role */}
                      <div className="space-y-1">
                        <h4 className="text-lg font-thin tracking-wide text-black">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 tracking-wider uppercase">{testimonial.job || "Client"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                  aria-label="Previous testimonial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
                  aria-label="Next testimonial"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Pagination Dots */}
            {testimonials.length > 1 && (
              <div className="flex justify-center mt-12 space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-black scale-125" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No testimonials yet.</p>
            <p className="text-sm mt-2">Check back later to see what our clients are saying.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
