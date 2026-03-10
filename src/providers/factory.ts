import { geminiProvider } from "./gemini";
import { openAiProvider } from "./openai";
import type { ImageProvider, ProviderId } from "./types";

const providers: Record<ProviderId, ImageProvider> = {
  openai: openAiProvider,
  gemini: geminiProvider
};

export function getProvider(id: ProviderId): ImageProvider {
  return providers[id];
}
