"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, X } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { toast } from "sonner";

export interface Testimonial {
  id: string;
  name: string;
  job: string | null;
  review: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Alert Dialog Component
const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-start space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-destructive" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <div className="border-t p-4 flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
};

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

  // Generate a consistent background color based on name
  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-amber-500",
      "bg-indigo-500",
      "bg-rose-500",
      "bg-emerald-500",
      "bg-violet-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`${className} ${getBackgroundColor(name)} flex items-center justify-center text-white font-medium`}>{getInitials(name)}</div>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; testimonialId: string | null; testimonialName: string }>({
    isOpen: false,
    testimonialId: null,
    testimonialName: "",
  });

  // Form state for creating/editing
  const [formData, setFormData] = useState<{
    name: string;
    job: string;
    review: string;
  }>({
    name: "",
    job: "",
    review: "",
  });

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch testimonials");
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      toast.error("Failed to load testimonials");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!formData.review.trim()) {
      toast.error("Review is required.");
      return;
    }

    setIsLoading(true);
    try {
      const method = selectedTestimonial ? "PUT" : "POST";
      const url = selectedTestimonial ? `/api/admin/testimonials/${selectedTestimonial.id}` : "/api/admin/testimonials";

      const payload = {
        name: formData.name.trim(),
        job: formData.job.trim() || null,
        review: formData.review.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Testimonial ${selectedTestimonial ? "updated" : "created"} successfully!`);
        closeDetailPanel();
        fetchTestimonials();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${selectedTestimonial ? "update" : "create"} testimonial`);
      }
    } catch (err) {
      console.error("Error saving testimonial:", err);
      toast.error(`Failed to ${selectedTestimonial ? "update" : "create"} testimonial`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({
      isOpen: true,
      testimonialId: id,
      testimonialName: name,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      testimonialId: null,
      testimonialName: "",
    });
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Testimonial deleted successfully!");
        if (selectedTestimonial?.id === id) {
          closeDetailPanel();
        }
        closeDeleteDialog();
        fetchTestimonials();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete testimonial");
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      toast.error("Failed to delete testimonial");
    }
  };

  const openDetailPanel = (testimonial: Testimonial | null = null) => {
    if (testimonial) {
      setSelectedTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        job: testimonial.job || "",
        review: testimonial.review,
      });
    } else {
      setSelectedTestimonial(null);
      setFormData({
        name: "",
        job: "",
        review: "",
      });
    }
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedTestimonial(null);
    setFormData({
      name: "",
      job: "",
      review: "",
    });
  };

  // Carousel functions
  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.testimonialId && deleteTestimonial(deleteDialog.testimonialId)}
        title="Delete Testimonial"
        description={`Are you sure you want to delete testimonial from "${deleteDialog.testimonialName}"? This action cannot be undone.`}
      />

      {/* Testimonial Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Testimonial Management</CardTitle>
              <CardDescription>Manage client testimonials and reviews</CardDescription>
            </div>
            <Button onClick={() => openDetailPanel()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job/Role</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Avatar</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.name}</TableCell>
                  <TableCell>{testimonial.job || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{testimonial.review}</TableCell>
                  <TableCell>
                    <AvatarWithInitials name={testimonial.name} className="w-8 h-8 rounded-full text-xs" />
                  </TableCell>
                  <TableCell>{new Date(testimonial.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetailPanel(testimonial)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(testimonial.id, testimonial.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {testimonials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No testimonials yet. Click Add Testimonial to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your testimonials section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
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
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                        aria-label="Previous testimonial"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextTestimonial}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
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
                            index === currentIndex ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
                          }`}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No testimonials yet.</p>
                  <p className="text-sm">Add some testimonials to see them here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Preview Notes */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 ">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your testimonials section will appear on the actual website. The preview includes a
              carousel with automatic rotation, navigation arrows, and pagination dots. Testimonials automatically rotate every 5 seconds. Avatars are
              automatically generated using the persons initials.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel for Creating/Editing */}
      {showDetailPanel && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedTestimonial ? "Edit Testimonial" : "Add Testimonial"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeDetailPanel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter client name"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Avatar preview:</span>
                  <AvatarWithInitials name={formData.name || "Name"} className="w-6 h-6 rounded-full text-[10px]" />
                  <span>
                    {formData.name
                      ? formData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "??"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job">Job/Role</Label>
                <Input
                  id="job"
                  value={formData.job}
                  onChange={(e) => setFormData((prev) => ({ ...prev, job: e.target.value }))}
                  placeholder="e.g., CEO, Marketing Director, Bride"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Review *</Label>
                <Textarea
                  id="review"
                  value={formData.review}
                  onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
                  rows={4}
                  placeholder="Enter client testimonial/review"
                  className="resize-none"
                />
              </div>
            </CardContent>
            <div className="border-t p-4 flex space-x-2">
              <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={closeDetailPanel}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
