"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatStorage } from "@/lib/storage";
import { ChatSession } from "@/types";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatSidebarProps {
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
  currentSessionId?: string;
  refreshTrigger?: number; // Add this prop to trigger refresh
}

export function ChatSidebar({
  onSessionSelect,
  onNewSession,
  currentSessionId,
  refreshTrigger,
}: ChatSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, [refreshTrigger]); // Add refreshTrigger to dependency array

  const loadSessions = () => {
    const savedSessions = chatStorage.getChatSessions();
    setSessions(savedSessions);
  };

  const deleteSession = (id: string) => {
    chatStorage.deleteChatSession(id);
    loadSessions();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    return title.length > maxLength
      ? title.substring(0, maxLength) + "..."
      : title;
  };

  return (
    <div className="w-80 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button
            onClick={onNewSession}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">No chat sessions yet</p>
            <p className="text-xs mt-1">
              Start a new conversation to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                  currentSessionId === session.id
                    ? "bg-muted border-primary"
                    : ""
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {truncateTitle(session.title)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(session.updatedAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.messages.length} messages
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
