#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  split-image-assets.sh --input IMAGE --layout LAYOUT.json --out OUT_DIR [--debug DEBUG_DIR]
                        [--output-scale SCALE] [--search-scale SCALE]

Splits an image into PNG assets using relative layout hints and local foreground detection.
Requires ImageMagick's `magick` command and `jq`.
USAGE
}

input=""
layout=""
out_dir=""
debug_dir=""
output_scale_override=""
search_scale_override=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --input)
      input="${2:-}"
      shift 2
      ;;
    --layout)
      layout="${2:-}"
      shift 2
      ;;
    --out)
      out_dir="${2:-}"
      shift 2
      ;;
    --debug)
      debug_dir="${2:-}"
      shift 2
      ;;
    --output-scale)
      output_scale_override="${2:-}"
      shift 2
      ;;
    --search-scale)
      search_scale_override="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$input" || -z "$layout" || -z "$out_dir" ]]; then
  usage >&2
  exit 2
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "Missing dependency: magick" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Missing dependency: jq" >&2
  exit 1
fi

if [[ ! -f "$input" ]]; then
  echo "Input image not found: $input" >&2
  exit 1
fi

if [[ ! -f "$layout" ]]; then
  echo "Layout file not found: $layout" >&2
  exit 1
fi

units_width="$(jq -r '.units.width // empty' "$layout")"
units_height="$(jq -r '.units.height // empty' "$layout")"
search_scale="$(jq -r '.extraction.searchScale // 1.25' "$layout")"
output_scale="$(jq -r '.extraction.outputScale // 1.2' "$layout")"
mask_mode="$(jq -r '.extraction.mask // "auto"' "$layout")"

if [[ -n "$search_scale_override" ]]; then
  search_scale="$search_scale_override"
fi

if [[ -n "$output_scale_override" ]]; then
  output_scale="$output_scale_override"
fi

if [[ -z "$units_width" || -z "$units_height" ]]; then
  echo "Layout must define .units.width and .units.height" >&2
  exit 1
fi

dimensions="$(magick identify -format '%w %h' "$input")"
read -r image_width image_height <<<"$dimensions"
mkdir -p "$out_dir"

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/split-image-assets.XXXXXX")"
trap 'rm -rf "$tmp_dir"' EXIT

cell_width="$(jq -n --argjson width "$image_width" --argjson units "$units_width" '($width / $units)')"
cell_height="$(jq -n --argjson height "$image_height" --argjson units "$units_height" '($height / $units)')"
cell_side="$(jq -n --argjson w "$cell_width" --argjson h "$cell_height" 'if $w < $h then $w else $h end')"
search_side="$(jq -n --argjson side "$cell_side" --argjson scale "$search_scale" '($side * $scale) | round')"

alpha_stats="$(magick "$input" -alpha extract -format '%[min] %[max]' info:)"
read -r alpha_min alpha_max <<<"$alpha_stats"
detect_from_alpha="false"
if [[ "$mask_mode" == "alpha" || ( "$mask_mode" == "auto" && "$alpha_min" != "$alpha_max" ) ]]; then
  detect_from_alpha="true"
fi

metadata_jsonl=""
draw_file=""
if [[ -n "$debug_dir" ]]; then
  mkdir -p "$debug_dir"
  metadata_jsonl="$debug_dir/detections.jsonl"
  draw_file="$debug_dir/detections.mvg"
  : > "$metadata_jsonl"
  {
    echo "stroke '#00a3ff'"
    echo "fill none"
    echo "stroke-width 2"
  } > "$draw_file"
fi

asset_count="$(
  jq -r '[.groups[] | ((.rows | length) * (.columns | length))] | add // 0' "$layout"
)"

detections_jsonl="$tmp_dir/detections.jsonl"
: > "$detections_jsonl"

jq -c '
  .groups[]
  | .prefix as $prefix
  | [
      .rows[] as $row
      | .columns[] as $column
      | {prefix: $prefix, row: $row, column: $column}
    ]
  | to_entries[]
  | {prefix: .value.prefix, row: .value.row, column: .value.column, sequence: (.key + 1)}
