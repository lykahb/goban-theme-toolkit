interface Props {
  canRun: boolean;
  isRunning: boolean;
  error?: string;
  onGenerateTemplate: () => void;
  onRunModel: () => void;
}

export function RunPanel({ canRun, isRunning, error, onGenerateTemplate, onRunModel }: Props) {
  return (
    <section className="card">
      <h2>Run</h2>
      <div className="stack">
        <button type="button" onClick={onGenerateTemplate}>
          Generate template only
        </button>
        <button type="button" disabled={!canRun || isRunning} onClick={onRunModel}>
          {isRunning ? "Running..." : "Run model"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
