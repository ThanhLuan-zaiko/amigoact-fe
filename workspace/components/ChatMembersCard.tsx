import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSettings, FiUsers } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import { useOpenDm } from "../hooks.ts";
import { ChatMemberMenu } from "./ChatMemberMenu.tsx";

interface ChatMembersCardProps {
  orgId: string | null;
  // Jumping into a dm closes the info drawer first.
  onClose: () => void;
  // Inside the shared-panel tab bar, the tab itself is the heading —
  // bare skips the section title to save space.
  bare?: boolean;
}

// Room info drawer's roster preview: the members endpoint caps at 50
// rows, so big communities continue on /manage/members (search/sort).
export function ChatMembersCard({
  orgId,
  onClose,
  bare = false,
}: ChatMembersCardProps): ReactElement {
  const members = useOrgMembers(orgId, { limit: 50, status: "active" });
  const selfId = useSession().data?.id;
  const openDm = useOpenDm(orgId ?? "");
  const navigate = useNavigate();
  const viewerRole = members.data?.viewer_role ?? "member";
  const viewerPermissions = members.data?.viewer_permissions ?? [];
  const canAdmin =
    viewerRole === "owner" ||
    viewerPermissions.some((code) => code.startsWith("member:"));

  async function messagePeer(userId: string): Promise<void> {
    const room = await openDm.mutateAsync(userId).catch(() => null);
    if (room === null) return;
    onClose();
    navigate(`/manage/chat?room=${room.room_id}`);
  }

  const body = (
    <>
      {/* No inner scroll: the row dropdown must never clip, so the
          Modal panel (90vh) owns overflow instead. */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
        {members.isPending && <LoadingState label="Đang tải…" />}
        {members.isError && (
          <p className="px-3 py-3 text-sm text-zinc-500 dark:text-zinc-400">
            Không tải được danh sách thành viên.
          </p>
        )}
        {(members.data?.items ?? []).map((item, index) => {
          const isSelf = item.user_id === selfId;
          const rowCount = members.data?.items.length ?? 0;
          return (
            <div
              key={item.user_id}
              className="flex items-center gap-2.5 border-b border-zinc-100 px-3 py-2 last:border-0 dark:border-zinc-800"
            >
              <Avatar name={item.full_name} src={item.avatar_url} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {item.full_name}
              </span>
              {item.roles.includes("owner") && (
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  Chủ tổ chức
                </span>
              )}
              {orgId !== null && (
                <ChatMemberMenu
                  orgId={orgId}
                  member={item}
                  viewerRole={viewerRole}
                  viewerPermissions={viewerPermissions}
                  isSelf={isSelf}
                  openUp={index >= rowCount - 2}
                  onMessage={(id) => void messagePeer(id)}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Escape hatch for large rosters: the real members page has
          search, sort and pagination; the modal stays a preview. */}
      {(members.data?.total ?? 0) > 0 && (
        <Link
          to={`/manage/members?org=${orgId ?? ""}`}
          className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <FiSettings className="h-4 w-4" aria-hidden="true" />
          {canAdmin
            ? `Quản lý ${members.data?.total} thành viên`
            : `Xem tất cả ${members.data?.total} thành viên`}
        </Link>
      )}
    </>
  );

  if (bare) return body;
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <FiUsers className="h-4 w-4" aria-hidden="true" />
        Thành viên
        {members.data !== undefined && ` (${members.data.total})`}
      </h3>
      {body}
    </section>
  );
}
