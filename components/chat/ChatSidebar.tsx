"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatService } from "@/lib/chatService";
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

  const loadSessions = async () => {
    const savedSessions = await chatService.getChatSessions();
    setSessions(savedSessions);
  };

  const deleteSession = async (id: string) => {
    await chatService.deleteChatSession(id);
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
    <div className="flex flex-col bg-muted/30 border-r w-80">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Chat History</h2>
          <Button
            onClick={onNewSession}
            size="sm"
            variant="outline"
            className="p-0 w-8 h-8"
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sessions.length === 0 ? (
          <div className="py-8 text-muted-foreground text-center">
            <MessageSquare size={48} className="opacity-50 mx-auto mb-4" />
            <p className="text-sm">No chat sessions yet</p>
            <p className="mt-1 text-xs">
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
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {truncateTitle(session.title)}
                    </h3>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {formatDate(session.updatedAt)}
                    </p>
                    <p className="text-muted-foreground text-xs">
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
                    className="p-0 w-6 h-6 text-muted-foreground hover:text-destructive"
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
