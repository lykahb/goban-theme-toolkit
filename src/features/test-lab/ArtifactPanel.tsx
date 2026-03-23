import { useState } from "react";
import type { GenerationOptions } from "../../domain/options";
import { downloadBlob, downloadJson } from "../../lib/download";
import type { ProviderId } from "../../providers/types";

interface Props {
  templateSvg?: string;
  generatedImage?: Blob;
  providerId: ProviderId;
  model: string;
  prompt: string;
  options: GenerationOptions;
  onDownloadTemplatePng: () => Promise<void>;
}

export function ArtifactPanel({
  templateSvg,
  generatedImage,
  providerId,
  model,
  prompt,
  options,
  onDownloadTemplatePng
}: Props) {
  const [copyStatus, setCopyStatus] = useState<string | undefined>(undefined);
  const [isDownloadingTemplatePng, setIsDownloadingTemplatePng] = useState(false);

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
          disabled={!templateSvg || isDownloadingTemplatePng}
          onClick={() => {
            setIsDownloadingTemplatePng(true);
            void onDownloadTemplatePng().finally(() => {
              setIsDownloadingTemplatePng(false);
            });
          }}
        >
          {isDownloadingTemplatePng ? "Preparing template.png..." : "Download template.png"}
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
