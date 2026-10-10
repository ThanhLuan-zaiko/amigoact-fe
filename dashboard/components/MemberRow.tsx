import type { ReactElement } from "react";
import { FiUser } from "react-icons/fi";
import { MEMBER_ROLE_LABELS, MEMBER_STATUS_LABELS } from "../messages.tsx";
import type { DashboardMember, MemberRole } from "../api.ts";
import { MemberActions } from "./MemberActions.tsx";

interface MemberRowProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: MemberRole;
  selfId: string | undefined;
}

const ROLE_BADGES: Record<string, string> = {
  owner:
    "border-amber-300 bg-amber-50 text-amber-700 " +
    "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  admin: "border-brand/40 bg-brand/10 text-zinc-900 dark:border-brand/30 dark:text-brand",
};

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
  selfId,
}: MemberRowProps): ReactElement {
  const joined = joinedLabel(member.joined_at);
  const roleBadge = ROLE_BADGES[member.role];
  const statusBadge = member.status === "active" ? null : STATUS_BADGES[member.status];

  return (
    <li
      data-rise
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            {member.full_name ? (
              initialOf(member.full_name)
            ) : (
              <FiUser className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {member.full_name}
              </p>
              {roleBadge && (
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
                  {MEMBER_ROLE_LABELS[member.role] ?? member.role}
                </span>
              )}
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
            </p>
          </div>
        </div>
      </div>
      <MemberActions
        orgId={orgId}
        member={member}
        viewerRole={viewerRole}
        isSelf={selfId !== undefined && member.user_id === selfId}
      />
    </li>
  );
}
