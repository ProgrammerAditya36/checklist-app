"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { chatStorage } from "@/lib/storage";
import { ChatMessage, ChatSession, ChecklistItem } from "@/types";
import { Menu, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatSidebar } from "./ChatSidebar";
import { ImageUpload } from "./ImageUpload";
import { MessageBubble } from "./MessageBubble";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checklistIds, setChecklistIds] = useState<{
    [messageId: string]: string;
  }>({});
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load sessions on mount
  useEffect(() => {
    const sessions = chatStorage.getChatSessions();
    if (sessions.length > 0) {
      // Load the most recent session
      const mostRecent = sessions.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      loadSession(mostRecent);
    } else {
      // Create a new session if none exist
      createNewSession();
    }
  }, []);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentSession(newSession);
    setMessages([]);
    setChecklistIds({});
    chatStorage.saveChatSession(newSession);
    setRefreshTrigger((prev) => prev + 1); // Trigger sidebar refresh
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    // Reconstruct checklistIds from messages for backward compatibility
    const ids: { [messageId: string]: string } = {};
    session.messages.forEach((msg) => {
      if (msg.checklistId) {
        ids[msg.id] = msg.checklistId;
      }
    });
    setChecklistIds(ids);
  };

  const saveCurrentSession = (messagesOverride?: ChatMessage[]) => {
    if (!currentSession) return;
    const sessionMessages = messagesOverride || messages;
    const updatedSession: ChatSession = {
      ...currentSession,
      messages: sessionMessages,
      updatedAt: new Date(),
      title: generateSessionTitle(sessionMessages),
    };
    setCurrentSession(updatedSession);
    chatStorage.saveChatSession(updatedSession);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Debounced save function to prevent too frequent saves during streaming
  const debouncedSave = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveCurrentSession();
      }, 1000); // Wait 1 second after last update
    };
  })();

  const generateSessionTitle = (msgs: ChatMessage[] = messages): string => {
    if (msgs.length === 0) return "New Chat";
    const firstUserMessage = msgs.find((m) => m.role === "user");
    if (firstUserMessage) {
      const content = firstUserMessage.content;
      if (content.length > 50) {
        return content.substring(0, 50) + "...";
      }
      return content;
    }
    return `Chat ${new Date().toLocaleDateString()}`;
  };

  const handleImageUpload = async (imageUrls: string[]) => {
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: "Analyze these images to extract order details",
      images: imageUrls,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveCurrentSession(newMessages);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMessage],
          imageUrls,
        }),
      });
      if (!response.ok) throw new Error("Failed to analyze images");
      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: `Found ${data.items.length} items:\n\n${data.items
          .map(
            (item: ChecklistItem, index: number) =>
              `${index + 1}. ${item.name} - Quantity: ${
                item.quantity
              }, Price: $${item.price}`
          )
          .join("\n")}`,
        timestamp: new Date(),
        checklistId: data.checklistId,
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setChecklistIds((prev) => ({
        ...prev,
        [assistantMessage.id]: data.checklistId,
      }));
      saveCurrentSession(updatedMessages);
    } catch (error) {
      console.error("Error analyzing images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    saveCurrentSession(newMessages);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        // checklistId will be undefined for normal chat
      };
      let streamedMessages = [...newMessages, assistantMessage];
      setMessages(streamedMessages);
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            const content = line.slice(2);
            streamedMessages = streamedMessages.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + content }
                : msg
            );
            setMessages(streamedMessages);
          }
        }
      }
      saveCurrentSession(streamedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    loadSession(session);
    setSidebarOpen(false);
  };

  const handleNewSession = () => {
    createNewSession();
    setSidebarOpen(false);
  };

  // Add a function to refresh the sidebar when sessions are deleted
  const refreshSidebar = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <ChatSidebar
          onSessionSelect={handleSessionSelect}
          onNewSession={handleNewSession}
          currentSessionId={currentSession?.id}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="sm"
              className="md:hidden"
            >
              <Menu size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">AI Order Analyzer</h1>
              <p className="text-gray-600">
                Upload images of orders to extract item details
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              checklistId={message.checklistId || checklistIds[message.id]}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <Card className="p-4 bg-muted">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Analyzing...</span>
                </div>
              </Card>
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t space-y-4">
          <ImageUpload onImageUpload={handleImageUpload} disabled={isLoading} />

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              size="lg"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
