export interface ChecklistItem {
  name: string;
  quantity: number;
  price: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  timestamp: Date;
}

export interface TemporaryChecklist {
  id: string;
  items: ChecklistItem[];
  createdAt: Date;
  expiresAt: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
