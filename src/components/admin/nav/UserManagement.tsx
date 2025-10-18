// src/components/admin/nav/UserManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import { toast } from "sonner";
import MessageTable, { Message } from "./tables/MessageTable";
import MessageDetail from "./panels/MessageDetail";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

const UserManagement = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch messages from API
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/admin/messages", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)));
        setSelectedMessage((prev) => (prev?.id === id ? { ...prev, read: true } : prev));
      } else {
        throw new Error("Failed to mark as read");
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
      toast.error("Failed to mark message as read");
    }
  };

  const markAsUnread = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/unread`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: false } : msg)));
        setSelectedMessage((prev) => (prev?.id === id ? { ...prev, read: false } : prev));
      } else {
        throw new Error("Failed to mark as unread");
      }
    } catch (err) {
      console.error("Error marking message as unread:", err);
      toast.error("Failed to mark message as unread");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
          setShowDetailPanel(false);
        }
        toast.success("Message deleted successfully!");
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedMessage(null);
  };

  // Calculate message statistics
  const messageStats = {
    total: messages.length,
    unread: messages.filter((m) => !m.read).length,
    read: messages.filter((m) => m.read).length,
    thisWeek: messages.filter((m) => {
      const messageDate = new Date(m.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return messageDate > weekAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        <Button disabled size="sm">
          <Spinner />
          Loading...
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="space-y-6 mb-6">
        <div>
          <h1 className="text-3xl font-thin tracking-wider">Messages</h1>
          <p className="text-muted-foreground">Manage contact form messages from clients</p>
        </div>

        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{messageStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread</p>
                  <p className="text-2xl font-bold">{messageStats.unread}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Read</p>
                  <p className="text-2xl font-bold">{messageStats.read}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{messageStats.thisWeek}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Mobile Detail Panel (Full Screen Overlay) */}
        {showDetailPanel && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <MessageDetail
              message={selectedMessage}
              onClose={closeDetailPanel}
              onMarkAsRead={markAsRead}
              onMarkAsUnread={markAsUnread}
              onDelete={deleteMessage}
              isMobile={true}
            />
          </div>
        )}

        {/* Messages Table */}
        <div className={`flex-1 ${showDetailPanel ? "hidden lg:block lg:w-1/2" : ""}`}>
          <MessageTable
            messages={messages}
            selectedMessage={selectedMessage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onMessageSelect={openMessage}
            onMessageDelete={deleteMessage}
            onMarkAsRead={markAsRead}
          />
        </div>

        {/* Desktop Detail Panel (Right Side) */}
        {showDetailPanel && selectedMessage && (
          <div className="hidden lg:block w-1/2 ml-4">
            <div className="border  h-full bg-card">
              <MessageDetail
                message={selectedMessage}
                onClose={closeDetailPanel}
                onMarkAsRead={markAsRead}
                onMarkAsUnread={markAsUnread}
                onDelete={deleteMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
