import type { ChangeEvent } from "react";
import { providerDefinitions, type ProviderId } from "../../providers/types";

interface Props {
  providerId: ProviderId;
  model: string;
  apiKey: string;
  prompt: string;
  styleFile?: File;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onStyleFileChange: (file?: File) => void;
}

export function PromptPanel({
  providerId,
  model,
  apiKey,
  prompt,
  styleFile,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
  onPromptChange,
  onStyleFileChange
}: Props) {
  const provider = providerDefinitions.find((entry) => entry.id === providerId)!;

  const handleProvider = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as ProviderId;
    const nextDef = providerDefinitions.find((entry) => entry.id === next)!;
    onProviderChange(next);
    onModelChange(nextDef.defaultModel);
  };

  return (
    <section className="card">
      <h2>Prompt & Provider</h2>

      <div className="field">
        <label>Provider</label>
        <select value={providerId} onChange={handleProvider}>
          {providerDefinitions.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Model</label>
        <input value={model} onChange={(event) => onModelChange(event.target.value)} />
        <p className="muted">{provider.notes}</p>
      </div>

      <div className="field">
        <label>API key (in-memory only)</label>
        <input type="password" value={apiKey} onChange={(event) => onApiKeyChange(event.target.value)} />
      </div>

      <div className="field">
        <label>Prompt</label>
        <textarea value={prompt} onChange={(event) => onPromptChange(event.target.value)} />
      </div>

      <div className="field">
        <label>Reference style image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            onStyleFileChange(file);
          }}
        />
        <p className="muted">{styleFile ? `Selected: ${styleFile.name}` : "No style image selected."}</p>
      </div>
    </section>
  );
}
