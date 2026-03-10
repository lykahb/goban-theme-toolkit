import type { GenerateImageInput, GenerateImageOutput, ImageProvider } from "./types";

function assertOk(response: Response): void {
  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }
}

export const openAiProvider: ImageProvider = {
  id: "openai",
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput> {
    const form = new FormData();
    form.append("model", input.model);
    form.append("prompt", input.prompt);
    form.append("image[]", input.templatePng, "template.png");

    if (input.styleImage) {
      form.append("image[]", input.styleImage, "style.png");
    }

    if (input.options.imageEdgeMarginMode === "transparent") {
      form.append("background", "transparent");
      form.append("output_format", "png");
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`
      },
      body: form
    });
    assertOk(response);

    const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
    const base64 = payload.data?.[0]?.b64_json;
    if (!base64) {
      throw new Error("OpenAI did not return image data.");
    }
    const blob = base64ToBlob(base64, "image/png");
    return { image: blob, raw: payload };
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
