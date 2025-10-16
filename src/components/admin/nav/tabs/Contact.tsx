// src/components/admin/nav/tabs/Contact.tsx
"use client";

import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { toast } from "sonner";
import { ContactInfoData, SocialLinkData } from "../WebsiteSettings";

interface ContactProps {
  contactInfo: ContactInfoData;
  socialLinks: SocialLinkData[];
  onUpdateContactInfo: (data: Partial<ContactInfoData>) => Promise<{ success: boolean; error?: string }>;
  onUpdateSocialLinks: (links: SocialLinkData[]) => Promise<{ success: boolean; error?: string }>;
  onRefreshData: () => void;
}

const Contact = ({ contactInfo, socialLinks, onUpdateContactInfo, onUpdateSocialLinks, onRefreshData }: ContactProps) => {
  const [contactData, setContactData] = useState({
    email: contactInfo.email || "",
    phone: contactInfo.phone || "",
    whatsapp: contactInfo.whatsapp || "",
    location: contactInfo.location || "",
    workDays: contactInfo.workDays || "",
    workHours: contactInfo.workHours || "",
  });

  const [links, setLinks] = useState<SocialLinkData[]>(socialLinks || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setContactData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveContact = async () => {
    if (!contactData.email) {
      toast.error("Email is required.");
      return;
    }

    setIsLoading(true);

    try {
      // Save contact info
      const contactResult = await onUpdateContactInfo(contactData);

      if (contactResult.success) {
        // Only save social links if there are any
        if (links.length > 0) {
          const socialResult = await onUpdateSocialLinks(links);

          if (!socialResult.success) {
            toast.error(socialResult.error || "Failed to update social links");
            setIsLoading(false);
            return;
          }
        }

        toast.success("Contact information updated successfully!");
        onRefreshData();
      } else {
        toast.error(contactResult.error || "Failed to update contact information");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Save contact error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialLink = () => {
    const newLink: SocialLinkData = {
      id: `temp-${Date.now()}`,
      name: "",
      link: "",
    };
    setLinks((prev) => [...prev, newLink]);
  };

  const removeSocialLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  const updateSocialLink = (id: string, field: "name" | "link", value: string) => {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
  };

  const isValidSocialLink = (link: SocialLinkData) => {
    return link.name.trim() !== "" && link.link.trim() !== "";
  };

  const validSocialLinks = links.filter(isValidSocialLink);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Contact Information</CardTitle>
          <CardDescription className="text-muted-foreground">Update your contact details and business hours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={contactData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={contactData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={isLoading}
                className="w-full"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp Number
              </Label>
              <Input
                id="whatsapp"
                value={contactData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                disabled={isLoading}
                className="w-full"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                value={contactData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                disabled={isLoading}
                className="w-full"
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workDays" className="text-sm font-medium">
                Work Days
              </Label>
              <Input
                id="workDays"
                value={contactData.workDays}
                onChange={(e) => handleInputChange("workDays", e.target.value)}
                disabled={isLoading}
                className="w-full"
                placeholder="Monday - Friday"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workHours" className="text-sm font-medium">
                Work Hours
              </Label>
              <Input
                id="workHours"
                value={contactData.workHours}
                onChange={(e) => handleInputChange("workHours", e.target.value)}
                disabled={isLoading}
                className="w-full"
                placeholder="9:00 AM - 6:00 PM"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Social Media Links</CardTitle>
              <CardDescription className="text-muted-foreground">Add links to your social media profiles (optional)</CardDescription>
            </div>
            <Button onClick={addSocialLink} disabled={isLoading} variant="outline" size="sm" className="whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Add Social Link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg bg-card">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${link.id}`} className="text-xs font-medium">
                      Platform Name
                    </Label>
                    <Input
                      id={`name-${link.id}`}
                      placeholder="e.g., Instagram, Twitter, LinkedIn"
                      value={link.name}
                      onChange={(e) => updateSocialLink(link.id, "name", e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`link-${link.id}`} className="text-xs font-medium">
                      Profile URL
                    </Label>
                    <Input
                      id={`link-${link.id}`}
                      placeholder="https://..."
                      value={link.link}
                      onChange={(e) => updateSocialLink(link.id, "link", e.target.value)}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeSocialLink(link.id)} disabled={isLoading} className="mt-2 sm:mt-0 sm:ml-2">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No social links added yet.</p>
              <p className="text-sm">Click Add Social Link to get started.</p>
            </div>
          )}

          {links.length > 0 && validSocialLinks.length === 0 && (
            <div className="text-center text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              Please fill in both platform name and URL for social links to save them.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button onClick={handleSaveContact} disabled={isLoading} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Contact Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Contact;
