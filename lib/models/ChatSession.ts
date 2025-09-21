import { ChatMessage } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

export interface IChatSession extends Document {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    images: [String],
    timestamp: { type: Date, default: Date.now },
    checklistId: String,
  },
  { _id: false }
);

const ChatSessionSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    messages: [ChatMessageSchema],
  },
  {
    timestamps: true,
    _id: false, // Disable auto-generated _id
  }
);

// Clear the model if it exists to avoid conflicts
if (mongoose.models.ChatSession) {
  delete mongoose.models.ChatSession;
}

export default mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
