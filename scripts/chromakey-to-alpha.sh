#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  chromakey-to-alpha.sh INPUT OUTPUT [FUZZ]
  chromakey-to-alpha.sh INPUT OUTPUT [--key auto|green|black] [--color COLOR] [--fuzz FUZZ]
                         [--despill none|green] [--despill-strength 0..1]

Converts a solid or chroma-key background to true PNG alpha.

Modes:
  --key auto    Use the top-left pixel as the key color. Default fuzz: 12%.
  --key green   Use chroma green (#00ff00). Default fuzz: 12%.
  --key black   Use black. Default fuzz: 3%.
  --color COLOR Use an explicit ImageMagick color. Default fuzz: 12%.

Despill:
  --despill green           Neutralize green fringe pixels after alpha conversion.
  --despill-strength VALUE  Default: 1. Lower values preserve more original green.

Legacy form INPUT OUTPUT [FUZZ] removes black, matching the old black-to-alpha helper.
USAGE
}

if [[ $# -lt 2 ]]; then
  usage >&2
  exit 2
fi

input="$1"
output="$2"
shift 2

key="auto"
color=""
fuzz=""
despill="none"
despill_strength="1"

if [[ $# -eq 1 && "${1:-}" != --* ]]; then
  key="black"
  fuzz="$1"
  shift
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --key)
      key="${2:-}"
      shift 2
      ;;
    --color)
      color="${2:-}"
      key="custom"
      shift 2
      ;;
    --fuzz)
      fuzz="${2:-}"
      shift 2
      ;;
    --despill)
      despill="${2:-}"
      shift 2
      ;;
    --despill-strength)
      despill_strength="${2:-}"
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

if ! command -v magick >/dev/null 2>&1; then
  echo "Missing dependency: magick" >&2
  exit 1
fi

if [[ ! -f "$input" ]]; then
  echo "Input image not found: $input" >&2
  exit 1
fi

case "$key" in
  auto)
    color="$(magick "$input" -format '%[pixel:p{0,0}]' info:)"
    fuzz="${fuzz:-12%}"
    ;;
  green)
    color="#00ff00"
    fuzz="${fuzz:-12%}"
    ;;
  black)
    color="black"
    fuzz="${fuzz:-3%}"
    ;;
  custom)
    if [[ -z "$color" ]]; then
      echo "--color requires a color value" >&2
      exit 2
    fi
    fuzz="${fuzz:-12%}"
    ;;
  *)
    echo "Unsupported key mode: $key" >&2
    usage >&2
    exit 2
    ;;
esac

tmp_output=""
if [[ "$despill" != "none" ]]; then
  tmp_output="$(mktemp "${TMPDIR:-/tmp}/chromakey-to-alpha.XXXXXX.png")"
  trap 'rm -f "$tmp_output"' EXIT
fi

alpha_output="${tmp_output:-$output}"
magick "$input" -alpha set -fuzz "$fuzz" -transparent "$color" "$alpha_output"

case "$despill" in
  none)
    ;;
  green)
    magick "$alpha_output" -channel G -fx "min(g, ((r + b) / 2) + (g - ((r + b) / 2)) * (1 - $despill_strength))" +channel "$output"
    ;;
  *)
    echo "Unsupported despill mode: $despill" >&2
    usage >&2
    exit 2
    ;;
esac

channels="$(magick identify -format '%[channels]' "$output")"
echo "Wrote $output using key $color with fuzz $fuzz, despill $despill; channels: $channels"