' "$layout" | while IFS= read -r crop; do
  prefix="$(jq -r '.prefix' <<<"$crop")"
  row="$(jq -r '.row' <<<"$crop")"
  column="$(jq -r '.column' <<<"$crop")"
  sequence="$(jq -r '.sequence' <<<"$crop")"

  expected_center_x="$(jq -n --argjson column "$column" --argjson width "$image_width" --argjson units "$units_width" '((($column + 0.5) / $units) * $width) | round')"
  expected_center_y="$(jq -n --argjson row "$row" --argjson height "$image_height" --argjson units "$units_height" '((($row + 0.5) / $units) * $height) | round')"
  search_x=$((expected_center_x - search_side / 2))
  search_y=$((expected_center_y - search_side / 2))
  if (( search_x < 0 )); then search_x=0; fi
  if (( search_y < 0 )); then search_y=0; fi
  search_right=$((search_x + search_side))
  search_bottom=$((search_y + search_side))
  if (( search_right > image_width )); then search_right=$image_width; fi
  if (( search_bottom > image_height )); then search_bottom=$image_height; fi
  search_width=$((search_right - search_x))
  search_height=$((search_bottom - search_y))
  search_geometry="${search_width}x${search_height}+${search_x}+${search_y}"
  mask_file="$tmp_dir/mask-${prefix}-${sequence}.png"

  if [[ "$detect_from_alpha" == "true" ]]; then
    magick "$input" -crop "$search_geometry" +repage -alpha extract -threshold 1% "$mask_file"
  else
    magick "$input" -crop "$search_geometry" +repage -alpha off -colorspace Gray \
      -threshold 94% -negate -morphology Close Disk:1 -morphology Open Disk:1 "$mask_file"
  fi

  component_bbox="$(
    magick "$mask_file" -define connected-components:verbose=true -connected-components 8 null: |
      awk '/gray\(255\)/ { area=$4 + 0; if (area > best) { best = area; box = $2 } } END { if (best > 0) print box }'
  )"

  detected_center_x="$expected_center_x"
  detected_center_y="$expected_center_y"
  component_width=0
  component_height=0
  component_abs_x="$expected_center_x"
  component_abs_y="$expected_center_y"
  detection_area=0
  if [[ "$component_bbox" =~ ^([0-9]+)x([0-9]+)\+([0-9]+)\+([0-9]+)$ ]]; then
    component_width="${BASH_REMATCH[1]}"
    component_height="${BASH_REMATCH[2]}"
    component_x="${BASH_REMATCH[3]}"
    component_y="${BASH_REMATCH[4]}"
    component_abs_x=$((search_x + component_x))
    component_abs_y=$((search_y + component_y))
    detected_center_x=$((search_x + component_x + component_width / 2))
    detected_center_y=$((search_y + component_y + component_height / 2))
    detection_area=$((component_width * component_height))
  fi

  filename="$(printf '%s-%02d.png' "$prefix" "$sequence")"

  jq -c -n \
    --arg prefix "$prefix" \
    --arg filename "$filename" \
    --arg maskFile "$mask_file" \
    --arg mask "$([[ "$detect_from_alpha" == "true" ]] && echo "alpha" || echo "fallback")" \
    --argjson row "$row" \
    --argjson column "$column" \
    --argjson sequence "$sequence" \
    --argjson expectedCenterX "$expected_center_x" \
    --argjson expectedCenterY "$expected_center_y" \
    --argjson detectedCenterX "$detected_center_x" \
    --argjson detectedCenterY "$detected_center_y" \
    --argjson componentX "$component_abs_x" \
    --argjson componentY "$component_abs_y" \
    --argjson componentWidth "$component_width" \
    --argjson componentHeight "$component_height" \
    --argjson searchX "$search_x" \
    --argjson searchY "$search_y" \
    --argjson searchWidth "$search_width" \
    --argjson searchHeight "$search_height" \
    --argjson detectionArea "$detection_area" \
    '{prefix: $prefix, filename: $filename, maskFile: $maskFile, row: $row, column: $column, sequence: $sequence, mask: $mask, expectedCenter: {x: $expectedCenterX, y: $expectedCenterY}, detectedCenter: {x: $detectedCenterX, y: $detectedCenterY}, detectionBounds: {x: $componentX, y: $componentY, width: $componentWidth, height: $componentHeight}, search: {x: $searchX, y: $searchY, width: $searchWidth, height: $searchHeight}, detectionArea: $detectionArea}' \
    >> "$detections_jsonl"
