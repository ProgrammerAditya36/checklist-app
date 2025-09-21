import { chatDatabase } from "@/lib/database";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await chatDatabase.getChatSession(id);

    if (!session) {
      return Response.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    return Response.json(session);
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await request.json();

    // Ensure the ID matches the URL parameter
    session.id = id;

    await chatDatabase.saveChatSession(session);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating chat session:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await chatDatabase.deleteChatSession(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
