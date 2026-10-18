import { useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
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
import type { SharedMediaKind } from "../api.ts";
import { ChatSenderPicker } from "./ChatSenderPicker.tsx";
import { ChatShareCard } from "./ChatShareCard.tsx";
import { ChatSharedPanel } from "./ChatSharedPanel.tsx";
import { ChatThreadsSection } from "./ChatThreadsSection.tsx";
import { ThreadFormDialog } from "./ThreadFormDialog.tsx";

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
  // General rooms + top channels list their focused sub-threads.
  showThreads?: boolean;
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
  showThreads = false,
  muted,
  canManage,
}: ChatRoomInfoProps): ReactElement {
  const [pendingMuted, setPendingMuted] = useState<boolean | null>(null);
  // Thread compose must be a sibling of this Modal: a portal child of
  // the panel counts as an outside press and self-closes the drawer.
  const [threadFormOpen, setThreadFormOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();
  // Sender filter drill-in: picking swaps the whole drawer for the
  // account list; the filter itself lives here so the picker can set it.
  const [pickingSender, setPickingSender] = useState(false);
  const [authorId, setAuthorId] = useState("");
  // Media kind the picker scopes its sender list to (tab at open time).
  const [pickerKind, setPickerKind] = useState<SharedMediaKind>("image");
  const mute = useMuteRoom(roomId);
  const channels = useChannels(orgId, open && isChannel);
  const channel = (channels.data?.items ?? []).find((i) => i.channel_id === roomId);
  const selfId = useSession().data?.id;
  const shownMuted = pendingMuted ?? muted;

  // Every close path lands back on the info view with the sender filter
  // cleared; room switches reset for free via ChatPanel's key={roomId}.
  function close(): void {
    setPickingSender(false);
    setAuthorId("");
    setPickerKind("image");
    onClose();
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
    <>
    <Modal
      open={open}
      onClose={close}
      title={pickingSender ? "Người gửi" : title}
      side
      onBack={pickingSender ? () => setPickingSender(false) : undefined}
    >
      <div className={pickingSender ? "hidden" : "flex flex-col gap-5"}>
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
        {showThreads && orgId !== null && (
          <ChatThreadsSection
            open={open}
            orgId={orgId}
            roomId={roomId}
            onClose={close}
            onCompose={() => setThreadFormOpen(true)}
          />
        )}
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
              authorId={authorId}
              onPickSender={(kind) => {
                setPickerKind(kind);
                setPickingSender(true);
              }}
              onClose={close}
            />
          </div>
        </section>
      </div>
      {pickingSender && (
        <ChatSenderPicker
          roomId={roomId}
          kind={pickerKind}
          selected={authorId}
          onSelect={(id) => {
            setAuthorId(id);
            setPickingSender(false);
          }}
        />
      )}
    </Modal>
    {showThreads && orgId !== null && (
      <ThreadFormDialog
        open={threadFormOpen}
        onClose={() => setThreadFormOpen(false)}
        orgId={orgId}
        roomId={roomId}
        parentTitle={title}
        onCreated={(threadId) => {
          setThreadFormOpen(false);
          close();
          setSearchParams({ room: threadId });
        }}
      />
    )}
    </>
  );
}
