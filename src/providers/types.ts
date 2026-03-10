import type { GenerationOptions } from "../domain/options";

export type ProviderId = "openai" | "gemini";

export interface GenerateImageInput {
  apiKey: string;
  model: string;
  prompt: string;
  templatePng: Blob;
  styleImage?: Blob;
  options: GenerationOptions;
}

export interface GenerateImageOutput {
  image: Blob;
  raw?: unknown;
}

export interface ImageProvider {
  id: ProviderId;
  generate(input: GenerateImageInput): Promise<GenerateImageOutput>;
}

export interface ProviderDefinition {
  id: ProviderId;
  label: string;
  defaultModel: string;
  notes: string;
}

export const providerDefinitions: ProviderDefinition[] = [
  {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-image-1",
    notes: "Uses /v1/images/edits with multipart form data."
  },
  {
    id: "gemini",
    label: "Google Gemini",
    defaultModel: "gemini-2.5-flash-image",
    notes: "Uses generateContent endpoint with inline image data."
  }
];
