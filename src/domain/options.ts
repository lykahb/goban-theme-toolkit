import { z } from "zod";

export const boardSizeSchema = z.union([z.literal(9), z.literal(13), z.literal(19)]);
export const outputFormatSchema = z.union([z.literal("online"), z.literal("print")]);
export const imageEdgeMarginModeSchema = z.union([
  z.literal("transparent"),
  z.literal("extend_theme"),
  z.literal("prompt_or_image")
]);

export const generationOptionsSchema = z
  .object({
    boardSize: boardSizeSchema,
    outputFormat: outputFormatSchema,
    includeGrid: z.boolean(),
    includeCoordinates: z.boolean(),
    drawBoardEdges: z.boolean(),
    imageEdgeMarginMode: imageEdgeMarginModeSchema
  })
  .superRefine((value, ctx) => {
    if (value.outputFormat === "print" && !value.includeGrid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Grid must be enabled for print output.",
        path: ["includeGrid"]
      });
    }
    if (!value.includeGrid && value.includeCoordinates) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Coordinates require grid to be enabled.",
        path: ["includeCoordinates"]
      });
    }
  });

export type GenerationOptions = z.infer<typeof generationOptionsSchema>;
export type OutputFormat = z.infer<typeof outputFormatSchema>;
export type ImageEdgeMarginMode = z.infer<typeof imageEdgeMarginModeSchema>;

export const defaultGenerationOptions: GenerationOptions = {
  boardSize: 19,
  outputFormat: "online",
  includeGrid: true,
  includeCoordinates: false,
  drawBoardEdges: false,
  imageEdgeMarginMode: "extend_theme"
};

export function normalizeOptions(input: GenerationOptions): GenerationOptions {
  if (input.outputFormat === "print" && !input.includeGrid) {
    return { ...input, includeGrid: true, includeCoordinates: false };
  }
  if (!input.includeGrid && input.includeCoordinates) {
    return { ...input, includeCoordinates: false };
  }
  return input;
}
