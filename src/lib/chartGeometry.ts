// Pure geometry for the canvas charts. No DOM, so it runs in unit tests.

export type Box = { x: number; y: number; width: number; height: number };
export type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};
export type Scale = { min: number; max: number; step: number; ticks: number[] };
export type StackPoint = { awarded: number; adjusted: number };
export type Column = { center: number; awarded: Box; adjusted: Box };

// Gap between stacked segments, so each one reads as its own mark.
export const SEGMENT_GAP = 2;
const MAX_COLUMN_WIDTH = 28;
const COLUMN_SHARE = 0.6;

// The step of an axis: 1, 2, or 5 times a power of ten.
export function niceStep(raw: number): number {
  if (!(raw > 0)) return 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

// An axis that always holds zero and ends on whole steps.
export function niceScale(low: number, high: number, tickCount = 4): Scale {
  const min = Math.min(0, low);
  const max = Math.max(0, high);
  const step = niceStep((max - min || 1) / tickCount);
  const start = Math.floor(min / step) * step;
  const end = Math.max(Math.ceil(max / step) * step, start + step);
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }
  return { min: start, max: end, step, ticks };
}

// The lowest and highest point a stacked column reaches.
export function stackExtent(points: StackPoint[]): [number, number] {
  let low = 0;
  let high = 0;
  for (const { awarded, adjusted } of points) {
    high = Math.max(high, awarded + Math.max(adjusted, 0));
    low = Math.min(low, Math.min(adjusted, 0));
  }
  return [low, high];
}

export function plotBox(width: number, height: number, padding: Padding): Box {
  return {
    x: padding.left,
    y: padding.top,
    width: Math.max(width - padding.left - padding.right, 0),
    height: Math.max(height - padding.top - padding.bottom, 0),
  };
}

export function yOf(value: number, scale: Scale, plot: Box): number {
  const span = scale.max - scale.min || 1;
  return plot.y + ((scale.max - value) / span) * plot.height;
}

// A box between two values on the axis; empty when both are the same.
function span(
  x: number,
  width: number,
  from: number,
  to: number,
  scale: Scale,
  plot: Box,
): Box {
  const top = yOf(Math.max(from, to), scale, plot);
  const bottom = yOf(Math.min(from, to), scale, plot);
  return { x, y: top, width, height: bottom - top };
}

// Awarded hours rise from zero. A positive adjustment sits on top of them, after a
// small gap; a negative one hangs below zero.
export function columnLayout(
  points: StackPoint[],
  scale: Scale,
  plot: Box,
): Column[] {
  const slot = points.length > 0 ? plot.width / points.length : 0;
  const width = Math.min(slot * COLUMN_SHARE, MAX_COLUMN_WIDTH);
  return points.map(({ awarded, adjusted }, index) => {
    const x = plot.x + index * slot + (slot - width) / 2;
    const awardedBox = span(x, width, 0, Math.max(awarded, 0), scale, plot);
    let adjustedBox: Box;
    if (adjusted > 0) {
      const base = span(x, width, 0, awarded + adjusted, scale, plot);
      const gap = awardedBox.height > 0 ? SEGMENT_GAP : 0;
      adjustedBox = {
        ...base,
        height: Math.max(awardedBox.y - base.y - gap, 0),
      };
    } else {
      adjustedBox = span(x, width, adjusted, 0, scale, plot);
    }
    return {
      center: x + width / 2,
      awarded: awardedBox,
      adjusted: adjustedBox,
    };
  });
}

// Show every n-th label, so labels never overlap on a narrow screen.
export function labelStride(
  count: number,
  plotWidth: number,
  labelWidth: number,
): number {
  if (count === 0 || plotWidth <= 0) return 1;
  const fits = Math.max(Math.floor(plotWidth / labelWidth), 1);
  return Math.max(Math.ceil(count / fits), 1);
}

// The column under the pointer, or null outside the plot.
export function indexAt(x: number, count: number, plot: Box): number | null {
  if (count === 0 || x < plot.x || x > plot.x + plot.width) return null;
  const index = Math.floor(((x - plot.x) / plot.width) * count);
  return Math.min(Math.max(index, 0), count - 1);
}

// Length of a horizontal bar. Any value above zero stays visible.
export function barLength(
  value: number,
  max: number,
  available: number,
): number {
  if (!(value > 0) || !(max > 0) || available <= 0) return 0;
  return Math.max((value / max) * available, 2);
}
