import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiBell,
  FiBellOff,
  FiFolder,
  FiHash,
  FiShare2,
} from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { Modal } from "../../core/components/Modal.tsx";
import { useChannels } from "../channel-hooks.ts";
import { useMuteRoom } from "../hooks.ts";
import { channelMetaLabel } from "../messages.tsx";
import { ChatShareCard } from "./ChatShareCard.tsx";
import { ChatSharedPanel } from "./ChatSharedPanel.tsx";

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
  // Public slug of the room's org: powers the community share card.
  orgSlug: string;
  orgName: string;
  title: string;
  // Group rooms list the roster; dm rooms skip it (peer is the title).
  isDm: boolean;
  isChannel?: boolean; // channel rooms add a metadata card
  muted: boolean;
  // chat:manage viewers may delete shared items they did not post.
  canManage: boolean;
}

// Telegram room profile modal: mute switch, community share card and the
// indexed tabs (image/video/file/link) plus the members roster tab.
export function ChatRoomInfo({
  open,
  onClose,
  roomId,
  orgId,
  orgSlug,
  orgName,
  title,
  isDm,
  isChannel = false,
  muted,
  canManage,
}: ChatRoomInfoProps): ReactElement {
  const [pendingMuted, setPendingMuted] = useState<boolean | null>(null);
  const mute = useMuteRoom(roomId);
  const channels = useChannels(orgId, open && isChannel);
  const channel = (channels.data?.items ?? []).find((i) => i.channel_id === roomId);
  const selfId = useSession().data?.id;
  const shownMuted = pendingMuted ?? muted;

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

        {!isDm && orgSlug !== "" && (
          <section>
            <h3 className={SECTION_TITLE}>
              <FiShare2 className="h-4 w-4" aria-hidden="true" />
              Chia sẻ cộng đồng
            </h3>
            <div className="mt-2">
              <ChatShareCard orgSlug={orgSlug} orgName={orgName} />
            </div>
          </section>
        )}
        <section>
          <h3 className={SECTION_TITLE}>
            <FiFolder className="h-4 w-4" aria-hidden="true" />
            Nội dung phòng
          </h3>
          <div className="mt-2">
            <ChatSharedPanel
              roomId={roomId}
              open={open}
              selfId={selfId}
              canManage={canManage}
              orgId={orgId}
              isDm={isDm}
              onClose={onClose}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}
