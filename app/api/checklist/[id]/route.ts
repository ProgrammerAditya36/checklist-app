import Checklist from "@/lib/models/Checklist";
import connectDB from "@/lib/mongodb";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const checklist = await Checklist.findById(id);

    if (!checklist) {
      return Response.json(
        { error: "Checklist not found or expired" },
        { status: 404 }
      );
    }

    return Response.json({
      items: checklist.items,
      createdAt: checklist.createdAt,
      expiresAt: checklist.expiresAt,
    });
  } catch (error) {
    console.error("Checklist API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
