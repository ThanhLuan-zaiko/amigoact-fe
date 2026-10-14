// Shared class recipes for the X-style rails (kept out of component files
// so React Fast Refresh keeps working).

// Rail pill: hugs icon + label, hover tint only on the pill.
export const RAIL_PILL =
  "relative inline-flex items-center rounded-full text-zinc-900 transition-colors " +
  "hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:text-zinc-100 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

// Centered icon rail below xl; left-aligned labelled rail from xl up (or
// always labelled inside the phone drawer when `expanded`).
export function railRowClass(expanded: boolean): string {
  return expanded ? "flex" : "flex justify-center xl:justify-start";
}

export function railLabelClass(expanded: boolean): string {
  return expanded ? "inline" : "hidden xl:inline";
}

// Rail scroll pane: keeps overflow scrolling (wheel, touch, keyboard) but
// renders no visible scrollbar, so the desktop rails read as clean chrome.
export const RAIL_SCROLL =
  "overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
