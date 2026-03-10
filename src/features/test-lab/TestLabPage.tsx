import { useMemo, useState } from "react";
import { buildLayoutMetrics } from "../../domain/layout";
import {
  defaultGenerationOptions,
  generationOptionsSchema,
  normalizeOptions,
  type GenerationOptions
} from "../../domain/options";
import { fileToBlob } from "../../lib/image";
import { makeLog, type RunLog } from "../../lib/log";
import { getProvider } from "../../providers/factory";
import { providerDefinitions, type ProviderId } from "../../providers/types";
import { buildTemplateSvg } from "../../template/buildTemplateSvg";
import { rasterizeSvgToPng } from "../../template/rasterizeSvg";
import { ArtifactPanel } from "./ArtifactPanel";
import { ComparePanel } from "./ComparePanel";
import { OptionsPanel } from "./OptionsPanel";
import { PromptPanel } from "./PromptPanel";
import { RunPanel } from "./RunPanel";

interface PreparedTemplate {
  svg: string;
  png: Blob;
  svgDataUrl: string;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function TestLabPage() {
  const initialModel =
    providerDefinitions.find((entry) => entry.id === "openai")?.defaultModel ?? "gpt-image-1";
  const [options, setOptions] = useState<GenerationOptions>(defaultGenerationOptions);
  const [providerId, setProviderId] = useState<ProviderId>("openai");
  const [model, setModel] = useState(initialModel);
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState(
    "Stylize this go board template as a calm natural wood board while preserving all geometry."
  );
  const [styleFile, setStyleFile] = useState<File | undefined>(undefined);
  const [template, setTemplate] = useState<PreparedTemplate | undefined>(undefined);
  const [generatedImage, setGeneratedImage] = useState<Blob | undefined>(undefined);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<RunLog[]>([]);

  const providerLabel = useMemo(
    () => providerDefinitions.find((entry) => entry.id === providerId)?.label ?? providerId,
    [providerId]
  );

  const addLog = (level: RunLog["level"], message: string) => {
    setLogs((prev) => [makeLog(level, message), ...prev].slice(0, 20));
  };

  const prepareTemplate = async (next: GenerationOptions): Promise<PreparedTemplate> => {
    const normalized = normalizeOptions(next);
    const parseResult = generationOptionsSchema.safeParse(normalized);
    if (!parseResult.success) {
      throw new Error(parseResult.error.issues.map((issue) => issue.message).join(" "));
    }
    const svg = buildTemplateSvg(parseResult.data);
    const metrics = buildLayoutMetrics(parseResult.data);
    const png = await rasterizeSvgToPng(svg, metrics.imageWidthPx, metrics.imageHeightPx);
    return {
      svg,
      png,
      svgDataUrl: svgToDataUrl(svg)
    };
  };

  const handleGenerateTemplate = async () => {
    setError(undefined);
    try {
      const built = await prepareTemplate(options);
      setTemplate(built);
      addLog("info", "Template generated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error while generating template.";
      setError(message);
      addLog("error", message);
    }
  };

  const handleRunModel = async () => {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    setIsRunning(true);
    setError(undefined);

    try {
      const prepared = await prepareTemplate(options);
      setTemplate(prepared);
      addLog("info", "Template generated for model run.");

      const styleBlob = styleFile ? await fileToBlob(styleFile) : undefined;
      const provider = getProvider(providerId);
      addLog("info", `Running provider: ${providerId}, model: ${model}`);

      const result = await provider.generate({
        apiKey,
        model,
        prompt,
        templatePng: prepared.png,
        styleImage: styleBlob,
        options: normalizeOptions(options)
      });

      if (generatedImageUrl) {
        URL.revokeObjectURL(generatedImageUrl);
      }
      const url = URL.createObjectURL(result.image);
      setGeneratedImage(result.image);
      setGeneratedImageUrl(url);
      addLog("info", "Model output received.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown provider error.";
      setError(message);
      addLog("error", message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="page">
      <h1 className="title">Goban AI Generator - Test Lab MVP</h1>
      <p className="subtitle">
        Generate deterministic board templates and run model experiments against the same geometry.
      </p>

      <div className="layout">
        <div className="stack">
          <RunPanel
            canRun={!isRunning}
            isRunning={isRunning}
            error={error}
            onGenerateTemplate={handleGenerateTemplate}
            onRunModel={handleRunModel}
          />
          <OptionsPanel
            value={options}
            onChange={(next) => {
              setOptions(normalizeOptions(next));
            }}
          />
          <PromptPanel
            providerId={providerId}
            model={model}
            apiKey={apiKey}
            prompt={prompt}
            styleFile={styleFile}
            onProviderChange={setProviderId}
            onModelChange={setModel}
            onApiKeyChange={setApiKey}
            onPromptChange={setPrompt}
            onStyleFileChange={setStyleFile}
          />
          <ArtifactPanel
            providerId={providerId}
            model={model}
            prompt={prompt}
            options={options}
            templateSvg={template?.svg}
            templatePng={template?.png}
            generatedImage={generatedImage}
          />
        </div>

        <div className="stack">
          <ComparePanel
            templateSvgDataUrl={template?.svgDataUrl}
            generatedImageUrl={generatedImageUrl}
            providerLabel={providerLabel}
            modelName={model}
          />
          <section className="card">
            <h2>Run log</h2>
            {logs.length === 0 ? (
              <p className="muted">No events yet.</p>
            ) : (
              logs.map((log) => (
                <p key={`${log.at}${log.message}`} className="muted">
                  [{log.level}] {log.at} - {log.message}
                </p>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
