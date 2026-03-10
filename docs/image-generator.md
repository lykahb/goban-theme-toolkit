# Image generator

Requirements and decisions on model and how to call it.

## Requirements
- Must take both images (for layout and palette) and prompts as inputs.
- Can relate the parts of geometry on the template image to the prompt.
- Can convert the geometric layout and labels into stylized theme. Does not remove or distort the critical parts.
- Can be called with an API key, as opposed to consumer-facing app-only access.
- Can be used to generate images with transparent parts or solid color. The solid color that stands out can be removed with post-processing, as in Chroma key.

## Research snapshot (2026-03-10)

### Candidate providers

#### 1) OpenAI Images API (GPT Image models)
Fit to requirements:
- Supports generation and editing from prompt and input image(s) (`/images/edits`).
- Supports multiple input images for GPT image models (up to 16 in edit mode).
- Supports transparent background with `background=transparent` and `output_format` of `png` or `webp`.
- Supports mask-based editing and `input_fidelity` controls for matching input image details.
- Uses API key auth (`Authorization: Bearer`).

Notes:
- Strong candidate for MVP due to direct transparency support and simple API.
- Geometry preservation on thin lines and labels still needs a focused PoC.

Sources:
- https://platform.openai.com/docs/api-reference/images/create
- https://platform.openai.com/docs/api-reference/images/object
- https://platform.openai.com/docs/guides/images/image-generation
- https://platform.openai.com/docs/guides/tools-image-generation/

#### 2) Google Vertex AI Imagen (editing API)
Fit to requirements:
- Supports editing with prompt plus reference images.
- Masked editing is explicit with `REFERENCE_TYPE_RAW` and `REFERENCE_TYPE_MASK`.
- Supports PNG/JPEG output (`outputOptions.mimeType`).
- API access is production-grade (GCP project + auth flow).

Notes:
- Very strong on structured edit workflows and mask semantics.
- Docs confirm PNG output but do not clearly guarantee alpha-channel transparency for generated backgrounds. This must be validated in PoC.
- API has extra operational setup (project, region, IAM/service account).

Sources:
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/imagen-api-edit
- https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/edit-images-overview

#### 3) Google Gemini image models (Nano Banana / Nano Banana Pro)
Fit to requirements:
- Supports text-to-image and text+image editing (`generateContent` with image inputs).
- Supports conversational inpainting (semantic masking via prompt instructions).
- Supports many reference images in Gemini 3 image models (up to 14 total with model-specific splits for character/object fidelity).
- API key-based access is available.

Notes:
- Strong candidate for template-driven multi-image workflows and iterative edits.
- Docs explicitly recommend prompting for transparent background for stickers/assets, but do not document a hard output alpha/transparency API switch. Transparency reliability must be validated in PoC.
- All generated images include SynthID watermark.
- Model lineup includes preview models (`gemini-3.1-flash-image-preview`, `gemini-3-pro-image-preview`), so behavior may evolve.

Sources:
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/nanobanana

#### 4) Leonardo API
Fit to requirements:
- Supports API-key based generation endpoints.
- Supports transparency mode (`transparency: foreground_only`) with PNG output.
- Supports image-to-image guidance and ControlNet-like guidance with input images.

Notes:
- Good feature coverage for transparency + image guidance.
- Some guidance features are marked as legacy / partial parity in docs, so API stability and long-term compatibility should be tested carefully.

Sources:
- https://docs.leonardo.ai/docs/generate-images-using-transparency
- https://docs.leonardo.ai/docs/generate-images-using-image-to-image-guidance
- https://docs.leonardo.ai/docs/api-faq
- https://leonardo.ai/api/

#### 5) Self-hosted open-source stack (Diffusers + ControlNet)
Fit to requirements:
- Strongest direct control over structure via ControlNet (canny/sketch/depth/pose controls).
- Supports inpainting with explicit masks and prompt conditioning.

Notes:
- Best option for strict geometry control and custom workflows.
- Requires backend/server and GPU operations, which is outside current "single page app on GitHub Pages" constraints unless a server is introduced.

Sources:
- https://huggingface.co/docs/diffusers/using-diffusers/controlnet
- https://huggingface.co/docs/diffusers/en/using-diffusers/inpaint

## Recommendation

### MVP recommendation
- Use OpenAI Images API (GPT image model) for board and stone generation.
- Use image edit mode with template image as input and prompt for theme transfer.
- For transparency needs, set `background=transparent` and output `png`.
- Keep API key in memory only (no persistence), as described in tech decisions.

Why this is the MVP choice:
- Covers all hard requirements with the least integration overhead.
- Direct transparent output avoids brittle post-processing for many cases.
- Supports multi-image input and mask editing for template-driven workflows.

Where Nano Banana is stronger:
- Multi-reference workflows and iterative image editing patterns are very strong.
- For a future server-backed version, it is a strong alternative if we accept SynthID watermark and confirm transparency behavior in tests.

### Post-MVP path if geometry fidelity is insufficient
- Evaluate either:
  - Vertex AI Imagen masked workflow, or
  - self-hosted ControlNet pipeline on a server.
- Add a deterministic post-process overlay for critical geometry (grid/labels) if model drift remains too high for thin lines.

## PoC checklist (must pass before lock-in)
- Geometry preservation:
  - 9x9, 13x13, 19x19 test templates.
  - Corners and outer intersections remain aligned after generation.
  - Labels remain readable and not deformed.
- Transparency:
  - Stone assets export with clean alpha edges.
  - Board edge margin modes produce expected transparent or themed regions.
- Palette:
  - Prompt + template palette hints are respected without reducing legibility.
- Operational:
  - API key entered by user, stored in memory only, cleared on reload.

## Open questions
- Which provider best preserves thin grid lines and coordinate glyphs under heavy style transfer?
- Should grid/coordinates be generated by AI in all modes, or be optionally re-applied deterministically after generation?
- If transparent output quality is inconsistent, should we add dual-background chroma-key fallback as a built-in pipeline?
