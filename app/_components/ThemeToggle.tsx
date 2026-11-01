"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { iconButton } from "./ui";

const THEME_STORAGE_KEY = "theme";

export default function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement;
    const isDark = !root.classList.contains("dark");
    root.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Storage can be unavailable (for example in private mode). The theme still switches for this visit.
    }
  }

  return (
    <button
      type="button"
      aria-label="Đổi giao diện sáng/tối"
      onClick={toggleTheme}
      className={iconButton}
    >
      <FiMoon aria-hidden="true" className="dark:hidden" />
      <FiSun aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
