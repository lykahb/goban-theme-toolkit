interface Props {
  templateSvgDataUrl?: string;
  stoneTemplateSvgDataUrl?: string;
  generatedImageUrl?: string;
  providerLabel?: string;
  modelName?: string;
}

export function ComparePanel({
  templateSvgDataUrl,
  stoneTemplateSvgDataUrl,
  generatedImageUrl,
  providerLabel,
  modelName
}: Props) {
  return (
    <section className="card">
      <h2>Compare</h2>
      <div className="images">
        <div className="image-wrap">
          <p className="pill">Template</p>
          {templateSvgDataUrl ? <img src={templateSvgDataUrl} alt="Template image" /> : <p className="muted">No template yet.</p>}
        </div>
        <div className="image-wrap">
          <p className="pill">Stone template</p>
          {stoneTemplateSvgDataUrl ? (
            <img src={stoneTemplateSvgDataUrl} alt="Stone template image" />
          ) : (
            <p className="muted">No stone template yet.</p>
          )}
        </div>
        <div className="image-wrap">
          <p className="pill">Generated {providerLabel ? `(${providerLabel}${modelName ? ` / ${modelName}` : ""})` : ""}</p>
          {generatedImageUrl ? <img src={generatedImageUrl} alt="Generated board image" /> : <p className="muted">No output yet.</p>}
        </div>
      </div>
    </section>
  );
}
