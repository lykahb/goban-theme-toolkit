import { useState } from "react";
import type { GenerationOptions } from "../../domain/options";
import { downloadBlob, downloadJson } from "../../lib/download";
import type { ProviderId } from "../../providers/types";

interface Props {
  templateSvg?: string;
  stoneTemplateSvg?: string;
  generatedImage?: Blob;
  providerId: ProviderId;
  model: string;
  prompt: string;
  options: GenerationOptions;
  onDownloadTemplatePng: () => Promise<void>;
  onDownloadStoneTemplatePng: () => Promise<void>;
}

export function ArtifactPanel({
  templateSvg,
  stoneTemplateSvg,
  generatedImage,
  providerId,
  model,
  prompt,
  options,
  onDownloadTemplatePng,
  onDownloadStoneTemplatePng
}: Props) {
  const [copyStatus, setCopyStatus] = useState<string | undefined>(undefined);
  const [isDownloadingTemplatePng, setIsDownloadingTemplatePng] = useState(false);
  const [isDownloadingStoneTemplatePng, setIsDownloadingStoneTemplatePng] = useState(false);

  const copyTemplateDataUrl = async () => {
    if (!templateSvg) return;
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(templateSvg)}`;
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopyStatus("Board template SVG data URL copied to clipboard.");
    } catch (_error) {
      setCopyStatus("Copy failed. Your browser might block clipboard access.");
    }
  };

  const copyStoneTemplateDataUrl = async () => {
    if (!stoneTemplateSvg) return;
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stoneTemplateSvg)}`;
    try {
      await navigator.clipboard.writeText(dataUrl);
      setCopyStatus("Stone template SVG data URL copied to clipboard.");
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
            downloadBlob(new Blob([templateSvg], { type: "image/svg+xml" }), "board-template.svg");
          }}
        >
          Download board-template.svg
        </button>
        <button type="button" disabled={!templateSvg} onClick={() => void copyTemplateDataUrl()}>
          Copy board-template.svg data URL
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
          {isDownloadingTemplatePng ? "Preparing board-template.png..." : "Download board-template.png"}
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
        {generatedImage ? (
          <p className="muted">
            For stone-template outputs, split variants with: npm run split:assets -- --input
            generated.png --layout scripts/layouts/stone-template-8x7.json --out output/stones
          </p>
        ) : null}
        <button
          type="button"
          disabled={!stoneTemplateSvg}
          onClick={() => {
            if (!stoneTemplateSvg) return;
            downloadBlob(new Blob([stoneTemplateSvg], { type: "image/svg+xml" }), "stone-template.svg");
          }}
        >
          Download stone-template.svg
        </button>
        <button type="button" disabled={!stoneTemplateSvg} onClick={() => void copyStoneTemplateDataUrl()}>
          Copy stone-template.svg data URL
        </button>
        <button
          type="button"
          disabled={!stoneTemplateSvg || isDownloadingStoneTemplatePng}
          onClick={() => {
            setIsDownloadingStoneTemplatePng(true);
            void onDownloadStoneTemplatePng().finally(() => {
              setIsDownloadingStoneTemplatePng(false);
            });
          }}
        >
          {isDownloadingStoneTemplatePng
            ? "Preparing stone-template.png..."
            : "Download stone-template.png"}
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
