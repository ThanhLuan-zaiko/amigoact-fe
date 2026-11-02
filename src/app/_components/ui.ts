// Shared Tailwind class strings. One teal accent, 1px slate borders, small radius.
// Page and cards share one background, so sections are separated by borders only: no shadows, no tinted fills.

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:focus-visible:outline-teal-400";

// Section or card. It has the page background and only a border.
export const panel = "rounded-md border border-slate-200 dark:border-slate-800";

export const primaryButton = `inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-teal-700 bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800 ${focusRing} dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300`;

export const secondaryButton = `inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-teal-700 px-4 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800 ${focusRing} dark:border-teal-400 dark:text-teal-400 dark:hover:text-teal-300`;

export const iconButton = `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-700 ${focusRing} dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-400`;

export const chipButton = `inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-700 hover:text-teal-700 ${focusRing} dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-400`;

export const chipPressed = `inline-flex items-center gap-2 rounded-md border border-teal-700 px-3 py-1.5 text-sm font-semibold text-teal-700 ${focusRing} dark:border-teal-400 dark:text-teal-400`;

export const tagChip =
  "inline-flex items-center rounded-sm border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300";

// Segmented control used for tabs and sub-navigation.
export const segmentList =
  "flex gap-1 overflow-x-auto rounded-md border border-slate-200 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:border-slate-800";

export const segmentItem = `flex shrink-0 items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold transition-colors sm:px-3 ${focusRing}`;

export const segmentActive =
  "border border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400";

export const segmentIdle =
  "border border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100";

export const sectionTitle =
  "text-base font-bold text-slate-900 dark:text-slate-100";

export const mutedText = "text-sm text-slate-500 dark:text-slate-400";

export const fieldLabel =
  "text-sm font-semibold text-slate-700 dark:text-slate-300";

export const inputFieldInvalid =
  "w-full rounded-md border border-slate-900 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors dark:border-slate-100 dark:text-slate-100";

export const inputField =
  "w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-700 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400";
