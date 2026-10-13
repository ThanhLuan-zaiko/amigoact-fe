import { prefersReducedMotion } from "./motion.ts";

// App-wide behavior: whenever a form error mounts, smoothly scroll to
// the first one in document order. Every error surface renders
// <p role="alert"> (TextField, SelectField, TextArea, ad-hoc form
// errors), so one MutationObserver covers all forms — including async
// server errors — without per-form wiring.
let started = false;

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return rect.top >= 0 && rect.bottom <= window.innerHeight;
}

export function initErrorScroll(): void {
  if (started || typeof document === "undefined") return;
  started = true;
  new MutationObserver((records) => {
    let target: Element | null = null;
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        const alerts = node.matches('[role="alert"]')
          ? [node]
          : Array.from(node.querySelectorAll('[role="alert"]'));
        for (const alert of alerts) {
          if (!alert.closest("form")) continue;
          const isAfterTarget =
            target !== null &&
            (target.compareDocumentPosition(alert) &
              Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
          if (!isAfterTarget) target = alert;
        }
      }
    }
    if (target === null || isVisible(target)) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
  }).observe(document.body, { childList: true, subtree: true });
}
