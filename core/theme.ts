export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "amigoact-theme";

export function getStoredTheme(): ThemeMode | null {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark") return raw;
    return null;
  } catch {
    return null;
  }
}

export function prefersDarkOS(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function resolveInitialTheme(): ThemeMode {
  const stored = getStoredTheme();
  if (stored !== null) return stored;
  return prefersDarkOS() ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage may be unavailable; the class toggle below still applies.
  }
  document.documentElement.classList.toggle("dark", mode === "dark");
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = resolveCurrentTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

export function resolveCurrentTheme(): ThemeMode {
  if (document.documentElement.classList.contains("dark")) return "dark";
  return resolveInitialTheme();
}

export function initTheme(): ThemeMode {
  const mode = resolveInitialTheme();
  applyTheme(mode);
  return mode;
}
