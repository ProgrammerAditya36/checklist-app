import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatMessage } from "@/types";
import { ExternalLink } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  checklistId?: string;
}

export function MessageBubble({ message, checklistId }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <Card
        className={`max-w-[70%] p-4 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        <div className="space-y-2">
          {message.images && message.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {message.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Message image ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>
          )}

          <div className="whitespace-pre-wrap">{message.content}</div>

          {checklistId && (
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() =>
                  window.open(`/checklist/${checklistId}`, "_blank")
                }
              >
                <ExternalLink size={14} />
                View Shareable Checklist
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
