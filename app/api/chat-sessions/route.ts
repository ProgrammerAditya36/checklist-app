import { chatDatabase } from "@/lib/database";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const sessions = await chatDatabase.getChatSessions();
    return Response.json(sessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await req.json();
    await chatDatabase.saveChatSession(session);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving chat session:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await chatDatabase.clearAllChatSessions();
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error clearing chat sessions:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
