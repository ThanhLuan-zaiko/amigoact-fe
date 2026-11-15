"use client";

import { useEffect, useRef } from "react";

// Colors the chart reads from Tailwind classes, keyed by the swatch name.
export type Palette = Record<string, string>;

export type Paint = {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  palette: Palette;
  font: string;
};

// Draws on a canvas that fills its wrapper. The canvas gets its pixel size from the
// width and height attributes, never from a style, and it redraws when the wrapper
// resizes or the theme class on <html> changes. Colors come from hidden swatches
// (see Swatches.tsx), so they stay Tailwind classes and follow dark mode.
export function useCanvas(draw: (paint: Paint) => void) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);

  useEffect(() => {
    drawRef.current = draw;
    repaint(wrapperRef.current, canvasRef.current, draw);
  }, [draw]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const redraw = () =>
      repaint(wrapperRef.current, canvasRef.current, drawRef.current);
    const resize = new ResizeObserver(redraw);
    resize.observe(wrapper);
    const theme = new MutationObserver(redraw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      resize.disconnect();
      theme.disconnect();
    };
  }, []);

  return { wrapperRef, canvasRef };
}

function readPalette(wrapper: HTMLElement): Palette {
  const palette: Palette = {};
  for (const swatch of wrapper.querySelectorAll<HTMLElement>("[data-swatch]")) {
    const name = swatch.dataset.swatch;
    if (name) palette[name] = getComputedStyle(swatch).color;
  }
  return palette;
}

function repaint(
  wrapper: HTMLDivElement | null,
  canvas: HTMLCanvasElement | null,
  draw: (paint: Paint) => void,
) {
  if (!wrapper || !canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  draw({
    context,
    width,
    height,
    palette: readPalette(wrapper),
    font: getComputedStyle(wrapper).fontFamily,
  });
}