done

max_detection_side="$(
  jq -s -r '[.[] | (.detectionBounds.width, .detectionBounds.height)] | max // 0' "$detections_jsonl"
)"
if [[ "$max_detection_side" == "0" ]]; then
  max_detection_side="$(jq -n --argjson side "$cell_side" '($side) | round')"
fi
output_side="$(jq -n --argjson side "$max_detection_side" --argjson scale "$output_scale" '($side * $scale) | round')"

while IFS= read -r detection; do
  filename="$(jq -r '.filename' <<<"$detection")"
  detected_center_x="$(jq -r '.detectedCenter.x' <<<"$detection")"
  detected_center_y="$(jq -r '.detectedCenter.y' <<<"$detection")"
  mask_file="$(jq -r '.maskFile' <<<"$detection")"
  component_x="$(jq -r '.detectionBounds.x' <<<"$detection")"
  component_y="$(jq -r '.detectionBounds.y' <<<"$detection")"
  component_width="$(jq -r '.detectionBounds.width' <<<"$detection")"
  component_height="$(jq -r '.detectionBounds.height' <<<"$detection")"
  search_x="$(jq -r '.search.x' <<<"$detection")"
  search_y="$(jq -r '.search.y' <<<"$detection")"

  x=$((detected_center_x - output_side / 2))
  y=$((detected_center_y - output_side / 2))

  asset_file="$tmp_dir/asset-$filename"
  magick "$input" -background none -gravity center \
    -extent "$((image_width + output_side * 2))x$((image_height + output_side * 2))" \
    +gravity \
    -crop "${output_side}x${output_side}+$((x + output_side))+$((y + output_side))" +repage \
    "$asset_file"

  if (( component_width > 0 && component_height > 0 )); then
    component_mask="$tmp_dir/component-mask-$filename"
    output_mask="$tmp_dir/output-mask-$filename"
    component_rel_x=$((component_x - search_x))
    component_rel_y=$((component_y - search_y))
    component_out_x=$((component_x - x))
    component_out_y=$((component_y - y))

    magick "$mask_file" -crop "${component_width}x${component_height}+${component_rel_x}+${component_rel_y}" +repage "$component_mask"
    magick -size "${output_side}x${output_side}" xc:black "$component_mask" \
      -geometry "+${component_out_x}+${component_out_y}" -compose over -composite "$output_mask"
    magick "$asset_file" "$output_mask" -alpha off -compose CopyOpacity -composite "$out_dir/$filename"
  else
    mv "$asset_file" "$out_dir/$filename"
  fi

  if [[ -n "$debug_dir" ]]; then
    crop_right=$((x + output_side))
    crop_bottom=$((y + output_side))
    jq \
      --argjson cropX "$x" \
      --argjson cropY "$y" \
      --argjson outputSide "$output_side" \
      '. + {crop: {x: $cropX, y: $cropY, side: $outputSide}, output: {side: $outputSide}}' \
      <<<"$detection" >> "$metadata_jsonl"

    {
      echo "stroke '#00a3ff'"
      echo "fill none"
      echo "rectangle $x,$y $crop_right,$crop_bottom"
      echo "stroke '#ff365e'"
      echo "fill '#ff365e'"
      echo "circle $detected_center_x,$detected_center_y $((detected_center_x + 3)),$detected_center_y"
    } >> "$draw_file"
  fi
done < "$detections_jsonl"

if [[ -n "$debug_dir" ]]; then
  jq -s . "$metadata_jsonl" > "$debug_dir/detections.json"
  rm -f "$metadata_jsonl"
  magick "$input" -draw "@$draw_file" "$debug_dir/detections.png"
fi

echo "Wrote $asset_count PNG assets to $out_dir"
