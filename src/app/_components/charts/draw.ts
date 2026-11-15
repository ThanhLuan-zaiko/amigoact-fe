// Small canvas drawing steps shared by the charts.

import type { Box } from "@/lib/chartGeometry";

// Rounded data ends: the corners away from the baseline are rounded, the baseline stays square.
const RADIUS = 4;

export function fillBar(
  context: CanvasRenderingContext2D,
  box: Box,
  color: string,
  anchor: "bottom" | "top" | "left",
) {
  if (box.width <= 0 || box.height <= 0) return;
  const radius = Math.min(RADIUS, box.width / 2, box.height / 2);
  const corners =
    anchor === "bottom"
      ? [radius, radius, 0, 0]
      : anchor === "top"
        ? [0, 0, radius, radius]
        : [0, radius, radius, 0];
  context.fillStyle = color;
  context.beginPath();
  context.roundRect(box.x, box.y, box.width, box.height, corners);
  context.fill();
}

export function hairline(
  context: CanvasRenderingContext2D,
  fromX: number,
  toX: number,
  y: number,
  color: string,
) {
  // Half-pixel offset keeps a 1px line sharp.
  const sharp = Math.round(y) + 0.5;
  context.strokeStyle = color;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(fromX, sharp);
  context.lineTo(toX, sharp);
  context.stroke();
}

export function label(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    color: string;
    font: string;
    size?: number;
    weight?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  },
) {
  context.fillStyle = options.color;
  context.font = `${options.weight ?? 400} ${options.size ?? 12}px ${options.font}`;
  context.textAlign = options.align ?? "left";
  context.textBaseline = options.baseline ?? "middle";
  context.fillText(text, x, y);
}

// Cut a label with an ellipsis so it fits the given width.
export function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (context.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (
    end > 0 &&
    context.measureText(`${text.slice(0, end)}…`).width > maxWidth
  ) {
    end -= 1;
  }
  return `${text.slice(0, end)}…`;
}
