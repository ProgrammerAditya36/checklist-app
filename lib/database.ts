import ChatSession from "@/lib/models/ChatSession";
import connectDB from "@/lib/mongodb";
import { ChatSession as ChatSessionType } from "@/types";

// Database utilities for chat sessions
export const chatDatabase = {
  // Get all chat sessions
  getChatSessions: async (): Promise<ChatSessionType[]> => {
    try {
      await connectDB();
      const sessions = await ChatSession.find().sort({ updatedAt: -1 });
      return sessions.map((session) => ({
        id: session._id,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
    } catch (error) {
      console.error("Error reading chat sessions from database:", error);
      return [];
    }
  },

  // Save a chat session
  saveChatSession: async (session: ChatSessionType): Promise<void> => {
    try {
      await connectDB();
      await ChatSession.findByIdAndUpdate(
        session.id,
        {
          _id: session.id,
          title: session.title,
          messages: session.messages,
          createdAt: session.createdAt,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error saving chat session to database:", error);
      throw error;
    }
  },

  // Get a specific chat session
  getChatSession: async (id: string): Promise<ChatSessionType | null> => {
    try {
      await connectDB();
      const session = await ChatSession.findById(id);
      if (!session) return null;

      return {
        id: session._id,
        title: session.title,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error("Error reading chat session from database:", error);
      return null;
    }
  },

  // Delete a chat session
  deleteChatSession: async (id: string): Promise<void> => {
    try {
      await connectDB();
      await ChatSession.findByIdAndDelete(id);
    } catch (error) {
      console.error("Error deleting chat session from database:", error);
      throw error;
    }
  },

  // Clear all chat sessions
  clearAllChatSessions: async (): Promise<void> => {
    try {
      await connectDB();
      await ChatSession.deleteMany({});
    } catch (error) {
      console.error("Error clearing chat sessions from database:", error);
      throw error;
    }
  },
};
