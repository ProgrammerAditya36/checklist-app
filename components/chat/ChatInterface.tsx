"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, ChecklistItem } from "@/types";
import { Send } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ImageUpload } from "./ImageUpload";
import { MessageBubble } from "./MessageBubble";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checklistIds, setChecklistIds] = useState<{
    [messageId: string]: string;
  }>({});

  const handleImageUpload = async (imageUrls: string[]) => {
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: "Analyze these images to extract order details",
      images: imageUrls,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

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
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setChecklistIds((prev) => ({
        ...prev,
        [assistantMessage.id]: data.checklistId,
      }));
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const content = line.slice(2);
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, content: msg.content + content }
                  : msg
              )
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">AI Order Analyzer</h1>
          <p className="text-gray-600">
            Upload images of orders to extract item details
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              checklistId={checklistIds[message.id]}
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
      </Card>
    </div>
  );
}
