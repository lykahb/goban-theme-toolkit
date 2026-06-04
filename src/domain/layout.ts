import type { GenerationOptions } from "./options";
import type { CoordinateDisplay } from "./options";

export interface LayoutMetrics {
  // All metrics are in template image pixels.
  squareSizePx: number;
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
  boardEdgeMarginTopPx: number;
  boardEdgeMarginBottomPx: number;
  boardEdgeMarginLeftPx: number;
  boardEdgeMarginRightPx: number;
  lineCount: number;
}

export const TEMPLATE_IMAGE_SIZE = 1024;

export interface CoordinateSides {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export function getCoordinateSides(display: CoordinateDisplay): CoordinateSides {
  if (display === "all") {
    return { top: true, bottom: true, left: true, right: true };
  }
  if (display === "top_left") {
    return { top: true, bottom: false, left: true, right: false };
  }
  if (display === "top_right") {
    return { top: true, bottom: false, left: false, right: true };
  }
  if (display === "bottom_left") {
    return { top: false, bottom: true, left: true, right: false };
  }
  if (display === "bottom_right") {
    return { top: false, bottom: true, left: false, right: true };
  }
  return { top: false, bottom: false, left: false, right: false };
}

export function buildLayoutMetrics(options: GenerationOptions): LayoutMetrics {
  const lineCount = options.boardSize;

  if (options.outputFormat === "gopanda2") {
    const marginCells = options.coordinateDisplay === "none" ? 0.7 : 1.2;
    const boardWidthCells = lineCount - 1 + marginCells * 2;
    const squareSizePx = TEMPLATE_IMAGE_SIZE / boardWidthCells;
    const imageWidthPx = TEMPLATE_IMAGE_SIZE;
    const imageHeightPx = TEMPLATE_IMAGE_SIZE;
    const boardWidthPx = imageWidthPx;
    const boardHeightPx = imageHeightPx;
    const boardLeftPx = 0;
    const boardTopPx = 0;
    const boardRightPx = boardWidthPx;
    const boardBottomPx = boardHeightPx;
    const boardEdgeMarginTopPx = marginCells * squareSizePx;
    const boardEdgeMarginBottomPx = boardEdgeMarginTopPx;
    const boardEdgeMarginLeftPx = boardEdgeMarginTopPx;
    const boardEdgeMarginRightPx = boardEdgeMarginTopPx;
    const gridLeftPx = boardEdgeMarginLeftPx;
    const gridTopPx = boardEdgeMarginTopPx;
    const gridRightPx = boardRightPx - boardEdgeMarginRightPx;
    const gridBottomPx = boardBottomPx - boardEdgeMarginBottomPx;

    return {
      squareSizePx,
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
      boardEdgeMarginTopPx,
      boardEdgeMarginBottomPx,
      boardEdgeMarginLeftPx,
      boardEdgeMarginRightPx,
      lineCount
    };
  }

  const sides = getCoordinateSides(options.coordinateDisplay);

  const boundedGridWidth = lineCount;
  const boundedGridHeight = lineCount;
  const squaresWide = boundedGridWidth + Number(sides.left) + Number(sides.right);
  const squaresHigh = boundedGridHeight + Number(sides.top) + Number(sides.bottom);
  const squareSizePx = Math.max(1, Math.floor(TEMPLATE_IMAGE_SIZE / Math.max(squaresWide, squaresHigh)));
  const imageWidthPx = squareSizePx * squaresWide;
  const imageHeightPx = squareSizePx * squaresHigh;

  // A real printed goban may be rectangular (see docs/style.md).
  // For now we still initialize square board dimensions; options can extend this later.
  const boardWidthPx = lineCount * squareSizePx;
  const boardHeightPx = lineCount * squareSizePx;
  const boardLeftPx = sides.left ? squareSizePx : 0;
  const boardTopPx = sides.top ? squareSizePx : 0;
  const boardRightPx = boardLeftPx + boardWidthPx;
  const boardBottomPx = boardTopPx + boardHeightPx;

  // Match OGS intersection placement: first/last intersections are half a square from board edge.
  // Keep these symmetric for now; side-specific fields support non-symmetric margins later.
  const boardEdgeMarginTopPx = squareSizePx / 2;
  const boardEdgeMarginBottomPx = squareSizePx / 2;
  const boardEdgeMarginLeftPx = squareSizePx / 2;
  const boardEdgeMarginRightPx = squareSizePx / 2;
  const gridLeftPx = boardLeftPx + boardEdgeMarginLeftPx;
  const gridTopPx = boardTopPx + boardEdgeMarginTopPx;
  const gridRightPx = boardRightPx - boardEdgeMarginRightPx;
  const gridBottomPx = boardBottomPx - boardEdgeMarginBottomPx;

  return {
    squareSizePx,
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
    boardEdgeMarginTopPx,
    boardEdgeMarginBottomPx,
    boardEdgeMarginLeftPx,
    boardEdgeMarginRightPx,
    lineCount,
  };
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
