import { useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiBellOff,
  FiHash,
  FiImage,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useOrgMembers } from "../../dashboard/members-hooks.ts";
import { useChannels } from "../channel-hooks.ts";
import { useMuteRoom, useOpenDm } from "../hooks.ts";
import { channelMetaLabel } from "../messages.tsx";
import { ChatMemberMenu } from "./ChatMemberMenu.tsx";
import type { ChatAttachment } from "../api.ts";

const SECTION_TITLE =
  "flex items-center gap-2 text-xs font-semibold uppercase " +
  "tracking-wide text-zinc-500 dark:text-zinc-400";

const MUTE_SWITCH =
  "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";

interface ChatRoomInfoProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  orgId: string | null;
  title: string;
  // Group rooms list the roster; dm rooms skip it (peer is the title).
  isDm: boolean;
  isChannel?: boolean; // channel rooms add a metadata card
  muted: boolean;
  // Shared media: attachments collected from the loaded history.
  media: ChatAttachment[];
}

// Telegram room profile modal: mute switch, member roster and the media
// shared in the room so far.
export function ChatRoomInfo({
  open,
  onClose,
  roomId,
  orgId,
  title,
  isDm,
  isChannel = false,
  muted,
  media,
}: ChatRoomInfoProps): ReactElement {
  const [pendingMuted, setPendingMuted] = useState<boolean | null>(null);
  const mute = useMuteRoom(roomId);
  const channels = useChannels(orgId, open && isChannel);
  const channel = (channels.data?.items ?? []).find((i) => i.channel_id === roomId);
  // Preview roster only: the endpoint caps at 50 rows and the full list
  // of a large community lives on /manage/members (search/sort/pages).
  const members = useOrgMembers(orgId, {
    limit: 50,
    status: "active",
  });
  const selfId = useSession().data?.id;
  const openDm = useOpenDm(orgId ?? "");
  const navigate = useNavigate();
  const shownMuted = pendingMuted ?? muted;
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

  function toggleMute(): void {
    const next = !shownMuted;
    setPendingMuted(next);
    mute.mutate(next, {
      onError: () => setPendingMuted(null),
      onSuccess: () => setPendingMuted(null),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={title} side>
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={toggleMute}
          aria-pressed={shownMuted}
          aria-label="Tắt thông báo phòng này"
          className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-left dark:border-zinc-800"
        >
          <span className="flex items-center gap-3">
            {shownMuted ? (
              <FiBellOff className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            ) : (
              <FiBell className="h-5 w-5 text-zinc-500" aria-hidden="true" />
            )}
            <span>
              <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Thông báo
              </span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                {shownMuted
                  ? "Phòng này đang tắt thông báo."
                  : "Bạn đang nhận thông báo từ phòng này."}
              </span>
            </span>
          </span>
          <span
            className={`${MUTE_SWITCH} ${
              shownMuted
                ? "bg-zinc-300 dark:bg-zinc-700"
                : "bg-zinc-900 dark:bg-zinc-100"
            }`}
            aria-hidden="true"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-zinc-950 ${
                shownMuted ? "translate-x-1" : "translate-x-6"
              }`}
            />
          </span>
        </button>
        {isChannel && channel !== undefined && (
          <section>
            <h3 className={SECTION_TITLE}>
              <FiHash className="h-4 w-4" aria-hidden="true" />
              Kênh
            </h3>
            <div className="mt-2 rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
              {channel.topic !== "" && (
                <p className="text-sm text-zinc-800 dark:text-zinc-200">{channel.topic}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{channelMetaLabel(channel)}</p>
            </div>
          </section>
        )}
        {!isDm && (
          <section>
            <h3 className={SECTION_TITLE}>
              <FiUsers className="h-4 w-4" aria-hidden="true" />
              Thành viên
              {members.data !== undefined && ` (${members.data.total})`}
            </h3>
            {/* No inner scroll: the row dropdown must never clip, so the
                Modal panel (90vh) owns overflow instead. */}
            <div className="mt-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
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
                    <Avatar
                      name={item.full_name}
                      src={item.avatar_url}
                      size="sm"
                    />
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
          </section>
        )}
        {media.length > 0 && (
          <section>
            <h3 className={SECTION_TITLE}>
              <FiImage className="h-4 w-4" aria-hidden="true" />
              Ảnh đã chia sẻ ({media.length})
            </h3>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {media.map((item) => (
                <a
                  key={item.media_id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-lg border border-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
