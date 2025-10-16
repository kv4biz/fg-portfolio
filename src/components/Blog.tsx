"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./ImageWithFallBack";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  readTime: number;
  tag: string | null;
  featured: boolean;
  images: BlogImage[];
  content: string;
  createdAt: string;
}

interface BlogImage {
  id: string;
  url: string;
}

const Blog = () => {
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blog data on component mount
  useEffect(() => {
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      const res = await fetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(data.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);
  const visiblePosts = showAllPosts ? regularPosts : regularPosts.slice(0, 5);

  const openModal = (post: BlogPost) => {
    setSelectedPost(post);
    setCurrentImageIndex(0);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = "unset";
  };

  const nextImage = () => {
    if (selectedPost && selectedPost.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === selectedPost.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    if (selectedPost && selectedPost.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? selectedPost.images.length - 1 : prev - 1));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">BLOG</h2>
            <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
            <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
              Behind-the-scenes insights, creative processes, and industry perspectives from the world of luxury fashion photography and modeling
            </p>
          </div>

          {/* Featured Post Loading */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded"></div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-20"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                </div>
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6"></div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Blog Grid Loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <article key={i} className="group">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse rounded mb-6"></div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-12"></div>
                  </div>
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-4/5"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
                  </div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">BLOG</h2>
          <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
          <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
            Behind-the-scenes insights, creative processes, and industry perspectives from the world of luxury fashion photography and modeling
          </p>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                <ImageWithFallback
                  src={featuredPost.images[0]?.url || "/placeholder-blog.jpg"}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="bg-black text-white px-3 py-1 text-xs tracking-widest uppercase">Featured</span>
                  <span className="tracking-wider uppercase">{featuredPost.tag || "General"}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-thin tracking-wide text-black leading-tight">{featuredPost.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{featuredPost.content.substring(0, 200)}...</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(featuredPost.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                </div>
                <button
                  onClick={() => openModal(featuredPost)}
                  className="inline-flex items-center space-x-2 text-black hover:text-gray-600 transition-colors duration-300 group"
                >
                  <span className="tracking-wide">Read Article</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blog Grid */}
        {blogPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visiblePosts.map((post) => (
                <article key={post.id} className="group cursor-pointer" onClick={() => openModal(post)}>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-6">
                    <ImageWithFallback
                      src={post.images[0]?.url || "/placeholder-blog.jpg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="tracking-wider uppercase">{post.tag || "General"}</span>
                      <div className="w-px h-3 bg-gray-300"></div>
                      <span>{post.readTime} min read</span>
                    </div>

                    <h3 className="text-xl font-thin tracking-wide text-black leading-tight group-hover:text-gray-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed">{post.content.substring(0, 150)}...</p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* View More Button */}
            {regularPosts.length > 5 && !showAllPosts && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllPosts(true)}
                  className="inline-block bg-black text-white px-8 py-3 tracking-widest text-sm uppercase hover:bg-gray-800 transition-colors duration-300"
                >
                  View More Posts
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No blog posts yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for updates.</p>
          </div>
        )}
      </div>

      {/* Blog Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Close Button */}
          <button onClick={closeModal} className="fixed top-6 right-6 z-10 text-black hover:text-gray-600 transition-colors duration-300">
            <X className="w-8 h-8" />
          </button>

          {/* Modal Content */}
          <div className="w-full min-h-screen">
            {/* Header Image */}
            <div className="relative h-64 md:h-96 lg:h-[600px]  overflow-hidden">
              {selectedPost.images.length > 0 ? (
                <>
                  <ImageWithFallback
                    src={selectedPost.images[currentImageIndex]?.url || "/placeholder-blog.jpg"}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover object-top"
                  />

                  {/* Image Navigation */}
                  {selectedPost.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300 bg-black/20 rounded-full p-2"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-300 bg-black/20 rounded-full p-2"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {selectedPost.images.map((_, index) => (
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
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8 md:p-12 max-w-4xl mx-auto">
              {/* Meta Information */}
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                {selectedPost.featured && <span className="bg-black text-white px-3 py-1 text-xs tracking-widest uppercase">Featured</span>}
                <span className="tracking-wider uppercase">{selectedPost.tag || "General"}</span>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedPost.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{selectedPost.readTime} min read</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-thin tracking-wide text-black leading-tight mb-8">{selectedPost.title}</h1>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                {selectedPost.content.split("\n\n").map((paragraph, index) => {
                  if (paragraph.trim().startsWith("**") && paragraph.trim().endsWith("**")) {
                    // Handle bold headers
                    return (
                      <h3 key={index} className="text-xl font-medium tracking-wide text-black mt-8 mb-4">
                        {paragraph.trim().slice(2, -2)}
                      </h3>
                    );
                  } else if (paragraph.trim()) {
                    // Handle regular paragraphs
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed mb-6">
                        {paragraph.trim()}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Image count indicator */}
              {selectedPost.images.length > 1 && (
                <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-500 text-center">
                  Image {currentImageIndex + 1} of {selectedPost.images.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Blog;
