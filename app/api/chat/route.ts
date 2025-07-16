import { temporaryStorage } from "@/lib/storage";
import { google } from "@ai-sdk/google";
import { generateObject, streamText } from "ai";
import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const CUSTOM_PROMPT = `Analyze the provided image which displays a list of ordered items. Your task is to extract each item's details: its full name, the quantity ordered, and its price.

Format your output as a single JSON array. Each element in the array should be a JSON object representing an item. The object structure must be as follows:

{
  "name": "string",
  "quantity": number,
  "price": number
}`;

export async function POST(req: NextRequest) {
  try {
    const { messages, imageUrls } = await req.json();

    const model = google("gemini-2.0-flash");

    // If there are images, use the custom prompt and generate structured output
    if (imageUrls && imageUrls.length > 0) {
      const result = await generateObject({
        model,
        schema: z.object({
          items: z.array(
            z.object({
              name: z.string(),
              quantity: z.number(),
              price: z.number(),
            })
          ),
        }),
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: CUSTOM_PROMPT },
              ...imageUrls.map((url: string) => ({
                type: "image" as const,
                image: new URL(url),
              })),
            ],
          },
        ],
      });

      // Store the checklist temporarily (2 days = 172800000 ms)
      const checklistId = uuidv4();
      temporaryStorage.set(
        checklistId,
        {
          items: result.object.items,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 172800000), // 2 days
        },
        172800000
      );

      return Response.json({
        checklistId,
        items: result.object.items,
      });
    }

    // Regular chat without images
    const result = await streamText({
      model,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
