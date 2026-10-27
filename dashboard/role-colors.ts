import type { OrgRole } from "./members-api.ts";

// Palette keys match the backend's ROLE_COLORS. Neutral zinc is the default;
// red, amber and emerald are the only tones AGENTS.md allows besides zinc.
export const ROLE_COLOR_KEYS = ["zinc", "red", "amber", "emerald"] as const;

export type RoleColor = (typeof ROLE_COLOR_KEYS)[number];

export function toRoleColor(raw: string | undefined): RoleColor {
  return (ROLE_COLOR_KEYS as readonly string[]).includes(raw ?? "")
    ? (raw as RoleColor)
    : "zinc";
}

export const ROLE_BADGE_CLASS: Record<RoleColor, string> = {
  zinc:
    "border-zinc-300 bg-zinc-50 text-zinc-700 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  red:
    "border-red-300 bg-red-50 text-red-700 " +
    "dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  amber:
    "border-amber-300 bg-amber-50 text-amber-700 " +
    "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  emerald:
    "border-emerald-300 bg-emerald-50 text-emerald-700 " +
    "dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
};

export const ROLE_DOT_CLASS: Record<RoleColor, string> = {
  zinc: "bg-zinc-500 dark:bg-zinc-400",
  red: "bg-red-500 dark:bg-red-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
};

// Colour of a role looked up by the name a member row carries.
export function colorOfRole(name: string, roles: OrgRole[]): RoleColor {
  return toRoleColor(roles.find((role) => role.name === name)?.color);
}
