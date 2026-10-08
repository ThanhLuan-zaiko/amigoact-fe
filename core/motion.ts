import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { animate, stagger } from "animejs";

export interface RiseOptions {
  delay?: number;
  staggerMs?: number;
  y?: number;
  duration?: number;
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function toTargets(
  target: string | Element | Element[] | NodeListOf<Element>,
): string | Element | Element[] | NodeListOf<Element> {
  return target;
}

// Fade + rise entrance for panels and tiles. Final state is rendered by
// React, so skipping the tween on reduced motion never hides content.
export function riseIn(
  target: string | Element | Element[] | NodeListOf<Element>,
  options: RiseOptions = {},
): void {
  if (prefersReducedMotion()) return;
  const { delay = 0, staggerMs = 0, y = 12, duration = 220 } = options;
  animate(toTargets(target), {
    opacity: [0, 1],
    y: [y, 0],
    duration,
    delay: staggerMs > 0 ? stagger(staggerMs, { start: delay }) : delay,
    ease: "outQuad",
  });
}

// Short slide + fade for the mobile navigation panel.
export function expandPanel(panel: HTMLElement): void {
  if (prefersReducedMotion()) return;
  animate(panel, {
    opacity: [0, 1],
    y: [-8, 0],
    duration: 200,
    ease: "outQuad",
  });
}

// Subtle cross-fade for the theme toggle glyph.
export function swapGlyph(glyph: HTMLElement): void {
  if (prefersReducedMotion()) return;
  animate(glyph, {
    opacity: [0.2, 1],
    scale: [0.85, 1],
    duration: 180,
    ease: "outQuad",
  });
}

// Entrance scope for pages and cards. Mark animated children with the
// data-rise attribute; they stagger in once on mount and stay visible
// without motion (reduced-motion or load failure never hides content).
export function useRiseIn<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll("[data-rise]");
    if (targets.length > 0) {
      riseIn(targets, { staggerMs: 70, y: 14, duration: 250 });
    }
  }, []);
  return ref;
}
