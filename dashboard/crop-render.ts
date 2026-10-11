// Canvas rendering and export for the image cropper. Shares the CropView
// transform from crop-math so the export pixels match the preview exactly.

import type { CropFilters, CropView } from "./crop-math.ts";
import { filterString, toRad, viewScale } from "./crop-math.ts";

export const EXPORT_CAP = 2048;

export function isGifFile(file: File): boolean {
  return file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
}

export function pickOutputMime(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

function applyView(ctx: CanvasRenderingContext2D, view: CropView, w: number, h: number, viewW: number, viewH: number): void {
  const scale = viewScale(view, w, h, viewW, viewH);
  ctx.translate(view.cx, view.cy);
  ctx.rotate(toRad(view.deg));
  ctx.scale(scale * (view.flipH ? -1 : 1), scale * (view.flipV ? -1 : 1));
}

function drawScene(ctx: CanvasRenderingContext2D, img: HTMLImageElement, view: CropView, filters: CropFilters, viewW: number, viewH: number): void {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  ctx.save();
  ctx.filter = filterString(filters);
  applyView(ctx, view, w, h, viewW, viewH);
  ctx.drawImage(img, -w / 2, -h / 2);
  ctx.restore();
}

function drawThirdsGrid(ctx: CanvasRenderingContext2D, viewW: number, viewH: number): void {
  const xs = [viewW / 3, (2 * viewW) / 3];
  const ys = [viewH / 3, (2 * viewH) / 3];
  for (const pass of [
    { color: "rgba(0,0,0,0.45)", width: 2.5 },
    { color: "rgba(255,255,255,0.6)", width: 1 },
  ]) {
    ctx.strokeStyle = pass.color;
    ctx.lineWidth = pass.width;
    ctx.beginPath();
    for (const x of xs) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewH);
    }
    for (const y of ys) {
      ctx.moveTo(0, y);
      ctx.lineTo(viewW, y);
    }
    ctx.stroke();
  }
}

export function renderCropPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  view: CropView,
  filters: CropFilters,
  viewW: number,
  viewH: number,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, viewW, viewH);
  drawScene(ctx, img, view, filters, viewW, viewH);
  drawThirdsGrid(ctx, viewW, viewH);
}

export interface CropExport {
  file?: File;
  tooLarge?: boolean;
}

export async function exportCropped(
  img: HTMLImageElement,
  view: CropView,
  filters: CropFilters,
  source: File,
  viewW: number,
  viewH: number,
  maxBytes: number,
): Promise<CropExport> {
  const scale = viewScale(view, img.naturalWidth, img.naturalHeight, viewW, viewH);
  const cap = Math.min(1, EXPORT_CAP / Math.max(viewW / scale, viewH / scale));
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round((viewW / scale) * cap));
  out.height = Math.max(1, Math.round((viewH / scale) * cap));
  const ctx = out.getContext("2d");
  if (!ctx) return {};
  // Map the whole preview viewport onto the export canvas, then replay the
  // same transform chain so the crop region renders identically.
  ctx.setTransform(out.width / viewW, 0, 0, out.height / viewH, 0, 0);
  drawScene(ctx, img, view, filters, viewW, viewH);
  const mime = pickOutputMime(source);
  const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, mime, 0.92));
  if (!blob) return {};
  if (blob.size > maxBytes) return { tooLarge: true };
  const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
  const name = source.name.replace(/\.[^.]+$/, "") + ext;
  return { file: new File([blob], name, { type: mime }) };
}
