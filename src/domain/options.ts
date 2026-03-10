import { z } from "zod";

export const boardSizeSchema = z.union([z.literal(9), z.literal(13), z.literal(19)]);
export const outputFormatSchema = z.union([z.literal("online"), z.literal("print")]);
export const imageEdgeMarginModeSchema = z.union([
  z.literal("transparent"),
  z.literal("extend_theme"),
  z.literal("prompt_or_image")
]);
export const coordinateDisplaySchema = z.union([
  z.literal("none"),
  z.literal("all"),
  z.literal("top_left"),
  z.literal("top_right"),
  z.literal("bottom_left"),
  z.literal("bottom_right")
]);
export const coordinateLetteringSchema = z.union([z.literal("a1"), z.literal("numeric_japanese")]);

export const generationOptionsSchema = z
  .object({
    boardSize: boardSizeSchema,
    outputFormat: outputFormatSchema,
    includeGrid: z.boolean(),
    coordinateDisplay: coordinateDisplaySchema,
    coordinateLettering: coordinateLetteringSchema,
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
    if (!value.includeGrid && value.coordinateDisplay !== "none") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Coordinates require grid to be enabled.",
        path: ["coordinateDisplay"]
      });
    }
  });

export type GenerationOptions = z.infer<typeof generationOptionsSchema>;
export type OutputFormat = z.infer<typeof outputFormatSchema>;
export type ImageEdgeMarginMode = z.infer<typeof imageEdgeMarginModeSchema>;
export type CoordinateDisplay = z.infer<typeof coordinateDisplaySchema>;
export type CoordinateLettering = z.infer<typeof coordinateLetteringSchema>;

export const defaultGenerationOptions: GenerationOptions = {
  boardSize: 19,
  outputFormat: "online",
  includeGrid: true,
  coordinateDisplay: "none",
  coordinateLettering: "a1",
  drawBoardEdges: false,
  imageEdgeMarginMode: "extend_theme"
};

export function normalizeOptions(input: GenerationOptions): GenerationOptions {
  if (input.outputFormat === "print" && !input.includeGrid) {
    return { ...input, includeGrid: true };
  }
  if (!input.includeGrid && input.coordinateDisplay !== "none") {
    return { ...input, coordinateDisplay: "none" };
  }
  return input;
}
