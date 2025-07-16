import { ChatSession } from "@/types";

// Simple in-memory storage for temporary checklists
// In production, you might want to use Redis or similar
const storage = new Map<string, any>();

export const temporaryStorage = {
  set: (key: string, value: any, ttlMs: number) => {
    const expiresAt = Date.now() + ttlMs;
    storage.set(key, { value, expiresAt });

    // Auto-cleanup
    setTimeout(() => {
      storage.delete(key);
    }, ttlMs);
  },

  get: (key: string) => {
    const item = storage.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      storage.delete(key);
      return null;
    }

    return item.value;
  },

  delete: (key: string) => {
    storage.delete(key);
  },
};

// Local storage utilities for chat history
export const chatStorage = {
  // Get all chat sessions
  getChatSessions: (): ChatSession[] => {
    if (typeof window === "undefined") return [];

    try {
      const sessions = localStorage.getItem("chat-sessions");
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error("Error reading chat sessions from localStorage:", error);
      return [];
    }
  },

  // Save a chat session
  saveChatSession: (session: ChatSession) => {
    if (typeof window === "undefined") return;

    try {
      const sessions = chatStorage.getChatSessions();
      const existingIndex = sessions.findIndex((s) => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      localStorage.setItem("chat-sessions", JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving chat session to localStorage:", error);
    }
  },

  // Get a specific chat session
  getChatSession: (id: string): ChatSession | null => {
    if (typeof window === "undefined") return null;

    try {
      const sessions = chatStorage.getChatSessions();
      return sessions.find((s) => s.id === id) || null;
    } catch (error) {
      console.error("Error reading chat session from localStorage:", error);
      return null;
    }
  },

  // Delete a chat session
  deleteChatSession: (id: string) => {
    if (typeof window === "undefined") return;

    try {
      const sessions = chatStorage.getChatSessions();
      const filteredSessions = sessions.filter((s) => s.id !== id);
      localStorage.setItem("chat-sessions", JSON.stringify(filteredSessions));
    } catch (error) {
      console.error("Error deleting chat session from localStorage:", error);
    }
  },

  // Clear all chat sessions
  clearAllChatSessions: () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("chat-sessions");
    } catch (error) {
      console.error("Error clearing chat sessions from localStorage:", error);
    }
  },
};
