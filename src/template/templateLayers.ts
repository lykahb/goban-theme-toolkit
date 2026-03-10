export interface TemplateLayerConfig {
  includeGrid: boolean;
  coordinateDisplay: "none" | "all" | "top_left" | "top_right" | "bottom_left" | "bottom_right";
  coordinateLettering: "a1" | "numeric_japanese";
  includeBoardEdge: boolean;
  imageMarginMode: "transparent" | "extend_theme" | "prompt_or_image";
}
