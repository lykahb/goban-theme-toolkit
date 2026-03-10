export interface TemplateLayerConfig {
  includeGrid: boolean;
  includeCoordinates: boolean;
  includeBoardEdge: boolean;
  imageMarginMode: "transparent" | "extend_theme" | "prompt_or_image";
}
