import { blobToBase64 } from "../lib/image";
import type { GenerateImageInput, GenerateImageOutput, ImageProvider } from "./types";

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

function parseGeminiImage(payload: unknown): Blob {
  const data = payload as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
      };
    }>;
  };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const firstWithImage = parts.find((part) => part.inlineData?.data);
  const base64 = firstWithImage?.inlineData?.data;
  const mime = firstWithImage?.inlineData?.mimeType ?? "image/png";
  if (!base64) {
    throw new Error("Gemini did not return an inline image.");
  }
  return base64ToBlob(base64, mime);
}

export const geminiProvider: ImageProvider = {
  id: "gemini",
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput> {
    const templateBase64 = await blobToBase64(input.templatePng);
    const parts: GeminiPart[] = [
      { text: input.prompt },
      {
        inline_data: {
          mime_type: "image/png",
          data: templateBase64
        }
      }
    ];

    if (input.styleImage) {
      const styleBase64 = await blobToBase64(input.styleImage);
      parts.push({
        inline_data: {
          mime_type: input.styleImage.type || "image/png",
          data: styleBase64
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`);
    }

    const payload = await response.json();
    return {
      image: parseGeminiImage(payload),
      raw: payload
    };
  }
};

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}
