/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/admin/nav/tabs/Blog.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Image as ImageIcon, Upload, X, Calendar, Clock, Star } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Switch } from "../../../ui/switch";
import { toast } from "sonner";
import Image from "next/image";

export interface BlogItem {
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

export interface BlogImage {
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

const Blog = () => {
  const [blogItems, setBlogItems] = useState<BlogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<BlogItem | null>(null);
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

  // Form state for creating/editing
  const [formData, setFormData] = useState<Partial<BlogItem>>({
    title: "",
    tag: "",
    readTime: 3,
    content: "",
    featured: false,
    images: [],
  });

  // Fetch blog items on component mount
  useEffect(() => {
    fetchBlogItems();
  }, []);

  const fetchBlogItems = async () => {
    try {
      const res = await fetch("/api/admin/blog", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setBlogItems(data.blogs || []);
      } else {
        throw new Error("Failed to fetch blog items");
      }
    } catch (err) {
      console.error("Error fetching blog items:", err);
      toast.error("Failed to load blog items");
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Title is required.");
      return;
    }

    if (!formData.content) {
      toast.error("Content is required.");
      return;
    }

    setIsLoading(true);
    try {
      const method = selectedItem ? "PUT" : "POST";
      const url = selectedItem ? `/api/admin/blog/${selectedItem.id}` : "/api/admin/blog";

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
        toast.success(`Blog ${selectedItem ? "updated" : "created"} successfully!`);

        // Clear temp images after successful creation
        if (!selectedItem) {
          setTempImages([]);
        }

        closeDetailPanel();
        fetchBlogItems();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${selectedItem ? "update" : "create"} blog`);
      }
    } catch (err) {
      console.error("Error saving blog:", err);
      toast.error(`Failed to ${selectedItem ? "update" : "create"} blog`);
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
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Blog deleted successfully!");
        if (selectedItem?.id === id) {
          closeDetailPanel();
        }
        closeDeleteDialog();
        fetchBlogItems();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete blog");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error("Failed to delete blog");
    }
  };

  const openDetailPanel = (item: BlogItem | null = null) => {
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
        title: "",
        tag: "",
        readTime: 3,
        content: "",
        featured: false,
        images: [],
      });
    }
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedItem(null);
    setFormData({
      title: "",
      tag: "",
      readTime: 3,
      content: "",
      featured: false,
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

      const res = await fetch("/api/admin/blog/temp", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newTempImages = data.uploadedMedia.map((media: any) => ({
          id: media.id,
          url: media.url,
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
      const blogId = selectedItem?.id;
      if (!blogId) {
        toast.error("Please save the blog first before uploading images");
        setImageLoading(null);
        return;
      }

      // Use the dedicated blog image upload endpoint
      const uploadFormData = new FormData();
      uploadFormData.append("image", file);
      uploadFormData.append("blogId", blogId);

      const uploadRes = await fetch("/api/admin/blog/image", {
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
        toast.success("Blog image uploaded successfully!");
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
      const deleteRes = await fetch(`/api/admin/blog/image?imageId=${imageId}`, {
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

  // Filter blog items for preview
  const featuredBlog = blogItems.find((item) => item.featured);
  const regularBlogs = blogItems.filter((item) => !item.featured);
  const visibleBlogs = regularBlogs.slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.itemId && deleteItem(deleteDialog.itemId)}
        title="Delete Blog Post"
        description={`Are you sure you want to delete "${deleteDialog.itemTitle}"? This action cannot be undone and will also delete all associated images.`}
      />

      {/* Blog Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blog Management</CardTitle>
              <CardDescription>Manage your blog posts and content</CardDescription>
            </div>
            <Button onClick={() => openDetailPanel()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Blog Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.tag || "-"}</TableCell>
                  <TableCell>
                    {item.featured && (
                      <Badge variant="default" className="bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm">{item.images.length} images</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
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
              {blogItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No blog posts yet. Click Add Blog Post to get started.
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
          <CardDescription>How your blog section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-thin tracking-wider text-black mb-4">BLOG</h2>
              <div className="w-24 h-px bg-black mx-auto opacity-60 mb-6"></div>
              <p className="text-gray-600 tracking-wide max-w-2xl mx-auto">
                Behind-the-scenes insights, creative processes, and industry perspectives from the world of luxury fashion photography and modeling
              </p>
            </div>

            {/* Featured Post */}
            {featuredBlog && (
              <div className="mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {featuredBlog.images[0] ? (
                      <Image
                        width={1000}
                        height={1000}
                        src={featuredBlog.images[0].url}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="bg-black text-white px-3 py-1 text-xs tracking-widest uppercase">Featured</span>
                      <span className="tracking-wider uppercase">{featuredBlog.tag || "General"}</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-thin tracking-wide text-black leading-tight">{featuredBlog.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg line-clamp-3">{featuredBlog.content.substring(0, 200)}...</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(featuredBlog.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredBlog.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogs.map((blog) => (
                <article key={blog.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-6">
                    {blog.images[0] ? (
                      <Image
                        width={1000}
                        height={1000}
                        src={blog.images[0].url}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="tracking-wider uppercase">{blog.tag || "General"}</span>
                      <div className="w-px h-3 bg-gray-300"></div>
                      <span>{blog.readTime} min read</span>
                    </div>

                    <h3 className="text-xl font-thin tracking-wide text-black leading-tight group-hover:text-gray-600 transition-colors duration-300">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 leading-relaxed line-clamp-2">{blog.content.substring(0, 150)}...</p>

                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(blog.date)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {blogItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No blog posts yet.</p>
                <p className="text-sm">Add some blog posts to see them here.</p>
              </div>
            )}
          </div>

          {/* Preview Notes */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your blog section will appear on the actual website. The preview includes a featured post
              section and a grid of regular posts. Only one post can be featured at a time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detail Panel for Creating/Editing */}
      {showDetailPanel && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedItem ? "Edit Blog Post" : "Add Blog Post"}</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeDetailPanel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter blog post title"
                  disabled={!!selectedItem} // Title cannot be updated after creation
                />
                {selectedItem && <p className="text-xs text-muted-foreground">Title cannot be changed after creation</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tag">Tag/Category</Label>
                  <Input
                    id="tag"
                    value={formData.tag || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
                    placeholder="e.g., Photography, Behind the Scenes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="readTime">Read Time (minutes)</Label>
                  <Input
                    id="readTime"
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, readTime: parseInt(e.target.value) || 3 }))}
                    placeholder="3"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.featured || false}
                  onCheckedChange={(checked: boolean) => setFormData((prev: Partial<BlogItem>) => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Post</Label>
                <span className="text-xs text-muted-foreground">(Only one post can be featured at a time)</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  placeholder="Write your blog post content here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Images</Label>

                {/* Temporary upload for new blog posts */}
                {!selectedItem && (
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

                {/* Regular image upload for existing blog posts */}
                {selectedItem && (
                  <div className="border-2 border-dashed border-gray-300  p-4 text-center">
                    <input
                      type="file"
                      id="blog-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={!!imageLoading}
                    />
                    <Label htmlFor="blog-image-upload">
                      <Button variant="outline" asChild disabled={!!imageLoading}>
                        <span>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          {imageLoading ? "Uploading..." : "Upload Image"}
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG, or WebP recommended. Max size 10MB.</p>
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

export default Blog;
