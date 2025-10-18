// src/components/admin/nav/tables/MessageTable.tsx
"use client";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
}

interface MessageTableProps {
  messages: Message[];
  selectedMessage: Message | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onMessageSelect: (message: Message) => void;
  onMessageDelete: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const MessageTable = ({
  messages,
  selectedMessage,
  searchTerm,
  onSearchChange,
  onMessageSelect,
  onMessageDelete,
  onMarkAsRead,
}: MessageTableProps) => {
  const filteredMessages = messages.filter(
    (message) =>
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.subject && message.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (read: boolean) => {
    return read ? <Badge variant="secondary">Read</Badge> : <Badge variant="default">Unread</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleMessageClick = (message: Message) => {
    onMessageSelect(message);
    if (!message.read) {
      onMarkAsRead(message.id);
    }
  };

  return (
    <div className="flex-1">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Contact Messages</h2>
            <p className="text-muted-foreground">Messages from your website contact form</p>
          </div>
          <div className="w-72">
            <Input placeholder="Search messages..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
        </div>

        <div className="border ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Subject</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow
                  key={message.id}
                  className={`cursor-pointer ${
                    !message.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  } ${selectedMessage?.id === message.id ? "bg-muted" : ""}`}
                  onClick={() => handleMessageClick(message)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-xs">
                          {message.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className={`font-medium ${!message.read ? "font-semibold" : ""}`}>{message.name}</div>
                        <div className="text-sm text-muted-foreground">{message.email}</div>
                        {/* Show date and subject on mobile */}
                        <div className="md:hidden text-xs text-muted-foreground mt-1">
                          <div className="flex items-center space-x-2">
                            <span>
                              {formatDate(message.createdAt)} • {formatTime(message.createdAt)}
                            </span>
                            {getStatusBadge(message.read)}
                          </div>
                          <div className="lg:hidden mt-1 font-medium">{message.subject || "No subject"}</div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm">
                      <div>{formatDate(message.createdAt)}</div>
                      <div className="text-muted-foreground">{formatTime(message.createdAt)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div>
                      <div className={`${!message.read ? "font-semibold" : "font-medium"}`}>{message.subject || "No subject"}</div>
                      <div className="text-sm text-muted-foreground mt-1">{getStatusBadge(message.read)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMessageClick(message);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageDelete(message.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No messages found.</p>
            <p className="text-sm mt-1">{searchTerm ? "Try adjusting your search terms" : "Messages from your contact form will appear here"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageTable;
