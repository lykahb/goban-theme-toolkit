import type { GenerationOptions } from "./options";

export interface LayoutMetrics {
  // All metrics are in template image pixels.
  imageWidthPx: number;
  imageHeightPx: number;
  boardWidthPx: number;
  boardHeightPx: number;
  boardLeftPx: number;
  boardTopPx: number;
  boardRightPx: number;
  boardBottomPx: number;
  gridLeftPx: number;
  gridTopPx: number;
  gridRightPx: number;
  gridBottomPx: number;
  boardEdgeMarginXPx: number;
  boardEdgeMarginYPx: number;
  lineCount: number;
}

export const TEMPLATE_IMAGE_SIZE = 1024;

export function buildLayoutMetrics(options: GenerationOptions): LayoutMetrics {
  const imageWidthPx = TEMPLATE_IMAGE_SIZE;
  const imageHeightPx = TEMPLATE_IMAGE_SIZE;
  const imageEdgeMargin = 36;

  // A real printed goban may be rectangular (see docs/style.md).
  // For now we still initialize square board dimensions; options can extend this later.
  const boardWidthPx = imageWidthPx - imageEdgeMargin * 2;
  const boardHeightPx = boardWidthPx;
  const boardLeftPx = imageEdgeMargin;
  const boardTopPx = (imageHeightPx - boardHeightPx) / 2;
  const boardRightPx = boardLeftPx + boardWidthPx;
  const boardBottomPx = boardTopPx + boardHeightPx;

  // Keep board-edge margin at least half a stone by design.
  const lineCount = options.boardSize;
  const boardEdgeMarginXPx = boardWidthPx * 0.06;
  const boardEdgeMarginYPx = boardHeightPx * 0.06;
  const gridWidthPx = boardWidthPx - boardEdgeMarginXPx * 2;
  const gridHeightPx = boardHeightPx - boardEdgeMarginYPx * 2;
  const gridLeftPx = boardLeftPx + boardEdgeMarginXPx;
  const gridTopPx = boardTopPx + boardEdgeMarginYPx;
  const gridRightPx = gridLeftPx + gridWidthPx;
  const gridBottomPx = gridTopPx + gridHeightPx;

  return {
    imageWidthPx,
    imageHeightPx,
    boardWidthPx,
    boardHeightPx,
    boardLeftPx,
    boardTopPx,
    boardRightPx,
    boardBottomPx,
    gridLeftPx,
    gridTopPx,
    gridRightPx,
    gridBottomPx,
    boardEdgeMarginXPx,
    boardEdgeMarginYPx,
    lineCount,
  };
}

export function getCoordinateLabel(index: number, size: number): string {
  const letters = "ABCDEFGHJKLMNOPQRST";
  const letter = letters[index] ?? "?";
  const number = size - index;
  return `${letter}${number}`;
}

export function getCoordinateLetter(index: number): string {
  const letters = "ABCDEFGHJKLMNOPQRST";
  return letters[index] ?? "?";
}

export function getStarPoints(lineCount: number): Array<[number, number]> {
  if (lineCount === 19) {
    return [
      [4, 4],
      [4, 10],
      [4, 16],
      [10, 4],
      [10, 10],
      [10, 16],
      [16, 4],
      [16, 10],
      [16, 16]
    ];
  }
  if (lineCount === 13) {
    return [
      [4, 4],
      [4, 10],
      [7, 7],
      [10, 4],
      [10, 10]
    ];
  }
  if (lineCount === 9) {
    return [
      [3, 3],
      [3, 7],
      [5, 5],
      [7, 3],
      [7, 7]
    ];
  }
  return [];
}
