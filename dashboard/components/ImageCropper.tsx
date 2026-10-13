import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiCompass, FiLayout, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { MAX_IMAGE_BYTES } from "../schemas.ts";
import type { CropFilters, CropView } from "../crop-math.ts";
import { anchoredView, clampCenter, clampZoom, DEFAULT_FILTERS, fitView, MAX_ZOOM, stepOf, tiltOf, VIEW_W } from "../crop-math.ts";
import { exportCropped, isGifFile, renderCropPreview } from "../crop-render.ts";
import { useCropGestures } from "../crop-gestures.ts";
import { AdjustPanel, CropToolbar, SliderRow } from "./CropControls.tsx";

const ASPECTS: { label: string; value: number }[] = [{ label: "1:1", value: 1 }, { label: "4:3", value: 4 / 3 }, { label: "16:9", value: 16 / 9 }, { label: "3:1", value: 3 }];

interface ImageCropperProps {
  file: File;
  defaultAspect: number;
  onApply: (file: File) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, defaultAspect, onApply, onCancel }: ImageCropperProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [tooLarge, setTooLarge] = useState(false);
  const [aspect, setAspect] = useState(defaultAspect);
  const [view, setView] = useState<CropView | null>(null);
  const [filters, setFilters] = useState<CropFilters>(DEFAULT_FILTERS);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const viewH = Math.round(VIEW_W / aspect);
  const gif = isGifFile(file);

  const commit = useCallback(
    (next: CropView) => {
      const img = imgRef.current;
      if (!img) return;
      const cc = clampCenter(next, img.naturalWidth, img.naturalHeight, VIEW_W, viewH);
      setTooLarge(false);
      setView({ ...next, cx: cc.x, cy: cc.y });
    },
    [viewH],
  );
  const gestures = useCropGestures(canvasRef, imgRef, view, VIEW_W, viewH, commit);

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

  useEffect(() => {
    if (!ready || !imgRef.current) return;
    setView((prev) => fitView(VIEW_W, viewH, prev?.deg ?? 0, prev?.flipH ?? false, prev?.flipV ?? false));
  }, [ready, viewH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !view) return;
    renderCropPreview(canvas, img, view, filters, VIEW_W, viewH);
  });

  function anchorAt(next: CropView, px: number, py: number): void {
    const img = imgRef.current;
    if (!img || !view) return;
    commit(anchoredView(view, next, img.naturalWidth, img.naturalHeight, px, py, VIEW_W, viewH));
  }

  function applyZoom(zoom: number): void {
    if (!view) return;
    anchorAt({ ...view, zoom: clampZoom(zoom) }, VIEW_W / 2, viewH / 2);
  }

  function resetAll(): void {
    setFilters(DEFAULT_FILTERS);
    setAspect(defaultAspect);
    setView(fitView(VIEW_W, Math.round(VIEW_W / defaultAspect)));
    setTooLarge(false);
  }

  async function apply(): Promise<void> {
    const img = imgRef.current;
    if (!img || !view || gif) return;
    const result = await exportCropped(img, view, filters, file, VIEW_W, viewH, MAX_IMAGE_BYTES);
    if (result.tooLarge) { setTooLarge(true); return; }
    if (result.file) onApply(result.file);
  }

  if (failed) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-red-300 p-3 dark:border-red-800">
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Trình duyệt không đọc được ảnh này để cắt. Vẫn có thể tải lên nguyên gốc.
        </p>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Quay lại
        </Button>
      </div>
    );
  }

  const tilt = view ? tiltOf(view.deg) : 0;
  const zoom = view?.zoom ?? 1;
  const center = { x: VIEW_W / 2, y: viewH / 2 };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Cắt &amp; chỉnh ảnh — kéo để di chuyển, cuộn chuột hoặc chụm hai ngón tay để thu phóng.
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
        {...gestures}
        className="w-full touch-none rounded-lg bg-zinc-950"
        aria-label="Khung cắt ảnh"
      />
      <div className="flex flex-wrap items-center gap-2">
        {ASPECTS.map((preset) => (
          <Button key={preset.label} type="button" variant={aspect === preset.value ? "primary" : "secondary"} aria-pressed={aspect === preset.value} onClick={() => setAspect(preset.value)}>
            {preset.label}
          </Button>
        ))}
        <Button size="icon" variant="ghost" disabled={!ready || aspect === 1} aria-label="Đảo ngang/dọc khung cắt" title="Đảo ngang/dọc khung cắt" onClick={() => setAspect(1 / aspect)}>
          <FiLayout className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      <CropToolbar
        disabled={!ready}
        adjustOpen={adjustOpen}
        onRotate={(delta) => view && anchorAt({ ...view, deg: view.deg + delta }, center.x, center.y)}
        onFlip={(axis) => view && anchorAt(axis === "h" ? { ...view, flipH: !view.flipH } : { ...view, flipV: !view.flipV }, center.x, center.y)}
        onToggleAdjust={() => setAdjustOpen((open) => !open)}
        onReset={resetAll}
      />
      {adjustOpen && <AdjustPanel filters={filters} disabled={!ready} onChange={setFilters} />}
      <SliderRow
        icon={<FiZoomIn className="h-4 w-4" aria-hidden="true" />}
        label="Thu phóng"
        min={1}
        max={MAX_ZOOM}
        step={0.05}
        value={zoom}
        display={`${Math.round(zoom * 100)}%`}
        disabled={!ready}
        onChange={applyZoom}
        controls={
          <>
            <Button size="icon" variant="ghost" disabled={!ready || zoom <= 1} aria-label="Thu nhỏ" onClick={() => applyZoom(zoom - 0.25)}>
              <FiZoomOut className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button size="icon" variant="ghost" disabled={!ready || zoom >= MAX_ZOOM} aria-label="Phóng to" onClick={() => applyZoom(zoom + 0.25)}>
              <FiZoomIn className="h-4 w-4" aria-hidden="true" />
            </Button>
          </>
        }
      />
      <SliderRow
        icon={<FiCompass className="h-4 w-4" aria-hidden="true" />}
        label="Nghiêng"
        min={-45}
        max={45}
        step={0.5}
        value={tilt}
        display={`${Math.round(tilt * 10) / 10}°`}
        disabled={!ready}
        onChange={(value) => view && anchorAt({ ...view, deg: stepOf(view.deg) + value }, center.x, center.y)}
      />
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
