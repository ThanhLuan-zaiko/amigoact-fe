import { useState } from "react";
import type { ReactElement } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { applyTheme, resolveInitialTheme } from "../theme.ts";
import type { ThemeMode } from "../theme.ts";
import { Button } from "./Button.tsx";
import { MENU_ITEM_CLASS } from "./RailMenu.tsx";

// The only theme switch. `labeled` renders it as a popover/drawer row
// (X keeps display settings under "More"); the default is an icon button.
export function ThemeToggle({
  labeled = false,
}: {
  labeled?: boolean;
}): ReactElement {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialTheme());

  function handleClick(): void {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
  }

  const dark = mode === "dark";
  const Icon = dark ? FiSun : FiMoon;
  const glyph = (
    <span className="inline-flex" aria-hidden="true">
      <Icon className="h-5 w-5" />
    </span>
  );

  if (labeled) {
    return (
      <button
        type="button"
        role="menuitemcheckbox"
        aria-checked={dark}
        onClick={handleClick}
        className={MENU_ITEM_CLASS}
      >
        {glyph}
        <span className="flex-1">Giao diện tối</span>
        <span className="text-[13px] font-normal text-zinc-500 dark:text-zinc-400">
          {dark ? "Bật" : "Tắt"}
        </span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      aria-pressed={dark}
    >
      {glyph}
    </Button>
  );
}
