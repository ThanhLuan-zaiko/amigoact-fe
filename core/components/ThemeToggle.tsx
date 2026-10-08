import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { swapGlyph } from "../motion.ts";
import { applyTheme, resolveInitialTheme } from "../theme.ts";
import type { ThemeMode } from "../theme.ts";
import { Button } from "./Button.tsx";

export function ThemeToggle(): ReactElement {
  const [mode, setMode] = useState<ThemeMode>(() => resolveInitialTheme());
  const glyphRef = useRef<HTMLSpanElement>(null);

  function handleClick(): void {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
    if (glyphRef.current) swapGlyph(glyphRef.current);
  }

  const label = mode === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối";
  const Icon = mode === "dark" ? FiSun : FiMoon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={mode === "dark"}
    >
      <span ref={glyphRef} className="inline-flex" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
    </Button>
  );
}
