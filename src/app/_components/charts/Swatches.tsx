// Hidden elements whose text color a canvas chart reads with getComputedStyle.
// The classes stay literal strings here, so Tailwind generates them, and the dark:
// variants follow the theme class like every other element.
export const CHART_SWATCHES = {
  primary: "text-teal-700 dark:text-teal-400",
  secondary: "text-slate-400 dark:text-slate-500",
  grid: "text-slate-200 dark:text-slate-800",
  zero: "text-slate-400 dark:text-slate-600",
  ink: "text-slate-900 dark:text-slate-100",
  muted: "text-slate-500 dark:text-slate-400",
  track: "text-slate-100 dark:text-slate-900",
  highlight: "text-slate-100 dark:text-slate-900",
} as const;

export type SwatchName = keyof typeof CHART_SWATCHES;

export default function Swatches() {
  return (
    <>
      {Object.entries(CHART_SWATCHES).map(([name, className]) => (
        <span
          key={name}
          hidden
          aria-hidden="true"
          data-swatch={name}
          className={className}
        />
      ))}
    </>
  );
}
