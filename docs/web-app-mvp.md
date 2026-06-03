# Web app MVP design

Technical design for the first implementation milestone: generate deterministic template images and test image-generation models against them.

## Goal
- Build enough of the web app to:
  - generate template images for board geometry,
  - call image-generation models with template + prompt (+ optional style image),
  - compare outputs for geometry fidelity and visual quality.

## Scope for this MVP
- In scope:
  - Deterministic template generation (SVG and rasterized PNG).
  - Model testing UI for side-by-side runs.
  - OpenAI adapter and Gemini adapter.
  - In-memory API key entry.
  - Save/download test artifacts (options, prompt, template, output image, metadata).
- Out of scope:
  - Final print PDF generation.
  - Final OGS zip packaging.
  - User accounts or backend persistence.

## Architecture choices and motivation

| Choice | Decision | Motivation |
|---|---|---|
| App runtime | React + TypeScript + Vite, static hosting | Fast iteration and no backend requirement for MVP |
| UI components | shadcn/ui for forms and panels | Consistent UI with minimal custom component work |
| Options validation | Define options schema with Zod | Prevent invalid combinations and simplify adapter logic |
| Geometry model | Normalize geometry in one domain module (`layout.ts`) | Avoid duplicated math and alignment drift |
| Template format | Generate SVG first, rasterize to PNG for model input | SVG is deterministic/editable; PNG is compatible with model APIs |
| Model integration | Provider adapter interface (`ImageProvider`) | Swap models without changing UI/business flow |
| Key management | Keep keys in memory only; never store in local/session storage | Aligns with current security decision and static-app constraints |
| Test workflow | Side-by-side outputs + template overlay + zoom | Quickly detect grid/label distortion across models |
| Reproducibility | Export run artifacts as JSON + images | Enables consistent A/B comparisons and bug reports |

## Proposed modules

`src/domain`
- `options.ts`: option types, defaults, Zod schema, validation rules.
- `layout.ts`: board geometry calculations and pixel/mm conversions used by template generation.

`src/template`
- `buildTemplateSvg.ts`: pure function `(options) => svg string`.
- `rasterizeSvg.ts`: convert SVG to PNG blob/data URL for provider input.
- `templateLayers.ts`: layer toggles (grid, labels, board edge, palette hints).

`src/providers`
- `types.ts`: shared request/response contracts.
- `openai.ts`: OpenAI implementation (image edit flow).
- `gemini.ts`: Gemini implementation (image generation/edit flow).
- `factory.ts`: provider selection and capability checks.

`src/features/test-lab`
- `TestLabPage.tsx`: main workflow UI.
- `OptionsPanel.tsx`: form controls and validation state.
- `PromptPanel.tsx`: prompt and style image input.
- `RunPanel.tsx`: run status, cancel/retry.
- `ComparePanel.tsx`: output previews, overlay, zoom.
- `ArtifactPanel.tsx`: download run bundle.

`src/lib`
- `image.ts`: blob/data URL helpers.
- `download.ts`: artifact export utilities.
- `log.ts`: structured run logs for debugging.

## Data contracts (MVP)

`GenerationOptions`
- `boardSize`: `9 | 13 | 19`
- `outputFormat`: `"ogs" | "gopanda2" | "print"`
- `includeGrid`: boolean (for print this is forced to `true`)
- `coordinateDisplay`: `"none" | "all" | "top_left" | "top_right" | "bottom_left" | "bottom_right"` (requires `includeGrid`; controls label placement only)
- `coordinateLettering`: `"a1" | "numeric_japanese"` (used when `coordinateDisplay != "none"`; defines origin: `a1` bottom-left, `numeric_japanese` upper-left)
- `drawBoardEdges`: boolean
- `imageEdgeMarginMode`: `"transparent" | "extend_theme" | "prompt_or_image"`
- `palette`: optional board/stone colors

`TemplateAsset`
- `svg`: string
- `pngBlob`: Blob
- `widthPx`: number
- `heightPx`: number
- `meta`: geometry values used during generation

`GenerationRun`
- `provider`: `"openai" | "gemini"`
- `model`: string
- `prompt`: string
- `options`: `GenerationOptions`
- `template`: `TemplateAsset`
- `styleImage`: optional user image
- `resultImage`: model output image
- `timingMs`, `status`, `error`

## Request flow (single run)
1. User updates options and prompt.
2. Validate options with schema and derived rules.
3. Generate template SVG from `layout.ts`.
4. Rasterize SVG to PNG.
5. Build provider request payload.
6. Send request with in-memory API key.
7. Render output and save run metadata.
8. Optionally export artifact bundle.

## Provider adapter shape
```ts
export interface ImageProvider {
  id: "openai" | "gemini";
  generate(input: {
    apiKey: string;
    model: string;
    prompt: string;
    templatePng: Blob;
    styleImage?: Blob;
    options: GenerationOptions;
  }): Promise<{
    image: Blob;
    raw?: unknown;
  }>;
}
```

## MVP acceptance criteria
- Template image generation works for 9x9, 13x13, and 19x19.
- Template layers reflect options consistently.
- OpenAI and Gemini runs can be executed from the UI.
- Result images can be visually compared with overlay and zoom.
- Run artifacts can be downloaded.
- API keys are not persisted and are cleared on reload.

## Risks and mitigation
- Risk: model distorts thin lines and labels.
  - Mitigation: add stronger template hints and compare across providers/models.
- Risk: transparency quality is inconsistent.
  - Mitigation: keep chroma-key fallback as an experiment path.
- Risk: provider API surface changes.
  - Mitigation: isolate each provider behind adapters and capability flags.
