"use client";

import { useState, useEffect } from "react";
import { Mail, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface ContactInfo {
  email: string;
  phone: string | null;
  whatsapp: string | null;
  location: string | null;
  workDays: string | null;
  workHours: string | null;
}

interface SocialLink {
  id: string;
  name: string;
  link: string;
}

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch contact data on component mount
  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const [contactRes, socialRes] = await Promise.all([fetch("/api/contact"), fetch("/api/social-links")]);

      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContactInfo(contactData.contactInfo);
      }

      if (socialRes.ok) {
        const socialData = await socialRes.json();
        setSocialLinks(socialData.socialLinks || []);
      }
    } catch (error) {
      console.error("Error fetching contact data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you within 24 hours.");

        // Reset form on success
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        toast.error(data.error || "Failed to send message. Please try again or contact us directly via WhatsApp.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again or contact us directly via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section id="contact" className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-thin tracking-wider mb-4">CONTACT</h2>
            <div className="w-24 h-px bg-white mx-auto opacity-60 mb-6"></div>
            <p className="text-gray-300 tracking-wide max-w-2xl mx-auto">
              Lets collaborate on creating extraordinary visual stories. Reach out for photography sessions, modeling inquiries, or creative
              partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info Loading */}
            <div>
              <div className="h-8 bg-gray-800 animate-pulse rounded w-48 mb-8"></div>
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-5 h-5 bg-gray-800 rounded animate-pulse"></div>
                    <div>
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-16 mb-1"></div>
                      <div className="h-5 bg-gray-800 animate-pulse rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Loading */}
            <div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-800 animate-pulse rounded"></div>
                ))}
                <div className="h-12 bg-gray-700 animate-pulse rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-24 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-thin tracking-wider mb-4">CONTACT</h2>
          <div className="w-24 h-px bg-white mx-auto opacity-60 mb-6"></div>
          <p className="text-gray-300 tracking-wide max-w-2xl mx-auto">
            Lets collaborate on creating extraordinary visual stories. Reach out for photography sessions, modeling inquiries, or creative
            partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-thin tracking-wide mb-8">GET IN TOUCH</h3>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <a
                  href={`mailto:${contactInfo?.email || "contact@example.com"}`}
                  className="flex items-center space-x-4 hover:text-gray-300 transition-colors duration-300 group"
                >
                  <Mail className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                  <div>
                    <p className="text-sm text-gray-400 tracking-wide">EMAIL</p>
                    <p className="text-white">{contactInfo?.email || "contact@example.com"}</p>
                  </div>
                </a>
              </div>

              {contactInfo?.phone && (
                <div className="flex items-center space-x-4">
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center space-x-4 hover:text-gray-300 transition-colors duration-300 group"
                  >
                    <Phone className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-400 tracking-wide">PHONE</p>
                      <p className="text-white">{contactInfo.phone}</p>
                    </div>
                  </a>
                </div>
              )}

              {contactInfo?.whatsapp && (
                <div className="flex items-center space-x-4">
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 hover:text-gray-300 transition-colors duration-300 group"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
                    <div>
                      <p className="text-sm text-gray-400 tracking-wide">WHATSAPP</p>
                      <p className="text-white">{contactInfo.whatsapp}</p>
                      <p className="text-xs text-gray-500">Quick chat and instant responses</p>
                    </div>
                  </a>
                </div>
              )}

              {contactInfo?.location && (
                <div className="flex items-center space-x-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400 tracking-wide">LOCATION</p>
                    <p className="text-white">{contactInfo.location}</p>
                  </div>
                </div>
              )}

              {(contactInfo?.workDays || contactInfo?.workHours) && (
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400 tracking-wide">HOURS</p>
                    <p className="text-white">{contactInfo.workDays || "Monday - Friday"}</p>
                    {contactInfo.workHours && <p className="text-gray-300 text-sm">{contactInfo.workHours}</p>}
                  </div>
                </div>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-12">
                <h4 className="text-lg tracking-wide mb-4">FOLLOW</h4>
                <div className="flex space-x-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm tracking-widest"
                    >
                      {link.name.toUpperCase()}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white pb-3 placeholder-gray-500 text-white transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white pb-3 placeholder-gray-500 text-white transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white pb-3 placeholder-gray-500 text-white transition-colors duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-b border-gray-600 focus:border-white pb-3 placeholder-gray-500 text-white transition-colors duration-300 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-block bg-white text-black px-8 py-3 tracking-widest text-sm uppercase hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>

            <div className="mt-8 p-4 bg-gray-900 border border-gray-800">
              <p className="text-sm text-gray-400 text-center">
                <span className="block">Response Time</span>
                <span className="text-white">Within 24 hours</span>
                <span className="block text-xs mt-1">{contactInfo?.whatsapp ? "or faster on WhatsApp" : "We'll respond as soon as possible"}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
