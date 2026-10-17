import { useSyncExternalStore } from "react";

/**
 * Reactive matchMedia binding (JS alternative to viewport classes).
 *
 * Center-column content may not use viewport breakpoints (AGENTS.md
 * 5.6: container queries only inside main.@container), so flows that
 * must track the shell's own lg: boundary - like the chat page's
 * two-screen mobile layout - subscribe in JS instead.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
