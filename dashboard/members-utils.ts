import type { OrgRole } from "./members-api.ts";

// True when every permission the role carries sits inside the viewer's
// own effective set - mirrors the backend delegation subset rule.
export function canGrantRole(
  role: OrgRole,
  viewerRole: string,
  viewerPermissions: string[],
): boolean {
  if (viewerRole === "owner") return true;
  return role.permissions.every((code) => viewerPermissions.includes(code));
}
