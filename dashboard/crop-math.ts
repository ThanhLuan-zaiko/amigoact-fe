// Pure geometry for the image cropper. The canvas viewport is the crop
// frame; the image sits underneath described by CropView (image-center
// position in viewport px, zoom over cover-fit, rotation, flips).

export interface Point {
  x: number;
  y: number;
}

export interface CropView {
  cx: number;
  cy: number;
  zoom: number;
  deg: number;
  flipH: boolean;
  flipV: boolean;
}

export interface CropFilters {
  brightness: number;
  contrast: number;
  saturation: number;
}

export const DEFAULT_FILTERS: CropFilters = { brightness: 1, contrast: 1, saturation: 1 };

export const VIEW_W = 520;
export const MAX_ZOOM = 4;

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(1, zoom));
}

export function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Axis-aligned bounds of a w x h rect rotated by deg (natural px, scale 1).
export function rotatedBounds(w: number, h: number, deg: number): Point {
  const r = toRad(deg);
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { x: w * c + h * s, y: w * s + h * c };
}

// Smallest scale at which the rotated image still covers the viewport.
export function coverScale(w: number, h: number, deg: number, viewW: number, viewH: number): number {
  const b = rotatedBounds(w, h, deg);
  return Math.max(viewW / b.x, viewH / b.y);
}

export function viewScale(view: CropView, w: number, h: number, viewW: number, viewH: number): number {
  return coverScale(w, h, view.deg, viewW, viewH) * view.zoom;
}

export function fitView(viewW: number, viewH: number, deg = 0, flipH = false, flipV = false): CropView {
  return { cx: viewW / 2, cy: viewH / 2, zoom: 1, deg, flipH, flipV };
}

// Keep the rotated image AABB covering the whole viewport.
export function clampCenter(view: CropView, w: number, h: number, viewW: number, viewH: number): Point {
  const scale = viewScale(view, w, h, viewW, viewH);
  const b = rotatedBounds(w, h, view.deg);
  const halfW = (b.x * scale) / 2;
  const halfH = (b.y * scale) / 2;
  return {
    x: Math.min(halfW, Math.max(viewW - halfW, view.cx)),
    y: Math.min(halfH, Math.max(viewH - halfH, view.cy)),
  };
}

// Fine-tilt part of a rotation: tiltOf(102) === 12, stepOf(102) === 90.
export function tiltOf(deg: number): number {
  return deg - Math.round(deg / 90) * 90;
}

export function stepOf(deg: number): number {
  return Math.round(deg / 90) * 90;
}

// Viewport px -> natural image px under a view.
export function imagePoint(view: CropView, w: number, h: number, px: number, py: number, viewW: number, viewH: number): Point {
  const r = toRad(view.deg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  const scale = viewScale(view, w, h, viewW, viewH);
  const dx = px - view.cx;
  const dy = py - view.cy;
  const u = dx * c + dy * s;
  const v = -dx * s + dy * c;
  const fx = view.flipH ? -1 : 1;
  const fy = view.flipV ? -1 : 1;
  return { x: u / (scale * fx) + w / 2, y: v / (scale * fy) + h / 2 };
}

// Transition from `view` to `next` while keeping the image point currently
// under (px, py) anchored at the same viewport position. Used for zoom-to-
// cursor, pinch, rotate and flip around the viewport center.
export function anchoredView(
  view: CropView,
  next: CropView,
  w: number,
  h: number,
  px: number,
  py: number,
  viewW: number,
  viewH: number,
): CropView {
  const q = imagePoint(view, w, h, px, py, viewW, viewH);
  const scale = viewScale(next, w, h, viewW, viewH);
  const r = toRad(next.deg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  const fx = next.flipH ? -1 : 1;
  const fy = next.flipV ? -1 : 1;
  const u = (q.x - w / 2) * scale * fx;
  const v = (q.y - h / 2) * scale * fy;
  const moved: CropView = { ...next, cx: px - (u * c - v * s), cy: py - (u * s + v * c) };
  const cc = clampCenter(moved, w, h, viewW, viewH);
  return { ...moved, cx: cc.x, cy: cc.y };
}

export function filterString(filters: CropFilters): string {
  if (filters.brightness === 1 && filters.contrast === 1 && filters.saturation === 1) return "none";
  return `brightness(${filters.brightness}) contrast(${filters.contrast}) saturate(${filters.saturation})`;
}
