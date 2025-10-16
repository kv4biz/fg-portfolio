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

export interface Service {
  id: string;
  title: string;
  description: string;
  items: ServiceItem[];
  userId: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  serviceId: string;
  text: string;
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

const Service = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; serviceId: string | null; serviceTitle: string }>({
    isOpen: false,
    serviceId: null,
    serviceTitle: "",
  });

  // Form state for creating/editing
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    items: { text: string }[];
  }>({
    title: "",
    description: "",
    items: [{ text: "" }],
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      } else {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch services");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      toast.error("Failed to load services");
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    const validItems = formData.items.filter((item) => item.text.trim() !== "");
    if (validItems.length === 0) {
      toast.error("At least one service item with text is required.");
      return;
    }

    setIsLoading(true);
    try {
      const method = selectedService ? "PUT" : "POST";
      const url = selectedService ? `/api/admin/services/${selectedService.id}` : "/api/admin/services";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          items: validItems,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Service ${selectedService ? "updated" : "created"} successfully!`);
        closeDetailPanel();
        fetchServices();
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${selectedService ? "update" : "create"} service`);
      }
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error(`Failed to ${selectedService ? "update" : "create"} service`);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      serviceId: id,
      serviceTitle: title,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      serviceId: null,
      serviceTitle: "",
    });
  };

  const deleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Service deleted successfully!");
        if (selectedService?.id === id) {
          closeDetailPanel();
        }
        closeDeleteDialog();
        fetchServices();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete service");
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service");
    }
  };

  const openDetailPanel = (service: Service | null = null) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        title: service.title,
        description: service.description,
        items: service.items.length > 0 ? service.items.map((item) => ({ text: item.text })) : [{ text: "" }],
      });
    } else {
      setSelectedService(null);
      setFormData({
        title: "",
        description: "",
        items: [{ text: "" }],
      });
    }
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedService(null);
    setFormData({
      title: "",
      description: "",
      items: [{ text: "" }],
    });
  };

  const addServiceItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { text: "" }],
    }));
  };

  const updateServiceItem = (index: number, text: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, text } : item)),
    }));
  };

  const removeServiceItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => deleteDialog.serviceId && deleteService(deleteDialog.serviceId)}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteDialog.serviceTitle}"? This action cannot be undone.`}
      />

      {/* Service Management Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>Manage your services and service items</CardDescription>
            </div>
            <Button onClick={() => openDetailPanel()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{service.items.length} items</div>
                  </TableCell>
                  <TableCell>{new Date(service.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetailPanel(service)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(service.id, service.title)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No services yet. Click Add Service to get started.
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
          <CardDescription>How your services section will appear on the website</CardDescription>
        </CardHeader>
        <CardContent>
          <section className="bg-gray-50 py-16 lg:py-20">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-xl transition-shadow duration-300 border-gray-200 bg-white rounded-none">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-thin tracking-wide text-black">{service.title}</CardTitle>
                      <CardDescription className="text-gray-600 tracking-wide leading-relaxed">{service.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-3">
                        {service.items.map((item, index) => (
                          <li key={item.id || index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-black rounded-full flex-shrink-0" />
                            <span className="text-sm text-gray-600 tracking-wide">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {services.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No services yet.</p>
                  <p className="text-sm">Add some services to see them here.</p>
                </div>
              )}
            </div>
          </section>

          {/* Preview Notes */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Preview Notes:</strong> This shows how your services section will appear on the actual website. The preview includes a header
              section and a grid of service cards with descriptions and feature lists.
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
                <CardTitle>{selectedService ? "Edit Service" : "Add Service"}</CardTitle>
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
                  placeholder="Enter service title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Enter service description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Service Items *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={item.text} onChange={(e) => updateServiceItem(index, e.target.value)} placeholder={`Service item ${index + 1}`} />
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceItem(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">List the key features or items included in this service. Empty items will be ignored.</p>
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

export default Service;
