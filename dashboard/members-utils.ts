import type { DashboardMember, OrgRole } from "./members-api.ts";

// True when every permission the role carries sits inside the viewer's
// own effective set - mirrors the backend delegation subset rule.
export function canGrantRole(
  role: OrgRole,
  viewerRole: string,
  viewerPermissions: string[],
  viewerCeiling: number | null = null,
): boolean {
  if (viewerRole === "owner") return true;
  if (!outranks(viewerCeiling, role)) return false;
  return role.permissions.every((code) => viewerPermissions.includes(code));
}

// Role hierarchy: a viewer holding a ranked role may only touch roles
// strictly below it. No ceiling (owner, or no ranked role) = unlimited.
export function outranks(
  viewerCeiling: number | null,
  role: Pick<OrgRole, "position">,
): boolean {
  return viewerCeiling === null || role.position < viewerCeiling;
}

// The owner holds every permission; everyone else needs the exact code.
export function hasPermission(
  viewerRole: string,
  viewerPermissions: string[],
  code: string,
): boolean {
  return viewerRole === "owner" || viewerPermissions.includes(code);
}

// Nobody acts on the owner or on themselves; non-owners never act on an
// admin. Shared by the members board and the chat roster menu.
export function canActOnMember(
  viewerRole: string,
  target: Pick<DashboardMember, "roles">,
  isSelf: boolean,
): boolean {
  if (isSelf || target.roles.includes("owner")) return false;
  return viewerRole === "owner" || !target.roles.includes("admin");
}

export interface MemberRights {
  assign: boolean;
  suspend: boolean;
  reactivate: boolean;
  revoke: boolean;
  approve: boolean;
  reject: boolean;
  application: boolean;
  remove: boolean;
  leave: boolean;
}

// Which row actions the viewer may run on one member. Invites are withdrawn
// through the dedicated invitation endpoint, so revocation rides on
// member:invite; member:remove stays for real members.
export function memberRights(
  viewerRole: string,
  viewerPermissions: string[],
  member: Pick<DashboardMember, "roles" | "status">,
  isSelf: boolean,
): MemberRights {
  const can = (code: string): boolean =>
    hasPermission(viewerRole, viewerPermissions, code);
  const onTarget = canActOnMember(viewerRole, member, isSelf);
  const { status } = member;
  return {
    assign: onTarget && status === "active" && can("member:role-assign"),
    suspend: onTarget && status === "active" && can("member:suspend"),
    reactivate: onTarget && status === "suspended" && can("member:suspend"),
    revoke: onTarget && status === "invited" && can("member:invite"),
    // Applicants are not members yet, so the owner/admin hierarchy does not apply.
    approve: status === "applied" && !isSelf && can("member:invite"),
    reject: status === "applied" && !isSelf && can("member:invite"),
    application: status === "applied" && !isSelf && can("member:invite"),
    remove:
      onTarget &&
      (status === "active" || status === "suspended") &&
      can("member:remove"),
    leave:
      isSelf &&
      !member.roles.includes("owner") &&
      status !== "left" &&
      status !== "invited" &&
      status !== "revoked",
  };
}

export function hasAnyRight(rights: MemberRights): boolean {
  return Object.values(rights).some(Boolean);
}

// Order-insensitive equality, used by editors to detect unsaved changes.
export function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const left = new Set(a);
  return left.size === new Set(b).size && b.every((item) => left.has(item));
}
