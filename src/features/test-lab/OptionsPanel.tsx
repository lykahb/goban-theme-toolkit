import type { GenerationOptions } from "../../domain/options";
import type { ImageEdgeMarginMode } from "../../domain/options";

interface Props {
  value: GenerationOptions;
  onChange: (next: GenerationOptions) => void;
}

function asBool(value: string): boolean {
  return value === "true";
}

export function OptionsPanel({ value, onChange }: Props) {
  const canDisableGrid = value.outputFormat === "online";

  const setMarginMode = (mode: ImageEdgeMarginMode) => onChange({ ...value, imageEdgeMarginMode: mode });

  return (
    <section className="card">
      <h2>Options</h2>

      <div className="field">
        <label>Board size</label>
        <select value={String(value.boardSize)} onChange={(e) => onChange({ ...value, boardSize: Number(e.target.value) as 9 | 13 | 19 })}>
          <option value="9">9x9</option>
          <option value="13">13x13</option>
          <option value="19">19x19</option>
        </select>
      </div>

      <div className="field">
        <label>Output format</label>
        <select
          value={value.outputFormat}
          onChange={(e) =>
            onChange({
              ...value,
              outputFormat: e.target.value as "online" | "print",
              includeGrid: e.target.value === "print" ? true : value.includeGrid
            })
          }
        >
          <option value="online">Online</option>
          <option value="print">Print</option>
        </select>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Include grid</label>
          <select
            value={String(value.includeGrid)}
            disabled={!canDisableGrid}
            onChange={(e) => onChange({ ...value, includeGrid: asBool(e.target.value) })}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div className="field">
          <label>Include coordinates</label>
          <select
            value={String(value.includeCoordinates)}
            disabled={!value.includeGrid}
            onChange={(e) => onChange({ ...value, includeCoordinates: asBool(e.target.value) })}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label>Draw board edges</label>
          <select value={String(value.drawBoardEdges)} onChange={(e) => onChange({ ...value, drawBoardEdges: asBool(e.target.value) })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>

        <div className="field">
          <label>Image edge margin</label>
          <select value={value.imageEdgeMarginMode} onChange={(e) => setMarginMode(e.target.value as ImageEdgeMarginMode)}>
            <option value="extend_theme">Extend theme</option>
            <option value="transparent">Transparent</option>
            <option value="prompt_or_image">Prompt or image</option>
          </select>
        </div>
      </div>
    </section>
  );
}
