import { ChecklistItem } from "@/types";
import mongoose, { Document, Schema } from "mongoose";

export interface IChecklist extends Document {
  _id: string;
  items: ChecklistItem[];
  createdAt: Date;
  expiresAt: Date;
}

const ChecklistItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const ChecklistSchema = new Schema(
  {
    _id: { type: String, required: true },
    items: [ChecklistItemSchema],
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    _id: false, // Disable auto-generated _id
  }
);

// Create TTL index for automatic cleanup of expired documents
ChecklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Clear the model if it exists to avoid conflicts
if (mongoose.models.Checklist) {
  delete mongoose.models.Checklist;
}

export default mongoose.model<IChecklist>("Checklist", ChecklistSchema);
