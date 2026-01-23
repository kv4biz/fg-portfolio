/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/nav/tabs/Portfolio.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Image as ImageIcon, Video, Upload, X, AlertTriangle } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { toast } from "sonner";
import Image from "next/image";

export interface PortfolioItem {
  id: string;
  type: "PHOTOGRAPHY" | "CINEMATOGRAPHY";
  title: string;
  category: string | null;
  description: string | null;
  images: PortfolioImage[];
  videoUrl: string | null;
  posterUrl: string | null;
  createdAt: string;
}

export interface PortfolioImage {
  id: string;
  url: string;
  mediaId?: string;
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
            <AlertTriangle className="w-5 h-5 text-destructive" />
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

const Portfolio = () => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState<string | null>(null);
  const [tempImages, setTempImages] = useState<{ id: string; url: string }[]>([]);
  const [uploadingTemp, setUploadingTemp] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId: string | null; itemTitle: string }>({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });

  const [activeTab, setActiveTab] = useState<"photography" | "cinematography">("photography");
  const [activePhotoFilter, setActivePhotoFilter] = useState<string>("All");

  // Form state for creating/editing
  const [formData, setFormData] = useState<Partial<PortfolioItem>>({
    type: "PHOTOGRAPHY",
    title: "",
    category: "",
    description: "",
    videoUrl: "",
    posterUrl: "",
    images: [],
  });

  // Fetch portfolio items on component mount
  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const res = await fetch("/api/admin/portfolio", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setPortfolioItems(data.portfolioItems || []);
      } else {
        throw new Error("Failed to fetch portfolio items");
      }
    } catch (err) {
      console.error("Error fetching portfolio items:", err);
      toast.error("Failed to load portfolio items");
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required.");
      return;
    }

    if (!formData.type) {
      toast.error("Type is required.");
      return;
    }

    setIsLoading(true);
    try {
      const method = selectedItem ? "PUT" : "POST";
      const url = selectedItem ? `/api/admin/portfolio/${selectedItem.id}` : "/api/admin/portfolio";

      // For new photography items with temp images, we need to create the portfolio first
      // then the temp images will be moved automatically by the backend
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Portfolio item ${selectedItem ? "updated" : "created"} successfully!`);

        // Clear temp images after successful creation
        if (!selectedItem && formData.type === "PHOTOGRAPHY") {
          setTempImages([]);
        }

        closeDetailPanel();
        fetchPortfolioItems();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${selectedItem ? "update" : "create"} portfolio item`);
      }
    } catch (err) {
      console.error("Error saving portfolio item:", err);
      toast.error(`Failed to ${selectedItem ? "update" : "create"} portfolio item`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      itemId: id,
      itemTitle: title,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      itemId: null,
      itemTitle: "",
    });
  };

  const deleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Portfolio item deleted successfully!");
        if (selectedItem?.id === id) {
          closeDetailPanel();
        }
        closeDeleteDialog();
        fetchPortfolioItems();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete portfolio item");
      }
    } catch (err) {
      console.error("Error deleting portfolio item:", err);
      toast.error("Failed to delete portfolio item");
    }
  };

  const openDetailPanel = (item: PortfolioItem | null = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        ...item,
        images: item.images || [],
      });
      setTempImages([]);
    } else {
      setSelectedItem(null);
      setFormData({
        type: "PHOTOGRAPHY",
        title: "",
        category: "",
        description: "",
        videoUrl: "",
        posterUrl: "",
        images: [],
      });
    }
    setShowDetailPanel(true);
  };

  const closeDetailPanel = async () => {
    // Clean up temp images if user cancels without saving
    if (tempImages.length > 0 && !selectedItem) {
      try {
        await fetch("/api/admin/portfolio/temp", {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.warn("Failed to cleanup temp images:", err);
      }
    }
    
    setShowDetailPanel(false);
    setSelectedItem(null);
    setFormData({
      type: "PHOTOGRAPHY",
      title: "",
      category: "",
      description: "",
      videoUrl: "",
      posterUrl: "",
      images: [],
    });
    setTempImages([]);
  };

  const handleTempImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingTemp(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/admin/portfolio/temp", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newTempImages = data.uploadedMedia.map((media: any) => ({
          id: media.id,
          url: media.url,
          // bytes is now a string, but we don't need it for display
        }));
        setTempImages((prev) => [...prev, ...newTempImages]);
        toast.success(`Uploaded ${files.length} temporary image(s)`);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (err) {
      console.error("Temp image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploadingTemp(false);
      event.target.value = "";
    }
  };

  const removeTempImage = (index: number) => {
    setTempImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setImageLoading("uploading");

    try {
      // For cinematography, ensure only one image
      if (formData.type === "CINEMATOGRAPHY" && formData.images && formData.images.length >= 1) {
        toast.error("Cinematography portfolio can only have one poster image");
        setImageLoading(null);
        return;
      }

      const portfolioId = selectedItem?.id;
      if (!portfolioId) {
        toast.error("Please save the portfolio item first before uploading Poster");
        setImageLoading(null);
        return;
      }

      // Use the dedicated portfolio image upload endpoint
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      uploadFormData.append("portfolioId", portfolioId);

      const uploadRes = await fetch("/api/admin/portfolio/image", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      });

      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const newImage = uploadData.image;

        setFormData((prev) => ({
          ...prev,
          images: [...(prev.images || []), newImage],
        }));
        toast.success("Portfolio image uploaded successfully!");
      } else {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setImageLoading(null);
      event.target.value = "";
    }
  };

  const removeImage = async (imageId: string) => {
    try {
      const deleteRes = await fetch(`/api/admin/portfolio/image?imageId=${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (deleteRes.ok) {
        setFormData((prev) => ({
          ...prev,
          images: prev.images?.filter((img) => img.id !== imageId) || [],
        }));
        toast.success("Image removed successfully!");
      } else {
        const errorData = await deleteRes.json();
        throw new Error(errorData.error || "Delete failed");
      }
    } catch (err) {
      console.error("Image delete error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to remove image");
    }
  };

  // Filter portfolio items for preview
  const photographyItems = portfolioItems.filter((item) => item.type === "PHOTOGRAPHY");
  const cinematographyItems = portfolioItems.filter((item) => item.type === "CINEMATOGRAPHY");

  const photoCategories = ["All", ...Array.from(new Set(photographyItems.filter((item) => item.category).map((item) => item.category!)))];

  const filteredPhotography = activePhotoFilter === "All" ? photographyItems : photographyItems.filter((item) => item.category === activePhotoFilter);

  const visiblePhotography = filteredPhotography.slice(0, 6);
  const visibleCinematography = cinematographyItems.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.itemId && deleteItem(deleteDialog.itemId)}
        title="Delete Portfolio Item"
        description={`Are you sure you want to delete "${deleteDialog.itemTitle}"? This action cannot be undone and will also delete all associated images.`}
      />

      {/* Portfolio Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Management</CardTitle>
              <CardDescription>Manage your photography and cinematography portfolio items</CardDescription>
            </div>
            <Button onClick={() => openDetailPanel()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Media</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {portfolioItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "PHOTOGRAPHY" ? "default" : "secondary"}>{item.type.toLowerCase()}</Badge>
                  </TableCell>
                  <TableCell>{item.category || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {item.type === "PHOTOGRAPHY" ? (
                        <>
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">{item.images.length} images</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Video</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetailPanel(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(item.id, item.title)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {portfolioItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No portfolio items yet. Click Add Portfolio Item to get started.
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
          <CardDescription>How your portfolio section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-thin tracking-wider text-black mb-4">PORTFOLIO</h2>
              <div className="w-20 h-px bg-black mx-auto opacity-60 mb-6"></div>
              <p className="text-gray-600 tracking-wide max-w-2xl mx-auto text-sm">
                A curated selection of photography and cinematography work, showcasing elegance and sophistication across various luxury projects
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="flex bg-white border border-gray-200  overflow-hidden">
                <button
                  onClick={() => setActiveTab("photography")}
                  className={`px-6 py-2 tracking-widest text-xs uppercase transition-colors duration-300 ${
                    activeTab === "photography" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                  }`}
                >
                  Photography
                </button>
                <button
                  onClick={() => setActiveTab("cinematography")}
                  className={`px-6 py-2 tracking-widest text-xs uppercase transition-colors duration-300 ${
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
                {/* Photography Filters */}
                {photoCategories.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {photoCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setActivePhotoFilter(category)}
                        className={`px-4 py-1 tracking-wide text-xs transition-colors duration-300 ${
                          activePhotoFilter === category ? "bg-black text-white" : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Photography Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {visiblePhotography.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-500">
                      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                        {item.images[0] ? (
                          <Image
                            width={1000}
                            height={1000}
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-xs tracking-widest uppercase opacity-80 mb-1">{item.category}</p>
                          <h3 className="text-sm tracking-wide mb-1">{item.title}</h3>
                          {item.description && <p className="text-xs opacity-90 line-clamp-2">{item.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {visiblePhotography.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No photography items yet.</p>
                    <p className="text-sm">Add some photography portfolio items to see them here.</p>
                  </div>
                )}
              </>
            )}

            {/* Cinematography Tab */}
            {activeTab === "cinematography" && (
              <>
                {/* Cinematography Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {visibleCinematography.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-500">
                      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                        {item.images[0] ? (
                          <Image
                            width={1000}
                            height={1000}
                            src={item.images[0].url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                          <h3 className="text-sm tracking-wide mb-1">{item.title}</h3>
                          {item.description && <p className="text-xs opacity-90 line-clamp-2">{item.description}</p>}
                        </div>
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20  flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                          <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-0.5"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {visibleCinematography.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No cinematography items yet.</p>
                    <p className="text-sm">Add some cinematography portfolio items to see them here.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview Notes */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 ">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your portfolio section will appear on the actual website. The preview includes tab
              navigation between photography and cinematography, category filters for photography, and hover effects with image overlays. Items are
              limited to 6 for photography and 4 for cinematography in this preview.
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
                <CardTitle>{selectedItem ? "Edit Portfolio Item" : "Add Portfolio Item"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeDetailPanel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: "PHOTOGRAPHY" | "CINEMATOGRAPHY") => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHOTOGRAPHY">Photography</SelectItem>
                    <SelectItem value="CINEMATOGRAPHY">Cinematography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter portfolio item title"
                  disabled={!!selectedItem} // Title cannot be updated after creation
                />
                {selectedItem && <p className="text-xs text-muted-foreground">Title cannot be changed after creation</p>}
              </div>
              {formData.type === "PHOTOGRAPHY" && (
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Fashion, Portrait, Commercial"
                  />
                </div>
              )}
              {formData.type === "CINEMATOGRAPHY" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Enter portfolio item description"
                />
              </div>
              <div className="space-y-2">
                <Label>{formData.type === "CINEMATOGRAPHY" ? "Poster" : "Images"}</Label>

                {/* Temporary upload for new photography items */}
                {!selectedItem && formData.type === "PHOTOGRAPHY" && (
                  <div className="border-2 border-dashed border-gray-300  p-4 text-center">
                    <input
                      type="file"
                      id="temp-image-upload"
                      accept="image/*"
                      onChange={handleTempImageUpload}
                      className="hidden"
                      multiple
                      disabled={uploadingTemp}
                    />
                    <Label htmlFor="temp-image-upload">
                      <Button variant="outline" asChild disabled={uploadingTemp}>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingTemp ? "Uploading..." : "Upload Temporary Images"}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload images temporarily. They will be moved to permanent storage when you save.
                    </p>

                    {/* Temp Image Previews */}
                    {tempImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                        {tempImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <Image width={1000} height={1000} src={image.url} alt={`Temp ${index + 1}`} className="w-full h-32 object-cover " />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeTempImage(index)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Regular image upload for existing items */}
                {(selectedItem || formData.type === "CINEMATOGRAPHY") && (
                  <div className="border-2 border-dashed border-gray-300  p-4 text-center">
                    <input
                      type="file"
                      id="portfolio-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!!imageLoading}
                    />
                    <Label htmlFor="portfolio-image-upload">
                      <Button variant="outline" asChild disabled={!!imageLoading}>
                        <span>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          {imageLoading ? "Uploading..." : formData.type === "CINEMATOGRAPHY" ? "Upload Poster" : "Upload Image"}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formData.type === "CINEMATOGRAPHY"
                        ? "Upload poster image (JPG, PNG, or WebP recommended. Max size 10MB)."
                        : "JPG, PNG, or WebP recommended. Max size 10MB."}
                    </p>
                  </div>
                )}

                {/* Image Previews */}
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {formData.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <Image width={1000} height={1000} src={image.url} alt="Preview" className="w-full h-32 object-cover" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(image.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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

export default Portfolio;
