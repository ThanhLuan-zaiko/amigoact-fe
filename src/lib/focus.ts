import { LEFT, OBJECT_POSITION, TOP } from "./focusClasses";

// The spot a crop keeps in view, from 0 to 1, measured from the top left.
// The backend guesses one on upload and the uploader can move it.
export type Focus = { x: number; y: number };

// Upper middle, where faces usually are, for pictures without a focal point.
export const DEFAULT_FOCUS: Focus = { x: 0.5, y: 0.3 };

function step(value: number): number {
  if (!Number.isFinite(value)) {
    return 5;
  }
  return Math.min(10, Math.max(0, Math.round(value * 10)));
}

// The object-position class for a crop that keeps the focal point in view.
export function focusClass(focus?: Focus | null): string {
  const point = focus ?? DEFAULT_FOCUS;
  return OBJECT_POSITION[step(point.x)][step(point.y)];
}

// The marker classes that place a dot on the focal point in the picker.
export function markerClass(focus?: Focus | null): string {
  const point = focus ?? DEFAULT_FOCUS;
  return `${LEFT[step(point.x)]} ${TOP[step(point.y)]}`;
}

// A click on the drawn picture, as a focal point. Rounded like the backend stores it.
export function pointFromClick(
  clientX: number,
  clientY: number,
  box: { left: number; top: number; width: number; height: number },
): Focus | null {
  if (box.width <= 0 || box.height <= 0) {
    return null;
  }
  const clamp = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000;
  return {
    x: clamp((clientX - box.left) / box.width),
    y: clamp((clientY - box.top) / box.height),
  };
}

// Reads a focal point from an API body, dropping anything that is not one.
export function asFocus(value: unknown): Focus | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const { x, y } = value as { x?: unknown; y?: unknown };
  if (typeof x !== "number" || typeof y !== "number") {
    return null;
  }
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
}
