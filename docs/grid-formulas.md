# Grid formulas (reference)

Target-client board geometry for OGS and GoPanda2/Pandanet. The OGS formulas come from OGS source code in commit `4772659d69e4eb5ea67646c030a43dbaa5a4ed09`; the Pandanet formulas come from measured board proportions.

## Scope
- This document focuses on formulas for:
  - grid size and spacing,
  - grid origin offsets,
  - how label display changes layout,
  - coordinate label placement and numbering origin.
- Sections marked OGS describe Online-Go renderer behavior.
- Sections marked GoPanda2/Pandanet describe Pandanet board proportions.
- No local code changes are included here.

## OGS symbols
- `ss`: square size in pixels (`this.square_size`)
- `W`, `H`: full board dimensions (`this.width`, `this.height`)
- `BW`, `BH`: bounded board dimensions (`this.bounded_width`, `this.bounded_height`)
- `L`, `R`, `T`, `B`: label draw flags (`draw_left_labels`, `draw_right_labels`, `draw_top_labels`, `draw_bottom_labels`) treated as `0/1`
- `bounds = {left, right, top, bottom}`: visible sub-board bounds

## OGS 1) Label flags and bounded board dimensions

Formulas:
- `BW = bounds.right - bounds.left + 1`
- `BH = bounds.bottom - bounds.top + 1`
- Label flags are initialized from config, then forced off if a side is cropped by bounds.

