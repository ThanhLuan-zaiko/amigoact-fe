// Pointer and wheel gestures for the cropper canvas: one-pointer pan,
// two-pointer pinch zoom around the midpoint, wheel zoom to cursor.
// All gestures commit a new CropView via onCommit (which clamps).

import { useEffect, useRef } from "react";
import type { PointerEvent, RefObject } from "react";
import type { CropView, Point } from "./crop-math.ts";
import { anchoredView, clampZoom } from "./crop-math.ts";

export interface CropGestureHandlers {
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLCanvasElement>) => void;
}

function toViewport(canvas: HTMLCanvasElement | null, clientX: number, clientY: number, viewW: number, viewH: number): Point {
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return { x: ((clientX - rect.left) / rect.width) * viewW, y: ((clientY - rect.top) / rect.height) * viewH };
}

export function useCropGestures(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  imgRef: RefObject<HTMLImageElement | null>,
  view: CropView | null,
  viewW: number,
  viewH: number,
  onCommit: (next: CropView) => void,
): CropGestureHandlers {
  const pointersRef = useRef(new Map<number, Point>());
  const dragRef = useRef<{ px: number; py: number; origin: Point } | null>(null);
  const pinchRef = useRef<{ d0: number; mid0: Point; snap: CropView } | null>(null);

  // React attaches wheel listeners passively, so preventDefault needs a
  // native listener to keep the page from scrolling while zooming.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view) return;
    function onWheel(event: WheelEvent): void {
      const img = imgRef.current;
      if (!img || !view) return;
      event.preventDefault();
      const p = toViewport(canvas, event.clientX, event.clientY, viewW, viewH);
      const zoom = clampZoom(view.zoom * Math.exp(-event.deltaY * 0.0022));
      onCommit(anchoredView(view, { ...view, zoom }, img.naturalWidth, img.naturalHeight, p.x, p.y, viewW, viewH));
    }
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvasRef, imgRef, view, viewW, viewH, onCommit]);

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size === 2 && view) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = {
        d0: Math.hypot(a.x - b.x, a.y - b.y),
        mid0: toViewport(event.currentTarget, (a.x + b.x) / 2, (a.y + b.y) / 2, viewW, viewH),
        snap: view,
      };
      dragRef.current = null;
    } else if (view) {
      dragRef.current = { px: event.clientX, py: event.clientY, origin: { x: view.cx, y: view.cy } };
    }
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>): void {
    const img = imgRef.current;
    if (!img || !view || !pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const pinch = pinchRef.current;
    if (pinch && pointersRef.current.size >= 2) {
      const [a, b] = [...pointersRef.current.values()];
      const mid = toViewport(event.currentTarget, (a.x + b.x) / 2, (a.y + b.y) / 2, viewW, viewH);
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const zoom = clampZoom(pinch.snap.zoom * (d / Math.max(1, pinch.d0)));
      const anchored = anchoredView(pinch.snap, { ...pinch.snap, zoom }, img.naturalWidth, img.naturalHeight, pinch.mid0.x, pinch.mid0.y, viewW, viewH);
      onCommit({ ...anchored, cx: anchored.cx + mid.x - pinch.mid0.x, cy: anchored.cy + mid.y - pinch.mid0.y });
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const ratio = viewW / event.currentTarget.clientWidth;
    onCommit({ ...view, cx: drag.origin.x + (event.clientX - drag.px) * ratio, cy: drag.origin.y + (event.clientY - drag.py) * ratio });
  }

  function endDrag(event: PointerEvent<HTMLCanvasElement>): void {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    const remaining = [...pointersRef.current.values()];
    dragRef.current = remaining.length === 1 && view ? { px: remaining[0].x, py: remaining[0].y, origin: { x: view.cx, y: view.cy } } : null;
  }

  return { onPointerDown, onPointerMove, onPointerUp: endDrag, onPointerCancel: endDrag };
}
