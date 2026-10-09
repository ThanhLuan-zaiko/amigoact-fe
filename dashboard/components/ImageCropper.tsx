import { useEffect, useRef, useState } from "react";
import type { PointerEvent, ReactElement } from "react";
import { FiCheck, FiX, FiZoomIn } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { MAX_IMAGE_BYTES } from "../schemas.ts";

const VIEW_W = 520;
const EXPORT_CAP = 2048;
const ASPECTS: { label: string; value: number }[] = [{ label: "1:1", value: 1 }, { label: "4:3", value: 4 / 3 }, { label: "16:9", value: 16 / 9 }, { label: "3:1", value: 3 }];

interface ImageCropperProps {
  file: File;
  defaultAspect: number;
  onApply: (file: File) => void;
  onCancel: () => void;
}

interface Offset { x: number; y: number; }

function isGifFile(file: File): boolean { return file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif"); }

function pickOutputMime(file: File): string {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
}

export function ImageCropper({ file, defaultAspect, onApply, onCancel }: ImageCropperProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; origin: Offset } | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);
  const [aspect, setAspect] = useState(defaultAspect);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const viewH = Math.round(VIEW_W / aspect);
  const gif = isGifFile(file);

  useEffect(() => {
    let cancelled = false;
    imgRef.current = null;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { if (cancelled) return; imgRef.current = img; setReady(true); };
    img.onerror = () => { if (!cancelled) setFailed(true); };
    img.src = url;
    return () => { cancelled = true; URL.revokeObjectURL(url); imgRef.current = null; };
  }, [file]);

  function fitScale(img: HTMLImageElement): number { return Math.max(VIEW_W / img.naturalWidth, viewH / img.naturalHeight); }

  function clamp(next: Offset, scale: number, img: HTMLImageElement): Offset {
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    return { x: Math.min(0, Math.max(VIEW_W - dw, next.x)), y: Math.min(0, Math.max(viewH - dh, next.y)) };
  }

  useEffect(() => {
    const img = imgRef.current;
    if (!ready || !img) return;
    const fit = Math.max(VIEW_W / img.naturalWidth, viewH / img.naturalHeight);
    setZoom(1);
    setOffset({
      x: (VIEW_W - img.naturalWidth * fit) / 2,
      y: (viewH - img.naturalHeight * fit) / 2,
    });
  }, [ready, aspect, viewH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = fitScale(img) * zoom;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, VIEW_W, viewH);
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
  });

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { px: event.clientX, py: event.clientY, origin: offset };
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>): void {
    const drag = dragRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!drag || !img || !canvas) return;
    const ratio = VIEW_W / canvas.clientWidth;
    const next = {
      x: drag.origin.x + (event.clientX - drag.px) * ratio,
      y: drag.origin.y + (event.clientY - drag.py) * ratio,
    };
    setOffset(clamp(next, fitScale(img) * zoom, img));
  }

  function endDrag(event: PointerEvent<HTMLCanvasElement>): void {
    if (dragRef.current) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function applyZoom(next: number): void {
    const img = imgRef.current;
    if (!img) return;
    const fit = fitScale(img);
    const oldScale = fit * zoom;
    const newScale = fit * next;
    const cx = VIEW_W / 2;
    const cy = viewH / 2;
    const anchor = { x: (cx - offset.x) / oldScale, y: (cy - offset.y) / oldScale };
    setOffset(clamp({ x: cx - anchor.x * newScale, y: cy - anchor.y * newScale }, newScale, img));
    setZoom(next);
  }

  async function apply(): Promise<void> {
    const img = imgRef.current;
    if (!img || gif) return;
    const scale = fitScale(img) * zoom;
    const sw = VIEW_W / scale;
    const sh = viewH / scale;
    const cap = Math.min(1, EXPORT_CAP / Math.max(sw, sh));
    const out = document.createElement("canvas");
    out.width = Math.max(1, Math.round(sw * cap));
    out.height = Math.max(1, Math.round(sh * cap));
    out.getContext("2d")?.drawImage(img, -offset.x / scale, -offset.y / scale, sw, sh, 0, 0, out.width, out.height);
    const mime = pickOutputMime(file);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, mime, 0.92));
    if (!blob) return;
    if (blob.size > MAX_IMAGE_BYTES) { setTooLarge(true); return; }
    const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
    const name = file.name.replace(/\.[^.]+$/, "") + ext;
    onApply(new File([blob], name, { type: mime }));
  }

  if (failed) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-red-300 p-3 dark:border-red-800">
        <p className="text-sm text-red-600 dark:text-red-400">
          Trình duyệt không đọc được ảnh này để cắt. Vẫn có thể tải lên nguyên gốc.
        </p>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Cắt ảnh — kéo để chọn khung, trượt để thu phóng.
      </p>
      {gif && (
        <p role="alert" className="text-xs text-amber-600 dark:text-amber-400">
          Ảnh GIF sẽ mất ảnh động khi cắt. Hãy giữ nguyên gốc để dùng GIF.
        </p>
      )}
      {tooLarge && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          Ảnh sau khi cắt vẫn vượt quá 10MB. Hãy thu phóng nhỏ hơn.
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={VIEW_W}
        height={viewH}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="w-full touch-none rounded-lg bg-zinc-950"
        aria-label="Khung cắt ảnh"
      />
      <div className="flex flex-wrap items-center gap-2">
        {ASPECTS.map((preset) => (
          <Button key={preset.label} type="button" variant={aspect === preset.value ? "primary" : "secondary"} aria-pressed={aspect === preset.value} onClick={() => setAspect(preset.value)}>
            {preset.label}
          </Button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <FiZoomIn className="h-4 w-4 shrink-0" aria-hidden="true" />
        Thu phóng
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={zoom}
          onChange={(event) => applyZoom(Number(event.target.value))}
          className="min-w-0 flex-1 accent-brand"
          aria-label="Thu phóng ảnh"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="primary" disabled={!ready || gif} onClick={() => void apply()} icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}>
          Áp dụng
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} icon={<FiX className="h-4 w-4" aria-hidden="true" />}>
          Giữ nguyên gốc
        </Button>
      </div>
    </div>
  );
}
