export type Align = "left" | "right" | "center";
export type Fit = "shrink" | "fill" | "none";

export interface FontCandidate {
  id: string;
  family: string;
  weight: number;
  score: number;
}

export interface Shadow {
  dx_px: number;
  dy_px: number;
  blur_px: number;
  color: string;
  opacity: number;
}

export interface Gradient {
  from: string;
  to: string;
  axis: "v" | "h";
}

export interface BlockStyle {
  font_id: string;
  font_candidates: FontCandidate[];
  size_px: number;
  color: string;
  gradient: Gradient | null;
  stroke_width_px: number;
  stroke_color: string;
  shadow: Shadow | null;
  blur_px: number;
  align: Align;
  hscale: number;
  opacity: number;
}

export interface Block {
  id: string;
  quad: [number, number][];
  outline: [number, number][];
  angle: number;
  text: string;
  ocr: { confidence: number; engine: string; script: "arabic" | "latin" };
  direction: "rtl" | "ltr";
  style: BlockStyle;
  placement: { anchor_x: number; baseline_y: number; align: Align; ink: number[] };
  match_score: number;
  paragraph?: string;
  manual?: boolean;
}

export interface ImageMeta {
  image_id: string;
  width: number;
  height: number;
  name: string;
  blocks: Block[];
  timing?: { detect: number; total: number };
}

export interface Edit {
  block_id: string;
  text: string;
  remove?: boolean;
  font_id?: string;
  size_px?: number;
  color?: string;
  gradient?: Gradient | null;
  stroke_width_px?: number;
  stroke_color?: string;
  shadow?: Shadow | null;
  blur_px?: number;
  opacity?: number;
  align?: Align;
  fit?: Fit;
  hscale?: number;
  dx?: number;
  dy?: number;
}

export type EditMap = Record<string, Edit>;

export interface FontInfo {
  id: string;
  family: string;
  weight: number;
  script: "arabic" | "latin";
  custom: boolean;
}

export interface Rule {
  find: string;
  replace: string;
  case_sensitive?: boolean;
  whole_word?: boolean;
}

export type ExportFormat = "png" | "jpeg" | "webp";
