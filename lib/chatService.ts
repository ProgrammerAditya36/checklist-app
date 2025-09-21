import { ChatSession } from "@/types";

// Client-side service that uses API routes for database operations
// Falls back to localStorage if API is not available
export const chatService = {
  // Get all chat sessions
  getChatSessions: async (): Promise<ChatSession[]> => {
    try {
      const response = await fetch("/api/chat-sessions");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching chat sessions from API:", error);
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const sessions = localStorage.getItem("chat-sessions");
        return sessions ? JSON.parse(sessions) : [];
      } catch (error) {
        console.error("Error reading chat sessions from localStorage:", error);
        return [];
      }
    }
    return [];
  },

  // Save a chat session
  saveChatSession: async (session: ChatSession): Promise<void> => {
    try {
      const response = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error("Error saving chat session to API:", error);
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const sessions = await chatService.getChatSessions();
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
    }
  },

  // Get a specific chat session
  getChatSession: async (id: string): Promise<ChatSession | null> => {
    try {
      const response = await fetch(`/api/chat-sessions/${id}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching chat session from API:", error);
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const sessions = await chatService.getChatSessions();
        return sessions.find((s) => s.id === id) || null;
      } catch (error) {
        console.error("Error reading chat session from localStorage:", error);
        return null;
      }
    }
    return null;
  },

  // Delete a chat session
  deleteChatSession: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/chat-sessions/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error("Error deleting chat session from API:", error);
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        const sessions = await chatService.getChatSessions();
        const filteredSessions = sessions.filter((s) => s.id !== id);
        localStorage.setItem("chat-sessions", JSON.stringify(filteredSessions));
      } catch (error) {
        console.error("Error deleting chat session from localStorage:", error);
      }
    }
  },

  // Clear all chat sessions
  clearAllChatSessions: async (): Promise<void> => {
    try {
      const response = await fetch("/api/chat-sessions", {
        method: "DELETE",
      });
      if (response.ok) {
        return;
      }
    } catch (error) {
      console.error("Error clearing chat sessions from API:", error);
    }

    // Fallback to localStorage
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("chat-sessions");
      } catch (error) {
        console.error("Error clearing chat sessions from localStorage:", error);
      }
    }
  },
};
