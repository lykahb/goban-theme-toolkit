import {
  buildLayoutMetrics,
  getCoordinateSides,
  getStarPoints
} from "../domain/layout";
import type { GenerationOptions } from "../domain/options";

function svgLine(x1: number, y1: number, x2: number, y2: number, stroke: string, width: number) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" />`;
}

function svgText(text: string, x: number, y: number, fontSize: number) {
  return `<text x="${x}" y="${y}" font-family="Noto Sans, Arial, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#2f2a23" text-anchor="middle" dominant-baseline="middle">${text}</text>`;
}

function svgCircle(cx: number, cy: number, radius: number, fill: string) {
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" />`;
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

function toJapaneseNumeral(value: number): string {
  if (!Number.isInteger(value) || value < 1 || value > 99) {
    throw new Error(`toJapaneseNumeral expected an integer in range 1-99, got: ${value}`);
  }
  const digits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const digit = (index: number) => digits[index] ?? "";
  if (value < 10) return digit(value);
  if (value === 10) return "十";
  if (value < 20) return `十${digit(value - 10)}`;
  const tens = Math.floor(value / 10);
  const units = value % 10;
  return `${digit(tens)}十${digit(units)}`;
}

function getCoordinateLetter(index: number): string {
  const letters = "ABCDEFGHJKLMNOPQRST";
  return letters[index] ?? "?";
}

export function buildTemplateSvg(options: GenerationOptions): string {
  // The spacing, thickness, and size of star points are typical, see equipment dimensions.
  const metrics = buildLayoutMetrics(options);
  const imageFill = options.imageEdgeMarginMode === "transparent" ? "transparent" : "#d7bb8f";
  const boardFill = "#dcb77a";
  const boardEdgeStroke = options.drawBoardEdges ? "#4f4639" : "#cfab72";
  const lineStroke = "#2c241a";
  const spacingX = (metrics.gridRightPx - metrics.gridLeftPx) / (metrics.lineCount - 1);
  const spacingY = (metrics.gridBottomPx - metrics.gridTopPx) / (metrics.lineCount - 1);
  const coordinateFont = Math.max(14, Math.min(spacingX, spacingY) * 0.4);
  const coordinateSides = getCoordinateSides(options.coordinateDisplay);
  const lines: string[] = [];
  const labels: string[] = [];
  const starPoints: string[] = [];

  if (options.includeGrid) {
    for (let i = 0; i < metrics.lineCount; i += 1) {
      const x = metrics.gridLeftPx + spacingX * i;
      const y = metrics.gridTopPx + spacingY * i;
      lines.push(
        svgLine(x, metrics.gridTopPx, x, metrics.gridBottomPx, lineStroke, 1.6),
        svgLine(metrics.gridLeftPx, y, metrics.gridRightPx, y, lineStroke, 1.6)
      );

      if (options.coordinateDisplay !== "none") {
        const xLabel =
          options.coordinateLettering === "a1" ? escapeXml(getCoordinateLetter(i)) : String(i + 1);
        const yValue = options.coordinateLettering === "a1" ? metrics.lineCount - i : i + 1;
        const yLabel =
          options.coordinateLettering === "a1" ? String(yValue) : escapeXml(toJapaneseNumeral(yValue));

        if (coordinateSides.top) {
          labels.push(svgText(xLabel, x, metrics.gridTopPx - metrics.squareSizePx, coordinateFont));
        }
        if (coordinateSides.bottom) {
          labels.push(svgText(xLabel, x, metrics.gridBottomPx + metrics.squareSizePx, coordinateFont));
        }
        if (coordinateSides.left) {
          labels.push(svgText(yLabel, metrics.gridLeftPx - metrics.squareSizePx, y, coordinateFont));
        }
        if (coordinateSides.right) {
          labels.push(svgText(yLabel, metrics.gridRightPx + metrics.squareSizePx, y, coordinateFont));
        }
      }
    }

    const starRadius = Math.max(5, Math.min(spacingX, spacingY) * 0.1);
    for (const [x, y] of getStarPoints(metrics.lineCount)) {
      const cx = metrics.gridLeftPx + (x - 1) * spacingX;
      const cy = metrics.gridTopPx + (y - 1) * spacingY;
      starPoints.push(svgCircle(cx, cy, starRadius, lineStroke));
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${metrics.imageWidthPx}" height="${metrics.imageHeightPx}" viewBox="0 0 ${metrics.imageWidthPx} ${metrics.imageHeightPx}">
  <rect x="0" y="0" width="${metrics.imageWidthPx}" height="${metrics.imageHeightPx}" fill="${imageFill}" />
  <rect x="${metrics.boardLeftPx}" y="${metrics.boardTopPx}" width="${metrics.boardWidthPx}" height="${metrics.boardHeightPx}" fill="${boardFill}" stroke="${boardEdgeStroke}" stroke-width="2" />
  ${lines.join("\n  ")}
  ${starPoints.join("\n  ")}
  ${labels.join("\n  ")}
</svg>
`.trim();
}
