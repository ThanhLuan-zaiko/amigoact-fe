import type { ReactElement } from "react";
import { FiUser } from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import { MEMBER_ROLE_LABELS, MEMBER_STATUS_LABELS } from "../messages-members.tsx";
import type { DashboardMember, OrgRole } from "../members-api.ts";
import { MemberActions } from "./MemberActions.tsx";

interface MemberRowProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  selfId: string | undefined;
  online: boolean;
}

const ROLE_BADGES: Record<string, string> = {
  owner:
    "border-amber-300 bg-amber-50 text-amber-700 " +
    "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  admin: "border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100",
};

const CUSTOM_BADGE =
  "border-zinc-300 bg-zinc-50 text-zinc-700 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300";

const STATUS_BADGES: Record<string, string> = {
  invited:
    "border-amber-300 bg-amber-50 text-amber-700 " +
    "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  suspended:
    "border-red-300 bg-red-50 text-red-700 " +
    "dark:border-red-800 dark:bg-red-950 dark:text-red-400",
  left:
    "border-zinc-300 bg-zinc-50 text-zinc-500 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
  revoked:
    "border-zinc-300 bg-zinc-50 text-zinc-500 " +
    "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400",
};

// Avatar corner dot mirrors the status badge palette.
const STATUS_DOTS: Record<string, string> = {
  active: "bg-emerald-500",
  invited: "bg-amber-500",
  suspended: "bg-red-500",
  left: "bg-zinc-400",
  revoked: "bg-zinc-400",
};

function joinedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

export function MemberRow({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  orgRoles,
  selfId,
  online,
}: MemberRowProps): ReactElement {
  const joined = joinedLabel(member.joined_at);
  const statusBadge = member.status === "active" ? null : STATUS_BADGES[member.status];
  // Presence only applies to active members; other statuses keep their dot.
  const dotTone =
    member.status === "active"
      ? online
        ? "bg-emerald-500"
        : "bg-zinc-300 dark:bg-zinc-600"
      : (STATUS_DOTS[member.status] ?? "bg-zinc-400");
  const presenceLabel =
    member.status === "active"
      ? online
        ? "Đang online"
        : "Ngoại tuyến"
      : (MEMBER_STATUS_LABELS[member.status] ?? member.status);

  return (
    <li
      className="relative flex items-start gap-3 py-4 has-[[aria-expanded=true]]:z-20"
    >
      <span className="relative shrink-0">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {member.avatar_url !== null ? (
            <img
              src={`${apiBaseUrl()}${member.avatar_url}`}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
            />
          ) : member.full_name ? (
            initialOf(member.full_name)
          ) : (
            <FiUser className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <span
          aria-hidden="true"
          title={presenceLabel}
          className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-950 ${dotTone}`}
        />
        <span className="sr-only">{presenceLabel}</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {member.full_name}
          </p>
          {member.roles.map((role) => (
            <span
              key={role}
              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_BADGES[role] ?? CUSTOM_BADGE}`}
            >
              {MEMBER_ROLE_LABELS[role] ?? role}
            </span>
          ))}
          {statusBadge && (
            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadge}`}>
              {MEMBER_STATUS_LABELS[member.status] ?? member.status}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {member.email ? `${member.email} · ` : ""}
          {joined ? `tham gia ${joined}` : "thành viên"}
          {member.status === "invited" && member.invited_by_name
            ? ` · mời bởi ${member.invited_by_name}`
            : ""}
          {member.status === "active" && online && (
            // Visual echo only: the avatar's sr-only label already says it.
            <span aria-hidden="true"> · đang online</span>
          )}
        </p>
      </div>
      <MemberActions
        orgId={orgId}
        member={member}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        orgRoles={orgRoles}
        isSelf={selfId !== undefined && member.user_id === selfId}
      />
    </li>
  );
}
