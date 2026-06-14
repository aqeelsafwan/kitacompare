import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a product label data extractor for a price comparison app.
The user will provide a photo of a product showing the name, price tag, and weight or volume.
Extract ONLY these three fields and return a strict JSON object:
{
  "name": "product name string",
  "price": number (in RM, numeric only, e.g. 4.99),
  "quantity": number (numeric value only, e.g. 500),
  "unit": "g" | "kg" | "ml" | "L"
}
If you cannot confidently extract a field, use null for that field.
Return ONLY the JSON object, no other text.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mediaType } = body as {
      image: string;
      mediaType: string;
    };

    if (!image || !mediaType) {
      return NextResponse.json({ error: "Missing image or mediaType" }, { status: 400 });
    }

    const supportedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!supportedTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPEG, PNG, GIF, or WebP." },
        { status: 400 }
      );
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: image,
              },
            },
            {
              type: "text",
              text: "Extract the product name, price (RM), and quantity with unit from this product photo.",
            },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not extract data from image" }, { status: 422 });
    }

    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json(extracted);
  } catch (err) {
    console.error("Extraction error:", err);
    const message =
      err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
