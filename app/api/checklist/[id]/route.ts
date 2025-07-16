import { temporaryStorage } from "@/lib/storage";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checklist = temporaryStorage.get(id);

    if (!checklist) {
      return Response.json(
        { error: "Checklist not found or expired" },
        { status: 404 }
      );
    }

    return Response.json(checklist);
  } catch (error) {
    console.error("Checklist API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