References:
- [InteractiveBase.ts#L320](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/InteractiveBase.ts#L320)  
  Initializes default `bounds` to full board.
- [InteractiveBase.ts#L326](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/InteractiveBase.ts#L326)  
  Computes `bounded_width` / `bounded_height`.
- [InteractiveBase.ts#L401](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/InteractiveBase.ts#L401)  
  Reads label draw booleans from config.
- [InteractiveBase.ts#L410](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/InteractiveBase.ts#L410)  
  Disables labels when a corresponding side is not on the outer board edge.

## OGS 2) Square size from display width (auto sizing)

Formulas:
- `nSquares = max(BW + L + R, BH + T + B)`
- `ss = floor(display_width / nSquares)` (after evaluation bar adjustment, if enabled)

References:
- [Goban.ts#L320](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/Goban.ts#L320)  
  `computeSquareSizeFromDisplayWidth(...)` definition.
- [Goban.ts#L341](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/Goban.ts#L341)  
  Computes `n_squares`.
- [Goban.ts#L361](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/Goban.ts#L361)  
  Returns floored square size.

## OGS 3) Board pixel size (canvas/SVG extents)

Formulas:
- `metrics.width  = ss * (BW + L + R)`
- `metrics.height = ss * (BH + T + B)`
- `metrics.mid = ss / 2`

Reference:
- [Goban.ts#L439](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/Goban.ts#L439)  
  `computeMetrics()` builds board pixel dimensions from bounded size + label squares.

## OGS 4) Grid origin and line formulas (`drawLines`)

Raw setup:
- `ox = L ? ss : 0`
- `oy = T ? ss : 0`
- If sub-board is bounded:
  - when `bounds.left > 0`: `ox = -ss * bounds.left`
  - when `bounds.top > 0`: `oy = -ss * bounds.top`
- Then OGS shifts to intersection centers and applies crisp-line adjustments.

References:
- [SVGRenderer.ts#L3595](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3595)  
  Initial `ox/oy` from top/left labels.
- [SVGRenderer.ts#L3598](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3598)  
  Bounds override for cropped boards.
- [SVGRenderer.ts#L3606](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3606)  
  Center shift by `round(ss/2)`.
- [SVGRenderer.ts#L3614](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3614)  
  Line-width formula, followed by crisp-pixel offset.

Grid lines:
- Vertical line `x_i = ox + i * ss`, from `y = oy` to `y = oy + (H - 1) * ss`, `i=0..W-1`
- Horizontal line `y_j = oy + j * ss`, from `x = ox` to `x = ox + (W - 1) * ss`, `j=0..H-1`

Reference:
- [SVGRenderer.ts#L3629](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3629)  
  Builds full grid path from `ox/oy` and `ss`.

## OGS 5) Star points (`hoshi`) in grid coordinates

Formula:
- Star point center uses same grid transform:  
  `cx = ox + hx * ss`, `cy = oy + hy * ss`  
  where `(hx, hy)` are zero-based indices in hardcoded arrays per board size.

Reference:
- [SVGRenderer.ts#L3652](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3652)  
  Hoshi coordinates for 19/13/9.
- [SVGRenderer.ts#L3692](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3692)  
  Converts hoshi indices to pixel positions.

## OGS 6) Coordinate labels: placement vs numbering origin

Side placement conditions:
- Top labels only when `draw_top_labels` and `bounds.top === 0`
- Bottom labels only when `draw_bottom_labels` and `bounds.bottom === H - 1`
- Left labels only when `draw_left_labels` and `bounds.left === 0`
- Right labels only when `draw_right_labels` and `bounds.right === W - 1`

Reference:
- [SVGRenderer.ts#L3855](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3855)  
  Side-by-side checks before drawing each coordinate strip.

Horizontal coordinate placement:
- `x = (i - bounds.left - (bounds.left > 0 ? L : 0)) * ss + ss/2`
- `y = j * ss + ss/2`

Reference:
- [SVGRenderer.ts#L3774](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3774)  
  Horizontal text position formula for both display systems.

Vertical coordinate placement:
- `x = i * ss + ss/2`
- `y = (j - bounds.top - (bounds.top > 0 ? T : 0)) * ss + ss/2`

Reference:
- [SVGRenderer.ts#L3803](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3803)  
  Vertical text position formula.

Numbering origin behavior:
- `A1`: vertical labels are `H, H-1, ... , 1` (origin effectively bottom-left)
- `1-1`: vertical labels are `一, 二, 三, ...` from top to bottom (origin effectively top-left)

References:
- [SVGRenderer.ts#L3801](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3801)  
  `A1` vertical uses `this.height - c`.
- [SVGRenderer.ts#L3813](https://github.com/online-go/goban/blob/4772659d69e4eb5ea67646c030a43dbaa5a4ed09/src/Goban/SVGRenderer.ts#L3813)  
  `1-1` vertical uses ascending Japanese numerals by `c`.

## OGS 7) Practical mapping for our template generator

To match OGS stone placement, derive template geometry from these quantities:
- `ss`: chosen square size
- `BW`, `BH`: bounded board dimensions
- `L`, `R`, `T`, `B`: side label flags
- `ox`, `oy`: computed as in section 4

Then:
- grid left/top intersection center = `(ox, oy)`
- grid right/bottom intersection center = `(ox + (W - 1) * ss, oy + (H - 1) * ss)`
- board pixel extents = `metrics.width`/`metrics.height` from section 3

This is the minimum needed to make template intersections align with OGS stone placement.

## Generator LayoutMetrics initialization from options

This section describes how to initialize `LayoutMetrics` directly from Goban Generator options, without using target-client internal naming.

### Common inputs from options
- `boardSize`: controls grid line count (`lineCount`).
- `coordinateDisplay`: controls which label margins are present on each side.
- `coordinateLettering`: affects label values/origin semantics only, not geometry.
- `outputFormat`: selects the target-client board proportions.
- `includeGrid`, `drawBoardEdges`, `imageEdgeMarginMode`: do not change intersection coordinates directly.

### GoPanda2/Pandanet LayoutMetrics path

Pandanet uses a square board area. The board background, grid canvas, and visible grid are all square, but they describe different parts of the board:
- Board area: the full square visual board, including the outer margin.
- Grid: the square line lattice from the first line to the last line.
- Cell size: the spacing between adjacent board points.
- Margin: the empty board area between the board edge and the first/last grid line.

For 19x19 without coordinate labels:
- Board width = `19.4` cell sizes.
- Grid line span = `18` cell sizes.
- Edge-to-first-line margin = `0.7` cell sizes.
- Margin as board width = `3.61%`.
- Margin as grid span = `3.89%`.

For 19x19 with coordinate labels:
- Board width = `20.4` cell sizes.
- Grid line span = `18` cell sizes.
- Edge-to-first-line margin = `1.2` cell sizes.
- Margin as board width = `5.88%`.
- Margin as grid span = `6.67%`.

For other board sizes, apply the same margin-cell rule around a `(boardSize - 1)` grid span:
- `marginCells = 0.7` when `coordinateDisplay` is `none`.
- `marginCells = 1.2` when coordinates are enabled.
- `boardWidthCells = (boardSize - 1) + 2 * marginCells`.
- `gridSpanCells = boardSize - 1`.

### OGS/print LayoutMetrics path

OGS and print currently share the same template geometry. The formulas below derive the OGS-style board and grid metrics from generator options.

#### Side label margins derived from `coordinateDisplay`

Initialize four booleans:
- `hasTopLabels`
- `hasBottomLabels`
- `hasLeftLabels`
- `hasRightLabels`

Mapping:
- `none` -> all false
- `all` -> all true
- `top_left` -> top/left true
- `top_right` -> top/right true
- `bottom_left` -> bottom/left true
- `bottom_right` -> bottom/right true

#### Base values

Initialize:
- `lineCount = boardSize`
- `boundedGridWidth = boardSize`
- `boundedGridHeight = boardSize`
- `imageWidthPx` and `imageHeightPx` from the chosen render target size

#### Square size for alignment

Use one cell size in pixels:
- `squareSizePx = floor(targetDisplayWidthPx / max(
  boundedGridWidth + hasLeftLabels + hasRightLabels,
  boundedGridHeight + hasTopLabels + hasBottomLabels
))`

Then initialize:
- `imageWidthPx = squareSizePx * (boundedGridWidth + hasLeftLabels + hasRightLabels)`
- `imageHeightPx = squareSizePx * (boundedGridHeight + hasTopLabels + hasBottomLabels)`

#### Grid origin (first intersection center)

Initialize:
- `gridOriginXPx = (hasLeftLabels ? squareSizePx : 0) + round(squareSizePx / 2)`
- `gridOriginYPx = (hasTopLabels ? squareSizePx : 0) + round(squareSizePx / 2)`

For full-board view this is sufficient.

#### Grid bounds

Initialize:
- `gridLeftPx = gridOriginXPx`
- `gridTopPx = gridOriginYPx`
- `gridRightPx = gridOriginXPx + (lineCount - 1) * squareSizePx`
- `gridBottomPx = gridOriginYPx + (lineCount - 1) * squareSizePx`

#### Board bounds

Initialize board rectangle from grid bounds plus board-edge margins:
- `boardEdgeMarginTopPx`
- `boardEdgeMarginBottomPx`
- `boardEdgeMarginLeftPx`
- `boardEdgeMarginRightPx`
- `boardLeftPx = gridLeftPx - boardEdgeMarginLeftPx`
- `boardTopPx = gridTopPx - boardEdgeMarginTopPx`
- `boardRightPx = gridRightPx + boardEdgeMarginRightPx`
- `boardBottomPx = gridBottomPx + boardEdgeMarginBottomPx`
- `boardWidthPx = boardRightPx - boardLeftPx`
- `boardHeightPx = boardBottomPx - boardTopPx`

### Coordinate labels shared by targets

Geometry:
- Label placement comes from `coordinateDisplay` side booleans only.

Label values:
- `a1` -> vertical labels descend from top to bottom (`lineCount ... 1`), origin semantics bottom-left.
- `numeric_japanese` -> vertical labels ascend from top to bottom (`1 ... lineCount` in Japanese numerals), origin semantics top-left.
