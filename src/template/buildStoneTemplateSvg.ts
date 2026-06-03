export const stoneTemplateWidthPx = 1024;
export const stoneTemplateHeightPx = 896;

const columns = 8;
const rows = 7;
const cellSizePx = 128;
const stoneRadiusPx = 56;

function svgCircle(cx: number, cy: number, radius: number, fill: string, stroke: string) {
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
}

export function buildStoneTemplateSvg(): string {
  const stones: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    if (row === 3) continue;

    const fill = row < 3 ? "#101010" : "#f7f7f4";
    const stroke = row < 3 ? "#000000" : "#d8d8d0";
    const cy = row * cellSizePx + cellSizePx / 2;

    for (let column = 0; column < columns; column += 1) {
      const cx = column * cellSizePx + cellSizePx / 2;
      stones.push(svgCircle(cx, cy, stoneRadiusPx, fill, stroke));
    }
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${stoneTemplateWidthPx}" height="${stoneTemplateHeightPx}" viewBox="0 0 ${stoneTemplateWidthPx} ${stoneTemplateHeightPx}">
  ${stones.join("\n  ")}
</svg>
`.trim();
}
