// src/components/admin/nav/tabs/MessageDetail.tsx
"use client";

import { ArrowLeft, X, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { Message } from "../tables/MessageTable";

interface MessageDetailProps {
  message: Message | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

const MessageDetail = ({ message, onClose, onMarkAsRead, onMarkAsUnread, onDelete, isMobile = false }: MessageDetailProps) => {
  if (!message) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (read: boolean) => {
    return read ? <Badge variant="secondary">Read</Badge> : <Badge variant="default">Unread</Badge>;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      )}

      {/* Desktop header */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Message Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Message content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" />
            <AvatarFallback>
              {message.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold text-lg">{message.subject || "No subject"}</h4>
            <div className="text-sm text-muted-foreground mt-1 space-y-1">
              <div>From: {message.name}</div>
              <div>Email: {message.email}</div>
              <div className="flex items-center space-x-2">
                <span>{formatDate(message.createdAt)}</span>
                {getStatusBadge(message.read)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">Message</h5>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.message}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4 flex items-center justify-between">
        {message.read ? (
          <Button
            variant="outline"
            onClick={() => {
              onMarkAsUnread(message.id);
            }}
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Mark as Unread
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => {
              onMarkAsRead(message.id);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            Mark as Read
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={() => {
            onDelete(message.id);
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Message
        </Button>
      </div>
    </div>
  );
};

export default MessageDetail;
