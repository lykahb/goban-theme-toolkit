import { useState } from "react";
import type { GenerationOptions } from "../../domain/options";
import { downloadBlob, downloadJson } from "../../lib/download";
import type { ProviderId } from "../../providers/types";

interface Props {
  templateSvg?: string;
  templatePng?: Blob;
  generatedImage?: Blob;
  providerId: ProviderId;
  model: string;
  prompt: string;
  options: GenerationOptions;
}

export function ArtifactPanel({ templateSvg, templatePng, generatedImage, providerId, model, prompt, options }: Props) {
  const [copyStatus, setCopyStatus] = useState<string | undefined>(undefined);

  const copyTemplateDataUrl = async () => {
    if (!templateSvg) return;
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(templateSvg)}`;
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopyStatus("Template SVG data URL copied to clipboard.");
    } catch (_error) {
      setCopyStatus("Copy failed. Your browser might block clipboard access.");
    }
  };

  return (
    <section className="card">
      <h2>Artifacts</h2>
      <div className="stack">
        <button
          type="button"
          disabled={!templateSvg}
          onClick={() => {
            if (!templateSvg) return;
            downloadBlob(new Blob([templateSvg], { type: "image/svg+xml" }), "template.svg");
          }}
        >
          Download template.svg
        </button>
        <button type="button" disabled={!templateSvg} onClick={() => void copyTemplateDataUrl()}>
          Copy template.svg data URL
        </button>
        <button
          type="button"
          disabled={!templatePng}
          onClick={() => {
            if (!templatePng) return;
            downloadBlob(templatePng, "template.png");
          }}
        >
          Download template.png
        </button>
        <button
          type="button"
          disabled={!generatedImage}
          onClick={() => {
            if (!generatedImage) return;
            downloadBlob(generatedImage, "generated.png");
          }}
        >
          Download generated.png
        </button>
        <button
          type="button"
          onClick={() =>
            downloadJson(
              {
                providerId,
                model,
                prompt,
                options,
                generatedAt: new Date().toISOString()
              },
              "run-metadata.json"
            )
          }
        >
          Download run-metadata.json
        </button>
        {copyStatus ? <p className="muted">{copyStatus}</p> : null}
      </div>
    </section>
  );
}
