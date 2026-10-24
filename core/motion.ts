// Scroll behavior plus the one documented chat jump pulse.
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

const PULSE_HOLD_MS = 360;
const pulseTimers = new WeakMap<HTMLElement, number>();

// Brief grow on a jumped-to chat bubble. The matching Tailwind
// `group-data-[jump-pulse]:scale-[1.04]` lives on the bubble. Skipped
// when the reader asked for reduced motion.
export function pulseMessage(el: HTMLElement): void {
  if (prefersReducedMotion()) return;
  const prev = pulseTimers.get(el);
  if (prev !== undefined) window.clearTimeout(prev);
  el.setAttribute("data-jump-pulse", "");
  const timer = window.setTimeout(() => {
    el.removeAttribute("data-jump-pulse");
    pulseTimers.delete(el);
  }, PULSE_HOLD_MS);
  pulseTimers.set(el, timer);
}
